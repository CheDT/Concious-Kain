# Conscious Kain

A lightweight Filipino food ordering demo built with plain HTML, CSS, and JavaScript. No runtime dependencies, database, account, or payment integration.

## Open the demo

Double-click **Start Conscious Kain.bat**. It starts the local server, prints a scannable QR code and phone URL in the terminal, and opens the app in your browser. Keep that terminal window open while using the app. Node.js must be installed; no package installation is needed.

For phone testing, connect the computer and phone to the same Wi-Fi, scan the terminal QR code, and open the link. If Windows asks, allow Node.js on private networks. If multiple network interfaces are available, the terminal prints one QR code and address per interface, with private Wi-Fi addresses first. No router port forwarding or internet hosting is needed.

Alternatively, run `npm start` and open http://localhost:4173. The server only serves static files. `npm run check` checks JavaScript syntax. You can also open `index.html` directly on the computer.

The app is centered at a phone-shaped ratio on desktop and fills the browser on mobile. The supplied iPhone PNG is preserved in the folder but is not displayed, following the latest requested design.

## Try the flow

- Browse eight Filipino dishes, search ingredients, choose a category, sort by price, and save favorites.
- Start with the sample cart, add dishes, adjust quantities, remove items, and apply `KAIN10` for a sample 10% discount.
- The delivery address at the top opens a sliding sheet. Add Home, Work, or Other addresses, select one, and delete saved addresses.
- Checkout supports delivery or pickup, a name, Philippine mobile number, street, barangay, city, rider instructions, and cash or GCash selection. Delivery adds a sample ₱25 fee; pickup is free. Missing details and invalid phone numbers show inline errors.
- “Autofill” enters editable sample details. “Place Order” records the order locally and displays its receipt. GCash has its logo but does not connect to a payment API.
- Orders, addresses, favorites, contact details, and cart persist in this browser. Profile > Settings > Reset app data clears them and restores the starter cart. Computer and phone each keep their own local data.
- Tabs fade and rise into view. Sheets slide and fade on opening and closing; buttons, favorites, cart badges, and notifications have brief feedback. Reduced-motion settings turn animations off.

All menu prices are samples. No order is sent and no payment is processed.

## Design references

The provided image is the main reference: cream surfaces, forest green actions, serif food titles, circular categories, a three-column food grid, recommendation list, cart, and four-tab navigation. System sans-serif controls keep forms readable. Compact spacing follows the reference; cards compare dishes, lists show details, and the primary action anchors checkout. The background uses the same cream as the app so there is no separate device border or backdrop. Motion explains state changes and navigation. ENERGY 2 / RHYTHM 2 / MOTION 2.

The [Apple design skill](https://github.com/dickwu/apple-design-skill) informed accessible fields, logical focus order, labeled controls, safe-area spacing, and concise settings. This is a browser app applying those principles, not a native iOS app.

Meal photographs are downloaded thumbnails from [TheMealDB](https://www.themealdb.com/). IDs and original recipe names are listed in `assets/sources.json`. All demo assets are local; no remote fonts, analytics, or runtime API requests.

The GCash SVG comes from [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:GCash_logo.svg), by Moonrivers, marked as a public-domain text logo. Terminal QR codes are generated locally with [qrcode-generator 1.4.4](https://github.com/kazuhikoarase/qrcode-generator), under the included MIT license. The browser app does not load the QR library.

## Browser verification

`tests/smoke.cjs` checks browsing, search, sorting, favorites, food-detail sheets, address validation, saving and selection, cart totals, promo codes, checkout validation, both payment choices, pickup, order receipts, persistence, reset, responsive sizes, animations, and reduced motion. Run it with Playwright available, for example `node tests/smoke.cjs /path/to/playwright`. Set `BROWSER_PATH` to use a different installed Chromium browser. Screenshots and the check report go into the ignored `.qa` folder.

`node tests/server.cjs` starts an isolated server, verifies LAN access, checks every cell of the terminal QR against its encoded address, and confirms the removed QR page is unavailable.
