import "@testing-library/jest-dom";
import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import BookingPage from "./BookingPage";

// The only date helper in this file. Deliberately NOT imported from production code,
// so "min equals today" is checked against an independent implementation.
const toDateString = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const availableTimes = ["17:00", "18:30", "20:00"];

const okResult = () => Promise.resolve({ ok: true });

// Times are loaded asynchronously: wait until the list is on screen.
const renderPage = async (submitForm = jest.fn(okResult)) => {
  render(<BookingPage submitForm={submitForm} />);
  await screen.findByRole("option", { name: availableTimes[0] });
  return submitForm;
};

const renderBookingPage = async (submitForm = jest.fn(okResult)) => {
  window.fetchAPI = jest.fn(() => availableTimes);
  return renderPage(submitForm);
};

describe("Booking API queries", () => {
  const originalFetchAPI = window.fetchAPI;

  beforeEach(() => {
    window.fetchAPI = jest.fn(() => availableTimes);
  });

  afterAll(() => {
    if (originalFetchAPI) {
      window.fetchAPI = originalFetchAPI;
    } else {
      delete window.fetchAPI;
    }
  });

  test("loads today's available times on first render", async () => {
    await renderPage();

    expect(window.fetchAPI).toHaveBeenCalledTimes(1);
    expect(window.fetchAPI.mock.calls[0][0]).toBeInstanceOf(Date);
    expect(toDateString(window.fetchAPI.mock.calls[0][0])).toBe(toDateString(new Date()));
  });

  test("loads the available times for the newly selected date", async () => {
    await renderPage();
    const selectedDate = new Date();
    selectedDate.setDate(selectedDate.getDate() + 3);

    fireEvent.change(screen.getByLabelText("Reservation date"), {
      target: { value: toDateString(selectedDate) },
    });

    await waitFor(() => expect(window.fetchAPI).toHaveBeenCalledTimes(2));
    expect(window.fetchAPI.mock.calls[1][0]).toEqual(
      new Date(`${toDateString(selectedDate)}T00:00:00`)
    );
    await screen.findByRole("option", { name: "17:00" });
  });
});

describe("Booking form HTML5 validation", () => {
  beforeEach(() => {
    window.fetchAPI = jest.fn(() => availableTimes);
  });

  test("applies required and text validation attributes to first name", async () => {
    await renderPage();
    const firstName = screen.getByRole("textbox", { name: "Name" });

    expect(firstName).toHaveAttribute("name", "firstName");
    expect(firstName).toHaveAttribute("type", "text");
    expect(firstName).toBeRequired();
  });

  test("applies required and text validation attributes to last name", async () => {
    await renderPage();
    const lastName = screen.getByRole("textbox", { name: "Last Name" });

    expect(lastName).toHaveAttribute("name", "lastName");
    expect(lastName).toHaveAttribute("type", "text");
    expect(lastName).toBeRequired();
  });

  test("applies required and minimum-date validation to date", async () => {
    await renderPage();
    const date = screen.getByLabelText("Reservation date");

    expect(date).toHaveAttribute("name", "date");
    expect(date).toHaveAttribute("type", "date");
    expect(date).toBeRequired();
    expect(date).toHaveAttribute("min", toDateString(new Date()));
  });

  test("applies required validation and renders available booking times", async () => {
    await renderPage();
    const time = screen.getByLabelText("Reservation time");

    expect(time).toHaveAttribute("name", "time");
    expect(time).toBeRequired();
    availableTimes.forEach((bookingTime) => {
      expect(screen.getByRole("option", { name: bookingTime })).toBeInTheDocument();
    });
  });

  test("applies required, minimum, and maximum validation to guest count", async () => {
    await renderPage();
    const guests = screen.getByRole("spinbutton", { name: "Number of Guest" });

    expect(guests).toHaveAttribute("name", "guests");
    expect(guests).toHaveAttribute("type", "number");
    expect(guests).toBeRequired();
    expect(guests).toHaveAttribute("min", "1");
    expect(guests).toHaveAttribute("max", "10");
  });

  test("applies required validation to occasion", async () => {
    await renderPage();
    const occasion = screen.getByRole("combobox", { name: "Occasion" });

    expect(occasion).toHaveAttribute("name", "occasion");
    expect(occasion).toBeRequired();
  });

  test("associates every reservation label with its form control", async () => {
    await renderPage();

    const expectedLabels = [
      ["Name", "firstName"],
      ["Last Name", "lastName"],
      ["Date", "date"],
      ["Time", "time"],
      ["Number of Guest", "guests"],
      ["Occasion", "occasion"],
    ];

    expectedLabels.forEach(([label, id]) => {
      const control = screen.getByLabelText(label);
      expect(control).toHaveAttribute("id", id);
      expect(document.querySelector(`label[for="${id}"]`)).toBeInTheDocument();
    });
  });
});

