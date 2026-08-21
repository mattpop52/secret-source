import type { Metadata } from "next";
import Link from "next/link";
import { ClearCartOnMount } from "@/components/clear-cart";
import { LogoBadge } from "@/components/logo";
import { DELIVERY_WINDOW, SHOP_EMAIL } from "@/lib/constants";
import { getStripeClient } from "@/lib/stripe";

export const metadata: Metadata = { title: "Order placed" };

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id: sessionId } = await searchParams;
  const stripe = getStripeClient();

  let email: string | null = null;
  let reference: string | null = null;

  if (stripe && sessionId) {
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      email = session.customer_details?.email ?? null;
      // Short, human-readable reference — the full Stripe id is no use to
      // anyone reading it out over a DM.
      reference = session.id.slice(-8).toUpperCase();
    } catch {
      // A stale or unknown session id shouldn't turn a paid order into an
      // error page — fall back to the generic confirmation.
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
      <ClearCartOnMount />

      <LogoBadge className="mx-auto size-24" priority size={192} />

      <h1 className="ss-display ss-display-shadow mt-8 text-[clamp(2.5rem,8vw,4.5rem)]">
        You're plugged in
      </h1>

      <p className="mt-5 text-[var(--ss-smoke)] leading-relaxed">
        Payment's through and the order is on the packing list. It's checked,
        boxed and sent tracked — with you in {DELIVERY_WINDOW}.
        {email ? ` A receipt is on its way to ${email}.` : ""}
      </p>

      {reference && (
        <p className="ss-stencil mt-6 inline-block border border-[var(--ss-hairline-strong)] px-5 py-3 text-[0.7rem]">
          Order ref <span className="text-[var(--ss-orange)]">{reference}</span>
        </p>
      )}

      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Link
          className="ss-stencil bg-[var(--ss-orange)] px-7 py-4 text-[#120c00] text-[0.8rem] transition-colors hover:bg-[var(--ss-orange-hot)]"
          href="/collections/all"
        >
          Back to the shelf
        </Link>
        <a
          className="ss-stencil border border-[var(--ss-hairline-strong)] px-7 py-4 text-[0.8rem] transition-colors hover:border-[var(--ss-orange)] hover:text-[var(--ss-orange)]"
          href={`mailto:${SHOP_EMAIL}`}
        >
          Question about this order
        </a>
      </div>
    </div>
  );
}
