"use client";

import {
  Fragment,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

/**
 * Paint running down the landing card: a shallow bank across the top and four
 * drips hanging off it.
 *
 * Four is the whole design, not a reduction of a busier one. A wall of drips
 * reads as pattern, and pattern has to be cheap, which means every drip gets
 * the same approximate treatment and none of them survives being looked at. A
 * handful can each be modelled properly instead.
 *
 * Each drip is shaded as what it is — a wet cylinder ending in a bead:
 *
 *  - A gradient across its own width, keyed to that width in user space
 *    rather than to a bounding box, so the highlight lands where it belongs
 *    on a drip of that gauge. Dark at the near edge, a narrow specular streak
 *    a fifth of the way in, falling away through the body colour to a core
 *    shadow, and then lifting again at the far edge. That last lift is the
 *    detail that reads as round: a real cylinder catches bounced light on the
 *    edge turning away from you, and without it any amount of gradient still
 *    looks like a flat ribbon.
 *  - A vertical wash over the top, so the paint deepens as it runs away from
 *    the light rather than staying one value down its whole length.
 *  - Two soft radial passes on the bead, a catchlight up-left and an
 *    occlusion down-right. Both fade to nothing at their edges, so they sit
 *    on the shading underneath without a seam.
 *
 * All of it is gradients on static geometry. There is no filter anywhere in
 * here, which is the other half of the point: an feSpecularLighting pass over
 * the card cost about forty frames a second, because a filter re-runs over
 * every pixel of its region on every frame the reveal moves. A hand-placed
 * gradient is both free and more precise than a lighting model working off a
 * blurred alpha channel.
 *
 * The bank's lower edge is one authored curve rather than a row of fused
 * blobs, for the same reason: at this count it can be drawn to sag where the
 * drips hang and lift between them, which is what the pour actually does.
 */

/** Circle-to-bezier constant, for the round parts of a bead. */
const K = 0.5523;

/** How far above the card the artwork starts, so no seam shows at the top. */
const TOP_PAD = 120;

/** Reference width the hand-set gauges below are drawn for. */
const REF_W = 1440;

/**
 * The tonal ramp down the bank's rolled edge, as a fraction of how deep the
 * roll is and the colour at that depth. Bottom of the list is the very lip,
 * turning under and away from the light; the top eases back into the body.
 */
const LIP: { at: number; fill: string }[] = [
  { at: 1, fill: "#a96700" },
  { at: 0.91, fill: "#c67c00" },
  { at: 0.82, fill: "#e59a00" },
  { at: 0.71, fill: "#ffbe52" },
  { at: 0.6, fill: "#ffcd6d" },
  { at: 0.48, fill: "#ffc147" },
  { at: 0.36, fill: "#fdb223" },
  { at: 0.24, fill: "#f8a80e" },
  { at: 0.12, fill: "#f5a507" },
];

/** How deep that roll is, in reference pixels. */
const LIP_DEPTH = 17;

/** The bank has to land before a drip's window can start uncovering it. */
const DRIP_START = 1.05;

type Drip = {
  /** Position across the card, 0..1. */
  xf: number;
  /** Half-width of the column, in reference pixels. */
  half: number;
  /** Bead radius as a multiple of the column half-width. */
  beadK: number;
  /** Where the bead bottoms out, as a fraction of card height. */
  endf: number;
  /** How deep the bank sags over this drip, as a fraction of card height. */
  sagf: number;
  /** Sideways drift of the tip, in reference pixels. */
  lean: number;
  delay: number;
  dur: number;
};

/**
 * Set by hand. Four positions are few enough to compose rather than scatter:
 * two outside the wordmark, two inside it, none on the centre line, and the
 * heaviest of them off-centre so the card does not read as symmetrical. The
 * gauges are deliberately far apart — a fine drip beside a heavy one is what
 * gives the pour any sense of scale.
 */
const DRIPS: Drip[] = [
  {
    xf: 0.115,
    half: 13,
    beadK: 2.05,
    endf: 0.36,
    sagf: 0.15,
    lean: 5,
    delay: 0,
    dur: 3.4,
  },
  {
    xf: 0.335,
    half: 9,
    beadK: 2.4,
    endf: 0.76,
    sagf: 0.132,
    lean: -4,
    delay: 0.55,
    dur: 4.4,
  },
  {
    xf: 0.638,
    half: 17,
    beadK: 1.95,
    endf: 1.07,
    sagf: 0.164,
    lean: 7,
    delay: 0.24,
    dur: 5.2,
  },
  {
    xf: 0.876,
    half: 10,
    beadK: 2.3,
    endf: 0.82,
    sagf: 0.141,
    lean: -6,
    delay: 0.86,
    dur: 4.7,
  },
];

/**
 * The bank's lower edge, as depths at positions across the card. The drips'
 * own sag values are spliced in at their x, so the edge dips to meet each one
 * instead of a drip appearing to hang off a straight run of paint.
 */
const RIDGE: [number, number][] = [
  [-0.05, 0.078],
  [0.03, 0.062],
  [0.22, 0.07],
  [0.45, 0.058],
  [0.545, 0.093],
  [0.74, 0.066],
  [0.965, 0.083],
  [1.05, 0.071],
];

/**
 * Gauges are hand-set against a 1440-wide card. Scaling them straight off the
 * viewport leaves them spindly on a phone, so the range is squeezed rather
 * than mapped.
 */
function gaugeScale(width: number) {
  return Math.min(1.12, Math.max(0.6, 0.4 + (width / REF_W) * 0.62));
}

/**
 * Catmull-Rom through the given points, as cubics. An authored curve through
 * placed nodes, rather than an arc per segment: the tangents carry across the
 * joins, so the edge has no corners in it anywhere.
 */
function throughPoints(points: [number, number][]) {
  let d = `M ${points[0][0]} ${points[0][1]}`;
  for (let i = 0; i < points.length - 1; i += 1) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    d += ` C ${p1[0] + (p2[0] - p0[0]) / 6} ${p1[1] + (p2[1] - p0[1]) / 6}`;
    d += ` ${p2[0] - (p3[0] - p1[0]) / 6} ${p2[1] - (p3[1] - p1[1]) / 6}`;
    d += ` ${p2[0]} ${p2[1]}`;
  }
  return d;
}

