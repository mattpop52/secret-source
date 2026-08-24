"use client";

import Link from "next/link";
import { CATEGORIES } from "@/lib/catalog";
import {
  DELIVERY_WINDOW,
  RETURNS_WINDOW,
  SHOP_EMAIL,
  SHOP_INSTAGRAM,
  SHOP_INSTAGRAM_URL,
  SHOP_TAGLINE,
} from "@/lib/constants";
import { CategoryName } from "./category-name";
import { useLanguage } from "./language-provider";
import { LogoBadge } from "./logo";
import { RegionPicker } from "./region-picker";

export function SiteFooter() {
  const { t } = useLanguage();

  const HELP_LINKS = [
    { href: "/authenticity", label: t("legitCheck") },
    { href: "/help#delivery", label: t("delivery") },
    { href: "/help#returns", label: t("returns") },
    { href: "/help#sizing", label: t("sizing") },
    { href: "/help#contact", label: t("contact") },
  ];

  return (
    <footer className="mt-24 border-[var(--ss-hairline)] border-t bg-[var(--ss-pitch)]">
      <div className="ss-tape-thin h-[5px]" />

      <div className="mx-auto grid max-w-[1240px] gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
        <div>
          <LogoBadge className="size-16" size={128} />
          <p className="ss-display mt-4 text-2xl leading-[0.9]">
            {SHOP_TAGLINE}
          </p>
          <p className="mt-3 max-w-xs text-[var(--ss-smoke)] text-sm">
            {t("footerBlurb")}
          </p>
        </div>

        <nav aria-label="Shop">
          <h2 className="ss-stencil text-[0.7rem] text-[var(--ss-orange)]">
            {t("theShelf")}
          </h2>
          <ul className="mt-4 space-y-2.5">
            {CATEGORIES.map((category) => (
              <li key={category.slug}>
                <Link
                  className="text-[var(--ss-smoke)] text-sm underline-offset-4 transition-colors hover:text-[var(--ss-bone)] hover:underline"
                  href={`/collections/${category.slug}`}
                >
                  <CategoryName fallback={category.name} slug={category.slug} />
                </Link>
              </li>
            ))}
            <li>
              <Link
                className="text-[var(--ss-smoke)] text-sm underline-offset-4 transition-colors hover:text-[var(--ss-bone)] hover:underline"
                href="/collections/all"
              >
                {t("everything")}
              </Link>
            </li>
          </ul>
        </nav>

        <nav aria-label="Help">
          <h2 className="ss-stencil text-[0.7rem] text-[var(--ss-orange)]">
            {t("help")}
          </h2>
          <ul className="mt-4 space-y-2.5">
            {HELP_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  className="text-[var(--ss-smoke)] text-sm underline-offset-4 transition-colors hover:text-[var(--ss-bone)] hover:underline"
                  href={link.href}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="ss-stencil text-[0.7rem] text-[var(--ss-orange)]">
            {t("straightToThePlug")}
          </h2>
          <p className="mt-4 text-[var(--ss-smoke)] text-sm">
            {t("afterSomething")}
          </p>
          <a
            className="ss-stencil mt-4 inline-block border border-[var(--ss-hairline-strong)] px-5 py-3 text-[0.7rem] transition-colors hover:border-[var(--ss-orange)] hover:text-[var(--ss-orange)]"
            href={SHOP_INSTAGRAM_URL}
            rel="noreferrer"
            target="_blank"
          >
            DM @{SHOP_INSTAGRAM}
          </a>
          <p className="mt-4 text-[var(--ss-smoke)] text-xs">
            <a
              className="underline underline-offset-4 hover:text-[var(--ss-bone)]"
              href={`mailto:${SHOP_EMAIL}`}
            >
              {SHOP_EMAIL}
            </a>
          </p>
        </div>
      </div>

      <div className="border-[var(--ss-hairline)] border-t">
        <div className="mx-auto max-w-[1240px] px-4 py-8 sm:px-6">
          <RegionPicker variant="full" />
        </div>
      </div>

      <div className="border-[var(--ss-hairline)] border-t">
        <div className="mx-auto flex max-w-[1240px] flex-col gap-4 px-4 py-6 text-[var(--ss-smoke)] text-xs sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>
            {t("copyright", {
              year: new Date().getFullYear(),
              window: DELIVERY_WINDOW,
              returns: RETURNS_WINDOW,
            })}
          </p>
          <p className="ss-stencil text-[0.62rem]">{t("paymentMethods")}</p>
        </div>
      </div>
    </footer>
  );
}
