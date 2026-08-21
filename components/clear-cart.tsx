"use client";

import { useEffect } from "react";
import { useCart } from "./cart-provider";

/** Empties the basket once an order has actually been paid for. */
export function ClearCartOnMount() {
  const { clear, hydrated } = useCart();

  useEffect(() => {
    if (hydrated) {
      clear();
    }
  }, [hydrated, clear]);

  return null;
}
