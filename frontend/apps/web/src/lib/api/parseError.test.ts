import { describe, expect, it } from "vitest";

import { ApiError } from "./ApiError";
import { networkError, parseError } from "./parseError";

describe("parseError", () => {
  it("{name,message} 본문을 ApiError로 변환한다", async () => {
    const error = await parseError(
      Response.json(
        { name: "HANDLE_DUPLICATED", message: "중복" },
        { status: 409 },
      ),
    );
    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(409);
    expect(error.code).toBe("HANDLE_DUPLICATED");
    expect(error.message).toBe("중복");
  });

  it("JSON이 아니면 UNKNOWN_ERROR로 처리한다", async () => {
    const error = await parseError(new Response("oops", { status: 502 }));
    expect(error.status).toBe(502);
    expect(error.code).toBe("UNKNOWN_ERROR");
  });

  it("형식이 다른 JSON이면 UNKNOWN_ERROR로 처리한다", async () => {
    const error = await parseError(
      Response.json({ name: 1, message: "x" }, { status: 400 }),
    );
    expect(error.code).toBe("UNKNOWN_ERROR");
  });

  it("취소된 신호로 본문 읽기가 실패하면 그 오류를 그대로 던진다", async () => {
    const controller = new AbortController();
    const reason = new Error("취소");
    controller.abort(reason);
    const response = new Response(
      new ReadableStream({
        start(stream) {
          stream.error(reason);
        },
      }),
      { status: 500 },
    );

    await expect(parseError(response, controller.signal)).rejects.toBe(reason);
  });

  it("null 본문도 안전하게 처리한다", async () => {
    const error = await parseError(Response.json(null, { status: 500 }));
    expect(error.code).toBe("UNKNOWN_ERROR");
  });
});

describe("networkError", () => {
  it("status 0, NETWORK_ERROR", () => {
    const error = networkError();
    expect(error.status).toBe(0);
    expect(error.code).toBe("NETWORK_ERROR");
  });
});
