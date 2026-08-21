"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { CartLine } from "./cart-provider";

/**
 * Hands the basket to the server, which re-prices it against the catalogue
 * and opens a Stripe Checkout session. Prices are never sent from here — the
 * browser only says which product, which size, how many.
 */
export function useCheckout() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function checkout(lines: CartLine[]) {
    if (lines.length === 0 || isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: lines.map((line) => ({
            slug: line.slug,
            size: line.size,
            quantity: line.quantity,
          })),
        }),
      });

      const payload = await response.json();

      if (!response.ok || !payload?.url) {
        toast.error(payload?.error ?? "Checkout could not be started.");
        return;
      }

      window.location.href = payload.url;
    } catch {
      toast.error("Checkout could not be reached. Try again in a moment.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return { checkout, isSubmitting };
}
