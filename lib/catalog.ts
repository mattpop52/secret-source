/**
 * Secret Source catalogue.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * Categories come first (Tracksuits, and more as they're photographed);
 * brands are subcategories inside a category — the same brand can sit in
 * more than one category once other categories exist.
 *
 * Every product below is real stock, photographed in hand. `priceCents` is
 * still placeholder — a market-rate estimate, not the real ticket price —
 * and needs swapping for a confirmed number before taking orders. Sizing
 * follows a few conventions: tracksuits, jumpers, short sets, coats and
 * t-shirts carry a full XS–XXL run (`SIZE_RUN`); shoes and jeans carry a
 * full size run of their own (`SHOE_SIZE_RUN`, `JEAN_SIZE_RUN`); bags and
 * hats are stocked in whatever single real size the tag reads (`ONE_UNIT`).
 * Prices are the single source of truth for checkout: the checkout route
 * reads them from here on the server, never from the browser.
 * ─────────────────────────────────────────────────────────────────────────
 */

import newProducts from "./new-products.json";
import priceOverrides from "./prices.json";
import stockOverrides from "./stock.json";

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
  | "figure"
  | "bag"
  | "jeans"
  | "beanie";

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
  /**
   * A second photo of the same piece — the back, when it's been shot. Only
   * takes effect once `image` (the front) is set. Adds a front/back toggle
   * to the product's media everywhere it's shown full-size.
   */
  imageBack?: string;
  badge?: "just-in" | "restock" | "last-pair";
};

