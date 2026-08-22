"use client";

import Image from "next/image";
import { useState } from "react";
import { getBrandName, type Product } from "@/lib/catalog";
import { GarmentArt } from "./garment-art";

/**
 * A product's picture. Real photography when the catalogue has it, and an
 * authored poster in the product's own colourway when it doesn't — never an
 * empty grey box. When a back shot exists too, a front/back toggle slides
 * between them.
 */
export function ProductMedia({
  product,
  priority = false,
  sizes = "(min-width: 1024px) 25vw, (min-width: 640px) 45vw, 90vw",
  className = "",
  compact = false,
}: {
  product: Product;
  priority?: boolean;
  sizes?: string;
  className?: string;
  /** Thumbnail mode: drops the caption, the oversized brand stencil and the front/back toggle. */
  compact?: boolean;
}) {
  const [showBack, setShowBack] = useState(false);
  const hasBack = Boolean(product.image && product.imageBack && !compact);

  if (product.image) {
    const alt = `${getBrandName(product.brand)} ${product.name} in ${product.colourway.name}`;

    return (
      <div className={`relative h-full w-full overflow-hidden ${className}`}>
        <div
          className="flex h-full transition-transform duration-500 ease-out"
          style={{
            width: hasBack ? "200%" : "100%",
            transform:
              hasBack && showBack ? "translateX(-50%)" : "translateX(0%)",
          }}
        >
          <div className="relative h-full w-full shrink-0">
            <Image
              alt={`${alt} — front`}
              className="h-full w-full object-cover"
              fill
              priority={priority}
              sizes={sizes}
              src={product.image}
            />
          </div>

          {hasBack && (
            <div className="relative h-full w-full shrink-0">
              <Image
                alt={`${alt} — back`}
                className="h-full w-full object-cover"
                fill
                sizes={sizes}
                src={product.imageBack ?? product.image}
              />
            </div>
          )}
        </div>

        {hasBack && (
          <button
            aria-label={
              showBack
                ? "Showing the back — press to view the front"
                : "Showing the front — press to view the back"
            }
            className="ss-stencil absolute right-3 bottom-3 z-10 flex overflow-hidden border border-[var(--ss-hairline-strong)] bg-[var(--ss-black)]/80 text-[0.55rem] backdrop-blur-sm"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              setShowBack((value) => !value);
            }}
            type="button"
          >
            <span
              className={`px-2.5 py-1.5 transition-colors ${
                showBack
                  ? "text-[var(--ss-smoke)]"
                  : "bg-[var(--ss-orange)] text-[#120c00]"
              }`}
            >
              Front
            </span>
            <span
              className={`px-2.5 py-1.5 transition-colors ${
                showBack
                  ? "bg-[var(--ss-orange)] text-[#120c00]"
                  : "text-[var(--ss-smoke)]"
              }`}
            >
              Back
            </span>
          </button>
        )}
      </div>
    );
  }

  const brand = getBrandName(product.brand);

  return (
    <div
      className={`ss-grain relative h-full w-full overflow-hidden bg-[#141412] ${className}`}
    >
      {/* Hatching, tilted the same way as the hazard tape. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.16]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(-45deg, var(--ss-orange) 0 2px, transparent 2px 13px)",
        }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(70% 55% at 50% 38%, rgb(250 167 3 / 20%) 0%, transparent 70%)",
        }}
      />

      {/* The brand, set oversized behind the garment like a crate stencil. */}
      {!compact && (
        <span
          aria-hidden="true"
          className="ss-display absolute inset-x-0 top-[6%] text-center text-[#fafaf2]/[0.07] text-[clamp(2.5rem,11vw,5rem)] leading-none"
        >
          {brand}
        </span>
      )}

      <GarmentArt
        accent={product.colourway.accent}
        className="absolute inset-0 h-full w-full p-[8%] drop-shadow-[0_18px_28px_rgba(0,0,0,0.55)]"
        fill={product.colourway.fill}
        shape={product.shape}
      />

      {!compact && (
        <span className="ss-stencil absolute bottom-3 left-3 text-[#fafaf2]/40 text-[0.55rem]">
          Studio shot pending
        </span>
      )}
    </div>
  );
}
