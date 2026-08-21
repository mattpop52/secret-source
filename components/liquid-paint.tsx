import { PAINT_SHAPES } from "@/lib/paint-shapes";

/*
 * All the paint, as one liquid.
 *
 * Each mass is a single SVG in two layers that read as one body:
 *
 * 1. The runs — long stems, their heads, the falling drops — drawn plain,
 *    with the 3D baked into gradients: a horizontal ramp across each stem so
 *    it reads as a lit cylinder, a radial on each drop.
 * 2. The mass itself, plus the first stretch of every run, behind a gooey
 *    filter (blur → alpha contrast → specular light): anything touching
 *    fuses, necks and rounds like liquid, with a glossy rim where the light
 *    catches the curves.
 *
 * The filter is deliberately clipped to a window just below the artwork —
 * running blur and lighting over the full height of the runs is what makes
 * this effect melt a GPU (measured: 5fps). The goo layer paints over the
 * plain layer through the whole window, so the hand-off line never shows;
 * below it the baked gradients carry the depth.
 *
 * Geometry lives in each artwork's own pixel space (lib/paint-shapes.ts);
 * tips were measured off the silhouettes, colours sampled off the paint.
 */

type Stem = {
  x: number;
  y: number;
  /** Width where it leaves the mass, and where it has thinned to. */
  wTop: number;
  wBot: number;
  run: number;
  dur: number;
  delay: number;
};

type Drop = {
  x: number;
  y: number;
  r: number;
  run: number;
  dur: number;
  delay: number;
};

type Mass = {
  key: "tl" | "tc" | "tr" | "bl" | "br";
  /** Total viewBox height — room below the artwork for the runs. */
  vh: number;
  stems: Stem[];
  drops: Drop[];
};

const MASSES: Mass[] = [
  {
    key: "tl",
    vh: 1750,
    stems: [
      { x: 27, y: 167, wTop: 26, wBot: 14, run: 1450, dur: 17, delay: 0.4 },
      { x: 110, y: 71, wTop: 20, wBot: 11, run: 240, dur: 9, delay: 3.2 },
      { x: 200, y: 54, wTop: 16, wBot: 9, run: 430, dur: 13, delay: 6.4 },
    ],
    drops: [{ x: 229, y: 105, r: 10, run: 1500, dur: 9, delay: 5 }],
  },
  {
    key: "tc",
    vh: 1900,
    stems: [
      // The long one — straight down behind the wordmark and the button.
      { x: 39, y: 105, wTop: 22, wBot: 12, run: 1650, dur: 15, delay: 0.9 },
      { x: 155, y: 72, wTop: 24, wBot: 13, run: 1050, dur: 19, delay: 4.2 },
      { x: 210, y: 87, wTop: 15, wBot: 8, run: 300, dur: 11, delay: 8 },
    ],
    drops: [{ x: 155, y: 72, r: 8, run: 1500, dur: 10, delay: 26 }],
  },
  {
    key: "tr",
    vh: 1700,
    stems: [
      { x: 239, y: 88, wTop: 30, wBot: 16, run: 1350, dur: 21, delay: 2.2 },
      { x: 130, y: 48, wTop: 18, wBot: 10, run: 360, dur: 12, delay: 5.5 },
    ],
    drops: [{ x: 101, y: 55, r: 12, run: 1400, dur: 8.5, delay: 3 }],
  },
  {
    key: "bl",
    vh: 340,
    stems: [],
    drops: [],
  },
  {
    key: "br",
    vh: 210,
    stems: [],
    drops: [],
  },
];

/*
 * The artwork's own ambers, anchored to each mass's artwork height rather
 * than its viewBox — a run darkens with distance travelled, but the masses
 * themselves all wear the same paint.
 */
function gradientStops(artHeight: number, viewHeight: number) {
  const at = (y: number) => Math.min(1, y / viewHeight);

  return [
    { offset: 0, color: "#d69733" },
    { offset: at(artHeight * 0.55), color: "#c8892a" },
    { offset: at(artHeight * 1.8), color: "#b47b22" },
    { offset: 1, color: "#996a1b" },
  ];
}

