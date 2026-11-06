# Little Lemon Meta Front-End Capstone

A Create React App site for the Little Lemon restaurant. The home page follows the supplied Figma design (1920px desktop frame) and is responsive down to 320px. Routing uses `react-router-dom`; styling is plain CSS in `src/App.css`.

## Scripts

```bash
npm install        # install dependencies
npm start          # dev server on http://localhost:3000
npm test           # Jest + React Testing Library
npm run build      # production build in ./build
```

## Dependencies

Runtime / app:

- `react` and `react-dom` 19
- `react-router-dom` 7 (client-side routing: `/`, `/booking`, `/confirmed`, `/login`)
- `react-scripts` 5.0.1 (Create React App tooling)

Testing:

- `@testing-library/react`, `@testing-library/dom`, `@testing-library/jest-dom`, `@testing-library/user-event`

## Jest configuration (why `package.json` has a `jest` block)

`package.json` contains:

```json
"jest": {
  "moduleNameMapper": {
    "^react-router/dom$": "<rootDir>/node_modules/react-router/dist/development/dom-export.js"
  }
}
```

**Why:** `react-router-dom` 7 imports `react-router/dom`, a sub-path that only exists in the `exports` map of `react-router`'s `package.json`. `react-scripts` 5.0.1 ships Jest 27, which ignores package `exports`, so without this mapping any test that renders a router fails with `Cannot find module 'react-router/dom'`. The mapping points that import straight at the file the `exports` map would have resolved to.

**When to remove it:** after upgrading `react-scripts`/Jest to a version that supports package `exports` (Jest 28+). Delete the whole `jest` block, run `npm test`, and if the router tests still pass the mapping is no longer needed. Note it hard-codes a path inside `node_modules`, so a future `react-router` release that moves `dist/development/dom-export.js` would break it; that is another reason to drop it once you can.

`src/setupTests.js` is the companion workaround: it gives jsdom the `TextEncoder`/`TextDecoder` that `react-router` 7 expects. No extra packages are needed for either.

## Routes

| Path | Page |
| --- | --- |
| `/` | Home: hero, reservation form, specials, testimonials, about |
| `/booking` | Reservation form on its own |
| `/confirmed` | Booking confirmation (needs the booking in router state, otherwise redirects to `/booking`) |
| `/login` | Placeholder (customer accounts are not built yet) |

## Components (`src/components`)

- `Header.js`, `Nav.js` — 3-part desktop header (logo, centred links, Login) and mobile menu (Escape / click-outside close)
- `CallToAction.js` — hero
- `BookingPage.js` — reservation form: async time lookup (loading / empty / error + retry states), per-field inline errors (`aria-invalid` + `aria-describedby`), double-submit guard
- `../api/bookingApi.js` — the only module that talks to the back end: `getAvailableTimes(date)` and `submitBooking(data)` (wraps `window.fetchAPI` / `window.submitAPI` from `public/api.js`; documents the intended `GET /api/availability?date=YYYY-MM-DD` and `POST /api/bookings` endpoints)
- `Specials.js` — weekly specials
- `CustomersSay.js` — full-bleed testimonial carousel (local images in `public/assets/testimonials`)
- `Chicago.js` — about text and gallery
- `Footer.js` — links, contact, social links
- `Main.js` — routes inside a single `<main id="main">` (target of the skip link)
- `LoginPlaceholder.js`
- `ConfirmedBooking.js` — shows the booking passed in router state; redirects to `/booking` when opened without it
- `../data/siteLinks.js` — the one list of main navigation links, rendered by both `Nav.js` (header) and `Footer.js`
- `../utils/scrollBehavior.js` — returns `"auto"` instead of `"smooth"` when the visitor prefers reduced motion (relies on `App.css` only enabling `scroll-behavior: smooth` under `prefers-reduced-motion: no-preference`)
- `../utils/dates.js` — `toDateString(date)`, local-time `YYYY-MM-DD` for the date input

The app renders inside `<React.StrictMode>` (see `src/index.js`), so effects run twice in development; all effects here clean up after themselves.

## Accessibility notes

- "Skip to main content" link is the first tab stop.
- Two-colour focus ring (dark outline + white halo; inverted on dark sections).
- Text colours meet WCAG AA, with one deliberate exception: the yellow "Chicago" heading (Figma brand colour), documented in `App.css`.

## Placeholders to replace

- Social links point at each platform's home page; the email link is `hello@littlelemon.example`.

## Configuration and secrets

The app needs no credentials. To point it at a real booking API, copy `.env.example` to `.env` (git-ignored) and set:

```
REACT_APP_API_BASE_URL=https://api.example.com
```

**Never put secrets in `REACT_APP_*` variables.** Create React App inlines every `REACT_APP_*` value into the JavaScript bundle at build time, so anything in them is public to every visitor (and visible in DevTools). API keys, tokens, passwords and database credentials belong on a backend that the frontend calls; the browser should only ever hold a public URL and, at most, a short-lived session token issued by that backend.
