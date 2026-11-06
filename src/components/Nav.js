import { Link } from "react-router-dom";
import { siteLinks } from "../data/siteLinks";

// Login lives in Header.js so it can sit at the far right of the desktop
// header, outside the centred link group.
function Nav({ closeMenu }) {
  return (
    <ul>
      {siteLinks.map(({ label, to }) => (
        <li key={label}>
          <Link to={to} onClick={closeMenu}>{label}</Link>
        </li>
      ))}
    </ul>
  );
}

export default Nav;
