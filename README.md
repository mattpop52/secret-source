# Secret Source

The storefront for **Secret Source** — *your plug for all drip necessities*.

A Next.js shop: category collections split into brand subcategories, product
pages with live size runs, a basket that survives a reload, and PayPal
Checkout priced on the server.

```bash
npm install
npm run dev      # http://localhost:3000
```

## Where things live

| What | Where |
| --- | --- |
| Stock, prices, sizes, colourways | `lib/catalog.ts` |
| Shop-wide facts (delivery, returns, handles) | `lib/constants.ts` |
| Brand tokens and signature CSS | `app/shop.css` |
| Visual system, written up | `DESIGN.md` |
| Components | `components/` |
| Checkout (server-priced) | `app/api/checkout/route.ts` |
| Logo assets | `public/brand/` |

## Taxonomy

Categories are the shop's primary nav (`CATEGORIES` in `lib/catalog.ts`);
brands are subcategories inside a category (`BRANDS`, plus `category` and
`brand` on each `Product`). Routes nest the same way:

- `/collections/all` — everything, across every category
- `/collections/[category]` — a category, with a brand-chip row across the top
- `/collections/[category]/[brand]` — one brand's stock inside that category

Add a new category by adding to `CATEGORIES`; add a new brand to an existing
category by giving a product that `category` + a `brand` slug — the nav,
the brand-chip rows and `generateStaticParams` all pick it up on their own,
nothing else needs editing.

## Current stock

`Tracksuits` is live with five real, photographed units across four brands
(The North Face, Essentials Fear of God, Dior, Moncler) — real names, real
colourways, real photography in `public/products/`. Two things on each are
still placeholder pending confirmation, both flagged at the top of
`lib/catalog.ts`:

- **`priceCents`** — market-rate estimates, not the real ticket price.
- **`sizes`** — tracksuits, jumpers, short sets, coats and t-shirts carry a
  full S–XL run; shoes, jeans, bags and hats are stocked in whatever single
  real size the tag reads.

## Before it takes real orders

1. **Confirm price and size on the five live products**, and add the
   remaining stock as more photography arrives — `image:
   "/products/<file>.jpg"` on a product replaces the drawn poster everywhere
   (grid, product page, basket) the moment it's set. A product with no
   `image` keeps rendering its vector poster with a "Studio shot pending"
   mark, so nothing pretends to be a photograph before the photo exists.
2. **Set the real contact details** in `lib/constants.ts` — Instagram handle,
   email and WhatsApp number are currently stand-ins.
3. **Switch payments on.** Set `PAYPAL_CLIENT_ID` and `PAYPAL_CLIENT_SECRET`
   (see `.env.example`) from a PayPal REST app at developer.paypal.com — a
   separate thing from a PayPal.com pay link, which is fixed-price and can't
   charge each basket's own total. Without these the checkout button lands
   on `/checkout/demo`, which says plainly that payments aren't connected
   rather than failing silently.
4. **Check the promises.** Delivery window, free-delivery threshold and
   returns window are real commitments — they live in `lib/constants.ts` and
   `app/help/page.tsx`.

## How checkout works

The browser only ever sends `{ slug, size, quantity }`. The route re-reads the
price from `lib/catalog.ts`, re-checks that the size is still in stock, adds the
shipping rate, and creates a PayPal order server-side (`lib/paypal.ts`) for
that exact total — so a tampered basket in `localStorage` can't change what
anybody pays. The shopper approves on PayPal's own hosted page and lands back
on `/checkout/success`, which is what actually captures the payment; PayPal
approving an order doesn't move money on its own.

## Deploying

Built for Vercel. Push to the connected branch and it deploys; add
`PAYPAL_CLIENT_ID` and `PAYPAL_CLIENT_SECRET` under the project's environment
variables to take payments.

## Notes

- The basket persists in `localStorage` under `secret-source-cart-v1` and drops
  any line whose product has left the catalogue.
- Product artwork with no photograph is drawn as flat vector garments in each
  piece's own colourway (`components/garment-art.tsx`) — deliberate placeholder
  art, not stock imagery.
