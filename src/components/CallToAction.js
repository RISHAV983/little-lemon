import { Link } from "react-router-dom";

function CallToAction() {
  return (
    <section id="home" className="hero-section">
      <div className="hero-overlay" />
      <div className="hero-content site-container">
        <h1>Little Lemon</h1>
        <h2>Chicago</h2>
        <p>We are a family owned Mediterranean restaurant, focused<br className="desktop-break" /> on traditional recipes served with a modern twist.</p>
        <Link className="primary-button" to="/booking">Reserve a Table</Link>
        <div className="hero-dots" aria-hidden="true">
          <span className="active" />
          <span />
          <span />
          <span />
          <span />
        </div>
      </div>
    </section>
  );
}

export default CallToAction;
