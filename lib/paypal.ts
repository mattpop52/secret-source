import "server-only";
import type { CurrencyCode } from "./currency";
import { getCurrency } from "./currency";

/**
 * PayPal Checkout (Orders v2), server side.
 *
 * This is deliberately not the pay-link the shop owner already created in
 * their PayPal dashboard — a pay link is one fixed price, and this shop's
 * basket total is different on every order. Instead, the server creates a
 * PayPal order for the exact computed total (same re-pricing logic as
 * before), sends the shopper to PayPal's own hosted approval page for it,
 * and captures the payment once they've approved and PayPal redirects them
 * back. That's the same three-step shape Stripe Checkout was doing —
 * create, redirect, land on success — just against a different processor.
 *
 * Requires a PayPal REST app (Client ID + Secret) from a PayPal *developer*
 * account (developer.paypal.com → Apps & Credentials), which is a separate
 * thing from the pay link and from logging into the business account itself.
 */

const API_BASE =
  process.env.PAYPAL_ENV === "sandbox"
    ? "https://api-m.sandbox.paypal.com"
    : "https://api-m.paypal.com";

export function isPaypalConfigured() {
  return Boolean(
    process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET,
  );
}

// Access tokens are valid for hours, so one serverless instance can reuse
// the same one across requests instead of authenticating every time.
let cachedToken: { value: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.value;
  }

  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (!(clientId && clientSecret)) {
    throw new Error("PayPal is not configured.");
  }

  const response = await fetch(`${API_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    throw new Error("Could not authenticate with PayPal.");
  }

  const data = (await response.json()) as {
    access_token: string;
    expires_in: number;
  };

  // Refreshed a minute early so a request never lands right on the boundary.
  cachedToken = {
    value: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 60) * 1000,
  };

  return data.access_token;
}

/** GBP-pence-derived minor units → the decimal string PayPal's API wants. */
function toAmountString(minorAmount: number, code: CurrencyCode): string {
  const { minorUnit } = getCurrency(code);
  return (minorAmount / 10 ** minorUnit).toFixed(minorUnit);
}

export type PaypalLineItem = {
  name: string;
  description: string;
  quantity: number;
  /** Unit price, in the order's currency's own minor unit. */
  unitAmountMinor: number;
};

/**
 * Creates a PayPal order for the exact total already computed from the
 * catalogue, and returns the URL to send the shopper to for approval.
 *
 * shipping_preference: "GET_FROM_FILE" asks PayPal to collect a shipping
 * address from the buyer during approval — the same job Stripe Checkout's
 * shipping_address_collection was doing, so nothing upstream of this needs
 * its own address form.
 */
export async function createPaypalOrder(params: {
  currency: CurrencyCode;
  items: PaypalLineItem[];
  shippingMinor: number;
  returnUrl: string;
  cancelUrl: string;
}): Promise<{ id: string; approveUrl: string }> {
  const { currency, items, shippingMinor, returnUrl, cancelUrl } = params;
  const accessToken = await getAccessToken();

  const itemTotalMinor = items.reduce(
    (sum, item) => sum + item.unitAmountMinor * item.quantity,
    0,
  );
  const totalMinor = itemTotalMinor + shippingMinor;

  const response = await fetch(`${API_BASE}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: currency,
            value: toAmountString(totalMinor, currency),
            breakdown: {
              item_total: {
                currency_code: currency,
                value: toAmountString(itemTotalMinor, currency),
              },
              shipping: {
                currency_code: currency,
                value: toAmountString(shippingMinor, currency),
              },
            },
          },
          items: items.map((item) => ({
            name: item.name.slice(0, 127),
            description: item.description.slice(0, 127),
            quantity: item.quantity.toString(),
            unit_amount: {
              currency_code: currency,
              value: toAmountString(item.unitAmountMinor, currency),
            },
          })),
        },
      ],
      application_context: {
        brand_name: "Secret Source",
        shipping_preference: "GET_FROM_FILE",
        user_action: "PAY_NOW",
        return_url: returnUrl,
        cancel_url: cancelUrl,
      },
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message ?? "PayPal order could not be created.");
  }

  const approveUrl = (data.links as { rel: string; href: string }[]).find(
    (link) => link.rel === "approve" || link.rel === "payer-action",
  )?.href;

  if (!approveUrl) {
    throw new Error("PayPal did not return an approval link.");
  }

  return { id: data.id, approveUrl };
}

export type PaypalCapture = {
  status: string;
  payerEmail: string | null;
  reference: string;
};

/**
 * Finalises payment on an order the shopper has already approved. Reloading
 * the success page (back button, a refresh) calls this a second time for
 * the same order, so a prior capture is treated as success rather than an
 * error — PayPal reports that case as 422 ORDER_ALREADY_CAPTURED.
 */
export async function capturePaypalOrder(
  orderId: string,
): Promise<PaypalCapture> {
  const accessToken = await getAccessToken();

  const response = await fetch(
    `${API_BASE}/v2/checkout/orders/${orderId}/capture`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    },
  );

  const data = await response.json();

  const alreadyCaptured = data?.details?.some(
    (detail: { issue?: string }) => detail.issue === "ORDER_ALREADY_CAPTURED",
  );

  if (!response.ok && !alreadyCaptured) {
    throw new Error(data?.message ?? "PayPal could not confirm this payment.");
  }

  // Either the fresh capture response or, on a repeat visit, the order
  // itself — both carry payer details in the same shape.
  const order = alreadyCaptured ? await getPaypalOrder(orderId) : data;

  const capture = order.purchase_units?.[0]?.payments?.captures?.[0];

  return {
    status: capture?.status ?? order.status ?? "UNKNOWN",
    payerEmail: order.payer?.email_address ?? null,
    reference: orderId.slice(-8).toUpperCase(),
  };
}

async function getPaypalOrder(orderId: string) {
  const accessToken = await getAccessToken();

  const response = await fetch(`${API_BASE}/v2/checkout/orders/${orderId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  return response.json();
}
