import { NextRequest, NextResponse } from "next/server";
import { getMemberIdFromCookie } from "@/lib/member-auth";
import { parseCategory, parseVisibility } from "@/lib/crm";
import { importContactsForMember, type ImportContactRow } from "@/lib/crm-import";

export const dynamic = "force-dynamic";

const MAX_BATCH = 75;

/** POST JSON — import a small batch of contacts (avoids Vercel 4.5MB body limit). */
export async function POST(req: NextRequest) {
  const memberId = await getMemberIdFromCookie();
  if (!memberId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const rows = Array.isArray(body?.contacts) ? (body.contacts as ImportContactRow[]) : [];
    if (rows.length === 0) {
      return NextResponse.json({ error: "empty" }, { status: 400 });
    }
    if (rows.length > MAX_BATCH) {
      return NextResponse.json({ error: "batch_too_large", max: MAX_BATCH }, { status: 400 });
    }

    const category = parseCategory(body?.category ?? "business");
    const visibility = parseVisibility(body?.visibility ?? "private");
    const source = typeof body?.source === "string" && body.source.trim() ? body.source.trim() : "Import";

    const result = await importContactsForMember(memberId, rows, { category, visibility, source });
    return NextResponse.json(result);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "import_failed" }, { status: 500 });
  }
}
