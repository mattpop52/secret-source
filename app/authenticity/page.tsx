import type { Metadata } from "next";
import Link from "next/link";
import { PlugMark } from "@/components/logo";
import { TapeMarquee } from "@/components/tape-marquee";
import {
  RETURNS_WINDOW,
  SHOP_INSTAGRAM,
  SHOP_INSTAGRAM_URL,
} from "@/lib/constants";

export const metadata: Metadata = {
  title: "Legit check",
  description:
    "How every piece on the Secret Source shelf is checked before it's listed — construction, hardware, tagging, packaging and paperwork.",
};

const CHECKPOINTS = [
  {
    step: "01",
    title: "Sourced, not scraped",
    body: "Stock comes from accounts and contacts that have been dealt with before — never a marketplace listing bought sight-unseen and drop-shipped to your door.",
  },
  {
    step: "02",
    title: "Opened and inspected",
    body: "Every piece is taken out of the bag. Stitch density, panel alignment, embroidery pull, zip and hardware weight, print edges, inner labels and their print registration.",
  },
  {
    step: "03",
    title: "Tags, box and paperwork",
    body: "Size run, SKU and barcode are matched against the piece itself. Footwear is checked box-label to shoe, insole to size, and against the original receipt trail.",
  },
  {
    step: "04",
    title: "Photographed as it ships",
    body: "The exact item you're buying is the one photographed, bagged and dispatched — not a stock shot standing in for a pile of identical units.",
  },
  {
    step: "05",
    title: "Backed after it lands",
    body: `Anything that doesn't hold up under your own inspection comes straight back. Full refund, return postage covered, no argument — inside ${RETURNS_WINDOW} of delivery.`,
  },
];

export default function AuthenticityPage() {
  return (
    <>
      <header className="ss-grain relative overflow-hidden border-[var(--ss-hairline)] border-b">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(-45deg, var(--ss-orange) 0 3px, transparent 3px 20px)",
          }}
        />
        <div className="relative mx-auto max-w-[1240px] px-4 py-16 sm:px-6 sm:py-20">
          <p className="ss-stencil flex items-center gap-3 text-[0.62rem] text-[var(--ss-orange)]">
            <PlugMark className="size-4" />
            The legit check
          </p>
          <h1 className="ss-display ss-display-shadow mt-5 max-w-3xl text-[clamp(2.5rem,9vw,5.5rem)]">
            Checked before it's anywhere near you
          </h1>
          <p className="mt-5 max-w-xl text-[var(--ss-smoke)] leading-relaxed">
            Resale runs on trust, and trust is a process, not a badge. Here is
            exactly what happens between a piece being sourced and it reaching
            your door.
          </p>
        </div>
      </header>

      <section className="mx-auto max-w-[1240px] px-4 py-16 sm:px-6 sm:py-20">
        <ol className="grid gap-px bg-[var(--ss-hairline)] sm:grid-cols-2 lg:grid-cols-3">
          {CHECKPOINTS.map((checkpoint) => (
            <li
              className="bg-[var(--ss-black)] px-7 py-8"
              key={checkpoint.step}
            >
              <span className="ss-num bg-[var(--ss-orange)] px-2 py-1 text-[#120c00] text-sm">
                {checkpoint.step}
              </span>
              <h2 className="ss-display mt-5 text-2xl">{checkpoint.title}</h2>
              <p className="mt-3 text-[var(--ss-smoke)] text-sm leading-relaxed">
                {checkpoint.body}
              </p>
            </li>
          ))}

          <li className="ss-tape flex items-center justify-center bg-[var(--ss-black)] px-7 py-10">
            <span className="ss-display bg-[var(--ss-black)] px-4 py-3 text-center text-2xl leading-tight">
              Not right,
              <br />
              {RETURNS_WINDOW} to send it back
            </span>
          </li>
        </ol>
      </section>

      <TapeMarquee items={["Every docket checked", "Every piece in hand"]} />

      <section className="mx-auto max-w-[1240px] px-4 py-16 sm:px-6 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <h2 className="ss-display ss-display-shadow text-[clamp(1.75rem,5vw,3rem)]">
              What the docket number means
            </h2>
            <p className="mt-5 text-[var(--ss-smoke)] leading-relaxed">
              Every listing carries a docket — <code>SS-TRP-0142</code>, for
              example. It ties the listing to the physical piece on the shelf:
              its check notes, its photographs and its paperwork. Quote it in a
              message and you'll get the specific answer about the specific
              item, not a general one about the style.
            </p>
          </div>

          <div className="ss-docket px-7 py-7">
            <h2 className="ss-stencil text-[0.7rem] text-[var(--ss-orange)]">
              Still not sure?
            </h2>
            <p className="mt-4 text-[var(--ss-smoke)] text-sm leading-relaxed">
              Ask for close-ups before you buy — stitching, labels, hardware,
              box, whatever you want to see. Nothing about the check is a
              secret, which is the point.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                className="ss-stencil bg-[var(--ss-orange)] px-6 py-3.5 text-[#120c00] text-[0.7rem] transition-colors hover:bg-[var(--ss-orange-hot)]"
                href={SHOP_INSTAGRAM_URL}
                rel="noreferrer"
                target="_blank"
              >
                DM @{SHOP_INSTAGRAM}
              </a>
              <Link
                className="ss-stencil border border-[var(--ss-hairline-strong)] px-6 py-3.5 text-[0.7rem] transition-colors hover:border-[var(--ss-orange)] hover:text-[var(--ss-orange)]"
                href="/help"
              >
                Delivery &amp; returns
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
