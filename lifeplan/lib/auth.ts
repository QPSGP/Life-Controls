import { cookies } from "next/headers";
import crypto from "crypto";

const COOKIE_NAME = "sovereign_admin";
const SESSION_VALUE = "admin_session";

export function getAdminSessionToken(): string | null {
  if (!process.env.AUTH_SECRET) return null;
  return crypto.createHmac("sha256", process.env.AUTH_SECRET).update(SESSION_VALUE).digest("hex");
}

export function isAdminPasswordSet(): boolean {
  return !!process.env.ADMIN_PASSWORD;
}

export async function verifyAdminCookie(): Promise<boolean> {
  if (!isAdminPasswordSet()) return true;
  const token = getAdminSessionToken();
  if (!token) return false;
  const cookieStore = await cookies();
  const cookie = cookieStore.get(COOKIE_NAME);
  return cookie?.value === token;
}

export async function setAdminCookie(): Promise<void> {
  const token = getAdminSessionToken();
  if (!token) return;
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
}

export async function clearAdminCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
}

export { COOKIE_NAME };
