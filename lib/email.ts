import "server-only";
import { DELIVERY_WINDOW, RETURNS_WINDOW, SHOP_EMAIL } from "./constants";
import type { PaypalCapture } from "./paypal";

/**
 * Order emails, sent through Resend's HTTP API directly — no SDK, the same
 * choice made for PayPal, since the whole integration is one POST request
 * with a bearer token.
 *
 * Needs RESEND_API_KEY (resend.com, free to start). The default sender,
 * onboarding@resend.dev, needs no domain setup and can send to any address —
 * that's deliberate: this shop's contact address is a plain mailbox
 * (secretsourceltd@outlook.com), not a domain Resend could verify, so
 * sending "from" it isn't possible. Both emails set reply-to instead, so
 * replying in an inbox goes to the right place regardless of the from
 * address. Set RESEND_FROM_EMAIL once a real domain exists to verify.
 */

const API_BASE = "https://api.resend.com";
const DEFAULT_FROM = "Secret Source <onboarding@resend.dev>";

export function isEmailConfigured() {
  return Boolean(process.env.RESEND_API_KEY);
}

async function sendEmail(params: {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return false;
  }

  try {
    const response = await fetch(`${API_BASE}/emails`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM_EMAIL || DEFAULT_FROM,
        to: params.to,
        subject: params.subject,
        html: params.html,
        reply_to: params.replyTo,
      }),
    });

    if (!response.ok) {
      // Resend's sandbox sender can only deliver to the address the account
      // was signed up with until a real domain is verified — logged here so
      // that restriction (or any other send failure) shows up in Vercel's
      // runtime logs instead of just quietly not arriving.
      const body = await response.text().catch(() => "");
      console.error(
        `Resend send to ${params.to} failed (${response.status}): ${body}`,
      );
      return false;
    }

    return true;
  } catch (error) {
    console.error(`Resend send to ${params.to} threw:`, error);
    return false;
  }
}

function formatMoney(value: string, currency: string): string {
  try {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency,
    }).format(Number(value));
  } catch {
    return `${currency} ${value}`;
  }
}

/** Plain, high-contrast HTML — this renders in real inboxes, not the shop's
 *  own dark theme, so it stays deliberately simple rather than themed. */
function layout(bodyHtml: string): string {
  return `<div style="font-family:Arial,Helvetica,sans-serif;max-width:520px;margin:0 auto;color:#141414">
    <div style="background:#141414;color:#fff;padding:20px 24px">
      <span style="font-weight:700;letter-spacing:0.04em;text-transform:uppercase;font-size:15px">Secret Source</span>
    </div>
    <div style="padding:24px;border:1px solid #e2e2e2;border-top:none">${bodyHtml}</div>
  </div>`;
}

function itemsTable(items: PaypalCapture["items"]): string {
  const rows = items
    .map(
      (item) => `<tr>
        <td style="padding:8px 0;border-bottom:1px solid #eee">
          <div style="font-weight:600">${escapeHtml(item.name)}</div>
          <div style="color:#666;font-size:13px">${escapeHtml(item.description)}</div>
        </td>
        <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right;white-space:nowrap">×${item.quantity}</td>
      </tr>`,
    )
    .join("");

  return `<table style="width:100%;border-collapse:collapse;margin:16px 0">${rows}</table>`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** To the shop owner, the moment an order captures — items, total, and the
 *  address to post it to, since PayPal's own dashboard is otherwise the only
 *  place any of this is visible. */
export async function sendOrderOwnerNotification(
  capture: PaypalCapture,
): Promise<boolean> {
  const total = formatMoney(capture.amountValue, capture.currency);

  const html = layout(`
    <h1 style="font-size:20px;margin:0 0 4px">New order — ${total}</h1>
    <p style="color:#666;margin:0 0 16px">Ref <strong style="color:#141414">${capture.reference}</strong></p>

    ${itemsTable(capture.items)}

    <table style="width:100%;font-size:14px;margin-bottom:20px">
      <tr><td style="color:#666">Buyer</td><td style="text-align:right">${escapeHtml(capture.payerName ?? "—")}</td></tr>
      <tr><td style="color:#666">Email</td><td style="text-align:right">${escapeHtml(capture.payerEmail ?? "—")}</td></tr>
      <tr><td style="color:#666;padding-top:6px">Total</td><td style="text-align:right;padding-top:6px;font-weight:700">${total}</td></tr>
    </table>

    <div style="background:#f6f6f6;padding:16px;border-radius:4px">
      <div style="font-weight:700;margin-bottom:6px">Ship to</div>
      <div style="font-weight:600">${escapeHtml(capture.shippingName ?? "—")}</div>
      ${capture.shippingLines.map((line) => `<div>${escapeHtml(line)}</div>`).join("")}
    </div>
  `);

  return sendEmail({
    to: SHOP_EMAIL,
    subject: `New order — Ref ${capture.reference} (${total})`,
    html,
    replyTo: capture.payerEmail ?? undefined,
  });
}

/** To the buyer, confirming what they ordered, what it cost, and where it's
 *  going — so a wrong address gets caught by them, not discovered on the
 *  shop's end after it's already been sent. */
export async function sendOrderConfirmation(
  capture: PaypalCapture,
): Promise<boolean> {
  if (!capture.payerEmail) {
    return false;
  }

  const total = formatMoney(capture.amountValue, capture.currency);

  const html = layout(`
    <h1 style="font-size:20px;margin:0 0 4px">You're plugged in</h1>
    <p style="color:#666;margin:0 0 16px">Ref <strong style="color:#141414">${capture.reference}</strong></p>

    <p style="line-height:1.5">Payment's through and this order is on the packing list. Checked, boxed and sent tracked — with you in ${DELIVERY_WINDOW}.</p>

    ${itemsTable(capture.items)}

    <table style="width:100%;font-size:14px;margin-bottom:20px">
      <tr><td style="font-weight:700">Total</td><td style="text-align:right;font-weight:700">${total}</td></tr>
    </table>

    <div style="background:#f6f6f6;padding:16px;border-radius:4px;margin-bottom:20px">
      <div style="font-weight:700;margin-bottom:6px">Sending to</div>
      <div style="font-weight:600">${escapeHtml(capture.shippingName ?? "—")}</div>
      ${capture.shippingLines.map((line) => `<div>${escapeHtml(line)}</div>`).join("")}
      <div style="color:#666;font-size:13px;margin-top:8px">Wrong address? Reply to this email right away.</div>
    </div>

    <p style="color:#666;font-size:13px;line-height:1.5">${RETURNS_WINDOW} to send it back if it's not right. Questions — just reply, it comes straight to us.</p>
  `);

  return sendEmail({
    to: capture.payerEmail,
    subject: `Your Secret Source order — Ref ${capture.reference}`,
    html,
    replyTo: SHOP_EMAIL,
  });
}
