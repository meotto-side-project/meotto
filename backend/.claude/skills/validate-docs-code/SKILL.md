---
name: validate-docs-code
description: 문서(CLAUDE.md, README.md, docs/PRD.md, docs/SPEC.md, .claude/rules.md)와 실제 코드·설정을 비교해 불일치와 규칙 위반을 찾고, 확인 후 한쪽으로 통일
---

# 문서-코드 일치 검사

대상: $ARGUMENTS (없으면 아래 전체 문서)

## 대상 문서

- `CLAUDE.md` — 프로젝트 컨텍스트, 패키지 구조, 커맨드, 도메인 맵
- `README.md` — 기능 소개, 기술 스택
- `docs/PRD.md` — 제품 요구사항, 비즈니스 상수
- `docs/SPEC.md` — 기술 스펙, 기술 스택 버전, 패키지 구조
- `.claude/rules.md` — 작업 규칙 (git 흐름 등)
- `.claude/skills/*/SKILL.md`, `.claude/agents/*.md` — 규칙 위반 여부 자체 점검 대상에도 포함

## Step 1: 문서에서 검증 가능한 주장 추출

각 문서를 읽고 "코드로 확인 가능한 주장"만 추린다 (마케팅 문구 등은 제외).

- 기술 스택 버전 (Java, Spring Boot, Gradle, MySQL, Redis 등)
- 패키지/디렉토리 구조
- 도메인 목록과 역할
- API 엔드포인트, 요청/응답 형태
- 비즈니스 상수 (enum 값 등)
- 작업 규칙 (git 브랜치 전략, 커밋 컨벤션 등)

## Step 2: 코드/설정에서 실제 값 확인

- 버전: `build.gradle`, `gradle/wrapper/gradle-wrapper.properties`, `build.gradle`의 Spring Boot 플러그인 버전
- 패키지 구조: `src/main/java/com/meotto/api/domain/` 실제 트리 (`find`/`ls`)
- 도메인 목록: `domain/` 하위 디렉토리 실제 목록
- API: `*Controller.java`의 `@XxxMapping` 전수 스캔
- 비즈니스 상수: 관련 `enum`/상수 클래스
- 작업 규칙 준수: `.claude/skills/*/SKILL.md`, `.claude/agents/*.md`가 `.claude/rules.md`를 위반하는 절차를 담고 있지 않은지 (예: main 직접 push 등 — 하네스 자체도 검사 대상)

## Step 3: 갭 목록화

문서별로 표 형태로 정리:

```
| 문서 | 문서상 값 | 코드상 실제 값 | 판정 |
```

## Step 4: 사용자 확인 후 통일

갭이 있으면 AskUserQuestion으로 각 건에 대해 확인:
- "문서를 코드에 맞게 수정" vs "코드를 문서에 맞게 수정" vs "둘 다 의도된 것 (무시)"

일괄 처리 금지 — 항목이 여러 개면 그룹핑해서 배치로 확인하되, 의미가 다른 갭을 하나의 질문으로 뭉개지 않는다.

## Step 5: 반영

- 문서 수정: 해당 `.md` 파일만 수정 (코드 변경 없음)
- 코드 수정: 통상적인 코드 변경 절차(`meotto-codegen`/`meotto-fix` 패턴) 따름 — 이 스킬 자체에서 대규모 리팩토링까지 하지 않고, 범위가 크면 사용자에게 별도 작업으로 분리할지 확인

## 사용 시점

- 새 기능 개발 완료 후 (`meotto-codegen` 완료 직후 1회)
- 주기적 점검 (스프린트 종료, 배포 전 등 사용자가 명시적으로 요청할 때)

## 출력 형식

```
## 검사 대상: N개 문서

## 갭 발견: N건
| 문서 | 항목 | 문서 값 | 코드 값 |

## 규칙 위반 발견: N건 (.claude/rules.md 기준)
| 위반 위치 | 위반 내용 |

## 처리 결과
- 문서 수정: N건
- 코드 수정 필요 (별도 작업 분리): N건
- 무시(의도됨): N건
```

갭 없으면: `✅ 문서-코드 일치 확인 완료`