export const CATEGORIES: Category[] = [
  {
    slug: "tracksuits",
    name: "Tracksuits",
    line: "Hoodie or crewneck, matched bottoms, one unit each.",
  },
  {
    slug: "jumpers",
    name: "Jumpers",
    line: "Shot front and back, one unit each.",
  },
  {
    slug: "short-sets",
    name: "Short Sets",
    line: "T-shirt and shorts, one unit each.",
  },
  {
    slug: "coats",
    name: "Coats",
    line: "Puffers and parkas, one unit each.",
  },
  {
    slug: "shoes",
    name: "Shoes",
    line: "One pair, one size, boxed.",
  },
  {
    slug: "bags",
    name: "Bags",
    line: "One unit each.",
  },
  {
    slug: "t-shirts",
    name: "T-Shirts",
    line: "One unit each.",
  },
  {
    slug: "jeans",
    name: "Jeans",
    line: "One pair, one waist size, each.",
  },
  {
    slug: "hats",
    name: "Hats",
    line: "One size, one unit each.",
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
  {
    slug: "cp-company",
    name: "C.P. Company",
    line: "The lens badge on the sleeve.",
  },
  { slug: "amiri", name: "AMIRI", line: "The paint drip, in colour." },
  {
    slug: "dsquared2",
    name: "Dsquared2",
    line: "The maple leaf, stitched red.",
  },
  {
    slug: "off-white",
    name: "Off-White",
    line: "Diagonal arrows, industrial graphics.",
  },
  {
    slug: "moose-knuckles",
    name: "Moose Knuckles",
    line: "Fur-trimmed hoods, the moose badge on the sleeve.",
  },
  {
    slug: "canada-goose",
    name: "Canada Goose",
    line: "The Arctic Program disc badge on the sleeve.",
  },
  {
    slug: "prada",
    name: "Prada",
    line: "The triangle logo, small and enamelled.",
  },
  {
    slug: "rhude",
    name: "Rhude",
    line: "Crest graphics, worn like a varsity patch.",
  },
  {
    slug: "loewe",
    name: "Loewe",
    line: "The Anagram, stitched into a leather patch pocket.",
  },
  {
    slug: "gallery-dept",
    name: "Gallery Dept.",
    line: "Painted-over wordmarks, worn like a studio smock.",
  },
  {
    slug: "palm-angels",
    name: "Palm Angels",
    line: "The double star, run down the side.",
  },
];

// A single, one-off unit in stock, for stock that only ever comes in one
// real size — shoes (by UK size), jeans (by waist), and one-size items like
// bags and beanies. Swap the label for the size on the real tag once it's
// been checked.
const ONE_UNIT = (label = "M"): SizeOption[] => [{ label, inStock: true }];

// A full size run, for tracksuits, jumpers, short sets, coats and t-shirts —
// stocked across XS–XXL rather than as a single resale unit.
const SIZE_RUN = (): SizeOption[] => [
  { label: "XS", inStock: true },
  { label: "S", inStock: true },
  { label: "M", inStock: true },
  { label: "L", inStock: true },
  { label: "XL", inStock: true },
  { label: "XXL", inStock: true },
];

// A full run for shoes stocked across sizes rather than as a single
// resale unit — UK 6 through UK 11.
const SHOE_SIZE_RUN = (): SizeOption[] => [
  { label: "UK 6", inStock: true },
  { label: "UK 7", inStock: true },
  { label: "UK 8", inStock: true },
  { label: "UK 9", inStock: true },
  { label: "UK 10", inStock: true },
  { label: "UK 11", inStock: true },
];

// A full run for jeans stocked across waist sizes rather than as a single
// resale unit — W30 through W40.
const JEAN_SIZE_RUN = (): SizeOption[] => [
  { label: "W30", inStock: true },
  { label: "W31", inStock: true },
  { label: "W32", inStock: true },
  { label: "W33", inStock: true },
  { label: "W34", inStock: true },
  { label: "W35", inStock: true },
  { label: "W36", inStock: true },
  { label: "W37", inStock: true },
  { label: "W38", inStock: true },
  { label: "W39", inStock: true },
  { label: "W40", inStock: true },
];

const BASE_PRODUCTS: Product[] = [
  {
    slug: "the-north-face-drew-peak-tracksuit-grey",
    name: "Drew Peak Tracksuit",
    category: "tracksuits",
    brand: "the-north-face",
    shape: "tracksuit",
    colourway: { name: "Heather Grey", fill: "#B7B7B4", accent: "#45443F" },
    priceCents: 8_000,
    sizes: SIZE_RUN(),
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
    priceCents: 10_000,
    sizes: SIZE_RUN(),
    code: "SS-FOG-0002",
    blurb:
      "Fear of God Essentials hoodie and sweatpants in triple black — printed wordmark at the chest, repeated large across the back and down the left leg.",
    details: [
      "Pullover hood and matching sweatpants, sold as a set",
      "Heavyweight cotton-blend fleece, dropped shoulder",
      'Printed "Essentials / Fear of God" branding at the chest, back and left leg',
      "New with tags",
    ],
    image: "/products/essentials-fog-black-tracksuit-2.jpg",
    imageBack: "/products/essentials-fog-black-tracksuit.jpg",
    badge: "just-in",
  },
  {
    slug: "dior-cd-icon-tracksuit-stone",
    name: "CD Icon Tracksuit",
    category: "tracksuits",
    brand: "dior",
    shape: "tracksuit",
    colourway: { name: "Stone", fill: "#C9BFA9", accent: "#EFE9DC" },
    priceCents: 20_000,
    sizes: SIZE_RUN(),
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
    priceCents: 15_000,
    sizes: SIZE_RUN(),
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
    priceCents: 15_000,
    sizes: SIZE_RUN(),
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
    priceCents: 15_000,
    sizes: SIZE_RUN(),
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
    priceCents: 9_000,
    sizes: SIZE_RUN(),
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
    priceCents: 20_000,
    sizes: SIZE_RUN(),
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
    priceCents: 13_000,
    sizes: SIZE_RUN(),
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
    priceCents: 10_000,
    sizes: SIZE_RUN(),
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
    priceCents: 8_000,
    sizes: SIZE_RUN(),
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
    priceCents: 9_000,
    sizes: SIZE_RUN(),
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
    priceCents: 8_000,
    sizes: SIZE_RUN(),
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
    priceCents: 8_000,
    sizes: SIZE_RUN(),
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
  {
    slug: "polo-ralph-lauren-tracksuit-stone",
    name: "Zip Hoodie Tracksuit",
    category: "tracksuits",
    brand: "polo-ralph-lauren",
    shape: "tracksuit",
    colourway: { name: "Stone", fill: "#D9D0BE", accent: "#1B2A4A" },
    priceCents: 9_000,
    sizes: SIZE_RUN(),
    code: "SS-RL-0016",
    blurb:
      "The same zip-through hoodie and joggers as SS-RL-0013, this one in stone, embroidered pony small and quiet at the chest and thigh.",
    details: [
      "Full-zip hood and matching joggers, sold as a set",
      "Mid-weight cotton fleece",
      "Embroidered pony logo at chest and left thigh",
      "New with tags",
    ],
    image: "/products/polo-ralph-lauren-tracksuit-stone.jpg",
    badge: "just-in",
  },
  {
    slug: "dior-atelier-tracksuit-stone",
    name: "Atelier Tracksuit",
    category: "tracksuits",
    brand: "dior",
    shape: "tracksuit",
    colourway: { name: "Stone", fill: "#D9D0BE", accent: "#141414" },
    priceCents: 20_000,
    sizes: SIZE_RUN(),
    code: "SS-DIOR-0017",
    blurb:
      "Dior crewneck and joggers in stone, the 'Christian Dior Atelier Paris — Avenue Montaigne' script printed across the chest and repeated at the thigh.",
    details: [
      "Crewneck sweatshirt and matching joggers, sold as a set",
      "Mid-weight cotton fleece",
      "'Christian Dior Atelier Paris — Avenue Montaigne' script print at chest and left thigh",
      "New with tags",
    ],
    image: "/products/dior-atelier-tracksuit-stone.jpg",
    badge: "just-in",
  },
  {
    slug: "cp-company-tracksuit-grey",
    name: "Lens Badge Tracksuit",
    category: "tracksuits",
    brand: "cp-company",
    shape: "tracksuit",
    colourway: { name: "Grey Marl", fill: "#C4C1BA", accent: "#141414" },
    priceCents: 15_000,
    sizes: SIZE_RUN(),
    code: "SS-CP-0018",
    blurb:
      "C.P. Company crewneck and joggers in grey marl, the signature lens badge on the sleeve and on the joggers' cargo pocket.",
    details: [
      "Crewneck sweatshirt and matching joggers, sold as a set",
      "Heavyweight brushed cotton fleece",
      "Signature lens badge at the left sleeve and joggers' cargo pocket",
      "New with tags",
    ],
    image: "/products/cp-company-tracksuit-grey.jpg",
    badge: "just-in",
  },
  {
    slug: "cp-company-tracksuit-black",
    name: "Lens Badge Tracksuit",
    category: "tracksuits",
    brand: "cp-company",
    shape: "tracksuit",
    colourway: { name: "Black", fill: "#131313", accent: "#3A3A3A" },
    priceCents: 15_000,
    sizes: SIZE_RUN(),
    code: "SS-CP-0019",
    blurb:
      "The same lens-badge crewneck and joggers as SS-CP-0018, this one in black.",
    details: [
      "Crewneck sweatshirt and matching joggers, sold as a set",
      "Heavyweight brushed cotton fleece",
      "Signature lens badge at the left sleeve and joggers' cargo pocket",
      "New with tags",
    ],
    image: "/products/cp-company-tracksuit-black.jpg",
    badge: "just-in",
  },
  {
    slug: "stone-island-crewneck-tracksuit-grey",
    name: "Crewneck Compass Tracksuit",
    category: "tracksuits",
    brand: "stone-island",
    shape: "tracksuit",
    colourway: { name: "Grey Marl", fill: "#B7B4AE", accent: "#141414" },
    priceCents: 15_000,
    sizes: SIZE_RUN(),
    code: "SS-STI-0020",
    blurb:
      "A crewneck take on the Stone Island compass — grey marl sweatshirt and matching joggers, the badge patched to the left sleeve.",
    details: [
      "Crewneck sweatshirt and matching joggers, sold as a set",
      "Heavyweight brushed cotton fleece",
      "Woven compass badge on the left sleeve",
      "New with tags",
    ],
    image: "/products/stone-island-crewneck-tracksuit-grey.jpg",
    badge: "just-in",
  },
  {
    slug: "dior-cd-icon-tracksuit-black",
    name: "CD Icon Tracksuit",
    category: "tracksuits",
    brand: "dior",
    shape: "tracksuit",
    colourway: { name: "Black", fill: "#131313", accent: "#3A3A3A" },
    priceCents: 20_000,
    sizes: SIZE_RUN(),
    code: "SS-DIOR-0021",
    blurb:
      "The CD Icon tracksuit in triple black — the ring hardware badge at chest and thigh blacked out to match, tonal on tonal throughout.",
    details: [
      "Pullover hood and matching joggers, sold as a set",
      "Technical jersey with a soft, brushed hand-feel",
      "Tonal CD-icon hardware badge at chest and thigh",
      "New with tags",
    ],
    image: "/products/dior-cd-icon-tracksuit-black.jpg",
    badge: "just-in",
  },
  {
    slug: "trapstar-shooters-mono-tracksuit-grey",
    name: "London Shooters Tracksuit — Mono",
    category: "tracksuits",
    brand: "trapstar",
    shape: "tracksuit",
    colourway: { name: "Grey Monochrome", fill: "#AFAFAC", accent: "#3A3A3A" },
    priceCents: 8_000,
    sizes: SIZE_RUN(),
    code: "SS-TRP-0022",
    blurb:
      "The 'London Shooters' panther patch again, this run in monochrome grey and black rather than the red-accented original.",
    details: [
      "Pullover hood and matching joggers, sold as a set",
      "Heavyweight brushed-back cotton fleece",
      "Chenille 'Trapstar London Shooters' patch at chest and left thigh, monochrome colourway",
      "New with tags",
    ],
    image: "/products/trapstar-shooters-mono-tracksuit-grey.jpg",
    badge: "just-in",
  },
  {
    slug: "moncler-wordmark-tracksuit-stone",
    name: "Wordmark Tracksuit",
    category: "tracksuits",
    brand: "moncler",
    shape: "tracksuit",
    colourway: { name: "Stone", fill: "#D9D0BE", accent: "#141414" },
    priceCents: 15_000,
    sizes: SIZE_RUN(),
    code: "SS-MNC-0023",
    blurb:
      "Moncler crewneck and joggers in stone, the 'Moncler' wordmark printed large across the chest and repeated down the left leg.",
    details: [
      "Crewneck sweatshirt and matching joggers, sold as a set",
      "Mid-weight cotton fleece",
      "Printed 'Moncler' wordmark at chest and left leg",
      "New with tags",
    ],
    image: "/products/moncler-wordmark-tracksuit-stone.jpg",
    badge: "just-in",
  },
  {
    slug: "polo-ralph-lauren-pullover-tracksuit-black",
    name: "Pullover Wordmark Tracksuit",
    category: "tracksuits",
    brand: "polo-ralph-lauren",
    shape: "tracksuit",
    colourway: { name: "Black", fill: "#131313", accent: "#F4F1E8" },
    priceCents: 9_000,
    sizes: SIZE_RUN(),
    code: "SS-RL-0024",
    blurb:
      "Polo Ralph Lauren pullover hoodie and joggers in black, the 'Polo Ralph Lauren' wordmark embroidered across the chest, pony at the cuff and thigh.",
    details: [
      "Pullover hood and matching joggers, sold as a set",
      "Mid-weight cotton fleece",
      "Embroidered 'Polo Ralph Lauren' wordmark at chest, pony at sleeve and thigh",
      "New with tags",
    ],
    image: "/products/polo-ralph-lauren-pullover-tracksuit-black.jpg",
    badge: "just-in",
  },
  {
    slug: "amiri-drip-tracksuit-black",
    name: "Drip Tracksuit",
    category: "tracksuits",
    brand: "amiri",
    shape: "tracksuit",
    colourway: { name: "Black", fill: "#131313", accent: "#E23A21" },
    priceCents: 20_000,
    sizes: SIZE_RUN(),
    code: "SS-AMR-0025",
    blurb:
      "AMIRI hoodie and joggers in black, the multicolour paint-drip 'Amiri' print at the chest and thigh, splatter scattered across the cuffs and hem.",
    details: [
      "Pullover hood and matching joggers, sold as a set",
      "Mid-weight cotton fleece",
      "Multicolour drip print at chest and left thigh, splatter detail at cuffs and hem",
      "New with tags",
    ],
    image: "/products/amiri-drip-tracksuit-black.jpg",
    badge: "just-in",
  },
  {
    slug: "boss-tracksuit-navy",
    name: "Chenille Logo Tracksuit",
    category: "tracksuits",
    brand: "boss",
    shape: "tracksuit",
    colourway: { name: "Navy", fill: "#1B2A4A", accent: "#D8D2C6" },
    priceCents: 9_000,
    sizes: SIZE_RUN(),
    code: "SS-BOSS-0026",
    blurb:
      "The same chenille-logo hoodie and joggers as SS-BOSS-0007, this one in navy.",
    details: [
      "Pullover hood and matching joggers, sold as a set",
      "Technical-finish fleece with a subtle sheen",
      "Chenille wordmark at chest, printed wordmark at left leg and pocket",
      "New with tags",
    ],
    image: "/products/boss-tracksuit-navy.jpg",
    badge: "just-in",
  },
  {
    slug: "trapstar-shooters-tracksuit-black",
    name: "London Shooters Tracksuit",
    category: "tracksuits",
    brand: "trapstar",
    shape: "tracksuit",
    colourway: { name: "Black", fill: "#131313", accent: "#7A7D82" },
    priceCents: 8_000,
    sizes: SIZE_RUN(),
    code: "SS-TRP-0027",
    blurb:
      "The 'London Shooters' panther patch on black — a third run of the same graphic, alongside the red-accented original and the grey monochrome.",
    details: [
      "Pullover hood and matching joggers, sold as a set",
      "Heavyweight brushed-back cotton fleece",
      "Chenille 'Trapstar London Shooters' patch at chest and left thigh",
      "New with tags",
    ],
    image: "/products/trapstar-shooters-tracksuit-black.jpg",
    badge: "just-in",
  },
  {
    slug: "polo-ralph-lauren-pullover-tracksuit-grey",
    name: "Pullover Wordmark Tracksuit",
    category: "tracksuits",
    brand: "polo-ralph-lauren",
    shape: "tracksuit",
    colourway: { name: "Heather Grey", fill: "#B7B4AE", accent: "#1B2A4A" },
    priceCents: 9_000,
    sizes: SIZE_RUN(),
    code: "SS-RL-0028",
    blurb:
      "The same 'Polo Ralph Lauren' wordmark pullover and joggers as SS-RL-0024, this one in heather grey.",
    details: [
      "Pullover hood and matching joggers, sold as a set",
      "Mid-weight cotton fleece",
      "Embroidered 'Polo Ralph Lauren' wordmark at chest, pony at sleeve and thigh",
      "New with tags",
    ],
    image: "/products/polo-ralph-lauren-pullover-tracksuit-grey.jpg",
    badge: "just-in",
  },
  {
    slug: "dsquared2-maple-leaf-tracksuit-grey",
    name: "Maple Leaf Tracksuit",
    category: "tracksuits",
    brand: "dsquared2",
    shape: "tracksuit",
    colourway: { name: "Heather Grey", fill: "#B7B4AE", accent: "#B3261E" },
    priceCents: 8_000,
    sizes: SIZE_RUN(),
    code: "SS-DSQ-0029",
    blurb:
      "Dsquared2 crewneck and joggers in heather grey, the red maple leaf embroidered above the 'dsquared2' wordmark at chest and thigh.",
    details: [
      "Crewneck sweatshirt and matching joggers, sold as a set",
      "Mid-weight cotton fleece",
      "Embroidered maple leaf and 'dsquared2' wordmark at chest and left thigh",
      "New with tags",
    ],
    image: "/products/dsquared2-maple-leaf-tracksuit-grey.jpg",
    badge: "just-in",
  },
  {
    slug: "moncler-wordmark-tracksuit-navy",
    name: "Wordmark Tracksuit",
    category: "tracksuits",
    brand: "moncler",
    shape: "tracksuit",
    colourway: { name: "Navy", fill: "#1B2A4A", accent: "#0F1830" },
    priceCents: 15_000,
    sizes: SIZE_RUN(),
    code: "SS-MNC-0030",
    blurb:
      "The same 'Moncler' wordmark crewneck and joggers as SS-MNC-0023, this one in navy.",
    details: [
      "Crewneck sweatshirt and matching joggers, sold as a set",
      "Mid-weight cotton fleece",
      "Printed 'Moncler' wordmark at chest and left leg",
      "New with tags",
    ],
    image: "/products/moncler-wordmark-tracksuit-navy.jpg",
    badge: "just-in",
  },
  {
    slug: "trapstar-its-a-secret-multicolour-tracksuit-black",
    name: "It's A Secret Tracksuit — Multicolour",
    category: "tracksuits",
    brand: "trapstar",
    shape: "tracksuit",
    colourway: { name: "Black", fill: "#131313", accent: "#3E7BD1" },
    priceCents: 8_000,
    sizes: SIZE_RUN(),
    code: "SS-TRP-0031",
    blurb:
      "Trapstar hoodie and joggers in black, the 'Trapstar' block letters embroidered in yellow, pink, blue and green over a mirrored 'It's A Secret' — a different run of the it's-a-secret graphic from the lightning-bolt version already on the shelf.",
    details: [
      "Pullover hood and matching joggers, sold as a set",
      "Heavyweight brushed-back cotton fleece",
      "Multicolour chenille 'Trapstar' logo over mirrored 'It's A Secret' text, at chest and left thigh",
      "New with tags",
    ],
    image: "/products/trapstar-its-a-secret-multicolour-tracksuit-black.jpg",
    badge: "just-in",
  },
  {
    slug: "dior-atelier-tracksuit-black",
    name: "Atelier Tracksuit",
    category: "tracksuits",
    brand: "dior",
    shape: "tracksuit",
    colourway: { name: "Black", fill: "#131313", accent: "#3A3A3A" },
    priceCents: 20_000,
    sizes: SIZE_RUN(),
    code: "SS-DIOR-0032",
    blurb:
      "The same 'Christian Dior Atelier Paris' script crewneck and joggers as SS-DIOR-0017, this one in black.",
    details: [
      "Crewneck sweatshirt and matching joggers, sold as a set",
      "Mid-weight cotton fleece",
      "'Christian Dior Atelier Paris — Avenue Montaigne' script print at chest and left thigh",
      "New with tags",
    ],
    image: "/products/dior-atelier-tracksuit-black.jpg",
    badge: "just-in",
  },
  {
    slug: "stone-island-tracksuit-black",
    name: "Compass Tracksuit",
    category: "tracksuits",
    brand: "stone-island",
    shape: "tracksuit",
    colourway: { name: "Black", fill: "#131313", accent: "#3A3A3A" },
    priceCents: 15_000,
    sizes: SIZE_RUN(),
    code: "SS-STI-0033",
    blurb:
      "The same hooded compass tracksuit as SS-STI-0006, this one in black.",
    details: [
      "Pullover hood and matching joggers, sold as a set",
      "Heavyweight brushed cotton fleece",
      "Woven compass badge on the left sleeve and left leg cuff",
      "New with tags",
    ],
    image: "/products/stone-island-tracksuit-black.jpg",
    badge: "just-in",
  },
  {
    slug: "dior-cd-icon-tracksuit-khaki",
    name: "CD Icon Tracksuit",
    category: "tracksuits",
    brand: "dior",
    shape: "tracksuit",
    colourway: { name: "Khaki", fill: "#6B6B5A", accent: "#4A4A3E" },
    priceCents: 20_000,
    sizes: SIZE_RUN(),
    code: "SS-DIOR-0034",
    blurb:
      "The CD Icon tracksuit in khaki — the ring hardware badge at chest and thigh in a tonal finish to match.",
    details: [
      "Pullover hood and matching joggers, sold as a set",
      "Technical jersey with a soft, brushed hand-feel",
      "Tonal CD-icon hardware badge at chest and thigh",
      "New with tags",
    ],
    image: "/products/dior-cd-icon-tracksuit-khaki.jpg",
    badge: "just-in",
  },
  {
    slug: "trapstar-shooters-tracksuit-black-red",
    name: "London Shooters Tracksuit",
    category: "tracksuits",
    brand: "trapstar",
    shape: "tracksuit",
    colourway: { name: "Black / Red", fill: "#131313", accent: "#B3261E" },
    priceCents: 8_000,
    sizes: SIZE_RUN(),
    code: "SS-TRP-0035",
    blurb:
      "The 'London Shooters' panther patch on black with its red outline kept, rather than the grey-monochrome run already on the shelf.",
    details: [
      "Pullover hood and matching joggers, sold as a set",
      "Heavyweight brushed-back cotton fleece",
      "Chenille 'Trapstar London Shooters' patch at chest and left thigh, red-outlined colourway",
      "New with tags",
    ],
    image: "/products/trapstar-shooters-tracksuit-black-red.jpg",
    badge: "just-in",
  },
  {
    slug: "essentials-fog-tracksuit-grey",
    name: "Essentials Tracksuit",
    category: "tracksuits",
    brand: "essentials",
    shape: "tracksuit",
    colourway: { name: "Heather Grey", fill: "#B9B6AF", accent: "#141414" },
    priceCents: 10_000,
    sizes: SIZE_RUN(),
    code: "SS-FOG-0036",
    blurb:
      "The same Essentials hoodie and sweatpants as the black units already on the shelf, this one in heather grey.",
    details: [
      "Pullover hood and matching sweatpants, sold as a set",
      "Heavyweight cotton-blend fleece, dropped shoulder",
      'Printed "Essentials / Fear of God" branding at the chest and left leg',
      "New with tags",
    ],
    image: "/products/essentials-fog-tracksuit-grey.jpg",
    badge: "just-in",
  },
  {
    slug: "moncler-wordmark-tracksuit-taupe",
    name: "Wordmark Tracksuit",
    category: "tracksuits",
    brand: "moncler",
    shape: "tracksuit",
    colourway: { name: "Taupe", fill: "#8C7E6E", accent: "#5C5044" },
    priceCents: 15_000,
    sizes: SIZE_RUN(),
    code: "SS-MNC-0037",
    blurb:
      "The same 'Moncler' wordmark crewneck and joggers as SS-MNC-0023 and SS-MNC-0030, this one in taupe with the logo in gold.",
    details: [
      "Crewneck sweatshirt and matching joggers, sold as a set",
      "Mid-weight cotton fleece",
      "Printed 'Moncler' wordmark in gold at chest and left leg",
      "New with tags",
    ],
    image: "/products/moncler-wordmark-tracksuit-taupe.jpg",
    badge: "just-in",
  },
  {
    slug: "trapstar-shooters-tracksuit-grey-2",
    name: "London Shooters Tracksuit",
    category: "tracksuits",
    brand: "trapstar",
    shape: "tracksuit",
    colourway: { name: "Grey", fill: "#AFAFAC", accent: "#B3261E" },
    priceCents: 8_000,
    sizes: SIZE_RUN(),
    code: "SS-TRP-0038",
    blurb:
      "A second 'London Shooters' hoodie and joggers in grey — the same red-outlined patch as SS-TRP-0012, a different unit.",
    details: [
      "Pullover hood and matching joggers, sold as a set",
      "Heavyweight brushed-back cotton fleece",
      "Chenille 'Trapstar London Shooters' patch at chest and left thigh",
      "New with tags",
    ],
    image: "/products/trapstar-shooters-tracksuit-grey-2.jpg",
    badge: "just-in",
  },
  {
    slug: "trapstar-shooters-tracksuit-black-2",
    name: "London Shooters Tracksuit",
    category: "tracksuits",
    brand: "trapstar",
    shape: "tracksuit",
    colourway: { name: "Black", fill: "#131313", accent: "#7A7D82" },
    priceCents: 8_000,
    sizes: SIZE_RUN(),
    code: "SS-TRP-0039",
    blurb:
      "A second 'London Shooters' hoodie and joggers in black — the same grey-monochrome patch as SS-TRP-0027, a different unit.",
    details: [
      "Pullover hood and matching joggers, sold as a set",
      "Heavyweight brushed-back cotton fleece",
      "Chenille 'Trapstar London Shooters' patch at chest and left thigh",
      "New with tags",
    ],
    image: "/products/trapstar-shooters-tracksuit-black-2.jpg",
    badge: "just-in",
  },
  {
    slug: "stone-island-crewneck-tracksuit-black",
    name: "Crewneck Compass Tracksuit",
    category: "tracksuits",
    brand: "stone-island",
    shape: "tracksuit",
    colourway: { name: "Black", fill: "#131313", accent: "#3A3A3A" },
    priceCents: 15_000,
    sizes: SIZE_RUN(),
    code: "SS-STI-0040",
    blurb:
      "The crewneck compass tracksuit in black — gold-badge compass patch on the sleeve, repeated on the joggers' cargo pocket.",
    details: [
      "Crewneck sweatshirt and matching joggers, sold as a set",
      "Heavyweight brushed cotton fleece",
      "Woven compass badge on the left sleeve and joggers' cargo pocket",
      "New with tags",
    ],
    image: "/products/stone-island-crewneck-tracksuit-black.jpg",
    badge: "just-in",
  },
  {
    slug: "trapstar-irongate-chevron-tracksuit-black",
    name: "Irongate Chevron Tracksuit",
    category: "tracksuits",
    brand: "trapstar",
    shape: "tracksuit",
    colourway: { name: "Black / White", fill: "#141414", accent: "#F2F2F0" },
    priceCents: 10_000,
    sizes: SIZE_RUN(),
    code: "SS-TRP-0041",
    blurb:
      "Trapstar hoodie and joggers in black with a bold white chevron across the chest and down the leg, embroidered Irongate 'T' at the chest and thigh.",
    details: [
      "Zip-through hood and matching joggers, sold as a set",
      "Heavyweight brushed-back cotton fleece",
      "White chevron panel across the chest, sleeve and leg",
      "Embroidered Irongate 'T' logo at chest and thigh",
      "New with tags",
    ],
    image: "/products/trapstar-irongate-chevron-tracksuit-black.jpg",
    badge: "just-in",
  },
  {
    slug: "off-white-arrows-hoodie-cream",
    name: "Arrows Hoodie",
    category: "jumpers",
    brand: "off-white",
    shape: "hoodie",
    colourway: { name: "Cream / Green", fill: "#F1ECE0", accent: "#3F8F3F" },
    priceCents: 24_999,
    sizes: SIZE_RUN(),
    code: "SS-OFW-0042",
    blurb:
      "Off-White pullover hoodie in cream, green marble-print diagonal arrows down each sleeve and a camcorder-viewfinder Arrows graphic filling the back.",
    details: [
      "Pullover hood with drawstring and kangaroo pocket",
      "Heavyweight cotton fleece",
      "Green marble-print diagonal arrows down both sleeves",
      "Viewfinder-style Arrows graphic printed across the back",
      "Off-White wordmark printed at the left chest",
      "New with tags",
    ],
    image: "/products/off-white-arrows-hoodie-cream.jpg",
    imageBack: "/products/off-white-arrows-hoodie-cream-back.jpg",
    badge: "just-in",
  },
  {
    slug: "off-white-arrows-hoodie-black",
    name: "Arrows Hoodie",
    category: "jumpers",
    brand: "off-white",
    shape: "hoodie",
    colourway: { name: "Black / Green", fill: "#131313", accent: "#3F8F3F" },
    priceCents: 22_999,
    sizes: SIZE_RUN(),
    code: "SS-OFW-0043",
    blurb:
      "Off-White pullover hoodie in black, green marble-print diagonal arrows down each sleeve and a camcorder-viewfinder Arrows graphic filling the back.",
    details: [
      "Pullover hood with drawstring and kangaroo pocket",
      "Heavyweight cotton fleece",
      "Green marble-print diagonal arrows down both sleeves",
      "Viewfinder-style Arrows graphic printed across the back",
      "Off-White wordmark printed at the left chest",
      "New with tags",
    ],
    image: "/products/off-white-arrows-hoodie-black.jpg",
    imageBack: "/products/off-white-arrows-hoodie-black-back.jpg",
    badge: "just-in",
  },
  {
    slug: "off-white-arrows-hoodie-grey",
    name: "Arrows Hoodie",
    category: "jumpers",
    brand: "off-white",
    shape: "hoodie",
    colourway: { name: "Grey / Green", fill: "#C3CAD1", accent: "#3F8F3F" },
    priceCents: 23_999,
    sizes: SIZE_RUN(),
    code: "SS-OFW-0044",
    blurb:
      "Off-White pullover hoodie in light grey, green marble-print diagonal arrows down each sleeve and a camcorder-viewfinder Arrows graphic filling the back.",
    details: [
      "Pullover hood with drawstring and kangaroo pocket",
      "Heavyweight cotton fleece",
      "Green marble-print diagonal arrows down both sleeves",
      "Viewfinder-style Arrows graphic printed across the back",
      "Off-White wordmark printed at the left chest",
      "New with tags",
    ],
    image: "/products/off-white-arrows-hoodie-grey.jpg",
    imageBack: "/products/off-white-arrows-hoodie-grey-back.jpg",
    badge: "just-in",
  },
  {
    slug: "cp-company-lens-badge-short-set-white-black",
    name: "Lens Badge Short Set",
    category: "short-sets",
    brand: "cp-company",
    shape: "shorts-set",
    colourway: { name: "White / Black", fill: "#EFEFEA", accent: "#131313" },
    priceCents: 8_000,
    sizes: SIZE_RUN(),
    code: "SS-CP-0045",
    blurb:
      "C.P. Company tee and cargo shorts, white top with the lens badge at the sleeve, black shorts with a matching badge on the cargo pocket.",
    details: [
      "Crewneck tee and matching cargo shorts, sold as a set",
      "Lightweight cotton jersey",
      "Signature lens badge on the sleeve and shorts pocket",
      "New with tags",
    ],
    image: "/products/cp-company-lens-badge-short-set-white-black.jpg",
    badge: "just-in",
  },
  {
    slug: "dior-christian-dior-couture-short-set-black",
    name: "Christian Dior Couture Short Set",
    category: "short-sets",
    brand: "dior",
    shape: "shorts-set",
    colourway: { name: "Black", fill: "#131313", accent: "#EFEFEA" },
    priceCents: 12_000,
    sizes: SIZE_RUN(),
    code: "SS-DIOR-0046",
    blurb:
      "Dior tee and shorts in black, distressed 'Christian Dior Couture' print across the chest, repeated small on the shorts.",
    details: [
      "Crewneck tee and matching shorts, sold as a set",
      "Lightweight cotton jersey",
      "Distressed 'Christian Dior Couture' print at chest and shorts hem",
      "New with tags",
    ],
    image: "/products/dior-christian-dior-couture-short-set-black.jpg",
    badge: "just-in",
  },
  {
    slug: "stone-island-compass-short-set-grey",
    name: "Compass Short Set",
    category: "short-sets",
    brand: "stone-island",
    shape: "shorts-set",
    colourway: { name: "Grey", fill: "#B4B2AE", accent: "#141414" },
    priceCents: 8_000,
    sizes: SIZE_RUN(),
    code: "SS-STI-0047",
    blurb:
      "Stone Island tee and shorts in grey marl, woven compass badge on the sleeve and repeated on the shorts pocket.",
    details: [
      "Crewneck tee and matching shorts, sold as a set",
      "Lightweight cotton jersey, grey marl",
      "Woven compass badge on the sleeve and shorts pocket",
      "New with tags",
    ],
    image: "/products/stone-island-compass-short-set-grey.jpg",
    badge: "just-in",
  },
  {
    slug: "polo-ralph-lauren-pony-short-set-white-black",
    name: "Pony Short Set",
    category: "short-sets",
    brand: "polo-ralph-lauren",
    shape: "shorts-set",
    colourway: { name: "White / Black", fill: "#F2F2ED", accent: "#131313" },
    priceCents: 7_500,
    sizes: SIZE_RUN(),
    code: "SS-RL-0048",
    blurb:
      "Polo Ralph Lauren tee and shorts, white top with black shorts, embroidered pony at the chest and thigh.",
    details: [
      "Crewneck tee and matching shorts, sold as a set",
      "Lightweight cotton jersey",
      "Embroidered pony logo at chest and left thigh",
      "New with tags",
    ],
    image: "/products/polo-ralph-lauren-pony-short-set-white-black.jpg",
    badge: "just-in",
  },
  {
    slug: "dior-christian-dior-couture-short-set-black-2",
    name: "Christian Dior Couture Short Set",
    category: "short-sets",
    brand: "dior",
    shape: "shorts-set",
    colourway: { name: "Black", fill: "#131313", accent: "#EFEFEA" },
    priceCents: 12_000,
    sizes: SIZE_RUN(),
    code: "SS-DIOR-0049",
    blurb:
      "Dior tee and shorts in black, distressed 'Christian Dior Couture' print across the chest, repeated small on the shorts.",
    details: [
      "Crewneck tee and matching shorts, sold as a set",
      "Lightweight cotton jersey",
      "Distressed 'Christian Dior Couture' print at chest and shorts hem",
      "New with tags",
    ],
    image: "/products/dior-christian-dior-couture-short-set-black-2.jpg",
    badge: "just-in",
  },
  {
    slug: "dior-cd-icon-short-set-black",
    name: "CD Icon Short Set",
    category: "short-sets",
    brand: "dior",
    shape: "shorts-set",
    colourway: { name: "Black", fill: "#131313", accent: "#131313" },
    priceCents: 12_000,
    sizes: SIZE_RUN(),
    code: "SS-DIOR-0050",
    blurb:
      "Dior tee and shorts in black, tonal embroidered CD-icon logo at the chest, repeated on the shorts — a different graphic from the Christian Dior Couture print set.",
    details: [
      "Crewneck tee and matching shorts, sold as a set",
      "Lightweight cotton jersey",
      "Tonal embroidered CD-icon logo at chest and left thigh",
      "New with tags",
    ],
    image: "/products/dior-cd-icon-short-set-black.jpg",
    badge: "just-in",
  },
  {
    slug: "cp-company-lens-badge-short-set-beige",
    name: "Lens Badge Short Set",
    category: "short-sets",
    brand: "cp-company",
    shape: "shorts-set",
    colourway: { name: "Beige", fill: "#C9B896", accent: "#131313" },
    priceCents: 8_000,
    sizes: SIZE_RUN(),
    code: "SS-CP-0051",
    blurb:
      "C.P. Company tee and cargo shorts in beige, lens badge at the sleeve, matching badge on the cargo pocket.",
    details: [
      "Crewneck tee and matching cargo shorts, sold as a set",
      "Lightweight cotton jersey",
      "Signature lens badge on the sleeve and shorts pocket",
      "New with tags",
    ],
    image: "/products/cp-company-lens-badge-short-set-beige.jpg",
    badge: "just-in",
  },
  {
    slug: "dior-christian-dior-couture-short-set-taupe",
    name: "Christian Dior Couture Short Set",
    category: "short-sets",
    brand: "dior",
    shape: "shorts-set",
    colourway: { name: "Taupe", fill: "#B8A88E", accent: "#3A322A" },
    priceCents: 12_000,
    sizes: SIZE_RUN(),
    code: "SS-DIOR-0052",
    blurb:
      "Dior tee and shorts in taupe, distressed 'Christian Dior Couture' print across the chest, repeated small on the shorts.",
    details: [
      "Crewneck tee and matching shorts, sold as a set",
      "Lightweight cotton jersey",
      "Distressed 'Christian Dior Couture' print at chest and shorts hem",
      "New with tags",
    ],
    image: "/products/dior-christian-dior-couture-short-set-taupe.jpg",
    badge: "just-in",
  },
  {
    slug: "dior-christian-dior-couture-short-set-blue",
    name: "Christian Dior Couture Short Set",
    category: "short-sets",
    brand: "dior",
    shape: "shorts-set",
    colourway: { name: "Powder Blue", fill: "#C7D3DC", accent: "#3A4A55" },
    priceCents: 12_000,
    sizes: SIZE_RUN(),
    code: "SS-DIOR-0053",
    blurb:
      "Dior tee and shorts in powder blue, distressed 'Christian Dior Couture' print across the chest, repeated small on the shorts.",
    details: [
      "Crewneck tee and matching shorts, sold as a set",
      "Lightweight cotton jersey",
      "Distressed 'Christian Dior Couture' print at chest and shorts hem",
      "New with tags",
    ],
    image: "/products/dior-christian-dior-couture-short-set-blue.jpg",
    badge: "just-in",
  },
  {
    slug: "stone-island-compass-short-set-beige",
    name: "Compass Short Set",
    category: "short-sets",
    brand: "stone-island",
    shape: "shorts-set",
    colourway: { name: "Beige", fill: "#C9B896", accent: "#141414" },
    priceCents: 8_000,
    sizes: SIZE_RUN(),
    code: "SS-STI-0054",
    blurb:
      "Stone Island tee and shorts in beige, woven compass badge on the sleeve and repeated on the shorts pocket.",
    details: [
      "Crewneck tee and matching shorts, sold as a set",
      "Lightweight cotton jersey",
      "Woven compass badge on the sleeve and shorts pocket",
      "New with tags",
    ],
    image: "/products/stone-island-compass-short-set-beige.jpg",
    badge: "just-in",
  },
  {
    slug: "dior-cd-icon-short-set-white-black",
    name: "CD Icon Short Set",
    category: "short-sets",
    brand: "dior",
    shape: "shorts-set",
    colourway: { name: "White / Black", fill: "#F2F2ED", accent: "#131313" },
    priceCents: 12_000,
    sizes: SIZE_RUN(),
    code: "SS-DIOR-0055",
    blurb:
      "Dior tee in white with matching black shorts, metallic silver embroidered CD-icon logo at the chest, repeated on the shorts.",
    details: [
      "Crewneck tee and matching shorts, sold as a set",
      "Lightweight cotton jersey",
      "Metallic silver embroidered CD-icon logo at chest and left thigh",
      "New with tags",
    ],
    image: "/products/dior-cd-icon-short-set-white-black.jpg",
    badge: "just-in",
  },
  {
    slug: "cp-company-lens-badge-short-set-black",
    name: "Lens Badge Short Set",
    category: "short-sets",
    brand: "cp-company",
    shape: "shorts-set",
    colourway: { name: "Black", fill: "#131313", accent: "#3A3A3A" },
    priceCents: 8_000,
    sizes: SIZE_RUN(),
    code: "SS-CP-0056",
    blurb:
      "C.P. Company tee and cargo shorts in black, lens badge at the sleeve, matching badge on the cargo pocket.",
    details: [
      "Crewneck tee and matching cargo shorts, sold as a set",
      "Lightweight cotton jersey",
      "Signature lens badge on the sleeve and shorts pocket",
      "New with tags",
    ],
    image: "/products/cp-company-lens-badge-short-set-black.jpg",
    badge: "just-in",
  },
  {
    slug: "stone-island-compass-short-set-black",
    name: "Compass Short Set",
    category: "short-sets",
    brand: "stone-island",
    shape: "shorts-set",
    colourway: { name: "Black", fill: "#131313", accent: "#3A3A3A" },
    priceCents: 8_000,
    sizes: SIZE_RUN(),
    code: "SS-STI-0057",
    blurb:
      "Stone Island tee and shorts in black, woven compass badge on the sleeve and repeated on the shorts pocket.",
    details: [
      "Crewneck tee and matching shorts, sold as a set",
      "Lightweight cotton jersey",
      "Woven compass badge on the sleeve and shorts pocket",
      "New with tags",
    ],
    image: "/products/stone-island-compass-short-set-black.jpg",
    badge: "just-in",
  },
  {
    slug: "stone-island-compass-short-set-white-black",
    name: "Compass Short Set",
    category: "short-sets",
    brand: "stone-island",
    shape: "shorts-set",
    colourway: { name: "White / Black", fill: "#F2F2ED", accent: "#131313" },
    priceCents: 8_000,
    sizes: SIZE_RUN(),
    code: "SS-STI-0058",
    blurb:
      "Stone Island tee in white with matching black shorts, woven compass badge on the sleeve and shorts pocket.",
    details: [
      "Crewneck tee and matching shorts, sold as a set",
      "Lightweight cotton jersey",
      "Woven compass badge on the sleeve and shorts pocket",
      "New with tags",
    ],
    image: "/products/stone-island-compass-short-set-white-black.jpg",
    badge: "just-in",
  },
  {
    slug: "polo-ralph-lauren-pony-short-set-black",
    name: "Pony Short Set",
    category: "short-sets",
    brand: "polo-ralph-lauren",
    shape: "shorts-set",
    colourway: { name: "Black", fill: "#131313", accent: "#C1272D" },
    priceCents: 7_500,
    sizes: SIZE_RUN(),
    code: "SS-RL-0059",
    blurb:
      "Polo Ralph Lauren tee and shorts, both in black, embroidered red pony at the chest and thigh.",
    details: [
      "Crewneck tee and matching shorts, sold as a set",
      "Lightweight cotton jersey",
      "Embroidered red pony logo at chest and left thigh",
      "New with tags",
    ],
    image: "/products/polo-ralph-lauren-pony-short-set-black.jpg",
    badge: "just-in",
  },
  {
    slug: "dior-christian-dior-couture-short-set-white-black",
    name: "Christian Dior Couture Short Set",
    category: "short-sets",
    brand: "dior",
    shape: "shorts-set",
    colourway: { name: "White / Black", fill: "#F2F2ED", accent: "#131313" },
    priceCents: 12_000,
    sizes: SIZE_RUN(),
    code: "SS-DIOR-0060",
    blurb:
      "Dior tee in white with matching black shorts, distressed 'Christian Dior Couture' print across the chest, repeated small on the shorts.",
    details: [
      "Crewneck tee and matching shorts, sold as a set",
      "Lightweight cotton jersey",
      "Distressed 'Christian Dior Couture' print at chest and shorts hem",
      "New with tags",
    ],
    image: "/products/dior-christian-dior-couture-short-set-white-black.jpg",
    badge: "just-in",
  },
  {
    slug: "cp-company-lens-badge-short-set-grey",
    name: "Lens Badge Short Set",
    category: "short-sets",
    brand: "cp-company",
    shape: "shorts-set",
    colourway: { name: "Grey", fill: "#B4B2AE", accent: "#131313" },
    priceCents: 8_000,
    sizes: SIZE_RUN(),
    code: "SS-CP-0061",
    blurb:
      "C.P. Company tee and cargo shorts in grey marl, lens badge at the sleeve, matching badge on the cargo pocket.",
    details: [
      "Crewneck tee and matching cargo shorts, sold as a set",
      "Lightweight cotton jersey, grey marl",
      "Signature lens badge on the sleeve and shorts pocket",
      "New with tags",
    ],
    image: "/products/cp-company-lens-badge-short-set-grey.jpg",
    badge: "just-in",
  },
  {
    slug: "boss-paint-splatter-short-set-white-black",
    name: "Paint Splatter Short Set",
    category: "short-sets",
    brand: "boss",
    shape: "shorts-set",
    colourway: { name: "White / Black", fill: "#F2F2ED", accent: "#131313" },
    priceCents: 5_000,
    sizes: SIZE_RUN(),
    code: "SS-BOSS-0062",
    blurb:
      "BOSS tee in white with matching black shorts, paint-splatter 'BOSS' print across the chest, repeated small on the shorts.",
    details: [
      "Crewneck tee and matching shorts, sold as a set",
      "Lightweight cotton jersey",
      "Paint-splatter 'BOSS' print at chest and shorts leg",
      "New with tags",
    ],
    image: "/products/boss-paint-splatter-short-set-white-black.jpg",
    badge: "just-in",
  },
  {
    slug: "stone-island-cargo-pocket-parka-black",
    name: "Cargo Pocket Parka",
    category: "coats",
    brand: "stone-island",
    shape: "puffer",
    colourway: { name: "Black", fill: "#131313", accent: "#3A3A3A" },
    priceCents: 34_999,
    sizes: SIZE_RUN(),
    code: "SS-STI-0063",
    blurb:
      "Stone Island hooded parka in black, twin flap chest pockets over two zip pockets at the hem, woven compass badge on the sleeve.",
    details: [
      "Zip-through hood and quilted body",
      "Four-pocket front — flap pockets at the chest, zip pockets at the hem",
      "Woven compass badge on the left sleeve",
      "New with tags",
    ],
    image: "/products/stone-island-cargo-pocket-parka-black.jpg",
    badge: "just-in",
  },
  {
    slug: "moose-knuckles-fur-hood-parka-black",
    name: "Fur Hood Parka",
    category: "coats",
    brand: "moose-knuckles",
    shape: "puffer",
    colourway: { name: "Black", fill: "#131313", accent: "#2A2A2A" },
    priceCents: 25_000,
    sizes: SIZE_RUN(),
    code: "SS-MK-0064",
    blurb:
      "Moose Knuckles parka in black, fur-trimmed hood, snap-and-zip front, woven moose badge on the sleeve.",
    details: [
      "Fur-trimmed zip hood with snap closure",
      "Quilted body with snap-flap patch pockets",
      "Woven moose badge on the left sleeve",
      "New with tags",
    ],
    image: "/products/moose-knuckles-fur-hood-parka-black.jpg",
    badge: "just-in",
  },
  {
    slug: "stone-island-crinkle-puffer-sage",
    name: "Crinkle Puffer Jacket",
    category: "coats",
    brand: "stone-island",
    shape: "puffer",
    colourway: { name: "Sage", fill: "#A9AD98", accent: "#6E7261" },
    priceCents: 29_999,
    sizes: SIZE_RUN(),
    code: "SS-STI-0065",
    blurb:
      "Stone Island hooded puffer in sage, crinkle-finish nylon, single chest pocket, woven compass badge on the sleeve.",
    details: [
      "Zip-through hood and quilted body",
      "Crinkle-finish nylon shell",
      "Single zip chest pocket, twin flap hand pockets",
      "Woven compass badge on the left sleeve",
      "New with tags",
    ],
    image: "/products/stone-island-crinkle-puffer-sage.jpg",
    badge: "just-in",
  },
  {
    slug: "stone-island-flap-pocket-puffer-olive",
    name: "Flap Pocket Puffer",
    category: "coats",
    brand: "stone-island",
    shape: "puffer",
    colourway: { name: "Olive", fill: "#6B6248", accent: "#3F3A2A" },
    priceCents: 32_999,
    sizes: SIZE_RUN(),
    code: "SS-STI-0066",
    blurb:
      "Stone Island hooded puffer in olive, twin snap-flap pockets at the hem, woven compass badge on the sleeve.",
    details: [
      "Zip-through hood and quilted body",
      "Twin snap-flap patch pockets at the hem",
      "Woven compass badge on the left sleeve",
      "New with tags",
    ],
    image: "/products/stone-island-flap-pocket-puffer-olive.jpg",
    badge: "just-in",
  },
  {
    slug: "stone-island-flap-pocket-puffer-black",
    name: "Flap Pocket Puffer",
    category: "coats",
    brand: "stone-island",
    shape: "puffer",
    colourway: { name: "Black", fill: "#131313", accent: "#3A3A3A" },
    priceCents: 32_999,
    sizes: SIZE_RUN(),
    code: "SS-STI-0067",
    blurb:
      "Stone Island hooded puffer in black, twin snap-flap pockets at the hem, woven compass badge on the sleeve.",
    details: [
      "Zip-through hood and quilted body",
      "Twin snap-flap patch pockets at the hem",
      "Woven compass badge on the left sleeve",
      "New with tags",
    ],
    image: "/products/stone-island-flap-pocket-puffer-black.jpg",
    badge: "just-in",
  },
  {
    slug: "canada-goose-arctic-program-parka-black",
    name: "Arctic Program Parka",
    category: "coats",
    brand: "canada-goose",
    shape: "puffer",
    colourway: { name: "Black", fill: "#131313", accent: "#8A6D3B" },
    priceCents: 25_000,
    sizes: SIZE_RUN(),
    code: "SS-CG-0068",
    blurb:
      "Canada Goose parka in black, full-length cut, fur-trimmed hood, four flap pockets, woven Arctic Program disc badge on the sleeve.",
    details: [
      "Fur-trimmed zip hood",
      "Four flap pockets on the front, tab pocket at the chest",
      "Woven Arctic Program disc badge on the left sleeve",
      "Woven brand label on the back yoke",
      "New with tags",
    ],
    image: "/products/canada-goose-arctic-program-parka-black.jpg",
    imageBack: "/products/canada-goose-arctic-program-parka-black-back.jpg",
    badge: "just-in",
  },
  {
    slug: "canada-goose-fur-hood-bomber-red",
    name: "Fur Hood Bomber Jacket",
    category: "coats",
    brand: "canada-goose",
    shape: "puffer",
    colourway: { name: "Red", fill: "#B5222A", accent: "#131313" },
    priceCents: 20_000,
    sizes: SIZE_RUN(),
    code: "SS-CG-0069",
    blurb:
      "Canada Goose bomber jacket in red, fur-trimmed hood, ribbed cuffs and hem, woven Arctic Program disc badge on the sleeve.",
    details: [
      "Fur-trimmed zip hood",
      "Ribbed knit cuffs and hem",
      "Flap chest pocket and twin flap hand pockets",
      "Woven Arctic Program disc badge on the left sleeve",
      "New with tags",
    ],
    image: "/products/canada-goose-fur-hood-bomber-red.jpg",
    badge: "just-in",
  },
  {
    slug: "canada-goose-fur-hood-bomber-blue",
    name: "Fur Hood Bomber Jacket",
    category: "coats",
    brand: "canada-goose",
    shape: "puffer",
    colourway: { name: "Blue", fill: "#1E3F8F", accent: "#131313" },
    priceCents: 20_000,
    sizes: SIZE_RUN(),
    code: "SS-CG-0070",
    blurb:
      "Canada Goose bomber jacket in royal blue, fur-trimmed hood, ribbed cuffs and hem, woven Arctic Program disc badge on the sleeve.",
    details: [
      "Fur-trimmed zip hood",
      "Ribbed knit cuffs and hem",
      "Flap chest pocket and twin flap hand pockets",
      "Woven Arctic Program disc badge on the left sleeve",
      "New with tags",
    ],
    image: "/products/canada-goose-fur-hood-bomber-blue.jpg",
    badge: "just-in",
  },
  {
    slug: "canada-goose-fur-hood-bomber-grey",
    name: "Fur Hood Bomber Jacket",
    category: "coats",
    brand: "canada-goose",
    shape: "puffer",
    colourway: { name: "Grey", fill: "#4A4A4A", accent: "#131313" },
    priceCents: 20_000,
    sizes: SIZE_RUN(),
    code: "SS-CG-0071",
    blurb:
      "Canada Goose bomber jacket in grey, fur-trimmed hood, ribbed cuffs and hem, woven Arctic Program disc badge on the sleeve.",
    details: [
      "Fur-trimmed zip hood",
      "Ribbed knit cuffs and hem",
      "Flap chest pocket and twin flap hand pockets",
      "Woven Arctic Program disc badge on the left sleeve",
      "New with tags",
    ],
    image: "/products/canada-goose-fur-hood-bomber-grey.jpg",
    badge: "just-in",
  },
  {
    slug: "amiri-ma1-sneaker-white-blue",
    name: "MA-1 Sneaker",
    category: "shoes",
    brand: "amiri",
    shape: "sneaker",
    colourway: { name: "White / Blue", fill: "#F2F2ED", accent: "#1E3F8F" },
    priceCents: 20_000,
    sizes: SHOE_SIZE_RUN(),
    code: "SS-AMR-0072",
    blurb:
      "AMIRI MA-1 sneaker in white with blue overlays, chunky ridged sole, MA logo at the tongue and heel, boxed.",
    details: [
      "Leather and mesh upper with suede overlay panels",
      "Chunky ridged rubber sole",
      "MA logo tongue patch, AMIRI wordmark on the side panel",
      "New in box",
    ],
    image: "/products/amiri-ma1-sneaker-white-blue.jpg",
    badge: "just-in",
  },
  {
    slug: "amiri-ma1-sneaker-white-olive",
    name: "MA-1 Sneaker",
    category: "shoes",
    brand: "amiri",
    shape: "sneaker",
    colourway: { name: "White / Olive", fill: "#F2F2ED", accent: "#6B6248" },
    priceCents: 20_000,
    sizes: SHOE_SIZE_RUN(),
    code: "SS-AMR-0073",
    blurb:
      "AMIRI MA-1 sneaker in white with olive overlays, chunky ridged sole, MA logo at the tongue and heel, boxed.",
    details: [
      "Leather and mesh upper with suede overlay panels",
      "Chunky ridged rubber sole",
      "MA logo tongue patch, AMIRI wordmark on the side panel",
      "New in box",
    ],
    image: "/products/amiri-ma1-sneaker-white-olive.jpg",
    badge: "just-in",
  },
  {
    slug: "amiri-ma1-sneaker-white-black",
    name: "MA-1 Sneaker",
    category: "shoes",
    brand: "amiri",
    shape: "sneaker",
    colourway: { name: "White / Black", fill: "#F2F2ED", accent: "#131313" },
    priceCents: 20_000,
    sizes: SHOE_SIZE_RUN(),
    code: "SS-AMR-0074",
    blurb:
      "AMIRI MA-1 sneaker in white with black overlays, chunky ridged sole, MA logo at the tongue and heel, boxed.",
    details: [
      "Leather and mesh upper with suede overlay panels",
      "Chunky ridged rubber sole",
      "MA logo tongue patch, AMIRI wordmark on the side panel",
      "New in box",
    ],
    image: "/products/amiri-ma1-sneaker-white-black.jpg",
    badge: "just-in",
  },
  {
    slug: "dior-b30-sneaker-black",
    name: "B30 Sneaker",
    category: "shoes",
    brand: "dior",
    shape: "sneaker",
    colourway: { name: "Black", fill: "#131313", accent: "#EFEFEA" },
    priceCents: 20_000,
    sizes: SHOE_SIZE_RUN(),
    code: "SS-DIOR-0075",
    blurb:
      "Dior B30 runner sneaker in black, mesh and technical fabric upper, CD-outline overlay panel, CD-tread rubber sole, boxed.",
    details: [
      "Mesh and technical fabric upper with leather overlays",
      "CD-outline panel at the mid-foot",
      "Chunky sole with CD-monogram tread pattern",
      "New in box",
    ],
    image: "/products/dior-b30-sneaker-black.jpg",
    badge: "just-in",
  },
  {
    slug: "dior-oblique-belt-bag-black",
    name: "Oblique Belt Bag",
    category: "bags",
    brand: "dior",
    shape: "bag",
    colourway: { name: "Black", fill: "#131313", accent: "#3A3A3A" },
    priceCents: 35_000,
    sizes: ONE_UNIT("One size"),
    code: "SS-DIOR-0077",
    blurb:
      "Dior belt bag in black Oblique jacquard, silver hardware, adjustable webbing strap with the woven Dior wordmark.",
    details: [
      "Black Oblique jacquard canvas with leather trim",
      "Front zip pocket, silver-tone zip pulls",
      "Adjustable webbing strap, woven 'Christian Dior' wordmark",
      "'DIOR' plate at the front",
      "New with tags",
    ],
    image: "/products/dior-oblique-belt-bag-black.jpg",
    badge: "just-in",
  },
  {
    slug: "prada-triangle-logo-tee-tan",
    name: "Triangle Logo Tee",
    category: "t-shirts",
    brand: "prada",
    shape: "tee",
    colourway: { name: "Tan", fill: "#C9A876", accent: "#131313" },
    priceCents: 7_500,
    sizes: SIZE_RUN(),
    code: "SS-PRD-0078",
    blurb: "Prada tee in tan, enamelled triangle logo at the chest.",
    details: [
      "Crewneck tee, lightweight cotton jersey",
      "Enamelled triangle logo at the left chest",
      "New with tags",
    ],
    image: "/products/prada-triangle-logo-tee-tan.jpg",
    badge: "just-in",
  },
  {
    slug: "amiri-crystal-ball-tee-white",
    name: "Crystal Ball Tee",
    category: "t-shirts",
    brand: "amiri",
    shape: "tee",
    colourway: { name: "White", fill: "#F2F2ED", accent: "#131313" },
    priceCents: 7_000,
    sizes: SIZE_RUN(),
    code: "SS-AMR-0079",
    blurb:
      "AMIRI tee in white, an arched AMIRI wordmark over a hand-and-crystal-ball graphic at the chest, plain AMIRI wordmark printed across the back.",
    details: [
      "Crewneck tee, lightweight cotton jersey",
      "Arched AMIRI wordmark and crystal-ball graphic at the chest",
      "AMIRI wordmark printed across the back",
      "New with tags",
    ],
    image: "/products/amiri-crystal-ball-tee-white.jpg",
    imageBack: "/products/amiri-crystal-ball-tee-white-back.jpg",
    badge: "just-in",
  },
  {
    slug: "rhude-crest-tee-black",
    name: "Crest Tee",
    category: "t-shirts",
    brand: "rhude",
    shape: "tee",
    colourway: { name: "Black", fill: "#131313", accent: "#C1272D" },
    priceCents: 5_000,
    sizes: SIZE_RUN(),
    code: "SS-RHD-0080",
    blurb:
      "Rhude tee in black, printed crest patch with the Rhude wordmark at the chest.",
    details: [
      "Crewneck tee, lightweight cotton jersey",
      "Printed crest patch at the left chest",
      "New with tags",
    ],
    image: "/products/rhude-crest-tee-black.jpg",
    badge: "just-in",
  },
  {
    slug: "boss-wordmark-tee-navy",
    name: "Wordmark Tee",
    category: "t-shirts",
    brand: "boss",
    shape: "tee",
    colourway: { name: "Navy", fill: "#1B2A4A", accent: "#F2F2ED" },
    priceCents: 4_000,
    sizes: SIZE_RUN(),
    code: "SS-BOSS-0081",
    blurb: "BOSS tee in navy, printed BOSS wordmark across the chest.",
    details: [
      "Crewneck tee, lightweight cotton jersey",
      "Printed BOSS wordmark at the chest",
      "New with tags",
    ],
    image: "/products/boss-wordmark-tee-navy.jpg",
    badge: "just-in",
  },
  {
    slug: "dior-rainbow-stripe-tee-white",
    name: "Rainbow Stripe Tee",
    category: "t-shirts",
    brand: "dior",
    shape: "tee",
    colourway: { name: "White", fill: "#F2F2ED", accent: "#C1272D" },
    priceCents: 8_000,
    sizes: SIZE_RUN(),
    code: "SS-DIOR-0082",
    blurb:
      "Dior tee in white, a repeated multicolour DIOR wordmark stripe down the chest, 'Christian Dior Atelier Paris — Avenue Montaigne' script printed across the back.",
    details: [
      "Crewneck tee, lightweight cotton jersey",
      "Repeated multicolour DIOR wordmark stripe at the chest",
      "'Christian Dior Atelier Paris' script printed across the back",
      "New with tags",
    ],
    image: "/products/dior-rainbow-stripe-tee-white.jpg",
    imageBack: "/products/dior-rainbow-stripe-tee-white-back.jpg",
    badge: "just-in",
  },
  {
    slug: "dior-cd-icon-tee-black",
    name: "CD Icon Tee",
    category: "t-shirts",
    brand: "dior",
    shape: "tee",
    colourway: { name: "Black", fill: "#131313", accent: "#131313" },
    priceCents: 10_000,
    sizes: SIZE_RUN(),
    code: "SS-DIOR-0083",
    blurb: "Dior tee in black, tonal embroidered CD-icon logo at the chest.",
    details: [
      "Crewneck tee, lightweight cotton jersey",
      "Tonal embroidered CD-icon logo at the left chest",
      "New with tags",
    ],
    image: "/products/dior-cd-icon-tee-black.jpg",
    badge: "just-in",
  },
  {
    slug: "off-white-kaws-companion-tee-white",
    name: "KAWS Companion Tee",
    category: "t-shirts",
    brand: "off-white",
    shape: "tee",
    colourway: { name: "White / Grey", fill: "#F2F2ED", accent: "#8A8A85" },
    priceCents: 6_000,
    sizes: SIZE_RUN(),
    code: "SS-OFW-0084",
    blurb:
      "Off-White tee in white, KAWS Companion graphic on the back with the Arrows logo and diagonal stripes — sold and shot for the back print.",
    details: [
      "Crewneck tee, lightweight cotton jersey",
      "KAWS Companion graphic printed across the back",
      "Off-White Arrows logo above the print",
      "New with tags",
    ],
    image: "/products/off-white-kaws-companion-tee-white.jpg",
    badge: "just-in",
  },
  {
    slug: "off-white-kaws-companion-tee-black",
    name: "KAWS Companion Tee",
    category: "t-shirts",
    brand: "off-white",
    shape: "tee",
    colourway: { name: "Black / White", fill: "#131313", accent: "#F2F2ED" },
    priceCents: 6_000,
    sizes: SIZE_RUN(),
    code: "SS-OFW-0085",
    blurb:
      "Off-White tee in black, KAWS Companion graphic on the back with the Arrows logo and diagonal stripes — sold and shot for the back print.",
    details: [
      "Crewneck tee, lightweight cotton jersey",
      "KAWS Companion graphic printed across the back",
      "Off-White Arrows logo above the print",
      "New with tags",
    ],
    image: "/products/off-white-kaws-companion-tee-black.jpg",
    badge: "just-in",
  },
  {
    slug: "prada-linea-rossa-tee-navy",
    name: "Linea Rossa Tee",
    category: "t-shirts",
    brand: "prada",
    shape: "tee",
    colourway: { name: "Navy", fill: "#1B2A4A", accent: "#C1272D" },
    priceCents: 7_500,
    sizes: SIZE_RUN(),
    code: "SS-PRD-0086",
    blurb:
      "Prada tee in navy, red-and-black Linea Rossa stripe patch at the chest.",
    details: [
      "Crewneck tee, lightweight cotton jersey",
      "Linea Rossa stripe patch at the left chest",
      "New with tags",
    ],
    image: "/products/prada-linea-rossa-tee-navy.jpg",
    badge: "just-in",
  },
  {
    slug: "prada-milano-tee-black",
    name: "Milano Tee",
    category: "t-shirts",
    brand: "prada",
    shape: "tee",
    colourway: { name: "Black", fill: "#131313", accent: "#8A8A85" },
    priceCents: 10_000,
    sizes: SIZE_RUN(),
    code: "SS-PRD-0087",
    blurb:
      "Prada tee in black, metallic 'Prada Milano' text logo with the crest graphic at the chest.",
    details: [
      "Crewneck tee, lightweight cotton jersey",
      "Metallic 'Prada Milano' logo and crest at the left chest",
      "New with tags",
    ],
    image: "/products/prada-milano-tee-black.jpg",
    badge: "just-in",
  },
  {
    slug: "amiri-stripe-wordmark-tee-black",
    name: "Stripe Wordmark Tee",
    category: "t-shirts",
    brand: "amiri",
    shape: "tee",
    colourway: { name: "Black", fill: "#131313", accent: "#E8A488" },
    priceCents: 7_000,
    sizes: SIZE_RUN(),
    code: "SS-AMR-0088",
    blurb:
      "AMIRI tee in black, arched AMIRI wordmark over the MA monogram with a gradient stripe, printed across the back — sold and shot for the back print.",
    details: [
      "Crewneck tee, lightweight cotton jersey",
      "Arched AMIRI wordmark, MA monogram and gradient stripe across the back",
      "New with tags",
    ],
    image: "/products/amiri-stripe-wordmark-tee-black.jpg",
    badge: "just-in",
  },
  {
    slug: "prada-linea-rossa-tee-grey",
    name: "Linea Rossa Tee",
    category: "t-shirts",
    brand: "prada",
    shape: "tee",
    colourway: { name: "Grey", fill: "#6B6B6B", accent: "#C1272D" },
    priceCents: 7_500,
    sizes: SIZE_RUN(),
    code: "SS-PRD-0089",
    blurb:
      "Prada tee in grey, red-and-black Linea Rossa stripe patch at the chest.",
    details: [
      "Crewneck tee, lightweight cotton jersey",
      "Linea Rossa stripe patch at the left chest",
      "New with tags",
    ],
    image: "/products/prada-linea-rossa-tee-grey.jpg",
    badge: "just-in",
  },
  {
    slug: "amiri-wordmark-tee-black",
    name: "Wordmark Tee",
    category: "t-shirts",
    brand: "amiri",
    shape: "tee",
    colourway: { name: "Black", fill: "#131313", accent: "#E8C547" },
    priceCents: 7_000,
    sizes: SIZE_RUN(),
    code: "SS-AMR-0090",
    blurb: "AMIRI tee in black, AMIRI wordmark printed in yellow at the chest.",
    details: [
      "Crewneck tee, lightweight cotton jersey",
      "AMIRI wordmark printed in yellow at the left chest",
      "New with tags",
    ],
    image: "/products/amiri-wordmark-tee-black.jpg",
    badge: "just-in",
  },
  {
    slug: "boss-wordmark-tee-grey",
    name: "Wordmark Tee",
    category: "t-shirts",
    brand: "boss",
    shape: "tee",
    colourway: { name: "Grey", fill: "#8A8A85", accent: "#F2F2ED" },
    priceCents: 4_000,
    sizes: SIZE_RUN(),
    code: "SS-BOSS-0091",
    blurb: "BOSS tee in grey marl, printed BOSS wordmark across the chest.",
    details: [
      "Crewneck tee, lightweight cotton jersey, grey marl",
      "Printed BOSS wordmark at the chest",
      "New with tags",
    ],
    image: "/products/boss-wordmark-tee-grey.jpg",
    badge: "just-in",
  },
  {
    slug: "loewe-anagram-pocket-tee-black",
    name: "Anagram Pocket Tee",
    category: "t-shirts",
    brand: "loewe",
    shape: "tee",
    colourway: { name: "Black", fill: "#131313", accent: "#3A3A3A" },
    priceCents: 8_000,
    sizes: SIZE_RUN(),
    code: "SS-LOE-0092",
    blurb:
      "Loewe tee in black, leather Anagram patch pocket at the chest with a woven Loewe label.",
    details: [
      "Crewneck tee, lightweight cotton jersey",
      "Leather Anagram patch pocket at the left chest",
      "New with tags",
    ],
    image: "/products/loewe-anagram-pocket-tee-black.jpg",
    badge: "just-in",
  },
  {
    slug: "amiri-wordmark-tee-black-white",
    name: "Wordmark Tee",
    category: "t-shirts",
    brand: "amiri",
    shape: "tee",
    colourway: { name: "Black / White", fill: "#131313", accent: "#F2F2ED" },
    priceCents: 7_000,
    sizes: SIZE_RUN(),
    code: "SS-AMR-0093",
    blurb: "AMIRI tee in black, AMIRI wordmark printed in white at the chest.",
    details: [
      "Crewneck tee, lightweight cotton jersey",
      "AMIRI wordmark printed in white at the left chest",
      "New with tags",
    ],
    image: "/products/amiri-wordmark-tee-black-white.jpg",
    badge: "just-in",
  },
  {
    slug: "gallery-dept-de-la-galerie-tee-black",
    name: "De La Galerie Tee",
    category: "t-shirts",
    brand: "gallery-dept",
    shape: "tee",
    colourway: { name: "Black", fill: "#131313", accent: "#E8C547" },
    priceCents: 8_999,
    sizes: SIZE_RUN(),
    code: "SS-GD-0094",
    blurb:
      "Gallery Dept. tee in black, 'DÉPT. de la GALERIE' printed in yellow across the chest.",
    details: [
      "Crewneck tee, lightweight cotton jersey",
      "'DÉPT. de la GALERIE' print in yellow at the chest",
      "New with tags",
    ],
    image: "/products/gallery-dept-de-la-galerie-tee-black.jpg",
    badge: "just-in",
  },
  {
    slug: "amiri-arts-district-tee-white",
    name: "Arts District Tee",
    category: "t-shirts",
    brand: "amiri",
    shape: "tee",
    colourway: { name: "White", fill: "#F2F2ED", accent: "#131313" },
    priceCents: 7_000,
    sizes: SIZE_RUN(),
    code: "SS-AMR-0095",
    blurb:
      "AMIRI tee in white, 'AMIRI Arts District' text logo with coordinates printed across the back.",
    details: [
      "Crewneck tee, lightweight cotton jersey",
      "'AMIRI Arts District' text logo and coordinates printed across the back",
      "New with tags",
    ],
    image: "/products/amiri-arts-district-tee-white.jpg",
    imageBack: "/products/amiri-arts-district-tee-white-back.jpg",
    badge: "just-in",
  },
  {
    slug: "amiri-crystal-ball-tee-beige",
    name: "Crystal Ball Tee",
    category: "t-shirts",
    brand: "amiri",
    shape: "tee",
    colourway: { name: "Beige", fill: "#C9B896", accent: "#131313" },
    priceCents: 7_000,
    sizes: SIZE_RUN(),
    code: "SS-AMR-0096",
    blurb:
      "AMIRI tee in beige, an arched AMIRI wordmark over a hand-and-crystal-ball graphic at the chest.",
    details: [
      "Crewneck tee, lightweight cotton jersey",
      "Arched AMIRI wordmark and crystal-ball graphic at the chest",
      "New with tags",
    ],
    image: "/products/amiri-crystal-ball-tee-beige.jpg",
    badge: "just-in",
  },
  {
    slug: "prada-triangle-logo-tee-grey",
    name: "Triangle Logo Tee",
    category: "t-shirts",
    brand: "prada",
    shape: "tee",
    colourway: { name: "Grey", fill: "#6B6B6B", accent: "#131313" },
    priceCents: 7_500,
    sizes: SIZE_RUN(),
    code: "SS-PRD-0097",
    blurb: "Prada tee in grey, enamelled triangle logo at the chest.",
    details: [
      "Crewneck tee, lightweight cotton jersey",
      "Enamelled triangle logo at the left chest",
      "New with tags",
    ],
    image: "/products/prada-triangle-logo-tee-grey.jpg",
    badge: "just-in",
  },
  {
    slug: "stone-island-compass-print-tee-black",
    name: "Compass Print Tee",
    category: "t-shirts",
    brand: "stone-island",
    shape: "tee",
    colourway: { name: "Black", fill: "#131313", accent: "#7A7F5A" },
    priceCents: 6_000,
    sizes: SIZE_RUN(),
    code: "SS-STI-0098",
    blurb:
      "Stone Island tee in black, large printed compass roundel across the chest — a bigger print than the woven sleeve badge used elsewhere on the shelf.",
    details: [
      "Crewneck tee, lightweight cotton jersey",
      "Large printed compass roundel at the chest",
      "New with tags",
    ],
    image: "/products/stone-island-compass-print-tee-black.jpg",
    badge: "just-in",
  },
  {
    slug: "prada-triangle-logo-tee-black",
    name: "Triangle Logo Tee",
    category: "t-shirts",
    brand: "prada",
    shape: "tee",
    colourway: { name: "Black", fill: "#131313", accent: "#131313" },
    priceCents: 7_500,
    sizes: SIZE_RUN(),
    code: "SS-PRD-0099",
    blurb: "Prada tee in black, enamelled triangle logo at the chest.",
    details: [
      "Crewneck tee, lightweight cotton jersey",
      "Enamelled triangle logo at the left chest",
      "New with tags",
    ],
    image: "/products/prada-triangle-logo-tee-black.jpg",
    badge: "just-in",
  },
  {
    slug: "dior-rainbow-stripe-tee-black",
    name: "Rainbow Stripe Tee",
    category: "t-shirts",
    brand: "dior",
    shape: "tee",
    colourway: { name: "Black", fill: "#131313", accent: "#C1272D" },
    priceCents: 8_000,
    sizes: SIZE_RUN(),
    code: "SS-DIOR-0100",
    blurb:
      "Dior tee in black, a repeated multicolour DIOR wordmark stripe down the chest.",
    details: [
      "Crewneck tee, lightweight cotton jersey",
      "Repeated multicolour DIOR wordmark stripe at the chest",
      "New with tags",
    ],
    image: "/products/dior-rainbow-stripe-tee-black.jpg",
    badge: "just-in",
  },
  {
    slug: "stone-island-compass-print-tee-white",
    name: "Compass Print Tee",
    category: "t-shirts",
    brand: "stone-island",
    shape: "tee",
    colourway: { name: "White", fill: "#F2F2ED", accent: "#7A2E33" },
    priceCents: 6_000,
    sizes: SIZE_RUN(),
    code: "SS-STI-0101",
    blurb:
      "Stone Island tee in white, large printed compass roundel across the chest in maroon.",
    details: [
      "Crewneck tee, lightweight cotton jersey",
      "Large printed compass roundel at the chest",
      "New with tags",
    ],
    image: "/products/stone-island-compass-print-tee-white.jpg",
    badge: "just-in",
  },
  {
    slug: "amiri-wordmark-tee-white",
    name: "Wordmark Tee",
    category: "t-shirts",
    brand: "amiri",
    shape: "tee",
    colourway: { name: "White", fill: "#F2F2ED", accent: "#131313" },
    priceCents: 7_000,
    sizes: SIZE_RUN(),
    code: "SS-AMR-0102",
    blurb: "AMIRI tee in white, AMIRI wordmark printed in black at the chest.",
    details: [
      "Crewneck tee, lightweight cotton jersey",
      "AMIRI wordmark printed in black at the chest",
      "New with tags",
    ],
    image: "/products/amiri-wordmark-tee-white.jpg",
    badge: "just-in",
  },
  {
    slug: "amiri-cheers-tee-black",
    name: "Cheers Tee",
    category: "t-shirts",
    brand: "amiri",
    shape: "tee",
    colourway: { name: "Black", fill: "#131313", accent: "#E8C547" },
    priceCents: 7_000,
    sizes: SIZE_RUN(),
    code: "SS-AMR-0103",
    blurb:
      "AMIRI tee in black, a glittered AMIRI wordmark over a hand raising a cocktail glass, printed across the back.",
    details: [
      "Crewneck tee, lightweight cotton jersey",
      "Glittered AMIRI wordmark and cocktail-glass graphic across the back",
      "New with tags",
    ],
    image: "/products/amiri-cheers-tee-black.jpg",
    badge: "just-in",
  },
  {
    slug: "dior-atelier-paris-tee-black",
    name: "Atelier Paris Tee",
    category: "t-shirts",
    brand: "dior",
    shape: "tee",
    colourway: { name: "Black", fill: "#131313", accent: "#F2F2ED" },
    priceCents: 8_000,
    sizes: SIZE_RUN(),
    code: "SS-DIOR-0104",
    blurb:
      "Dior tee in black, 'Christian Dior Atelier Paris — Avenue Montaigne' script printed at the chest.",
    details: [
      "Crewneck tee, lightweight cotton jersey",
      "'Christian Dior Atelier Paris' script printed at the chest",
      "New with tags",
    ],
    image: "/products/dior-atelier-paris-tee-black.jpg",
    badge: "just-in",
  },
  {
    slug: "amiri-crystal-ball-tee-white-2",
    name: "Crystal Ball Tee",
    category: "t-shirts",
    brand: "amiri",
    shape: "tee",
    colourway: { name: "White", fill: "#F2F2ED", accent: "#131313" },
    priceCents: 7_000,
    sizes: SIZE_RUN(),
    code: "SS-AMR-0105",
    blurb:
      "AMIRI tee in white, an arched AMIRI wordmark over a hand-and-crystal-ball graphic at the chest.",
    details: [
      "Crewneck tee, lightweight cotton jersey",
      "Arched AMIRI wordmark and crystal-ball graphic at the chest",
      "New with tags",
    ],
    image: "/products/amiri-crystal-ball-tee-white-2.jpg",
    badge: "just-in",
  },
  {
    slug: "palm-angels-star-logo-tee-white",
    name: "Star Logo Tee",
    category: "t-shirts",
    brand: "palm-angels",
    shape: "tee",
    colourway: { name: "White", fill: "#F2F2ED", accent: "#1B2A4A" },
    priceCents: 5_000,
    sizes: SIZE_RUN(),
    code: "SS-PA-0106",
    blurb:
      "Palm Angels tee in white, the double-star Palm Angels logo printed down the side in navy.",
    details: [
      "Crewneck tee, lightweight cotton jersey",
      "Double-star Palm Angels logo printed down the side",
      "New with tags",
    ],
    image: "/products/palm-angels-star-logo-tee-white.jpg",
    badge: "just-in",
  },
  {
    slug: "amiri-ma-monogram-tee-white",
    name: "MA Monogram Tee",
    category: "t-shirts",
    brand: "amiri",
    shape: "tee",
    colourway: { name: "White", fill: "#F2F2ED", accent: "#8A8A85" },
    priceCents: 7_000,
    sizes: SIZE_RUN(),
    code: "SS-AMR-0107",
    blurb: "AMIRI tee in white, the MA monogram printed in grey at the chest.",
    details: [
      "Crewneck tee, lightweight cotton jersey",
      "MA monogram printed in grey at the left chest",
      "New with tags",
    ],
    image: "/products/amiri-ma-monogram-tee-white.jpg",
    badge: "just-in",
  },
  {
    slug: "amiri-gradient-wordmark-tee-white",
    name: "Gradient Wordmark Tee",
    category: "t-shirts",
    brand: "amiri",
    shape: "tee",
    colourway: { name: "White", fill: "#F2F2ED", accent: "#7A7F5A" },
    priceCents: 7_000,
    sizes: SIZE_RUN(),
    code: "SS-AMR-0108",
    blurb:
      "AMIRI tee in white, the AMIRI wordmark printed with a tonal camo-gradient fill across the chest.",
    details: [
      "Crewneck tee, lightweight cotton jersey",
      "AMIRI wordmark with a camo-gradient fill at the chest",
      "New with tags",
    ],
    image: "/products/amiri-gradient-wordmark-tee-white.jpg",
    badge: "just-in",
  },
  {
    slug: "off-white-bandana-crest-tee-black",
    name: "Bandana Crest Tee",
    category: "t-shirts",
    brand: "off-white",
    shape: "tee",
    colourway: { name: "Black", fill: "#131313", accent: "#F2F2ED" },
    priceCents: 6_000,
    sizes: SIZE_RUN(),
    code: "SS-OFW-0109",
    blurb:
      "Off-White tee in black, an ornate bandana-style crest graphic printed across the back — sold and shot for the back print.",
    details: [
      "Crewneck tee, lightweight cotton jersey",
      "Ornate bandana-style crest graphic printed across the back",
      "New with tags",
    ],
    image: "/products/off-white-bandana-crest-tee-black.jpg",
    badge: "just-in",
  },
  {
    slug: "prada-linea-rossa-tee-white",
    name: "Linea Rossa Tee",
    category: "t-shirts",
    brand: "prada",
    shape: "tee",
    colourway: { name: "White", fill: "#F2F2ED", accent: "#C1272D" },
    priceCents: 7_500,
    sizes: SIZE_RUN(),
    code: "SS-PRD-0110",
    blurb:
      "Prada tee in white, red-and-black Linea Rossa stripe patch at the chest.",
    details: [
      "Crewneck tee, lightweight cotton jersey",
      "Linea Rossa stripe patch at the left chest",
      "New with tags",
    ],
    image: "/products/prada-linea-rossa-tee-white.jpg",
    badge: "just-in",
  },
  {
    slug: "prada-triangle-logo-tee-pink",
    name: "Triangle Logo Tee",
    category: "t-shirts",
    brand: "prada",
    shape: "tee",
    colourway: { name: "Pink", fill: "#C99B96", accent: "#131313" },
    priceCents: 7_500,
    sizes: SIZE_RUN(),
    code: "SS-PRD-0111",
    blurb: "Prada tee in dusty pink, enamelled triangle logo at the chest.",
    details: [
      "Crewneck tee, lightweight cotton jersey",
      "Enamelled triangle logo at the left chest",
      "New with tags",
    ],
    image: "/products/prada-triangle-logo-tee-pink.jpg",
    badge: "just-in",
  },
  {
    slug: "prada-triangle-logo-tee-blue",
    name: "Triangle Logo Tee",
    category: "t-shirts",
    brand: "prada",
    shape: "tee",
    colourway: { name: "Blue", fill: "#3A6E8F", accent: "#131313" },
    priceCents: 7_500,
    sizes: SIZE_RUN(),
    code: "SS-PRD-0112",
    blurb: "Prada tee in steel blue, enamelled triangle logo at the chest.",
    details: [
      "Crewneck tee, lightweight cotton jersey",
      "Enamelled triangle logo at the left chest",
      "New with tags",
    ],
    image: "/products/prada-triangle-logo-tee-blue.jpg",
    badge: "just-in",
  },
  {
    slug: "prada-linea-rossa-tee-tan",
    name: "Linea Rossa Tee",
    category: "t-shirts",
    brand: "prada",
    shape: "tee",
    colourway: { name: "Tan", fill: "#C9A876", accent: "#C1272D" },
    priceCents: 7_500,
    sizes: SIZE_RUN(),
    code: "SS-PRD-0113",
    blurb:
      "Prada tee in tan, red-and-black Linea Rossa stripe patch at the chest.",
    details: [
      "Crewneck tee, lightweight cotton jersey",
      "Linea Rossa stripe patch at the left chest",
      "New with tags",
    ],
    image: "/products/prada-linea-rossa-tee-tan.jpg",
    badge: "just-in",
  },
  {
    slug: "amiri-ma-monogram-tee-black",
    name: "MA Monogram Tee",
    category: "t-shirts",
    brand: "amiri",
    shape: "tee",
    colourway: { name: "Black", fill: "#131313", accent: "#8A8A85" },
    priceCents: 7_000,
    sizes: SIZE_RUN(),
    code: "SS-AMR-0114",
    blurb: "AMIRI tee in black, the MA monogram printed in grey at the chest.",
    details: [
      "Crewneck tee, lightweight cotton jersey",
      "MA monogram printed in grey at the left chest",
      "New with tags",
    ],
    image: "/products/amiri-ma-monogram-tee-black.jpg",
    badge: "just-in",
  },
  {
    slug: "dsquared2-icon-tee-black",
    name: "Icon Tee",
    category: "t-shirts",
    brand: "dsquared2",
    shape: "tee",
    colourway: { name: "Black", fill: "#131313", accent: "#E23A21" },
    priceCents: 5_000,
    sizes: SIZE_RUN(),
    code: "SS-DSQ-0115",
    blurb:
      "Dsquared2 tee in black, paint-splatter 'Dsquared2 Icon' print across the chest — the first Dsquared2 t-shirt on the shelf.",
    details: [
      "Crewneck tee, lightweight cotton jersey",
      "Paint-splatter 'Dsquared2 Icon' print at the chest",
      "New with tags",
    ],
    image: "/products/dsquared2-icon-tee-black.jpg",
    badge: "just-in",
  },
  {
    slug: "amiri-gradient-stripe-tee-black",
    name: "Gradient Stripe Tee",
    category: "t-shirts",
    brand: "amiri",
    shape: "tee",
    colourway: { name: "Black", fill: "#131313", accent: "#E8A488" },
    priceCents: 7_000,
    sizes: SIZE_RUN(),
    code: "SS-AMR-0116",
    blurb:
      "AMIRI tee in black, the AMIRI wordmark over an MA monogram gradient stripe at the chest — a front-chest layout, distinct from the full-back Stripe Wordmark Tee.",
    details: [
      "Crewneck tee, lightweight cotton jersey",
      "AMIRI wordmark and MA monogram gradient stripe at the chest",
      "New with tags",
    ],
    image: "/products/amiri-gradient-stripe-tee-black.jpg",
    badge: "just-in",
  },
  {
    slug: "prada-triangle-logo-tee-navy",
    name: "Triangle Logo Tee",
    category: "t-shirts",
    brand: "prada",
    shape: "tee",
    colourway: { name: "Navy", fill: "#1B2A4A", accent: "#131313" },
    priceCents: 7_500,
    sizes: SIZE_RUN(),
    code: "SS-PRD-0117",
    blurb: "Prada tee in navy, enamelled triangle logo at the chest.",
    details: [
      "Crewneck tee, lightweight cotton jersey",
      "Enamelled triangle logo at the left chest",
      "New with tags",
    ],
    image: "/products/prada-triangle-logo-tee-navy.jpg",
    badge: "just-in",
  },
  {
    slug: "dsquared2-icon-tee-white",
    name: "Icon Tee",
    category: "t-shirts",
    brand: "dsquared2",
    shape: "tee",
    colourway: { name: "White", fill: "#F2F2ED", accent: "#E23A21" },
    priceCents: 5_000,
    sizes: SIZE_RUN(),
    code: "SS-DSQ-0118",
    blurb:
      "Dsquared2 tee in white, paint-splatter 'Dsquared2 Icon' print across the chest, alongside the existing black.",
    details: [
      "Crewneck tee, lightweight cotton jersey",
      "Paint-splatter 'Dsquared2 Icon' print at the chest",
      "New with tags",
    ],
    image: "/products/dsquared2-icon-tee-white.jpg",
    badge: "just-in",
  },
  {
    slug: "off-white-skull-icon-tee-white",
    name: "Skull Icon Tee",
    category: "t-shirts",
    brand: "off-white",
    shape: "tee",
    colourway: { name: "White", fill: "#F2F2ED", accent: "#131313" },
    priceCents: 6_000,
    sizes: SIZE_RUN(),
    code: "SS-OFW-0119",
    blurb:
      "Off-White tee in white, a small KAWS-style skull icon with the Off-White wordmark at the chest — a different, smaller graphic from the full-back Companion and Bandana Crest tees.",
    details: [
      "Crewneck tee, lightweight cotton jersey",
      "Skull icon and Off-White wordmark at the left chest",
      "New with tags",
    ],
    image: "/products/off-white-skull-icon-tee-white.jpg",
    badge: "just-in",
  },
  {
    slug: "dior-cd-icon-tee-white",
    name: "CD Icon Tee",
    category: "t-shirts",
    brand: "dior",
    shape: "tee",
    colourway: { name: "White", fill: "#F2F2ED", accent: "#8A8A85" },
    priceCents: 10_000,
    sizes: SIZE_RUN(),
    code: "SS-DIOR-0120",
    blurb:
      "Dior tee in white, metallic silver CD-icon logo at the chest, alongside the existing tonal black.",
    details: [
      "Crewneck tee, lightweight cotton jersey",
      "Metallic silver CD-icon logo at the left chest",
      "New with tags",
    ],
    image: "/products/dior-cd-icon-tee-white.jpg",
    badge: "just-in",
  },
  {
    slug: "rhude-heraldic-crest-tee-black",
    name: "Heraldic Crest Tee",
    category: "t-shirts",
    brand: "rhude",
    shape: "tee",
    colourway: { name: "Black", fill: "#131313", accent: "#C1272D" },
    priceCents: 5_000,
    sizes: SIZE_RUN(),
    code: "SS-RHD-0121",
    blurb:
      "Rhude tee in black, a large heraldic crest — the Rhude wordmark over a lion-and-shield emblem — printed across the back, a bigger graphic than the existing chest-patch Crest Tee.",
    details: [
      "Crewneck tee, lightweight cotton jersey",
      "Large heraldic crest graphic printed across the back",
      "New with tags",
    ],
    image: "/products/rhude-heraldic-crest-tee-black.jpg",
    badge: "just-in",
  },
  {
    slug: "amiri-wordmark-back-tee-black",
    name: "Wordmark Back Tee",
    category: "t-shirts",
    brand: "amiri",
    shape: "tee",
    colourway: { name: "Black", fill: "#131313", accent: "#8A8A85" },
    priceCents: 7_000,
    sizes: SIZE_RUN(),
    code: "SS-AMR-0122",
    blurb:
      "AMIRI tee in black, the AMIRI wordmark printed large across the back — a bigger, back-only take on the chest-logo Wordmark Tee.",
    details: [
      "Crewneck tee, lightweight cotton jersey",
      "AMIRI wordmark printed large across the back",
      "New with tags",
    ],
    image: "/products/amiri-wordmark-back-tee-black.jpg",
    badge: "just-in",
  },
  {
    slug: "prada-triangle-logo-tee-white",
    name: "Triangle Logo Tee",
    category: "t-shirts",
    brand: "prada",
    shape: "tee",
    colourway: { name: "White", fill: "#F2F2ED", accent: "#131313" },
    priceCents: 7_500,
    sizes: SIZE_RUN(),
    code: "SS-PRD-0123",
    blurb: "Prada tee in white, enamelled triangle logo at the chest.",
    details: [
      "Crewneck tee, lightweight cotton jersey",
      "Enamelled triangle logo at the left chest",
      "New with tags",
    ],
    image: "/products/prada-triangle-logo-tee-white.jpg",
    badge: "just-in",
  },
  {
    slug: "off-white-skull-icon-tee-black",
    name: "Skull Icon Tee",
    category: "t-shirts",
    brand: "off-white",
    shape: "tee",
    colourway: { name: "Black", fill: "#131313", accent: "#F2F2ED" },
    priceCents: 6_000,
    sizes: SIZE_RUN(),
    code: "SS-OFW-0124",
    blurb:
      "Off-White tee in black, a small KAWS-style skull icon with the Off-White wordmark at the chest, alongside the existing white.",
    details: [
      "Crewneck tee, lightweight cotton jersey",
      "Skull icon and Off-White wordmark at the left chest",
      "New with tags",
    ],
    image: "/products/off-white-skull-icon-tee-black.jpg",
    badge: "just-in",
  },
  {
    slug: "dior-atelier-paris-tee-white",
    name: "Atelier Paris Tee",
    category: "t-shirts",
    brand: "dior",
    shape: "tee",
    colourway: { name: "White", fill: "#F2F2ED", accent: "#131313" },
    priceCents: 8_000,
    sizes: SIZE_RUN(),
    code: "SS-DIOR-0125",
    blurb:
      "Dior tee in white, 'Christian Dior Atelier Paris — Avenue Montaigne' script printed at the chest, alongside the existing black.",
    details: [
      "Crewneck tee, lightweight cotton jersey",
      "'Christian Dior Atelier Paris' script printed at the chest",
      "New with tags",
    ],
    image: "/products/dior-atelier-paris-tee-white.jpg",
    badge: "just-in",
  },
  {
    slug: "prada-linea-rossa-tee-teal",
    name: "Linea Rossa Tee",
    category: "t-shirts",
    brand: "prada",
    shape: "tee",
    colourway: { name: "Teal", fill: "#2A8A9E", accent: "#C1272D" },
    priceCents: 7_500,
    sizes: SIZE_RUN(),
    code: "SS-PRD-0126",
    blurb:
      "Prada tee in teal, red-and-black Linea Rossa stripe patch at the chest.",
    details: [
      "Crewneck tee, lightweight cotton jersey",
      "Linea Rossa stripe patch at the left chest",
      "New with tags",
    ],
    image: "/products/prada-linea-rossa-tee-teal.jpg",
    badge: "just-in",
  },
  {
    slug: "dior-cd-icon-tee-black-2",
    name: "CD Icon Tee",
    category: "t-shirts",
    brand: "dior",
    shape: "tee",
    colourway: { name: "Black", fill: "#131313", accent: "#131313" },
    priceCents: 10_000,
    sizes: SIZE_RUN(),
    code: "SS-DIOR-0127",
    blurb:
      "Dior tee in black, tonal embroidered CD-icon logo at the chest — a second black unit, alongside the one already on the shelf.",
    details: [
      "Crewneck tee, lightweight cotton jersey",
      "Tonal embroidered CD-icon logo at the left chest",
      "New with tags",
    ],
    image: "/products/dior-cd-icon-tee-black-2.jpg",
    badge: "just-in",
  },
  {
    slug: "amiri-script-logo-tee-white",
    name: "Script Logo Tee",
    category: "t-shirts",
    brand: "amiri",
    shape: "tee",
    colourway: { name: "White", fill: "#F2F2ED", accent: "#2E5C7A" },
    priceCents: 7_000,
    sizes: SIZE_RUN(),
    code: "SS-AMR-0128",
    blurb:
      "AMIRI tee in white, an ornate cursive 'Amiri' script with a blue floral flourish at the chest.",
    details: [
      "Crewneck tee, lightweight cotton jersey",
      "Cursive script logo with a blue floral flourish at the chest",
      "New with tags",
    ],
    image: "/products/amiri-script-logo-tee-white.jpg",
    badge: "just-in",
  },
  {
    slug: "amiri-bold-wordmark-tee-black",
    name: "Bold Wordmark Tee",
    category: "t-shirts",
    brand: "amiri",
    shape: "tee",
    colourway: { name: "Black", fill: "#131313", accent: "#C9B896" },
    priceCents: 7_000,
    sizes: SIZE_RUN(),
    code: "SS-AMR-0129",
    blurb:
      "AMIRI tee in black, a large bold-serif AMIRI wordmark printed in tan across the chest — a heavier typeface than the other Wordmark tees.",
    details: [
      "Crewneck tee, lightweight cotton jersey",
      "Large bold-serif AMIRI wordmark printed in tan at the chest",
      "New with tags",
    ],
    image: "/products/amiri-bold-wordmark-tee-black.jpg",
    badge: "just-in",
  },
  {
    slug: "amiri-mx1-jeans-light-blue",
    name: "MX1 Jeans",
    category: "jeans",
    brand: "amiri",
    shape: "jeans",
    colourway: { name: "Light Blue", fill: "#8FA3B0", accent: "#5A6E7A" },
    priceCents: 15_000,
    sizes: JEAN_SIZE_RUN(),
    code: "SS-AMR-0130",
    blurb:
      "AMIRI MX1 jeans in a light blue wash, skinny fit, distressed rips at the thigh and knee backed with red-and-white plaid patches.",
    details: [
      "Skinny fit, five-pocket construction",
      "Distressed rips at the thigh and knee, plaid patch backing",
      "Silver-tone button and rivets",
      "New with tags",
    ],
    image: "/products/amiri-mx1-jeans-light-blue.jpg",
    badge: "just-in",
  },
  {
    slug: "amiri-mx1-jeans-black",
    name: "MX1 Jeans",
    category: "jeans",
    brand: "amiri",
    shape: "jeans",
    colourway: { name: "Black", fill: "#1A1A1A", accent: "#3A3A3A" },
    priceCents: 15_000,
    sizes: JEAN_SIZE_RUN(),
    code: "SS-AMR-0131",
    blurb:
      "AMIRI MX1 jeans in black, skinny fit, distressed rips at the thigh and knee backed with plaid patches.",
    details: [
      "Skinny fit, five-pocket construction",
      "Distressed rips at the thigh and knee, plaid patch backing",
      "Silver-tone button and rivets",
      "New with tags",
    ],
    image: "/products/amiri-mx1-jeans-black.jpg",
    badge: "just-in",
  },
  {
    slug: "prada-triangle-logo-beanie-grey",
    name: "Triangle Logo Beanie",
    category: "hats",
    brand: "prada",
    shape: "beanie",
    colourway: { name: "Grey", fill: "#8A8A85", accent: "#131313" },
    priceCents: 5_000,
    sizes: ONE_UNIT("One size"),
    code: "SS-PRD-0132",
    blurb:
      "Prada beanie in grey marl, ribbed knit, enamelled triangle logo patch on the cuff.",
    details: [
      "Ribbed knit, turn-up cuff",
      "Enamelled triangle logo patch at the cuff",
      "New with tags",
    ],
    image: "/products/prada-triangle-logo-beanie-grey.jpg",
    badge: "just-in",
  },
  {
    slug: "cp-company-goggle-beanie-black",
    name: "Goggle Beanie",
    category: "hats",
    brand: "cp-company",
    shape: "beanie",
    colourway: { name: "Black", fill: "#131313", accent: "#1A1A1A" },
    priceCents: 3_500,
    sizes: ONE_UNIT("One size"),
    code: "SS-CP-0133",
    blurb:
      "C.P. Company beanie in black, ribbed knit, the signature twin lens goggles fixed to the cuff.",
    details: [
      "Ribbed knit, turn-up cuff",
      "Twin lens goggles fixed to the cuff",
      "New with tags",
    ],
    image: "/products/cp-company-goggle-beanie-black.jpg",
    badge: "just-in",
  },
];

/**
 * Products added through the admin panel's "Add new item" form (see
 * app/admin/new and lib/admin/product-templates.ts) — appended after the
 * hand-authored catalogue above rather than mixed into it, so that huge
 * literal array never needs programmatic editing.
 */
export const PRODUCTS: Product[] = [
  ...BASE_PRODUCTS,
  ...(newProducts as Product[]),
];

/**
 * Stock and price overrides from the admin panel (see app/admin/stock and
 * lib/admin/github-content.ts) — which sizes are actually in stock, and
 * what a product actually costs, right now. Saving in the admin panel
 * commits updated lib/stock.json / lib/prices.json to GitHub, which
 * redeploys the site with the change baked in here, the same way every
 * other content change on this site ships. Absent here, a product just
 * keeps what it was defined with above.
 */
for (const product of PRODUCTS) {
  const overrides = (
    stockOverrides as Record<string, Record<string, boolean> | undefined>
  )[product.slug];

  if (overrides) {
    for (const size of product.sizes) {
      if (size.label in overrides) {
        size.inStock = overrides[size.label];
      }
    }
  }

  const overridePrice = (priceOverrides as Record<string, number | undefined>)[
    product.slug
  ];

  if (typeof overridePrice === "number") {
    product.priceCents = overridePrice;
  }
}

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
