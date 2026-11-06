import { useEffect, useRef, useState } from "react";
import { getAvailableTimes } from "../api/bookingApi";
import { toDateString } from "../utils/dates";

const NAME_MAX_LENGTH = 50;
const MIN_GUESTS = 1;
const MAX_GUESTS = 10;

const SUBMIT_ERROR_FALLBACK =
  "We could not submit your reservation. Please try again.";

const initialForm = {
  firstName: "",
  lastName: "",
  date: "",
  time: "",
  guests: "4",
  occasion: "Birthday",
};

const LOADING = { status: "loading", times: [] };
const NO_DATE = { status: "ready", times: [] };
const FAILED = { status: "error", times: [] };

const getToday = () => toDateString(new Date());

// One error message per field ("" = valid). Single source of truth for both
// the submit button state and the inline error text.
const getFieldErrors = (form, availableTimes, today) => {
  const firstName = form.firstName.trim();
  const lastName = form.lastName.trim();
  const guests = form.guests.trim();
  const guestCount = Number(guests);
  const nameError = (value, label) => {
    if (value === "") return `Please enter your ${label}.`;
    if (value.length > NAME_MAX_LENGTH) {
      return `Please use ${NAME_MAX_LENGTH} characters or fewer.`;
    }
    return "";
  };

  let dateError = "";
  if (form.date === "") dateError = "Please choose a date.";
  else if (form.date < today) dateError = "Please choose today or a later date.";

  // Digits only (rejects "2.5", "1e1", "-3", ""), then the 1-10 range.
  const guestsValid =
    /^\d+$/.test(guests) &&
    Number.isInteger(guestCount) &&
    guestCount >= MIN_GUESTS &&
    guestCount <= MAX_GUESTS;

  return {
    firstName: nameError(firstName, "first name"),
    lastName: nameError(lastName, "last name"),
    date: dateError,
    time:
      form.time !== "" && availableTimes.includes(form.time)
        ? ""
        : "Please select an available time.",
    guests: guestsValid
      ? ""
      : `Enter a whole number from ${MIN_GUESTS} to ${MAX_GUESTS}.`,
    occasion: form.occasion !== "" ? "" : "Please choose an occasion.",
  };
};

// Label + visible caption + control, plus an optional note/error below.
// The note sits outside the <label> so it never becomes part of the control's
// accessible name.
function Field({ id, label, note, children }) {
  return (
    <div className="field">
      <label htmlFor={id}>
        <span>{label}</span>
        {children}
      </label>
      {note}
    </div>
  );
}

