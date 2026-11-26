import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";

import Avatar from "@/components/ui/Avatar/Avatar";

test("src가 없으면 기본 아바타를 alt 이름의 이미지로 보여준다", () => {
  render(<Avatar alt="프로필 사진" />);

  expect(screen.getByRole("img", { name: "프로필 사진" }).tagName).toBe("svg");
});

test("src가 있으면 해당 사진을 보여준다", () => {
  render(<Avatar alt="프로필 사진" src="https://img.test/a.jpg" />);

  expect(screen.getByRole("img", { name: "프로필 사진" })).toHaveAttribute(
    "src",
    "https://img.test/a.jpg",
  );
});
