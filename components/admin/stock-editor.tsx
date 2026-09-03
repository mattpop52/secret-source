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
  sizes: StockSize[];
};

const INPUT_CLASS =
  "border border-[var(--ss-hairline-strong)] bg-[var(--ss-black)] px-3 py-2 text-[0.75rem] text-[var(--ss-bone)] transition-colors placeholder:text-[var(--ss-smoke)] hover:border-[var(--ss-orange)] focus-visible:border-[var(--ss-orange)]";

function buildOverrides(
  products: StockProduct[],
): Record<string, Record<string, boolean>> {
  const overrides: Record<string, Record<string, boolean>> = {};

  for (const product of products) {
    overrides[product.slug] = Object.fromEntries(
      product.sizes.map((size) => [size.label, size.inStock]),
    );
  }

  return overrides;
}

export function StockEditor({
  initialProducts,
}: {
  initialProducts: StockProduct[];
}) {
  const [products, setProducts] = useState(initialProducts);
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

  async function handleSave() {
    setSaving(true);

    try {
      const response = await fetch("/api/admin/stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ overrides: buildOverrides(products) }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        toast.error(payload?.error ?? "Could not save stock changes.");
        return;
      }

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
          <h1 className="ss-display text-3xl">Stock</h1>
          <p className="mt-1 text-[var(--ss-smoke)] text-sm">
            {filtered.length} of {products.length} products shown. Toggle sizes,
            then save.
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
          <li
            className="flex flex-wrap items-center justify-between gap-4 py-4"
            key={product.slug}
          >
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
