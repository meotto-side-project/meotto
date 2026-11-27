import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { beforeEach, expect, test, vi } from "vitest";

import { apiUrl } from "@/mocks/apiUrl";
import { server } from "@/mocks/server";

import { AUTH_ENDPOINTS } from "../constants/url";
import LoginScreen from "./LoginScreen";

const replace = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
}));

const renderScreen = () =>
  render(
    <QueryClientProvider
      client={
        new QueryClient({ defaultOptions: { mutations: { retry: false } } })
      }
    >
      <LoginScreen />
    </QueryClientProvider>,
  );

beforeEach(() => {
  replace.mockClear();
});

test("3개 소셜 로그인 버튼을 보여준다", () => {
  renderScreen();

  expect(
    screen.getByRole("button", { name: "카카오톡으로 시작하기" }),
  ).toBeEnabled();
  expect(
    screen.getByRole("button", { name: "네이버로 시작하기" }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("button", { name: "Apple로 시작하기" }),
  ).toBeEnabled();
});

test("카카오 로그인에 성공하면 홈으로 이동한다", async () => {
  renderScreen();

  await userEvent.click(
    screen.getByRole("button", { name: "카카오톡으로 시작하기" }),
  );

  await waitFor(() => expect(replace).toHaveBeenCalledWith("/"));
});

test("로그인에 성공하면 네이티브에 AUTH_LOGIN_SUCCESS를 보낸다", async () => {
  const postMessage = vi.fn();
  window.ReactNativeWebView = { postMessage };
  renderScreen();

  await userEvent.click(
    screen.getByRole("button", { name: "카카오톡으로 시작하기" }),
  );

  await waitFor(() =>
    expect(postMessage).toHaveBeenCalledWith(
      JSON.stringify({ type: "AUTH_LOGIN_SUCCESS" }),
    ),
  );
  delete window.ReactNativeWebView;
});

test("Apple 로그인에 성공하면 홈으로 이동한다", async () => {
  renderScreen();

  await userEvent.click(
    screen.getByRole("button", { name: "Apple로 시작하기" }),
  );

  await waitFor(() => expect(replace).toHaveBeenCalledWith("/"));
});

test("신규 회원이면 프로필 입력으로 이동한다", async () => {
  server.use(
    http.post(apiUrl(AUTH_ENDPOINTS.kakaoLogin), () =>
      HttpResponse.json({ needsProfileSetup: true, memberId: 2 }),
    ),
  );
  renderScreen();

  await userEvent.click(
    screen.getByRole("button", { name: "카카오톡으로 시작하기" }),
  );

  await waitFor(() => expect(replace).toHaveBeenCalledWith("/signup"));
});

test("로그인에 실패하면 안내 문구를 보여주고 이동하지 않는다", async () => {
  server.use(
    http.post(apiUrl(AUTH_ENDPOINTS.kakaoLogin), () =>
      HttpResponse.json(
        { name: "INVALID_KAKAO_TOKEN", message: "유효하지 않은 토큰" },
        { status: 401 },
      ),
    ),
  );
  renderScreen();

  await userEvent.click(
    screen.getByRole("button", { name: "카카오톡으로 시작하기" }),
  );

  expect(await screen.findByRole("alert")).toBeInTheDocument();
  expect(replace).not.toHaveBeenCalled();
});
