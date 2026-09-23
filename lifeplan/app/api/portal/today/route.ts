import { NextResponse } from "next/server";
import { getMemberIdFromCookie } from "@/lib/member-auth";
import { draftDay } from "@/lib/member-day";

export const dynamic = "force-dynamic";

/** POST — order today's open movements. Uses a model when OPENAI_API_KEY is set. */
export async function POST() {
  const memberId = await getMemberIdFromCookie();
  if (!memberId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const plan = await draftDay(memberId);
  return NextResponse.json(plan);
}
