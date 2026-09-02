import { NextResponse } from "next/server";
import { z } from "zod";
import { getProduct } from "@/lib/catalog";
import { FREE_SHIPPING_THRESHOLD, STANDARD_SHIPPING } from "@/lib/constants";
import {
  convertFromGbpMinor,
  DEFAULT_CURRENCY,
  isCurrencyCode,
} from "@/lib/currency";
import type { PaypalLineItem } from "@/lib/paypal";
import { createPaypalOrder, isPaypalConfigured } from "@/lib/paypal";

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
  // The browser only says which currency the shopper picked — the amount
  // actually charged is always recomputed below from the GBP catalogue
  // price using the same static rate table the display uses, never trusted
  // from the client.
  currency: z.string().optional(),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = checkoutSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid basket" }, { status: 400 });
  }

  const currency =
    parsed.data.currency && isCurrencyCode(parsed.data.currency)
      ? parsed.data.currency
      : DEFAULT_CURRENCY;

  /*
   * Prices come from the catalogue on the server, never from the browser —
   * the request only says which product, which size and how many. Sizes are
   * re-checked against stock here too, because a basket can sit in
   * localStorage long after a size has gone.
   */
  const lineItems: PaypalLineItem[] = [];
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
      name: product.name,
      description: `${product.colourway.name} · Size ${item.size} · Docket ${product.code}`,
      quantity: item.quantity,
      unitAmountMinor: convertFromGbpMinor(product.priceCents, currency),
    });
  }

  const origin = new URL(request.url).origin;

  if (!isPaypalConfigured()) {
    // No PayPal credentials in this environment — send the shopper somewhere
    // that says so plainly rather than failing at a dead button.
    return NextResponse.json({ url: "/checkout/demo" });
  }

  const shippingCents =
    subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING;

  try {
    const order = await createPaypalOrder({
      currency,
      items: lineItems,
      shippingMinor: convertFromGbpMinor(shippingCents, currency),
      returnUrl: `${origin}/checkout/success`,
      cancelUrl: `${origin}/cart`,
    });

    return NextResponse.json({ url: order.approveUrl });
  } catch {
    return NextResponse.json(
      { error: "Checkout could not be started. Try again in a moment." },
      { status: 502 },
    );
  }
}