describe("Booking form React validation", () => {
  beforeEach(() => {
    window.fetchAPI = jest.fn(() => availableTimes);
  });

  test("keeps submission disabled when first name is empty", async () => {
    await renderBookingPage();
    const firstName = screen.getByRole("textbox", { name: "Name" });
    const submitButton = screen.getByRole("button", { name: "Reserve a Table" });

    fireEvent.change(firstName, { target: { value: "" } });

    expect(submitButton).toBeDisabled();
  });

  test("keeps submission disabled when last name is empty", async () => {
    await renderBookingPage();
    const lastName = screen.getByRole("textbox", { name: "Last Name" });
    const submitButton = screen.getByRole("button", { name: "Reserve a Table" });

    fireEvent.change(lastName, { target: { value: "" } });

    expect(submitButton).toBeDisabled();
  });

  test("keeps submission disabled when the date is empty", async () => {
    await renderBookingPage();
    const date = screen.getByLabelText("Reservation date");
    const submitButton = screen.getByRole("button", { name: "Reserve a Table" });

    fireEvent.change(date, { target: { value: "" } });

    expect(submitButton).toBeDisabled();
  });

  test("keeps submission disabled when the date is earlier than today", async () => {
    await renderBookingPage();
    const date = screen.getByLabelText("Reservation date");
    const submitButton = screen.getByRole("button", { name: "Reserve a Table" });

    fireEvent.change(date, { target: { value: "2020-01-01" } });

    expect(submitButton).toBeDisabled();
  });

  test("keeps submission disabled until an available time is selected", async () => {
    await renderBookingPage();
    const time = screen.getByLabelText("Reservation time");
    const submitButton = screen.getByRole("button", { name: "Reserve a Table" });

    expect(time).toHaveValue("");
    expect(submitButton).toBeDisabled();

    fireEvent.change(time, { target: { value: "19:00" } });

    expect(submitButton).toBeDisabled();
  });

  test("keeps submission disabled when guest count is below one", async () => {
    await renderBookingPage();
    const guests = screen.getByRole("spinbutton", { name: "Number of Guest" });
    const submitButton = screen.getByRole("button", { name: "Reserve a Table" });

    fireEvent.change(guests, { target: { value: "0" } });

    expect(submitButton).toBeDisabled();
  });

  test("keeps submission disabled when guest count is above ten", async () => {
    await renderBookingPage();
    const guests = screen.getByRole("spinbutton", { name: "Number of Guest" });
    const submitButton = screen.getByRole("button", { name: "Reserve a Table" });

    fireEvent.change(guests, { target: { value: "11" } });

    expect(submitButton).toBeDisabled();
  });

  test("keeps submission disabled when occasion is empty", async () => {
    await renderBookingPage();
    const occasion = screen.getByRole("combobox", { name: "Occasion" });
    const submitButton = screen.getByRole("button", { name: "Reserve a Table" });

    fireEvent.change(occasion, { target: { value: "" } });

    expect(submitButton).toBeDisabled();
  });

  test("enables submission for a complete valid reservation and calls submitForm", async () => {
    const submitForm = await renderBookingPage();
    const firstName = screen.getByRole("textbox", { name: "Name" });
    const lastName = screen.getByRole("textbox", { name: "Last Name" });
    const date = screen.getByLabelText("Reservation date");
    const time = screen.getByLabelText("Reservation time");
    const guests = screen.getByRole("spinbutton", { name: "Number of Guest" });
    const occasion = screen.getByRole("combobox", { name: "Occasion" });
    const submitButton = screen.getByRole("button", { name: "Reserve a Table" });

    userEvent.type(firstName, "John");
    userEvent.type(lastName, "Doe");
    fireEvent.change(date, { target: { value: toDateString(new Date()) } });
    userEvent.selectOptions(time, "18:30");
    fireEvent.change(guests, { target: { value: "4" } });
    userEvent.selectOptions(occasion, "Anniversary");

    expect(submitButton).toBeEnabled();

    userEvent.click(submitButton);

    expect(submitForm).toHaveBeenCalledTimes(1);
    // A plain booking object: the API layer decides the wire format.
    expect(submitForm.mock.calls[0][0]).toEqual({
      firstName: "John",
      lastName: "Doe",
      date: toDateString(new Date()),
      time: "18:30",
      guests: 4,
      occasion: "Anniversary",
    });

    // Let the (async) submit settle so no state update happens after the test.
    await screen.findByRole("button", { name: "Reserve a Table" });
  });

  test("does not call submitForm when invalid data is submitted", async () => {
    const submitForm = await renderBookingPage();
    const submitButton = screen.getByRole("button", { name: "Reserve a Table" });

    expect(submitButton).toBeDisabled();

    fireEvent.submit(subscreenForm());

    expect(submitForm).not.toHaveBeenCalled();
  });
});

