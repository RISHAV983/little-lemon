import "@testing-library/jest-dom";
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import Header from "./Header";

describe("Header accessibility", () => {
  test("exposes navigation as a landmark and includes the required On Click ARIA label", () => {
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );

    expect(screen.getByRole("navigation", { name: "Primary navigation" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "On Click" })).toHaveAttribute(
      "aria-label",
      "On Click"
    );
  });
});

describe("Mobile menu behaviour", () => {
  const renderHeader = () =>
    render(
      <BrowserRouter>
        <Header />
        <button type="button">Outside</button>
      </BrowserRouter>
    );

  test("Escape closes the open menu and returns focus to the toggle", () => {
    renderHeader();
    const toggle = screen.getByRole("button", { name: "On Click" });

    userEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");

    // Focus is inside the menu when Escape is pressed.
    screen.getByRole("link", { name: "About" }).focus();
    fireEvent.keyDown(document.activeElement, { key: "Escape" });

    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(toggle).toHaveFocus();
  });

  test("clicking outside the menu closes it", () => {
    renderHeader();
    const toggle = screen.getByRole("button", { name: "On Click" });

    userEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");

    fireEvent.pointerDown(screen.getByRole("button", { name: "Outside" }));

    expect(toggle).toHaveAttribute("aria-expanded", "false");
  });

  test("pressing inside the menu does not close it, and Escape does nothing when it is closed", () => {
    renderHeader();
    const toggle = screen.getByRole("button", { name: "On Click" });

    userEvent.click(toggle);
    fireEvent.pointerDown(screen.getByRole("navigation", { name: "Primary navigation" }));
    expect(toggle).toHaveAttribute("aria-expanded", "true");

    userEvent.click(toggle); // close
    screen.getByRole("button", { name: "Outside" }).focus();
    fireEvent.keyDown(document.body, { key: "Escape" });
    expect(screen.getByRole("button", { name: "Outside" })).toHaveFocus();
  });
});
