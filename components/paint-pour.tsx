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
 * Paint running down the landing card: a shallow bank across the top, four
 * drips off it, and paint gathered in the two bottom corners.
 *
 * Four drips is the whole design, not a reduction of a busier one. A wall of
 * them reads as pattern, and pattern has to be cheap — every drip gets the
 * same approximate treatment and none survives being looked at. A handful can
 * each be modelled properly instead.
 *
 * Nothing here is a separate object stuck onto anything else. The bank's own
 * edge necks down into a throat over each drip; the column carries on up well
 * inside the bank and is drawn over it, so the bank's rolled edge is
 * interrupted by the drip the way a real edge is where paint runs off it. Then
 * a wash of the bank's own colour fades the column out across the overlap, so
 * it has no top edge to see and the shading changes hands over a fade rather
 * than on a line. Measured across that handover the two are within two values
 * of each other in every channel.
 *
 * Both halves of that matter. Under the bank instead of over it, the rolled
 * edge ran across in front of every column and each read as a pipe behind a
 * shelf. Carrying the flare on the drip instead of the bank meant one shape
 * had to be shaded both as a wide sheet and as a narrow column, which a single
 * ramp across its width cannot do.
 *
 * Shading is per-form, not per-shape:
 *
 *  - A column takes a gradient across its own width in user space, so the
 *    highlight lands where it belongs on that gauge, and the far edge lifts
 *    back up where bounced light catches it. That lift is what reads as round;
 *    without it any amount of gradient still looks like a flat ribbon.
 *  - A bead takes a radial of its own, focus pulled up and left, fading to
 *    nothing at the rim so it dissolves into the column's dark edge instead of
 *    ending on a line. Running the column's ramp on past its edges gives a
 *    dark ball with a bright stripe down the middle.
 *  - A rolled edge — the bank's lip, a pool's crest — is the same path laid
 *    down repeatedly in a tonal ramp, each copy offset a little further. A
 *    gradient cannot follow a curve; this can. Two or three copies read as an
 *    outline drawn around the shape, so it takes enough for the steps to fall
 *    below a pixel or two.
 *
 * There is no filter anywhere in here, which is the other half of the point: a
 * filter re-runs over every pixel of its region on every frame the reveal
 * moves, and an feSpecularLighting pass over the card cost about forty frames
 * a second. A hand-placed gradient is free and more precise than a lighting
 * model working off a blurred alpha channel.
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
  { at: 1, fill: "#2a1102" },
  { at: 0.93, fill: "#593115" },
  { at: 0.86, fill: "#84532e" },
  { at: 0.79, fill: "#a76e41" },
  { at: 0.71, fill: "#c28351" },
  { at: 0.64, fill: "#d7925d" },
  { at: 0.57, fill: "#e09a64" },
  { at: 0.5, fill: "#eaa36c" },
  { at: 0.43, fill: "#eda066" },
  { at: 0.36, fill: "#e59457" },
  { at: 0.29, fill: "#e29153" },
  { at: 0.21, fill: "#de8d4f" },
  { at: 0.14, fill: "#db8a4d" },
  { at: 0.07, fill: "#da894c" },
];

/**
 * How deep that roll is, in reference pixels. Thick: the paint reads as a
 * heavy pour, and the whole tonal run from the hot core to the shadow under
 * the lip has to fit inside it.
 */
const LIP_DEPTH = 30;

/**
 * How far below the bank's sag the throat over a drip necks down to, in
 * reference pixels. Deep enough that the neck is visibly a neck rather than a
 * notch in the edge, shallow enough to stay above where the bank's reveal
 * front stops.
 */
const THROAT_DROP = 34;

/**
 * The paint that has reached the floor, as depths across the card. One mass
 * rather than a wedge in each corner: the drips run into it, so it has to be
 * continuous or the heavy one lands on nothing. Mounded where it has gathered
 * against the sides, with a low rise under the heavy drip where that one is
 * still feeding it.
 */
