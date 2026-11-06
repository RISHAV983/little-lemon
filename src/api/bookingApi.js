/**
 * Booking API layer.
 *
 * Components talk to the back end ONLY through this module (never through
 * window.* directly). Today it wraps the mock in public/api.js; to switch to a
 * real REST API, replace the bodies of the two functions below and keep their
 * signatures and return shapes.
 *
 * Intended REST contract (not wired up yet):
 *
 *   GET  /api/availability?date=YYYY-MM-DD
 *        200 -> ["17:00", "17:30", ...]            (array of "HH:MM" strings)
 *
 *   POST /api/bookings
 *        body (JSON): { firstName, lastName, date, time, guests, occasion }
 *        201 -> { booking: { name, date, time, guests, occasion } }
 *        4xx -> { message: "Human-readable reason" }
 *
 * A real implementation would prefix those paths with API_BASE_URL below.
 *
 * SECURITY: REACT_APP_* variables are inlined into the public JavaScript bundle
 * at build time, so only non-secret values (like a public URL) may live there.
 * Never put API keys, tokens or passwords in frontend code; see the README.
 */

// Base URL of the real API (empty = same origin). Unused by the mock below.
export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "";

export const SUBMIT_FAILED_MESSAGE =
  "We could not submit your reservation. Please try again.";

// Returns window[name] or throws a clear error when public/api.js is not loaded.
const getWindowFunction = (name) => {
  if (typeof window === "undefined" || typeof window[name] !== "function") {
    throw new Error(
      `window.${name} is not available. Make sure public/api.js is loaded, ` +
        "or replace src/api/bookingApi.js with a real REST client."
    );
  }
  return window[name];
};

// Accepts "YYYY-MM-DD" (what <input type="date"> and the REST API use) or a Date.
// The mock needs a Date; local midnight keeps the calendar day unchanged.
const toDateObject = (date) => {
  const value =
    date instanceof Date
      ? date
      : /^\d{4}-\d{2}-\d{2}$/.test(String(date))
        ? new Date(`${date}T00:00:00`)
        : null;

  if (!value || Number.isNaN(value.getTime())) {
    throw new Error(`Invalid date for availability lookup: ${String(date)}`);
  }
  return value;
};

/**
 * Resolves to the available time slots for a date, e.g. ["17:00", "18:30"].
 * Rejects if the lookup fails or the response is not an array of strings.
 */
export async function getAvailableTimes(date) {
  const fetchAPI = getWindowFunction("fetchAPI");
  const times = await fetchAPI(toDateObject(date));

  if (!Array.isArray(times) || !times.every((time) => typeof time === "string")) {
    throw new Error("Unexpected availability response: expected an array of strings.");
  }
  return times;
}

/**
 * Submits a booking. Resolves to { ok: true, booking } or { ok: false, message }.
 * Throws only for programmer/configuration errors (bad argument, missing API).
 *
 * `data` is a plain object: { firstName, lastName, date, time, guests, occasion }.
 */
export async function submitBooking(data) {
  if (!data || typeof data !== "object") {
    throw new TypeError("submitBooking expects a booking object.");
  }
  const submitAPI = getWindowFunction("submitAPI");

  // The mock's submitAPI takes a FormData; a REST client would send JSON instead.
  const formData = new FormData();
  Object.entries(data).forEach(([field, value]) => formData.append(field, value));

  let accepted;
  try {
    accepted = await submitAPI(formData);
  } catch (error) {
    return { ok: false, message: SUBMIT_FAILED_MESSAGE };
  }

  if (!accepted) {
    return { ok: false, message: SUBMIT_FAILED_MESSAGE };
  }

  return {
    ok: true,
    booking: {
      name: `${data.firstName ?? ""} ${data.lastName ?? ""}`.trim(),
      date: data.date,
      time: data.time,
      guests: Number(data.guests),
      occasion: data.occasion,
    },
  };
}
