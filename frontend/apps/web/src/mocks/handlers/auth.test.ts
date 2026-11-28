import { File as NodeFile } from "node:buffer";

import { expect, test } from "vitest";

import { AUTH_ERROR_NAMES } from "@/components/features/auth/constants/errorNames";
import { AUTH_ENDPOINTS } from "@/components/features/auth/constants/url";

import { apiUrl } from "../apiUrl";

const postJson = (path: string, body: unknown) =>
  fetch(apiUrl(path), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

test("카카오 토큰이 있으면 로그인에 성공한다", async () => {
  const response = await postJson(AUTH_ENDPOINTS.kakaoLogin, {
    accessToken: "token",
  });

  expect(response.status).toBe(200);
  expect(await response.json()).toEqual({
    needsProfileSetup: false,
    memberId: 1,
  });
});

test("카카오 토큰이 비어 있으면 INVALID_KAKAO_TOKEN 401을 돌려준다", async () => {
  const response = await postJson(AUTH_ENDPOINTS.kakaoLogin, {
    accessToken: "",
  });

  expect(response.status).toBe(401);
  expect(await response.json()).toMatchObject({
    name: AUTH_ERROR_NAMES.invalidKakaoToken,
  });
});

test("Apple 토큰이 있으면 로그인에 성공한다", async () => {
  const response = await postJson(AUTH_ENDPOINTS.appleLogin, {
    identityToken: "token",
  });

  expect(response.status).toBe(200);
});

test("Apple 토큰이 없으면 INVALID_APPLE_TOKEN 401을 돌려준다", async () => {
  const response = await postJson(AUTH_ENDPOINTS.appleLogin, {});

  expect(response.status).toBe(401);
  expect(await response.json()).toMatchObject({
    name: AUTH_ERROR_NAMES.invalidAppleToken,
  });
});

const signupProfile = (body: unknown) =>
  postJson(AUTH_ENDPOINTS.signupProfile, body);

test("아이디 제안은 규칙에 맞는 handle을 돌려준다", async () => {
  const response = await fetch(apiUrl(AUTH_ENDPOINTS.handleSuggestion));

  expect(response.status).toBe(200);
  expect(await response.json()).toEqual({ handle: "tomato_1234" });
});

test("내 정보는 가입 미완료 상태를 돌려준다", async () => {
  const response = await fetch(apiUrl(AUTH_ENDPOINTS.me));

  expect(response.status).toBe(200);
  expect(await response.json()).toMatchObject({
    handle: null,
    profileCompleted: false,
  });
});

test("가입 프로필이 올바르면 201 본문 없음을 돌려준다", async () => {
  const response = await signupProfile({ nickname: "토마토", handle: "abc" });

  expect(response.status).toBe(201);
  expect(await response.text()).toBe("");
});

test("이름이 규칙을 벗어나면 INVALID_NICKNAME 400을 돌려준다", async () => {
  const response = await signupProfile({ nickname: "a", handle: "abc" });

  expect(response.status).toBe(400);
  expect(await response.json()).toMatchObject({
    name: AUTH_ERROR_NAMES.invalidNickname,
  });
});

test("아이디가 규칙을 벗어나면 INVALID_HANDLE 400을 돌려준다", async () => {
  const response = await signupProfile({ nickname: "토마토", handle: "a..b" });

  expect(response.status).toBe(400);
  expect(await response.json()).toMatchObject({
    name: AUTH_ERROR_NAMES.invalidHandle,
  });
});

test("이미 쓰는 아이디면 HANDLE_DUPLICATED 409를 돌려준다", async () => {
  const response = await signupProfile({
    nickname: "토마토",
    handle: "meotto",
  });

  expect(response.status).toBe(409);
  expect(await response.json()).toMatchObject({
    name: AUTH_ERROR_NAMES.handleDuplicated,
  });
});

// jsdom의 FormData·File은 Node fetch가 multipart로 직렬화하지 못한다.
// Response로 얻은 Node(undici) FormData와 node:buffer File을 쓴다.
const uploadImage = async (file?: File) => {
  const body = await new Response(new URLSearchParams()).formData();
  if (file) {
    body.append("file", file);
  }
  return fetch(apiUrl(AUTH_ENDPOINTS.profileImage), { method: "POST", body });
};

test("사진을 올리면 imageUrl과 201을 돌려준다", async () => {
  const response = await uploadImage(
    new NodeFile(["x"], "a.jpg", { type: "image/jpeg" }) as unknown as File,
  );

  expect(response.status).toBe(201);
  expect(await response.json()).toEqual({
    imageUrl: "https://images.meotto.test/profile/mock.jpg",
  });
});

test("파일이 없거나 비어 있으면 INVALID_IMAGE 400을 돌려준다", async () => {
  const missing = await uploadImage();
  const empty = await uploadImage(new NodeFile([], "a.jpg") as unknown as File);

  for (const response of [missing, empty]) {
    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({
      name: AUTH_ERROR_NAMES.invalidImage,
    });
  }
});
