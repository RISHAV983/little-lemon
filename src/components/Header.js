import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Nav from "./Nav";

// Rendered twice (see Header): one copy per breakpoint, the unused one is display:none.
function LoginLink({ className, onClick }) {
  return (
    <Link className={`login-button ${className}`} to="/login" onClick={onClick}>
      Login
    </Link>
  );
}

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleRef = useRef(null);
  const navRef = useRef(null);
  const closeMenu = () => setMenuOpen(false);

  // While the mobile menu is open: Escape closes it and hands focus back to
  // the toggle button; a pointer press outside the menu/toggle closes it too.
  useEffect(() => {
    if (!menuOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        if (toggleRef.current) toggleRef.current.focus();
      }
    };

    const handlePointerDown = (event) => {
      const insideMenu = navRef.current && navRef.current.contains(event.target);
      const insideToggle =
        toggleRef.current && toggleRef.current.contains(event.target);
      if (!insideMenu && !insideToggle) setMenuOpen(false);
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [menuOpen]);

  return (
    <header className="site-header">
      <div className="site-container header-inner">
        <Link className="brand" to="/" onClick={closeMenu} aria-label="Little Lemon home">
          <img src="/assets/little-lemon-logo-horizontal.png" alt="Little Lemon" className="brand-logo" />
        </Link>

        {/* Mobile (<=900px) Login sits before the toggle; desktop Login sits after the nav.
            Each copy is display:none where it is not used, so tab order always matches
            the visual order and screen readers only ever meet one Login link. */}
        <LoginLink className="mobile-login-button" onClick={closeMenu} />

        <button
          ref={toggleRef}
          className="menu-toggle"
          type="button"
          aria-label="On Click"
          aria-expanded={menuOpen}
          aria-controls="primary-nav"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span />
          <span />
          <span />
        </button>

        <nav
          id="primary-nav"
          ref={navRef}
          className={`site-nav ${menuOpen ? "is-open" : ""}`}
          aria-label="Primary navigation"
        >
          <Nav closeMenu={closeMenu} />
        </nav>

        <LoginLink className="desktop-login-button" onClick={closeMenu} />
      </div>
    </header>
  );
}

export default Header;
