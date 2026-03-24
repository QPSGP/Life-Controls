import crypto from "crypto";

/**
 * NOWPayments IPN: sign sorted JSON with HMAC-SHA512 (IPN secret from dashboard).
 * @see https://nowpayments.io/help/what-is/what-is-ipn
 */
export function sortJsonForNowPaymentsSignature(value: unknown): unknown {
  if (value === null || typeof value !== "object") return value;
  if (Array.isArray(value)) return value.map((item) => sortJsonForNowPaymentsSignature(item));
  const obj = value as Record<string, unknown>;
  const sorted: Record<string, unknown> = {};
  for (const key of Object.keys(obj).sort()) {
    sorted[key] = sortJsonForNowPaymentsSignature(obj[key]);
  }
  return sorted;
}

export function nowPaymentsIpnSignatureString(body: unknown): string {
  const sorted = sortJsonForNowPaymentsSignature(body);
  return JSON.stringify(sorted);
}

/** Some NOWPayments docs describe sorting only top-level keys before stringify. */
function sortTopLevelKeysOnly(value: unknown): unknown {
  if (value === null || typeof value !== "object") return value;
  if (Array.isArray(value)) return value;
  const obj = value as Record<string, unknown>;
  const sorted: Record<string, unknown> = {};
  for (const key of Object.keys(obj).sort()) {
    sorted[key] = obj[key];
  }
  return sorted;
}

export function nowPaymentsIpnSignatureStringTopLevel(body: unknown): string {
  return JSON.stringify(sortTopLevelKeysOnly(body));
}

export function verifyNowPaymentsIpnSignature(
  body: unknown,
  ipnSecret: string,
  headerSig: string | null
): boolean {
  if (!headerSig) return false;
  const received = headerSig.trim().toLowerCase();
  const payloads = [
    nowPaymentsIpnSignatureString(body),
    nowPaymentsIpnSignatureStringTopLevel(body),
  ];
  for (const payload of payloads) {
    const expected = crypto.createHmac("sha512", ipnSecret).update(payload, "utf8").digest("hex").toLowerCase();
    if (expected.length !== received.length) continue;
    try {
      if (crypto.timingSafeEqual(Buffer.from(expected, "utf8"), Buffer.from(received, "utf8"))) return true;
    } catch {
      /* continue */
    }
  }
  return false;
}
