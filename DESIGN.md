---
name: Secret Source
description: A resale plug's shelf, presented as a checked shipment — pitch black, hazard orange, everything stamped and docketed
colors:
  pitch: "#050505"
  crate-black: "#0A0A0A"
  panel: "#121211"
  panel-high: "#1A1A18"
  hazard-orange: "#FAA703"
  hazard-orange-hot: "#FFBE38"
  hazard-orange-deep: "#C07F00"
  bone: "#FAFAF2"
  smoke: "#A4A099"
  sold: "#6B6862"
  hairline: "rgb(250 250 242 / 14%)"
  hairline-strong: "rgb(250 250 242 / 28%)"
  on-orange: "#120C00"
  alert: "#E23A21"
typography:
  display:
    fontFamily: "Lilita One, system-ui, sans-serif"
    fontSize: "clamp(3rem, 10.5vw, 7.5rem)"
    fontWeight: 400
    lineHeight: 0.84
    letterSpacing: "0.005em"
    textTransform: "uppercase"
  headline:
    fontFamily: "Lilita One, system-ui, sans-serif"
    fontSize: "clamp(2rem, 5.5vw, 3.75rem)"
    fontWeight: 400
    lineHeight: 0.88
    textTransform: "uppercase"
  stencil-micro:
    fontFamily: "Barlow Condensed, system-ui, sans-serif"
    fontSize: "0.55rem"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "0.18em"
    textTransform: "uppercase"
  stencil:
    fontFamily: "Barlow Condensed, system-ui, sans-serif"
    fontSize: "0.62rem"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "0.18em"
    textTransform: "uppercase"
  stencil-lg:
    fontFamily: "Barlow Condensed, system-ui, sans-serif"
    fontSize: "0.7rem"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "0.18em"
    textTransform: "uppercase"
  stencil-xl:
    fontFamily: "Barlow Condensed, system-ui, sans-serif"
    fontSize: "0.8rem"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "0.18em"
    textTransform: "uppercase"
  numeric:
    fontFamily: "Barlow Condensed, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 700
    fontVariantNumeric: "tabular-nums"
  body:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.625
rounded:
  none: "0px"
  full: "9999px"
spacing:
  xs: "8px"
  sm: "12px"
  md: "20px"
  lg: "40px"
  xl: "64px"
  "2xl": "80px"
components:
  button-primary:
    backgroundColor: "{colors.hazard-orange}"
    textColor: "{colors.on-orange}"
    typography: "{typography.stencil}"
    rounded: "{rounded.none}"
    padding: "16px 32px"
  button-primary-hover:
    backgroundColor: "{colors.hazard-orange-hot}"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.bone}"
    border: "1px solid {colors.hairline-strong}"
    typography: "{typography.stencil}"
    rounded: "{rounded.none}"
    padding: "16px 32px"
  button-secondary-hover:
    border: "1px solid {colors.hazard-orange}"
    textColor: "{colors.hazard-orange}"
  card:
    backgroundColor: "{colors.crate-black}"
    textColor: "{colors.bone}"
    border: "1px solid {colors.hairline}"
    rounded: "{rounded.none}"
    padding: "28px"
  docket:
    backgroundColor: "{colors.panel}"
    border: "1px dashed {colors.hairline-strong}"
    rounded: "{rounded.none}"
    padding: "20px"
---

# Design System: Secret Source

## Overview

**Creative North Star: "The checked shipment"**

Secret Source is one person's shelf of streetwear, and the site is built to look
like that shelf: a pitch-black room, hazard tape across everything that matters,
and a stamped docket on every piece so you know it has been opened, inspected
and signed off. The category default — a white Shopify grid with a thin sans and
soft grey cards — is the thing this system exists to refuse. Nothing here is
soft: corners are square, edges are hairlines, the accent is a warning colour,
and the display type is the same bubbled graffiti hand as the logo painted on the
badge.

The whole identity is derived from one supplied asset. The logo's orange ring
became the hazard tape, its bone lettering became the display face, its black
disc became the ground, and the plug from its crown became the bullet that marks
every promise the shop makes.

