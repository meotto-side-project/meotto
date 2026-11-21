import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vitest";

import BottomTabBar from "@/components/ui/BottomTabBar/BottomTabBar";

test("활성 탭에만 aria-current를 붙인다", () => {
  render(<BottomTabBar activeTab="my" onSelect={vi.fn()} />);

  expect(screen.getByRole("button", { name: "My" })).toHaveAttribute(
    "aria-current",
    "page",
  );
  expect(screen.getByRole("button", { name: "Home" })).not.toHaveAttribute(
    "aria-current",
  );
  expect(screen.getByRole("button", { name: "Friend" })).not.toHaveAttribute(
    "aria-current",
  );
});

test("탭을 누르면 해당 id로 onSelect를 호출한다", async () => {
  const onSelect = vi.fn();
  render(<BottomTabBar activeTab="home" onSelect={onSelect} />);

  await userEvent.click(screen.getByRole("button", { name: "Friend" }));

  expect(onSelect).toHaveBeenCalledWith("friend");
});

test("Home, My, Friend 세 탭을 렌더링한다", () => {
  render(<BottomTabBar activeTab="home" onSelect={vi.fn()} />);

  expect(screen.getAllByRole("button")).toHaveLength(3);
});
