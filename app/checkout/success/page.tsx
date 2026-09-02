import type { Metadata } from "next";
import Link from "next/link";
import { ClearCartOnMount } from "@/components/clear-cart";
import { LogoBadge, PlugMark } from "@/components/logo";
import { DELIVERY_WINDOW, SHOP_EMAIL } from "@/lib/constants";
import {
  isEmailConfigured,
  sendOrderConfirmation,
  sendOrderOwnerNotification,
} from "@/lib/email";
import { capturePaypalOrder, isPaypalConfigured } from "@/lib/paypal";

export const metadata: Metadata = { title: "Order placed" };

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  // PayPal appends these to return_url once the shopper has approved on its
  // own site — token is the order id; PayerID is only present after a real
  // approval, not on a bare reload of this URL.
  searchParams: Promise<{ token?: string; PayerID?: string }>;
}) {
  const { token: orderId } = await searchParams;

  let email: string | null = null;
  let reference: string | null = null;
  // Approval on PayPal's side doesn't move any money by itself — capturing
  // below is the step that actually does, so a capture that fails here means
  // the shopper has not been charged and should not see a success page.
  let captureFailed = false;

  if (isPaypalConfigured() && orderId) {
    try {
      const capture = await capturePaypalOrder(orderId);
      email = capture.payerEmail;
      reference = capture.reference;

      // Best-effort: the order is already paid for by this point, so a
      // failed or unconfigured email send should never turn a real success
      // into an error page. Sent in parallel since neither depends on the
      // other's outcome.
      if (isEmailConfigured()) {
        await Promise.allSettled([
          sendOrderOwnerNotification(capture),
          sendOrderConfirmation(capture),
        ]);
      }
    } catch {
      captureFailed = true;
    }
  }

  if (captureFailed) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
        <PlugMark className="mx-auto size-10 text-[var(--ss-orange)]" />

        <h1 className="ss-display ss-display-shadow mt-6 text-[clamp(2.25rem,7vw,4rem)]">
          Couldn't confirm that payment
        </h1>

        <p className="mt-5 text-[var(--ss-smoke)] leading-relaxed">
          Nothing's been taken that we can see, and your basket is still intact.
          If you did complete payment on PayPal, message us the reference below
          and we'll sort it out by hand rather than have you pay twice.
        </p>

        <p className="ss-stencil mt-6 inline-block border border-[var(--ss-hairline-strong)] px-5 py-3 text-[0.7rem]">
          Reference <span className="text-[var(--ss-orange)]">{orderId}</span>
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link
            className="ss-stencil bg-[var(--ss-orange)] px-7 py-4 text-[#120c00] text-[0.8rem] transition-colors hover:bg-[var(--ss-orange-hot)]"
            href="/cart"
          >
            Back to basket
          </Link>
          <a
            className="ss-stencil border border-[var(--ss-hairline-strong)] px-7 py-4 text-[0.8rem] transition-colors hover:border-[var(--ss-orange)] hover:text-[var(--ss-orange)]"
            href={`mailto:${SHOP_EMAIL}?subject=${encodeURIComponent(`PayPal order ${orderId}`)}`}
          >
            Question about this order
          </a>
        </div>
      </div>
    );
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
