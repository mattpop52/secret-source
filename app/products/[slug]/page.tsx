import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CategoryName } from "@/components/category-name";
import { PlugMark } from "@/components/logo";
import { Price } from "@/components/price";
import { ProductBuyBox } from "@/components/product-buy-box";
import { ProductCard } from "@/components/product-card";
import { ProductMedia } from "@/components/product-media";
import { TapeMarquee } from "@/components/tape-marquee";
import {
  discountPercent,
  getBrandName,
  getCategoryName,
  getProduct,
  getRelatedProducts,
  isSoldOut,
  PRODUCTS,
} from "@/lib/catalog";
import {
  DELIVERY_WINDOW,
  FREE_SHIPPING_THRESHOLD,
  RETURNS_WINDOW,
  SHOP_INSTAGRAM,
  SHOP_INSTAGRAM_URL,
  STANDARD_SHIPPING,
} from "@/lib/constants";

export function generateStaticParams() {
  return PRODUCTS.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);

  if (!product) {
    return { title: "Not found" };
  }

  return {
    title: `${getBrandName(product.brand)} ${product.name} — ${product.colourway.name}`,
    description: product.blurb,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getProduct(slug);

  if (!product) {
    notFound();
  }

  const brandName = getBrandName(product.brand);
  const categoryName = getCategoryName(product.category);
  const discount = discountPercent(product);
  const soldOut = isSoldOut(product);
  const related = getRelatedProducts(product);

  const docket = [
    { term: "Docket", value: product.code },
    { term: "Colourway", value: product.colourway.name },
    { term: "Condition", value: "Deadstock" },
    { term: "Ships from", value: "United Kingdom" },
  ];

  return (
    <>
      <nav
        aria-label="Breadcrumb"
        className="border-[var(--ss-hairline)] border-b"
      >
        <ol className="ss-stencil mx-auto flex max-w-[1240px] flex-wrap items-center gap-2 px-4 py-3 text-[0.62rem] text-[var(--ss-smoke)] sm:px-6">
          <li>
            <Link className="hover:text-[var(--ss-bone)]" href="/">
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link
              className="hover:text-[var(--ss-bone)]"
              href={`/collections/${product.category}`}
            >
              <CategoryName fallback={categoryName} slug={product.category} />
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link
              className="hover:text-[var(--ss-bone)]"
              href={`/collections/${product.category}/${product.brand}`}
            >
              {brandName}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="text-[var(--ss-bone)]">{product.name}</li>
        </ol>
      </nav>

      <div className="mx-auto grid max-w-[1240px] gap-10 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:py-14">
        {/* ── Media ───────────────────────────────────────────────────── */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="relative aspect-[4/5] overflow-hidden border border-[var(--ss-hairline)] bg-[var(--ss-panel)]">
            <ProductMedia
              priority
              product={product}
              sizes="(min-width: 1024px) 48vw, 92vw"
            />

            {discount !== null && (
              <span className="ss-stencil absolute top-4 left-4 bg-[var(--ss-orange)] px-3 py-1.5 text-[#120c00] text-[0.62rem]">
                Save {discount}%
              </span>
            )}
            {soldOut && (
              <span className="ss-stencil absolute top-4 right-4 border border-[var(--ss-hairline-strong)] bg-[var(--ss-black)]/85 px-3 py-1.5 text-[0.62rem] text-[var(--ss-smoke)]">
                Sold out
              </span>
            )}
          </div>

          <dl className="ss-docket mt-4 grid grid-cols-2 gap-x-6 gap-y-4 px-5 py-5 sm:grid-cols-4">
            {docket.map((entry) => (
              <div key={entry.term}>
                <dt className="ss-stencil text-[0.55rem] text-[var(--ss-smoke)]">
                  {entry.term}
                </dt>
                <dd className="ss-num mt-1 text-[0.8rem]">{entry.value}</dd>
              </div>
            ))}
          </dl>

          {/* The check log for this specific piece — the left column's answer
              to the question the right column's price just raised. */}
          <div className="mt-4 hidden border border-[var(--ss-hairline)] px-5 py-5 lg:block">
            <h2 className="ss-stencil text-[0.62rem] text-[var(--ss-orange)]">
              Check log · {product.code}
            </h2>
            <ul className="mt-4 grid gap-2.5">
              {[
                "Sourced from a known account",
                "Opened, inspected, photographed",
                "Tags, hardware and packaging matched",
                "Bagged and shelved for dispatch",
              ].map((line) => (
                <li className="flex items-start gap-3 text-sm" key={line}>
                  <span className="ss-num mt-px text-[var(--ss-orange)] text-xs">
                    ✓
                  </span>
                  <span className="text-[var(--ss-smoke)]">{line}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── Buy ─────────────────────────────────────────────────────── */}
        {/* biome-ignore lint/correctness/useUniqueElementIds: a page-level anchor target for the mobile buy bar */}
        <div id="buy">
          <p className="ss-stencil text-[0.7rem] text-[var(--ss-orange)]">
            {brandName}
          </p>
          <h1 className="ss-display ss-display-shadow mt-3 text-[clamp(2.25rem,6.5vw,4rem)]">
            {product.name}
          </h1>
          <p className="mt-2 text-[var(--ss-smoke)]">
            {product.colourway.name}
          </p>

          <div className="mt-6 flex flex-wrap items-baseline gap-3">
            <span className="ss-num text-3xl">
              <Price cents={product.priceCents} />
            </span>
            {product.compareAtCents && (
              <span className="ss-num text-[var(--ss-sold)] text-lg line-through">
                <Price cents={product.compareAtCents} />
              </span>
            )}
            <span className="ss-stencil text-[0.62rem] text-[var(--ss-smoke)]">
              Tax included · Delivery at checkout
            </span>
          </div>

          <p className="mt-6 max-w-prose text-[var(--ss-smoke)] leading-relaxed">
            {product.blurb}
          </p>

          <div className="mt-8 border-[var(--ss-hairline)] border-t pt-8">
            <ProductBuyBox product={product} />
          </div>

          <ul className="mt-8 grid gap-3 border-[var(--ss-hairline)] border-t pt-8">
            {[
              {
                key: "delivery-cost",
                line: (
                  <>
                    Free tracked delivery over{" "}
                    <Price cents={FREE_SHIPPING_THRESHOLD} /> — otherwise{" "}
                    <Price cents={STANDARD_SHIPPING} />
                  </>
                ),
              },
              {
                key: "delivery-window",
                line: `Packed same day, with you in ${DELIVERY_WINDOW}`,
              },
              {
                key: "returns-window",
                line: `${RETURNS_WINDOW} to send it back if it isn't right`,
              },
            ].map((entry) => (
              <li className="flex items-start gap-3 text-sm" key={entry.key}>
                <PlugMark className="mt-0.5 size-4 shrink-0 text-[var(--ss-orange)]" />
                <span className="text-[var(--ss-smoke)]">{entry.line}</span>
              </li>
            ))}
          </ul>

          <div className="mt-8 divide-y divide-[var(--ss-hairline)] border-[var(--ss-hairline)] border-y">
            <details className="group" open>
              <summary className="ss-stencil flex cursor-pointer list-none items-center justify-between py-4 text-[0.7rem]">
                The details
                <span className="text-[var(--ss-orange)] transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <ul className="space-y-2 pb-5 text-[var(--ss-smoke)] text-sm">
                {product.details.map((detail) => (
                  <li className="flex gap-2" key={detail}>
                    <span className="text-[var(--ss-orange)]">—</span>
                    {detail}
                  </li>
                ))}
              </ul>
            </details>

            <details className="group">
              <summary className="ss-stencil flex cursor-pointer list-none items-center justify-between py-4 text-[0.7rem]">
                Legit check
                <span className="text-[var(--ss-orange)] transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="pb-5 text-[var(--ss-smoke)] text-sm leading-relaxed">
                Docket {product.code} is checked in-house before it reaches the
                shelf — construction, hardware, tagging, packaging and the trail
                behind it. If anything you receive doesn't hold up, it comes
                back for a full refund.
              </p>
            </details>

            <details className="group">
              <summary className="ss-stencil flex cursor-pointer list-none items-center justify-between py-4 text-[0.7rem]">
                Delivery &amp; returns
                <span className="text-[var(--ss-orange)] transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="pb-5 text-[var(--ss-smoke)] text-sm leading-relaxed">
                Orders placed before 3pm are packed the same working day and
                sent tracked, arriving in {DELIVERY_WINDOW}. You have{" "}
                {RETURNS_WINDOW} from delivery to return anything unworn with
                its tags and packaging intact.{" "}
                <Link
                  className="text-[var(--ss-bone)] underline underline-offset-4"
                  href="/help#delivery"
                >
                  Full delivery and returns terms
                </Link>
                .
              </p>
            </details>

            <details className="group">
              <summary className="ss-stencil flex cursor-pointer list-none items-center justify-between py-4 text-[0.7rem]">
                Ask about this piece
                <span className="text-[var(--ss-orange)] transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="pb-5 text-[var(--ss-smoke)] text-sm leading-relaxed">
                Want more photos, measurements, or a size that's struck through?{" "}
                <a
                  className="text-[var(--ss-bone)] underline underline-offset-4"
                  href={SHOP_INSTAGRAM_URL}
                  rel="noreferrer"
                  target="_blank"
                >
                  DM @{SHOP_INSTAGRAM}
                </a>{" "}
                with docket {product.code} and you'll get a straight answer.
              </p>
            </details>
          </div>
        </div>
      </div>

      <TapeMarquee
        items={["In hand", "Checked", "Boxed", "Tracked", "Backed"]}
      />

      <section className="mx-auto max-w-[1240px] px-4 py-16 sm:px-6 sm:py-20">
        <h2 className="ss-display ss-display-shadow text-[clamp(1.75rem,4.5vw,2.75rem)]">
          Goes with it
        </h2>
        <div className="mt-8 grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-4">
          {related.map((item) => (
            <ProductCard key={item.slug} product={item} />
          ))}
        </div>
      </section>

      {/* Mobile buy bar — the price and the action stay reachable on a long page. */}
      <div className="sticky bottom-0 z-40 border-[var(--ss-hairline)] border-t bg-[var(--ss-black)]/95 px-4 py-3 backdrop-blur-md lg:hidden">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="truncate font-semibold text-sm">{product.name}</p>
            <p className="ss-num text-[var(--ss-orange)] text-sm">
              <Price cents={product.priceCents} />
            </p>
          </div>
          <a
            className="ss-stencil shrink-0 bg-[var(--ss-orange)] px-6 py-3 text-[#120c00] text-[0.7rem]"
            href="#buy"
          >
            {soldOut ? "See options" : "Pick a size"}
          </a>
        </div>
      </div>
    </>
  );
}
