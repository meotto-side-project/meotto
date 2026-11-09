---
name: create-api-hook
description: 프론트엔드(웹 또는 모바일) API 연동 코드 생성. 엔드포인트 상수, 쿼리 키, Zod 스키마, TanStack Query 조회/변경 훅을 Plan의 API 계약 표 기준으로 만든다. "API 추가", "쿼리 훅", "mutation" 작업 시 사용.
argument-hint: "<web|mobile> <Plan의 API 계약 ID 또는 엔드포인트>"
---

# API 연동 훅 생성

대상: $ARGUMENTS

## 플랫폼과 위치

첫 인자(`web` 또는 `mobile`)로 정한다. 없으면 Plan Task의 영역에서 확인하고, 모르면 묻는다.

- 웹: `frontend/apps/web/src/components/features/[feature]/`, 별칭 `@/src/...`
- 모바일: `frontend/apps/mobile/src/components/features/[feature]/` (훅 패턴은 동일. 라우트 `src/app/` 안에는 두지 않는다)
- 같은 API를 두 앱이 쓰면 Zod 스키마, 엔드포인트 상수, 타입을 `frontend/packages/shared`에 두고 양쪽 훅이 import한다. 패키지가 없으면 만들기 전에 승인받는다.
- 웹의 공유 콘텐츠 페이지(SEO 대상)는 이 훅이 아니라 **서버 컴포넌트에서 직접 fetch**한다. 훅은 클라이언트에서 상호작용하는 부분에만 쓴다 (`frontend-web.md`).

## 시작 전 확인

1. **스키마의 출처는 `docs/plans/<feature>.md`의 API 계약 표**다. 계약에 없는 엔드포인트나 필드를 만들지 않는다. 계약이 없거나 모호하면 멈추고 보고한다.
2. `@tanstack/react-query`, `zod`, `src/lib/api`(`get/post/patch/del` 래퍼)가 있는지 확인한다. 없으면 만들거나 설치하지 말고 사용자에게 알린다 (의존성 추가는 승인 사항).
3. 같은 feature의 기존 `constants/`, `queries/` 파일을 읽고 이름 규칙을 맞춘다.

## 파일 순서

HTTP는 래퍼만 쓴다 (axios 직접 호출 금지).

1. `constants/url.ts` - 엔드포인트 상수

```ts
export const STAMP_ENDPOINTS = {
  list: "/stamps",
  detail: (stampId: number) => `/stamps/${stampId}`,
} as const;
```

2. `constants/queryKeys.ts` - 쿼리 키 팩토리

```ts
export const stampKeys = {
  all: ["stamps"] as const,
  list: () => [...stampKeys.all, "list"] as const,
};
```

3. `queries/useXxxQuery.ts` - Zod 스키마 → `z.infer` 타입 → `get<T>`에 `responseSchema` 전달 → `useQuery`

```ts
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";

import { get } from "@/src/lib/api";

import { stampKeys } from "../constants/queryKeys";
import { STAMP_ENDPOINTS } from "../constants/url";

const stampListSchema = z.array(
  z.object({
    id: z.number(),
    createdAt: z.coerce.date(),
  }),
);

export type StampListResponse = z.infer<typeof stampListSchema>;

const getStampList = async () =>
  get<StampListResponse>(STAMP_ENDPOINTS.list, {
    responseSchema: stampListSchema,
  });

export const useStampListQuery = () =>
  useQuery({
    queryKey: stampKeys.list(),
    queryFn: getStampList,
  });
```

4. `queries/useXxxMutation.ts` - `useMutation`. 변경 후 관련 쿼리는 `queryClient.invalidateQueries({ queryKey })`로 무효화한다.

5. `src/mocks/handlers/[feature].ts` - **MSW 핸들러** (웹). API가 아직 없거나 Plan의 `실서버 연동 확인` 전에는 이것으로 연결까지 동작시킨다.

```ts
import { http, HttpResponse } from "msw";

import { STAMP_ENDPOINTS } from "@/src/components/features/stamp/constants/url";

export const stampHandlers = [
  http.get(`${process.env.NEXT_PUBLIC_API_URL}${STAMP_ENDPOINTS.list}`, () =>
    HttpResponse.json([{ id: 1, createdAt: "2025-01-01T00:00:00Z" }]),
  ),
];
```

- 응답은 계약 표의 Response 필드와 같게 쓰고, 계약에 있는 에러(`{ name, message }`)도 상태코드와 함께 핸들러로 만든다 (필요하면 테스트에서 `server.use`로 덮어씀).
- 핸들러를 `src/mocks/browser.ts`, `server.ts`의 목록에 등록한다. `msw`가 설치되어 있지 않으면 설치하지 말고 멈춰 사용자에게 승인을 요청한다.

## 규칙

- 쿼리 키와 엔드포인트를 하드코딩하지 않는다 (`constants/` 사용).
- 응답은 반드시 Zod로 검증한다. 에러 응답 형식은 `{ name, message }`.
- Suspense가 필요하면 `useSuspenseQuery`.

## 검증

`cd frontend && pnpm lint && pnpm check-types`. 계약과 스키마 필드가 일치하는지 표와 대조해 보고에 적는다.
