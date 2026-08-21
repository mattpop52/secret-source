/**
 * Secret Source catalogue.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * Categories come first (Tracksuits, and more as they're photographed);
 * brands are subcategories inside a category — the same brand can sit in
 * more than one category once other categories exist.
 *
 * Every product below is real stock, photographed in hand. What's still
 * placeholder: `priceCents` (market-rate estimates, not the real ticket
 * price) and each item's `sizes` (real resale stock is one unit, one size —
 * the exact size is guessed at "M" pending the actual tag). Swap both for
 * confirmed numbers before taking orders; nothing else about these five
 * needs replacing. Prices are the single source of truth for Stripe: the
 * checkout route reads them from here on the server, never from the browser.
 * ─────────────────────────────────────────────────────────────────────────
 */

/** Which piece of vector artwork stands in for a product with no photo yet. */
export type GarmentShape =
  | "tracksuit"
  | "hoodie"
  | "joggers"
  | "cargos"
  | "puffer"
  | "tee"
  | "shorts-set"
  | "sneaker"
  | "slide"
  | "figure";

export type Category = {
  slug: string;
  name: string;
  /** Shown under the category name on collection headers and the shelf grid. */
  line: string;
};

export type Brand = {
  slug: string;
  name: string;
  /** Shown under the brand name on collection headers and brand tiles. */
  line: string;
};

export type SizeOption = {
  label: string;
  inStock: boolean;
};

export type Product = {
  slug: string;
  name: string;
  /** Category slug — the shop's primary taxonomy. */
  category: string;
  /** Brand slug — a subcategory inside `category`. */
  brand: string;
  shape: GarmentShape;
  /** Colourway name plus the two fills the vector artwork is painted with. */
  colourway: { name: string; fill: string; accent: string };
  priceCents: number;
  /** Original ticket price, when the item is on offer. */
  compareAtCents?: number;
  sizes: SizeOption[];
  /** Docket number printed on the authenticity tag. */
  code: string;
  blurb: string;
  details: string[];
  /**
   * Real photography, once it exists — e.g. "/products/xyz.jpg".
   * Leave undefined and the product renders its vector poster instead.
   */
  image?: string;
  badge?: "just-in" | "restock" | "last-pair";
};

export const CATEGORIES: Category[] = [
  {
    slug: "tracksuits",
    name: "Tracksuits",
    line: "Hoodie or crewneck, matched bottoms, one unit each.",
  },
];

export const BRANDS: Brand[] = [
  {
    slug: "the-north-face",
    name: "The North Face",
    line: "Heavyweight fleece, embroidered chest logo.",
  },
  {
    slug: "essentials",
    name: "Essentials Fear of God",
    line: "Flocked back branding, oversized cut.",
  },
  { slug: "dior", name: "Dior", line: "CD-icon hardware, tonal drawcords." },
  {
    slug: "moncler",
    name: "Moncler",
    line: "Tricolour collar trim, patch badge.",
  },
  {
    slug: "stone-island",
    name: "Stone Island",
    line: "Compass badge on the left sleeve.",
  },
  { slug: "boss", name: "BOSS", line: "Chenille chest logo, tonal leg print." },
  {
    slug: "denim-tears",
    name: "Denim Tears",
    line: "The cotton wreath, scattered.",
  },
  { slug: "trapstar", name: "Trapstar", line: "London. Chenille and script." },
  {
    slug: "polo-ralph-lauren",
    name: "Polo Ralph Lauren",
    line: "The pony, small and quiet.",
  },
];

// A single, one-off unit in stock: the site's own fiction — "everything on
// the shelf is one of one" — matches how resale stock actually moves. Swap
// the label for the size on the real tag once it's been checked.
const ONE_UNIT = (label = "M"): SizeOption[] => [{ label, inStock: true }];

