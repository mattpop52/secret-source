"use client";

import {
  Fragment,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

/*
 * The pour: gloss paint running down the whole landing card as thin ink
 * strands — a solid mass across the top, and long narrow necks that string
 * out of it and run the full height of the page, passing behind the
 * wordmark and reaching the bottom edge, each ending in its own round
 * bulb. Loose flecks scatter between them. No two neighbours share a
 * length or a gauge.
 *
 * Timing is measured off the reference clip rather than guessed: there the
 * ink barely moves for the first ~45% of its run, then floods down fast
 * and settles. The keyframe below carries that same slow-creep-then-flood
 * profile, staggered per strand.
 *
 * The whole pour — band, flecks and every strand — is drawn as static
 * geometry inside a SINGLE filtered group, not filtered piece by piece:
 * one shared blur has no seam to leave where a strand's neck meets the
 * band, so it reads as one continuous body rather than a row of separate
 * icicles. The material is real SVG lighting, not a hand-drawn highlight:
 * blur → alpha threshold ("goo" — the metaball trick that fuses touching
 * shapes into one silhouette) → specular light from one distant source,
 * added back over the goo. The highlight brightens wherever the fused
 * silhouette's own curvature turns toward the light, which is what makes
 * it read as wet paint instead of a flat vector sticker.
 *
 * Because the filtered geometry never changes, motion can't come from
 * moving anything inside that group — it lives in a `<clipPath>` of
 * per-strand and per-band rects, each growing down from the top on its own
 * pace via `scaleY`. The filtered picture is rasterised once; only the
 * clip — a cheap compositor step — changes.
 *
 * The solid mass deliberately stops in the upper third. Flooding the card
 * solid (the reference's own final frame) would bury the monogram ground
 * and drop the bone wordmark to ~1.9:1 against the orange; keeping the
 * body up top and letting only thin strands run down past the lettering
 * puts paint at the bottom of the page without costing legibility.
 *
 * Strand gauges are authored in fixed pixels so they stay hair-thin at any
 * width, while every depth is a fraction of the measured card height, so
 * the pour reaches the bottom edge of a short laptop and a tall phone
 * alike. The viewBox is re-centred to the card's real width, so a phone
 * shows the middle of the same pour a desktop sees edge to edge — nothing
 * is stretched, every bulb stays round. The field is authored wide enough
 * for a 3440px screen.
 */

/** Full authored half-width of the paint field. */
const FIELD_HALF = 1720;

/** Circle-approximation constant for the round bulbs. */
const K = 0.5523;

type Strand = {
  /** Horizontal centre. 0 is mid-screen; phones see roughly ±195. */
  x: number;
  /** Half-width of the thin neck, in fixed pixels. */
  neckW: number;
  /** Radius of the round bulb the neck ends in, in fixed pixels. */
  bulbR: number;
  /** Depth of the bulb's centre, as a fraction of card height. */
  dFrac: number;
  /** Sideways drift of the tip — a thin string never falls dead straight. */
  lean: number;
  /** Full animation length; the slow creep is the first ~58% of it. */
  dur: number;
  delay: number;
};

/*
 * The cast, centre-out. The phone window (|x| < ~195) gets a complete
 * composition of its own — a long runner to the bottom, a couple of
 * mid-length strings and a short stub. Everything past it is what wider
 * screens pick up.
 */
const STRANDS: Strand[] = [
  // Centre — what a phone sees: one fat long runner, a hair-thin stub
  // beside it, and two mid-gauge strings at different depths.
  { x: -12, neckW: 11, bulbR: 19, dFrac: 0.88, lean: -4, dur: 8.4, delay: 0.2 },
  { x: -75, neckW: 5, bulbR: 9, dFrac: 0.34, lean: 3, dur: 6.8, delay: 1.0 },
  { x: -152, neckW: 20, bulbR: 33, dFrac: 0.97, lean: -6, dur: 9.2, delay: 0 },
  { x: 62, neckW: 8, bulbR: 14, dFrac: 0.93, lean: 4, dur: 8.9, delay: 0.35 },
  {
    x: 141,
    neckW: 16,
    bulbR: 27,
    dFrac: 0.57,
    lean: -5,
    dur: 7.5,
    delay: 0.15,
  },
  { x: 199, neckW: 5, bulbR: 9, dFrac: 0.3, lean: 3, dur: 6.6, delay: 1.2 },
  // Outward — irregular gaps and clustering, gauges from hair to heavy.
  { x: -208, neckW: 7, bulbR: 12, dFrac: 0.52, lean: 4, dur: 7.8, delay: 0.7 },
  {
    x: -266,
    neckW: 9,
    bulbR: 16,
    dFrac: 0.71,
    lean: -3,
    dur: 8.2,
    delay: 0.45,
  },
  {
    x: 252,
    neckW: 10,
    bulbR: 17,
    dFrac: 0.78,
    lean: -4,
    dur: 8.1,
    delay: 0.55,
  },
  { x: -358, neckW: 5, bulbR: 9, dFrac: 0.27, lean: -3, dur: 6.5, delay: 1.3 },
  { x: 361, neckW: 21, bulbR: 35, dFrac: 0.99, lean: 7, dur: 9.4, delay: 0.05 },
  {
    x: -414,
    neckW: 17,
    bulbR: 29,
    dFrac: 0.84,
    lean: 5,
    dur: 8.7,
    delay: 0.25,
  },
  { x: 424, neckW: 6, bulbR: 11, dFrac: 0.43, lean: -4, dur: 7.1, delay: 0.95 },
  {
    x: -472,
    neckW: 7,
    bulbR: 12,
    dFrac: 0.45,
    lean: -4,
    dur: 7.3,
    delay: 0.85,
  },
  { x: 486, neckW: 9, bulbR: 15, dFrac: 0.64, lean: 4, dur: 8.0, delay: 0.6 },
  { x: -588, neckW: 12, bulbR: 21, dFrac: 0.94, lean: 5, dur: 9.0, delay: 0.1 },
  { x: 592, neckW: 5, bulbR: 9, dFrac: 0.26, lean: 3, dur: 6.4, delay: 1.35 },
  { x: -648, neckW: 6, bulbR: 10, dFrac: 0.36, lean: -3, dur: 6.9, delay: 1.1 },
  { x: 649, neckW: 19, bulbR: 32, dFrac: 0.87, lean: -6, dur: 8.6, delay: 0.2 },
  { x: -706, neckW: 9, bulbR: 15, dFrac: 0.61, lean: 4, dur: 8.3, delay: 0.5 },
  { x: 733, neckW: 8, bulbR: 13, dFrac: 0.5, lean: 4, dur: 7.6, delay: 0.75 },
  { x: -822, neckW: 22, bulbR: 36, dFrac: 1.01, lean: -7, dur: 9.5, delay: 0 },
  { x: 843, neckW: 13, bulbR: 22, dFrac: 0.72, lean: 5, dur: 8.2, delay: 0.4 },
  { x: -884, neckW: 6, bulbR: 10, dFrac: 0.39, lean: 3, dur: 7.0, delay: 1.15 },
  { x: 951, neckW: 5, bulbR: 9, dFrac: 0.37, lean: -3, dur: 6.7, delay: 0.9 },
  { x: -968, neckW: 14, bulbR: 24, dFrac: 0.76, lean: 5, dur: 8.5, delay: 0.3 },
  {
    x: 1008,
    neckW: 10,
    bulbR: 17,
    dFrac: 0.92,
    lean: 4,
    dur: 9.1,
    delay: 0.15,
  },
  {
    x: -1078,
    neckW: 8,
    bulbR: 13,
    dFrac: 0.55,
    lean: -4,
    dur: 7.9,
    delay: 0.65,
  },
  {
    x: 1122,
    neckW: 23,
    bulbR: 38,
    dFrac: 0.85,
    lean: -7,
    dur: 8.8,
    delay: 0.1,
  },
  { x: -1134, neckW: 5, bulbR: 9, dFrac: 0.29, lean: 3, dur: 6.6, delay: 1.25 },
  { x: 1233, neckW: 7, bulbR: 12, dFrac: 0.46, lean: 4, dur: 7.4, delay: 0.8 },
  {
    x: -1248,
    neckW: 18,
    bulbR: 30,
    dFrac: 0.9,
    lean: -6,
    dur: 9.3,
    delay: 0.05,
  },
  {
    x: -1313,
    neckW: 7,
    bulbR: 11,
    dFrac: 0.47,
    lean: 4,
    dur: 7.2,
    delay: 1.05,
  },
  {
    x: 1344,
    neckW: 16,
    bulbR: 27,
    dFrac: 0.74,
    lean: 5,
    dur: 8.4,
    delay: 0.45,
  },
  {
    x: -1424,
    neckW: 11,
    bulbR: 19,
    dFrac: 0.66,
    lean: 5,
    dur: 8.1,
    delay: 0.55,
  },
  {
    x: 1452,
    neckW: 6,
    bulbR: 10,
    dFrac: 0.32,
    lean: -3,
    dur: 6.8,
    delay: 1.15,
  },
  {
    x: -1533,
    neckW: 6,
    bulbR: 10,
    dFrac: 0.33,
    lean: -3,
    dur: 6.9,
    delay: 0.95,
  },
  {
    x: 1544,
    neckW: 12,
    bulbR: 20,
    dFrac: 0.96,
    lean: 5,
    dur: 9.0,
    delay: 0.25,
  },
  {
    x: -1624,
    neckW: 15,
    bulbR: 25,
    dFrac: 0.82,
    lean: 4,
    dur: 8.6,
    delay: 0.35,
  },
  { x: 1657, neckW: 9, bulbR: 15, dFrac: 0.6, lean: -4, dur: 7.7, delay: 0.7 },
];

/** The heaviest bulb on the shelf — the band's sag and its reveal window
 *  are both sized off this, so adding a fatter strand can't leave the
 *  band's own window clipping short of its deepest sag. */
const MAX_BULB = Math.max(...STRANDS.map((s) => s.bulbR));

/** Loose flecks that broke off on the way down, as fractions of height. */
const FLECKS: { x: number; yFrac: number; r: number }[] = [
  { x: -62, yFrac: 0.46, r: 6 },
  { x: 150, yFrac: 0.3, r: 5 },
  { x: -128, yFrac: 0.58, r: 5 },
  { x: 300, yFrac: 0.42, r: 5 },
  { x: -420, yFrac: 0.36, r: 4 },
  { x: 575, yFrac: 0.66, r: 6 },
  { x: -600, yFrac: 0.5, r: 5 },
  { x: 780, yFrac: 0.33, r: 5 },
  { x: -820, yFrac: 0.72, r: 5 },
  { x: 1010, yFrac: 0.52, r: 6 },
  { x: -1060, yFrac: 0.4, r: 5 },
  { x: 1255, yFrac: 0.62, r: 5 },
  { x: -1320, yFrac: 0.34, r: 5 },
  { x: 1540, yFrac: 0.45, r: 6 },
];

/**
 * One strand: a thin near-parallel neck that swells into a true round bulb
 * at the tip. The tail runs far above the canvas so the reveal window
 * never runs out of shape to uncover.
 */
function strandPath(s: Strand, d: number, tail: number, scale: number): string {
  const { x } = s;
  const neckW = s.neckW * scale;
  const bulbR = s.bulbR * scale;
  const tip = x + s.lean * scale;
  const neckBottom = d - bulbR * 1.35;
  const waistY = d - bulbR * 1.8;
  const equatorY = d - bulbR;

  return [
    `M ${x - neckW} ${tail}`,
    `L ${x - neckW} ${neckBottom}`,
    `C ${x - neckW} ${neckBottom + neckW * 0.5} ${tip - bulbR} ${waistY} ${tip - bulbR} ${equatorY}`,
    `C ${tip - bulbR} ${equatorY + K * bulbR} ${tip - K * bulbR} ${d} ${tip} ${d}`,
    `C ${tip + K * bulbR} ${d} ${tip + bulbR} ${equatorY + K * bulbR} ${tip + bulbR} ${equatorY}`,
    `C ${tip + bulbR} ${waistY} ${x + neckW} ${neckBottom + neckW * 0.5} ${x + neckW} ${neckBottom}`,
    `L ${x + neckW} ${tail}`,
    "Z",
  ].join(" ");
}

/**
 * Strand gauges are authored against a 1440px card. Left in raw pixels a
 * phone would get desktop-weight strings across a third of the width, so
 * the gauge is eased toward the card's own width — never below two thirds
 * (hair-thin strands vanish) and never past 1.1 (they stop reading as
 * thin). Depths stay fractional, so length is unaffected.
 */
function gaugeScale(width: number): number {
  return Math.min(1.1, Math.max(0.66, width / 1440));
}

/**
 * The solid mass across the top: sags where each strand strings out of it,
 * arches up in the gaps between. Those arches are the openings that stay
 * black as the pour advances.
 */
function bandPath(height: number, tail: number, scale: number): string {
  const base = BAND_BASE_FRAC * height;
  const sorted = [...STRANDS].sort((a, b) => a.x - b.x);
  const parts: string[] = [
    `M ${-FIELD_HALF} ${tail}`,
    `L ${-FIELD_HALF} ${base}`,
  ];

  let previous = { x: -FIELD_HALF, y: base };

  for (const s of sorted) {
    // The edge only undulates gently — in the reference the mass has a
    // nearly flat, softly scalloped bottom and the descent is carried by
    // the strands hanging off it. Pushing the arches far above the sags
    // turns those gaps into sharp black spikes instead.
    const sagY = base + 12 + (s.bulbR * scale - 9) * 0.9;
    const archX = (previous.x + s.x) / 2;
    const archY = base - 20 + Math.abs(Math.sin(s.x * 0.9)) * 12;

    parts.push(
      `C ${previous.x + (archX - previous.x) * 0.55} ${previous.y} ${archX - (archX - previous.x) * 0.55} ${archY} ${archX} ${archY}`,
      `C ${archX + (s.x - archX) * 0.55} ${archY} ${s.x - (s.x - archX) * 0.55} ${sagY} ${s.x} ${sagY}`,
    );
    previous = { x: s.x, y: sagY };
  }

  parts.push(
    `C ${previous.x + 60} ${previous.y} ${FIELD_HALF - 80} ${base} ${FIELD_HALF} ${base}`,
    `L ${FIELD_HALF} ${tail}`,
    "Z",
  );

  return parts.join(" ");
}

/** Padding past a shape's own depth so the goo's blur halo is never itself
 *  clipped off by that shape's reveal window. */
const REVEAL_PAD = 20;

/** Where the solid mass's bottom edge sits, as a fraction of card height. */
const BAND_BASE_FRAC = 0.13;

/**
 * Reveal windows start here, just above the card's top edge — NOT at the
 * shapes' own tails. The tails run hundreds of pixels above the frame so
 * the geometry never shows an end; anchoring the reveal up there too would
 * spend the whole slow phase uncovering off-screen shape, and the pour
 * would sit invisible for seconds before anything appeared. Everything
 * above y=0 is off-card anyway, so clipping from here costs nothing and
 * makes the animation's progress map directly to visible descent.
 */
const REVEAL_TOP = -40;

/**
 * Strand reveal windows start this far above the band's bottom edge —
 * under the mass, never above it. A strand's window is a rectangle, so if
 * it reached up into the band it would uncover a rectangular tab of band
 * either side of the neck and the top edge would step like a bar chart.
 * Starting under the band means a strand can only ever grow downward out
 * of the mass, which is also exactly how the reference reads.
 */
const STRAND_REVEAL_LIFT = 25;

/** Strands hold until the mass has landed, so none appears detached. */
const STRAND_DELAY_OFFSET = 1;

export function PaintPour() {
  const frameRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 1440, height: 900 });
  const paintId = useId();
  const gooId = useId();
  const revealId = useId();

  useLayoutEffect(() => {
    const frame = frameRef.current;
    if (!frame) {
      return;
    }

    const observer = new ResizeObserver((entries) => {
      const box = entries[0]?.contentRect;
      if (box?.width && box.height) {
        setSize({
          width: Math.ceil(box.width),
          height: Math.ceil(box.height),
        });
      }
    });

    observer.observe(frame);
    return () => observer.disconnect();
  }, []);

  const { width, height } = size;

  const geometry = useMemo(() => {
    // The tail must clear the tallest reveal window's own travel, so a
    // strand is never caught with its top edge inside the frame.
    const tail = -Math.max(600, height * 0.6);
    const scale = gaugeScale(width);

    return {
      tail,
      band: bandPath(height, tail, scale),
      strandRevealTop: BAND_BASE_FRAC * height - STRAND_REVEAL_LIFT,
      bandReveal:
        BAND_BASE_FRAC * height +
        12 +
        (MAX_BULB * scale - 9) * 0.9 +
        REVEAL_PAD,
      strands: STRANDS.map((strand) => {
        const d = strand.dFrac * height;
        return {
          strand,
          d,
          neckW: strand.neckW * scale,
          bulbR: strand.bulbR * scale,
          path: strandPath(strand, d, tail, scale),
        };
      }),
      flecks: FLECKS.map((fleck) => ({
        ...fleck,
        y: fleck.yFrac * height,
        rScaled: fleck.r * scale,
      })),
    };
  }, [width, height]);

  return (
    <div aria-hidden="true" className="ss-pour" ref={frameRef}>
      {/* Decorative — the wrapper is aria-hidden, so no title is needed. */}
      {/* biome-ignore lint/a11y/noSvgWithoutTitle: hidden from assistive tech via the wrapper's aria-hidden */}
      <svg
        fill="none"
        preserveAspectRatio="xMidYMin slice"
        viewBox={`${-width / 2} 0 ${width} ${height}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Lit from above, deepening as the paint travels — the same ramp
              at every size because it lives in user space. */}
          <linearGradient
            gradientUnits="userSpaceOnUse"
            id={paintId}
            x1="0"
            x2="0"
            y1={-40}
            y2={height}
          >
            <stop offset="0" stopColor="#ffcb45" />
            <stop offset="0.32" stopColor="#faa703" />
            <stop offset="0.7" stopColor="#ec9600" />
            <stop offset="1" stopColor="#dd8b00" />
          </linearGradient>

          {/*
           * Two jobs, two blurs. A wide blur pushed through a steep alpha
           * threshold is the "goo" — the metaball trick that fuses a
           * strand into the band wherever they overlap, so it reads as one
           * continuous body rather than stacked shapes. A second, gentler
           * blur of the same silhouette's alpha feeds specular lighting
           * from one distant source: real dimensional highlight wherever
           * the curve turns toward the light, added back onto the goo (not
           * just masked over it — addition is what makes it read as light
           * hitting a surface). One filter serves the whole pour's
           * bounding box, not one shape at a time.
           */}
          {/* sRGB interpolation is not cosmetic here: the SVG default is
              linearRGB, which makes the browser convert every pixel in
              this region in and back out again — over a full-card filter
              that alone was most of the frame budget. */}
          <filter
            colorInterpolationFilters="sRGB"
            height="106%"
            id={gooId}
            width="104%"
            x="-2%"
            y="-3%"
          >
            <feGaussianBlur in="SourceGraphic" result="soft" stdDeviation="4" />
            <feColorMatrix
              in="soft"
              result="goo"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 26 -11"
            />
            <feGaussianBlur in="SourceAlpha" result="bump" stdDeviation="2.4" />
            <feSpecularLighting
              in="bump"
              lightingColor="#fff4e0"
              result="spec"
              specularConstant="1.6"
              specularExponent="18"
              surfaceScale="5"
            >
              <feDistantLight azimuth="235" elevation="25" />
            </feSpecularLighting>
            <feComposite in="spec" in2="goo" operator="in" result="specIn" />
            <feComposite
              in="goo"
              in2="specIn"
              k1="0"
              k2="1"
              k3="1"
              k4="0"
              operator="arithmetic"
            />
          </filter>

          {/* The reveal: a band-wide window plus one window per strand,
              unioned by the clipPath. Each grows down from the same top
              anchor at its own pace — the underlying art never moves. */}
          <clipPath id={revealId}>
            <rect
              className="ss-pour-band-reveal"
              height={geometry.bandReveal - REVEAL_TOP}
              style={
                { "--dur": "8.6s", "--delay": "0.1s" } as React.CSSProperties
              }
              width={FIELD_HALF * 2}
              x={-FIELD_HALF}
              y={REVEAL_TOP}
            />
            {geometry.strands.map(({ strand, d, neckW, bulbR }) => {
              const halfW = Math.max(neckW, bulbR);
              const travel = d + bulbR + REVEAL_PAD - geometry.strandRevealTop;
              const timing = {
                "--dur": `${strand.dur}s`,
                "--delay": `${strand.delay + STRAND_DELAY_OFFSET}s`,
              } as React.CSSProperties;

              return (
                <Fragment key={strand.x}>
                  <rect
                    className="ss-pour-run-reveal"
                    height={travel}
                    style={timing}
                    width={(halfW + REVEAL_PAD) * 2}
                    x={strand.x - halfW - REVEAL_PAD}
                    y={geometry.strandRevealTop}
                  />
                  {/* The rect alone would cut every growing strand off
                      square. This circle rides the same front on the same
                      timing, so the union's leading edge is its arc and a
                      strand grows a round tip the way the reference does. */}
                  <circle
                    className="ss-pour-run-tip"
                    cx={strand.x + strand.lean * 0.5}
                    cy={geometry.strandRevealTop}
                    r={halfW + 6}
                    style={
                      {
                        ...timing,
                        "--travel": `${travel}px`,
                      } as React.CSSProperties
                    }
                  />
                </Fragment>
              );
            })}
          </clipPath>
        </defs>

        {/* One filtered group for the whole pour — band, flecks and every
            strand together — so the goo fuses each neck into the band with
            no seam, reading as one continuous body of paint.

            The clip sits on the OUTER group and the filter on the inner
            one, deliberately. Put both on the same element and the browser
            re-runs the whole filter every frame the clip animates; split
            like this the filtered subtree never changes, so it rasterises
            once and the animation is only re-clipping that cached layer. */}
        <g clipPath={`url(#${revealId})`}>
          <g filter={`url(#${gooId})`}>
            <path d={geometry.band} fill={`url(#${paintId})`} />
            {geometry.flecks.map((fleck) => (
              <circle
                cx={fleck.x}
                cy={fleck.y}
                fill={`url(#${paintId})`}
                key={fleck.x}
                r={fleck.rScaled}
              />
            ))}
            {geometry.strands.map(({ strand, path }) => (
              <path d={path} fill={`url(#${paintId})`} key={strand.x} />
            ))}
          </g>
        </g>
      </svg>
    </div>
  );
}
