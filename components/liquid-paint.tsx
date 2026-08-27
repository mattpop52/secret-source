import type { CSSProperties } from "react";
import { PAINT_SHAPES } from "@/lib/paint-shapes";

/*
 * The banner's own paint, set moving.
 *
 * Each corner mass is the silhouette traced from the artwork
 * (lib/paint-shapes.ts), drawn exactly where the banner has it — so at rest
 * the card IS the banner. The motion is only ever that paint deforming:
 * runs stretch out of lobes the artwork already points downward, heads lead
 * them, drops gather at tips and fall. Nothing is overlaid and nothing
 * appears from nowhere; every moving piece shares the mass's own gradient
 * and emerges from behind its silhouette.
 *
 * Two layers per mass, and every mass's runs sit beneath every mass's body,
 * so a run that reaches another corner's paint disappears into it — the
 * long left-edge run from the top-left mass drains into the bottom-left
 * pool, which is the reference clip's "paint merging with paint".
 *
 * An earlier version fused everything through a goo filter with specular
 * lighting. That measured 5fps. All of the depth here is baked instead:
 * one shared gradient per mass in user space (overlapping shapes paint
 * identically, so unions are seamless with no filter), a lit-cylinder ramp
 * across each stem, radials on the heads and drops, and a couple of static
 * sheen pools on the big bodies. Only transforms animate.
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
  /** "run" accelerates clear off-screen (the measured reference profile);
      "settle" keeps the acceleration's character but lands softly, for
      drips whose ends stay in frame — the clip never shows one stopping,
      because it floods instead, so the landing is ours. */
  ease: "run" | "settle";
};

type Drop = {
  x: number;
  y: number;
  r: number;
  run: number;
  dur: number;
  delay: number;
};

/* Measured off the reference: on detach the parent tip snaps back up
   0.08-0.2 of the frame over ~0.3s, then regrows as the next drop gathers.
   The recoil animation on a head is timed to its drop's cycle. */

/** A static gloss pool on a mass body — the soft sheen of wet paint. */
type Sheen = {
  x: number;
  y: number;
  rx: number;
  ry: number;
  rotate: number;
};

type Mass = {
  key: "tl" | "tr" | "bl" | "br";
  /** Total viewBox height — room below the artwork for the runs. */
  vh: number;
  stems: Stem[];
  drops: Drop[];
  sheens: Sheen[];
};

/*
 * Every stem leaves from a lobe the artwork already points downward — the
 * tips were measured off the silhouettes — so each run reads as that lobe
 * elongating, not as new paint. Durations and easing follow the reference
 * clip: tongues creep rather than pour, neighbours move at unequal speeds,
 * and the longest never quite finish while anyone is watching.
 */
