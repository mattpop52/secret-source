import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CategoryName } from "@/components/category-name";
import { ProductCard } from "@/components/product-card";
import {
  CATEGORIES,
  getBrand,
  getBrandsInCategory,
  getCategory,
  getProductsByCategoryAndBrand,
  isSoldOut,
} from "@/lib/catalog";
import { SHOP_INSTAGRAM, SHOP_INSTAGRAM_URL } from "@/lib/constants";

export function generateStaticParams() {
  return CATEGORIES.flatMap((category) =>
    getBrandsInCategory(category.slug).map((brand) => ({
      category: category.slug,
      brand: brand.slug,
    })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; brand: string }>;
}): Promise<Metadata> {
  const { category: categorySlug, brand: brandSlug } = await params;
  const category = getCategory(categorySlug);
  const brand = getBrand(brandSlug);

  if (!(category && brand)) {
    return { title: "Not found" };
  }

  return {
    title: `${brand.name} ${category.name}`,
    description: `${brand.name} ${category.name.toLowerCase()} — ${brand.line} Checked in-house, shipped tracked worldwide.`,
  };
}

export default async function CategoryBrandPage({
  params,
}: {
  params: Promise<{ category: string; brand: string }>;
}) {
  const { category: categorySlug, brand: brandSlug } = await params;
  const category = getCategory(categorySlug);
  const brand = getBrand(brandSlug);

  if (!(category && brand)) {
    notFound();
  }

  const brandsHere = getBrandsInCategory(categorySlug);
  const products = [
    ...getProductsByCategoryAndBrand(categorySlug, brandSlug),
  ].sort((a, b) => Number(isSoldOut(a)) - Number(isSoldOut(b)));
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
            /{" "}
            <Link
              className="hover:underline"
              href={`/collections/${category.slug}`}
            >
              <CategoryName fallback={category.name} slug={category.slug} />
            </Link>{" "}
            / {brand.name}
          </p>
          <h1 className="ss-display ss-display-shadow mt-4 text-[clamp(2.5rem,9vw,5.5rem)]">
            {brand.name}
          </h1>
          <p className="mt-3 max-w-xl text-[var(--ss-smoke)]">{brand.line}</p>
          <p className="ss-stencil mt-5 text-[0.62rem] text-[var(--ss-smoke)]">
            {products.length} listed · {available} ready to ship
          </p>
        </div>
      </header>

      <nav
        aria-label="Brands"
        className="border-[var(--ss-hairline)] border-b bg-[var(--ss-pitch)]"
      >
        <ul className="mx-auto flex max-w-[1240px] gap-1 overflow-x-auto px-4 py-3 sm:px-6">
          <li>
            <Link
              className="ss-stencil block whitespace-nowrap border border-[var(--ss-hairline)] px-4 py-2.5 text-[0.62rem] text-[var(--ss-bone)]/70 transition-colors hover:border-[var(--ss-orange)] hover:text-[var(--ss-orange)]"
              href={`/collections/${category.slug}`}
            >
              All <CategoryName fallback={category.name} slug={category.slug} />
            </Link>
          </li>
          {brandsHere.map((entry) => {
            const active = entry.slug === brandSlug;

            return (
              <li key={entry.slug}>
                <Link
                  aria-current={active ? "page" : undefined}
                  className={`ss-stencil block whitespace-nowrap border px-4 py-2.5 text-[0.62rem] transition-colors ${
                    active
                      ? "border-[var(--ss-orange)] bg-[var(--ss-orange)] text-[#120c00]"
                      : "border-[var(--ss-hairline)] text-[var(--ss-bone)]/70 hover:border-[var(--ss-orange)] hover:text-[var(--ss-orange)]"
                  }`}
                  href={`/collections/${category.slug}/${entry.slug}`}
                >
                  {entry.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <section className="mx-auto max-w-[1240px] px-4 py-12 sm:px-6 sm:py-16">
        {products.length === 0 ? (
          <div className="ss-docket px-8 py-16 text-center">
            <h2 className="ss-display text-3xl">Shelf's empty here</h2>
            <p className="mx-auto mt-3 max-w-sm text-[var(--ss-smoke)] text-sm">
              Nothing from {brand.name} in {category.name.toLowerCase()} is in
              hand right now. Say what you're after and it can usually be
              sourced inside a week.
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