/*
 * A run, tapered: wide where it leaves the mass, flaring in over the first
 * stretch, then near-parallel and thin for the rest — the shape paint
 * actually makes when it pulls away from a body and drains.
 *
 * The path is authored at full length and revealed by scaling it vertically,
 * so its bottom edge is always the authored bottom edge: the width there
 * never changes, and the head's neck matches it at every moment of the fall.
 */
function stemPath(wTop: number, wBot: number, len: number) {
  const t = wTop / 2;
  const b = wBot / 2;
  const flare = Math.min(len * 0.2, 95);

  return [
    `M${-t} 0`,
    `C${-t} ${flare * 0.42} ${-b} ${flare * 0.5} ${-b} ${flare}`,
    `L${-b} ${len}`,
    `L${b} ${len}`,
    `L${b} ${flare}`,
    `C${b} ${flare * 0.5} ${t} ${flare * 0.42} ${t} 0`,
    "Z",
  ].join("");
}

/*
 * The head: a hanging drop. A narrow neck the width of the run it leads,
 * swelling into a round belly — heavier than the thread above it, which is
 * what makes paint read as falling rather than drawn.
 */
function headPath(neck: number, r: number) {
  const n = neck / 2;

  return [
    `M${-n} -3`,
    `C${-n} ${r * 0.55} ${-r} ${r * 0.62} ${-r} ${r * 1.2}`,
    `A${r} ${r} 0 0 0 ${r} ${r * 1.2}`,
    `C${r} ${r * 0.62} ${n} ${r * 0.55} ${n} -3`,
    "Z",
  ].join("");
}

function stemStyle(stem: Stem) {
  return {
    "--dur": `${stem.dur}s`,
    "--delay": `${stem.delay}s`,
  } as React.CSSProperties;
}

function headStyle(stem: Stem) {
  return {
    "--run": `${stem.run}px`,
    "--dur": `${stem.dur}s`,
    "--delay": `${stem.delay}s`,
  } as React.CSSProperties;
}

function dropStyle(drop: Drop) {
  return {
    "--run": `${drop.run}px`,
    "--dur": `${drop.dur}s`,
    "--delay": `${drop.delay}s`,
  } as React.CSSProperties;
}

