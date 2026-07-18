import { createHash, createHmac, randomBytes } from "node:crypto";

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function createPairingCredential() {
  const token = randomBytes(32).toString("base64url");
  const entropy = randomBytes(6);
  const code = Array.from(entropy, (byte) => CODE_ALPHABET[byte % CODE_ALPHABET.length]).join("");
  return { token, code };
}

export function digestPairingToken(token: string, pepper: string) {
  return createHmac("sha256", pepper).update(token).digest("hex");
}

export function deterministicUuid(seed: string) {
  const hex = createHash("sha256").update(seed).digest("hex").slice(0, 32).split("");
  hex[12] = "4";
  hex[16] = ((Number.parseInt(hex[16] ?? "0", 16) & 0x3) | 0x8).toString(16);
  const value = hex.join("");
  return `${value.slice(0, 8)}-${value.slice(8, 12)}-${value.slice(12, 16)}-${value.slice(16, 20)}-${value.slice(20)}`;
}

export function bearerToken(request: Request) {
  const authorization = request.headers.get("authorization") ?? "";
  return authorization.toLowerCase().startsWith("bearer ") ? authorization.slice(7).trim() : null;
}
