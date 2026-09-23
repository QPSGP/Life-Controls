import { NextRequest, NextResponse } from "next/server";
import { getMemberIdFromCookie } from "@/lib/member-auth";
import { duplicateAreaOfPurpose } from "@/lib/duplicate-purpose";

export const dynamic = "force-dynamic";

/** POST — member copies one of their own areas of purpose. */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const memberId = await getMemberIdFromCookie();
  const origin = req.nextUrl.origin;
  if (!memberId) return NextResponse.redirect(new URL("/login", origin));
  const { id } = await params;
  const form = await req.formData();
  const name = (form.get("name") as string) ?? "";
  const back = `/portal/plan/purpose/${id}`;
  const result = await duplicateAreaOfPurpose(id, name, memberId);
  if ("error" in result) {
    const code = result.error === "exists" ? "exists" : "missing";
    return NextResponse.redirect(new URL(`${back}?error=${code}#copy`, origin));
  }
  return NextResponse.redirect(new URL(`/portal/plan/purpose/${result.id}?copied=1`, origin));
}
