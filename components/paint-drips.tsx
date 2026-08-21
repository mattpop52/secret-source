/*
 * The paint keeps running. Each drip is a stem that stretches downward and a
 * heavier bulb that leads it, both in the same orange as the masses above —
 * so a drip reads as paint leaving the mass it hangs from rather than a bar
 * growing out of nowhere.
 *
 * `run` is how far down the viewport the drip finally reaches, `dur` how long
 * it takes, `delay` when it starts. Staggered so the page is never still: the
 * first ones are already moving when the visitor lands, the last ones start
 * up to half a minute later for anyone who stays to watch.
 */
type Drip = {
  x: string;
  width: number;
  run: number;
  dur: number;
  delay: number;
};

const DRIPS: Drip[] = [
  // Left mass
  { x: "5%", width: 26, run: 104, dur: 17, delay: 0.4 },
  { x: "11.5%", width: 17, run: 46, dur: 11, delay: 2.6 },
  { x: "19%", width: 22, run: 78, dur: 21, delay: 1.2 },
  { x: "24%", width: 14, run: 33, dur: 9, delay: 6.5 },
  // Centre mass — this is the one that runs down behind the shop button
  { x: "46%", width: 28, run: 108, dur: 15, delay: 0.9 },
  { x: "53.5%", width: 17, run: 62, dur: 19, delay: 4.2 },
  // Right mass
  { x: "77%", width: 20, run: 88, dur: 18, delay: 1.8 },
  { x: "84%", width: 28, run: 106, dur: 22, delay: 3.4 },
  { x: "91%", width: 15, run: 41, dur: 12, delay: 8.5 },
  // Latecomers, for anyone who lingers
  { x: "22%", width: 18, run: 70, dur: 20, delay: 14 },
  { x: "57%", width: 22, run: 95, dur: 24, delay: 19 },
  { x: "8.5%", width: 15, run: 55, dur: 18, delay: 27 },
];

export function PaintDrips() {
  return (
    <div aria-hidden="true" className="ss-drips">
      {DRIPS.map((drip) => (
        <span
          className="ss-drip"
          key={`${drip.x}-${drip.delay}`}
          style={
            {
              "--drip-x": drip.x,
              "--drip-w": `${drip.width}px`,
              "--drip-run": `${drip.run}vh`,
              "--drip-dur": `${drip.dur}s`,
              "--drip-delay": `${drip.delay}s`,
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
