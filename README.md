# Secret Source

The storefront for **Secret Source** — *your plug for all drip necessities*.

A Next.js shop: brand collections, product pages with live size runs, a basket
that survives a reload, and Stripe Checkout priced on the server.

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

## Before it takes real orders

1. **Replace the placeholder stock.** Everything in `PRODUCTS` in
   `lib/catalog.ts` is sample data written to build the shop — names, prices,
   size runs and docket numbers included. Swap it for the real stock.
2. **Add photography.** Drop files in `public/products/` and set
   `image: "/products/<file>.jpg"` on a product; the photo then replaces the
   drawn poster everywhere — grid, product page, basket. Until then the poster
   renders with a "Studio shot pending" mark, so nothing pretends to be a
   photograph.
3. **Set the real contact details** in `lib/constants.ts` — Instagram handle,
   email and WhatsApp number are currently stand-ins.
4. **Switch payments on.** Set `STRIPE_SECRET_KEY` (see `.env.example`).
   Without it the checkout button lands on `/checkout/demo`, which says plainly
   that payments aren't connected rather than failing silently.
5. **Check the promises.** Delivery window, free-delivery threshold, returns
   window and the authenticity guarantee are real commitments — they live in
   `lib/constants.ts`, `app/authenticity/page.tsx` and `app/help/page.tsx`.

## How checkout works

The browser only ever sends `{ slug, size, quantity }`. The route re-reads the
price from `lib/catalog.ts`, re-checks that the size is still in stock, adds the
shipping rate, and creates the Stripe Checkout session server-side — so a
tampered basket in `localStorage` can't change what anybody pays.

## Deploying

Built for Vercel. Push to the connected branch and it deploys; add
`STRIPE_SECRET_KEY` under the project's environment variables to take payments.

## Notes

- The basket persists in `localStorage` under `secret-source-cart-v1` and drops
  any line whose product has left the catalogue.
- Product artwork with no photograph is drawn as flat vector garments in each
  piece's own colourway (`components/garment-art.tsx`) — deliberate placeholder
  art, not stock imagery.
