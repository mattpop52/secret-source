"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { toast } from "sonner";
import { getProduct, type Product } from "@/lib/catalog";
import { FREE_SHIPPING_THRESHOLD, STANDARD_SHIPPING } from "@/lib/constants";
import { DEFAULT_COUNTRY } from "@/lib/countries";
import type { CartLine } from "./cart-provider";
import { useCurrency } from "./currency-provider";

const ADDRESS_STORAGE_KEY = "secret-source-shipping-v1";

export type ShippingValues = {
  fullName: string;
  line1: string;
  line2: string;
  city: string;
  region: string;
  postalCode: string;
  countryCode: string;
};

const EMPTY_ADDRESS: ShippingValues = {
  fullName: "",
  line1: "",
  line2: "",
  city: "",
  region: "",
  postalCode: "",
  countryCode: DEFAULT_COUNTRY,
};

function readStoredAddress(): ShippingValues {
  if (typeof window === "undefined") {
    return EMPTY_ADDRESS;
  }

  try {
    const raw = window.localStorage.getItem(ADDRESS_STORAGE_KEY);
    if (!raw) {
      return EMPTY_ADDRESS;
    }

    const parsed = JSON.parse(raw);
    return { ...EMPTY_ADDRESS, ...parsed };
  } catch {
    return EMPTY_ADDRESS;
  }
}

export type PendingLine = CartLine & { product: Product; lineTotal: number };

export type PendingOrder = {
  lines: PendingLine[];
  subtotal: number;
  shippingCents: number;
  total: number;
};

type CheckoutContextValue = {
  pending: PendingOrder | null;
  isSubmitting: boolean;
  values: ShippingValues;
  setField: (field: keyof ShippingValues, value: string) => void;
  open: (lines: CartLine[]) => void;
  close: () => void;
  submit: () => Promise<void>;
};

const CheckoutContext = createContext<CheckoutContextValue | null>(null);

export function CheckoutProvider({ children }: { children: ReactNode }) {
  const [pending, setPending] = useState<PendingOrder | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [values, setValues] = useState<ShippingValues>(EMPTY_ADDRESS);
  const { currency } = useCurrency();

  const open = useCallback((lines: CartLine[]) => {
    const resolved: PendingLine[] = [];

    for (const line of lines) {
      const product = getProduct(line.slug);
      if (product) {
        resolved.push({
          ...line,
          product,
          lineTotal: product.priceCents * line.quantity,
        });
      }
    }

    if (resolved.length === 0) {
      return;
    }

    const subtotal = resolved.reduce((sum, line) => sum + line.lineTotal, 0);
    const shippingCents =
      subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING;

    setPending({
      lines: resolved,
      subtotal,
      shippingCents,
      total: subtotal + shippingCents,
    });
    // Re-read on every open rather than once at mount, so filling the form
    // in one tab and buying in another still picks up the saved address.
    setValues(readStoredAddress());
  }, []);

  const close = useCallback(() => {
    if (!isSubmitting) {
      setPending(null);
    }
  }, [isSubmitting]);

  const setField = useCallback((field: keyof ShippingValues, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
  }, []);

  const submit = useCallback(async () => {
    if (!pending || isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: pending.lines.map((line) => ({
            slug: line.slug,
            size: line.size,
            quantity: line.quantity,
          })),
          currency,
          shipping: values,
        }),
      });

      const payload = await response.json();

      if (!response.ok || !payload?.url) {
        toast.error(payload?.error ?? "Checkout could not be started.");
        return;
      }

      // Saved only once the server has accepted it as a valid address, so a
      // typo never gets remembered as the default for next time.
      try {
        window.localStorage.setItem(
          ADDRESS_STORAGE_KEY,
          JSON.stringify(values),
        );
      } catch {
        // Private mode or blocked storage — the address just won't persist.
      }

      window.location.href = payload.url;
    } catch {
      toast.error("Checkout could not be reached. Try again in a moment.");
    } finally {
      setIsSubmitting(false);
    }
  }, [pending, isSubmitting, currency, values]);

  const value = useMemo<CheckoutContextValue>(
    () => ({ pending, isSubmitting, values, setField, open, close, submit }),
    [pending, isSubmitting, values, setField, open, close, submit],
  );

  return (
    <CheckoutContext.Provider value={value}>
      {children}
    </CheckoutContext.Provider>
  );
}

export function useCheckoutDialog() {
  const context = useContext(CheckoutContext);

  if (!context) {
    throw new Error("useCheckoutDialog must be used inside a CheckoutProvider");
  }

  return context;
}