function LiquidMass({ mass }: { mass: Mass }) {
  const shape = PAINT_SHAPES[mass.key];
  const gooId = `ss-goo-${mass.key}`;
  const bodyId = `ss-body-${mass.key}`;
  const stemId = `ss-stem-${mass.key}`;
  const headId = `ss-head-${mass.key}`;

  return (
    <div className={`ss-paint ss-paint-${mass.key}`}>
      <svg
        aria-hidden="true"
        fill="none"
        viewBox={`0 0 ${shape.w} ${mass.vh}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/*
           * Goo, lit. Clipped to the artwork plus a neck window below it:
           * blur + lighting over the whole run height is a 5fps mistake.
           */}
          <filter
            filterUnits="userSpaceOnUse"
            height={shape.h + 108}
            id={gooId}
            width={shape.w + 32}
            x={-16}
            y={-16}
          >
            <feGaussianBlur in="SourceGraphic" result="soft" stdDeviation="5" />
            <feColorMatrix
              in="soft"
              result="goo"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 24 -10"
            />
            <feSpecularLighting
              in="soft"
              lightingColor="#ffe2a6"
              result="spec"
              specularConstant="0.7"
              specularExponent="13"
              surfaceScale="5"
            >
              <feDistantLight azimuth="235" elevation="26" />
            </feSpecularLighting>
            <feComposite in="spec" in2="goo" operator="in" result="rim" />
            <feMerge>
              <feMergeNode in="goo" />
              <feMergeNode in="rim" />
            </feMerge>
          </filter>

          <linearGradient
            gradientUnits="userSpaceOnUse"
            id={bodyId}
            x1="0"
            x2="0"
            y1="0"
            y2={mass.vh}
          >
            {gradientStops(shape.h, mass.vh).map((stop) => (
              <stop
                key={stop.offset}
                offset={stop.offset}
                stopColor={stop.color}
              />
            ))}
          </linearGradient>

          {/* A run is a lit cylinder: a dark edge, a hard catchlight where
              the light lands, then a long fall to a darker edge. */}
          <linearGradient id={stemId} x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="#5a3a0c" />
            <stop offset="0.12" stopColor="#c98b2b" />
            <stop offset="0.2" stopColor="#ffe3a8" />
            <stop offset="0.33" stopColor="#cc8b29" />
            <stop offset="0.62" stopColor="#b0771f" />
            <stop offset="0.86" stopColor="#7d5211" />
            <stop offset="1" stopColor="#4a3007" />
          </linearGradient>

          <radialGradient cx="0.34" cy="0.3" id={headId} r="0.78">
            <stop offset="0" stopColor="#ffd88f" />
            <stop offset="0.45" stopColor="#cc8b29" />
            <stop offset="1" stopColor="#6d4810" />
          </radialGradient>
        </defs>

        {/* Layer 1 — the runs. Plain, but carrying their own depth: a
            lit-cylinder ramp across the stem, a radial on the belly, and a
            specular catchlight where the light lands. */}
        <g>
          {mass.stems.map((stem) => (
            <g
              key={`run-${stem.x}-${stem.y}`}
              transform={`translate(${stem.x} ${stem.y})`}
            >
              <path
                className="ss-lq-stem"
                d={stemPath(stem.wTop, stem.wBot, stem.run)}
                fill={`url(#${stemId})`}
                style={stemStyle(stem)}
              />
              <g className="ss-lq-head" style={headStyle(stem)}>
                <path
                  d={headPath(stem.wBot, stem.wBot * 0.95)}
                  fill={`url(#${headId})`}
                />
                <ellipse
                  className="ss-lq-gloss"
                  cx={stem.wBot * -0.3}
                  cy={stem.wBot * 0.82}
                  rx={stem.wBot * 0.26}
                  ry={stem.wBot * 0.4}
                />
              </g>
            </g>
          ))}

          {mass.drops.map((drop) => (
            <g
              className="ss-lq-drop"
              key={`fall-${drop.x}-${drop.y}`}
              style={dropStyle(drop)}
              transform={`translate(${drop.x} ${drop.y})`}
            >
              <path
                d={headPath(drop.r * 0.9, drop.r)}
                fill={`url(#${headId})`}
              />
              <ellipse
                className="ss-lq-gloss"
                cx={drop.r * -0.32}
                cy={drop.r * 0.85}
                rx={drop.r * 0.27}
                ry={drop.r * 0.42}
              />
            </g>
          ))}

          {/* Paint keeps gathering at each tip after its run has gone. */}
          {mass.stems.map((stem) => (
            <g
              key={`bead-${stem.x}-${stem.y}`}
              transform={`translate(${stem.x} ${stem.y})`}
            >
              <path
                className="ss-lq-bead"
                d={headPath(stem.wBot * 0.9, stem.wBot * 0.75)}
                fill={`url(#${headId})`}
                style={
                  {
                    "--dur": "3.4s",
                    "--delay": `${stem.delay + stem.dur}s`,
                  } as React.CSSProperties
                }
              />
            </g>
          ))}
        </g>

        {/* Layer 2 — the mass and the first stretch of every run, fused and
            lit by the goo filter. Painted over layer 1, so necks, beads and
            the hand-off all happen under liquid. */}
        <g fill={`url(#${bodyId})`} filter={`url(#${gooId})`}>
          {shape.paths.map((d) => (
            <path d={d} key={d.slice(0, 24)} />
          ))}

          {/* A static meniscus at every tip — the wet bulge the runs and
              drops emerge through, fused and lit by the goo. */}
          {[...mass.stems, ...mass.drops].map((tip) => {
            const rx = "wTop" in tip ? tip.wTop * 0.85 : tip.r * 1.3;

            return (
              <ellipse
                cx={tip.x}
                cy={tip.y}
                key={`meniscus-${tip.x}-${tip.y}`}
                rx={rx}
                ry={rx * 0.75}
              />
            );
          })}
        </g>
      </svg>
    </div>
  );
}

export function LiquidPaint() {
  return (
    <>
      {MASSES.map((mass) => (
        <LiquidMass key={mass.key} mass={mass} />
      ))}
    </>
  );
}
