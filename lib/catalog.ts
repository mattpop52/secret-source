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
  {
    slug: "polo-ralph-lauren-tracksuit-stone",
    name: "Zip Hoodie Tracksuit",
    category: "tracksuits",
    brand: "polo-ralph-lauren",
    shape: "tracksuit",
    colourway: { name: "Stone", fill: "#D9D0BE", accent: "#1B2A4A" },
    priceCents: 11_999,
    sizes: ONE_UNIT(),
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
    priceCents: 29_999,
    sizes: ONE_UNIT(),
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
    priceCents: 19_999,
    sizes: ONE_UNIT(),
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
    priceCents: 19_999,
    sizes: ONE_UNIT(),
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
    priceCents: 22_999,
    sizes: ONE_UNIT(),
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
    priceCents: 32_999,
    sizes: ONE_UNIT(),
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
    priceCents: 13_999,
    sizes: ONE_UNIT(),
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
    priceCents: 26_999,
    sizes: ONE_UNIT(),
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
    priceCents: 12_999,
    sizes: ONE_UNIT(),
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
    priceCents: 24_999,
    sizes: ONE_UNIT(),
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
    priceCents: 15_999,
    sizes: ONE_UNIT(),
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
    priceCents: 13_999,
    sizes: ONE_UNIT(),
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
    priceCents: 12_999,
    sizes: ONE_UNIT(),
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
    priceCents: 18_999,
    sizes: ONE_UNIT(),
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
    priceCents: 26_999,
    sizes: ONE_UNIT(),
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
    priceCents: 14_999,
    sizes: ONE_UNIT(),
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
    priceCents: 29_999,
    sizes: ONE_UNIT(),
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
    priceCents: 24_999,
    sizes: ONE_UNIT(),
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
    priceCents: 32_999,
    sizes: ONE_UNIT(),
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
    priceCents: 13_999,
    sizes: ONE_UNIT(),
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
    priceCents: 17_999,
    sizes: ONE_UNIT(),
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
    priceCents: 26_999,
    sizes: ONE_UNIT(),
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
    priceCents: 13_999,
    sizes: ONE_UNIT(),
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
    priceCents: 13_999,
    sizes: ONE_UNIT(),
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
    priceCents: 22_999,
    sizes: ONE_UNIT(),
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
    priceCents: 13_999,
    sizes: ONE_UNIT(),
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
