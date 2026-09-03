"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { CATEGORIES } from "@/lib/catalog";
import { useCart } from "./cart-provider";
import { CategoryName } from "./category-name";
import { useLanguage } from "./language-provider";
import { LogoBadge } from "./logo";
import { RegionPicker } from "./region-picker";

// Mirrors the "Help" list in the footer — kept as its own array here rather
// than shared, since the two live in otherwise-unrelated components.
const HELP_LINKS = [
  { href: "/help#delivery", key: "delivery" },
  { href: "/help#returns", key: "returns" },
  { href: "/help#sizing", key: "sizing" },
  { href: "/help#contact", key: "contact" },
] as const;

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden="true"
      className={`size-3 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
      fill="none"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M6 9l6 6 6-6"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.4"
      />
    </svg>
  );
}

export function SiteHeader() {
  const { count, openCart, hydrated } = useCart();
  const { t } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);
  const [inStockOpen, setInStockOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const pathname = usePathname();
  const inStockId = useId();
  const helpId = useId();

  // biome-ignore lint/correctness/useExhaustiveDependencies: the route change IS the trigger — the menu closes when navigation happens
  useEffect(() => {
    setMenuOpen(false);
    setInStockOpen(false);
    setHelpOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 border-[var(--ss-hairline)] border-b bg-[var(--ss-black)]/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1240px] items-center gap-4 px-4 sm:px-6">
        <button
          aria-expanded={menuOpen}
          aria-label={t("openMenu")}
          className="-ml-2 flex size-10 shrink-0 flex-col items-center justify-center gap-[5px] lg:hidden"
          onClick={() => setMenuOpen((open) => !open)}
          type="button"
        >
          <span
            className={`h-[2px] w-5 bg-[var(--ss-bone)] transition-transform ${menuOpen ? "translate-y-[7px] rotate-45" : ""}`}
          />
          <span
            className={`h-[2px] w-5 bg-[var(--ss-bone)] transition-opacity ${menuOpen ? "opacity-0" : ""}`}
          />
          <span
            className={`h-[2px] w-5 bg-[var(--ss-bone)] transition-transform ${menuOpen ? "-translate-y-[7px] -rotate-45" : ""}`}
          />
        </button>

        <Link className="flex shrink-0 items-center gap-3" href="/">
          <LogoBadge className="size-11" priority size={88} />
          <span className="ss-display hidden text-lg leading-[0.85] tracking-tight sm:block">
            Secret
            <br />
            Source
          </span>
        </Link>

        <nav
          aria-label="Categories"
          className="ml-auto hidden items-center gap-1 lg:flex"
        >
          {CATEGORIES.map((category) => (
            <Link
              className="ss-stencil whitespace-nowrap px-2 py-2 text-[0.62rem] text-[var(--ss-bone)]/70 transition-colors hover:text-[var(--ss-orange)]"
              href={`/collections/${category.slug}`}
              key={category.slug}
            >
              <CategoryName fallback={category.name} slug={category.slug} />
            </Link>
          ))}
          <Link
            className="ss-stencil px-2.5 py-2 text-[0.62rem] text-[var(--ss-bone)]/70 transition-colors hover:text-[var(--ss-orange)]"
            href="/collections/all"
          >
            {t("everything")}
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-2 lg:ml-4">
          <div className="hidden sm:block">
            <RegionPicker variant="compact" />
          </div>
          <button
            className="ss-stencil flex items-center gap-2 border border-[var(--ss-hairline-strong)] px-4 py-2.5 text-[0.7rem] transition-colors hover:border-[var(--ss-orange)] hover:text-[var(--ss-orange)]"
            onClick={openCart}
            type="button"
          >
            {t("basket")}
            <span className="ss-num min-w-[1.4rem] bg-[var(--ss-orange)] px-1 text-center text-[#120c00] text-[0.7rem] leading-5">
              {hydrated ? count : 0}
            </span>
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav
          aria-label="Menu"
          className="border-[var(--ss-hairline)] border-t bg-[var(--ss-pitch)] lg:hidden"
        >
          <div className="mx-auto max-w-[1240px]">
            <button
              aria-controls={inStockId}
              aria-expanded={inStockOpen}
              className="ss-stencil flex w-full items-center justify-between border-[var(--ss-hairline)] border-b px-4 py-4 text-[0.7rem] transition-colors hover:text-[var(--ss-orange)]"
              onClick={() => setInStockOpen((open) => !open)}
              type="button"
            >
              {t("inStock")}
              <Chevron open={inStockOpen} />
            </button>

            {inStockOpen && (
              // Per-tile borders rather than the gap-px-over-hairline-background
              // trick: with a category count that keeps growing (and no
              // guarantee it lands on an even number), a shared background
              // showing through the gaps leaves an unfilled grid cell exposed
              // as a stray solid box whenever the count is odd.
              <ul
                className="grid grid-cols-2 border-l border-[var(--ss-hairline)]"
                id={inStockId}
              >
                {CATEGORIES.map((category) => (
                  <li
                    className="border-r border-b border-[var(--ss-hairline)]"
                    key={category.slug}
                  >
                    <Link
                      className="ss-stencil block bg-[var(--ss-pitch)] px-4 py-4 text-[0.7rem] transition-colors hover:bg-[var(--ss-panel)] hover:text-[var(--ss-orange)]"
                      href={`/collections/${category.slug}`}
                    >
                      <CategoryName
                        fallback={category.name}
                        slug={category.slug}
                      />
                    </Link>
                  </li>
                ))}
                <li className="col-span-2 border-r border-b border-[var(--ss-hairline)]">
                  <Link
                    className="ss-stencil block bg-[var(--ss-orange)] px-4 py-4 text-[#120c00] text-[0.7rem]"
                    href="/collections/all"
                  >
                    {t("everythingInStock")}
                  </Link>
                </li>
              </ul>
            )}

            <button
              aria-controls={helpId}
              aria-expanded={helpOpen}
              className="ss-stencil flex w-full items-center justify-between border-[var(--ss-hairline)] border-b px-4 py-4 text-[0.7rem] transition-colors hover:text-[var(--ss-orange)]"
              onClick={() => setHelpOpen((open) => !open)}
              type="button"
            >
              {t("help")}
              <Chevron open={helpOpen} />
            </button>

            {helpOpen && (
              <ul
                className="border-[var(--ss-hairline)] border-b px-4 py-2"
                id={helpId}
              >
                {HELP_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link
                      className="block py-2.5 text-[var(--ss-smoke)] text-sm transition-colors hover:text-[var(--ss-bone)]"
                      href={link.href}
                    >
                      {t(link.key)}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="px-4 py-4">
            <RegionPicker variant="compact" />
          </div>
        </nav>
      )}
    </header>
  );
}
