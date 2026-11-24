import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { basename } from "node:path";

const TEAM_ID = "47bb40f1-9cf4-4a2f-93ec-7c3b184e9c78";
const TEAM_KEY = "MEO";

const beforeSha = requireEnv("BEFORE_SHA");
const afterSha = requireEnv("AFTER_SHA");
const commitMessage = requireEnv("COMMIT_MESSAGE");
const repo = requireEnv("GITHUB_REPOSITORY");
const linearToken = requireEnv("LINEAR_API_TOKEN");
const discordWebhookUrl = requireEnv("PLAN_DIFF_DISCORD_WEBHOOK_URL");
const mentionUserId = requireEnv("CONTRACT_MENTION_DISCORD_USER_ID");

function requireEnv(name) {
	const value = process.env[name];
	if (!value) {
		throw new Error(`환경변수 ${name}가 없습니다`);
	}
	return value;
}

function git(args) {
	return execFileSync("git", args, { encoding: "utf-8", maxBuffer: 1024 * 1024 * 20 });
}

function extractPrNumber(message) {
	const match = message.match(/\(#(\d+)\)\s*$/m);
	return match ? match[1] : null;
}

function changedPlanFiles() {
	const output = git(["diff", "--name-only", `${beforeSha}..${afterSha}`, "--", "docs/plans"]);
	return output.split("\n").map((line) => line.trim()).filter((line) => line.endsWith(".md"));
}

function diffForFile(path) {
	return git(["diff", `${beforeSha}..${afterSha}`, "--", path]);
}

function parseTableRowLine(line) {
	if (!line.startsWith("+") && !line.startsWith("-")) {
		return null;
	}
	const sign = line[0];
	const rowText = line.slice(1).trim();
	if (!rowText.startsWith("|") || !rowText.endsWith("|")) {
		return null;
	}

	const cells = rowText.split("|").map((cell) => cell.trim());
	const contractId = cells[1];
	const status = cells[cells.length - 2];
	const fid = cells[cells.length - 3];
	if (!contractId || !/^C-\d+$/.test(contractId) || status === undefined) {
		return null;
	}
	return { sign, contractId, status, fid, rowText, cells };
}

function extractEndpoint(cells) {
	return {
		method: cells[2] ?? "",
		path: cells[3] ?? "",
		request: cells[5] ?? "",
		response: cells[6] ?? "",
	};
}

function findConfirmedTransitions(diffText) {
	const removedPending = new Map();
	const addedConfirmed = new Map();

	for (const line of diffText.split("\n")) {
		const row = parseTableRowLine(line);
		if (!row) {
			continue;
		}

		if (row.sign === "-" && row.status.startsWith("보류")) {
			removedPending.set(row.contractId, row);
		}
		if (row.sign === "+" && row.status.startsWith("확정")) {
			addedConfirmed.set(row.contractId, row);
		}
	}

	const transitions = [];
	for (const [contractId, newRow] of addedConfirmed) {
		const oldRow = removedPending.get(contractId);
		if (oldRow) {
			transitions.push({ contractId, oldRow, newRow });
		}
	}
	return transitions;
}

function truncate(text, maxLength) {
	if (!text) {
		return text;
	}
	return text.length > maxLength ? `${text.slice(0, maxLength - 1)}…` : text;
}

function cleanStatusText(status) {
	let text = status.replace(/^(보류\s*:|확정)\s*/, "").trim();
	if (text.startsWith("(") && text.endsWith(")")) {
		text = text.slice(1, -1).trim();
	}
	return text;
}

function planNameFromPath(filePath) {
	return basename(filePath, ".md");
}

function extractFeParentIssue(fileContent) {
	const match = fileContent.match(/Linear 상위 이슈:.*?FE\s+(MEO-\d+)/);
	return match ? match[1] : null;
}

async function linearGraphQl(query, variables) {
	const response = await fetch("https://api.linear.app/graphql", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: linearToken,
		},
		body: JSON.stringify({ query, variables }),
	});
	const json = await response.json();
	if (json.errors) {
		throw new Error(`Linear API 오류: ${JSON.stringify(json.errors)}`);
	}
	return json.data;
}

