"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";

export type StockSize = { label: string; inStock: boolean };

export type StockProduct = {
  slug: string;
  name: string;
  brand: string;
  category: string;
  colourway: string;
  priceCents: number;
  sizes: StockSize[];
};

/** A product plus the raw text of its price input — kept separate from
 *  priceCents so mid-edit states (clearing the field to retype it, a
 *  trailing decimal point) never get snapped back to a stale value while
 *  still typing. */
type EditableProduct = StockProduct & { priceInput: string };

const INPUT_CLASS =
  "border border-[var(--ss-hairline-strong)] bg-[var(--ss-black)] px-3 py-2 text-[0.75rem] text-[var(--ss-bone)] transition-colors placeholder:text-[var(--ss-smoke)] hover:border-[var(--ss-orange)] focus-visible:border-[var(--ss-orange)]";

function formatPounds(cents: number): string {
  return (cents / 100).toFixed(2);
}

/** Falls back to the last known-good price for anything that isn't a real,
 *  positive amount — an admin never accidentally zeroes out a price by
 *  clearing the field and saving before typing a new one. */
function parsePriceInput(input: string, fallbackCents: number): number {
  const value = Number.parseFloat(input);

  if (!Number.isFinite(value) || value <= 0) {
    return fallbackCents;
  }

  return Math.round(value * 100);
}

function toEditable(product: StockProduct): EditableProduct {
  return { ...product, priceInput: formatPounds(product.priceCents) };
}

function buildOverrides(
  products: EditableProduct[],
): Record<string, Record<string, boolean>> {
  const overrides: Record<string, Record<string, boolean>> = {};

  for (const product of products) {
    overrides[product.slug] = Object.fromEntries(
      product.sizes.map((size) => [size.label, size.inStock]),
    );
  }

  return overrides;
}

function buildPrices(products: EditableProduct[]): Record<string, number> {
  const prices: Record<string, number> = {};

  for (const product of products) {
    prices[product.slug] = parsePriceInput(
      product.priceInput,
      product.priceCents,
    );
  }

  return prices;
}

