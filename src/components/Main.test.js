import "@testing-library/jest-dom";
import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import Main from "./Main";

const renderMain = (initialEntry) =>
  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Main />
    </MemoryRouter>
  );

// Fill the form (the date defaults to today) once the times have loaded.
const fillReservation = async () => {
  await screen.findByRole("option", { name: "18:30" });
  userEvent.type(screen.getByRole("textbox", { name: "Name" }), "John");
  userEvent.type(screen.getByRole("textbox", { name: "Last Name" }), "Doe");
  userEvent.selectOptions(screen.getByLabelText("Reservation time"), "18:30");
};

beforeEach(() => {
  window.fetchAPI = jest.fn(() => ["17:00", "18:30"]);
  window.submitAPI = jest.fn(() => true);
  window.scrollTo = jest.fn();
  window.HTMLElement.prototype.scrollIntoView = jest.fn();
});

describe("Scroll position on navigation", () => {
  test("submitting the form from the home page lands at the top of /confirmed", async () => {
    renderMain("/");
    await fillReservation();

    window.scrollTo.mockClear();
    userEvent.click(screen.getByRole("button", { name: "Reserve a Table" }));

    expect(
      await screen.findByRole("heading", { name: "Booking Confirmed!" })
    ).toBeInTheDocument();
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, left: 0, behavior: "instant" });
  });

  test("a #hash link scrolls to its section instead of the top", async () => {
    renderMain("/#specials");

    expect(window.scrollTo).not.toHaveBeenCalled();
    await screen.findByRole("heading", { name: /Specials/ });
    await new Promise((resolve) => requestAnimationFrame(resolve));
    expect(window.HTMLElement.prototype.scrollIntoView).toHaveBeenCalledWith(
      expect.objectContaining({ block: "start" })
    );
  });
});

describe("Booking confirmation", () => {
  test("a successful booking shows its details on /confirmed", async () => {
    renderMain("/booking");
    await fillReservation();

    userEvent.click(screen.getByRole("button", { name: "Reserve a Table" }));

    await screen.findByRole("heading", { name: "Booking Confirmed!" });
    expect(window.submitAPI).toHaveBeenCalledTimes(1);
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("18:30")).toBeInTheDocument();
    expect(screen.getByText("Birthday")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
  });

  test("renders the booking passed in router state", () => {
    renderMain({
      pathname: "/confirmed",
      state: {
        booking: {
          name: "Ada Lovelace",
          date: "2030-12-24",
          time: "19:00",
          guests: 6,
          occasion: "Anniversary",
        },
      },
    });

    expect(screen.getByRole("heading", { name: "Booking Confirmed!" })).toBeInTheDocument();
    expect(screen.getByText("Ada Lovelace")).toBeInTheDocument();
    expect(screen.getByText(/December 24, 2030/)).toBeInTheDocument();
    expect(screen.getByText("19:00")).toBeInTheDocument();
    expect(screen.getByText("6")).toBeInTheDocument();
    expect(screen.getByText("Anniversary")).toBeInTheDocument();
  });

  test("redirects /confirmed to /booking when opened without state", async () => {
    renderMain("/confirmed");

    expect(
      await screen.findByRole("heading", { name: "Reserve Your Table" })
    ).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Booking Confirmed!" })).not.toBeInTheDocument();
  });

  test("a failed submission stays on the form and shows an alert", async () => {
    window.submitAPI = jest.fn(() => false);
    renderMain("/booking");
    await fillReservation();

    userEvent.click(screen.getByRole("button", { name: "Reserve a Table" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "We could not submit your reservation. Please try again."
    );
    expect(screen.queryByRole("heading", { name: "Booking Confirmed!" })).not.toBeInTheDocument();
  });
});
