import type { GarmentShape, SizeOption } from "@/lib/catalog";

/** Everything the "Add new item" form fills in automatically once a
 *  category is picked — which size run applies, what fallback vector
 *  artwork to use, and a first-draft blurb/details in that category's
 *  established voice. None of this calls out to anything external; it's
 *  boilerplate phrasing lifted from the categories already in the
 *  catalogue, with the brand/name/colourway slotted in. */

const SIZE_RUN_CATEGORIES = new Set([
  "tracksuits",
  "jumpers",
  "short-sets",
  "coats",
  "t-shirts",
]);

export function sizesForCategory(
  categorySlug: string,
  singleSizeLabel: string,
): SizeOption[] {
  if (SIZE_RUN_CATEGORIES.has(categorySlug)) {
    return ["XS", "S", "M", "L", "XL", "XXL"].map((label) => ({
      label,
      inStock: true,
    }));
  }

  if (categorySlug === "shoes") {
    return ["UK 6", "UK 7", "UK 8", "UK 9", "UK 10", "UK 11"].map((label) => ({
      label,
      inStock: true,
    }));
  }

  if (categorySlug === "jeans") {
    return Array.from({ length: 11 }, (_, i) => ({
      label: `W${30 + i}`,
      inStock: true,
    }));
  }

  return [{ label: singleSizeLabel || "One size", inStock: true }];
}

const DEFAULT_SHAPE_BY_CATEGORY: Record<string, GarmentShape> = {
  tracksuits: "tracksuit",
  jumpers: "hoodie",
  "short-sets": "shorts-set",
  coats: "puffer",
  "t-shirts": "tee",
  shoes: "sneaker",
  jeans: "jeans",
  bags: "bag",
  hats: "beanie",
};

export function defaultShapeForCategory(categorySlug: string): GarmentShape {
  return DEFAULT_SHAPE_BY_CATEGORY[categorySlug] ?? "figure";
}

const BRAND_CODE: Record<string, string> = {
  "the-north-face": "TNF",
  essentials: "FOG",
  dior: "DIOR",
  moncler: "MNC",
  "stone-island": "STI",
  boss: "BOSS",
  "denim-tears": "DT",
  trapstar: "TRP",
  "polo-ralph-lauren": "RL",
  "cp-company": "CP",
  amiri: "AMR",
  dsquared2: "DSQ",
  "off-white": "OFW",
  "moose-knuckles": "MK",
  "canada-goose": "CG",
  prada: "PRD",
  rhude: "RHD",
  loewe: "LOE",
  "gallery-dept": "GD",
  "palm-angels": "PA",
};

/** Falls back to the brand slug's own initials for a brand not already in
 *  the docket-prefix table above. */
export function brandCode(brandSlug: string): string {
  return (
    BRAND_CODE[brandSlug] ??
    brandSlug
      .split("-")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 4)
  );
}

type Copy = { blurb: string; details: string[] };

const TEMPLATES: Record<
  string,
  (brand: string, name: string, colourway: string) => Copy
> = {
  tracksuits: (brand, name, colourway) => ({
    blurb: `${brand} ${name} in ${colourway}, hoodie and matching joggers, sold as a set.`,
    details: [
      "Pullover hood and matching joggers, sold as a set",
      "Heavyweight cotton-blend fleece",
      "New with tags",
    ],
  }),
  jumpers: (brand, name, colourway) => ({
    blurb: `${brand} ${name} in ${colourway}.`,
    details: [
      "Crewneck jumper",
      "Heavyweight cotton-blend knit",
      "New with tags",
    ],
  }),
  "short-sets": (brand, name, colourway) => ({
    blurb: `${brand} ${name} in ${colourway}, top and matching shorts, sold as a set.`,
    details: [
      "Top and matching shorts, sold as a set",
      "Lightweight cotton-blend fabric",
      "New with tags",
    ],
  }),
  coats: (brand, name, colourway) => ({
    blurb: `${brand} ${name} in ${colourway}.`,
    details: [
      "Full-length zip fastening",
      "Insulated, cold-weather construction",
      "New with tags",
    ],
  }),
  "t-shirts": (brand, name, colourway) => ({
    blurb: `${brand} ${name} in ${colourway}.`,
    details: ["Crewneck tee, lightweight cotton jersey", "New with tags"],
  }),
  shoes: (brand, name, colourway) => ({
    blurb: `${brand} ${name} in ${colourway}, boxed.`,
    details: ["New in box"],
  }),
  jeans: (brand, name, colourway) => ({
    blurb: `${brand} ${name} in ${colourway}.`,
    details: ["New with tags"],
  }),
  bags: (brand, name, colourway) => ({
    blurb: `${brand} ${name} in ${colourway}.`,
    details: ["New with tags, dust bag included"],
  }),
  hats: (brand, name, colourway) => ({
    blurb: `${brand} ${name} in ${colourway}.`,
    details: ["New with tags"],
  }),
};

export function generateCopy(
  categorySlug: string,
  brand: string,
  name: string,
  colourway: string,
): Copy {
  const template = TEMPLATES[categorySlug];

  return template
    ? template(brand, name, colourway)
    : {
        blurb: `${brand} ${name} in ${colourway}.`,
        details: ["New with tags"],
      };
}
