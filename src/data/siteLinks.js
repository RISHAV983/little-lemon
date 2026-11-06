// Single source of truth for the main navigation (header and footer).
// `label` is the header text; `footerLabel` overrides it in the footer where the
// design words it differently ("Reservation" vs "Reservations").
export const siteLinks = [
  { label: "Home", to: "/" },
  { label: "About", to: "/#about" },
  { label: "Menu", to: "/#specials" },
  { label: "Reservation", footerLabel: "Reservations", to: "/booking" },
  { label: "Order Online", to: "/#specials" },
];
