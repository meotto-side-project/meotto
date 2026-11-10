---
name: sync-docs
description: CLAUDE.md, README, .claude 규칙/스킬/에이전트 목록, docs/specs 인덱스가 실제 코드·설정과 일치하는지 비교해 불일치를 찾고, 확인 후 한쪽으로 통일한다.
disable-model-invocation: true
argument-hint: "[대상 문서, 없으면 아래 전체]"
---

# 문서-코드 일치 검사

대상: $ARGUMENTS (없으면 아래 전체)

## 대상 문서

- `CLAUDE.md`, `backend/CLAUDE.md`, `frontend/apps/*/AGENTS.md`, `README.md`
- `.claude/rules/*.md`, `.claude/skills/*/SKILL.md`, `.claude/agents/*.md`
- `docs/specs/README.md` (목차와 F-ID 범위), `docs/plans/*.md` (Task와 코드의 대응)

Spec 본문(`docs/specs/*.md`)의 내용은 사람이 정한 것이므로 코드에 맞춰 고치지 않는다. 불일치는 보고만 한다.

## Step 1: 검증 가능한 주장 추출

코드로 확인 가능한 것만 뽑는다 (마케팅 문구 제외).

- 기술 스택 버전 (Java, Spring Boot, Gradle, Node, Next, Expo)
- 디렉터리와 패키지 구조, 도메인 목록
- 검증 명령 (`package.json` scripts, `build.gradle`, CI 워크플로)
- API 엔드포인트 (Controller)와 Plan의 API 계약 표
- 작업 규칙 (브랜치, 커밋, `commitlint.config.mjs`, `.githooks`)
- `CLAUDE.md`와 규칙 파일이 가리키는 스킬/에이전트 이름이 실제로 존재하는지

## Step 2: 실제 값 확인

- 버전: `backend/build.gradle`, `gradle/wrapper/gradle-wrapper.properties`, `frontend/package.json`, 각 앱 `package.json`
- 구조: `find`/`ls`로 실제 트리
- API: `*Controller.java`의 `@XxxMapping` 스캔
- 스킬/에이전트: `.claude/skills/*/SKILL.md`, `.claude/agents/*.md`의 실제 name, 그리고 서로 참조하는 이름(예: `/git-commit`, `spec-verifier`)이 존재하는지
- 규칙 준수: 스킬과 에이전트가 `.claude/rules/git.md`를 위반하는 절차(main 직접 push 등)를 담고 있지 않은지

## Step 3: 갭 목록

```text
| 문서 | 항목 | 문서 값 | 실제 값 | 판정 |
```

## Step 4: 확인 후 통일

갭이 있으면 AskUserQuestion으로 건마다 "문서를 코드에 맞게 수정" / "코드를 문서에 맞게 수정" / "의도된 것(무시)"을 묻는다. 의미가 다른 갭을 하나의 질문으로 뭉개지 않는다. 일괄 처리하지 않는다.

## Step 5: 반영

- 문서 수정: 해당 `.md`만 수정한다. 수정 전에 변경 내용을 보여 준다.
- 코드 수정이 필요한 갭은 이 Skill에서 하지 않고 별도 작업으로 분리해 제안한다.

## 출력

```text
## 검사 대상: N개 문서
## 갭: N건
| 문서 | 항목 | 문서 값 | 실제 값 |
## 규칙 위반: N건
## 처리 결과: 문서 수정 N / 코드 수정 필요(별도) N / 무시 N
```

갭이 없으면 `✅ 문서-코드 일치 확인 완료`와 검사한 범위를 적는다.
