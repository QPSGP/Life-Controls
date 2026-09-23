import { NextRequest, NextResponse } from "next/server";
import { duplicateAreaOfPurpose } from "@/lib/duplicate-purpose";

export const dynamic = "force-dynamic";

/** POST — copy this area of purpose under a new name. */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const form = await req.formData();
  const name = (form.get("name") as string) ?? "";
  const origin = req.nextUrl.origin;
  const back = `/admin/life-plan/purpose/${id}`;
  const result = await duplicateAreaOfPurpose(id, name);
  if ("error" in result) {
    const code = result.error === "exists" ? "exists" : result.error === "name" ? "missing" : "missing";
    return NextResponse.redirect(new URL(`${back}?error=${code}#copy`, origin));
  }
  return NextResponse.redirect(new URL(`/admin/life-plan/purpose/${result.id}?copied=1`, origin));
}
