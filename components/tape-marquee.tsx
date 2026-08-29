import type { CSSProperties } from "react";

/**
 * Enough copies of the line that the track still reaches the right edge of the
 * screen after it has slid a whole copy's width. Two was only ever enough
 * while the line itself was wider than the viewport, which stopped being true
 * as soon as one of these lists got shorter — and the tell is a band of bare
 * tape sliding in from the right at the end of every cycle.
 */
const COPIES = 6;

/**
 * A full-bleed band of hazard tape with the shop's own line running across
 * it — the loudest thing on the page, used once per scroll to break the grid.
 */
export function TapeMarquee({
  items,
  tone = "orange",
}: {
  items: string[];
  tone?: "orange" | "outline";
}) {
  return (
    <div
      className={`ss-marquee relative overflow-hidden border-[var(--ss-hairline)] border-y py-4 ${
        tone === "orange" ? "bg-[var(--ss-orange)]" : "bg-[var(--ss-pitch)]"
      }`}
    >
      <div
        className="ss-marquee-track"
        style={{ "--marquee-shift": `-${100 / COPIES}%` } as CSSProperties}
      >
        {Array.from({ length: COPIES }, (_, copy) => (
          <ul
            aria-hidden={copy > 0}
            className="flex shrink-0"
            // biome-ignore lint/suspicious/noArrayIndexKey: a fixed count of identical copies, never reordered
            key={copy}
          >
            {items.map((item) => (
              <li
                className={`ss-display flex shrink-0 items-center gap-8 whitespace-nowrap px-8 text-[clamp(1.75rem,4vw,3rem)] ${
                  tone === "orange"
                    ? "text-[#120c00]"
                    : "text-[var(--ss-bone)]/85"
                }`}
                key={item}
              >
                {item}
                <span
                  className={`inline-block size-2 rotate-45 ${
                    tone === "orange" ? "bg-[#120c00]" : "bg-[var(--ss-orange)]"
                  }`}
                />
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}
