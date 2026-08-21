/*
 * Paint leaves the masses from their points.
 *
 * Every tip below was measured off the artwork itself — the lowest-hanging
 * points of each mass's silhouette, their width at the tip, and the colour of
 * the paint right there. Positions are fractions of their own mass, so a drip
 * stays welded to its point at every viewport width, and the colour is the
 * artwork's amber rather than the brand's brighter orange.
 */
type Tip = {
  /** Which mass it hangs from. */
  mass: "tl" | "tc" | "tr";
  /** Position across that mass, 0–1. */
  fx: number;
  /** Height of the point down that mass, 0–1. */
  fy: number;
  /** Paint width at the tip, as a fraction of the mass. */
  tw: number;
  /** The paint's own colour at that point. */
  paint: string;
  run: number;
  dur: number;
  delay: number;
  /** Second, thinner bead down the same path later on. */
  wave?: number;
};

const TIPS: Tip[] = [
  // Top-left mass — the long point near the corner, then the inner one.
  { mass: "tl", fx: 0.09, fy: 0.795, tw: 0.103, paint: "#d0902c", run: 104, dur: 17, delay: 0.4 },
  { mass: "tl", fx: 0.763, fy: 0.5, tw: 0.093, paint: "#cb8c2a", run: 74, dur: 21, delay: 2.1 },
  // Top-centre mass — both of these run down behind the wordmark and button.
  { mass: "tc", fx: 0.169, fy: 0.7, tw: 0.104, paint: "#c68828", run: 108, dur: 15, delay: 0.9 },
  { mass: "tc", fx: 0.671, fy: 0.48, tw: 0.113, paint: "#c08427", run: 96, dur: 19, delay: 4.2 },
  // Top-right mass.
  { mass: "tr", fx: 0.337, fy: 0.229, tw: 0.193, paint: "#c68826", run: 88, dur: 18, delay: 1.5 },
  { mass: "tr", fx: 0.797, fy: 0.367, tw: 0.187, paint: "#c08427", run: 106, dur: 22, delay: 3.4 },

  // A second, thinner bead down the same points, for anyone who lingers.
  { mass: "tl", fx: 0.09, fy: 0.795, tw: 0.103, paint: "#d0902c", run: 62, dur: 20, delay: 21, wave: 0.6 },
  { mass: "tc", fx: 0.169, fy: 0.7, tw: 0.104, paint: "#c68828", run: 70, dur: 24, delay: 16, wave: 0.58 },
  { mass: "tr", fx: 0.797, fy: 0.367, tw: 0.187, paint: "#c08427", run: 58, dur: 22, delay: 27, wave: 0.55 },
];

export function PaintDrips() {
  return (
    <div aria-hidden="true" className="ss-drips">
      {TIPS.map((tip, index) => (
        <span
          className={`ss-drip ss-drip--${tip.mass}${tip.wave ? " ss-drip--late" : ""}`}
          key={`${tip.mass}-${tip.fx}-${tip.delay}`}
          style={
            {
              "--fx": tip.fx,
              "--fy": tip.fy,
              "--tw": tip.tw * (tip.wave ?? 1),
              "--paint": tip.paint,
              "--drip-run": `${tip.run}vh`,
              "--drip-dur": `${tip.dur}s`,
              "--drip-delay": `${tip.delay}s`,
              zIndex: index,
            } as React.CSSProperties
          }
        >
          <span className="ss-drip-stem" />
          <span className="ss-drip-bulb" />
        </span>
      ))}
    </div>
  );
}
