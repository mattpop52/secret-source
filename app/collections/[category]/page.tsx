import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/product-card";
import {
  CATEGORIES,
  getBrandsInCategory,
  getCategory,
  getProductsByCategory,
  isSoldOut,
} from "@/lib/catalog";
import { SHOP_INSTAGRAM, SHOP_INSTAGRAM_URL } from "@/lib/constants";

export function generateStaticParams() {
  return CATEGORIES.map((category) => ({ category: category.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category: categorySlug } = await params;
  const category = getCategory(categorySlug);

  if (!category) {
    return { title: "Not found" };
  }

  return {
    title: category.name,
    description: `${category.name} — ${category.line} Checked in-house, shipped tracked from the UK.`,
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category: categorySlug } = await params;
  const category = getCategory(categorySlug);

  if (!category) {
    notFound();
  }

  const brandsHere = getBrandsInCategory(categorySlug);
  // In-stock first: a shelf shows what you can actually buy before what you
  // can't, however tempting it is to lead with the piece everyone wants.
  const products = [...getProductsByCategory(categorySlug)].sort(
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
            / Collection
          </p>
          <h1 className="ss-display ss-display-shadow mt-4 text-[clamp(2.5rem,9vw,5.5rem)]">
            {category.name}
          </h1>
          <p className="mt-3 max-w-xl text-[var(--ss-smoke)]">
            {category.line}
          </p>
          <p className="ss-stencil mt-5 text-[0.62rem] text-[var(--ss-smoke)]">
            {products.length} listed · {available} ready to ship
          </p>
        </div>
      </header>

      {/* Brand subcategory row — every brand stocked inside this category. */}
      <nav
        aria-label="Brands"
        className="border-[var(--ss-hairline)] border-b bg-[var(--ss-pitch)]"
      >
        <ul className="mx-auto flex max-w-[1240px] gap-1 overflow-x-auto px-4 py-3 sm:px-6">
          <li>
            <Link
              aria-current="page"
              className="ss-stencil block whitespace-nowrap border border-[var(--ss-orange)] bg-[var(--ss-orange)] px-4 py-2.5 text-[#120c00] text-[0.62rem]"
              href={`/collections/${category.slug}`}
            >
              All {category.name}
            </Link>
          </li>
          {brandsHere.map((brand) => (
            <li key={brand.slug}>
              <Link
                className="ss-stencil block whitespace-nowrap border border-[var(--ss-hairline)] px-4 py-2.5 text-[0.62rem] text-[var(--ss-bone)]/70 transition-colors hover:border-[var(--ss-orange)] hover:text-[var(--ss-orange)]"
                href={`/collections/${category.slug}/${brand.slug}`}
              >
                {brand.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <section className="mx-auto max-w-[1240px] px-4 py-12 sm:px-6 sm:py-16">
        {products.length === 0 ? (
          <div className="ss-docket px-8 py-16 text-center">
            <h2 className="ss-display text-3xl">Shelf's empty here</h2>
            <p className="mx-auto mt-3 max-w-sm text-[var(--ss-smoke)] text-sm">
              Nothing from this one is in hand right now. Say what you're after
              and it can usually be sourced inside a week.
            </p>
            <a
              className="ss-stencil mt-6 inline-block bg-[var(--ss-orange)] px-6 py-3.5 text-[#120c00] text-[0.7rem] transition-colors hover:bg-[var(--ss-orange-hot)]"
              href={SHOP_INSTAGRAM_URL}
              rel="noreferrer"
              target="_blank"
            >
              DM @{SHOP_INSTAGRAM}
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-4">
            {products.map((product, index) => (
              <ProductCard
                key={product.slug}
                priority={index < 4}
                product={product}
              />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
