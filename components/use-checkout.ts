"use client";

import { useCheckoutDialog } from "./checkout-provider";

/**
 * Hands the basket to the shared shipping dialog (see checkout-provider.tsx
 * and checkout-dialog.tsx), which collects a delivery address, then sends
 * that basket to the server to be re-priced against the catalogue and
 * turned into a PayPal order for approval. Prices are never sent from here —
 * the browser only says which product, which size, how many, and which
 * currency and address the shopper picked; the server converts and charges
 * from its own rate table, never trusting a client-sent amount.
 *
 * Kept as its own hook, rather than having every call site reach for
 * useCheckoutDialog directly, so this can change again without touching the
 * three components that call it.
 */
export function useCheckout() {
  const { open, isSubmitting } = useCheckoutDialog();

  return { checkout: open, isSubmitting };
}
