---
name: meotto-git-committer
description: MEOTTO git diff 분석 후 팀 컨벤션 커밋 메시지(영어 제목 + 한글 body) 생성 및 커밋. Co-Authored-By 절대 금지.
---

# MEOTTO Git Committer

Git 변경점을 분석하여 제목은 영어, body는 한글인 커밋 메시지를 생성하고 커밋을 수행한다.

## 핵심 제약사항

- rebase, reset, push, merge 등 파괴적 명령 실행 금지
- `git add` 시 현재 커밋 작업에 맞는 파일만 선택 — `git add -A` / `git add .` 금지
- 작업 단위가 큰 경우 반드시 분할 커밋 수행
- Co-Authored-By 추가 절대 금지
- `--no-verify` 사용 금지
- `.env`, 시크릿, 자격증명 파일 감지 시 해당 파일 제외하고 사용자 경고
- 코드 변경이 `backend/CLAUDE.md`에 적힌 내용과 어긋나면, `CLAUDE.md`를 현재 상태에 맞게 업데이트하고
  별도의 `docs` 커밋으로 분리해서 수행 (기능 커밋에 섞지 않음)

## 커밋 메시지 구조

```
type: subject

body
```

## Type 종류

| Type | 설명 |
|------|------|
| `feat` | 신규 기능 |
| `fix` | 버그 수정 |
| `docs` | 문서 작업 |
| `style` | 코드 스타일 정리 |
| `refactor` | 리팩토링 |
| `test` | 테스트 코드 |
| `chore` | 빌드, 설정, 의존성 등 기타 작업 |
| `revert` | 이전 커밋 되돌리기 |
| `merge` | 브랜치 병합 |

## Subject 규칙

- 영어, 50자 이내
- 동사 원형으로 시작하는 간결한 명령형 표현 (예: `add`, `fix`, `remove`)
- 마침표/특수문자 금지

## Body 규칙

- 한국어로 작성
- 80자 기준 줄바꿈
- 무엇을/왜 변경했는지 설명
- 파일별 변경사항 bullet 사용 가능

## 워크플로우

1. `git status`로 변경사항 확인
2. `git diff`로 변경 내용 분석
3. 변경사항이 `backend/CLAUDE.md`에 영향을 주는지 확인
   - 도메인 신규 추가/삭제 → "도메인 맵" 표 갱신 (마지막 `(TBD)` 행은 항상 유지)
   - 패키지 구조 변경 → "패키지 구조" 트리 갱신
   - `SecurityConfig`의 인가 규칙 변경 → 관련 설명 문단 갱신
   - 빌드 명령·커밋 컨벤션·테스트 패턴 등 문서화된 규칙 자체가 바뀐 경우 → 해당 섹션 갱신
   - 영향이 있으면 `CLAUDE.md`를 업데이트해두되, 아직 커밋하지 않고 다른 변경사항들을 먼저 커밋
4. 관련 파일들을 논리적 단위로 그룹화 (기능/코드 변경만, CLAUDE.md는 제외)
5. 각 그룹별로:
   - `git add <files>` (해당 작업 관련 파일만)
   - 커밋 메시지 작성
   - `git commit -m "..."` 수행
6. 분할 커밋 필요시 반복
7. `CLAUDE.md` 변경사항이 있으면 마지막에 별도로 `docs: update CLAUDE.md for ...` 커밋 수행
8. 커밋할 내용 없으면 보고 후 종료
