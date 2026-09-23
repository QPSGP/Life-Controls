import { cookies } from "next/headers";
import crypto from "crypto";
import { prisma } from "@/lib/db";

const COOKIE_NAME = "sovereign_admin";
const SESSION_VALUE = "admin_session";

export function getAdminSessionToken(): string | null {
  if (!process.env.AUTH_SECRET) return null;
  return crypto.createHmac("sha256", process.env.AUTH_SECRET).update(SESSION_VALUE).digest("hex");
}

export function isAdminPasswordSet(): boolean {
  return !!process.env.ADMIN_PASSWORD;
}

function signStaffId(userId: string): string {
  if (!process.env.AUTH_SECRET) return "";
  const sig = crypto.createHmac("sha256", process.env.AUTH_SECRET).update("staff:" + userId).digest("hex");
  return `u.${userId}.${sig}`;
}

function staffIdFromCookie(value: string): string | null {
  if (!value.startsWith("u.")) return null;
  if (!process.env.AUTH_SECRET) return null;
  const rest = value.slice(2);
  const dot = rest.lastIndexOf(".");
  if (dot <= 0) return null;
  const userId = rest.slice(0, dot);
  const sig = rest.slice(dot + 1);
  const expected = crypto.createHmac("sha256", process.env.AUTH_SECRET).update("staff:" + userId).digest("hex");
  if (sig.length !== expected.length) return null;
  return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected)) ? userId : null;
}

export async function verifyAdminCookie(): Promise<boolean> {
  if (!isAdminPasswordSet()) return true;
  const cookieStore = await cookies();
  const cookie = cookieStore.get(COOKIE_NAME)?.value;
  if (!cookie) return false;
  const token = getAdminSessionToken();
  if (token && cookie === token) return true;
  const staffId = staffIdFromCookie(cookie);
  if (!staffId) return false;
  const user = await prisma.user.findUnique({ where: { id: staffId }, select: { id: true } });
  return !!user;
}

export async function setStaffCookie(userId: string): Promise<boolean> {
  const value = signStaffId(userId);
  if (!value) return false;
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
  return true;
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