async function findIssueUuidByIdentifier(identifier) {
	const number = Number(identifier.split("-")[1]);
	const data = await linearGraphQl(
		`query($number: Float!, $teamKey: String!) {
			issues(filter: { number: { eq: $number }, team: { key: { eq: $teamKey } } }) {
				nodes { id identifier }
			}
		}`,
		{ number, teamKey: TEAM_KEY },
	);
	return data.issues.nodes[0]?.id ?? null;
}

async function findExistingContractIssue(contractId) {
	const data = await linearGraphQl(
		`query($titleFragment: String!, $teamId: ID!) {
			issues(filter: { title: { contains: $titleFragment }, team: { id: { eq: $teamId } } }) {
				nodes { id identifier title url }
			}
		}`,
		{ titleFragment: `[${contractId} 확정]`, teamId: TEAM_ID },
	);
	return data.issues.nodes[0] ?? null;
}

function contractDetailLines({ filePath, prUrl, oldStatus, newStatus, method, path, request, response }) {
	return [
		`- 변경 파일: \`${filePath}\``,
		`- 관련 BE PR: ${prUrl}`,
		`- 보류사항: ${oldStatus}`,
		`- 확정사항: ${newStatus}`,
		`  - 엔드포인트: \`${method} ${path}\``,
		`  - Request: ${request}`,
		`  - Response: ${response}`,
	].join("\n");
}

async function addContractUpdateComment({ issueId, contractId, fid, ...detail }) {
	const body = `⚠️ ${contractId}(${fid})가 다시 변경됐습니다.\n\n${contractDetailLines(detail)}`;

	await linearGraphQl(
		`mutation($input: CommentCreateInput!) {
			commentCreate(input: $input) {
				success
			}
		}`,
		{ input: { issueId, body } },
	);
}

async function createContractIssue({ contractId, fid, parentUuid, ...detail }) {
	const data = await linearGraphQl(
		`mutation($input: IssueCreateInput!) {
			issueCreate(input: $input) {
				success
				issue { id identifier url }
			}
		}`,
		{
			input: {
				teamId: TEAM_ID,
				parentId: parentUuid ?? undefined,
				title: truncate(`[${contractId} 확정] ${fid} — FE 반영 필요`, 200),
				description:
					`백엔드 작업 중 ${contractId}(${fid})가 아래처럼 확정됐습니다. 참고해서 프로젝트를 업데이트해주세요.\n\n` +
					contractDetailLines(detail),
			},
		},
	);
	return data.issueCreate.issue;
}

async function postToDiscord(payload) {
	const response = await fetch(discordWebhookUrl, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(payload),
	});
	if (!response.ok) {
		throw new Error(`Discord 웹훅 전송 실패: ${response.status} ${await response.text()}`);
	}
}

const COLOR_BLUE = 3447003;
const COLOR_WARNING = 16776960;
const MAX_DETAIL_PER_SECTION = 3;
const SPACER_FIELD = { name: "​", value: "​", inline: false };

function formattedNow() {
	return new Date().toISOString().replace("T", " ").slice(0, 19);
}

function confirmedDetailField(entry, index) {
	const lines = [
		`**파일**: \`${entry.filePath}\``,
		"",
		`**보류사항**:`,
		entry.oldStatus,
		"",
		`**확정사항**:`,
		entry.newStatus,
		"",
		`⠀⠀- 엔드포인트: \`${entry.method} ${entry.path}\``,
		"",
		`⠀⠀- Request: ${entry.request}`,
		"",
		`⠀⠀- Response: ${entry.response}`,
		"",
		entry.updatedExisting ? `📌 FE 이슈 (변경사항 댓글로 추가됨): ${entry.issueUrl}` : `📌 FE 이슈 생성됨: ${entry.issueUrl}`,
	];
	if (!entry.feParentIssue) {
		lines.push("⚠️ FE 상위 이슈를 찾지 못해 parentId 없이 생성됨");
	}
	return {
		name: `${index}. ${planNameFromPath(entry.filePath)} | ${entry.contractId} (${entry.fid})`,
		value: lines.join("\n"),
		inline: false,
	};
}