const FLOOR: [number, number][] = [
  [-0.06, 0.9],
  [0.045, 0.845],
  [0.185, 0.883],
  [0.33, 0.936],
  [0.5, 0.907],
  [0.598, 0.931],
  [0.638, 0.902],
  [0.685, 0.929],
  [0.825, 0.864],
  [0.945, 0.84],
  [1.06, 0.888],
];

/** When the floor starts filling, in seconds. */
const FLOOR_DELAY = 1.9;

/**
 * The ramp down a pool's crest. The bank's edge turns under and away from the
 * light, so its ramp darkens at the very lip; a pool's faces up into it, so
 * this one is brightest right at the crest and deepens inward.
 */
const CREST: { at: number; fill: string }[] = [
  { at: 0, fill: "#753c17" },
  { at: 0.06, fill: "#a26339" },
  { at: 0.13, fill: "#c98654" },
  { at: 0.21, fill: "#e3a26f" },
  { at: 0.3, fill: "#f0b17c" },
  { at: 0.39, fill: "#eba36a" },
  { at: 0.49, fill: "#e0945a" },
  { at: 0.6, fill: "#d6874e" },
  { at: 0.72, fill: "#c67740" },
  { at: 0.85, fill: "#b16533" },
];

/** How deep that crest roll is, in reference pixels. */
const CREST_DEPTH = 22;

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
    half: 16,
    beadK: 2.0,
    endf: 0.36,
    sagf: 0.214,
    lean: 5,
    delay: 0,
    dur: 3.4,
  },
  {
    xf: 0.335,
    half: 11,
    beadK: 2.3,
    endf: 0.76,
    sagf: 0.203,
    lean: -4,
    delay: 0.55,
    dur: 4.4,
  },
  {
    xf: 0.762,
    half: 8,
    beadK: 2.55,
    endf: 0.43,
    sagf: 0.19,
    lean: 3,
    delay: 1.35,
    dur: 3.1,
  },
  {
    xf: 0.638,
    half: 21,
    beadK: 1.9,
    endf: 1.07,
    sagf: 0.224,
    lean: 7,
    delay: 0.24,
    dur: 5.2,
  },
  {
    xf: 0.876,
    half: 13,
    beadK: 2.2,
    endf: 0.82,
    sagf: 0.209,
    lean: -6,
    delay: 0.86,
    dur: 4.7,
  },
];

/**
 * The bank's lower edge, as depths at the high points between the drips.
 *
 * Traced off the reference rather than guessed, and it runs the opposite way
 * to how it looks: the rounded shapes read as lobes hanging down, but the edge
 * is in fact highest midway between two drips and descends steadily into each
 * one. The paint is being pulled towards wherever it is running off. Built the
 * other way up — lobes hanging below the points beside each drip — the curve
 * has to climb back out of every cusp and comes out as a row of spikes.
 */
const RIDGE: [number, number][] = [
  [-0.07, 0.192],
  [0.015, 0.184],
  [0.225, 0.166],
  [0.425, 0.163],
  [0.5, 0.172],
  [0.775, 0.168],
  [0.945, 0.148],
  [1.07, 0.186],
];

/**
 * Gauges are hand-set against a 1440-wide card. Scaling them straight off the
 * viewport leaves them spindly on a phone, so the range is squeezed rather
 * than mapped.
 */
function gaugeScale(width: number) {
  return Math.min(1.12, Math.max(0.6, 0.4 + (width / REF_W) * 0.62));
}

/** How many samples the bank's and floor's edges are drawn through. */
const EDGE_SAMPLES = 84;

/** How far either side of a drip the bank is drawn down towards it, in width. */
const PULL_SPAN = 0.115;

/** Raised cosine: 1 at the centre, 0 at the edge, flat tangents at both. */
function bump(t: number) {
  return 0.5 * (1 + Math.cos(Math.PI * t));
}

/**
 * A depth profile read at any x, interpolated with the same raised cosine so
 * the run between two control points leaves and arrives flat instead of as a
 * straight line with a corner at each end.
 */
