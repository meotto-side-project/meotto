import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { afterEach, beforeEach, expect, test, vi } from "vitest";

import { apiUrl } from "@/mocks/apiUrl";
import { server } from "@/mocks/server";

import { AUTH_ERROR_NAMES } from "../constants/errorNames";
import { SIGNUP_MESSAGES } from "../constants/messages";
import { AUTH_ENDPOINTS } from "../constants/url";
import SignupProfileScreen from "./SignupProfileScreen";

const replace = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
}));

const me = {
  id: 1,
  nickname: "토마토",
  handle: null,
  profileImageUrl: null,
  notificationEnabled: true,
  boardPublic: true,
  sentPraiseVisibility: "ALL",
  profileCompleted: false,
};

const renderScreen = () =>
  render(
    <QueryClientProvider
      client={
        new QueryClient({
          defaultOptions: {
            queries: { retry: false },
            mutations: { retry: false },
          },
        })
      }
    >
      <SignupProfileScreen />
    </QueryClientProvider>,
  );

const useMe = (body: Record<string, unknown>) =>
  server.use(
    http.get(apiUrl(AUTH_ENDPOINTS.me), () => HttpResponse.json(body)),
  );

const apiError = (name: string, status: number) =>
  HttpResponse.json({ name, message: "서버 메시지" }, { status });

const useSignupError = (name: string, status: number) =>
  server.use(
    http.post(apiUrl(AUTH_ENDPOINTS.signupProfile), () =>
      apiError(name, status),
    ),
  );

const nicknameInput = () => screen.findByRole("textbox", { name: "이름" });
const handleInput = () => screen.getByRole("textbox", { name: "멋토 아이디" });
const submitButton = () => screen.getByRole("button", { name: "완료" });

const typeNickname = async (value: string) => {
  const input = await nicknameInput();
  await userEvent.clear(input);
  if (value) {
    await userEvent.type(input, value);
  }
};

const postMessage = vi.fn();

const dispatchPicked = (payload: unknown) =>
  act(() => {
    window.dispatchEvent(
      new MessageEvent("message", {
        data: { type: "PROFILE_IMAGE_PICKED", payload },
      }),
    );
  });

const pickedPayload = {
  status: "picked",
  mimeType: "image/jpeg",
  base64: btoa("image-bytes"),
};

const clickPencil = () =>
  userEvent.click(screen.getByRole("button", { name: "프로필 사진 변경" }));

beforeEach(() => {
  replace.mockClear();
  postMessage.mockClear();
  window.ReactNativeWebView = { postMessage };
});

afterEach(() => {
  delete window.ReactNativeWebView;
});

test("이름은 /me의 닉네임, 멋토 아이디는 제안값으로 미리 채운다", async () => {
  renderScreen();

  expect(await nicknameInput()).toHaveValue("토마토");
  expect(handleInput()).toHaveValue("tomato_1234");
  expect(submitButton()).toBeEnabled();
});

test("가입을 마친 회원이면 홈으로 이동하고 폼을 보여주지 않는다", async () => {
  useMe({ ...me, handle: "tomato", profileCompleted: true });
  renderScreen();

  await waitFor(() => expect(replace).toHaveBeenCalledWith("/"));
  expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
});

test("로그인하지 않았으면(401) 로그인 화면으로 이동한다", async () => {
  server.use(
    http.get(apiUrl(AUTH_ENDPOINTS.me), () => apiError("UNAUTHORIZED", 401)),
  );
  renderScreen();

  await waitFor(() => expect(replace).toHaveBeenCalledWith("/login"));
});

test("내 정보를 불러오지 못하면 안내와 다시 시도 버튼을 보여준다", async () => {
  server.use(
    http.get(apiUrl(AUTH_ENDPOINTS.me), () => apiError("INTERNAL", 500)),
  );
  renderScreen();

  expect(await screen.findByRole("alert")).toHaveTextContent(
    "정보를 불러오지 못했어요.",
  );
  server.use(http.get(apiUrl(AUTH_ENDPOINTS.me), () => HttpResponse.json(me)));
  await userEvent.click(screen.getByRole("button", { name: "다시 시도" }));

  expect(await nicknameInput()).toBeInTheDocument();
  expect(replace).not.toHaveBeenCalled();
});

test("아이디 제안이 실패해도 빈 아이디로 폼을 보여준다", async () => {
  server.use(
    http.get(apiUrl(AUTH_ENDPOINTS.handleSuggestion), () =>
      apiError("INTERNAL", 500),
    ),
  );
  renderScreen();

  expect(await nicknameInput()).toBeInTheDocument();
  expect(handleInput()).toHaveValue("");
  expect(submitButton()).toBeDisabled();
});

test("뒤로가기는 서버 호출 없이 로그인 화면으로 이동한다", async () => {
  renderScreen();
  await nicknameInput();

  await userEvent.click(screen.getByRole("button", { name: "뒤로가기" }));

  expect(replace).toHaveBeenCalledWith("/login");
});