function subscreenForm() {
  return screen.getByRole("button", { name: "Reserve a Table" }).closest("form");
}

const fillValidReservation = () => {
  userEvent.type(screen.getByRole("textbox", { name: "Name" }), "John");
  userEvent.type(screen.getByRole("textbox", { name: "Last Name" }), "Doe");
  userEvent.selectOptions(screen.getByLabelText("Reservation time"), "18:30");
};

describe("Booking form time handling", () => {
  test("resets a previously chosen time when the date changes to one that does not offer it", async () => {
    const today = new Date();
    const laterDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5);
    const laterDateString = toDateString(laterDate);

    window.fetchAPI = jest.fn((date) =>
      toDateString(date) === laterDateString ? ["21:00", "22:00"] : availableTimes
    );
    await renderPage();

    const time = screen.getByLabelText("Reservation time");
    const submitButton = screen.getByRole("button", { name: "Reserve a Table" });

    fillValidReservation();
    fireEvent.blur(time); // touched, and currently valid
    expect(time).toHaveValue("18:30");
    expect(submitButton).toBeEnabled();
    expect(time).not.toHaveAttribute("aria-invalid");

    fireEvent.change(screen.getByLabelText("Reservation date"), {
      target: { value: laterDateString },
    });

    // Stale options are dropped while the new date's times load.
    expect(screen.queryByRole("option", { name: "18:30" })).not.toBeInTheDocument();
    await screen.findByRole("option", { name: "21:00" });
    expect(time).toHaveValue("");
    expect(screen.getByRole("option", { name: "Select Time" }).selected).toBe(true);
    expect(submitButton).toBeDisabled();
    // The cleared time is not flagged as an error until the person revisits it.
    expect(time).not.toHaveAttribute("aria-invalid");

    // Going back to the first date must not silently bring the old "18:30" back
    // (a stale form.time would do exactly that, because the option exists again).
    fireEvent.change(screen.getByLabelText("Reservation date"), {
      target: { value: toDateString(today) },
    });
    expect(await screen.findByRole("option", { name: "18:30" })).toBeInTheDocument();
    expect(time).toHaveValue("");
    expect(submitButton).toBeDisabled();
  });

  test("clears the time even when the new date offers the same time slot", async () => {
    window.fetchAPI = jest.fn(() => availableTimes);
    await renderPage();

    fillValidReservation();
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    fireEvent.change(screen.getByLabelText("Reservation date"), {
      target: { value: toDateString(nextWeek) },
    });

    await screen.findByRole("option", { name: "17:00" });
    expect(screen.getByLabelText("Reservation time")).toHaveValue("");
    expect(screen.getByRole("button", { name: "Reserve a Table" })).toBeDisabled();
  });
});

describe("Booking form accessibility", () => {
  beforeEach(() => {
    window.fetchAPI = jest.fn(() => availableTimes);
  });

  test("points the submit button at the hint while invalid and drops it when valid", async () => {
    await renderPage();
    const submitButton = screen.getByRole("button", { name: "Reserve a Table" });

    const hintId = submitButton.getAttribute("aria-describedby");
    expect(hintId).toBeTruthy();
    expect(document.getElementById(hintId)).toHaveTextContent(
      "Complete all fields to enable booking"
    );

    fillValidReservation();

    expect(submitButton).toBeEnabled();
    expect(submitButton).not.toHaveAttribute("aria-describedby");
    expect(screen.queryByText("Complete all fields to enable booking")).not.toBeInTheDocument();
  });

  test("shows aria-invalid on a field only after it has been blurred", async () => {
    await renderPage();
    const firstName = screen.getByRole("textbox", { name: "Name" });

    expect(firstName).not.toHaveAttribute("aria-invalid");

    userEvent.click(firstName);
    expect(firstName).not.toHaveAttribute("aria-invalid"); // focused, not yet left

    userEvent.tab(); // leave the empty field
    expect(firstName).toHaveAttribute("aria-invalid", "true");

    userEvent.type(firstName, "John");
    expect(firstName).not.toHaveAttribute("aria-invalid");
  });
});

