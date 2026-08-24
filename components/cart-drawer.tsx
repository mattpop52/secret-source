"use client";

import Link from "next/link";
import { useEffect } from "react";
import { getBrandName } from "@/lib/catalog";
import { FREE_SHIPPING_THRESHOLD, STANDARD_SHIPPING } from "@/lib/constants";
import { useCart } from "./cart-provider";
import { useCurrency } from "./currency-provider";
import { useLanguage } from "./language-provider";
import { ProductMedia } from "./product-media";
import { QuantityStepper } from "./quantity-stepper";
import { useCheckout } from "./use-checkout";

export function CartDrawer() {
  const { lines, isOpen, closeCart, setQuantity, remove, subtotal, count } =
    useCart();
  const { checkout, isSubmitting } = useCheckout();
  const { format } = useCurrency();
  const { t } = useLanguage();

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeCart();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.documentElement.style.overflow = previousOverflow;
    };
  }, [isOpen, closeCart]);

  const shortfall = FREE_SHIPPING_THRESHOLD - subtotal;

  return (
    <div
      aria-hidden={!isOpen}
      className={`fixed inset-0 z-[70] ${isOpen ? "" : "pointer-events-none"}`}
    >
      <button
        aria-label="Close basket"
        className={`absolute inset-0 bg-black/70 backdrop-blur-[2px] transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={closeCart}
        tabIndex={isOpen ? 0 : -1}
        type="button"
      />

      <aside
        aria-label="Basket"
        aria-modal={isOpen}
        className={`absolute inset-y-0 right-0 flex w-full max-w-[26rem] flex-col border-[var(--ss-hairline)] border-l bg-[var(--ss-black)] transition-transform duration-300 ease-[cubic-bezier(0.2,0.7,0.3,1)] ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
      >
        <div className="ss-tape-thin h-2 shrink-0" />

        <header className="flex items-center justify-between border-[var(--ss-hairline)] border-b px-5 py-4">
          <h2 className="ss-stencil text-sm">
            {t("basket")}{" "}
            <span className="text-[var(--ss-orange)]">
              [{count.toString().padStart(2, "0")}]
            </span>
          </h2>
          <button
            className="ss-stencil text-[0.7rem] text-[var(--ss-smoke)] transition-colors hover:text-[var(--ss-bone)]"
            onClick={closeCart}
            tabIndex={isOpen ? 0 : -1}
            type="button"
          >
            {t("close")} ✕
          </button>
        </header>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
            <p className="ss-display text-3xl">{t("nothingHereYet")}</p>
            <p className="text-[var(--ss-smoke)] text-sm">
              {t("everythingOneOfOne")}
            </p>
            <Link
              className="ss-stencil mt-2 bg-[var(--ss-orange)] px-6 py-3 text-[#120c00] text-[0.7rem] transition-colors hover:bg-[var(--ss-orange-hot)]"
              href="/collections/all"
              onClick={closeCart}
              tabIndex={isOpen ? 0 : -1}
            >
              {t("shopTheShelf")}
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-[var(--ss-hairline)] overflow-y-auto">
              {lines.map((line) => (
                <li
                  className="flex gap-4 p-5"
                  key={`${line.slug}-${line.size}`}
                >
                  <Link
                    className="relative block h-24 w-20 shrink-0 overflow-hidden border border-[var(--ss-hairline)]"
                    href={`/products/${line.slug}`}
                    onClick={closeCart}
                    tabIndex={isOpen ? 0 : -1}
                  >
                    <ProductMedia compact product={line.product} sizes="80px" />
                  </Link>

                  <div className="min-w-0 flex-1">
                    <p className="ss-stencil text-[0.62rem] text-[var(--ss-orange)]">
                      {getBrandName(line.product.brand)}
                    </p>
                    <Link
                      className="block truncate font-semibold text-sm hover:underline"
                      href={`/products/${line.slug}`}
                      onClick={closeCart}
                      tabIndex={isOpen ? 0 : -1}
                    >
                      {line.product.name}
                    </Link>
                    <p className="mt-0.5 text-[var(--ss-smoke)] text-xs">
                      {line.product.colourway.name} · {line.size}
                    </p>

                    <div className="mt-3 flex items-center justify-between gap-3">
                      <QuantityStepper
                        label={line.product.name}
                        onChange={(next) =>
                          setQuantity(line.slug, line.size, next)
                        }
                        value={line.quantity}
                      />
                      <span className="ss-num text-sm">
                        {format(line.lineTotal)}
                      </span>
                    </div>

                    <button
                      className="ss-stencil mt-2 text-[0.62rem] text-[var(--ss-smoke)] underline-offset-4 transition-colors hover:text-[var(--destructive)] hover:underline"
                      onClick={() => remove(line.slug, line.size)}
                      tabIndex={isOpen ? 0 : -1}
                      type="button"
                    >
                      {t("remove")}
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <footer className="border-[var(--ss-hairline)] border-t p-5">
              <div className="flex items-baseline justify-between">
                <span className="ss-stencil text-[0.7rem] text-[var(--ss-smoke)]">
                  {t("subtotal")}
                </span>
                <span className="ss-num text-xl">{format(subtotal)}</span>
              </div>

              <p className="mt-2 text-[var(--ss-smoke)] text-xs">
                {shortfall > 0
                  ? t("moreForFreeDelivery", {
                      amount: format(shortfall),
                      shipping: format(STANDARD_SHIPPING),
                    })
                  : t("freeDeliveryUnlocked")}
              </p>

              <button
                className="ss-stencil mt-4 w-full bg-[var(--ss-orange)] py-4 text-[#120c00] text-[0.8rem] transition-colors hover:bg-[var(--ss-orange-hot)] disabled:opacity-60"
                disabled={isSubmitting}
                onClick={() => checkout(lines)}
                tabIndex={isOpen ? 0 : -1}
                type="button"
              >
                {isSubmitting ? t("openingCheckout") : t("checkout")}
              </button>

              <Link
                className="ss-stencil mt-3 block text-center text-[0.7rem] text-[var(--ss-smoke)] underline-offset-4 transition-colors hover:text-[var(--ss-bone)] hover:underline"
                href="/cart"
                onClick={closeCart}
                tabIndex={isOpen ? 0 : -1}
              >
                {t("viewFullBasket")}
              </Link>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}
