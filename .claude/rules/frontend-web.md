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

## 테스트와 검증

- 컴포넌트: Storybook + Vitest(스토리 `play` 함수). 스킬: `create-test`.
- E2E: Playwright, 핵심 여정만. 스킬: `create-e2e`.
- 두 도구는 현재 미설치다. 설치는 별도 승인 작업이다.
- **SEO 검증 (설치 없이 가능)**: `cd frontend/apps/web && pnpm build && pnpm start` 후 `curl -s <URL>`의 HTML에 `<title>`, `og:title`, `og:description`, `og:image`, `twitter:card`, `canonical`, `robots`가 들어 있는지 확인한다. 비공개·무효 케이스에서 개인 정보가 응답에 없는지도 확인한다.
