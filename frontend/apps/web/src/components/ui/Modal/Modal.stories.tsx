import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import Button from "../Button/Button";
import Modal from "./Modal";

const meta = {
  title: "ui/Modal",
  component: Modal,
} satisfies Meta<typeof Modal>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Confirm: Story = {
  args: {
    title: "회원탈퇴",
    description: "멋토 계정을 영구적으로 삭제하시겠습니까?",
    actions: (
      <>
        <Button variant="secondary" size="m">
          취소
        </Button>
        <Button variant="destructive" size="m">
          탈퇴하기
        </Button>
      </>
    ),
  },
};

export const Done: Story = {
  args: {
    title: "탈퇴 완료",
    description: "계정이 정상적으로 삭제되었습니다.",
    actions: (
      <Button variant="secondary" size="m">
        확인
      </Button>
    ),
  },
};
