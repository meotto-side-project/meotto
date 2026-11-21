import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vitest";

import Button from "@/components/ui/Button/Button";

test("기본 type은 button이라 폼을 제출하지 않는다", () => {
  render(<Button>확인</Button>);

  expect(screen.getByRole("button", { name: "확인" })).toHaveAttribute(
    "type",
    "button",
  );
});

test("클릭하면 onClick을 호출한다", async () => {
  const onClick = vi.fn();
  render(<Button onClick={onClick}>확인</Button>);

  await userEvent.click(screen.getByRole("button", { name: "확인" }));

  expect(onClick).toHaveBeenCalledTimes(1);
});

test("disabled면 클릭해도 onClick을 호출하지 않는다", async () => {
  const onClick = vi.fn();
  render(
    <Button disabled onClick={onClick}>
      확인
    </Button>,
  );

  await userEvent.click(screen.getByRole("button", { name: "확인" }));

  expect(onClick).not.toHaveBeenCalled();
});

test("variant와 size에 맞는 토큰 클래스를 붙인다", () => {
  render(
    <Button variant="destructive" size="m">
      탈퇴하기
    </Button>,
  );

  const button = screen.getByRole("button", { name: "탈퇴하기" });
  expect(button).toHaveClass("text-danger", "h-15.5");
});
