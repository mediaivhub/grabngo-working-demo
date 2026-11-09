# GrabnGo — working demo

Order-ahead food pickup app, built as a phone-only web app with **Next.js 16.4** (App Router, Cache Components, Tailwind CSS 4).
On a phone it runs full-screen; on a desktop it opens inside an iPhone mockup.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
npm start
```

Deploys to Vercel as a standard Next.js project (no settings needed).

## Test account

| | |
|---|---|
| Phone | `52 345 6789` (UAE, +971) |
| Verification code | `12345` (works for any number) |
| Name | Noor Al Rashid |
| Order history | 3 past orders (STAY, Orfali Bros, Nightjar) |
| Saved cards | Mastercard •••• 5914 (default), Visa •••• 4821 |
| Test card to add | `4242 4242 4242 4242`, any future expiry, any 3-digit CVV |

The login screen has a "Test account" shortcut that fills the number in. Any other valid UAE mobile number creates a fresh account.

## What works

- Onboarding, location and notification permission prompts (browser permissions)
- Home, Map (illustrated, zoom + named pins), Orders tabs
- Restaurant menus per merchant (items, prices, colours, section titles) — `merchantMenus` in `src/data/mock.ts`
- Signature drinks wheel, "Lazy Susan" food turntable, "Layer Cake" desserts (drag / tap)
- Product page with add-ons, sizes, nutrition, ingredients, swipe-to-order
- Cart (quantities, car plate), checkout (Apple Pay by default, change payment method, coupon), order confirmation
- Live order countdown, pickup map, QR code, rating
- Phone + OTP login / sign-up, stays logged in across refreshes until you log out
- Search with suggestions, results, Sort & Filter (price range, category, rating)
- Profile: orders, favourite restaurants / items, payment cards (Luhn + expiry validation, only last 4 digits stored), personal details with avatar, notification and privacy settings, FAQs, live chat (canned replies)

## Notes

- **No backend yet.** All data is demo data in `src/data/mock.ts`; the user's state (login, cart, orders, cards, favourites, settings) is saved in the browser's localStorage. Payments are simulated.
- **Images** are placeholder crops from the design screenshots, upscaled with `scripts/enhance-images.py`. Replace the files in `public/images/` with full-resolution exports when available.
