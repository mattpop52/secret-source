import Image from "next/image";
import { PAINT_SHAPES } from "@/lib/paint-shapes";

/*
 * The banner's own paint, set moving.
 *
 * The top corners have somewhere to drip to, so they are photographs of the
 * banner's own paint (public/brand/paint-tl.png, paint-tr.png — pixels cut
 * straight out of the artwork) stretched vertically from an anchored top
 * edge, the same way the splash's caramel pour is lengthened: one element,
 * one scaleY, no shape drawn that was not already there. The bottom
 * corners cannot drip upward, so they stay the static vector silhouettes
 * traced from the artwork (lib/paint-shapes.ts) and only breathe.
 *
 * An earlier version of this drew a whole parametric system on top of the
 * artwork — tapered stem paths, radial-gradient heads, catchlights, gather
 * and recoil animations — none of which exists in the banner. It looked
 * like paint, but it was invented paint. This is the artwork itself moving.
 */

export function LiquidPaint() {
  return (
    <>
      <div className="ss-paint ss-paint-tl">
        <Image
          alt=""
          className="ss-paint-stretch"
          height={172}
          priority
          src="/brand/paint-tl.png"
          width={275}
        />
      </div>

      <div className="ss-paint ss-paint-tr">
        <Image
          alt=""
          className="ss-paint-stretch"
          height={234}
          priority
          src="/brand/paint-tr.png"
          width={220}
        />
      </div>

      <div className="ss-paint ss-paint-bl">
        <svg aria-hidden="true" fill="none" viewBox="0 0 194 330">
          {PAINT_SHAPES.bl.paths.map((d, index) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: paths is a fixed authored array, never reordered or filtered
            <path d={d} fill="#cc8a29" key={index} />
          ))}
        </svg>
      </div>

      <div className="ss-paint ss-paint-br">
        <svg aria-hidden="true" fill="none" viewBox="0 0 241 117">
          {PAINT_SHAPES.br.paths.map((d, index) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: paths is a fixed authored array, never reordered or filtered
            <path d={d} fill="#cc8a29" key={index} />
          ))}
        </svg>
      </div>
    </>
  );
}
