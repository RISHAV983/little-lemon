import { useLayoutEffect, useRef } from "react";
import { getScrollBehavior } from "../utils/scrollBehavior";

// Placeholder copy from the design; replace with each customer's real review.
const placeholderReview =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.";

const testimonials = [
  {
    image: "/assets/testimonials/customer-1.png",
    food: "/assets/testimonials/dish-1.jpg",
    name: "Ronald Richards",
    email: "debra.holt@example.com",
    location: "Bridgeport",
    text: placeholderReview,
    rating: 5,
  },
  {
    image: "/assets/testimonials/customer-2.png",
    food: "/assets/testimonials/dish-2.jpg",
    name: "Ronald Richards",
    email: "debra.holt@example.com",
    location: "Jefferson Park",
    text: placeholderReview,
    rating: 4,
  },
  {
    image: "/assets/testimonials/customer-3.png",
    food: "/assets/testimonials/dish-3.jpg",
    name: "Ronald Richards",
    email: "debra.holt@example.com",
    location: "Lincoln Square",
    text: placeholderReview,
    rating: 4,
  },
];

function CustomersSay() {
  const viewportRef = useRef(null);
  const trackRef = useRef(null);
  // Becomes true once the person scrolls, so a resize never yanks them back.
  const userHasScrolled = useRef(false);
  const markUserScrolled = () => {
    userHasScrolled.current = true;
  };

  // Centre the middle card before the first paint (no flash) so a card peeks in
  // from each side, as in the design; keep it centred on resize until the person scrolls.
  useLayoutEffect(() => {
    const centreMiddleCard = () => {
      const viewport = viewportRef.current;
      const cards = trackRef.current ? trackRef.current.children : [];
      const middle = cards[Math.floor(cards.length / 2)];
      if (!viewport || !middle) return;

      const cardLeft =
        middle.getBoundingClientRect().left -
        viewport.getBoundingClientRect().left +
        viewport.scrollLeft;
      viewport.scrollLeft = cardLeft - (viewport.clientWidth - middle.offsetWidth) / 2;
    };

    const handleResize = () => {
      if (!userHasScrolled.current) centreMiddleCard();
    };

    centreMiddleCard();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const scrollTestimonials = (direction) => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track) return;

    markUserScrolled();
    const firstCard = track.children[0];
    const styles = window.getComputedStyle(track);
    const gap = Number.parseFloat(styles.columnGap || styles.gap) || 0;
    const step = firstCard ? firstCard.getBoundingClientRect().width + gap : viewport.clientWidth;

    viewport.scrollBy({ left: direction * step, behavior: getScrollBehavior() });
  };

  return (
    <section className="testimonials-section">
      <div className="site-container">
        <h2 className="section-title">What do our customers think?</h2>
      </div>
      {/* Full-bleed viewport (outside .site-container) so cards peek off both screen edges. */}
      <div
        className="testimonials-viewport"
        ref={viewportRef}
        role="region"
        aria-label="Customer testimonials"
        tabIndex={0}
        onWheel={markUserScrolled}
        onTouchStart={markUserScrolled}
        onPointerDown={markUserScrolled}
        onKeyDown={markUserScrolled}
      >
        <div className="testimonials-grid" ref={trackRef}>
          {testimonials.map((customer) => (
            <article className="testimonial-card" key={customer.location}>
              <div className="customer-info">
                <img src={customer.image} alt="" />
                <div>
                  <h3>{customer.name}</h3>
                  <p>{customer.email}</p>
                  <span>{customer.location}</span>
                </div>
              </div>
              <p className="testimonial-copy">{customer.text}</p>
              <div className="rating-row">
                <img src={customer.food} alt="" />
                <span role="img" aria-label={`${customer.rating} out of 5 stars`} className="stars">
                  {"★".repeat(customer.rating)}
                  {"☆".repeat(5 - customer.rating)}
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>
      <div className="site-container">
        <div className="carousel-controls">
          <button type="button" onClick={() => scrollTestimonials(-1)} aria-label="Previous testimonials">‹</button>
          <button type="button" onClick={() => scrollTestimonials(1)} aria-label="Next testimonials">›</button>
        </div>
      </div>
    </section>
  );
}

export default CustomersSay;
