import Image from "next/image";
import { getBrandName, type Product } from "@/lib/catalog";
import { GarmentArt } from "./garment-art";

/**
 * A product's picture. Real photography when the catalogue has it, and an
 * authored poster in the product's own colourway when it doesn't — never an
 * empty grey box.
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
  /** Thumbnail mode: drops the caption and the oversized brand stencil. */
  compact?: boolean;
}) {
  if (product.image) {
    return (
      <div className={`relative h-full w-full overflow-hidden ${className}`}>
        <Image
          alt={`${getBrandName(product.brand)} ${product.name} in ${product.colourway.name}`}
          className="h-full w-full object-cover"
          fill
          priority={priority}
          sizes={sizes}
          src={product.image}
        />
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
