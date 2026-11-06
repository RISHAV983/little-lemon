import "@testing-library/jest-dom";
import { getScrollBehavior } from "./scrollBehavior";

describe("getScrollBehavior", () => {
  const originalMatchMedia = window.matchMedia;
  afterEach(() => {
    window.matchMedia = originalMatchMedia;
  });

  test("is smooth by default and auto when reduced motion is requested", () => {
    window.matchMedia = jest.fn(() => ({ matches: false }));
    expect(getScrollBehavior()).toBe("smooth");

    window.matchMedia = jest.fn(() => ({ matches: true }));
    expect(getScrollBehavior()).toBe("auto");
    expect(window.matchMedia).toHaveBeenCalledWith("(prefers-reduced-motion: reduce)");
  });

  test("falls back to smooth where matchMedia does not exist", () => {
    window.matchMedia = undefined;
    expect(getScrollBehavior()).toBe("smooth");
  });
});
