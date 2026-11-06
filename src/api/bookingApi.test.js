import { getAvailableTimes, submitBooking } from "./bookingApi";

const booking = {
  firstName: "John",
  lastName: "Doe",
  date: "2030-05-17",
  time: "18:30",
  guests: 4,
  occasion: "Birthday",
};

describe("getAvailableTimes", () => {
  const original = window.fetchAPI;
  afterEach(() => {
    window.fetchAPI = original;
  });

  test("wraps window.fetchAPI in a Promise and passes a Date for the day", async () => {
    window.fetchAPI = jest.fn(() => ["17:00", "18:30"]);

    const promise = getAvailableTimes("2030-05-17");

    expect(promise).toBeInstanceOf(Promise);
    await expect(promise).resolves.toEqual(["17:00", "18:30"]);
    expect(window.fetchAPI).toHaveBeenCalledWith(new Date("2030-05-17T00:00:00"));
  });

  test("accepts a Date and an empty result", async () => {
    window.fetchAPI = jest.fn(() => []);

    await expect(getAvailableTimes(new Date(2030, 4, 17))).resolves.toEqual([]);
  });

  test.each([[undefined], [null], ["nope"], [{}], [[17, 18]], [["17:00", null]]])(
    "rejects a non-string-array response (%p)",
    async (response) => {
      window.fetchAPI = jest.fn(() => response);

      await expect(getAvailableTimes("2030-05-17")).rejects.toThrow(/array of strings/);
    }
  );

  test("rejects an invalid date", async () => {
    window.fetchAPI = jest.fn(() => []);

    await expect(getAvailableTimes("17/05/2030")).rejects.toThrow(/Invalid date/);
    expect(window.fetchAPI).not.toHaveBeenCalled();
  });

  test("throws a clear error when window.fetchAPI is missing", async () => {
    delete window.fetchAPI;

    await expect(getAvailableTimes("2030-05-17")).rejects.toThrow(/window\.fetchAPI is not available/);
  });

  test("propagates errors thrown by the underlying call", async () => {
    window.fetchAPI = jest.fn(() => {
      throw new Error("network down");
    });

    await expect(getAvailableTimes("2030-05-17")).rejects.toThrow("network down");
  });
});

describe("submitBooking", () => {
  const original = window.submitAPI;
  afterEach(() => {
    window.submitAPI = original;
  });

  test("resolves { ok: true, booking } and sends a FormData to the mock", async () => {
    window.submitAPI = jest.fn(() => true);

    const result = await submitBooking(booking);

    expect(result).toEqual({
      ok: true,
      booking: {
        name: "John Doe",
        date: "2030-05-17",
        time: "18:30",
        guests: 4,
        occasion: "Birthday",
      },
    });
    const sent = window.submitAPI.mock.calls[0][0];
    expect(sent).toBeInstanceOf(FormData);
    expect(sent.get("firstName")).toBe("John");
    expect(sent.get("time")).toBe("18:30");
  });

  test("resolves { ok: false, message } when the API rejects the booking", async () => {
    window.submitAPI = jest.fn(() => false);

    const result = await submitBooking(booking);

    expect(result.ok).toBe(false);
    expect(result.message).toEqual(expect.any(String));
    expect(result.booking).toBeUndefined();
  });

  test("resolves { ok: false, message } when the underlying call throws", async () => {
    window.submitAPI = jest.fn(() => {
      throw new Error("network down");
    });

    await expect(submitBooking(booking)).resolves.toEqual({
      ok: false,
      message: expect.any(String),
    });
  });

  test("throws a clear error when window.submitAPI is missing", async () => {
    delete window.submitAPI;

    await expect(submitBooking(booking)).rejects.toThrow(/window\.submitAPI is not available/);
  });

  test("throws a TypeError for a missing booking object", async () => {
    window.submitAPI = jest.fn(() => true);

    await expect(submitBooking()).rejects.toThrow(TypeError);
    expect(window.submitAPI).not.toHaveBeenCalled();
  });
});