test("이름이 규칙을 벗어나면 입력창 오류를 보여주고 완료할 수 없다", async () => {
  renderScreen();

  await typeNickname("a");

  const input = await nicknameInput();
  expect(input).toHaveAttribute("aria-invalid", "true");
  expect(input).toHaveAccessibleDescription(SIGNUP_MESSAGES.nicknameInvalid);
  expect(input).toHaveClass("border-danger");
  expect(submitButton()).toBeDisabled();
});

test("이름이 비어 있으면 완료할 수 없다", async () => {
  renderScreen();

  await typeNickname("");

  expect(submitButton()).toBeDisabled();
});

test("아이디가 규칙을 벗어나면 입력창 오류를 보여주고 완료할 수 없다", async () => {
  renderScreen();
  await nicknameInput();

  await userEvent.clear(handleInput());
  await userEvent.type(handleInput(), "a..b");

  expect(handleInput()).toHaveAttribute("aria-invalid", "true");
  expect(handleInput()).toHaveAccessibleDescription(
    SIGNUP_MESSAGES.handleInvalid,
  );
  expect(submitButton()).toBeDisabled();
});

test("포커스 중 지우기 버튼으로 입력값을 비운다", async () => {
  renderScreen();
  await userEvent.click(await nicknameInput());

  await userEvent.click(screen.getByRole("button", { name: "이름 지우기" }));

  expect(await nicknameInput()).toHaveValue("");
});

test("완료하면 입력값을 보내고 홈으로 이동한다", async () => {
  let requestBody: unknown;
  server.use(
    http.post(apiUrl(AUTH_ENDPOINTS.signupProfile), async ({ request }) => {
      requestBody = await request.json();
      return new HttpResponse(null, { status: 201 });
    }),
  );
  renderScreen();

  await typeNickname("새 이름");
  await userEvent.click(submitButton());

  await waitFor(() => expect(replace).toHaveBeenCalledWith("/"));
  expect(requestBody).toEqual({ nickname: "새 이름", handle: "tomato_1234" });
});

test("HANDLE_DUPLICATED면 아이디 입력창에 오류를 보이고 입력값을 유지한다", async () => {
  useSignupError(AUTH_ERROR_NAMES.handleDuplicated, 409);
  renderScreen();
  await nicknameInput();

  await userEvent.click(submitButton());

  await waitFor(() =>
    expect(handleInput()).toHaveAccessibleDescription(
      SIGNUP_MESSAGES.handleDuplicated,
    ),
  );
  expect(handleInput()).toHaveAttribute("aria-invalid", "true");
  expect(handleInput()).toHaveValue("tomato_1234");
  expect(replace).not.toHaveBeenCalled();
});

test("아이디를 고치면 서버 오류 문구가 사라진다", async () => {
  useSignupError(AUTH_ERROR_NAMES.handleDuplicated, 409);
  renderScreen();
  await nicknameInput();
  await userEvent.click(submitButton());
  await screen.findByText(SIGNUP_MESSAGES.handleDuplicated);

  await userEvent.type(handleInput(), "2");

  expect(
    screen.queryByText(SIGNUP_MESSAGES.handleDuplicated),
  ).not.toBeInTheDocument();
});

test("INVALID_HANDLE면 아이디 형식 오류를 아이디 입력창에 보인다", async () => {
  useSignupError(AUTH_ERROR_NAMES.invalidHandle, 400);
  renderScreen();
  await nicknameInput();

  await userEvent.click(submitButton());

  await waitFor(() =>
    expect(handleInput()).toHaveAccessibleDescription(
      SIGNUP_MESSAGES.handleInvalid,
    ),
  );
});

test("INVALID_NICKNAME이면 이름 입력창에 오류를 보인다", async () => {
  useSignupError(AUTH_ERROR_NAMES.invalidNickname, 400);
  renderScreen();
  await nicknameInput();

  await userEvent.click(submitButton());

  await waitFor(async () =>
    expect(await nicknameInput()).toHaveAccessibleDescription(
      SIGNUP_MESSAGES.nicknameInvalid,
    ),
  );
  expect(await nicknameInput()).toHaveAttribute("aria-invalid", "true");
});

test("ALREADY_SIGNED_UP이면 오류 없이 홈으로 이동한다", async () => {
  useSignupError(AUTH_ERROR_NAMES.alreadySignedUp, 409);
  renderScreen();
  await nicknameInput();

  await userEvent.click(submitButton());

  await waitFor(() => expect(replace).toHaveBeenCalledWith("/"));
  expect(screen.getByRole("status")).toBeEmptyDOMElement();
});

test("5xx면 토스트로 안내하고 입력값을 유지한다", async () => {
  useSignupError("INTERNAL_SERVER_ERROR", 500);
  renderScreen();
  await typeNickname("새 이름");

  await userEvent.click(submitButton());

  expect(await screen.findByRole("status")).toHaveTextContent(
    SIGNUP_MESSAGES.serverError,
  );
  expect(await nicknameInput()).toHaveValue("새 이름");
  expect(handleInput()).toHaveValue("tomato_1234");
  expect(replace).not.toHaveBeenCalled();
});

