import type { Metadata } from "next";
import { Price } from "@/components/price";
import {
  DELIVERY_WINDOW,
  FREE_SHIPPING_THRESHOLD,
  RETURNS_WINDOW,
  SHOP_EMAIL,
  SHOP_INSTAGRAM,
  SHOP_INSTAGRAM_URL,
  STANDARD_SHIPPING,
} from "@/lib/constants";

export const metadata: Metadata = {
  title: "Help",
  description:
    "Delivery, returns, sizing, payment and how to reach Secret Source.",
};

const SECTIONS = [
  {
    id: "delivery",
    label: "Delivery",
    items: [
      {
        question: "When does my order go out?",
        answer: `Orders placed before 3pm on a working day are packed the same day. Everything ships tracked and lands in ${DELIVERY_WINDOW}.`,
      },
      {
        question: "What does delivery cost?",
        answer: (
          <>
            <Price cents={STANDARD_SHIPPING} /> tracked, and free once your
            basket passes <Price cents={FREE_SHIPPING_THRESHOLD} />.
          </>
        ),
      },
      {
        question: "Do you ship worldwide?",
        answer:
          "Yes — checkout takes addresses worldwide, with tracked delivery wherever you are. Everything ships from the UK.",
      },
    ],
  },
  {
    id: "returns",
    label: "Returns",
    items: [
      {
        question: "How long do I have?",
        answer: `${RETURNS_WINDOW} from the day it lands. Unworn, tags on, packaging intact — footwear back in its original box, inside a shipping box.`,
      },
      {
        question: "What if it isn't authentic?",
        answer:
          "Full refund including postage both ways, no argument. That's the whole promise the shop runs on.",
      },
      {
        question: "Can I swap a size instead?",
        answer:
          "Yes, when the size you want is on the shelf. Message before sending anything back so it can be held for you.",
      },
    ],
  },
  {
    id: "sizing",
    label: "Sizing",
    items: [
      {
        question: "How do the tracksuits fit?",
        answer:
          "True to size for a regular fit. Size up one for the boxier drape most people wear them with.",
      },
      {
        question: "What about footwear?",
        answer:
          "Sneakers are listed in UK sizing and run true to size. Slides run small — take one size up.",
      },
      {
        question: "A size is struck through — is it coming back?",
        answer:
          "A struck-through size is sold out on the shelf right now. Message with the docket number and you'll be told when it lands again.",
      },
    ],
  },
  {
    id: "payment",
    label: "Payment",
    items: [
      {
        question: "How do I pay?",
        answer:
          "Card, Apple Pay or Google Pay, handled by Stripe. Card details are entered on Stripe's own checkout — they never touch this site.",
      },
      {
        question: "Is the price what I pay?",
        answer:
          "Tax is included in every listed price. Delivery is added at checkout, and there's nothing after that.",
      },
    ],
  },
];

export default function HelpPage() {
  return (
    <>
      <header className="border-[var(--ss-hairline)] border-b">
        <div className="mx-auto max-w-[1240px] px-4 py-14 sm:px-6 sm:py-16">
          <p className="ss-stencil text-[0.62rem] text-[var(--ss-orange)]">
            Help
          </p>
          <h1 className="ss-display ss-display-shadow mt-4 text-[clamp(2.5rem,8vw,5rem)]">
            Straight answers
          </h1>
          <nav aria-label="Help sections" className="mt-6 flex flex-wrap gap-2">
            {SECTIONS.map((section) => (
              <a
                className="ss-stencil border border-[var(--ss-hairline)] px-4 py-2.5 text-[0.62rem] text-[var(--ss-bone)]/75 transition-colors hover:border-[var(--ss-orange)] hover:text-[var(--ss-orange)]"
                href={`#${section.id}`}
                key={section.id}
              >
                {section.label}
              </a>
            ))}
            <a
              className="ss-stencil border border-[var(--ss-hairline)] px-4 py-2.5 text-[0.62rem] text-[var(--ss-bone)]/75 transition-colors hover:border-[var(--ss-orange)] hover:text-[var(--ss-orange)]"
              href="#contact"
            >
              Contact
            </a>
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-[1240px] px-4 py-14 sm:px-6 sm:py-16">
        {SECTIONS.map((section) => (
          <section
            className="scroll-mt-24 border-[var(--ss-hairline)] border-b py-10 first:pt-0"
            id={section.id}
            key={section.id}
          >
            <div className="grid gap-8 lg:grid-cols-[0.8fr_1.6fr]">
              <h2 className="ss-display text-[clamp(1.75rem,4.5vw,2.5rem)]">
                {section.label}
              </h2>
              <dl className="space-y-6">
                {section.items.map((item) => (
                  <div key={item.question}>
                    <dt className="font-semibold">{item.question}</dt>
                    <dd className="mt-2 max-w-prose text-[var(--ss-smoke)] text-sm leading-relaxed">
                      {item.answer}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </section>
        ))}

        {/* biome-ignore lint/correctness/useUniqueElementIds: a page-level anchor target linked from the nav and the footer */}
        <section className="scroll-mt-24 py-12" id="contact">
          <div className="ss-docket grid gap-8 px-7 py-8 lg:grid-cols-[1.2fr_1fr]">
            <div>
              <h2 className="ss-display text-[clamp(1.75rem,4.5vw,2.5rem)]">
                Talk to the plug
              </h2>
              <p className="mt-3 max-w-prose text-[var(--ss-smoke)] text-sm leading-relaxed">
                Messages are answered in order, usually the same day. Quote the
                docket number if it's about a specific piece — it gets you a
                specific answer.
              </p>
            </div>
            <div className="flex flex-col gap-3 lg:items-end lg:justify-center">
              <a
                className="ss-stencil bg-[var(--ss-orange)] px-6 py-3.5 text-center text-[#120c00] text-[0.7rem] transition-colors hover:bg-[var(--ss-orange-hot)]"
                href={SHOP_INSTAGRAM_URL}
                rel="noreferrer"
                target="_blank"
              >
                DM @{SHOP_INSTAGRAM}
              </a>
              <a
                className="ss-stencil border border-[var(--ss-hairline-strong)] px-6 py-3.5 text-center text-[0.7rem] transition-colors hover:border-[var(--ss-orange)] hover:text-[var(--ss-orange)]"
                href={`mailto:${SHOP_EMAIL}`}
              >
                {SHOP_EMAIL}
              </a>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
