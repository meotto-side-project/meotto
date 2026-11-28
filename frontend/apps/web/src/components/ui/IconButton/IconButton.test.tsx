import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vitest";

import IconButton from "@/components/ui/IconButton/IconButton";

test("label을 접근 가능한 이름으로 쓰고 기본 type은 button이다", () => {
  render(<IconButton label="뒤로가기" />);

  expect(screen.getByRole("button", { name: "뒤로가기" })).toHaveAttribute(
    "type",
    "button",
  );
});

test("클릭하면 onClick을 호출한다", async () => {
  const onClick = vi.fn();
  render(<IconButton label="뒤로가기" onClick={onClick} />);

  await userEvent.click(screen.getByRole("button", { name: "뒤로가기" }));

  expect(onClick).toHaveBeenCalledTimes(1);
});

test("variant에 맞는 토큰 클래스를 붙인다", () => {
  render(<IconButton label="변경" variant="dark" />);

  expect(screen.getByRole("button", { name: "변경" })).toHaveClass(
    "bg-gray-800",
  );
});
