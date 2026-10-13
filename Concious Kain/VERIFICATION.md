# Verification

PASS: Chrome browser checks completed with zero console errors or uncaught JavaScript errors. The app also opens directly from `index.html` and renders all eight meals.

## Delivery gate

- Hard gate PASS: required address/contact fields validate, an invalid Philippine mobile number produces an inline error, empty search/cart/orders have useful actions, keyboard Enter opens the address sheet, and Escape closes it. Focus rings are visible. No overflow was found at 320px, 390px, 768px, or 1440px.
- Purpose gate PASS: cream and forest green, serif titles, circular categories, three-column dish cards, and the cart layout follow the supplied image. System text keeps fields readable. The GCash logo identifies the payment choice. Brief fades and slides communicate navigation and sheet state. There is no device image, decorative outer backdrop, remote font, or runtime menu request.
- Liveliness PASS: ENERGY 2 / RHYTHM 2 / MOTION 2. The food banner anchors Home; the meal list anchors Explore; totals and one primary action anchor checkout. Sheets animate in and out. Tab contents fade into view. Reduced-motion mode disables animations.
- Craftsmanship PASS: the tested browse, cart, address, checkout, receipt, profile, and settings flows work. Desktop and tablet keep a 1:2 app ratio; mobile fills the browser. Data persists locally. Prices, delivery fees, pickup, order status, and payments remain prototype behavior as documented in README.

## Click-through evidence

- Home: eight local meal images load; favorites save; food details open; Add to Cart updates the badge; the sheet slides closed.
- Explore: category selection filters meals; ingredient search narrows results; an unmatched query shows an empty state; Show all meals resets filters; sorting puts the least expensive meal first.
- Addresses: missing fields show errors; Home address saves and appears in the header; the saved address can be selected; Escape closes the sheet.
- Cart: increasing/decreasing quantities changes counts and totals; invalid promo codes show feedback; KAIN10 discounts meals; clearing the code removes the discount; removing all meals shows the empty cart; Find a meal returns to browsing.
- Checkout: missing name and invalid phone numbers prevent placing the order; Autofill fills editable sample fields; GCash can be selected and its local logo loads; Place Order records a receipt with the selected payment.
- Pickup: address fields are removed, delivery is free, and the receipt records cash at pickup.
- Orders: receipts remain after reload; View order opens full delivery/contact details.
- Profile/settings: saved meals, about, reset cancellation, and reset confirmation work.
- Keyboard: focusing the delivery control and pressing Enter opens the sheet; Escape closes it; keyboard focus uses a green outline. Taps do not show a focus outline.
- Layout: no horizontal overflow at tested widths; mobile form fields use 16px text; page titles are centered; the last checkout button remains reachable above the tab bar.

## Terminal launcher

PASS: the isolated server test returned HTTP 200 over the local network. Every Unicode QR cell matched the encoded phone URL, including the four-cell quiet border. The batch launcher enables UTF-8 and launches the app, while the server prints the QR code in the terminal. The removed browser QR page returns HTTP 404.

QR encoding and LAN access were tested from this computer. A physical phone scan and Windows Firewall access on the phone were not directly tested.

## Contrast

- White on primary green: 7.33:1.
- Muted text on cream: 5.88:1.
- Green tag text: 8.30:1.
- Gold tag text: 6.32:1.
- White badge text: 4.68:1.
- Search placeholder on white: 5.35:1.
- Form input boundary on its background: 3.26:1.

Reports and screenshots are saved in the ignored `.qa` folder. Reproducible checks are in `tests/smoke.cjs` and `tests/server.cjs`.
