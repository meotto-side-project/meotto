import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const TEAM_ID = "47bb40f1-9cf4-4a2f-93ec-7c3b184e9c78";
const TEAM_KEY = "MEO";

const beforeSha = requireEnv("BEFORE_SHA");
const afterSha = requireEnv("AFTER_SHA");
const commitMessage = requireEnv("COMMIT_MESSAGE");
const repo = requireEnv("GITHUB_REPOSITORY");
const linearToken = requireEnv("LINEAR_API_TOKEN");
const discordWebhookUrl = requireEnv("CONTRACT_DISCORD_WEBHOOK_URL");
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
	if (!contractId || !/^C-\d+$/.test(contractId) || status === undefined) {
		return null;
	}
	return { sign, contractId, status, rowText };
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
			removedPending.set(row.contractId, row.rowText);
		}
		if (row.sign === "+" && row.status.startsWith("확정")) {
			addedConfirmed.set(row.contractId, row.rowText);
		}
	}

	const transitions = [];
	for (const [contractId, newRow] of addedConfirmed) {
		if (removedPending.has(contractId)) {
			transitions.push({ contractId, oldRow: removedPending.get(contractId), newRow });
		}
	}
	return transitions;
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

async function createContractIssue({ contractId, summary, parentUuid, prUrl, filePath }) {
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
				title: `[${contractId} 확정] ${summary} — FE 반영 필요`,
				description:
					`백엔드 작업 중 ${contractId}가 아래처럼 확정됐습니다. 참고해서 프로젝트를 업데이트해주세요.\n\n` +
					`- 변경 파일: \`${filePath}\`\n` +
					`- 관련 PR: ${prUrl}\n` +
					`- 계약: ${summary}`,
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

function summarizeRow(rowText) {
	const cells = rowText.split("|").map((cell) => cell.trim()).filter((cell) => cell.length > 0);
	const [, method, path] = cells;
	return `${method} ${path}`;
}

async function main() {
	const prNumber = extractPrNumber(commitMessage);
	const prUrl = prNumber ? `https://github.com/${repo}/pull/${prNumber}` : `https://github.com/${repo}/commit/${afterSha}`;

	const planFiles = changedPlanFiles();
	if (planFiles.length === 0) {
		console.log("docs/plans/** 변경 없음, 종료");
		return;
	}

	const confirmedFields = [];
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
			const summary = summarizeRow(transition.newRow);
			const existing = await findExistingContractIssue(transition.contractId);

			let issueUrl = existing?.url ?? null;
			let skipped = Boolean(existing);

			if (!existing) {
				const created = await createContractIssue({
					contractId: transition.contractId,
					summary,
					parentUuid,
					prUrl,
					filePath,
				});
				issueUrl = created.url;
			}

			confirmedFields.push({
				name: `✅ ${transition.contractId} 확정 (${filePath})`,
				value: `${summary}\n${skipped ? `이미 존재하는 이슈: ${issueUrl}` : `FE 이슈 생성: ${issueUrl}`}${feParentIssue ? "" : "\n⚠️ FE 상위 이슈를 찾지 못해 parentId 없이 생성됨"}`,
				inline: false,
			});
		}
	}

	if (confirmedFields.length > 0) {
		await postToDiscord({
			embeds: [
				{
					title: "🔔 보류 계약 확정 알림 🔔",
					color: 3447003,
					fields: confirmedFields,
					footer: { text: `PR: ${prUrl}` },
				},
			],
		});
	}

	if (unparsedFiles.length > 0) {
		await postToDiscord({
			content: `<@${mentionUserId}> 다음 Plan 파일이 변경됐는데 보류→확정 전환을 자동으로 찾지 못했어요. PR을 확인해주세요: ${prUrl}\n${unparsedFiles.map((f) => `- \`${f}\``).join("\n")}`,
		});
	}
}

main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