// ---------------------------------------------------------------------------
// Loading / empty / error states
// ---------------------------------------------------------------------------

// A fetchAPI whose results the test releases by hand.
const deferredFetchAPI = () => {
  const pending = [];
  window.fetchAPI = jest.fn(
    () => new Promise((resolve, reject) => pending.push({ resolve, reject }))
  );
  return pending;
};

describe("Available-times states", () => {
  test("disables the time select and shows a loading message while fetching", async () => {
    const pending = deferredFetchAPI();
    render(<BookingPage submitForm={jest.fn(okResult)} />);

    const time = screen.getByLabelText("Reservation time");
    expect(time).toBeDisabled();
    expect(screen.getByText("Loading available times…")).toBeInTheDocument();

    pending[0].resolve(availableTimes);

    expect(await screen.findByRole("option", { name: "17:00" })).toBeInTheDocument();
    expect(time).toBeEnabled();
    expect(screen.queryByText("Loading available times…")).not.toBeInTheDocument();
  });

  test("shows an empty-state message when no times are returned", async () => {
    window.fetchAPI = jest.fn(() => []);
    render(<BookingPage submitForm={jest.fn(okResult)} />);

    expect(
      await screen.findByText("No tables available on this date. Please choose another day.")
    ).toBeInTheDocument();
    expect(screen.queryByText("Loading available times…")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reserve a Table" })).toBeDisabled();
  });

  test("shows an error with a working Try again button when the lookup fails", async () => {
    window.fetchAPI = jest
      .fn()
      .mockImplementationOnce(() => {
        throw new Error("network down");
      })
      .mockImplementation(() => availableTimes);
    render(<BookingPage submitForm={jest.fn(okResult)} />);

    expect(
      await screen.findByText("We could not load available times. Please try again.")
    ).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: "17:00" })).not.toBeInTheDocument();

    userEvent.click(screen.getByRole("button", { name: "Try again" }));

    expect(await screen.findByRole("option", { name: "17:00" })).toBeInTheDocument();
    expect(window.fetchAPI).toHaveBeenCalledTimes(2);
    expect(screen.queryByText(/could not load available times/)).not.toBeInTheDocument();
  });

  test("treats a response that is not an array of strings as an error", async () => {
    window.fetchAPI = jest.fn(() => [17, 18]);
    render(<BookingPage submitForm={jest.fn(okResult)} />);

    expect(await screen.findByRole("button", { name: "Try again" })).toBeInTheDocument();
  });

  test("ignores a late response for a date that is no longer selected", async () => {
    const pending = deferredFetchAPI();
    render(<BookingPage submitForm={jest.fn(okResult)} />);

    const date = screen.getByLabelText("Reservation date");
    const later = (days) => {
      const value = new Date();
      value.setDate(value.getDate() + days);
      return toDateString(value);
    };
    fireEvent.change(date, { target: { value: later(1) } });
    fireEvent.change(date, { target: { value: later(2) } });
    await waitFor(() => expect(pending).toHaveLength(3));

    pending[2].resolve(["20:00"]); // newest request answers first
    expect(await screen.findByRole("option", { name: "20:00" })).toBeInTheDocument();

    pending[0].resolve(["17:00"]); // stale answers arrive late
    pending[1].resolve(["17:30"]);
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(screen.queryByRole("option", { name: "17:00" })).not.toBeInTheDocument();
    expect(screen.queryByRole("option", { name: "17:30" })).not.toBeInTheDocument();
    expect(screen.getByRole("option", { name: "20:00" })).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Submitting
// ---------------------------------------------------------------------------

describe("Submitting a reservation", () => {
  beforeEach(() => {
    window.fetchAPI = jest.fn(() => availableTimes);
  });

  test("shows the failure message in a role=alert element", async () => {
    const submitForm = jest.fn(() =>
      Promise.resolve({ ok: false, message: "That table was just taken." })
    );
    await renderPage(submitForm);
    fillValidReservation();

    userEvent.click(screen.getByRole("button", { name: "Reserve a Table" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("That table was just taken.");
    expect(screen.getByRole("button", { name: "Reserve a Table" })).toBeEnabled();
  });

  test("shows a friendly alert instead of crashing when submitForm throws", async () => {
    const submitForm = jest.fn(() => Promise.reject(new Error("boom")));
    await renderPage(submitForm);
    fillValidReservation();

    userEvent.click(screen.getByRole("button", { name: "Reserve a Table" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "We could not submit your reservation. Please try again."
    );
  });

  test("prevents double submits and shows Reserving… while in flight", async () => {
    let finish;
    const submitForm = jest.fn(
      () => new Promise((resolve) => { finish = resolve; })
    );
    await renderPage(submitForm);
    fillValidReservation();

    const form = subscreenForm();
    fireEvent.submit(form);
    fireEvent.submit(form); // second submit in the same tick

    expect(submitForm).toHaveBeenCalledTimes(1);
    const busyButton = screen.getByRole("button", { name: "Reserving…" });
    expect(busyButton).toBeDisabled();

    userEvent.click(busyButton);
    expect(submitForm).toHaveBeenCalledTimes(1);

    finish({ ok: true });
    expect(await screen.findByRole("button", { name: "Reserve a Table" })).toBeEnabled();
  });

  test("sends trimmed names and a numeric guest count", async () => {
    const submitForm = await renderPage();
    userEvent.type(screen.getByRole("textbox", { name: "Name" }), "  John  ");
    userEvent.type(screen.getByRole("textbox", { name: "Last Name" }), " Doe ");
    userEvent.selectOptions(screen.getByLabelText("Reservation time"), "20:00");

    userEvent.click(screen.getByRole("button", { name: "Reserve a Table" }));

    expect(submitForm).toHaveBeenCalledWith(
      expect.objectContaining({ firstName: "John", lastName: "Doe", guests: 4 })
    );
    await screen.findByRole("button", { name: "Reserve a Table" });
  });
});

// ---------------------------------------------------------------------------
// Invalid input
// ---------------------------------------------------------------------------

describe("Invalid input", () => {
  beforeEach(() => {
    window.fetchAPI = jest.fn(() => availableTimes);
  });

  test.each(["2.5", "1.0", "", "0", "11", "1e1"])(
    "rejects %p as a guest count",
    async (value) => {
      await renderPage();
      fillValidReservation();
      const guests = screen.getByRole("spinbutton", { name: "Number of Guest" });
      expect(screen.getByRole("button", { name: "Reserve a Table" })).toBeEnabled();

      fireEvent.change(guests, { target: { value } });
      fireEvent.blur(guests);

      expect(screen.getByRole("button", { name: "Reserve a Table" })).toBeDisabled();
      expect(guests).toHaveAttribute("aria-invalid", "true");
    }
  );

  test("accepts the boundary guest counts 1 and 10", async () => {
    await renderPage();
    fillValidReservation();
    const guests = screen.getByRole("spinbutton", { name: "Number of Guest" });

    ["1", "10"].forEach((value) => {
      fireEvent.change(guests, { target: { value } });
      expect(screen.getByRole("button", { name: "Reserve a Table" })).toBeEnabled();
    });
  });

  test("shows inline error text linked to the field with aria-describedby", async () => {
    await renderPage();
    const guests = screen.getByRole("spinbutton", { name: "Number of Guest" });

    expect(guests).not.toHaveAttribute("aria-describedby");

    fireEvent.change(guests, { target: { value: "2.5" } });
    fireEvent.blur(guests);

    const errorId = guests.getAttribute("aria-describedby");
    expect(errorId).toBeTruthy();
    expect(document.getElementById(errorId)).toHaveTextContent("Enter a whole number from 1 to 10.");
    expect(guests).toHaveAttribute("aria-invalid", "true");
  });

  test("rejects whitespace-only names and limits their length", async () => {
    await renderPage();
    fillValidReservation();
    const firstName = screen.getByRole("textbox", { name: "Name" });
    const lastName = screen.getByRole("textbox", { name: "Last Name" });

    expect(firstName).toHaveAttribute("maxlength", "50");
    expect(lastName).toHaveAttribute("maxlength", "50");

    fireEvent.change(firstName, { target: { value: "   " } });
    fireEvent.blur(firstName);

    expect(screen.getByRole("button", { name: "Reserve a Table" })).toBeDisabled();
    expect(document.getElementById(firstName.getAttribute("aria-describedby"))).toHaveTextContent(
      "Please enter your first name."
    );
  });

  test("keeps the accessible name of a field free of its error text", async () => {
    await renderPage();
    const firstName = screen.getByRole("textbox", { name: "Name" });

    fireEvent.blur(firstName);

    expect(firstName).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByRole("textbox", { name: "Name" })).toBe(firstName);
  });
});
