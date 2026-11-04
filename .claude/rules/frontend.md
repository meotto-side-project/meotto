---
paths:
  - "frontend/**"
---

# 프론트엔드 규칙

TIMO 프론트엔드 관례를 따른다. Meotto FE에는 아직 이 구조가 구현되어 있지 않으므로, 첫 기능 구현 시 아래 관례로 만들고 달라지는 점은 이 문서를 갱신한다.

## 코드

- `src/**`는 TypeScript만 (`.ts`, `.tsx`). `.js`, `.jsx`, `.mts` 금지.
- `any` 금지. `console.log`는 머지 전 제거.
- 배럴 파일(`index.ts`)을 통한 import 금지. 직접 경로를 쓴다.
- 색상, 간격은 디자인 토큰만 쓴다 (임의 값 금지). 기준은 `docs/specs/design-system.md`.
- 포맷은 Prettier(`frontend/.prettierrc`): 세미콜론, 큰따옴표, trailing comma, 80자.

## 구조 (apps/web 기준, TIMO 관례)

- 별칭 `@/*` → 앱 루트. 소스는 `@/src/...`.
- `src/components/ui/[Name]/[Name].tsx`: 범용 컴포넌트. `features`를 참조하지 않는다.
- `src/components/features/[feature]/`: 기능 전용. 하위에 `constants/url.ts`, `constants/queryKeys.ts`, `queries/`.
- import 방향은 상위 → 하위만: `ui`는 `features`를 못 가리키고, feature끼리 직접 import하지 않으며, `lib`는 컴포넌트를 가리키지 않는다.
- 데이터는 TanStack Query + Zod 응답 검증, HTTP는 `src/lib/api`의 `get/post/patch/del` 래퍼만 쓴다 (axios 직접 호출 금지).
- `apps/mobile`(Expo)은 `AGENTS.md`의 Expo Router 규칙을 따르며 위 웹 구조는 적용하지 않는다. 모바일 UI 관례는 첫 기능에서 정한다.

## 테스트

- 컴포넌트: Storybook + Vitest (스토리 `play` 함수). 스킬: `create-test`.
- E2E: Playwright, 핵심 여정만. 스킬: `create-e2e`.
- 두 도구 모두 현재 미설치. 설치는 별도 승인 작업이다.

## 검증

코드 변경 후 `frontend/`에서 `pnpm lint`, `pnpm check-types`를 통과해야 한다. 빌드가 영향을 받으면 `pnpm build`도 실행한다.

## Next, Expo 주의

두 앱의 `AGENTS.md`가 지적하듯 Next 16, Expo 58은 기억과 다를 수 있다. API를 쓰기 전에 `node_modules/next/dist/docs/` 또는 해당 버전 문서를 확인한다.
