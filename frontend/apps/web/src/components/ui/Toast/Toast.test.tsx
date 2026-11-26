import { act, render, renderHook, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";

import Toast from "@/components/ui/Toast/Toast";
import { useToast } from "@/components/ui/Toast/useToast";

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

test("message가 있으면 status 영역에 보여준다", () => {
  render(<Toast message="잠시 후 다시 시도해 주세요." />);

  expect(screen.getByRole("status")).toHaveTextContent(
    "잠시 후 다시 시도해 주세요.",
  );
});

test("message가 null이면 status 영역만 있고 비어 있다", () => {
  render(<Toast message={null} />);

  expect(screen.getByRole("status")).toBeEmptyDOMElement();
});

test("useToast는 3초 뒤에 메시지를 지운다", () => {
  const { result } = renderHook(() => useToast());

  act(() => result.current.showToast("안내"));
  expect(result.current.message).toBe("안내");

  act(() => {
    vi.advanceTimersByTime(2999);
  });
  expect(result.current.message).toBe("안내");

  act(() => {
    vi.advanceTimersByTime(1);
  });
  expect(result.current.message).toBeNull();
});

test("useToast를 다시 호출하면 노출 시간이 새로 시작된다", () => {
  const { result } = renderHook(() => useToast());

  act(() => result.current.showToast("첫 번째"));
  act(() => {
    vi.advanceTimersByTime(2000);
  });
  act(() => result.current.showToast("두 번째"));
  act(() => {
    vi.advanceTimersByTime(2000);
  });

  expect(result.current.message).toBe("두 번째");
});
