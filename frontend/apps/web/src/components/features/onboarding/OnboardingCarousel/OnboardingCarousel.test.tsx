import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, expect, it, vi } from "vitest";

import OnboardingCarousel from "@/components/features/onboarding/OnboardingCarousel/OnboardingCarousel";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

beforeEach(() => {
  push.mockClear();
});

it("첫 장은 첫 번째 카피와 다음 버튼을 보여 준다", () => {
  render(<OnboardingCarousel />);

  expect(
    screen.getByRole("region", { name: "3장 중 1번째" }),
  ).toBeInTheDocument();
  expect(screen.getByRole("heading")).toHaveTextContent(
    "친구의 멋을 발견해봐요!",
  );
  expect(screen.getByRole("button", { name: "다음" })).toBeInTheDocument();
  expect(
    screen.queryByRole("button", { name: "멋토 시작하기" }),
  ).not.toBeInTheDocument();
});

it("다음을 누르면 두 번째 장으로 넘어가고 아직 이동하지 않는다", async () => {
  const user = userEvent.setup();
  render(<OnboardingCarousel />);

  await user.click(screen.getByRole("button", { name: "다음" }));

  expect(
    screen.getByRole("region", { name: "3장 중 2번째" }),
  ).toBeInTheDocument();
  expect(screen.getByRole("heading")).toHaveTextContent(
    "토마토 도장에 마음을 담아",
  );
  expect(
    screen.queryByRole("button", { name: "멋토 시작하기" }),
  ).not.toBeInTheDocument();
  expect(push).not.toHaveBeenCalled();
});

it("장이 바뀌면 새 카피가 보조기기에 알림 영역으로 전달된다", async () => {
  const user = userEvent.setup();
  render(<OnboardingCarousel />);

  await user.click(screen.getByRole("button", { name: "다음" }));

  expect(screen.getByRole("status")).toHaveTextContent(
    "토마토 도장에 마음을 담아",
  );
  expect(screen.getByRole("status")).toHaveTextContent(
    "평소 말로는 전하기 쑥스러웠던 마음을",
  );
});

it("마지막 장에서만 멋토 시작하기가 보이고, 누르면 로그인 화면으로 이동한다", async () => {
  const user = userEvent.setup();
  render(<OnboardingCarousel />);

  await user.click(screen.getByRole("button", { name: "다음" }));
  await user.click(screen.getByRole("button", { name: "다음" }));

  expect(
    screen.getByRole("region", { name: "3장 중 3번째" }),
  ).toBeInTheDocument();
  expect(screen.getByRole("heading")).toHaveTextContent(
    "받은 토마토를 차곡차곡 모아요!",
  );
  expect(
    screen.queryByRole("button", { name: "다음" }),
  ).not.toBeInTheDocument();

  await user.click(screen.getByRole("button", { name: "멋토 시작하기" }));

  expect(push).toHaveBeenCalledExactlyOnceWith("/login");
});
