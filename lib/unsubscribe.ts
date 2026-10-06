import { createHmac, timingSafeEqual } from "crypto";

const sig = (userId: string) => createHmac("sha256", process.env.SESSION_SECRET ?? "").update(`unsub:${userId}`).digest("base64url").slice(0, 24);

export function unsubscribeUrl(appUrl: string, userId: string) {
  return `${appUrl}/api/email/unsubscribe?u=${encodeURIComponent(userId)}&s=${sig(userId)}`;
}

export function verifyUnsubscribe(userId: string | null, s: string | null): boolean {
  if (!userId || !s || !process.env.SESSION_SECRET) return false;
  const a = Buffer.from(sig(userId));
  const b = Buffer.from(s);
  return a.length === b.length && timingSafeEqual(a, b);
}
