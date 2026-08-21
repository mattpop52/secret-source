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
import { getProduct, type Product } from "@/lib/catalog";

const STORAGE_KEY = "secret-source-cart-v1";

export type CartLine = {
  slug: string;
  size: string;
  quantity: number;
};

export type ResolvedLine = CartLine & {
  product: Product;
  lineTotal: number;
};

type CartContextValue = {
  lines: ResolvedLine[];
  count: number;
  subtotal: number;
  isOpen: boolean;
  /** False until localStorage has been read, so the badge never flashes a stale 0. */
  hydrated: boolean;
  add: (line: CartLine) => void;
  setQuantity: (slug: string, size: string, quantity: number) => void;
  remove: (slug: string, size: string) => void;
  clear: () => void;
  openCart: () => void;
  closeCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function readStoredLines(): CartLine[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    // Drop anything that no longer matches the catalogue — a saved basket
    // outlives a stock update, and a line pointing at a deleted product
    // would otherwise break every page that renders the cart.
    return parsed.filter(
      (line): line is CartLine =>
        typeof line?.slug === "string" &&
        typeof line?.size === "string" &&
        Number.isFinite(line?.quantity) &&
        line.quantity > 0 &&
        Boolean(getProduct(line.slug)),
    );
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setLines(readStoredLines());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  }, [lines, hydrated]);

  const add = useCallback((line: CartLine) => {
    setLines((current) => {
      const existing = current.find(
        (item) => item.slug === line.slug && item.size === line.size,
      );

      if (existing) {
        return current.map((item) =>
          item === existing
            ? { ...item, quantity: Math.min(item.quantity + line.quantity, 9) }
            : item,
        );
      }

      return [...current, { ...line, quantity: Math.min(line.quantity, 9) }];
    });
    setIsOpen(true);
  }, []);

  const setQuantity = useCallback(
    (slug: string, size: string, quantity: number) => {
      setLines((current) =>
        quantity <= 0
          ? current.filter(
              (item) => !(item.slug === slug && item.size === size),
            )
          : current.map((item) =>
              item.slug === slug && item.size === size
                ? { ...item, quantity: Math.min(quantity, 9) }
                : item,
            ),
      );
    },
    [],
  );

  const remove = useCallback((slug: string, size: string) => {
    setLines((current) =>
      current.filter((item) => !(item.slug === slug && item.size === size)),
    );
  }, []);

  const clear = useCallback(() => setLines([]), []);
  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const resolved = useMemo(() => {
    const items: ResolvedLine[] = [];

    for (const line of lines) {
      const product = getProduct(line.slug);
      if (product) {
        items.push({
          ...line,
          product,
          lineTotal: product.priceCents * line.quantity,
        });
      }
    }

    return items;
  }, [lines]);

  const value = useMemo<CartContextValue>(
    () => ({
      lines: resolved,
      count: resolved.reduce((total, line) => total + line.quantity, 0),
      subtotal: resolved.reduce((total, line) => total + line.lineTotal, 0),
      isOpen,
      hydrated,
      add,
      setQuantity,
      remove,
      clear,
      openCart,
      closeCart,
    }),
    [
      resolved,
      isOpen,
      hydrated,
      add,
      setQuantity,
      remove,
      clear,
      openCart,
      closeCart,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside a CartProvider");
  }

  return context;
}
