import Image from "next/image";
import type { CSSProperties } from "react";
import { PAINT_SHAPES } from "@/lib/paint-shapes";

/*
 * The banner's paint, dripping.
 *
 * The four corner masses are the artwork and never move: the top two are
 * photographs cut straight out of the banner, the bottom two are vector
 * silhouettes traced from it. All that animates is a few runs of paint
 * descending out of lobes the artwork already points downward.
 *
 * The colour is the paint's own, measured rather than guessed — 58,080
 * interior pixels of the banner average #cb8a29 with a standard deviation
 * under 7, so the paint is FLAT. That single fact is why the runs carry no
 * gradient, no highlight and no gloss: an earlier version drew photoreal lit
 * liquid over this flat graphic art and the style collision read as clip-art
 * pasted on. A later version stretched whole corner masses instead, which
 * scales a wide shoulder at the same rate as a narrow lobe and smears a
 * deliberately drawn silhouette. A run does neither — it is the one thing
 * paint actually does, rendered in the artwork's own language.
 */

type Run = {
  /** Centre and top edge in the corner crop's own banner-pixel space. */
  x: number;
  y: number;
  /** Width where it leaves the lobe, and where it has thinned to. */
  wTop: number;
  wBot: number;
  len: number;
  dur: number;
  delay: number;
};

/*
 * Every run starts on a row measured off the artwork, a little above its
 * lobe's pointed tip, at that lobe's own width and centre on that row — so
 * it begins flush inside the paint and the join cannot show. Lengths stop
 * clear of both the wordmark and the bottom pools.
 */
const TL_RUNS: Run[] = [
  // The long left-edge lobe: span 16.2-46.8 on row 155.
  { x: 31.5, y: 155, wTop: 30, wBot: 22, len: 120, dur: 3.6, delay: 0.6 },
  // The middle lobe: span 100.2-124.5 on row 64. The mass has a third lobe
  // further in, but it sits directly above the wordmark at wide viewports —
  // a run there passes behind the letters and shows as a severed sliver in
  // the S's aperture, so it stays dry.
  { x: 112.4, y: 64, wTop: 24, wBot: 18, len: 100, dur: 4.4, delay: 1.6 },
];

const TR_RUNS: Run[] = [
  // Span 6.0-55.2 on row 47, the lobe inboard of the artwork's own finger.
  { x: 30.6, y: 47, wTop: 49, wBot: 36, len: 200, dur: 4.9, delay: 1.1 },
];

/** The artwork's own colour, sampled off the banner. */
const PAINT = "#cb8a29";

/*
 * A run, tapered: it leaves at the lobe's width and necks in over the first
 * stretch, then runs near-parallel — the shape paint makes when it pulls
 * away from a body and drains.
 *
 * Authored at full length and revealed by scaling vertically, so the bottom
 * edge is always the authored bottom edge: that width never changes, and the
 * bead riding at the edge matches it at every frame of the fall.
 */
function runPath(wTop: number, wBot: number, len: number) {
  const t = wTop / 2;
  const b = wBot / 2;
  const neck = Math.min(len * 0.22, 46);

  return [
    `M${-t} 0`,
    `C${-t} ${neck * 0.45} ${-b} ${neck * 0.55} ${-b} ${neck}`,
    `L${-b} ${len}`,
    `L${b} ${len}`,
    `L${b} ${neck}`,
    `C${b} ${neck * 0.55} ${t} ${neck * 0.45} ${t} 0`,
    "Z",
  ].join("");
}

/*
 * The bead at the front: a neck the width of the run it leads, swelling to a
 * rounder belly. That extra weight is what reads as paint falling rather
 * than a line being drawn.
 */
function beadPath(neck: number, r: number) {
  const n = neck / 2;

  return [
    `M${-n} -2`,
    `C${-n} ${r * 0.5} ${-r} ${r * 0.6} ${-r} ${r * 1.15}`,
    `A${r} ${r} 0 0 0 ${r} ${r * 1.15}`,
    `C${r} ${r * 0.6} ${n} ${r * 0.5} ${n} -2`,
    "Z",
  ].join("");
}

function Runs({
  runs,
  width,
  height,
}: {
  runs: Run[];
  width: number;
  height: number;
}) {
  return (
    <svg
      aria-hidden="true"
      className="ss-paint-runs"
      fill="none"
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      xmlns="http://www.w3.org/2000/svg"
    >
      {runs.map((run) => {
        const timing = {
          "--dur": `${run.dur}s`,
          "--delay": `${run.delay}s`,
        } as CSSProperties;

        return (
          <g
            key={`${run.x}-${run.y}`}
            transform={`translate(${run.x} ${run.y})`}
          >
            <path
              className="ss-run"
              d={runPath(run.wTop, run.wBot, run.len)}
              fill={PAINT}
              style={timing}
            />
            <path
              className="ss-run-bead"
              d={beadPath(run.wBot, run.wBot * 0.62)}
              fill={PAINT}
              style={{ ...timing, "--len": `${run.len}px` } as CSSProperties}
            />
          </g>
        );
      })}
    </svg>
  );
}

export function LiquidPaint() {
  return (
    <>
      {/* Crop sizes are the corners' own banner-pixel footprints, so a unit
          in the runs' viewBox is a banner pixel at any rendered width. */}
      <div className="ss-paint ss-paint-tl">
        <Image
          alt=""
          height={688}
          priority
          src="/brand/paint-tl.png"
          unoptimized
          width={1100}
        />
        <Runs height={420} runs={TL_RUNS} width={275} />
      </div>

      <div className="ss-paint ss-paint-tr">
        <Image
          alt=""
          height={936}
          priority
          src="/brand/paint-tr.png"
          unoptimized
          width={880}
        />
        <Runs height={420} runs={TR_RUNS} width={220} />
      </div>

      {/* Paint cannot drip upward, so the bottom pools only catch the light
          the artwork already gave them. */}
      <div className="ss-paint ss-paint-bl">
        <svg aria-hidden="true" fill="none" viewBox="0 0 194 330">
          {PAINT_SHAPES.bl.paths.map((d, index) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: paths is a fixed authored array, never reordered or filtered
            <path d={d} fill={PAINT} key={index} />
          ))}
        </svg>
      </div>

      <div className="ss-paint ss-paint-br">
        <svg aria-hidden="true" fill="none" viewBox="0 0 241 117">
          {PAINT_SHAPES.br.paths.map((d, index) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: paths is a fixed authored array, never reordered or filtered
            <path d={d} fill={PAINT} key={index} />
          ))}
        </svg>
      </div>
    </>
  );
}
