import { cookies } from "next/headers";
import crypto from "crypto";

const COOKIE_NAME = "sovereign_member";

function signMemberId(memberId: string): string {
  if (!process.env.AUTH_SECRET) return "";
  const sig = crypto.createHmac("sha256", process.env.AUTH_SECRET).update(memberId).digest("hex");
  return `${memberId}.${sig}`;
}

function verifyAndGetMemberId(value: string): string | null {
  if (!process.env.AUTH_SECRET) return null;
  const dot = value.indexOf(".");
  if (dot === -1) return null;
  const memberId = value.slice(0, dot);
  const sig = value.slice(dot + 1);
  const expected = crypto.createHmac("sha256", process.env.AUTH_SECRET).update(memberId).digest("hex");
  return sig === expected ? memberId : null;
}

export async function setMemberCookie(memberId: string): Promise<void> {
  const value = signMemberId(memberId);
  if (!value) return;
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });
}

export async function clearMemberCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getMemberIdFromCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(COOKIE_NAME);
  if (!cookie?.value) return null;
  return verifyAndGetMemberId(cookie.value);
}