**Key Characteristics:**
- Black ground everywhere; orange is a warning colour spent on actions, stamps and one full-bleed marquee per scroll
- Zero corner radius on every surface, with `rounded-full` reserved for nothing at all — the pill has no place on this shelf
- Three faces doing three jobs: Lilita One shouts, Barlow Condensed stamps, Archivo explains
- Diagonal hazard hatching (-45°) is the only texture; it appears at 10–16% opacity behind heroes and product art
- Every section opens with the same stamp: an orange index number, a tracked stencil label, then a display headline
- Product artwork is drawn, not photographed — flat vector garments in each piece's own colourway, replaced automatically by real photography when a product carries an `image`

## Colors

### Primary
- **Hazard Orange** (`#FAA703`, straight off the logo ring): every primary action, every stamp, the tape, the index numbers, the marquee band, focus rings. Brightens to `#FFBE38` on hover. It is a warning colour, so it is spent on things that demand a decision — add to basket, checkout, "this week's drop" — never as a large calm surface.
- **On Orange** (`#120C00`): the near-black used for text sitting on orange. Never pure black, so orange fills keep a trace of warmth.

### Neutral
- **Crate Black** (`#0A0A0A`): the page ground and the default section background.
- **Pitch** (`#050505`): the alternate section background and the footer — one shade deeper, which is all the rhythm a black site needs.
- **Panel** (`#121211`) / **Panel High** (`#1A1A18`): product media beds, dockets, hover fills.
- **Bone** (`#FAFAF2`, the logo's lettering): all primary text.
- **Smoke** (`#A4A099`): body copy, captions, everything supporting.
- **Sold** (`#6B6862`): struck-through prices and sold-out sizes — the one grey that means "gone".
- **Hairline** (`rgb(250 250 242 / 14%)`) and **Hairline Strong** (28%): every border in the system. Grids are built from `gap-px` over a hairline background, so the rules between cards are the background showing through.

### Named Rules
**The Warning-Colour Rule.** Orange marks a decision or a guarantee, nothing else. If a screen has more than one orange fill competing for the same decision, one of them is decoration and should be a hairline instead.

## Typography

Three faces, each with a job it never leaves:

- **Lilita One** (display, uppercase, line-height 0.84–0.95): headlines, brand names, prices at hero scale. It is the closest webfont to the logo's bubbled hand, so headlines read as the same lettering as the badge. Carries a hard `0.055em` offset shadow (`.ss-display-shadow`) on page-level headlines, borrowed from the logo's own drop shadow.
- **Barlow Condensed** (`.ss-stencil`, 700, `0.18em` tracking, uppercase) on a four-step ramp and nothing between the steps — `0.55rem` (docket terms, size runs on tiles), `0.62rem` (nav, badges, eyebrows, most labels), `0.7rem` (buttons, panel headings), `0.8rem` (the primary action on a page): the shop's stamping. Labels, size buttons, nav, buttons, badges, docket terms, breadcrumbs. Also `.ss-num` (tabular figures, no tracking) for every price, count and quantity.
- **Archivo** (400–600, 0.875–1.125rem, line-height 1.6): paragraphs and product copy. It never appears uppercase and never becomes a headline.

### Named Rules
**The Stamp-Speaks Rule.** Anything that would be printed on a crate — a label, a size, a price, a button, a status — is Barlow Condensed, uppercase and tracked. Anything explaining something to a human is Archivo. Lilita One is only ever the thing being announced.

## Layout

One container, `max-w-[1240px]`, with `px-4` mobile / `px-6` desktop gutters, used by every section including the header and footer. Sections run `py-16` mobile / `py-20` desktop.

Grids are hairline-ruled: `grid gap-px bg-[hairline]` with each cell painted `bg-[crate-black]`, so the separators are structural rather than drawn. Product grids are 2 columns on mobile and 4 on desktop, with a wider vertical gutter (`gap-y-10`) than horizontal (`gap-x-5`) because the caption block under each tile needs air.

Product pages split 50/50 on `lg`, with the media column sticky at `top-24` and the buy column scrolling past it. The media column carries the docket and the check log beneath the image so the sticky column is never a short stub next to a long one.

**Responsive behaviour:** the brand nav collapses into a two-column stamped panel under a hamburger below `lg`; the product page grows a sticky bottom buy bar below `lg` that jumps to the size picker; the basket is a right-hand drawer at every width, full-width below `26rem`.

### Named Rules
**The Hairline-Grid Rule.** Cards do not carry their own borders inside a grid — the grid's `gap-px` over a hairline background makes the rules, so adjacent cells always share exactly one line.

## Elevation & Depth

The system is flat by design: no drop shadows on cards, no lifting on hover, no glass. Depth comes from three things only — a hairline, a change of ground (`crate-black` → `panel`), and the drawn artwork's own `drop-shadow` inside product media. Interactive surfaces answer with colour and motion instead of elevation: borders turn orange, backgrounds step one shade lighter, product art scales `1.04` inside a fixed frame.

The only floating surfaces are the basket drawer (slides from the right over a `black/70` backdrop) and the sticky header (`black/95` with a backdrop blur), both separated by a hairline rather than a shadow.

### Named Rules
**The No-Lift Rule.** Nothing rises on hover. If an element needs to acknowledge a pointer, it changes its border to orange, steps its ground one shade, or moves its own content — it does not translate upward and it does not gain a shadow.

## Shapes

Square corners, everywhere, without exception — buttons, cards, inputs, badges, drawers, images. The one curve in the system is the logo badge itself, and its authority comes from being the only circle in the room.

The recurring geometry is the **-45° diagonal**: hazard tape (`repeating-linear-gradient` at 14px), the fine hatch behind heroes and product posters (3px stripe, 20px pitch, 10–16% opacity), and the strike-through on a sold-out size. Anything that means "checked, sealed, taped" is drawn on that angle.

## Components

### Buttons
- **Primary:** orange fill, `on-orange` text, stencil type, `px-8 py-4`, square. Hover brightens the fill. One per view.
- **Secondary:** transparent with a 1px hairline-strong border. Hover turns border and text orange.
- **Tertiary:** stencil text with an underline offset, smoke-coloured, used for "remove", "view full basket", inline links.

### Product tile
Fixed `4/5` media frame with a hairline border that turns orange on hover while the artwork inside scales. Badges are stamped into the frame's corners — an orange "Just in / Restocked / Last one" tab top-left, a hairlined "−40%" top-right, and a full-width "Sold out" strip along the bottom. Below the frame: brand in orange stencil, name in Archivo semibold, colourway in smoke, price row with a struck compare-at, then the size run with sold sizes struck through — the shelf's stock state visible before you click.

### Product media
Real photography when the catalogue supplies it. Otherwise the authored poster: a hatch-and-glow bed, the brand name set oversized at 7% opacity behind, a flat vector garment painted in the product's colourway, and a small "Studio shot pending" stencil in the corner so nobody mistakes a drawing for a photograph.

### Docket
A dashed-border panel carrying a piece's paperwork — docket number, colourway, condition, ship-from — in stencil terms over tabular values. The check log beneath it uses the same panel language with orange ticks.

### Size picker
Stencil-typed square buttons. Available: hairline border, orange border on hover, full orange fill when selected. Sold out: dimmed to `sold` with a `-22°` line drawn across the button and a screen-reader "sold out". Sold-out sizes stay visible, because what's gone is information.

### Hazard tape and marquee
Two weights of tape: `.ss-tape-thin` (7px) frames the announcement bar and tops the footer; `.ss-tape` (14px) fills a full block. The marquee band runs Lilita One at `clamp(1.75rem, 4vw, 3rem)` across an orange ground (or pitch, outlined) with a rotated square between phrases, pausing on hover and freezing entirely under `prefers-reduced-motion`.

### Section heading
Orange index chip (`01`), stencil label, then the display headline with its offset shadow, and an optional action pinned to the baseline on the right. Used unchanged on every section of every page.

## Do's and Don'ts

### Do:
- **Do** open every section with the index-chip + stencil-label + display-headline stamp.
- **Do** build separators from `gap-px` over a hairline background rather than per-card borders.
- **Do** keep sold-out sizes and struck compare-at prices visible — the shelf's state is the shop's honesty.
- **Do** spend orange on decisions and guarantees, and let hairlines carry everything structural.
- **Do** draw new artwork in the flat, filled, hard-outlined grammar of the garment posters, in the piece's own colourway.
- **Do** label anything synthetic where a shopper could mistake it for the real thing ("Studio shot pending").

### Don't:
- **Don't** introduce a corner radius. Not on cards, not on buttons, not on inputs.
- **Don't** add drop shadows or hover lifts — the system answers pointers with colour, not elevation.
- **Don't** set body copy in Lilita One or a headline in Archivo; the three faces don't trade jobs.
- **Don't** use orange as a large calm background — one full-bleed orange marquee per scroll is the ceiling.
- **Don't** ship a grey "image coming soon" placeholder; every product gets a drawn poster or a photograph.