/**
 * A drip, whole, from the top edge down to the bottom of its bead: funnel,
 * column, bead. One path — split into pieces they meet at a join, and a join
 * between two differently shaded shapes always finds a way to show itself.
 *
 * The funnel narrows over a sweep of about twice the flare and the column
 * then holds that width the whole way down. Tying the sweep to the flare
 * rather than to where the column ends is what keeps it a funnel: stretch the
 * taper over the drip's whole length and it reads as an icicle.
 */
function dripPath(
  x: number,
  flare: number,
  half: number,
  beadR: number,
  end: number,
  lean: number,
  close: number,
) {
  const top = -TOP_PAD;
  const h = close - top;
  const tipX = x + lean;
  const cy = end - beadR;
  const drop = cy - close;
  // Shoulder of the bead, held clear of the column so a short drip cannot
  // fold back through itself.
  const shoulder = Math.min(beadR * 1.3, Math.max(8, drop * 0.5));
  const join = beadR * 0.52;
  const neck = cy - shoulder;

  return [
    `M ${x - flare} ${top}`,
    `C ${x - flare} ${top + h * 0.4} ${x - half * 2.6} ${top + h * 0.78} ${x - half} ${close}`,
    `C ${x - half} ${close + drop * 0.5} ${tipX - half} ${neck - drop * 0.4} ${tipX - half} ${neck}`,
    `C ${tipX - join} ${cy - shoulder * 0.28} ${tipX - beadR} ${cy - beadR * 0.58} ${tipX - beadR} ${cy}`,
    `C ${tipX - beadR} ${cy + beadR * K} ${tipX - beadR * K} ${end} ${tipX} ${end}`,
    `C ${tipX + beadR * K} ${end} ${tipX + beadR} ${cy + beadR * K} ${tipX + beadR} ${cy}`,
    `C ${tipX + beadR} ${cy - beadR * 0.58} ${tipX + join} ${cy - shoulder * 0.28} ${tipX + half} ${neck}`,
    `C ${tipX + half} ${neck - drop * 0.4} ${x + half} ${close + drop * 0.5} ${x + half} ${close}`,
    `C ${x + half * 2.6} ${top + h * 0.78} ${x + flare} ${top + h * 0.4} ${x + flare} ${top}`,
    "Z",
  ].join(" ");
}

