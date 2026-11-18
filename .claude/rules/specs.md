---
paths:
  - "docs/specs/**"
  - "docs/plans/**"
---

# Spec, Plan 규칙

## Spec (`docs/specs/*.md`)

- 명세의 기준 문서다. 구현 중 결정이 달라지거나 사용자가 질문에 답하면 AI가 해당 Spec 파일을 직접 수정하고, 수정한 파일과 내용을 결과 보고에 적는다. 사용자가 정하지 않은 모호한 점을 AI가 임의로 정해서 채우지는 않고 질문으로 정리한다.
- 기능마다 고유 ID(`F-xx`)와 검증 가능한 AC가 있다. 범위 밖과 Open Questions는 해당 기능 파일 안에 있다.
- 미확정 항목은 `[논의 필요]` 또는 `(확인 필요)`로 표시되어 있다. 이 표시가 붙은 내용은 임의로 정하거나 가정해서 구현하지 않고 사용자에게 확인한다. 표시가 붙은 항목에 의존하는 Task는 확정되기 전까지 구현하지 않는다.
- 새 Spec 포맷이나 도구를 도입하지 않는다.
- 백엔드 API, 데이터 모델, 인증 상세는 Spec 범위 밖이다. 이것들은 Plan에서 정의한다.

## Plan (`docs/plans/<feature>.md`)

- 파일명은 대응하는 Spec 파일명과 같게 한다 (`home.md` → `docs/plans/home.md`).
- 상단 메타에 `Spec`, `F-ID 범위`, `상태(draft|approved)`, `Linear 상위 이슈`를 둔다.
- `approved`로 바꾸는 것은 사람이 한다. `draft` 상태의 Plan으로는 구현을 시작하지 않는다.
- 다른 기능에 의존하면 상단 메타의 `선행 Plan`과 "선행 Plan과 가정" 표에 하드/소프트로 기록한다. 하드 의존이 미구현인 상태로 구현을 시작하지 않는다.
- `docs/plans/README.md`는 Plan 인덱스다 (상태, 선행 Plan, 권장 구현 순서). Plan을 만들거나 상태가 바뀔 때 갱신한다.
- API 계약은 마크다운 표로 쓴다 (MVP). Plan은 **구현 전 초안**의 출처이고, BE 구현이 운영 서버에 올라가면 Swagger가 기준이 된다 (아래 "API 계약 참조 순서").
- Task ID는 `T-{F-ID}-{nn}` 형식으로 부여하고 한 번 부여하면 바꾸지 않는다 (Linear 매핑 키). `nn`: `00` 공통 준비, `01`~`89` 일반, `98` MSW 구성(저장소에서 한 번), `99` 실서버 연동 확인. `00`, `98`, `99`는 Plan의 첫 F-ID 기준이다.
- API 계약 표의 `상태`는 `확정` 또는 `보류: <질문>`이다. Plan 승인은 `확정` 행만 승인한다. 보류 행에 의존하는 Task는 확정되기 전까지 구현하지 않는다.
- Spec이 바뀌어 Plan과 충돌하면 Plan을 고친다. 고치기 전에 변경 내용을 사용자에게 보여준다.

## API 계약 참조 순서 (Swagger-first)

`plan-feature`, `implement-feature`, `verify-feature`, `code-review`, `spec-verifier`는 모두 이 순서를 따른다.

1. **Swagger를 먼저 조회한다.** `METHOD + path`로 operation을 찾는다.
   - URL: `https://api.meotto.io.kr/v3/api-docs` (인증 불필요, `main` 머지분만 반영)
   - 조회: `spec=$(curl -sSf --max-time 10 https://api.meotto.io.kr/v3/api-docs) && echo "$spec" | jq -e '.paths | type == "object"' >/dev/null && echo "$spec" | jq '.paths["<path>"]["<method>"]'` (`<method>`는 소문자: `get`, `post` 등)
   - `curl`이 실패하거나(HTTP 4xx/5xx, 타임아웃) `.paths` 검사가 실패하면(JSON 파싱 실패, 에러 응답) 조회 실패다 → 4번으로 처리한다. 두 검사를 통과한 뒤 결과가 `null`일 때만(path가 없거나, path는 있어도 해당 method가 없음) "Swagger에 없음"(3번)이다.
   - 머지 전 BE PR의 엔드포인트는 Swagger에 없는 것이 정상이다 (아래 3번 경로).
2. **Swagger에 있으면 Swagger가 기준이다.** Plan의 계약 표와 다르면 계약 변경이므로 **승인 대상**이다 (`CLAUDE.md` 안전 규칙 1). 승인 전까지 구현·검증을 완료로 쓰지 않는다. 승인 후에는 Plan의 해당 계약 행을 Swagger와 일치하게 고친다.
3. **Swagger에 없으면 Plan 표가 기준이다.** 해당 행의 상태가 `보류`면 구현하지 않고 질문한다. `확정`이면 그 표에 맞춰 진행한다.
4. **Swagger 접근에 실패하면** (타임아웃, 네트워크 오류 등) Plan 표로 대체하고 리포트에 `Swagger 미확인(이유)`을 명시한다. **통과로 처리하지 않는다.**

Swagger에는 엔드포인트 시그니처만 있다. BE 내부 구현(DTO 매핑, ErrorCode, 소유자 검증)은 Swagger로 확인할 수 없으므로 `spec-verifier` 5단계의 Controller·DTO·ErrorCode 코드 대조는 그대로 수행한다.
