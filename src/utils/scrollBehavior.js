// Behaviour for in-page scrolling that is allowed to animate (hash links, carousel).
//
// "smooth" is returned unless the visitor prefers reduced motion. In that case "auto"
// is returned, which scrolls instantly *only because* App.css no longer sets
// `scroll-behavior: smooth` for reduced-motion visitors ("auto" means "use the CSS
// value"). If a global smooth rule is ever added back outside a
// `prefers-reduced-motion: no-preference` query, "auto" would animate again; use
// "instant" where scrolling must never animate (see the route reset in Main.js).
export const getScrollBehavior = () =>
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ? "auto"
    : "smooth";
