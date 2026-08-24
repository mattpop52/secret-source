"use client";

import { useCurrency } from "./currency-provider";

/**
 * Renders GBP pence converted and formatted into the shopper's chosen
 * currency. A bare fragment — not a styled element — so it drops straight
 * into whatever text node it replaces (a `<span className="ss-num …">`,
 * a template string slotted into JSX) without changing layout.
 */
export function Price({ cents }: { cents: number }) {
  const { format } = useCurrency();
  return <>{format(cents)}</>;
}