export function PaintPour() {
  const frameRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: REF_W, height: 900 });

  useLayoutEffect(() => {
    const node = frameRef.current;
    if (!node) {
      return;
    }

    const observer = new ResizeObserver(([entry]) => {
      const box = entry.contentRect;
      if (box.width > 0 && box.height > 0) {
        setSize({ width: box.width, height: box.height });
      }
    });

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const { width, height } = size;

  const geometry = useMemo(() => {
    const scale = gaugeScale(width);
    // Where the bank's reveal stops. Every funnel closes above this, so
    // nothing hangs below the front when it lands — otherwise all four drips
    // would appear at once, cut off level with each other.
    const mass = 0.235 * height;
    // Two clip regions that only touch antialias to about half coverage each
    // along the shared edge, and half over half composites to three quarters,
    // not one, which shows as a hairline. Overlap them instead.
    const seam = mass - 10;

    const drips = DRIPS.map((drip) => {
      const x = drip.xf * width;
      const half = drip.half * scale;
      const beadR = half * drip.beadK;
      // A heavy bead needs room below the bank, or the column curve folds back
      // through it and the drip renders as a mushroom.
      const end = Math.max(drip.endf * height, mass + beadR * 2 + 30);
      // The funnel has to finish narrowing below the bank's edge over this
      // drip, or the whole of it is buried and the drip appears to start out
      // of a straight cut with no fillet at all. Derive the flare from that
      // rather than setting both by hand and hoping they agree.
      const close = Math.min(drip.sagf * height + 0.05 * height, mass - 6);
      const flare = ((close + TOP_PAD) / 2) * 1.04;

      return {
        drip,
        x,
        half,
        beadR,
        end,
        tipX: x + drip.lean * scale,
        beadY: end - beadR,
        path: dripPath(x, flare, half, beadR, end, drip.lean * scale, close),
        // Wide enough for the bead, and nowhere near wide enough to reach a
        // neighbour: at four drips they are a quarter of the card apart.
        window: beadR + 8,
        // The rounded end of a growing drip is this circle's arc, so it wants
        // to be about the column's own width. Sized to the bead it is far too
        // flat across a column this narrow and the tip cuts off square.
        tipR: half + 5,
        travel: Math.max(0, end - seam),
      };
    });

    // The bank's edge: the fixed profile with each drip's sag spliced in at
    // its own x, sorted back into order across the card.
    const nodes: [number, number][] = [
      ...RIDGE,
      ...DRIPS.map((d): [number, number] => [d.xf, d.sagf]),
    ]
      .sort((a, b) => a[0] - b[0])
      .map(([xf, yf]): [number, number] => [xf * width, yf * height]);

    const bank = [
      throughPoints(nodes),
      `L ${nodes[nodes.length - 1][0]} ${-TOP_PAD}`,
      `L ${nodes[0][0]} ${-TOP_PAD}`,
      "Z",
    ].join(" ");

    const lipDepth = -LIP_DEPTH * scale;

    return {
      mass,
      seam,
      drips,
      bank,
      lipDepth,
      lip: LIP.map((step) => ({ ...step, dy: lipDepth * (1 - step.at) })),
    };
  }, [width, height]);

  const id = useId();
  const bankId = `${id}-bank`;
  const washId = `${id}-wash`;
  const sheenId = `${id}-sheen`;
  const revealId = `${id}-reveal`;

  return (
    <div className="ss-pour" ref={frameRef}>
      <svg
        aria-hidden="true"
        preserveAspectRatio="none"
        viewBox={`0 0 ${width} ${height}`}
      >
        <defs>
          {/*
            The bank, lit from above. Anchored just above the card rather than
            to the top of the artwork: most of the artwork is off-screen, and
            a ramp spanning all of it puts only its flattest middle stretch in
            view, which is what leaves a bank looking like a poured rectangle
            of one colour.
          */}
          <linearGradient
            gradientUnits="userSpaceOnUse"
            id={bankId}
            x1="0"
            x2="0"
            y1={-0.07 * height}
            y2={geometry.mass}
          >
            <stop offset="0" stopColor="#ffd469" />
            <stop offset="0.3" stopColor="#fbab0a" />
            <stop offset="0.72" stopColor="#f4a406" />
            <stop offset="1" stopColor="#eda200" />
          </linearGradient>

          {/* A broad, soft lift across the bank, off-centre. A poured sheet
              is not one value edge to edge; without something this wide and
              this weak it reads as a filled rectangle. */}
          <linearGradient id={sheenId} x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="#fff0c8" stopOpacity="0" />
            <stop offset="0.26" stopColor="#fff0c8" stopOpacity="0.13" />
            <stop offset="0.52" stopColor="#ffe9b4" stopOpacity="0.05" />
            <stop offset="0.78" stopColor="#8a5400" stopOpacity="0.07" />
            <stop offset="1" stopColor="#7d4c00" stopOpacity="0.13" />
          </linearGradient>

          {/* Paint deepens as it runs away from the light. Laid over each drip
              as a second copy of the same path, so it needs no clipping and
              leaves no edge of its own. */}
          <linearGradient
            gradientUnits="userSpaceOnUse"
            id={washId}
            x1="0"
            x2="0"
            y1={geometry.mass}
            y2={height}
          >
            <stop offset="0" stopColor="#5a3200" stopOpacity="0" />
            <stop offset="1" stopColor="#4a2900" stopOpacity="0.22" />
          </linearGradient>

          {/* One cross-section ramp per drip, spanning that drip's own column
              in user space. Keyed to the gauge, so the streak sits a fifth of
              the way across whatever the width, and the far edge lifts back up
              where bounced light catches it. */}
          {geometry.drips.map((item, i) => (
            <linearGradient
              gradientUnits="userSpaceOnUse"
              // biome-ignore lint/suspicious/noArrayIndexKey: fixed, ordered constant
              key={i}
              id={`${id}-tube${i}`}
              x1={item.x - item.half}
              x2={item.x + item.half}
              y1="0"
              y2="0"
            >
              <stop offset="0" stopColor="#a06400" />
              <stop offset="0.08" stopColor="#d78a00" />
              <stop offset="0.18" stopColor="#f8c05a" />
              <stop offset="0.26" stopColor="#ffe3a4" />
              <stop offset="0.35" stopColor="#f9bd51" />
              <stop offset="0.48" stopColor="#f3a20a" />
              <stop offset="0.68" stopColor="#e79400" />
              <stop offset="0.86" stopColor="#bf7800" />
              <stop offset="1" stopColor="#9d6206" />
            </linearGradient>
          ))}

          {/*
            The bead, as a sphere rather than as the column's ramp run on past
            its edges. Keyed in user space to the bead itself, with the focus
            pulled up and left so the highlight sits where the light is, and
            with the last stop fading to nothing: outside the bead the whole
            gradient is transparent, so it leaves the column above it alone,
            and at the rim it dissolves into the column's own dark edge rather
            than ending on a line. The stops just inside the rim double as the
            occlusion where the neck meets the bead.

            Padding the column's ramp outwards instead gave a dark ball with a
            bright stripe down the middle, which is the giveaway of shading
            applied by width to something that is not a cylinder.
          */}
          {geometry.drips.map((item, i) => (
            <radialGradient
              cx={item.tipX}
              cy={item.beadY}
              fx={item.tipX - item.beadR * 0.34}
              fy={item.beadY - item.beadR * 0.36}
              gradientUnits="userSpaceOnUse"
              id={`${id}-bead${i}`}
              // biome-ignore lint/suspicious/noArrayIndexKey: fixed, ordered constant
              key={i}
              r={item.beadR}
            >
              <stop offset="0" stopColor="#fff3d4" />
              <stop offset="0.18" stopColor="#ffd071" />
              <stop offset="0.42" stopColor="#f7a913" />
              <stop offset="0.68" stopColor="#e39100" />
              <stop offset="0.9" stopColor="#b87200" />
              <stop offset="0.97" stopColor="#a06400" stopOpacity="0.85" />
              <stop offset="1" stopColor="#965d00" stopOpacity="0" />
            </radialGradient>
          ))}
        </defs>

        <clipPath id={revealId}>
          {/* The bank floods down from the top edge to where the funnels
              close. */}
          <rect
            className="ss-pour-mass"
            height={geometry.mass + TOP_PAD}
            width={width}
            x="0"
            y={-TOP_PAD}
          />

          {geometry.drips.map((item, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: fixed, ordered constant
            <Fragment key={i}>
              {/* Sized to this drip's own travel, not to the card: a window
                  tall enough to clear the bottom edge races past a short drip
                  in the first fifth of its duration, so it snaps into place
                  and then sits still. */}
              <rect
                className="ss-pour-run"
                height={item.travel + 10}
                style={
                  {
                    "--dur": `${item.drip.dur}s`,
                    "--delay": `${DRIP_START + item.drip.delay}s`,
                  } as React.CSSProperties
                }
                width={item.window * 2}
                x={item.x - item.window}
                y={geometry.seam}
              />
              {/* Rides the same front as the window, on the same timing, so
                  the growing end is this circle's arc and not a square cut. */}
              <circle
                className="ss-pour-tip"
                cx={item.x}
                cy={geometry.seam}
                r={item.tipR}
                style={
                  {
                    "--dur": `${item.drip.dur}s`,
                    "--delay": `${DRIP_START + item.drip.delay}s`,
                    "--travel": `${item.travel}px`,
                  } as React.CSSProperties
                }
              />
            </Fragment>
          ))}
        </clipPath>

        {/* Clip outside, artwork inside: nothing here ever changes, so it
            rasterises once and each frame only moves the clip. */}
        <g clipPath={`url(#${revealId})`}>
          {geometry.drips.map((item, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: fixed, ordered constant
            <Fragment key={i}>
              <path d={item.path} fill={`url(#${id}-tube${i})`} />
              <path d={item.path} fill={`url(#${id}-bead${i})`} />
              <path d={item.path} fill={`url(#${washId})`} />
            </Fragment>
          ))}

          {/*
            The bank, over the drips, so each one comes out from under its
            edge rather than butting into it.

            The edge is rolled rather than cut. A vertical gradient cannot do
            it — the edge is a curve and the ramp would run straight across it
            — so the same path is laid down repeatedly, each copy a little
            higher than the last, in a tonal ramp. What shows is a band a few
            pixels deep at every point along the curve, dark where the surface
            turns under, bright where the roll faces the light, easing back
            into the body above. Two or three copies read as an outline drawn
            around the shape; it takes enough of them for the steps to fall
            below a pixel or two before it reads as a rounded edge.
          */}
          {geometry.lip.map((step) => (
            <g key={step.fill} transform={`translate(0 ${step.dy})`}>
              <path d={geometry.bank} fill={step.fill} />
            </g>
          ))}
          <g transform={`translate(0 ${geometry.lipDepth})`}>
            <path d={geometry.bank} fill={`url(#${bankId})`} />
            <path d={geometry.bank} fill={`url(#${sheenId})`} />
          </g>
        </g>
      </svg>
    </div>
  );
}
