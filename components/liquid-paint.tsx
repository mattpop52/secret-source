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
  w: number;
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
    stems: [{ x: 27, y: 167, w: 17, run: 1450, dur: 17, delay: 0.4 }],
    drops: [{ x: 229, y: 105, r: 10, run: 1500, dur: 9, delay: 5 }],
  },
  {
    key: "tc",
    vh: 1900,
    stems: [
      // The long one — straight down behind the wordmark and the button.
      { x: 39, y: 105, w: 13, run: 1650, dur: 15, delay: 0.9 },
      { x: 155, y: 72, w: 14, run: 1050, dur: 19, delay: 4.2 },
    ],
    drops: [{ x: 155, y: 72, r: 8, run: 1500, dur: 10, delay: 26 }],
  },
  {
    key: "tr",
    vh: 1700,
    stems: [{ x: 239, y: 88, w: 22, run: 1350, dur: 21, delay: 2.2 }],
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

function stemStyle(stem: Stem) {
  return {
    "--dur": `${stem.dur}s`,
    "--delay": `${stem.delay}s`,
  } as React.CSSProperties;
}

function headStyle(stem: Stem) {
  return {
    "--run": `${stem.run - stem.w * 0.4}px`,
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

          {/* A run is a lit cylinder: bright along the light's side. */}
          <linearGradient id={stemId} x1="0" x2="1" y1="0" y2="0">
            <stop offset="0.12" stopColor="#dda039" />
            <stop offset="0.5" stopColor="#c8892a" />
            <stop offset="1" stopColor="#9c6c1c" />
          </linearGradient>

          <radialGradient cx="0.35" cy="0.3" id={headId} r="0.8">
            <stop offset="0" stopColor="#e3aa46" />
            <stop offset="0.55" stopColor="#c8892a" />
            <stop offset="1" stopColor="#96671a" />
          </radialGradient>
        </defs>

        {/* Layer 1 — the runs, plain, depth baked into their gradients. */}
        <g>
          {mass.stems.map((stem) => (
            <g key={`run-${stem.x}-${stem.y}`}>
              <rect
                className="ss-lq-stem"
                fill={`url(#${stemId})`}
                height={stem.run + 18}
                rx={stem.w / 2}
                style={stemStyle(stem)}
                width={stem.w}
                x={stem.x - stem.w / 2}
                y={stem.y - 18}
              />
              <circle
                className="ss-lq-head"
                cx={stem.x}
                cy={stem.y}
                fill={`url(#${headId})`}
                r={stem.w * 0.72}
                style={headStyle(stem)}
              />
            </g>
          ))}
          {mass.drops.map((drop) => (
            <circle
              className="ss-lq-drop"
              cx={drop.x}
              cy={drop.y}
              fill={`url(#${headId})`}
              key={`fall-${drop.x}-${drop.y}`}
              r={drop.r}
              style={dropStyle(drop)}
            />
          ))}
          {/* Paint keeps gathering at each tip after its run has gone. */}
          {mass.stems.map((stem) => (
            <circle
              className="ss-lq-bead"
              cx={stem.x}
              cy={stem.y}
              fill={`url(#${headId})`}
              key={`bead-${stem.x}-${stem.y}`}
              r={stem.w * 0.8}
              style={
                {
                  "--dur": "3.4s",
                  "--delay": `${stem.delay + stem.dur}s`,
                } as React.CSSProperties
              }
            />
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
            const rx = "w" in tip ? tip.w * 1.05 : tip.r * 1.3;

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