const MASSES: Mass[] = [
  {
    key: "tl",
    vh: 1750,
    stems: [
      // The long left tongue — the banner's own lowest tip — runs down the
      // edge and drains into the bottom-left pool (bl is solid to the page
      // edge across its first columns, so it swallows this one). This is
      // the reference clip's paint merging with paint.
      {
        x: 35,
        y: 168,
        wTop: 24,
        wBot: 13,
        run: 1450,
        dur: 11,
        delay: 0.4,
        ease: "run",
      },
      // The two other lobes the artwork already points downward.
      {
        x: 110,
        y: 72,
        wTop: 22,
        wBot: 12,
        run: 240,
        dur: 12,
        delay: 1.6,
        ease: "settle",
      },
      {
        x: 229,
        y: 106,
        wTop: 20,
        wBot: 11,
        run: 430,
        dur: 14,
        delay: 2.6,
        ease: "settle",
      },
    ],
    // A drop gathers at the finished run's tip and detaches, over and over
    // — in the clip, drops leave the longer tongues' ends, not the body.
    drops: [{ x: 110, y: 334, r: 8, run: 1300, dur: 6.5, delay: 15 }],
    sheens: [
      { x: 136, y: 26, rx: 60, ry: 13, rotate: -5 },
      { x: 36, y: 104, rx: 10, ry: 30, rotate: 6 },
    ],
  },
  {
    key: "tr",
    vh: 1700,
    stems: [
      // The satellite blob on the right edge stretches down the edge and
      // into the bottom-right hook, mirroring the left side's long run.
      {
        x: 191,
        y: 230,
        wTop: 24,
        wBot: 13,
        run: 1250,
        dur: 13,
        delay: 0.9,
        ease: "run",
      },
      // The lobe that already hangs off the mass's lower edge.
      {
        x: 157,
        y: 91,
        wTop: 26,
        wBot: 14,
        run: 520,
        dur: 12,
        delay: 1.8,
        ease: "settle",
      },
      // A shallow rounded lobe: a new drip forming slowly, late.
      {
        x: 17,
        y: 57,
        wTop: 24,
        wBot: 12,
        run: 360,
        dur: 16,
        delay: 3.8,
        ease: "settle",
      },
    ],
    drops: [{ x: 157, y: 633, r: 9, run: 950, dur: 7, delay: 15.5 }],
    sheens: [{ x: 70, y: 20, rx: 48, ry: 11, rotate: 3 }],
  },
  {
    // The bottom pools cannot drip upward, so they only settle and breathe
    // (the wrapper's ooze) — and catch the runs that reach them.
    key: "bl",
    vh: 330,
    stems: [],
    drops: [],
    sheens: [{ x: 30, y: 190, rx: 13, ry: 40, rotate: -4 }],
  },
  {
    key: "br",
    vh: 117,
    stems: [],
    drops: [],
    sheens: [{ x: 150, y: 95, rx: 50, ry: 10, rotate: -3 }],
  },
];

const EASES = {
  run: "cubic-bezier(0.5, 0.25, 0.9, 0.8)",
  settle: "cubic-bezier(0.5, 0.22, 0.55, 0.92)",
};

/*
 * The artwork's own ambers (sampled off the banner: the paint sits at
 * #cc8a29 with barely any variation), anchored to each mass's artwork
 * height rather than its viewBox — a run darkens with distance travelled,
 * but the masses themselves all wear the same paint.
 */
function gradientStops(artHeight: number, viewHeight: number) {
  const at = (y: number) => Math.min(1, y / viewHeight);

  // On a mass whose artwork fills its whole viewBox (bl, br: artHeight ===
  // viewHeight), the deeper computed stop clamps to the same point as the
  // fixed final stop below — drop it before it collides with that stop,
  // rather than rendering (and keying) two stops at an identical offset.
  const ramp = [
    { offset: at(artHeight * 0.55), color: "#c8892a" },
    { offset: at(artHeight * 1.8), color: "#b47b22" },
  ].filter((stop) => stop.offset < 1);

  return [
    { offset: 0, color: "#d69733" },
    ...ramp,
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
    "--ease": EASES[stem.ease],
  } as CSSProperties;
}

function headStyle(stem: Stem, drop?: Drop) {
  const style = {
    "--run": `${stem.run}px`,
    "--dur": `${stem.dur}s`,
    "--delay": `${stem.delay}s`,
    "--ease": EASES[stem.ease],
  } as Record<string, string>;

  if (drop) {
    style["--rperiod"] = `${drop.dur}s`;
    style["--rstart"] = `${drop.delay}s`;
  }

  return style as CSSProperties;
}

function dropStyle(drop: Drop) {
  return {
    "--run": `${drop.run}px`,
    "--dur": `${drop.dur}s`,
    "--delay": `${drop.delay}s`,
  } as CSSProperties;
}

