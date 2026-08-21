import Link from "next/link";
import { LogoBadge, PlugMark } from "@/components/logo";
import { ProductCard } from "@/components/product-card";
import { ProductMedia } from "@/components/product-media";
import { Section, SectionHeading } from "@/components/section";
import { Splash } from "@/components/splash";
import { TapeMarquee } from "@/components/tape-marquee";
import {
  BRANDS,
  formatPrice,
  getBrandName,
  getProductsByBrand,
  PRODUCTS,
} from "@/lib/catalog";
import {
  DELIVERY_WINDOW,
  FREE_SHIPPING_THRESHOLD,
  RETURNS_WINDOW,
  SHOP_INSTAGRAM,
  SHOP_INSTAGRAM_URL,
} from "@/lib/constants";

const featured = PRODUCTS[0];

const CHECKS = [
  {
    title: "In hand before it's listed",
    body: "Nothing on this shelf is a pre-order or a group buy. If it's up, it's boxed in the room and it ships this week.",
  },
  {
    title: "Checked piece by piece",
    body: "Stitching, tags, hardware, box, and the receipt trail behind it. Anything that doesn't sit right never makes the shelf.",
  },
  {
    title: "Backed after it lands",
    body: `Not right? ${RETURNS_WINDOW} to send it back. Not authentic? Full refund, no argument, and you keep the receipts.`,
  },
];

const STEPS = [
  {
    step: "01",
    title: "Pick your size",
    body: "Struck-through sizes are gone — what's left is on the shelf right now.",
  },
  {
    step: "02",
    title: "Pay how you like",
    body: "Card, Apple Pay or Google Pay through Stripe. Nothing touches this site.",
  },
  {
    step: "03",
    title: "Track it in",
    body: `Packed the same day, tracked to your door in ${DELIVERY_WINDOW}.`,
  },
];