test("네트워크 실패도 토스트로 안내한다", async () => {
  server.use(
    http.post(apiUrl(AUTH_ENDPOINTS.signupProfile), () => HttpResponse.error()),
  );
  renderScreen();
  await nicknameInput();

  await userEvent.click(submitButton());

  expect(await screen.findByRole("status")).toHaveTextContent(
    SIGNUP_MESSAGES.serverError,
  );
});

test("토스트는 3초 뒤에 사라진다", async () => {
  useSignupError("INTERNAL_SERVER_ERROR", 500);
  renderScreen();
  await nicknameInput();
  await userEvent.click(submitButton());
  await screen.findByText(SIGNUP_MESSAGES.serverError);

  await waitFor(
    () => expect(screen.getByRole("status")).toBeEmptyDOMElement(),
    { timeout: 4000 },
  );
});

test("연필 버튼을 누르면 네이티브에 PICK_PROFILE_IMAGE를 보낸다", async () => {
  renderScreen();
  await nicknameInput();

  await clickPencil();

  expect(postMessage).toHaveBeenCalledWith(
    JSON.stringify({ type: "PICK_PROFILE_IMAGE" }),
  );
});

test("사진을 고르면 업로드해 미리보기를 바꾸고 profileImageUrl을 보낸다", async () => {
  let requestBody: unknown;
  let uploadRequested = false;
  server.use(
    // jsdom의 FormData는 Node fetch가 multipart로 보내지 못해 본문 검증은 핸들러 테스트에서 한다.
    http.post(apiUrl(AUTH_ENDPOINTS.profileImage), () => {
      uploadRequested = true;
      return HttpResponse.json(
        { imageUrl: "https://images.meotto.test/profile/mock.jpg" },
        { status: 201 },
      );
    }),
    http.post(apiUrl(AUTH_ENDPOINTS.signupProfile), async ({ request }) => {
      requestBody = await request.json();
      return new HttpResponse(null, { status: 201 });
    }),
  );
  renderScreen();
  await nicknameInput();
  expect(
    screen.getByRole("img", { name: "프로필 사진 미리보기" }).tagName,
  ).toBe("svg");

  await clickPencil();
  dispatchPicked(pickedPayload);

  await waitFor(() =>
    expect(
      screen.getByRole("img", { name: "프로필 사진 미리보기" }),
    ).toHaveAttribute("src", "https://images.meotto.test/profile/mock.jpg"),
  );
  expect(uploadRequested).toBe(true);
  await userEvent.click(submitButton());
  await waitFor(() => expect(replace).toHaveBeenCalledWith("/"));
  expect(requestBody).toEqual({
    nickname: "토마토",
    handle: "tomato_1234",
    profileImageUrl: "https://images.meotto.test/profile/mock.jpg",
  });
});

test("업로드가 실패하면 토스트로 안내하고 미리보기를 바꾸지 않는다", async () => {
  server.use(
    http.post(apiUrl(AUTH_ENDPOINTS.profileImage), () =>
      apiError(AUTH_ERROR_NAMES.invalidImage, 400),
    ),
  );
  renderScreen();
  await nicknameInput();

  await clickPencil();
  dispatchPicked(pickedPayload);

  expect(await screen.findByRole("status")).toHaveTextContent(
    SIGNUP_MESSAGES.serverError,
  );
  expect(
    screen.getByRole("img", { name: "프로필 사진 미리보기" }).tagName,
  ).toBe("svg");
});

test("사진 선택을 취소하면 아무것도 바꾸지 않는다", async () => {
  renderScreen();
  await nicknameInput();

  await clickPencil();
  dispatchPicked({ status: "cancelled" });

  expect(screen.getByRole("status")).toBeEmptyDOMElement();
  expect(
    screen.getByRole("img", { name: "프로필 사진 미리보기" }).tagName,
  ).toBe("svg");
});

test("사진 권한이 거부되면 권한 안내 토스트를 보여준다", async () => {
  renderScreen();
  await nicknameInput();

  await clickPencil();
  dispatchPicked({ status: "denied" });

  expect(await screen.findByRole("status")).toHaveTextContent(
    SIGNUP_MESSAGES.photoPermissionDenied,
  );
});

test("사진 선택에 오류가 나면 서버 오류와 같은 토스트를 보여준다", async () => {
  renderScreen();
  await nicknameInput();

  await clickPencil();
  dispatchPicked({ status: "error" });

  expect(await screen.findByRole("status")).toHaveTextContent(
    SIGNUP_MESSAGES.serverError,
  );
});

test("요청하지 않은 사진 선택 메시지는 무시한다", async () => {
  renderScreen();
  await nicknameInput();

  dispatchPicked({ status: "denied" });

  expect(screen.getByRole("status")).toBeEmptyDOMElement();
});
