import { Navigate, useLocation } from "react-router-dom";

const BOOKING_FIELDS = ["name", "date", "time", "guests", "occasion"];

const isBooking = (booking) =>
  Boolean(booking) &&
  BOOKING_FIELDS.every(
    (field) => booking[field] !== undefined && booking[field] !== null && booking[field] !== ""
  );

// "2026-11-06" -> "Friday, November 6, 2026"; falls back to the raw value.
const formatDate = (dateString) => {
  const date = new Date(`${dateString}T00:00:00`);
  if (Number.isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

function ConfirmedBooking() {
  const { state } = useLocation();
  const booking = state && state.booking;

  // Opened directly (refresh, bookmark, typed URL): there is nothing to confirm.
  if (!isBooking(booking)) {
    return <Navigate to="/booking" replace />;
  }

  return (
    <section className="status-section" aria-labelledby="confirmed-booking-title">
      <div className="site-container status-inner">
        <h1 id="confirmed-booking-title">Booking Confirmed!</h1>
        <p>Your table has been successfully reserved. We look forward to welcoming you to Little Lemon.</p>
        <dl className="booking-details">
          <div>
            <dt>Name</dt>
            <dd>{booking.name}</dd>
          </div>
          <div>
            <dt>Date</dt>
            <dd>{formatDate(booking.date)}</dd>
          </div>
          <div>
            <dt>Time</dt>
            <dd>{booking.time}</dd>
          </div>
          <div>
            <dt>Guests</dt>
            <dd>{booking.guests}</dd>
          </div>
          <div>
            <dt>Occasion</dt>
            <dd>{booking.occasion}</dd>
          </div>
        </dl>
      </div>
    </section>
  );
}

export default ConfirmedBooking;