export const PRODUCTS: Product[] = [
  {
    slug: "the-north-face-drew-peak-tracksuit-grey",
    name: "Drew Peak Tracksuit",
    category: "tracksuits",
    brand: "the-north-face",
    shape: "tracksuit",
    colourway: { name: "Heather Grey", fill: "#B7B7B4", accent: "#45443F" },
    priceCents: 12_999,
    sizes: ONE_UNIT(),
    code: "SS-TNF-0001",
    blurb:
      "Drew Peak hoodie and matching joggers in heather grey, embroidered half-dome chest logo, tags still on.",
    details: [
      "Pullover hood and matching joggers, sold as a set",
      "Heavyweight brushed-back cotton fleece",
      "Embroidered half-dome logo at chest, printed wordmark at left cuff",
      "New with tags",
    ],
    image: "/products/the-north-face-grey-tracksuit.jpg",
    badge: "just-in",
  },
  {
    slug: "essentials-fog-tracksuit-black",
    name: "Essentials Tracksuit",
    category: "tracksuits",
    brand: "essentials",
    shape: "tracksuit",
    colourway: { name: "Black", fill: "#131313", accent: "#6B6B6B" },
    priceCents: 17_999,
    sizes: ONE_UNIT(),
    code: "SS-FOG-0002",
    blurb:
      "Fear of God Essentials hoodie and sweatpants in triple black — flocked wordmark across the back, repeated on the left leg.",
    details: [
      "Pullover hood and matching sweatpants, sold as a set",
      "Heavyweight cotton-blend fleece, dropped shoulder",
      'Flocked "Essentials / Fear of God" branding on the back and left leg',
      "New with tags",
    ],
    image: "/products/essentials-fog-black-tracksuit.jpg",
    badge: "just-in",
  },
  {
    slug: "dior-cd-icon-tracksuit-stone",
    name: "CD Icon Tracksuit",
    category: "tracksuits",
    brand: "dior",
    shape: "tracksuit",
    colourway: { name: "Stone", fill: "#C9BFA9", accent: "#EFE9DC" },
    priceCents: 32_999,
    sizes: ONE_UNIT(),
    code: "SS-DIOR-0003",
    blurb:
      "Dior hoodie and joggers in stone, CD-icon hardware at the chest and left thigh, tonal drawcords throughout.",
    details: [
      "Pullover hood and matching joggers, sold as a set",
      "Technical jersey with a soft, brushed hand-feel",
      "CD-icon hardware badge at chest and thigh",
      "New with tags",
    ],
    image: "/products/dior-stone-tracksuit.jpg",
    badge: "just-in",
  },
  {
    slug: "moncler-crewneck-tracksuit-grey",
    name: "Crewneck Tracksuit",
    category: "tracksuits",
    brand: "moncler",
    shape: "tracksuit",
    colourway: { name: "Grey", fill: "#B4B2AE", accent: "#C1272D" },
    priceCents: 27_999,
    sizes: ONE_UNIT(),
    code: "SS-MNC-0004",
    blurb:
      "Moncler crewneck and joggers in grey, tricolour trim at the collar, patch logo at the chest and thigh.",
    details: [
      "Crewneck sweatshirt and matching joggers, sold as a set",
      "Mid-weight cotton fleece",
      "Tricolour collar trim, woven patch logo at chest and thigh",
      "New with tags",
    ],
    image: "/products/moncler-grey-tracksuit.jpg",
  },
  {
    slug: "moncler-crewneck-tracksuit-black",
    name: "Crewneck Tracksuit",
    category: "tracksuits",
    brand: "moncler",
    shape: "tracksuit",
    colourway: { name: "Black", fill: "#131313", accent: "#C1272D" },
    priceCents: 27_999,
    sizes: ONE_UNIT(),
    code: "SS-MNC-0005",
    blurb:
      "The same crewneck tracksuit in black — tricolour trim at the collar, patch logo at the chest and thigh.",
    details: [
      "Crewneck sweatshirt and matching joggers, sold as a set",
      "Mid-weight cotton fleece",
      "Tricolour collar trim, woven patch logo at chest and thigh",
      "New with tags",
    ],
    image: "/products/moncler-black-tracksuit.jpg",
  },
  {
    slug: "stone-island-tracksuit-grey",
    name: "Compass Tracksuit",
    category: "tracksuits",
    brand: "stone-island",
    shape: "tracksuit",
    colourway: { name: "Grey Marl", fill: "#B7B4AE", accent: "#141414" },
    priceCents: 24_999,
    sizes: ONE_UNIT(),
    code: "SS-STI-0006",
    blurb:
      "Stone Island hoodie and joggers in grey marl, the woven compass badge on the left sleeve.",
    details: [
      "Pullover hood and matching joggers, sold as a set",
      "Heavyweight brushed cotton fleece",
      "Woven compass badge on the left sleeve and left leg cuff",
      "New with tags",
    ],
    image: "/products/stone-island-grey-tracksuit.jpg",
    badge: "just-in",
  },
  {
    slug: "boss-tracksuit-black",
    name: "Chenille Logo Tracksuit",
    category: "tracksuits",
    brand: "boss",
    shape: "tracksuit",
    colourway: { name: "Black", fill: "#131313", accent: "#D8D2C6" },
    priceCents: 15_999,
    sizes: ONE_UNIT(),
    code: "SS-BOSS-0007",
    blurb:
      "BOSS hoodie and joggers in black, raised chenille wordmark at the chest, printed wordmark at the left leg.",
    details: [
      "Pullover hood and matching joggers, sold as a set",
      "Technical-finish fleece with a subtle sheen",
      "Chenille wordmark at chest, printed wordmark at left leg and pocket",
      "New with tags",
    ],
    image: "/products/boss-black-tracksuit.jpg",
    badge: "just-in",
  },
  {
    slug: "dior-cd-icon-tracksuit-navy",
    name: "CD Icon Tracksuit",
    category: "tracksuits",
    brand: "dior",
    shape: "tracksuit",
    colourway: { name: "Navy", fill: "#1B2027", accent: "#0F1216" },
    priceCents: 32_999,
    sizes: ONE_UNIT(),
    code: "SS-DIOR-0008",
    blurb:
      "The CD Icon tracksuit in tonal navy — same hardware badge at chest and thigh as the stone colourway, blacked out to match.",
    details: [
      "Pullover hood and matching joggers, sold as a set",
      "Technical jersey with a soft, brushed hand-feel",
      "Tonal CD-icon hardware badge at chest and thigh",
      "New with tags",
    ],
    image: "/products/dior-navy-tracksuit.jpg",
    badge: "just-in",
  },
  {
    slug: "denim-tears-cotton-wreath-tracksuit-black",
    name: "Cotton Wreath Tracksuit",
    category: "tracksuits",
    brand: "denim-tears",
    shape: "tracksuit",
    colourway: { name: "Black", fill: "#131313", accent: "#F4F1E8" },
    priceCents: 21_999,
    sizes: ONE_UNIT(),
    code: "SS-DT-0009",
    blurb:
      "Denim Tears hoodie and joggers in black, the cotton wreath appliquéd across the chest, sleeve and both legs.",
    details: [
      "Pullover hood and matching joggers, sold as a set",
      "Heavyweight cotton fleece",
      "Raised cotton-wreath appliqué scattered across the set",
      "New with tags",
    ],
    image: "/products/denim-tears-cotton-wreath-tracksuit-black.jpg",
    badge: "just-in",
  },
  {
    slug: "essentials-fog-tracksuit-black-2",
    name: "Essentials Tracksuit",
    category: "tracksuits",
    brand: "essentials",
    shape: "tracksuit",
    colourway: { name: "Black", fill: "#131313", accent: "#6B6B6B" },
    priceCents: 17_999,
    sizes: ONE_UNIT("L"),
    code: "SS-FOG-0010",
    blurb:
      "A second Essentials hoodie and sweatpants in triple black — same set as SS-FOG-0002, a different unit, tags still on both pieces.",
    details: [
      "Pullover hood and matching sweatpants, sold as a set",
      "Heavyweight cotton-blend fleece, dropped shoulder",
      'Printed "Essentials / Fear of God" branding at the chest and left leg',
      "New with tags",
    ],
    image: "/products/essentials-fog-black-tracksuit-2.jpg",
    badge: "just-in",
  },
  {
    slug: "trapstar-irongate-chevron-tracksuit-grey",
    name: "Irongate Chevron Tracksuit",
    category: "tracksuits",
    brand: "trapstar",
    shape: "tracksuit",
    colourway: {
      name: "Grey / Black / White",
      fill: "#AFAFAC",
      accent: "#141414",
    },
    priceCents: 13_999,
    sizes: ONE_UNIT(),
    code: "SS-TRP-0011",
    blurb:
      "Trapstar hoodie and joggers in grey with a black-and-white chevron split down the sleeve and leg, embroidered Irongate 'T' at the chest.",
    details: [
      "Zip-through hood and matching joggers, sold as a set",
      "Heavyweight brushed-back cotton fleece",
      "Colour-blocked chevron panel down the sleeve and leg",
      "Embroidered Irongate 'T' logo at chest and thigh",
      "New with tags",
    ],
    image: "/products/trapstar-irongate-chevron-tracksuit-grey.jpg",
    badge: "just-in",
  },
  {
    slug: "trapstar-shooters-tracksuit-grey",
    name: "London Shooters Tracksuit",
    category: "tracksuits",
    brand: "trapstar",
    shape: "tracksuit",
    colourway: { name: "Grey", fill: "#AFAFAC", accent: "#B3261E" },
    priceCents: 13_999,
    sizes: ONE_UNIT(),
    code: "SS-TRP-0012",
    blurb:
      "Trapstar hoodie and joggers in grey, the 'London Shooters' chenille panther patch across the chest, repeated at the thigh.",
    details: [
      "Pullover hood and matching joggers, sold as a set",
      "Heavyweight brushed-back cotton fleece",
      "Chenille 'Trapstar London Shooters' patch at chest and left thigh",
      "New with tags",
    ],
    image: "/products/trapstar-shooters-tracksuit-grey.jpg",
    badge: "just-in",
  },
  {
    slug: "polo-ralph-lauren-tracksuit-black",
    name: "Zip Hoodie Tracksuit",
    category: "tracksuits",
    brand: "polo-ralph-lauren",
    shape: "tracksuit",
    colourway: { name: "Black", fill: "#131313", accent: "#F4F1E8" },
    priceCents: 11_999,
    sizes: ONE_UNIT(),
    code: "SS-RL-0013",
    blurb:
      "Polo Ralph Lauren zip-through hoodie and joggers in black, the embroidered pony small and quiet at the chest and thigh.",
    details: [
      "Full-zip hood and matching joggers, sold as a set",
      "Mid-weight cotton fleece",
      "Embroidered pony logo at chest and left thigh",
      "New with tags",
    ],
    image: "/products/polo-ralph-lauren-tracksuit-black.jpg",
    badge: "just-in",
  },
  {
    slug: "trapstar-lightning-tracksuit-black",
    name: "It's A Secret Lightning Tracksuit",
    category: "tracksuits",
    brand: "trapstar",
    shape: "tracksuit",
    colourway: { name: "Black", fill: "#131313", accent: "#3E7BD1" },
    priceCents: 14_999,
    sizes: ONE_UNIT(),
    code: "SS-TRP-0014",
    blurb:
      "Trapstar hoodie and joggers in black, chenille 'Trapstar' script at the chest over a mirrored 'It's A Secret' zip strap, lightning-bolt embroidery running down the sleeve and leg.",
    details: [
      "Pullover hood and matching joggers, sold as a set",
      "Heavyweight brushed-back cotton fleece",
      "Chenille chest logo over a zip chest pocket, lightning-bolt embroidery at sleeve and leg",
      "New with tags",
    ],
    image: "/products/trapstar-lightning-tracksuit-black.jpg",
    badge: "just-in",
  },
  {
    slug: "the-north-face-drew-peak-tracksuit-black",
    name: "Drew Peak Tracksuit",
    category: "tracksuits",
    brand: "the-north-face",
    shape: "tracksuit",
    colourway: { name: "Black", fill: "#131313", accent: "#6B6B6B" },
    priceCents: 12_999,
    sizes: ONE_UNIT(),
    code: "SS-TNF-0015",
    blurb:
      "The Drew Peak hoodie and joggers in black, embroidered half-dome chest logo, tags still on.",
    details: [
      "Pullover hood and matching joggers, sold as a set",
      "Heavyweight brushed-back cotton fleece",
      "Embroidered half-dome logo at chest, printed wordmark at left cuff",
      "New with tags",
    ],
    image: "/products/the-north-face-tracksuit-black.jpg",
    badge: "just-in",
  },
];

