/**
 * Secret Source catalogue.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * PLACEHOLDER STOCK. Every product, price, colourway and size run below is
 * sample data written to build and demo the storefront — none of it came
 * from a real inventory list. Replace this file's `PRODUCTS` array with the
 * real stock (and set `image` on each product) before taking orders.
 * Prices are the single source of truth for Stripe: the checkout route reads
 * them from here on the server, never from the browser.
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

export type Brand = {
  slug: string;
  name: string;
  /** Shown under the brand name on collection headers and the brand rail. */
  line: string;
};

export type SizeOption = {
  label: string;
  inStock: boolean;
};

export type Product = {
  slug: string;
  name: string;
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

export const BRANDS: Brand[] = [
  { slug: "trapstar", name: "Trapstar", line: "London. Irongate. Decoded." },
  { slug: "syna-world", name: "Syna World", line: "Central Cee's own line." },
  {
    slug: "broken-planet",
    name: "Broken Planet",
    line: "Out of the ordinary.",
  },
  { slug: "corteiz", name: "Corteiz", line: "Rules the world." },
  {
    slug: "essentials",
    name: "FOG Essentials",
    line: "Quiet, heavy, everywhere.",
  },
  { slug: "jordan", name: "Air Jordan", line: "The retros that hold value." },
  { slug: "nike", name: "Nike", line: "Dunks, Air Max, AF1." },
  { slug: "yeezy", name: "Yeezy", line: "Foams, slides, 350s." },
  { slug: "labubu", name: "Labubu", line: "Sealed blind boxes and pop-ups." },
];

const APPAREL_SIZES = (stock: boolean[]): SizeOption[] =>
  ["XS", "S", "M", "L", "XL", "XXL"].map((label, index) => ({
    label,
    inStock: stock[index] ?? false,
  }));

const UK_SHOE_SIZES = (stock: boolean[]): SizeOption[] =>
  ["UK 6", "UK 7", "UK 8", "UK 9", "UK 10", "UK 11", "UK 12"].map(
    (label, index) => ({ label, inStock: stock[index] ?? false }),
  );

const ONE_SIZE: SizeOption[] = [{ label: "One size", inStock: true }];

export const PRODUCTS: Product[] = [
  {
    slug: "trapstar-irongate-arch-fade-tracksuit-grey-blue",
    name: "Irongate Arch Fade Tracksuit",
    brand: "trapstar",
    shape: "tracksuit",
    colourway: { name: "Grey / Blue", fill: "#8E9297", accent: "#3E7BD1" },
    priceCents: 14_999,
    compareAtCents: 24_999,
    sizes: APPAREL_SIZES([false, true, true, true, true, false]),
    code: "SS-TRP-0142",
    blurb:
      "Hoodie and bottoms, sold as a set. The arch fade sits across the chest and drops down the left leg — the pairing that never sits on a rail for long.",
    details: [
      "Hooded top and matching bottoms included",
      "Heavyweight brushed-back cotton fleece",
      "Regular fit — take your usual size, size up for a boxier drape",
      "Machine wash cold, inside out, hang to dry",
    ],
    badge: "restock",
  },
  {
    slug: "trapstar-chenille-decoded-hoodie-black-red",
    name: "Chenille Decoded Hoodie",
    brand: "trapstar",
    shape: "hoodie",
    colourway: { name: "Black / Infrared", fill: "#161616", accent: "#E23A21" },
    priceCents: 12_999,
    sizes: APPAREL_SIZES([false, true, true, true, false, false]),
    code: "SS-TRP-0119",
    blurb:
      "The chenille patch work everyone knows, on the heaviest body Trapstar puts out. Infrared on black, still the hardest of the run.",
    details: [
      "Chenille patch appliqué across the chest",
      "Double-lined hood with flat drawcords",
      "Ribbed cuffs and hem",
      "Regular fit",
    ],
  },
  {
    slug: "syna-world-logo-tracksuit-baby-blue",
    name: "Syna Logo Tracksuit",
    brand: "syna-world",
    shape: "tracksuit",
    colourway: {
      name: "Baby Blue / White",
      fill: "#A9CDEB",
      accent: "#FAFAF2",
    },
    priceCents: 11_999,
    compareAtCents: 15_999,
    sizes: APPAREL_SIZES([true, true, true, false, true, false]),
    code: "SS-SYN-0231",
    blurb:
      "Zip-through hood and straight-leg bottoms in the baby blue that shifts fastest every restock.",
    details: [
      "Zip-through hooded top and matching bottoms",
      "Mid-weight loopback cotton",
      "Embroidered script at chest and thigh",
      "Straight leg with elasticated cuff",
    ],
    badge: "just-in",
  },
  {
    slug: "syna-world-short-set-black",
    name: "Syna Short Set",
    brand: "syna-world",
    shape: "shorts-set",
    colourway: { name: "Black / Bone", fill: "#141414", accent: "#D8D4C8" },
    priceCents: 8999,
    sizes: APPAREL_SIZES([false, true, true, true, false, false]),
    code: "SS-SYN-0244",
    blurb:
      "Tee and shorts, cut to sit heavy in the heat. The set most people buy twice.",
    details: [
      "Short-sleeve tee and matching shorts",
      "240gsm cotton jersey",
      "Elasticated waist with tonal drawcord",
      "Boxy fit",
    ],
  },
  {
    slug: "broken-planet-out-of-the-ordinary-hoodie-sand",
    name: "Out Of The Ordinary Hoodie",
    brand: "broken-planet",
    shape: "hoodie",
    colourway: { name: "Desert Sand", fill: "#C6A87C", accent: "#5D4A32" },
    priceCents: 13_999,
    sizes: APPAREL_SIZES([false, false, true, true, true, false]),
    code: "SS-BPM-0087",
    blurb:
      "Cracked-earth graphics on a sand body, in the boxy cut Broken Planet built its name on.",
    details: [
      "400gsm heavyweight cotton fleece",
      "Puff-print graphic front and back",
      "Oversized fit — size down for a regular drape",
      "Ribbed cuffs and hem",
    ],
  },
  {
    slug: "broken-planet-straight-leg-joggers-charcoal",
    name: "Straight Leg Joggers",
    brand: "broken-planet",
    shape: "joggers",
    colourway: { name: "Charcoal", fill: "#3A3A3C", accent: "#8C8C8E" },
    priceCents: 11_999,
    sizes: APPAREL_SIZES([false, true, true, true, true, false]),
    code: "SS-BPM-0092",
    blurb:
      "The joggers that finish the hoodie. Straight through the leg, weighted hem.",
    details: [
      "Matching 400gsm fleece",
      "Straight leg, unelasticated hem",
      "Zip side pockets",
      "Elasticated waist with flat drawcord",
    ],
  },
  {
    slug: "corteiz-alcatraz-cargos-olive",
    name: "Alcatraz Cargos",
    brand: "corteiz",
    shape: "cargos",
    colourway: { name: "Olive", fill: "#5A6141", accent: "#2E3222" },
    priceCents: 10_999,
    sizes: APPAREL_SIZES([false, true, true, true, false, false]),
    code: "SS-CRTZ-0310",
    blurb:
      "Bellowed pockets, drawcord hem, the Alcatraz tab at the thigh. Sold in minutes on drop day — sold here whenever you want them.",
    details: [
      "Cotton ripstop with bellowed cargo pockets",
      "Drawcord hem and adjustable waist",
      "Relaxed through the thigh, tapered below the knee",
      "Alcatraz woven tab",
    ],
    badge: "last-pair",
  },
  {
    slug: "corteiz-4starz-puffer-black",
    name: "4Starz Puffer",
    brand: "corteiz",
    shape: "puffer",
    colourway: { name: "Triple Black", fill: "#101010", accent: "#FAA703" },
    priceCents: 22_999,
    compareAtCents: 27_999,
    sizes: APPAREL_SIZES([false, false, true, true, true, false]),
    code: "SS-CRTZ-0288",
    blurb:
      "Winter's answer. Baffled through the body, matte shell, the star tab on the sleeve.",
    details: [
      "Matte technical shell with quilted baffles",
      "Full-length zip with storm flap",
      "Two-way hem adjuster",
      "Boxy fit, room for a hood underneath",
    ],
  },
  {
    slug: "essentials-hoodie-cement",
    name: "Essentials Hoodie",
    brand: "essentials",
    shape: "hoodie",
    colourway: { name: "Cement", fill: "#B9B2A7", accent: "#6E6A63" },
    priceCents: 10_999,
    sizes: APPAREL_SIZES([true, true, true, true, true, true]),
    code: "SS-FOG-0451",
    blurb:
      "The quiet one. Cement body, rubberised strip at the chest, drops off the shoulder exactly how it should.",
    details: [
      "Cotton-blend heavyweight fleece",
      "Rubberised logo strip at chest, flocked at back",
      "Dropped shoulder, oversized fit",
      "Full size run held in stock",
    ],
  },
  {
    slug: "air-jordan-1-retro-high-og-black-white",
    name: "Air Jordan 1 Retro High OG",
    brand: "jordan",
    shape: "sneaker",
    colourway: { name: "Black / White", fill: "#141414", accent: "#FAFAF2" },
    priceCents: 19_999,
    sizes: UK_SHOE_SIZES([false, true, true, true, true, false, false]),
    code: "SS-AJ1-0503",
    blurb:
      "Leather upper, the shape that started the resale market. Deadstock, boxed, with the original laces bagged.",
    details: [
      "Full-grain leather upper",
      "Deadstock — never worn, never tried on outside",
      "Original box and spare laces included",
      "UK sizing — Jordan 1s run true to size",
    ],
  },
  {
    slug: "nike-dunk-low-panda",
    name: "Dunk Low",
    brand: "nike",
    shape: "sneaker",
    colourway: { name: "Panda", fill: "#FAFAF2", accent: "#141414" },
    priceCents: 12_999,
    sizes: UK_SHOE_SIZES([true, true, true, false, true, true, false]),
    code: "SS-DNK-0611",
    blurb:
      "The pair everybody asks for. Black and white leather, held in a full size run all year.",
    details: [
      "Leather upper with perforated toe",
      "Deadstock, boxed",
      "Full size run held in stock",
      "UK sizing — Dunks run true to size",
    ],
    badge: "restock",
  },
  {
    slug: "yeezy-slide-onyx",
    name: "Yeezy Slide",
    brand: "yeezy",
    shape: "slide",
    colourway: { name: "Onyx", fill: "#2B2A28", accent: "#6B675F" },
    priceCents: 8999,
    sizes: UK_SHOE_SIZES([false, true, true, true, true, false, false]),
    code: "SS-YZY-0722",
    blurb:
      "Onyx, sealed, still the easiest thing in the shop to wear every day.",
    details: [
      "Injected EVA foam, one-piece",
      "Deadstock in original packaging",
      "Yeezy slides run small — size up one",
      "Soft rubber outsole",
    ],
  },
  {
    slug: "essentials-tee-bone",
    name: "Essentials Tee",
    brand: "essentials",
    shape: "tee",
    colourway: { name: "Bone", fill: "#DCD6C8", accent: "#8A8478" },
    priceCents: 5999,
    compareAtCents: 7999,
    sizes: APPAREL_SIZES([true, true, true, true, true, false]),
    code: "SS-FOG-0466",
    blurb:
      "Heavy bone jersey, dropped shoulder, sits under everything else in here.",
    details: [
      "Heavyweight cotton jersey",
      "Dropped shoulder, boxy body",
      "Rubberised chest strip",
      "Pre-shrunk",
    ],
  },
  {
    slug: "labubu-have-a-seat-blind-box",
    name: "Labubu — Have A Seat Blind Box",
    brand: "labubu",
    shape: "figure",
    colourway: { name: "Sealed", fill: "#F0A8C0", accent: "#4B3B57" },
    priceCents: 6499,
    sizes: ONE_SIZE,
    code: "SS-LAB-0806",
    blurb:
      "Sealed single blind box from the Have A Seat series. Case-fresh, never shaken, never swapped.",
    details: [
      "One sealed blind box — figure inside is random",
      "Case-fresh, unweighed and unshaken",
      "Secret chase odds are set by the manufacturer, not by us",
      "Ships boxed with protective padding",
    ],
    badge: "just-in",
  },
];

export function getBrand(slug: string): Brand | undefined {
  return BRANDS.find((brand) => brand.slug === slug);
}

export function getBrandName(slug: string): string {
  return getBrand(slug)?.name ?? slug;
}

export function getProduct(slug: string): Product | undefined {
  return PRODUCTS.find((product) => product.slug === slug);
}

export function getProductsByBrand(brandSlug: string): Product[] {
  return PRODUCTS.filter((product) => product.brand === brandSlug);
}

/** Products to show alongside one another — same brand first, then the rest. */
export function getRelatedProducts(product: Product, limit = 4): Product[] {
  const sameBrand = PRODUCTS.filter(
    (candidate) =>
      candidate.brand === product.brand && candidate.slug !== product.slug,
  );
  const others = PRODUCTS.filter(
    (candidate) =>
      candidate.brand !== product.brand && candidate.slug !== product.slug,
  );

  return [...sameBrand, ...others].slice(0, limit);
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
