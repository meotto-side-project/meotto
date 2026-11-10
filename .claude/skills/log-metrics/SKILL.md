---
name: log-metrics
description: PR 하나의 개발 시간, 수정량, AC 충족, 스킬 유지보수 비용을 수집해 docs/metrics/sdd-pilot.md에 한 줄로 기록한다. 하네스로 만든 PR과 수동으로 만든 PR을 같은 방식으로 비교하기 위한 측정 기록용이다.
disable-model-invocation: true
argument-hint: "<PR 번호 또는 Linear ID> <manual|harness>"
---

# SDD 도입 효과 측정 기록

대상: $ARGUMENTS

`docs/metrics/sdd-pilot.md`에 PR당 한 줄을 추가한다. 표본이 적어 결과는 통계가 아니라 방향성 참고용이다. 기능마다 난이도가 다르므로 비교는 AC당 값으로 한다.

## 원칙

- 수집하지 못한 값은 `-`로 둔다. **추정하거나 지어내지 않는다.** 자가 입력 항목은 사용자에게 묻는다.
- 기록 파일을 수정하기 전에 추가할 줄을 보여 주고 승인받는다.
- 코드를 수정하지 않는다. 체크아웃, 브랜치 변경, 병합 등 Git 상태를 바꾸는 명령을 쓰지 않는다 (`git fetch origin pull/<n>/head`로 PR 커밋만 가져오는 것은 허용).

## 1. 대상 식별

1. 두 번째 인자가 `manual` 또는 `harness`인지 확인한다. 없으면 묻는다.
2. PR 번호면 `gh pr view <n> --json number,title,url,headRefName,baseRefName,body,createdAt,mergedAt,additions,deletions,commits,reviews`로 정보를 얻는다. Linear ID(`MEO-xx`)면 PR 본문이나 브랜치명에서 찾거나 `gh pr list --state all --search <ID>`로 찾는다 (머지된 PR 포함). 찾지 못하면 PR 없이 Linear 정보만 기록하고 비고에 적는다.
3. 이미 같은 PR의 행이 `docs/metrics/sdd-pilot.md`에 있으면 새 행을 만들지 않고 **보강 모드**로 진행한다 (변경할 칸을 보여 주고 승인받는다). 머지 후 일정 기간이 지나 누락 AC 칸을 채울 때 쓴다.

## 2. 자동 수집

### 시간
- Linear: `get_issue`(없으면 `list_issues`의 `fields: ["startedAt","completedAt","labels","parentId"]`)로 이슈의 시작·완료 시각. ToolSearch로 스키마를 먼저 불러온다. Linear MCP가 없으면 `-`.
- GitHub: PR 생성 시각 → 머지 시각 (리뷰 대기 시간 포함이므로 활동 시간과 구분한다).

### 변경량
- PR 추가·삭제 줄 수, 커밋 수 (`gh pr view` 결과).

### 수정량 (두 가지를 모두 계산한다)
머지된 PR의 커밋이 로컬에 없으면 `git fetch origin pull/<n>/head`로 가져온다.

1. **리뷰 후 수정률** (수동과 하네스 공통 비교값): 첫 리뷰 제출 시각 이후 커밋들의 추가+삭제 줄 합 ÷ PR 전체 추가+삭제 줄. 리뷰가 없으면 `-`.
2. **초안 대비 수정률** (하네스만): PR의 커밋 목록(`gh pr view <n> --json commits`)에서 메시지에 `AI 초안`이 있는 커밋을 찾는다 (병합 후에는 `<base>..<head>`가 비므로 기준 브랜치와 비교하지 않는다). 초안 커밋들의 추가 줄 합을 분모로 하고, 마지막 초안 커밋 이후 같은 파일들의 변경 줄(`git diff --numstat <마지막 초안 SHA> <head> -- <초안 파일들>`)을 분자로 한다. 초안 커밋이 없으면 `-`로 두고 비고에 "초안 커밋 식별 불가"라고 적는다.

### 스킬 유지보수 비용
Linear 시작 시각(없으면 PR 생성 시각 7일 전)부터 머지 시각까지 `git fetch origin <base>` 후 `git log origin/<base> --since=<시작> --until=<끝> --numstat -- .claude CLAUDE.md`(현재 브랜치가 아니라 최신 기준 브랜치)의 커밋 수와 변경 줄 수. 이 기간의 변경이 해당 Task를 위한 것인지 사용자에게 확인한다 (무관한 변경이 섞였으면 제외하는 항목을 묻는다).

### AC 충족 (선택)
`harness`든 `manual`이든 같은 기준으로 채점한다. 해당 PR의 브랜치가 **이미 체크아웃된 상태**이고 `HEAD`가 PR head SHA(`gh pr view <n> --json headRefOid`)와 같고 작업 트리에 변경이 없을 때만(PR 밖의 내용을 채점하지 않기 위해), 사용자 동의를 받고 `spec-verifier`를 Agent로 호출한다 (Plan 경로, Spec 경로, F-ID, 기준 브랜치 전달). 체크아웃되어 있지 않으면 채점하지 않고 `-`로 두고 "체크아웃 후 보강 모드로 채점"이라고 안내한다. Plan이 없는 수동 PR은 Spec의 AC만 기준으로 하도록 프롬프트에 명시한다.

### 누락 후속 (보강 모드)
머지 후 같은 기능에서 생긴 `Bug` 라벨 이슈 수와, 리뷰 코멘트 중 "AC 누락"으로 분류되는 건수는 머지 직후에는 알 수 없다. 보강 모드에서 Linear(`list_issues`, 상위 이슈 또는 같은 F-ID 키워드)와 리뷰 코멘트(`gh api --paginate repos/{owner}/{repo}/pulls/<n>/comments`)를 읽어 사용자에게 분류를 확인받고 채운다.

## 3. 자가 입력 (사용자에게 묻는다)

한 번에 묻는다. 모르면 `-`로 둔다.
- 실제 작업 시간(시간 단위, 대기 시간 제외)
- 토큰/비용 (`/cost` 값, 하네스일 때). 세션이 여러 개면 합산해서
- 스킬 보수에 쓴 시간(분), 하네스일 때
- 비고 (특이사항, 중간에 막힌 점, 하네스 실패로 직접 고친 부분)

## 4. 기록

`docs/metrics/sdd-pilot.md` 표 맨 아래에 한 줄을 추가한다. 열 정의는 그 파일을 따른다. 추가 전에 줄을 보여 주고 승인받는다.

다음을 함께 요약해 보여 준다.
- AC당 작업 시간(작업 시간 ÷ AC 수), AC당 PR 변경 줄 수
- 같은 `방식`의 기존 행이 있으면 평균과 비교 (n이 3 미만이면 "표본 부족"이라고 명시)

## 하지 않는 것

- 측정값을 근거로 하네스가 더 낫다/나쁘다고 단정하지 않는다. 표본 수와 교란 요인(기능 난이도, 작업자 숙련도)을 함께 적는다.
- 기록 파일 외 문서를 수정하지 않는다.
