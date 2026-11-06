import { Link } from "react-router-dom";
import { siteLinks } from "../data/siteLinks";

// NOTE: these point at each platform's home page because the real Little Lemon
// profile URLs are not known yet. Swap in the actual handles when they exist.
// Array order = order of the icon row. Entries with showInColumn also appear as
// text links in the "Socials" column, sorted by columnOrder (Facebook, Twitter, Instagram).
const socialLinks = [
  { name: "Facebook", href: "https://www.facebook.com/", icon: "/assets/facebook.png", showInColumn: true, columnOrder: 1 },
  { name: "Instagram", href: "https://www.instagram.com/", icon: "/assets/instagram.png", showInColumn: true, columnOrder: 3 },
  { name: "Twitter", href: "https://twitter.com/", icon: "/assets/twitter.png", showInColumn: true, columnOrder: 2 },
  { name: "YouTube", href: "https://www.youtube.com/", icon: "/assets/youtube.png", showInColumn: false },
  { name: "Pinterest", href: "https://www.pinterest.com/", icon: "/assets/pinterest.png", showInColumn: false },
];

const columnLinks = socialLinks
  .filter((social) => social.showInColumn)
  .sort((a, b) => a.columnOrder - b.columnOrder);

const NEW_TAB = " (opens in a new tab)";

function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-container footer-grid">
        <div className="footer-brand">
          <img className="footer-logo" src="/assets/little-lemon-logo-stacked.png" alt="Little Lemon" />
        </div>
        <nav aria-label="Footer navigation">
          <h3>Navigation</h3>
          {siteLinks.map(({ label, footerLabel, to }) => (
            <Link key={label} to={to}>{footerLabel || label}</Link>
          ))}
          <Link to="/login">Login</Link>
        </nav>
        <section aria-labelledby="footer-contact-heading">
          <h3 id="footer-contact-heading">Contact</h3>
          <p>69 Vicon Araratiano</p>
          <a href="tel:+17098794459">(709)879-4459</a>
          {/* Placeholder address until the restaurant's real inbox is known. */}
          <a href="mailto:hello@littlelemon.example">Email Us</a>
        </section>
        <section aria-labelledby="footer-socials-heading">
          <h3 id="footer-socials-heading">Socials</h3>
          {columnLinks.map((social) => (
            <a key={social.name} href={social.href} target="_blank" rel="noopener noreferrer">
              {social.name}
              <span className="sr-only">{NEW_TAB}</span>
            </a>
          ))}
        </section>
      </div>
      <div className="site-container footer-bottom">
        <span>2026© Little Lemon</span>
        <ul className="footer-social-links" aria-label="Social media">
          {socialLinks.map((social) => (
            <li key={social.name}>
              <a
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Little Lemon on ${social.name}${NEW_TAB}`}
              >
                <img src={social.icon} alt="" />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}

export default Footer;
