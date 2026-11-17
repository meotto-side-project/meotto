import { ApiError, NETWORK_ERROR_CODE, UNKNOWN_ERROR_CODE } from "./ApiError";

const FALLBACK_MESSAGE = "요청을 처리하지 못했습니다.";

export function networkError(): ApiError {
  return new ApiError(0, NETWORK_ERROR_CODE, "네트워크 연결을 확인해 주세요.");
}

export async function parseError(response: Response): Promise<ApiError> {
  let body: unknown;
  try {
    body = await response.json();
  } catch {
    return new ApiError(response.status, UNKNOWN_ERROR_CODE, FALLBACK_MESSAGE);
  }

  if (
    typeof body === "object" &&
    body !== null &&
    "name" in body &&
    "message" in body &&
    typeof body.name === "string" &&
    typeof body.message === "string" &&
    body.name !== ""
  ) {
    return new ApiError(response.status, body.name, body.message);
  }

  return new ApiError(response.status, UNKNOWN_ERROR_CODE, FALLBACK_MESSAGE);
}
