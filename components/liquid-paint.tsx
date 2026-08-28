import Image from "next/image";
import { PAINT_SHAPES } from "@/lib/paint-shapes";

/*
 * The banner's own paint, set moving.
 *
 * The top corners have somewhere to drip to, so they are photographs of the
 * banner's own paint (public/brand/paint-tl.png, paint-tr.png — pixels cut
 * straight out of the artwork, at 4x the source banner's own resolution so
 * the later CSS stretch has real pixels to work with instead of upscaling
 * an already-small crop) stretched vertically from an anchored top edge,
 * the same way the splash's caramel pour is lengthened: one element, one
 * height animation, no shape drawn that was not already there. unoptimized
 * on both — Next's own pipeline would otherwise pick a variant sized for
 * the element's intrinsic width/height and miss that the stretch displays
 * it far taller. The bottom corners cannot drip upward, so they stay the
 * static vector silhouettes traced from the artwork (lib/paint-shapes.ts)
 * and only breathe.
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
          height={688}
          priority
          src="/brand/paint-tl.png"
          unoptimized
          width={1100}
        />
      </div>

      <div className="ss-paint ss-paint-tr">
        <Image
          alt=""
          className="ss-paint-stretch"
          height={936}
          priority
          src="/brand/paint-tr.png"
          unoptimized
          width={880}
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
