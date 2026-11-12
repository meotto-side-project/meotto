import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";

import HomePage from "@/app/page";

test("홈 페이지가 main 영역을 렌더링한다", () => {
  render(<HomePage />);

  expect(screen.getByRole("main")).toBeInTheDocument();
});
