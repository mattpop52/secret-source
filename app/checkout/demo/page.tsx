import type { Metadata } from "next";
import Link from "next/link";
import { PlugMark } from "@/components/logo";

export const metadata: Metadata = { title: "Checkout not connected yet" };

/**
 * Where the checkout lands while STRIPE_SECRET_KEY is unset. It exists so a
 * shopper never taps a button that silently does nothing, and so whoever is
 * setting the shop up can see exactly what's missing.
 */
export default function CheckoutDemoPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-20 sm:px-6">
      <PlugMark className="size-10 text-[var(--ss-orange)]" />

      <h1 className="ss-display ss-display-shadow mt-6 text-[clamp(2.25rem,7vw,4rem)]">
        Payments aren't switched on yet
      </h1>

      <p className="mt-5 text-[var(--ss-smoke)] leading-relaxed">
        Your basket is intact — nothing has been charged, and nothing has been
        lost. This shop is wired for Stripe Checkout, but this environment has
        no Stripe key set, so the payment step can't open.
      </p>

      <div className="ss-docket mt-8 px-6 py-6">
        <h2 className="ss-stencil text-[0.7rem] text-[var(--ss-orange)]">
          To take real payments
        </h2>
        <ol className="mt-4 space-y-3 text-[var(--ss-smoke)] text-sm">
          <li className="flex gap-3">
            <span className="ss-num text-[var(--ss-orange)]">01</span>
            Add <code className="text-[var(--ss-bone)]">STRIPE_SECRET_KEY</code>{" "}
            to the environment (Vercel project settings, or{" "}
            <code className="text-[var(--ss-bone)]">.env.local</code> when
            running locally).
          </li>
          <li className="flex gap-3">
            <span className="ss-num text-[var(--ss-orange)]">02</span>
            Redeploy. The checkout button then opens a live Stripe session,
            priced from the catalogue on the server.
          </li>
        </ol>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          className="ss-stencil bg-[var(--ss-orange)] px-7 py-4 text-[#120c00] text-[0.8rem] transition-colors hover:bg-[var(--ss-orange-hot)]"
          href="/cart"
        >
          Back to basket
        </Link>
        <Link
          className="ss-stencil border border-[var(--ss-hairline-strong)] px-7 py-4 text-[0.8rem] transition-colors hover:border-[var(--ss-orange)] hover:text-[var(--ss-orange)]"
          href="/collections/all"
        >
          Keep shopping
        </Link>
      </div>
    </div>
  );
}
