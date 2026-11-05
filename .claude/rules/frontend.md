---
paths:
  - "frontend/**"
---

# 프론트엔드 공통 규칙

웹과 모바일에 모두 적용되는 규칙이다. 플랫폼별 규칙은 `frontend-web.md`, `frontend-mobile.md`.

## 플랫폼 역할

| 앱 | 역할 |
|---|---|
| `apps/mobile` (Expo) | 네이티브 UI. 회원 흐름 전체(온보딩, 로그인, 홈, 도장 보내기, 칭찬판, 친구, 마이페이지, 푸시) |
| `apps/web` (Next) | 공유된 콘텐츠를 SEO와 소셜 미디어 미리보기에 맞게 제공하는 공개 페이지(공유 링크로 들어오는 칭찬판, 비회원 토마토 보내기, 뱃지 공유 등) |

Plan Task의 영역은 `FE-web`, `FE-mobile`, `BE` 중 하나로 쓴다. 한 Task에서 두 앱을 함께 고치지 않는다.

## 코드

- `src/**`는 TypeScript만 (`.ts`, `.tsx`). `.js`, `.jsx`, `.mts` 금지.
- `any` 금지. `console.log`는 머지 전 제거.
- 배럴 파일(`index.ts`)을 통한 import 금지. 직접 경로를 쓴다.
- 색상, 간격, 타이포는 디자인 토큰만 쓴다 (임의 값 금지). 기준은 `docs/specs/design-system.md`.
- 포맷은 Prettier(`frontend/.prettierrc`): 세미콜론, 큰따옴표, trailing comma, 80자. import 정렬은 `simple-import-sort` 린트 규칙을 따른다.
- 주석은 필요한 경우에만 쓴다. 코드만으로 드러나지 않는 이유(우회 사유, 제약, 비직관적 선택)를 설명할 때만 허용하고, 코드가 하는 일을 반복하는 주석과 주석 처리된 코드는 금지한다. (백엔드는 주석 전면 금지)
- 데이터는 TanStack Query + Zod 응답 검증. 쿼리 키와 엔드포인트는 `constants/`에 두고 하드코딩하지 않는다.

## 공유 코드

- 두 앱이 같은 API를 쓰면 응답 Zod 스키마, 엔드포인트 상수, 타입은 `frontend/packages/shared`에 둔다 (`pnpm-workspace.yaml`의 `packages/*`).
- 패키지를 처음 만들 때와 의존성을 추가할 때는 사용자 승인을 받는다.
- 스키마의 출처는 Plan의 API 계약 표다. 계약에 없는 필드를 만들지 않는다.

## 검증

코드 변경 후 `frontend/`에서 `pnpm lint`, `pnpm check-types`를 통과해야 한다. 빌드가 영향을 받으면 `pnpm build`도 실행한다. 컴포넌트 테스트와 E2E 도구는 현재 설치되어 있지 않으므로 해당 검증은 "미검증"으로 보고한다.

## 버전 주의

Next 16과 Expo 58은 기억과 다를 수 있다. API를 쓰기 전에 각 앱의 `AGENTS.md`가 안내하는 문서(`node_modules/next/dist/docs/`, Expo 버전별 문서)를 확인한다.
