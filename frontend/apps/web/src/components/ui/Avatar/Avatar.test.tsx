import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";

import Avatar from "@/components/ui/Avatar/Avatar";

test("src가 없으면 기본 아바타를 alt 이름의 이미지로 보여준다", () => {
  render(<Avatar alt="프로필 사진" />);

  expect(screen.getByRole("img", { name: "프로필 사진" }).tagName).toBe("svg");
});

test("기본 아바타는 Figma 좌표의 머리와 몸통 path 두 개로 그려진다", () => {
  render(<Avatar alt="프로필 사진" />);

  const paths = screen
    .getByRole("img", { name: "프로필 사진" })
    .querySelectorAll("path");

  expect(paths).toHaveLength(2);
  expect(paths[0].getAttribute("d")).toMatch(/^M53\.8541 72\.2333L/);
  expect(paths[1].getAttribute("d")).toMatch(/^M149\.032 156\.782L/);
  expect(paths[1].getAttribute("d")).toContain("L74.9957 93.6677L");
});

test("src가 있으면 해당 사진을 보여준다", () => {
  render(<Avatar alt="프로필 사진" src="https://img.test/a.jpg" />);

  expect(screen.getByRole("img", { name: "프로필 사진" })).toHaveAttribute(
    "src",
    "https://img.test/a.jpg",
  );
});