function buildConfirmedPayload(entries, prUrl) {
	const fields = [
		{ name: `✅ 계약 ${entries.length}건이 확정되었습니다!`, value: "​", inline: false },
	];

	const toShow = entries.slice(0, MAX_DETAIL_PER_SECTION);
	toShow.forEach((entry, i) => {
		if (i > 0) {
			fields.push(SPACER_FIELD);
		}
		fields.push(confirmedDetailField(entry, i + 1));
	});

	if (entries.length > MAX_DETAIL_PER_SECTION) {
		fields.push({ name: `외 ${entries.length - MAX_DETAIL_PER_SECTION}건`, value: "​", inline: false });
	}

	return {
		embeds: [
			{
				title: "🔔 보류 계약 확정 알림 🔔",
				color: COLOR_BLUE,
				fields,
				footer: { text: `MEOTTO Plan · ${formattedNow()}` },
			},
		],
	};
}

function buildFallbackPayload(unparsedFiles, prUrl) {
	return {
		content: `<@${mentionUserId}> 변경된 Plan 파일에서 보류→확정 전환을 자동으로 찾지 못했어요. PR을 확인해주세요.`,
		embeds: [
			{
				title: "⚠️ 보류→확정 전환 자동 감지 실패",
				color: COLOR_WARNING,
				fields: [
					{
						name: "변경된 Plan 파일",
						value: unparsedFiles.map((f) => `- \`${f}\``).join("\n"),
						inline: false,
					},
				],
				footer: { text: `관련 BE PR: ${prUrl}` },
			},
		],
	};
}

async function main() {
	const prNumber = extractPrNumber(commitMessage);
	const prUrl = prNumber ? `https://github.com/${repo}/pull/${prNumber}` : `https://github.com/${repo}/commit/${afterSha}`;

	const planFiles = changedPlanFiles();
	if (planFiles.length === 0) {
		console.log("docs/plans/** 변경 없음, 종료");
		return;
	}

	const confirmedEntries = [];
	const unparsedFiles = [];

	for (const filePath of planFiles) {
		const diffText = diffForFile(filePath);
		const transitions = findConfirmedTransitions(diffText);

		if (transitions.length === 0) {
			unparsedFiles.push(filePath);
			continue;
		}

		const fileContent = readFileSync(filePath, "utf-8");
		const feParentIssue = extractFeParentIssue(fileContent);
		const parentUuid = feParentIssue ? await findIssueUuidByIdentifier(feParentIssue) : null;

		for (const transition of transitions) {
			const fid = transition.newRow.fid || transition.oldRow.fid || "F-ID 불명";
			const oldStatus = truncate(cleanStatusText(transition.oldRow.status), 200);
			const newStatus = truncate(cleanStatusText(transition.newRow.status), 200);
			const endpoint = extractEndpoint(transition.newRow.cells);
			const method = truncate(endpoint.method, 20);
			const path = truncate(endpoint.path, 200);
			const request = truncate(endpoint.request, 200);
			const response = truncate(endpoint.response, 200);
			const existing = await findExistingContractIssue(transition.contractId);

			let issueUrl = existing?.url ?? null;
			const updatedExisting = Boolean(existing);

			if (existing) {
				await addContractUpdateComment({
					issueId: existing.id,
					contractId: transition.contractId,
					fid,
					oldStatus,
					newStatus,
					method,
					path,
					request,
					response,
					filePath,
					prUrl,
				});
			} else {
				const created = await createContractIssue({
					contractId: transition.contractId,
					fid,
					oldStatus,
					newStatus,
					method,
					path,
					request,
					response,
					parentUuid,
					prUrl,
					filePath,
				});
				issueUrl = created.url;
			}

			confirmedEntries.push({
				contractId: transition.contractId,
				fid,
				filePath,
				oldStatus,
				newStatus,
				method,
				path,
				request,
				response,
				issueUrl,
				updatedExisting,
				feParentIssue,
			});
		}
	}

	if (confirmedEntries.length > 0) {
		await postToDiscord(buildConfirmedPayload(confirmedEntries, prUrl));
	}

	if (unparsedFiles.length > 0) {
		await postToDiscord(buildFallbackPayload(unparsedFiles, prUrl));
	}
}

main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
