"use client";

import Link from "next/link";
import {
  discountPercent,
  getBrandName,
  isSoldOut,
  type Product,
} from "@/lib/catalog";
import { useCurrency } from "./currency-provider";
import { useLanguage } from "./language-provider";
import { ProductMedia } from "./product-media";

const BADGE_KEYS: Record<
  NonNullable<Product["badge"]>,
  "badgeJustIn" | "badgeRestock" | "badgeLastPair"
> = {
  "just-in": "badgeJustIn",
  restock: "badgeRestock",
  "last-pair": "badgeLastPair",
};

export function ProductCard({
  product,
  priority = false,
}: {
  product: Product;
  priority?: boolean;
}) {
  const discount = discountPercent(product);
  const soldOut = isSoldOut(product);
  const { format } = useCurrency();
  const { t } = useLanguage();

  return (
    <Link
      className="group block focus-visible:outline-offset-4"
      href={`/products/${product.slug}`}
    >
      <div className="relative aspect-[4/5] overflow-hidden border border-[var(--ss-hairline)] bg-[var(--ss-panel)] transition-colors duration-300 group-hover:border-[var(--ss-orange)]">
        <div className="h-full w-full transition-transform duration-500 ease-out group-hover:scale-[1.04]">
          <ProductMedia priority={priority} product={product} />
        </div>

        {product.badge && !soldOut && (
          <span className="ss-stencil absolute top-3 left-3 bg-[var(--ss-orange)] px-2 py-1 text-[#120c00] text-[0.55rem]">
            {t(BADGE_KEYS[product.badge])}
          </span>
        )}

        {discount !== null && (
          <span className="ss-stencil absolute top-3 right-3 border border-[var(--ss-orange)] bg-[var(--ss-black)]/80 px-2 py-1 text-[0.55rem] text-[var(--ss-orange)]">
            −{discount}%
          </span>
        )}

        {soldOut && (
          <span className="ss-stencil absolute inset-x-0 bottom-0 bg-[var(--ss-black)]/85 py-2 text-center text-[0.62rem] text-[var(--ss-smoke)]">
            {t("soldOutRestockListed")}
          </span>
        )}
      </div>

      <div className="mt-3">
        <p className="ss-stencil text-[0.62rem] text-[var(--ss-orange)]">
          {getBrandName(product.brand)}
        </p>
        <h3 className="mt-1 font-semibold text-base leading-snug">
          {product.name}
        </h3>
        <p className="mt-0.5 text-[var(--ss-smoke)] text-xs">
          {product.colourway.name}
        </p>

        <p className="mt-2 flex items-baseline gap-2">
          <span className="ss-num text-base">{format(product.priceCents)}</span>
          {product.compareAtCents && (
            <span className="ss-num text-[var(--ss-sold)] text-xs line-through">
              {format(product.compareAtCents)}
            </span>
          )}
        </p>

        <ul className="mt-2 flex flex-wrap gap-x-2 gap-y-1">
          {product.sizes.map((size) => (
            <li
              className={`ss-stencil text-[0.62rem] ${
                size.inStock
                  ? "text-[var(--ss-bone)]/70"
                  : "text-[var(--ss-sold)] line-through"
              }`}
              key={size.label}
            >
              {size.label}
            </li>
          ))}
        </ul>
      </div>
    </Link>
  );
}
