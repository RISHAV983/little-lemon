import { useEffect } from "react";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import HomePage from "./HomePage";
import BookingPage from "./BookingPage";
import ConfirmedBooking from "./ConfirmedBooking";
import LoginPlaceholder from "./LoginPlaceholder";
import { submitBooking } from "../api/bookingApi";

function Main() {
  const navigate = useNavigate();
  const { pathname, hash } = useLocation();

  // New page => start at the top (e.g. after submitting the form from far down the
  // home page). Links with a #hash are left alone: HomePage scrolls to that section.
  // "instant" is deliberate: a page change should never animate, for anyone, and
  // unlike "auto" it cannot be turned into a smooth scroll by CSS.
  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
  }, [pathname, hash]);

  // Resolves to { ok, booking | message } (see bookingApi.submitBooking). On
  // success the booking travels to /confirmed in router state; BookingPage
  // shows the message on failure and catches anything this throws.
  const submitForm = async (data) => {
    const result = await submitBooking(data);

    if (result.ok) {
      navigate("/confirmed", { state: { booking: result.booking } });
    }

    return result;
  };

  // One <main> for every route so the skip link always has a target.
  return (
    <main id="main" tabIndex={-1}>
      <Routes>
        <Route path="/" element={<HomePage submitForm={submitForm} />} />
        <Route
          path="/booking"
          element={<BookingPage submitForm={submitForm} />}
        />
        <Route path="/confirmed" element={<ConfirmedBooking />} />
        <Route path="/login" element={<LoginPlaceholder />} />
      </Routes>
    </main>
  );
}

export default Main;
