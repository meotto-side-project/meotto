import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";

import Logo from "@/components/ui/Logo/Logo";

test("기본 접근 가능한 이름은 멋토다", () => {
  render(<Logo />);

  expect(screen.getByRole("img", { name: "멋토" })).toBeInTheDocument();
});

test("solid는 글자색(currentColor)을 따르고 title로 이름을 바꿀 수 있다", () => {
  render(<Logo title="Meotto" className="text-white" />);

  const logo = screen.getByRole("img", { name: "Meotto" });
  expect(logo).toHaveAttribute("fill", "currentColor");
  expect(logo).toHaveClass("text-white");
});

test("outline은 흰 채움 위에 검은 외곽선을 겹쳐 그린다", () => {
  render(<Logo variant="outline" />);

  const paths = screen
    .getByRole("img", { name: "멋토" })
    .querySelectorAll("path");
  expect(paths).toHaveLength(2);
  expect(paths[0]).toHaveClass("fill-black", "stroke-black");
  expect(paths[1]).toHaveClass("fill-white");
});
