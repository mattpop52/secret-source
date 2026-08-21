"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { CATEGORIES } from "@/lib/catalog";
import { useCart } from "./cart-provider";
import { LogoBadge } from "./logo";

export function SiteHeader() {
  const { count, openCart, hydrated } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  // biome-ignore lint/correctness/useExhaustiveDependencies: the route change IS the trigger — the menu closes when navigation happens
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 border-[var(--ss-hairline)] border-b bg-[var(--ss-black)]/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1240px] items-center gap-4 px-4 sm:px-6">
        <button
          aria-expanded={menuOpen}
          aria-label="Open menu"
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
              className="ss-stencil px-2.5 py-2 text-[0.62rem] text-[var(--ss-bone)]/70 transition-colors hover:text-[var(--ss-orange)]"
              href={`/collections/${category.slug}`}
              key={category.slug}
            >
              {category.name}
            </Link>
          ))}
          <Link
            className="ss-stencil px-2.5 py-2 text-[0.62rem] text-[var(--ss-bone)]/70 transition-colors hover:text-[var(--ss-orange)]"
            href="/collections/all"
          >
            Everything
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-2 lg:ml-4">
          <Link
            className="ss-stencil hidden px-3 py-2 text-[0.62rem] text-[var(--ss-bone)]/70 transition-colors hover:text-[var(--ss-orange)] sm:block"
            href="/authenticity"
          >
            Legit check
          </Link>
          <button
            className="ss-stencil flex items-center gap-2 border border-[var(--ss-hairline-strong)] px-4 py-2.5 text-[0.7rem] transition-colors hover:border-[var(--ss-orange)] hover:text-[var(--ss-orange)]"
            onClick={openCart}
            type="button"
          >
            Basket
            <span className="ss-num min-w-[1.4rem] bg-[var(--ss-orange)] px-1 text-center text-[#120c00] text-[0.7rem] leading-5">
              {hydrated ? count : 0}
            </span>
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav
          aria-label="Categories"
          className="border-[var(--ss-hairline)] border-t bg-[var(--ss-pitch)] lg:hidden"
        >
          <ul className="mx-auto grid max-w-[1240px] grid-cols-2 gap-px bg-[var(--ss-hairline)]">
            {CATEGORIES.map((category) => (
              <li key={category.slug}>
                <Link
                  className="ss-stencil block bg-[var(--ss-pitch)] px-4 py-4 text-[0.7rem] transition-colors hover:bg-[var(--ss-panel)] hover:text-[var(--ss-orange)]"
                  href={`/collections/${category.slug}`}
                >
                  {category.name}
                </Link>
              </li>
            ))}
            <li className="col-span-2">
              <Link
                className="ss-stencil block bg-[var(--ss-orange)] px-4 py-4 text-[#120c00] text-[0.7rem]"
                href="/collections/all"
              >
                Everything in stock
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