function profileAt(profile: [number, number][], xf: number) {
  if (xf <= profile[0][0]) {
    return profile[0][1];
  }
  for (let i = 0; i < profile.length - 1; i += 1) {
    const [x0, y0] = profile[i];
    const [x1, y1] = profile[i + 1];
    if (xf <= x1) {
      const t = (xf - x0) / (x1 - x0);
      return y0 + (y1 - y0) * (1 - bump(t));
    }
  }
  return profile[profile.length - 1][1];
}

function ridgeAt(xf: number) {
  return profileAt(RIDGE, xf);
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
 * A drip: column and bead, from inside the bank's throat down to the bottom of
 * the bead.
 *
 * The flare belongs to the bank, not to this. Carrying it here meant one shape
 * had to be shaded both as a wide sheet and as a narrow column, and a single
 * ramp across its width cannot do both: the flare came out as a flat wedge in
 * the ramp's end colour, with the bank's rolled edge stopping dead against it.
 * The bank necks down to this width instead, so its own shading and its rolled
 * edge follow the paint all the way into the throat, and what starts here is
 * already a column.
 */
function dripPath(
  x: number,
  half: number,
  beadR: number,
  end: number,
  lean: number,
  close: number,
) {
  const tipX = x + lean;
  const cy = end - beadR;
  const drop = cy - close;
  // Shoulder of the bead, held clear of the column so a short drip cannot
  // fold back through itself.
  const shoulder = Math.min(beadR * 1.3, Math.max(8, drop * 0.5));
  const join = beadR * 0.52;
  const neck = cy - shoulder;

  return [
    `M ${x - half} ${close}`,
    `C ${x - half} ${close + drop * 0.5} ${tipX - half} ${neck - drop * 0.4} ${tipX - half} ${neck}`,
    `C ${tipX - join} ${cy - shoulder * 0.28} ${tipX - beadR} ${cy - beadR * 0.58} ${tipX - beadR} ${cy}`,
    `C ${tipX - beadR} ${cy + beadR * K} ${tipX - beadR * K} ${end} ${tipX} ${end}`,
    `C ${tipX + beadR * K} ${end} ${tipX + beadR} ${cy + beadR * K} ${tipX + beadR} ${cy}`,
    `C ${tipX + beadR} ${cy - beadR * 0.58} ${tipX + join} ${cy - shoulder * 0.28} ${tipX + half} ${neck}`,
    `C ${tipX + half} ${neck - drop * 0.4} ${x + half} ${close + drop * 0.5} ${x + half} ${close}`,
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
    const mass = 0.285 * height;
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
      const sag = drip.sagf * height;
      // Bottom of the throat the bank necks down into. The column starts a
      // little above it so the two overlap rather than butt together.
      const throat = Math.min(sag + THROAT_DROP * scale, mass - 8);

      // The column carries on up well inside the bank and is drawn over it, so
      // the bank's rolled edge is interrupted by the drip rather than running
      // across in front of it. Where it overlaps, a wash of the bank's own
      // colour fades the column out, so nothing of its top edge shows.
      const blendTop = throat - 46 * scale;
      const blendEnd = throat - 10 * scale;

      return {
        drip,
        x,
        half,
        beadR,
        end,
        sag,
        throat,
        blendTop,
        blendEnd,
        throatHalf: half * 1.06,
        tipX: x + drip.lean * scale,
        beadY: end - beadR,
        path: dripPath(x, half, beadR, end, drip.lean * scale, blendTop),
        // Wide enough for the bead, and nowhere near wide enough to reach a
        // neighbour: at four drips they are a quarter of the card apart.
        window: beadR + 8,
        // The rounded end of a growing drip is this circle's arc. Sized to
        // the column alone it caps the column nicely but cuts the bead off
        // flat as the front passes through it; sized to the bead it is far too
        // shallow an arc across a column this narrow. Halfway serves both.
        tipR: half + (beadR - half) * 0.5 + 4,
        travel: Math.max(0, end - seam),
      };
    });

    // The bank's edge, sampled densely from a smooth profile rather than
    // authored as a handful of nodes. Sparse nodes leave dead-straight runs
    // between them and the edge comes out as a row of tents; sampling a
    // function and drawing through every sample keeps it curved everywhere.
    const edge: [number, number][] = [];
    for (let i = 0; i <= EDGE_SAMPLES; i += 1) {
      const xf = -0.06 + (1.12 * i) / EDGE_SAMPLES;
      let yf = ridgeAt(xf);

      for (const item of drips) {
        const dx = Math.abs(xf - item.drip.xf);
        // The broad pull: paint drawn towards wherever it is running off.
        if (dx < PULL_SPAN) {
          yf += (item.drip.sagf - ridgeAt(item.drip.xf)) * bump(dx / PULL_SPAN);
        }
        // The cusp itself, narrow, on top of that pull.
        const cuspSpan = (item.throatHalf * 3.4) / width;
        if (dx < cuspSpan) {
          yf += ((item.throat - item.sag) / height) * bump(dx / cuspSpan);
        }
      }

      edge.push([xf * width, yf * height]);
    }

    const bank = [
      throughPoints(edge),
      `L ${edge[edge.length - 1][0]} ${-TOP_PAD}`,
      `L ${edge[0][0]} ${-TOP_PAD}`,
      "Z",
    ].join(" ");

    const lipDepth = -LIP_DEPTH * scale;
    const crestDepth = CREST_DEPTH * scale;

    // The floor: the same dense sampling, so both edges are equally smooth.
    const crest: [number, number][] = [];
    for (let i = 0; i <= EDGE_SAMPLES; i += 1) {
      const xf = -0.06 + (1.12 * i) / EDGE_SAMPLES;
      crest.push([xf * width, profileAt(FLOOR, xf) * height]);
    }
    const floor = [
      throughPoints(crest),
      `L ${crest[crest.length - 1][0]} ${height + 40}`,
      `L ${crest[0][0]} ${height + 40}`,
      "Z",
    ].join(" ");
    const floorTop = Math.min(...crest.map(([, y]) => y)) - crestDepth - 8;

    return {
      mass,
      seam,
      drips,
      bank,
      floor,
      floorTop,
      lipDepth,
      crestDepth,
      lip: LIP.map((step) => ({ ...step, dy: lipDepth * (1 - step.at) })),
      crest: CREST.map((step) => ({ ...step, dy: crestDepth * step.at })),
    };
  }, [width, height]);

  const id = useId();
  const bankId = `${id}-bank`;
  const poolId = `${id}-pool`;
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
            <stop offset="0" stopColor="#b66a37" />
            <stop offset="0.22" stopColor="#d6884e" />
            <stop offset="0.5" stopColor="#dd8d50" />
            <stop offset="1" stopColor="#da8a4d" />
          </linearGradient>

          {/* The floor deepens downwards, away from the light coming over its
              crest — the opposite of the bank, which is brightest at its top
              because that is the face turned towards the light. */}
          <linearGradient
            gradientUnits="userSpaceOnUse"
            id={poolId}
            x1="0"
            x2="0"
            y1={geometry.floorTop}
            y2={height + 20}
          >
            <stop offset="0" stopColor="#c27341" />
            <stop offset="0.35" stopColor="#ad6131" />
            <stop offset="0.72" stopColor="#944d22" />
            <stop offset="1" stopColor="#7a3c18" />
          </linearGradient>

          {/* A broad, soft lift across the bank, off-centre. A poured sheet
              is not one value edge to edge; without something this wide and
              this weak it reads as a filled rectangle. */}
          <linearGradient
            gradientUnits="userSpaceOnUse"
            id={sheenId}
            x1="0"
            x2={width}
            y1="0"
            y2="0"
          >
            <stop offset="0" stopColor="#fdede0" stopOpacity="0.02" />
            <stop offset="0.24" stopColor="#fdede0" stopOpacity="0.09" />
            <stop offset="0.5" stopColor="#fce1cb" stopOpacity="0.03" />
            <stop offset="0.74" stopColor="#663111" stopOpacity="0.07" />
            <stop offset="1" stopColor="#582a0e" stopOpacity="0.15" />
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
            <stop offset="0" stopColor="#47220b" stopOpacity="0" />
            <stop offset="1" stopColor="#3a1b09" stopOpacity="0.26" />
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
              <stop offset="0" stopColor="#964c22" />
              <stop offset="0.09" stopColor="#c16f3a" />
              <stop offset="0.19" stopColor="#e8ad82" />
              <stop offset="0.27" stopColor="#f8d8be" />
              <stop offset="0.37" stopColor="#e8a575" />
              <stop offset="0.5" stopColor="#db8e58" />
              <stop offset="0.69" stopColor="#ce7d47" />
              <stop offset="0.87" stopColor="#ab5f31" />
              <stop offset="1" stopColor="#894520" />
            </linearGradient>
          ))}

          {/* The wash that hands the column over to the bank. Opaque in the
              bank's own colour where the two overlap, gone a little below the
              throat, so the change of shading happens across a fade instead of
              on a line. */}
          {geometry.drips.map((item, i) => (
            <linearGradient
              gradientUnits="userSpaceOnUse"
              id={`${id}-blend${i}`}
              // biome-ignore lint/suspicious/noArrayIndexKey: fixed, ordered constant
              key={i}
              x1="0"
              x2="0"
              y1={item.blendTop}
              y2={item.blendEnd}
            >
              <stop offset="0" stopColor="#de9057" />
              <stop offset="0.45" stopColor="#de9057" />
              <stop offset="1" stopColor="#db8c54" stopOpacity="0" />
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
              <stop offset="0" stopColor="#fef2e9" />
              <stop offset="0.17" stopColor="#f2c4a1" />
              <stop offset="0.42" stopColor="#dd925c" />
              <stop offset="0.68" stopColor="#c87741" />
              <stop offset="0.9" stopColor="#a1552b" />
              <stop offset="0.97" stopColor="#87441e" stopOpacity="0.85" />
              <stop offset="1" stopColor="#773a18" stopOpacity="0" />
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

          {/* The floor fills from the bottom up behind a level front, which is
              what standing liquid does, so a plain rect anchored to the bottom
              is the honest reveal for it. */}
          <rect
            className="ss-pour-pool"
            height={height + 40 - geometry.floorTop}
            style={{ "--delay": `${FLOOR_DELAY}s` } as React.CSSProperties}
            width={width + 60}
            x={-30}
            y={geometry.floorTop}
          />
        </clipPath>

        {/* Clip outside, artwork inside: nothing here ever changes, so it
            rasterises once and each frame only moves the clip. */}
        <g clipPath={`url(#${revealId})`}>
          {/*
            The bank first, and the drips over it.

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

          {/*
            The drips over the top, each running up well inside the bank.

            Underneath the bank they were separate from it: the rolled edge ran
            across in front of every column, so each one read as a pipe behind
            a shelf rather than as the same paint carrying on down. Over the
            top the edge is interrupted by the drip, which is what it does when
            paint runs off a mass.

            The last pass is what makes that work. It washes the column back to
            the bank's own colour where the two overlap and fades out below, so
            the column has no top edge to see and no seam where the shading
            changes hands — it simply becomes the bank going up.
          */}
          {geometry.drips.map((item, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: fixed, ordered constant
            <Fragment key={i}>
              <path d={item.path} fill={`url(#${id}-tube${i})`} />
              <path d={item.path} fill={`url(#${id}-bead${i})`} />
              <path d={item.path} fill={`url(#${washId})`} />
              <path d={item.path} fill={`url(#${id}-blend${i})`} />
              <path d={item.path} fill={`url(#${sheenId})`} />
            </Fragment>
          ))}

          {/* The floor, rolled the same way as the bank but downwards: its
              crest is the face turned towards the light, so the hot band sits
              along the top of it rather than under the bottom. Over the drips,
              so the heavy one runs into it rather than in front of it. */}
          {geometry.crest.map((step) => (
            <g key={step.fill} transform={`translate(0 ${step.dy})`}>
              <path d={geometry.floor} fill={step.fill} />
            </g>
          ))}
          <g transform={`translate(0 ${geometry.crestDepth})`}>
            <path d={geometry.floor} fill={`url(#${poolId})`} />
          </g>
        </g>
      </svg>
    </div>
  );
}
