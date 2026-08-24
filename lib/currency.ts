/**
 * Currency display and conversion.
 *
 * The catalogue's real prices are all in GBP pence — that never changes,
 * and the Stripe checkout route always re-reads them from there. This file
 * only converts that GBP figure for *display*, and for the amount actually
 * charged once a shopper picks a currency at checkout.
 *
 * Rates are a fixed, hand-set snapshot rather than a live feed — there's no
 * FX API wired up. Reasonable for a small shop; revisit the numbers below
 * periodically so displayed prices don't drift far from real rates.
 */

export type CurrencyCode = "GBP" | "USD" | "EUR" | "CAD" | "AUD" | "JPY";

export type Currency = {
  code: CurrencyCode;
  /** Shown in the picker, e.g. "£ GBP". */
  label: string;
  symbol: string;
  locale: string;
  /** Units of this currency per 1 GBP. */
  rate: number;
  /** Stripe (and most currencies) count in the smallest unit — pence, cents.
   *  A few, like JPY, have no smaller unit at all. */
  minorUnit: 0 | 2;
};

export const CURRENCIES: Currency[] = [
  {
    code: "GBP",
    label: "£ GBP",
    symbol: "£",
    locale: "en-GB",
    rate: 1,
    minorUnit: 2,
  },
  {
    code: "USD",
    label: "$ USD",
    symbol: "$",
    locale: "en-US",
    rate: 1.27,
    minorUnit: 2,
  },
  {
    code: "EUR",
    label: "€ EUR",
    symbol: "€",
    locale: "en-IE",
    rate: 1.17,
    minorUnit: 2,
  },
  {
    code: "CAD",
    label: "$ CAD",
    symbol: "CA$",
    locale: "en-CA",
    rate: 1.74,
    minorUnit: 2,
  },
  {
    code: "AUD",
    label: "$ AUD",
    symbol: "A$",
    locale: "en-AU",
    rate: 1.93,
    minorUnit: 2,
  },
  {
    code: "JPY",
    label: "¥ JPY",
    symbol: "¥",
    locale: "ja-JP",
    rate: 191,
    minorUnit: 0,
  },
];

export const DEFAULT_CURRENCY: CurrencyCode = "GBP";

export function getCurrency(code: CurrencyCode): Currency {
  return CURRENCIES.find((currency) => currency.code === code) ?? CURRENCIES[0];
}

export function isCurrencyCode(value: string): value is CurrencyCode {
  return CURRENCIES.some((currency) => currency.code === value);
}

/** GBP pence → the target currency's own smallest unit (cents, or whole yen). */
export function convertFromGbpMinor(
  gbpMinor: number,
  code: CurrencyCode,
): number {
  const currency = getCurrency(code);
  const gbpMajor = gbpMinor / 100;
  const targetMajor = gbpMajor * currency.rate;
  const minorMultiplier = 10 ** currency.minorUnit;

  return Math.round(targetMajor * minorMultiplier);
}

/** GBP pence → a formatted string in the target currency, e.g. "$164.09". */
export function formatInCurrency(gbpMinor: number, code: CurrencyCode): string {
  const currency = getCurrency(code);
  const minorAmount = convertFromGbpMinor(gbpMinor, code);
  const majorAmount = minorAmount / 10 ** currency.minorUnit;

  return new Intl.NumberFormat(currency.locale, {
    style: "currency",
    currency: currency.code,
    minimumFractionDigits: currency.minorUnit,
    maximumFractionDigits: currency.minorUnit,
  }).format(majorAmount);
}
