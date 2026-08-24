"use client";

import { useId } from "react";
import { CURRENCIES, type CurrencyCode } from "@/lib/currency";
import { LANGUAGES, type LanguageCode } from "@/lib/i18n";
import { useCurrency } from "./currency-provider";
import { useLanguage } from "./language-provider";

const SELECT_CLASS =
  "ss-stencil border border-[var(--ss-hairline-strong)] bg-[var(--ss-black)] px-3 py-2 text-[0.68rem] text-[var(--ss-bone)] transition-colors hover:border-[var(--ss-orange)] focus-visible:border-[var(--ss-orange)]";

/**
 * The shopper's currency and language, live: picking either updates every
 * price on the page and the shop's own chrome text immediately, and both
 * choices persist (localStorage) and carry through to checkout.
 */
export function RegionPicker({
  variant = "compact",
}: {
  variant?: "compact" | "full";
}) {
  const { currency, setCurrency } = useCurrency();
  const { language, setLanguage, t } = useLanguage();
  const currencyId = useId();
  const languageId = useId();

  const currencySelect = (
    <select
      aria-label={t("currency")}
      className={SELECT_CLASS}
      id={currencyId}
      onChange={(event) => setCurrency(event.target.value as CurrencyCode)}
      value={currency}
    >
      {CURRENCIES.map((option) => (
        <option key={option.code} value={option.code}>
          {option.label}
        </option>
      ))}
    </select>
  );

  const languageSelect = (
    <select
      aria-label={t("language")}
      className={SELECT_CLASS}
      id={languageId}
      onChange={(event) => setLanguage(event.target.value as LanguageCode)}
      value={language}
    >
      {LANGUAGES.map((option) => (
        <option key={option.code} value={option.code}>
          {option.label}
        </option>
      ))}
    </select>
  );

  if (variant === "compact") {
    return (
      <div className="flex items-center gap-1.5">
        {currencySelect}
        {languageSelect}
      </div>
    );
  }

  return (
    <div>
      <h2 className="ss-stencil text-[0.7rem] text-[var(--ss-orange)]">
        {t("regionLanguage")}
      </h2>
      <p className="mt-4 max-w-xs text-[var(--ss-smoke)] text-sm">
        {t("regionLanguageBlurb")}
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <div className="block">
          <label
            className="ss-stencil mb-1.5 block text-[0.58rem] text-[var(--ss-smoke)]"
            htmlFor={currencyId}
          >
            {t("currency")}
          </label>
          {currencySelect}
        </div>
        <div className="block">
          <label
            className="ss-stencil mb-1.5 block text-[0.58rem] text-[var(--ss-smoke)]"
            htmlFor={languageId}
          >
            {t("language")}
          </label>
          {languageSelect}
        </div>
      </div>
    </div>
  );
}
