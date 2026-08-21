import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { z } from "zod";
import { getProduct } from "@/lib/catalog";
import { FREE_SHIPPING_THRESHOLD, STANDARD_SHIPPING } from "@/lib/constants";
import { getStripeClient, isStripeConfigured } from "@/lib/stripe";

const checkoutSchema = z.object({
  items: z
    .array(
      z.object({
        slug: z.string().min(1),
        size: z.string().min(1),
        quantity: z.number().int().min(1).max(9),
      }),
    )
    .min(1)
    .max(20),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = checkoutSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid basket" }, { status: 400 });
  }

  /*
   * Prices come from the catalogue on the server, never from the browser —
   * the request only says which product, which size and how many. Sizes are
   * re-checked against stock here too, because a basket can sit in
   * localStorage long after a size has gone.
   */
  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
  let subtotal = 0;

  for (const item of parsed.data.items) {
    const product = getProduct(item.slug);

    if (!product) {
      return NextResponse.json(
        { error: "One of those pieces is no longer listed." },
        { status: 409 },
      );
    }

    const size = product.sizes.find((option) => option.label === item.size);

    if (!size?.inStock) {
      return NextResponse.json(
        { error: `${product.name} in ${item.size} has just gone.` },
        { status: 409 },
      );
    }

    subtotal += product.priceCents * item.quantity;

    lineItems.push({
      quantity: item.quantity,
      price_data: {
        currency: "gbp",
        unit_amount: product.priceCents,
        product_data: {
          name: product.name,
          description: `${product.colourway.name} · Size ${item.size} · Docket ${product.code}`,
        },
      },
    });
  }

  const origin = new URL(request.url).origin;

  if (!isStripeConfigured()) {
    // No Stripe keys in this environment — send the shopper somewhere that
    // says so plainly rather than failing at a dead button.
    return NextResponse.json({ url: "/checkout/demo" });
  }

  const stripe = getStripeClient();

  if (!stripe) {
    return NextResponse.json(
      { error: "Payments are not configured." },
      { status: 500 },
    );
  }

  const shippingCents =
    subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      shipping_address_collection: { allowed_countries: ["GB"] },
      shipping_options: [
        {
          shipping_rate_data: {
            type: "fixed_amount",
            display_name:
              shippingCents === 0
                ? "Free tracked delivery"
                : "Tracked delivery",
            fixed_amount: { amount: shippingCents, currency: "gbp" },
            delivery_estimate: {
              minimum: { unit: "business_day", value: 2 },
              maximum: { unit: "business_day", value: 4 },
            },
          },
        },
      ],
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cart`,
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "Checkout could not be started." },
        { status: 502 },
      );
    }

    return NextResponse.json({ url: session.url });
  } catch {
    return NextResponse.json(
      { error: "Checkout could not be started. Try again in a moment." },
      { status: 502 },
    );
  }
}
