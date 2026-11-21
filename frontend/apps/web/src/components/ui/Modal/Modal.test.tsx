import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";

import Button from "@/components/ui/Button/Button";
import Modal from "@/components/ui/Modal/Modal";

test("제목과 설명으로 이름 붙은 dialog를 렌더링한다", () => {
  render(
    <Modal
      title="회원탈퇴"
      description="멋토 계정을 영구적으로 삭제하시겠습니까?"
      actions={<Button size="m">취소</Button>}
    />,
  );

  const dialog = screen.getByRole("dialog", { name: "회원탈퇴" });
  expect(dialog).toHaveAccessibleDescription(
    "멋토 계정을 영구적으로 삭제하시겠습니까?",
  );
  expect(screen.getByRole("button", { name: "취소" })).toBeInTheDocument();
});

test("설명이 없으면 aria-describedby를 붙이지 않는다", () => {
  render(<Modal title="탈퇴 완료" actions={<Button size="m">확인</Button>} />);

  expect(screen.getByRole("dialog")).not.toHaveAttribute("aria-describedby");
});
