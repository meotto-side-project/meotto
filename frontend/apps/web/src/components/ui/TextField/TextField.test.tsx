import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vitest";

import TextField from "@/components/ui/TextField/TextField";

test("라벨과 입력창이 연결되고 필수 표시는 보조기기에 읽히지 않는다", () => {
  render(<TextField label="이름" required />);

  const input = screen.getByRole("textbox", { name: "이름" });
  expect(input).toBeRequired();
});

test("error가 있으면 aria-invalid와 설명으로 연결하고 테두리를 강조한다", () => {
  render(<TextField label="이름" error="잘못된 이름이에요." />);

  const input = screen.getByRole("textbox", { name: "이름" });
  expect(input).toHaveAttribute("aria-invalid", "true");
  expect(input).toHaveAccessibleDescription("잘못된 이름이에요.");
  expect(input).toHaveClass("border-danger");
});

test("error가 없으면 aria-invalid를 붙이지 않는다", () => {
  render(<TextField label="이름" />);

  expect(screen.getByRole("textbox", { name: "이름" })).not.toHaveAttribute(
    "aria-invalid",
  );
});

test("포커스 중에만 지우기 버튼을 보여주고 누르면 onClear를 호출한다", async () => {
  const onClear = vi.fn();
  render(<TextField label="이름" defaultValue="토마토" onClear={onClear} />);
  expect(
    screen.queryByRole("button", { name: "이름 지우기" }),
  ).not.toBeInTheDocument();

  await userEvent.click(screen.getByRole("textbox", { name: "이름" }));
  await userEvent.click(screen.getByRole("button", { name: "이름 지우기" }));

  expect(onClear).toHaveBeenCalledTimes(1);
  expect(screen.getByRole("textbox", { name: "이름" })).toHaveFocus();
});

test("onClear가 없으면 지우기 버튼이 없다", async () => {
  render(<TextField label="이름" />);

  await userEvent.click(screen.getByRole("textbox", { name: "이름" }));

  expect(screen.queryByRole("button")).not.toBeInTheDocument();
});

test("입력창 바깥으로 포커스가 나가면 지우기 버튼이 사라진다", async () => {
  render(
    <>
      <TextField label="이름" onClear={() => {}} />
      <button>다른 버튼</button>
    </>,
  );

  await userEvent.click(screen.getByRole("textbox", { name: "이름" }));
  await userEvent.click(screen.getByRole("button", { name: "다른 버튼" }));

  expect(
    screen.queryByRole("button", { name: "이름 지우기" }),
  ).not.toBeInTheDocument();
});