export default function SecretSourceHome() {
  return (
    <>
      <Splash />

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="ss-grain relative overflow-hidden border-[var(--ss-hairline)] border-b">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.14]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(-45deg, var(--ss-orange) 0 3px, transparent 3px 22px)",
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(60% 50% at 15% 0%, rgb(250 167 3 / 22%) 0%, transparent 68%)",
          }}
        />

        <div className="relative mx-auto grid max-w-[1240px] items-center gap-12 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[1.15fr_0.85fr] lg:py-28">
          <div>
            <p className="ss-stencil flex items-center gap-3 text-[0.7rem] text-[var(--ss-orange)]">
              <PlugMark className="size-4" />
              Secret Source · UK
            </p>

            <h1 className="ss-display ss-display-shadow mt-5 text-[clamp(3rem,10.5vw,7.5rem)] leading-[0.84]">
              Your plug for all
              <br />
              <span className="text-[var(--ss-orange)]">drip</span> necessities
            </h1>

            <p className="mt-6 max-w-md text-[var(--ss-smoke)] text-base leading-relaxed sm:text-lg">
              Trapstar, Syna World, Broken Planet, Corteiz, Jordan and Yeezy —
              held in hand, checked, and shipped tracked from the UK. No waiting
              lists, no bot queues, no maybe.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                className="ss-stencil bg-[var(--ss-orange)] px-8 py-4 text-[#120c00] text-[0.8rem] transition-colors hover:bg-[var(--ss-orange-hot)]"
                href="/collections/all"
              >
                Shop the shelf
              </Link>
              <Link
                className="ss-stencil border border-[var(--ss-hairline-strong)] px-8 py-4 text-[0.8rem] transition-colors hover:border-[var(--ss-orange)] hover:text-[var(--ss-orange)]"
                href="/authenticity"
              >
                How we legit check
              </Link>
            </div>

            <dl className="mt-10 grid max-w-lg grid-cols-3 gap-px border border-[var(--ss-hairline)] bg-[var(--ss-hairline)]">
              {[
                { term: "Brands", value: BRANDS.length.toString() },
                { term: "Lines in stock", value: PRODUCTS.length.toString() },
                {
                  term: "Free delivery over",
                  value: formatPrice(FREE_SHIPPING_THRESHOLD),
                },
              ].map((stat) => (
                <div className="bg-[var(--ss-black)] px-4 py-4" key={stat.term}>
                  <dt className="ss-stencil text-[0.55rem] text-[var(--ss-smoke)]">
                    {stat.term}
                  </dt>
                  <dd className="ss-num mt-1 text-[var(--ss-orange)] text-xl">
                    {stat.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/* The week's drop, pinned like a card taped to the wall. */}
          <Link
            className="group relative block"
            href={`/products/${featured.slug}`}
          >
            <span className="ss-stencil -rotate-3 -top-3 absolute left-4 z-10 bg-[var(--ss-orange)] px-3 py-1.5 text-[#120c00] text-[0.62rem]">
              This week's drop
            </span>
            <div className="ss-crate transition-colors duration-300 group-hover:border-[var(--ss-orange)]">
              <div className="relative aspect-[4/5] overflow-hidden">
                <div className="h-full w-full transition-transform duration-500 group-hover:scale-[1.03]">
                  <ProductMedia
                    priority
                    product={featured}
                    sizes="(min-width: 1024px) 40vw, 92vw"
                  />
                </div>
              </div>
              <div className="flex items-end justify-between gap-4 border-[var(--ss-hairline)] border-t px-5 py-4">
                <div>
                  <p className="ss-stencil text-[0.62rem] text-[var(--ss-orange)]">
                    {getBrandName(featured.brand)}
                  </p>
                  <h2 className="mt-1 font-semibold text-lg leading-tight">
                    {featured.name}
                  </h2>
                  <p className="mt-1 flex items-baseline gap-2">
                    <span className="ss-num text-base">
                      {formatPrice(featured.priceCents)}
                    </span>
                    {featured.compareAtCents && (
                      <span className="ss-num text-[var(--ss-sold)] text-xs line-through">
                        {formatPrice(featured.compareAtCents)}
                      </span>
                    )}
                  </p>
                </div>
                <span
                  aria-hidden="true"
                  className="ss-stencil shrink-0 pb-1 text-[0.62rem] text-[var(--ss-orange)] transition-transform duration-300 group-hover:translate-x-1"
                >
                  →
                </span>
              </div>
            </div>
          </Link>
        </div>
      </section>

      <TapeMarquee
        items={["Authentic", "Checked", "Sealed", "Shipped", "Tracked"]}
      />

      {/* ── Brands ────────────────────────────────────────────────────── */}
      <Section>
        <SectionHeading
          action={
            <Link
              className="ss-stencil border border-[var(--ss-hairline-strong)] px-5 py-3 text-[0.7rem] transition-colors hover:border-[var(--ss-orange)] hover:text-[var(--ss-orange)]"
              href="/collections/all"
            >
              Everything in stock
            </Link>
          }
          index="01"
          label="What's plugged in"
          title="The brands on the shelf"
        />

        <ul className="mt-10 grid gap-px bg-[var(--ss-hairline)] sm:grid-cols-2 lg:grid-cols-3">
          {BRANDS.map((brand) => {
            const count = getProductsByBrand(brand.slug).length;

            return (
              <li key={brand.slug}>
                <Link
                  className="group flex h-full flex-col justify-between gap-6 bg-[var(--ss-black)] px-6 py-8 transition-colors hover:bg-[var(--ss-panel)]"
                  href={`/collections/${brand.slug}`}
                >
                  <span className="flex items-start justify-between gap-4">
                    <span className="ss-display text-[clamp(1.75rem,3vw,2.5rem)] leading-[0.95] transition-colors group-hover:text-[var(--ss-orange)]">
                      {brand.name}
                    </span>
                    <span className="ss-num shrink-0 border border-[var(--ss-hairline)] px-2 py-1 text-[0.62rem] text-[var(--ss-smoke)]">
                      {count.toString().padStart(2, "0")}
                    </span>
                  </span>
                  <span className="flex items-end justify-between gap-4">
                    <span className="text-[var(--ss-smoke)] text-sm">
                      {brand.line}
                    </span>
                    <span
                      aria-hidden="true"
                      className="ss-stencil -translate-x-2 shrink-0 text-[0.7rem] text-[var(--ss-orange)] opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100"
                    >
                      Shop →
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </Section>

      {/* ── The shelf ─────────────────────────────────────────────────── */}
      <Section className="border-[var(--ss-hairline)] border-t bg-[var(--ss-pitch)]">
        <SectionHeading
          action={
            <Link
              className="ss-stencil text-[0.7rem] text-[var(--ss-orange)] underline underline-offset-4 hover:text-[var(--ss-orange-hot)]"
              href="/collections/all"
            >
              See all {PRODUCTS.length} →
            </Link>
          }
          index="02"
          label="In hand right now"
          title="On the shelf"
        />

        <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-4">
          {PRODUCTS.slice(0, 8).map((product, index) => (
            <ProductCard
              key={product.slug}
              priority={index < 2}
              product={product}
            />
          ))}
        </div>
      </Section>

      {/* ── Legit check ───────────────────────────────────────────────── */}
      <Section>
        <SectionHeading
          index="03"
          label="Why people order twice"
          title={
            <>
              Checked before it's
              <br />
              anywhere near you
            </>
          }
        />

        <div className="mt-10 grid gap-px bg-[var(--ss-hairline)] lg:grid-cols-3">
          {CHECKS.map((check) => (
            <article
              className="bg-[var(--ss-black)] px-7 py-8"
              key={check.title}
            >
              <PlugMark className="size-7 text-[var(--ss-orange)]" />
              <h3 className="ss-display mt-5 text-2xl">{check.title}</h3>
              <p className="mt-3 text-[var(--ss-smoke)] text-sm leading-relaxed">
                {check.body}
              </p>
            </article>
          ))}
        </div>

        <Link
          className="ss-stencil mt-8 inline-block border border-[var(--ss-hairline-strong)] px-6 py-3.5 text-[0.7rem] transition-colors hover:border-[var(--ss-orange)] hover:text-[var(--ss-orange)]"
          href="/authenticity"
        >
          Read the full legit check
        </Link>
      </Section>

      <TapeMarquee
        items={["No bots", "No queues", "No maybes", "Just the plug"]}
        tone="outline"
      />

      {/* ── How it works ──────────────────────────────────────────────── */}
      <Section>
        <SectionHeading index="04" label="Ordering" title="Three steps, done" />

        <ol className="mt-10 grid gap-px bg-[var(--ss-hairline)] lg:grid-cols-3">
          {STEPS.map((step) => (
            <li className="bg-[var(--ss-black)] px-7 py-8" key={step.step}>
              <span className="ss-num bg-[var(--ss-orange)] px-2 py-1 text-[#120c00] text-sm">
                {step.step}
              </span>
              <h3 className="ss-display mt-5 text-2xl">{step.title}</h3>
              <p className="mt-3 text-[var(--ss-smoke)] text-sm leading-relaxed">
                {step.body}
              </p>
            </li>
          ))}
        </ol>
      </Section>

      {/* ── Sourcing ──────────────────────────────────────────────────── */}
      <Section className="border-[var(--ss-hairline)] border-t bg-[var(--ss-pitch)]">
        <div className="ss-grain relative overflow-hidden border border-[var(--ss-hairline)] px-6 py-14 text-center sm:px-12">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-[0.12]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(-45deg, var(--ss-orange) 0 3px, transparent 3px 20px)",
            }}
          />
          <div className="relative mx-auto max-w-2xl">
            <LogoBadge className="mx-auto size-20" size={160} />
            <h2 className="ss-display ss-display-shadow mt-6 text-[clamp(2rem,6vw,3.5rem)]">
              Not on the shelf? Ask.
            </h2>
            <p className="mt-4 text-[var(--ss-smoke)]">
              Most pieces can be sourced within the week — size, colourway and
              condition to spec. Send the link, get a price back.
            </p>
            <a
              className="ss-stencil mt-7 inline-block bg-[var(--ss-orange)] px-8 py-4 text-[#120c00] text-[0.8rem] transition-colors hover:bg-[var(--ss-orange-hot)]"
              href={SHOP_INSTAGRAM_URL}
              rel="noreferrer"
              target="_blank"
            >
              DM @{SHOP_INSTAGRAM}
            </a>
          </div>
        </div>
      </Section>
    </>
  );
}