export function StockEditor({
  initialProducts,
}: {
  initialProducts: StockProduct[];
}) {
  const [products, setProducts] = useState<EditableProduct[]>(() =>
    initialProducts.map(toEditable),
  );
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const router = useRouter();

  const categories = useMemo(
    () => Array.from(new Set(initialProducts.map((p) => p.category))).sort(),
    [initialProducts],
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return products.filter((product) => {
      if (category !== "all" && product.category !== category) {
        return false;
      }

      if (!query) {
        return true;
      }

      return (
        product.name.toLowerCase().includes(query) ||
        product.brand.toLowerCase().includes(query) ||
        product.colourway.toLowerCase().includes(query) ||
        product.slug.toLowerCase().includes(query)
      );
    });
  }, [products, search, category]);

  function toggleSize(slug: string, label: string) {
    setDirty(true);
    setProducts((current) =>
      current.map((product) =>
        product.slug === slug
          ? {
              ...product,
              sizes: product.sizes.map((size) =>
                size.label === label
                  ? { ...size, inStock: !size.inStock }
                  : size,
              ),
            }
          : product,
      ),
    );
  }

  function setAll(slug: string, inStock: boolean) {
    setDirty(true);
    setProducts((current) =>
      current.map((product) =>
        product.slug === slug
          ? {
              ...product,
              sizes: product.sizes.map((size) => ({ ...size, inStock })),
            }
          : product,
      ),
    );
  }

  function setPriceInput(slug: string, priceInput: string) {
    setDirty(true);
    setProducts((current) =>
      current.map((product) =>
        product.slug === slug ? { ...product, priceInput } : product,
      ),
    );
  }

  /** Normalises (or reverts) the text the moment editing stops, so a half
   *  typed or invalid price never lingers on screen looking saved. */
  function normalisePrice(slug: string) {
    setProducts((current) =>
      current.map((product) =>
        product.slug === slug
          ? {
              ...product,
              priceInput: formatPounds(
                parsePriceInput(product.priceInput, product.priceCents),
              ),
            }
          : product,
      ),
    );
  }

  async function handleSave() {
    setSaving(true);

    try {
      const response = await fetch("/api/admin/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          overrides: buildOverrides(products),
          prices: buildPrices(products),
        }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        toast.error(payload?.error ?? "Could not save changes.");
        return;
      }

      // Re-anchor priceCents/priceInput to what was actually saved, so the
      // next edit's "revert on invalid" fallback is the saved value, not
      // whatever was loaded when the page first opened.
      setProducts((current) =>
        current.map((product) => ({
          ...product,
          priceCents: parsePriceInput(product.priceInput, product.priceCents),
        })),
      );
      setDirty(false);
      toast.success("Saved — live on the site in a minute or two.");
    } catch {
      toast.error("Could not reach the server. Try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4 border-[var(--ss-hairline)] border-b pb-6">
        <div>
          <h1 className="ss-display text-3xl">Stock &amp; prices</h1>
          <p className="mt-1 text-[var(--ss-smoke)] text-sm">
            {filtered.length} of {products.length} products shown. Toggle sizes
            or edit a price, then save.
          </p>
        </div>
        <button
          className="ss-stencil border border-[var(--ss-hairline-strong)] px-4 py-2.5 text-[0.65rem] text-[var(--ss-bone)]/75 transition-colors hover:border-[var(--ss-orange)] hover:text-[var(--ss-orange)]"
          onClick={handleLogout}
          type="button"
        >
          Log out
        </button>
      </div>

      <div className="sticky top-16 z-10 mt-6 flex flex-wrap items-center gap-3 border-[var(--ss-hairline)] border-b bg-[var(--ss-black)] py-4">
        <input
          className={`${INPUT_CLASS} min-w-0 flex-1`}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by name, brand or colourway…"
          type="text"
          value={search}
        />
        <select
          className={INPUT_CLASS}
          onChange={(event) => setCategory(event.target.value)}
          value={category}
        >
          <option value="all">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <button
          className="ss-stencil bg-[var(--ss-orange)] px-6 py-2.5 text-[#120c00] text-[0.7rem] transition-colors hover:bg-[var(--ss-orange-hot)] disabled:opacity-60"
          disabled={!dirty || saving}
          onClick={handleSave}
          type="button"
        >
          {saving ? "Saving…" : dirty ? "Save changes" : "Saved"}
        </button>
      </div>

      <ul className="divide-y divide-[var(--ss-hairline)]">
        {filtered.map((product) => (
          <li className="flex flex-col gap-3 py-4" key={product.slug}>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="ss-stencil text-[0.6rem] text-[var(--ss-orange)]">
                  {product.category} · {product.brand}
                </p>
                <p className="mt-1 font-semibold">
                  {product.name}{" "}
                  <span className="font-normal text-[var(--ss-smoke)]">
                    — {product.colourway}
                  </span>
                </p>
              </div>

              <label className="flex items-center gap-1.5">
                <span className="ss-stencil text-[0.62rem] text-[var(--ss-smoke)]">
                  £
                </span>
                <input
                  className={`${INPUT_CLASS} w-24`}
                  inputMode="decimal"
                  onBlur={() => normalisePrice(product.slug)}
                  onChange={(event) =>
                    setPriceInput(product.slug, event.target.value)
                  }
                  value={product.priceInput}
                />
              </label>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {product.sizes.map((size) => (
                <button
                  className={`ss-stencil border px-3 py-2 text-[0.62rem] transition-colors ${
                    size.inStock
                      ? "border-[var(--ss-orange)] text-[var(--ss-orange)]"
                      : "border-[var(--ss-hairline-strong)] text-[var(--ss-smoke)] line-through"
                  }`}
                  key={size.label}
                  onClick={() => toggleSize(product.slug, size.label)}
                  type="button"
                >
                  {size.label}
                </button>
              ))}

              <div className="ml-2 flex gap-1.5">
                <button
                  className="text-[0.62rem] text-[var(--ss-smoke)] underline underline-offset-4 hover:text-[var(--ss-bone)]"
                  onClick={() => setAll(product.slug, true)}
                  type="button"
                >
                  All in
                </button>
                <span className="text-[var(--ss-smoke)]">/</span>
                <button
                  className="text-[0.62rem] text-[var(--ss-smoke)] underline underline-offset-4 hover:text-[var(--ss-bone)]"
                  onClick={() => setAll(product.slug, false)}
                  type="button"
                >
                  all out
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
