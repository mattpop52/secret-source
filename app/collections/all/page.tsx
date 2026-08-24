import type { Metadata } from "next";
import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import { isSoldOut, PRODUCTS } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Everything in stock",
  description:
    "Everything in stock — the whole shelf, in hand and ready to ship. Checked in-house, shipped tracked worldwide.",
};

export default function EverythingCollectionPage() {
  // In-stock first: a shelf shows what you can actually buy before what you
  // can't, however tempting it is to lead with the piece everyone wants.
  const products = [...PRODUCTS].sort(
    (a, b) => Number(isSoldOut(a)) - Number(isSoldOut(b)),
  );
  const available = products.filter((product) => !isSoldOut(product)).length;

  return (
    <>
      <header className="ss-grain relative overflow-hidden border-[var(--ss-hairline)] border-b">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.1]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(-45deg, var(--ss-orange) 0 3px, transparent 3px 20px)",
          }}
        />
        <div className="relative mx-auto max-w-[1240px] px-4 py-14 sm:px-6 sm:py-16">
          <p className="ss-stencil text-[0.62rem] text-[var(--ss-orange)]">
            <Link className="hover:underline" href="/">
              Secret Source
            </Link>{" "}
            / Everything
          </p>
          <h1 className="ss-display ss-display-shadow mt-4 text-[clamp(2.5rem,9vw,5.5rem)]">
            Everything in stock
          </h1>
          <p className="mt-3 max-w-xl text-[var(--ss-smoke)]">
            The whole shelf, in hand and ready to ship.
          </p>
          <p className="ss-stencil mt-5 text-[0.62rem] text-[var(--ss-smoke)]">
            {products.length} listed · {available} ready to ship
          </p>
        </div>
      </header>

      <section className="mx-auto max-w-[1240px] px-4 py-12 sm:px-6 sm:py-16">
        <div className="grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-4">
          {products.map((product, index) => (
            <ProductCard
              key={product.slug}
              priority={index < 4}
              product={product}
            />
          ))}
        </div>
      </section>
    </>
  );
}