function BookingPage({ submitForm }) {
  const [form, setForm] = useState({ ...initialForm, date: getToday() });
  const [timesState, setTimesState] = useState(LOADING);
  const [reloadCount, setReloadCount] = useState(0);
  const [message, setMessage] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState({});
  // A ref, not state: two submits in the same tick (double click, Enter + click)
  // both see the same stale render, but they share this ref.
  const submittingRef = useRef(false);

  const { status, times: availableTimes } = timesState;
  const isLoadingTimes = status === "loading";

  // Load the times for the selected date. The cleanup flag makes responses from
  // an earlier date (or an earlier "Try again") harmless if they arrive late.
  useEffect(() => {
    if (form.date === "") {
      setTimesState(NO_DATE);
      return undefined;
    }

    let cancelled = false;
    // Drop the previous list right away so stale options can't be picked.
    setTimesState((current) =>
      current.status === "loading" && current.times.length === 0 ? current : LOADING
    );

    const load = async () => {
      try {
        const times = await getAvailableTimes(form.date);
        if (!cancelled) setTimesState({ status: "ready", times });
      } catch (error) {
        if (!cancelled) setTimesState(FAILED);
      }
    };
    load();

    return () => {
      cancelled = true;
    };
  }, [form.date, reloadCount]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    const isDateChange = name === "date";

    // A new date brings a new list of times, so a previously chosen time is
    // stale: clear it in the same update that stores the date.
    setForm((current) => ({
      ...current,
      [name]: value,
      ...(isDateChange ? { time: "" } : null),
    }));
    setMessage("");
    setSubmitError("");

    if (isDateChange) {
      // The cleared time must not show as invalid until the person revisits it.
      setTouched((current) => ({ ...current, time: false }));
    }
  };

  const errors = getFieldErrors(form, availableTimes, getToday());
  const isFormValid = Object.values(errors).every((error) => error === "");

  // Mark a field as "touched" once the person leaves it, so errors only appear
  // after they have had a chance to fill it in.
  const handleBlur = (event) => {
    const { name } = event.target;
    setTouched((current) => ({ ...current, [name]: true }));
  };

  const showError = (name) => Boolean(touched[name] && errors[name]);

  const controlProps = (name, describedBy) => ({
    onBlur: handleBlur,
    "aria-invalid": showError(name) ? "true" : undefined,
    "aria-describedby": describedBy || (showError(name) ? `${name}-error` : undefined),
  });

  const errorNote = (name) =>
    showError(name) ? (
      <p id={`${name}-error`} className="field-error">
        {errors[name]}
      </p>
    ) : null;

  // The time field also reports loading / empty / lookup-failed states.
  let timeNote = null;
  if (isLoadingTimes) {
    timeNote = (
      <p className="field-note" role="status">
        Loading available times…
      </p>
    );
  } else if (status === "error") {
    timeNote = (
      <div className="field-note field-error">
        <p>We could not load available times. Please try again.</p>
        <button
          type="button"
          className="field-retry"
          onClick={() => setReloadCount((count) => count + 1)}
        >
          Try again
        </button>
      </div>
    );
  } else if (form.date !== "" && availableTimes.length === 0) {
    timeNote = (
      <p className="field-note" role="status">
        No tables available on this date. Please choose another day.
      </p>
    );
  } else if (showError("time")) {
    timeNote = <p className="field-error">{errors.time}</p>;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (submittingRef.current) return;

    // The submit button is disabled while the form is invalid, so this guard
    // only matters for implicit submits (e.g. Enter key) that bypass it.
    if (!isFormValid) {
      setTouched(
        Object.fromEntries(Object.keys(errors).map((field) => [field, true]))
      );
      setMessage("Please complete the form with valid information.");
      return;
    }

    submittingRef.current = true;
    setIsSubmitting(true);
    setMessage("");
    setSubmitError("");

    try {
      const result = await submitForm({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        date: form.date,
        time: form.time,
        guests: Number(form.guests),
        occasion: form.occasion,
      });

      // On success the parent navigates away; only failures are shown here.
      if (!result || result.ok !== true) {
        setSubmitError((result && result.message) || SUBMIT_ERROR_FALLBACK);
      }
    } catch (error) {
      setSubmitError(SUBMIT_ERROR_FALLBACK);
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  return (
    <section id="reservation" className="reservation-section">
      <div className="reservation-overlay" />
      <div className="site-container reservation-inner">
        <h2>Reserve Your Table</h2>
        <p>Book a table in advance to enjoy your time with Friends and Family</p>
        <form className="reservation-form" onSubmit={handleSubmit}>
          <Field id="firstName" label="Name" note={errorNote("firstName")}>
            <input
              id="firstName"
              name="firstName"
              type="text"
              value={form.firstName}
              onChange={handleChange}
              placeholder="John"
              maxLength={NAME_MAX_LENGTH}
              required
              {...controlProps("firstName")}
            />
          </Field>
          <Field id="lastName" label="Last Name" note={errorNote("lastName")}>
            <input
              id="lastName"
              name="lastName"
              type="text"
              value={form.lastName}
              onChange={handleChange}
              placeholder="Doe"
              maxLength={NAME_MAX_LENGTH}
              required
              {...controlProps("lastName")}
            />
          </Field>
          <Field id="date" label="Date" note={errorNote("date")}>
            <input
              id="date"
              type="date"
              name="date"
              value={form.date}
              min={getToday()}
              onChange={handleChange}
              aria-label="Reservation date"
              required
              {...controlProps("date")}
            />
          </Field>
          <Field
            id="time"
            label="Time"
            note={timeNote && <div id="time-note">{timeNote}</div>}
          >
            <select
              id="time"
              name="time"
              value={form.time}
              onChange={handleChange}
              aria-label="Reservation time"
              aria-busy={isLoadingTimes ? "true" : undefined}
              disabled={isLoadingTimes}
              required
              {...controlProps("time", timeNote ? "time-note" : undefined)}
            >
              <option value="">Select Time</option>
              {availableTimes.map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>
          </Field>
          <Field id="guests" label="Number of Guest" note={errorNote("guests")}>
            <input
              id="guests"
              type="number"
              name="guests"
              min={MIN_GUESTS}
              max={MAX_GUESTS}
              step="1"
              value={form.guests}
              onChange={handleChange}
              required
              {...controlProps("guests")}
            />
          </Field>
          <Field id="occasion" label="Occasion" note={errorNote("occasion")}>
            <select
              id="occasion"
              name="occasion"
              value={form.occasion}
              onChange={handleChange}
              required
              {...controlProps("occasion")}
            >
              <option>Birthday</option>
              <option>Anniversary</option>
              <option>Date Night</option>
              <option>Business</option>
              <option>Other</option>
            </select>
          </Field>
          <button
            className="primary-button reservation-submit"
            type="submit"
            disabled={!isFormValid || isSubmitting}
            aria-describedby={isFormValid ? undefined : "reservation-hint"}
          >
            {isSubmitting ? "Reserving…" : "Reserve a Table"}
          </button>
        </form>
        {!isFormValid && (
          <p id="reservation-hint" className="form-hint">
            Complete all fields to enable booking
          </p>
        )}
        {message && <p className="form-message" role="status">{message}</p>}
        {submitError && <p className="form-message" role="alert">{submitError}</p>}
      </div>
    </section>
  );
}

export default BookingPage;
