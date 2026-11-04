---
paths:
  - "docs/specs/**"
  - "docs/plans/**"
---

# Spec, Plan 규칙

## Spec (`docs/specs/*.md`)

- 사람이 정한 명세다. AI는 사용자 승인 없이 수정하지 않는다. 모호하면 수정하지 말고 질문으로 정리한다.
- 기능마다 고유 ID(`F-xx`)와 검증 가능한 AC가 있다. 범위 밖과 Open Questions는 해당 기능 파일 안에 있다.
- 새 Spec 포맷이나 도구를 도입하지 않는다.
- 백엔드 API, 데이터 모델, 인증 상세는 Spec 범위 밖이다. 이것들은 Plan에서 정의한다.

## Plan (`docs/plans/<feature>.md`)

- 파일명은 대응하는 Spec 파일명과 같게 한다 (`home.md` → `docs/plans/home.md`).
- 상단 메타에 `Spec`, `F-ID 범위`, `상태(draft|approved)`, `Linear 상위 이슈`를 둔다.
- `approved`로 바꾸는 것은 사람이 한다. `draft` 상태의 Plan으로는 구현을 시작하지 않는다.
- API 계약은 마크다운 표로 쓴다 (MVP). Plan이 계약의 유일한 출처다.
- Task ID는 `T-{F-ID}-{nn}` 형식으로 부여하고 한 번 부여하면 바꾸지 않는다 (Linear 매핑 키).
- Spec이 바뀌어 Plan과 충돌하면 Plan을 고친다. 고치기 전에 변경 내용을 사용자에게 보여준다.
