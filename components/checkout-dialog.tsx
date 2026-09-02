"use client";

import { useEffect, useId } from "react";
import { getBrandName } from "@/lib/catalog";
import { COUNTRIES } from "@/lib/countries";
import { useCheckoutDialog } from "./checkout-provider";
import { useCurrency } from "./currency-provider";
import { useLanguage } from "./language-provider";

const INPUT_CLASS =
  "w-full border border-[var(--ss-hairline-strong)] bg-[var(--ss-black)] px-3 py-2.5 text-[0.85rem] text-[var(--ss-bone)] transition-colors placeholder:text-[var(--ss-smoke)] hover:border-[var(--ss-orange)] focus-visible:border-[var(--ss-orange)]";
const LABEL_CLASS =
  "ss-stencil mb-1.5 block text-[0.6rem] text-[var(--ss-smoke)]";

/**
 * The address step every checkout attempt passes through — opened by
 * useCheckoutDialog().open() from the basket drawer, the full basket page,
 * or a product's "Buy it now", so it only has to exist once. Submitting it
 * is what actually creates the PayPal order and redirects; nothing before
 * this point has made a network request.
 */
export function CheckoutDialog() {
  const { pending, isSubmitting, values, setField, close, submit } =
    useCheckoutDialog();
  const { format } = useCurrency();
  const { t } = useLanguage();
  const isOpen = pending !== null;

  const nameId = useId();
  const line1Id = useId();
  const line2Id = useId();
  const cityId = useId();
  const regionId = useId();
  const postalId = useId();
  const countryId = useId();

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        close();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.documentElement.style.overflow = previousOverflow;
    };
  }, [isOpen, close]);

  if (!pending) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto p-4 py-10 sm:items-center">
      <button
        aria-label={t("close")}
        className="fixed inset-0 bg-black/80 backdrop-blur-[2px]"
        onClick={close}
        type="button"
      />

      <div
        aria-label={t("shippingTitle")}
        aria-modal="true"
        className="ss-crate relative w-full max-w-lg bg-[var(--ss-black)] px-6 py-7 sm:px-8 sm:py-8"
        role="dialog"
      >
        <button
          aria-label={t("close")}
          className="ss-stencil absolute top-5 right-5 text-[0.7rem] text-[var(--ss-smoke)] transition-colors hover:text-[var(--ss-bone)]"
          onClick={close}
          type="button"
        >
          {t("close")} ✕
        </button>

        <h2 className="ss-display text-2xl sm:text-3xl">
          {t("shippingTitle")}
        </h2>
        <p className="mt-2 text-[var(--ss-smoke)] text-sm">
          {t("shippingBlurb")}
        </p>

        <div className="mt-5 space-y-1.5 border-[var(--ss-hairline)] border-y py-4 text-sm">
          {pending.lines.map((line) => (
            <div
              className="flex justify-between gap-4"
              key={`${line.slug}-${line.size}`}
            >
              <span className="min-w-0 truncate text-[var(--ss-smoke)]">
                {getBrandName(line.product.brand)} {line.product.name} ·{" "}
                {line.size}
                {line.quantity > 1 ? ` ×${line.quantity}` : ""}
              </span>
              <span className="ss-num shrink-0">{format(line.lineTotal)}</span>
            </div>
          ))}
          <div className="flex justify-between pt-2 font-semibold">
            <span>{t("total")}</span>
            <span className="ss-num">
              {format(pending.total)}
              {pending.shippingCents > 0 && (
                <span className="ml-1 font-normal text-[var(--ss-smoke)] text-xs">
                  ({t("trackedDelivery").toLowerCase()}{" "}
                  {format(pending.shippingCents)})
                </span>
              )}
            </span>
          </div>
        </div>

        <form
          className="mt-5 grid gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            submit();
          }}
        >
          <div>
            <label className={LABEL_CLASS} htmlFor={nameId}>
              {t("fullName")}
            </label>
            <input
              className={INPUT_CLASS}
              id={nameId}
              onChange={(event) => setField("fullName", event.target.value)}
              required
              value={values.fullName}
            />
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor={line1Id}>
              {t("addressLine1")}
            </label>
            <input
              className={INPUT_CLASS}
              id={line1Id}
              onChange={(event) => setField("line1", event.target.value)}
              required
              value={values.line1}
            />
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor={line2Id}>
              {t("addressLine2")}
            </label>
            <input
              className={INPUT_CLASS}
              id={line2Id}
              onChange={(event) => setField("line2", event.target.value)}
              value={values.line2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={LABEL_CLASS} htmlFor={cityId}>
                {t("townCity")}
              </label>
              <input
                className={INPUT_CLASS}
                id={cityId}
                onChange={(event) => setField("city", event.target.value)}
                required
                value={values.city}
              />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor={postalId}>
                {t("postcode")}
              </label>
              <input
                className={INPUT_CLASS}
                id={postalId}
                onChange={(event) => setField("postalCode", event.target.value)}
                required
                value={values.postalCode}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={LABEL_CLASS} htmlFor={regionId}>
                {t("countyRegion")}
              </label>
              <input
                className={INPUT_CLASS}
                id={regionId}
                onChange={(event) => setField("region", event.target.value)}
                value={values.region}
              />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor={countryId}>
                {t("country")}
              </label>
              <select
                className={INPUT_CLASS}
                id={countryId}
                onChange={(event) =>
                  setField("countryCode", event.target.value)
                }
                required
                value={values.countryCode}
              >
                {COUNTRIES.map((country) => (
                  <option key={country.code} value={country.code}>
                    {country.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            className="ss-stencil mt-2 w-full bg-[var(--ss-orange)] py-4 text-[#120c00] text-[0.8rem] transition-colors hover:bg-[var(--ss-orange-hot)] disabled:opacity-60"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? t("takingYouToPaypal") : t("continueToPayment")}
          </button>
        </form>
      </div>
    </div>
  );
}