export function getCategory(slug: string): Category | undefined {
  return CATEGORIES.find((category) => category.slug === slug);
}

export function getCategoryName(slug: string): string {
  return getCategory(slug)?.name ?? slug;
}

export function getBrand(slug: string): Brand | undefined {
  return BRANDS.find((brand) => brand.slug === slug);
}

export function getBrandName(slug: string): string {
  return getBrand(slug)?.name ?? slug;
}

export function getProduct(slug: string): Product | undefined {
  return PRODUCTS.find((product) => product.slug === slug);
}

export function getProductsByCategory(categorySlug: string): Product[] {
  return PRODUCTS.filter((product) => product.category === categorySlug);
}

export function getProductsByBrand(brandSlug: string): Product[] {
  return PRODUCTS.filter((product) => product.brand === brandSlug);
}

export function getProductsByCategoryAndBrand(
  categorySlug: string,
  brandSlug: string,
): Product[] {
  return PRODUCTS.filter(
    (product) =>
      product.category === categorySlug && product.brand === brandSlug,
  );
}

/** Brands with at least one product in this category — the subcategory row. */
export function getBrandsInCategory(categorySlug: string): Brand[] {
  const present = new Set(
    getProductsByCategory(categorySlug).map((p) => p.brand),
  );

  return BRANDS.filter((brand) => present.has(brand.slug));
}

/**
 * Products to show alongside one another — same brand within the same
 * category first, then the rest of the category, then everything else.
 */
export function getRelatedProducts(product: Product, limit = 4): Product[] {
  const sameBrand = PRODUCTS.filter(
    (candidate) =>
      candidate.category === product.category &&
      candidate.brand === product.brand &&
      candidate.slug !== product.slug,
  );
  const sameCategory = PRODUCTS.filter(
    (candidate) =>
      candidate.category === product.category &&
      candidate.brand !== product.brand &&
      candidate.slug !== product.slug,
  );
  const others = PRODUCTS.filter(
    (candidate) =>
      candidate.category !== product.category &&
      candidate.slug !== product.slug,
  );

  return [...sameBrand, ...sameCategory, ...others].slice(0, limit);
}

export function isSoldOut(product: Product): boolean {
  return product.sizes.every((size) => !size.inStock);
}

export function formatPrice(cents: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(cents / 100);
}

export function discountPercent(product: Product): number | null {
  if (!product.compareAtCents || product.compareAtCents <= product.priceCents) {
    return null;
  }

  return Math.round(
    ((product.compareAtCents - product.priceCents) / product.compareAtCents) *
      100,
  );
}
