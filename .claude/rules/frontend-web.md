---
paths:
  - "frontend/apps/web/**"
---

# 웹(Next) 규칙

웹은 이 프로젝트의 화면 대부분을 담당한다. 앱에서는 웹뷰로, 공유 링크로는 일반 브라우저로 열린다. 공유된 콘텐츠는 검색엔진과 소셜 미디어 미리보기(카카오톡, 네이버, SNS)에 맞게 제공한다.

- 모바일 화면 크기를 기준으로 만든다 (웹뷰 안에서 쓰이므로). 안전 영역(`env(safe-area-inset-*)`)을 고려한다.
- 앱 안에서만 쓰는 화면은 SEO 대상이 아니므로 `robots: noindex`로 둔다. 로그인이 필요한 화면은 서버에서 인증을 확인한다.
- 네이티브 기능(푸시 권한, 토큰 등)은 브리지 메시지로 요청한다. 브리지 계약은 Plan 표를 따른다.

## 공유 콘텐츠 페이지

- 서버 컴포넌트가 기본이다. 데이터는 서버에서 가져와 HTML에 담아 렌더링한다. 클라이언트에서만 데이터를 불러오는 렌더링은 금지.
- 페이지마다 `generateMetadata`로 `title`, `description`, `openGraph`, `twitter`, `alternates.canonical`을 정의한다.
- OG 이미지는 Next의 `opengraph-image` 규약 또는 `next/og`로 생성한다.
- **비공개 정보를 메타 태그와 OG 이미지에 넣지 않는다.** 칭찬판 공개 범위 설정(`mypage-settings.md` F-42)이 `비공개`이거나 토큰이 유효하지 않으면 일반 문구의 메타 + `robots: noindex`로 응답하고 이름, 도장 수 등을 노출하지 않는다.
- 존재하지 않는 대상은 404 상태 코드로 응답한다 (200으로 빈 페이지를 주지 않는다).
- 상호작용이 필요한 부분(도장 보내기 폼 등)만 `"use client"` 컴포넌트로 분리하고, 이때 TanStack Query를 쓴다.
- 앱 설치 안내와 앱으로 열기(딥링크)는 Spec이 확정된 뒤에 구현한다.

## 구조

- 별칭 `@/*` → 앱 루트. 소스는 `@/src/...`.
- `src/components/ui/[Name]/[Name].tsx`: 범용 컴포넌트. `features`를 참조하지 않는다.
- `src/components/features/[feature]/`: 기능 전용. 하위에 `constants/url.ts`, `constants/queryKeys.ts`, `queries/`.
- import 방향은 상위 → 하위만: `ui`는 `features`를 못 가리키고, feature끼리 직접 import하지 않으며, `lib`는 컴포넌트를 가리키지 않는다.
- HTTP는 `src/lib/api`의 `get/post/patch/del` 래퍼만 쓴다 (axios 직접 호출 금지).
- 스타일은 Tailwind 4. 토큰은 `@theme`에 정의한다. `ComponentProps<'el'>` 확장, default export, 조건부 클래스는 `cn()`.
- 무거운 컴포넌트는 `next/dynamic`으로 동적 import.

## API 목 (MSW)

- 위치: `src/mocks/handlers/[feature].ts`(기능별 핸들러), `src/mocks/handlers.ts`(전체 핸들러 목록), `src/mocks/browser.ts`(브라우저용 워커), `src/mocks/server.ts`(서버 컴포넌트·테스트용 node 서버), 워커 파일은 `public/mockServiceWorker.js`(`msw init`으로 생성, 직접 수정 금지).
- 기능별 핸들러는 `handlers.ts` 목록에만 추가한다. `browser.ts`와 `server.ts`가 이 목록을 함께 쓰므로, 한쪽에만 등록되어 개발 목과 테스트 목이 달라지는 일이 없다.
- 활성화: `NEXT_PUBLIC_API_MOCKING=enabled`일 때만. 브라우저는 `src/instrumentation-client.ts`, 서버 컴포넌트의 fetch는 `src/instrumentation.ts`에서 켠다. 이 두 파일 외에는 목 여부를 분기하지 않는다.
- `instrumentation-client`의 비동기 작업은 하이드레이션 전에 끝난다는 보장이 없다(Next 문서). 페이지 진입 직후 첫 요청이 워커 활성화보다 빠르면 실서버로 갈 수 있다.
- 단위 테스트(`src/test/setup.ts`)는 `onUnhandledFrame: "error"`로 서버를 띄운다. 핸들러가 없는 요청은 테스트 실패가 된다. 테스트별 응답은 `server.use()`로 덮어쓴다.
- 서버 컴포넌트가 가져오는 데이터(공유 콘텐츠 페이지)도 같은 핸들러로 목 처리한다. 도메인은 `NEXT_PUBLIC_API_URL` 기준이다.
- 핸들러 작성 절차는 `create-api-hook`의 "목 핸들러" 단계를 따른다. 공통 규칙은 `frontend.md`.

## 테스트와 검증

- 단위·컴포넌트: Vitest + React Testing Library(jsdom). 컴포넌트, 훅, Zod 스키마, 유틸 모두 대상. 파일은 대상 옆 `[Name].test.ts(x)`. 실행: `pnpm test`. 스킬: `create-test`.
- E2E: Playwright, 핵심 여정만. 파일은 `apps/web/e2e/*.spec.ts`. 실행: `pnpm test:e2e`(MSW가 켜진 상태로 서버가 뜬다). 스킬: `create-e2e`.
- Storybook: 컴포넌트 **문서용**이다. 스토리에 `play` 테스트를 쓰지 않는다(테스트는 Vitest로 통일). 실행: `pnpm --filter web storybook`.
- **SEO 검증 (설치 없이 가능)**: `cd frontend/apps/web && pnpm build`, `pnpm start &`로 서버를 백그라운드에 띄우고 준비될 때까지 기다린 뒤(`trap`으로 종료 보장) `curl -s <URL>`의 HTML에 `<title>`, `og:title`, `og:description`, `og:image`, `twitter:card`, `canonical`, `robots`가 들어 있는지 확인한다. 비공개·무효 케이스에서 개인 정보가 응답에 없는지도 확인한다.
