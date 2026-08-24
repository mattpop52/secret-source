"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  type CurrencyCode,
  DEFAULT_CURRENCY,
  formatInCurrency,
  getCurrency,
  isCurrencyCode,
} from "@/lib/currency";

const STORAGE_KEY = "secret-source-currency-v1";

type CurrencyContextValue = {
  currency: CurrencyCode;
  setCurrency: (code: CurrencyCode) => void;
  /** GBP pence in, a formatted string in the shopper's chosen currency out. */
  format: (gbpMinor: number) => string;
};

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

function readStoredCurrency(): CurrencyCode {
  if (typeof window === "undefined") {
    return DEFAULT_CURRENCY;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw && isCurrencyCode(raw) ? raw : DEFAULT_CURRENCY;
  } catch {
    return DEFAULT_CURRENCY;
  }
}

export function CurrencyProvider({ children }: { children: ReactNode }) {
  // Starts at the GBP default so the server-rendered markup and the first
  // client render match; the stored choice (if any) applies right after,
  // same trade-off the cart makes for its own localStorage read.
  const [currency, setCurrencyState] = useState<CurrencyCode>(DEFAULT_CURRENCY);

  useEffect(() => {
    setCurrencyState(readStoredCurrency());
  }, []);

  const setCurrency = useCallback((code: CurrencyCode) => {
    setCurrencyState(code);
    try {
      window.localStorage.setItem(STORAGE_KEY, code);
    } catch {
      // Private mode or blocked storage — the choice just won't persist.
    }
  }, []);

  const format = useCallback(
    (gbpMinor: number) => formatInCurrency(gbpMinor, currency),
    [currency],
  );

  const value = useMemo<CurrencyContextValue>(
    () => ({ currency, setCurrency, format }),
    [currency, setCurrency, format],
  );

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);

  if (!context) {
    throw new Error("useCurrency must be used inside a CurrencyProvider");
  }

  return context;
}

export { getCurrency };
