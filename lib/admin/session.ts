import "server-only";

/**
 * Signed, stateless admin session cookie — no database, just an expiry
 * timestamp and an HMAC over it, verified with the Web Crypto API so this
 * also works from Edge middleware (which can't use Node's `crypto` module).
 */

export const ADMIN_SESSION_COOKIE = "ss_admin_session";
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;
export const ADMIN_SESSION_MAX_AGE_SECONDS = SESSION_TTL_MS / 1000;

async function getKey(): Promise<CryptoKey> {
  const secret = process.env.ADMIN_SESSION_SECRET;

  if (!secret) {
    throw new Error("ADMIN_SESSION_SECRET is not configured.");
  }

  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function fromHex(hex: string): Uint8Array {
  const bytes = new Uint8Array(Math.floor(hex.length / 2));

  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = Number.parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }

  return bytes;
}

export async function createSessionToken(): Promise<string> {
  const expiresAt = Date.now() + SESSION_TTL_MS;
  const key = await getKey();
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(String(expiresAt)),
  );

  return `${expiresAt}.${toHex(signature)}`;
}

export async function isValidSessionToken(
  token: string | undefined | null,
): Promise<boolean> {
  if (!token) {
    return false;
  }

  const [expiresAtRaw, signatureHex] = token.split(".");

  if (!(expiresAtRaw && signatureHex)) {
    return false;
  }

  const expiresAt = Number(expiresAtRaw);

  if (!Number.isFinite(expiresAt) || expiresAt < Date.now()) {
    return false;
  }

  try {
    const key = await getKey();
    return await crypto.subtle.verify(
      "HMAC",
      key,
      fromHex(signatureHex) as BufferSource,
      new TextEncoder().encode(expiresAtRaw),
    );
  } catch {
    return false;
  }
}