function LiquidMass({ mass }: { mass: Mass }) {
  const shape = PAINT_SHAPES[mass.key];
  const bodyId = `ss-body-${mass.key}`;
  const stemId = `ss-stem-${mass.key}`;
  const headId = `ss-head-${mass.key}`;
  const sheenId = `ss-sheen-${mass.key}`;
  const viewBox = `0 0 ${shape.w} ${mass.vh}`;

  return (
    <>
      {/*
       * Layer one: the runs. Every mass's runs sit beneath every mass's
       * body, so a run that reaches a corner patch disappears into it
       * rather than crossing the frame the patches draw around the page.
       * Depth is baked in: a lit-cylinder ramp across the stem, a radial on
       * the belly, and a catchlight where the light lands.
       */}
      <div className={`ss-paint ss-paint-${mass.key}`}>
        <svg
          aria-hidden="true"
          fill="none"
          viewBox={viewBox}
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
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

          {mass.stems.map((stem) => {
            const drop = mass.drops.find((d) => d.x === stem.x);

            return (
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
                <g
                  className={
                    drop ? "ss-lq-head ss-lq-head-recoil" : "ss-lq-head"
                  }
                  style={headStyle(stem, drop)}
                >
                  {/* Gathers from nothing as its stem lets go, so the very
                      first frame is the banner exactly — no bulge below a
                      lobe the artwork does not have. Its own group, so the
                      swell never distorts the measured fall curve. */}
                  <g className="ss-lq-gather" style={stemStyle(stem)}>
                    {/* Neck a touch wider than the stem's end, so the
                        stem's flat cut is always inside it — no shelf shows
                        at the junction while the head is still gathering. */}
                    <path
                      d={headPath(stem.wBot * 1.15, stem.wBot * 0.95)}
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
              </g>
            );
          })}

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
                  } as CSSProperties
                }
              />
            </g>
          ))}
        </svg>
      </div>

      {/*
       * Layer two: the body — the silhouette and a meniscus at every tip.
       * All of it fills from the one gradient in user space, so the
       * overlapping shapes paint as a single unbroken body with no filter
       * doing the fusing. Painted above all runs, so the corner patches
       * stay an unbroken border around the page.
       */}
      <div className={`ss-paint ss-paint-body ss-paint-${mass.key}`}>
        <svg
          aria-hidden="true"
          fill="none"
          viewBox={viewBox}
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
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

            {/* The sheen a wet surface carries: near-white warmed to the
                paint, fading to nothing well inside the ellipse. */}
            <radialGradient cx="0.5" cy="0.5" id={sheenId} r="0.5">
              <stop offset="0" stopColor="#ffe9bf" stopOpacity="0.55" />
              <stop offset="0.55" stopColor="#ffe9bf" stopOpacity="0.18" />
              <stop offset="1" stopColor="#ffe9bf" stopOpacity="0" />
            </radialGradient>
          </defs>

          <g fill={`url(#${bodyId})`}>
            {shape.paths.map((d, index) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: paths is a fixed authored array, never reordered or filtered
              <path d={d} key={index} />
            ))}

            {/* A static meniscus at every tip — the wet bulge the runs and
                drops emerge through. Same fill, same user space: it unions
                into the silhouette without a seam. A drop can legitimately
                share its stem's exact tip (the bead hanging off that run's
                own end), so the two lists' indices — not their coordinates —
                keep every key unique. */}
            {[...mass.stems, ...mass.drops].map((tip, index) => {
              const rx = "wTop" in tip ? tip.wTop * 0.85 : tip.r * 1.3;

              return (
                <ellipse
                  cx={tip.x}
                  cy={tip.y}
                  // biome-ignore lint/suspicious/noArrayIndexKey: stems/drops are fixed authored arrays, never reordered or filtered
                  key={index}
                  rx={rx}
                  ry={rx * 0.75}
                />
              );
            })}
          </g>

          {/* The gloss that sells the body as wet — soft pools of light,
              not the artwork's flat fill changing colour. */}
          {mass.sheens.map((sheen) => (
            <ellipse
              cx={sheen.x}
              cy={sheen.y}
              fill={`url(#${sheenId})`}
              key={`sheen-${sheen.x}-${sheen.y}`}
              rx={sheen.rx}
              ry={sheen.ry}
              transform={`rotate(${sheen.rotate} ${sheen.x} ${sheen.y})`}
            />
          ))}
        </svg>
      </div>
    </>
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
