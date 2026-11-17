import { http, HttpResponse } from "msw";
import { describe, expect, it, vi } from "vitest";

import { server } from "@/mocks/server";

import { ApiError } from "./ApiError";
import { del, get, patch, post } from "./client";

const BASE = "https://api.test";
const PATH = "/api/members/handle-suggestion";

type Captured = {
  method: string;
  url: string;
  contentType: string | null;
  body: string;
};

function captureRequests(captured: Captured[]) {
  const record = async ({ request }: { request: Request }) => {
    captured.push({
      method: request.method,
      url: request.url,
      contentType: request.headers.get("content-type"),
      body: await request.text(),
    });
    return HttpResponse.json({ ok: true });
  };
  server.use(
    http.get(`${BASE}${PATH}`, record),
    http.post(`${BASE}${PATH}`, record),
    http.patch(`${BASE}${PATH}`, record),
    http.delete(`${BASE}${PATH}`, record),
  );
}

describe("요청 구성", () => {
  it("get은 GET으로 base + path에 본문 없이 요청한다", async () => {
    const captured: Captured[] = [];
    captureRequests(captured);

    await get(PATH);

    expect(captured).toHaveLength(1);
    expect(captured[0]).toMatchObject({
      method: "GET",
      url: `${BASE}${PATH}`,
      contentType: null,
      body: "",
    });
  });

  it("del은 DELETE로 본문 없이 요청한다", async () => {
    const captured: Captured[] = [];
    captureRequests(captured);

    await del(PATH);

    expect(captured[0]).toMatchObject({
      method: "DELETE",
      url: `${BASE}${PATH}`,
      contentType: null,
      body: "",
    });
  });

  it.each([
    ["POST", post],
    ["PATCH", patch],
  ] as const)("%s는 JSON 본문과 Content-Type을 보낸다", async (method, fn) => {
    const captured: Captured[] = [];
    captureRequests(captured);

    await fn(PATH, { handle: "tomato" });

    expect(captured).toHaveLength(1);
    expect(captured[0]).toMatchObject({
      method,
      url: `${BASE}${PATH}`,
      body: JSON.stringify({ handle: "tomato" }),
    });
    expect(captured[0]?.contentType).toContain("application/json");
  });

  it("본문 없는 post는 Content-Type을 보내지 않는다", async () => {
    const captured: Captured[] = [];
    captureRequests(captured);

    await post(PATH);

    expect(captured[0]?.body).toBe("");
    expect(captured[0]?.contentType).toBeNull();
  });

  it("호출자가 넘긴 헤더를 함께 보낸다", async () => {
    let received: string | null = null;
    server.use(
      http.get(`${BASE}${PATH}`, ({ request }) => {
        received = request.headers.get("x-test");
        return HttpResponse.json({});
      }),
    );

    await get(PATH, { headers: { "X-Test": "1" } });

    expect(received).toBe("1");
  });
});

describe("credentials", () => {
  it.each([
    ["get", () => get(PATH)],
    ["post", () => post(PATH, {})],
    ["patch", () => patch(PATH, {})],
    ["del", () => del(PATH)],
  ] as const)("%s는 credentials: include로 fetch한다", async (_, call) => {
    const captured: Captured[] = [];
    captureRequests(captured);
    const spy = vi.spyOn(globalThis, "fetch");

    await call();

    expect(spy).toHaveBeenCalledOnce();
    expect(spy.mock.calls[0]?.[1]).toMatchObject({ credentials: "include" });
    spy.mockRestore();
  });
});

describe("성공 응답", () => {
  it("2xx JSON 본문을 파싱해 반환한다", async () => {
    server.use(
      http.get(`${BASE}${PATH}`, () =>
        HttpResponse.json({ handle: "tomato_1" }),
      ),
    );

    await expect(get<{ handle: string }>(PATH)).resolves.toEqual({
      handle: "tomato_1",
    });
  });

  it("204면 undefined를 반환한다", async () => {
    server.use(
      http.delete(
        `${BASE}${PATH}`,
        () => new HttpResponse(null, { status: 204 }),
      ),
    );

    await expect(del(PATH)).resolves.toBeUndefined();
  });

  it("2xx이지만 본문이 비어 있으면 undefined를 반환한다", async () => {
    server.use(http.post(`${BASE}${PATH}`, () => new HttpResponse("")));

    await expect(post(PATH, {})).resolves.toBeUndefined();
  });
});

describe("실패 응답", () => {
  it("{name,message} 본문이면 ApiError(status, code, message)를 던진다", async () => {
    server.use(
      http.post(`${BASE}${PATH}`, () =>
        HttpResponse.json(
          { name: "HANDLE_DUPLICATED", message: "이미 사용 중입니다." },
          { status: 409 },
        ),
      ),
    );

    const error = await post(PATH, {}).catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({
      status: 409,
      code: "HANDLE_DUPLICATED",
      message: "이미 사용 중입니다.",
    });
  });

  it("JSON이 아닌 본문이면 UNKNOWN_ERROR를 던진다", async () => {
    server.use(
      http.get(`${BASE}${PATH}`, () =>
        HttpResponse.text("Bad Gateway", { status: 502 }),
      ),
    );

    const error = await get(PATH).catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 502, code: "UNKNOWN_ERROR" });
  });

  it("fetch가 실패하면 NETWORK_ERROR를 던진다", async () => {
    server.use(http.get(`${BASE}${PATH}`, () => HttpResponse.error()));

    const error = await get(PATH).catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 0, code: "NETWORK_ERROR" });
  });

  it("abort하면 AbortError가 그대로 전파된다", async () => {
    server.use(
      http.get(`${BASE}${PATH}`, () => new Promise<Response>(() => undefined)),
    );
    const controller = new AbortController();

    const pending = get(PATH, { signal: controller.signal }).catch(
      (e: unknown) => e,
    );
    controller.abort();
    const error = await pending;

    expect(error).not.toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ name: "AbortError" });
  });

  it("취소 사유를 직접 넘겨도 NETWORK_ERROR로 바뀌지 않는다", async () => {
    server.use(
      http.get(`${BASE}${PATH}`, () => new Promise<Response>(() => undefined)),
    );
    const controller = new AbortController();
    const reason = new Error("사용자가 취소함");

    const pending = get(PATH, { signal: controller.signal }).catch(
      (e: unknown) => e,
    );
    controller.abort(reason);
    const error = await pending;

    expect(error).not.toBeInstanceOf(ApiError);
    expect(error).toBe(reason);
  });
});
