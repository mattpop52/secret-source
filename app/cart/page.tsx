"use client";

import Link from "next/link";
import { useCart } from "@/components/cart-provider";
import { ProductMedia } from "@/components/product-media";
import { QuantityStepper } from "@/components/quantity-stepper";
import { useCheckout } from "@/components/use-checkout";
import { formatPrice, getBrandName } from "@/lib/catalog";
import {
  DELIVERY_WINDOW,
  FREE_SHIPPING_THRESHOLD,
  RETURNS_WINDOW,
  STANDARD_SHIPPING,
} from "@/lib/constants";

export default function CartPage() {
  const { lines, subtotal, setQuantity, remove, hydrated } = useCart();
  const { checkout, isSubmitting } = useCheckout();

  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING;
  const total = subtotal + shipping;
  const shortfall = FREE_SHIPPING_THRESHOLD - subtotal;

  return (
    <div className="mx-auto max-w-[1240px] px-4 py-12 sm:px-6 sm:py-16">
      <h1 className="ss-display ss-display-shadow text-[clamp(2.5rem,8vw,4.5rem)]">
        Basket
      </h1>

      {!hydrated && (
        <p className="ss-stencil mt-8 text-[0.7rem] text-[var(--ss-smoke)]">
          Loading your basket…
        </p>
      )}

      {hydrated && lines.length === 0 && (
        <div className="ss-docket mt-10 px-8 py-16 text-center">
          <h2 className="ss-display text-3xl">Nothing in here yet</h2>
          <p className="mx-auto mt-3 max-w-sm text-[var(--ss-smoke)] text-sm">
            The shelf moves fast — what's listed is in hand today.
          </p>
          <Link
            className="ss-stencil mt-6 inline-block bg-[var(--ss-orange)] px-6 py-3.5 text-[#120c00] text-[0.7rem] transition-colors hover:bg-[var(--ss-orange-hot)]"
            href="/collections/all"
          >
            Shop the shelf
          </Link>
        </div>
      )}

      {hydrated && lines.length > 0 && (
        <div className="mt-10 grid gap-10 lg:grid-cols-[1.6fr_1fr] lg:gap-16">
          <ul className="divide-y divide-[var(--ss-hairline)] border-[var(--ss-hairline)] border-y">
            {lines.map((line) => (
              <li className="flex gap-5 py-6" key={`${line.slug}-${line.size}`}>
                <Link
                  className="relative block h-36 w-28 shrink-0 overflow-hidden border border-[var(--ss-hairline)]"
                  href={`/products/${line.slug}`}
                >
                  <ProductMedia compact product={line.product} sizes="112px" />
                </Link>

                <div className="flex min-w-0 flex-1 flex-col">
                  <p className="ss-stencil text-[0.62rem] text-[var(--ss-orange)]">
                    {getBrandName(line.product.brand)}
                  </p>
                  <Link
                    className="font-semibold hover:underline"
                    href={`/products/${line.slug}`}
                  >
                    {line.product.name}
                  </Link>
                  <p className="mt-1 text-[var(--ss-smoke)] text-sm">
                    {line.product.colourway.name} · Size {line.size}
                  </p>
                  <p className="ss-stencil mt-1 text-[0.55rem] text-[var(--ss-smoke)]">
                    Docket {line.product.code}
                  </p>

                  <div className="mt-auto flex flex-wrap items-center justify-between gap-4 pt-4">
                    <QuantityStepper
                      label={line.product.name}
                      onChange={(next) =>
                        setQuantity(line.slug, line.size, next)
                      }
                      value={line.quantity}
                    />
                    <div className="flex items-center gap-5">
                      <span className="ss-num">
                        {formatPrice(line.lineTotal)}
                      </span>
                      <button
                        className="ss-stencil text-[0.62rem] text-[var(--ss-smoke)] underline-offset-4 transition-colors hover:text-[var(--destructive)] hover:underline"
                        onClick={() => remove(line.slug, line.size)}
                        type="button"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="ss-crate px-6 py-6">
              <h2 className="ss-stencil text-[0.7rem]">Order summary</h2>

              <dl className="mt-5 space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-[var(--ss-smoke)]">Subtotal</dt>
                  <dd className="ss-num">{formatPrice(subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-[var(--ss-smoke)]">Tracked delivery</dt>
                  <dd className="ss-num">
                    {shipping === 0 ? "Free" : formatPrice(shipping)}
                  </dd>
                </div>
                <div className="flex justify-between border-[var(--ss-hairline)] border-t pt-3">
                  <dt className="ss-stencil text-[0.7rem]">Total</dt>
                  <dd className="ss-num text-xl">{formatPrice(total)}</dd>
                </div>
              </dl>

              {shortfall > 0 && (
                <p className="mt-4 text-[var(--ss-smoke)] text-xs">
                  {formatPrice(shortfall)} more unlocks free tracked delivery.
                </p>
              )}

              <button
                className="ss-stencil mt-6 w-full bg-[var(--ss-orange)] py-4 text-[#120c00] text-[0.8rem] transition-colors hover:bg-[var(--ss-orange-hot)] disabled:opacity-60"
                disabled={isSubmitting}
                onClick={() => checkout(lines)}
                type="button"
              >
                {isSubmitting ? "Opening checkout…" : "Checkout securely"}
              </button>

              <p className="mt-4 text-[var(--ss-smoke)] text-xs leading-relaxed">
                Card, Apple Pay and Google Pay handled by Stripe. Packed same
                day, with you in {DELIVERY_WINDOW}. {RETURNS_WINDOW} to send it
                back.
              </p>
            </div>

            <Link
              className="ss-stencil mt-4 block text-center text-[0.7rem] text-[var(--ss-smoke)] underline-offset-4 transition-colors hover:text-[var(--ss-bone)] hover:underline"
              href="/collections/all"
            >
              Keep shopping
            </Link>
          </aside>
        </div>
      )}
    </div>
  );
}
