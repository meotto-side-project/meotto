import { render } from "@testing-library/react";
import { expect, test } from "vitest";

import BellIcon from "@/components/ui/Icon/BellIcon";
import EmojiIcon from "@/components/ui/Icon/EmojiIcon";
import HomeIcon from "@/components/ui/Icon/HomeIcon";

test("아이콘은 기본적으로 보조기기에서 숨긴다", () => {
  const { container } = render(<BellIcon />);

  expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
});

test("filled면 외곽선을 currentColor로 채운다", () => {
  const { container } = render(<HomeIcon filled />);

  expect(container.querySelector("path")).toHaveAttribute(
    "fill",
    "currentColor",
  );
});

test("filled가 아니면 채우지 않는다", () => {
  const { container } = render(<HomeIcon />);

  expect(container.querySelector("path")).toHaveAttribute("fill", "none");
});

test("filled 이모지는 눈과 입을 밝은 색으로 그린다", () => {
  const { container } = render(<EmojiIcon filled />);

  const paths = container.querySelectorAll("path");
  expect(paths[1]).toHaveAttribute("stroke", "var(--color-gray-50)");
});

test("aria-hidden을 props로 덮어쓸 수 있다", () => {
  const { container } = render(<BellIcon aria-hidden={false} />);

  expect(container.querySelector("svg")).toHaveAttribute(
    "aria-hidden",
    "false",
  );
});
