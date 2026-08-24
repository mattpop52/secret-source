"use client";

import { useState } from "react";
import { isSoldOut, type Product } from "@/lib/catalog";
import { useCart } from "./cart-provider";
import { useCurrency } from "./currency-provider";
import { useLanguage } from "./language-provider";
import { QuantityStepper } from "./quantity-stepper";
import { useCheckout } from "./use-checkout";

export function ProductBuyBox({ product }: { product: Product }) {
  const inStockSizes = product.sizes.filter((option) => option.inStock);
  const soldOut = isSoldOut(product);

  const [size, setSize] = useState<string | null>(
    inStockSizes.length === 1 ? inStockSizes[0].label : null,
  );
  const [quantity, setQuantity] = useState(1);
  const [needsSize, setNeedsSize] = useState(false);
  const { add } = useCart();
  const { checkout, isSubmitting } = useCheckout();
  const { format } = useCurrency();
  const { t } = useLanguage();

  function requireSize() {
    if (size) {
      return true;
    }

    setNeedsSize(true);
    return false;
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <p className="ss-stencil text-[0.7rem] text-[var(--ss-smoke)]">
          {/* A single stocked size is still a sized garment ("M", not
              "One size") unless the label itself says otherwise — a real
              one-size-fits-all item (a blind box, a cap) sets that label. */}
          {product.sizes.length === 1 && product.sizes[0].label === "One size"
            ? t("oneSize")
            : t("size")}
        </p>
        <a
          className="ss-stencil text-[0.62rem] text-[var(--ss-smoke)] underline underline-offset-4 transition-colors hover:text-[var(--ss-bone)]"
          href="/help#sizing"
        >
          {t("sizingHelp")}
        </a>
      </div>

      <fieldset className="mt-3">
        <legend className="sr-only">Choose a size</legend>
        <div className="flex flex-wrap gap-2">
          {product.sizes.map((option) => {
            const selected = option.label === size;

            return (
              <button
                aria-pressed={selected}
                className={`ss-stencil relative min-w-[3.75rem] border px-4 py-3 text-[0.7rem] transition-colors ${
                  option.inStock
                    ? selected
                      ? "border-[var(--ss-orange)] bg-[var(--ss-orange)] text-[#120c00]"
                      : "border-[var(--ss-hairline-strong)] text-[var(--ss-bone)] hover:border-[var(--ss-orange)]"
                    : "cursor-not-allowed border-[var(--ss-hairline)] text-[var(--ss-sold)]"
                }`}
                disabled={!option.inStock}
                key={option.label}
                onClick={() => {
                  setSize(option.label);
                  setNeedsSize(false);
                }}
                type="button"
              >
                {option.label}
                {!option.inStock && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <span className="h-px w-[130%] rotate-[-22deg] bg-[var(--ss-sold)]" />
                  </span>
                )}
                {!option.inStock && (
                  <span className="sr-only"> — sold out</span>
                )}
              </button>
            );
          })}
        </div>
      </fieldset>

      {needsSize && (
        <p className="ss-stencil mt-3 text-[0.62rem] text-[var(--destructive)]">
          {t("pickASizeFirst")}
        </p>
      )}

      {soldOut ? (
        <div className="mt-7 border border-[var(--ss-hairline-strong)] px-5 py-5">
          <p className="ss-stencil text-[0.7rem] text-[var(--ss-orange)]">
            {t("soldOut")}
          </p>
          <p className="mt-2 text-[var(--ss-smoke)] text-sm">
            {t("thisOnesGone")}
          </p>
        </div>
      ) : (
        <>
          <div className="mt-7 flex items-center gap-4">
            <QuantityStepper
              label={product.name}
              onChange={setQuantity}
              value={quantity}
            />
            <p className="ss-num text-[var(--ss-smoke)] text-sm">
              {t("lineTotal", { price: format(product.priceCents * quantity) })}
            </p>
          </div>

          <div className="mt-4 grid gap-3">
            <button
              className="ss-stencil w-full bg-[var(--ss-orange)] py-[1.15rem] text-[#120c00] text-[0.8rem] transition-colors hover:bg-[var(--ss-orange-hot)]"
              onClick={() => {
                if (!requireSize() || !size) {
                  return;
                }

                add({ slug: product.slug, size, quantity });
              }}
              type="button"
            >
              {t("addToBasket")}
            </button>

            <button
              className="ss-stencil w-full border border-[var(--ss-hairline-strong)] py-4 text-[0.8rem] transition-colors hover:border-[var(--ss-orange)] hover:text-[var(--ss-orange)] disabled:opacity-60"
              disabled={isSubmitting}
              onClick={() => {
                if (!requireSize() || !size) {
                  return;
                }

                checkout([{ slug: product.slug, size, quantity }]);
              }}
              type="button"
            >
              {isSubmitting ? t("openingCheckout") : t("buyItNow")}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
