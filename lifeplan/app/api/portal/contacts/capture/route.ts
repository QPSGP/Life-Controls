import { NextRequest, NextResponse } from "next/server";
import { getMemberIdFromCookie } from "@/lib/member-auth";
import { completeJson } from "@/lib/ai";
import { mergeContactDraft, parseContactText, type ContactDraft } from "@/lib/parse-contact";

export const dynamic = "force-dynamic";

/** POST JSON { text } — draft contact fields. Does not save. */
export async function POST(req: NextRequest) {
  const memberId = await getMemberIdFromCookie();
  if (!memberId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let text = "";
  try {
    const body = (await req.json()) as { text?: string };
    text = body.text?.trim() ?? "";
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (text.length < 3) return NextResponse.json({ error: "Add a note, signature, or card text." }, { status: 400 });

  const parsed = parseContactText(text.slice(0, 4000));
  const raw = await completeJson(
    "Extract a contact from the note. Reply with JSON fields: firstName, lastName, displayName, email, phone, mobile, jobTitle, companyName, notes, howToEngage. Use empty strings when unknown. Do not invent an email or phone.",
    text.slice(0, 4000)
  );
  let draft: ContactDraft = parsed;
  let source: "text" | "model" = "text";
  if (raw) {
    try {
      const extra = JSON.parse(raw) as Partial<ContactDraft>;
      draft = mergeContactDraft(parsed, extra);
      source = "model";
    } catch {
      draft = parsed;
    }
  }
  return NextResponse.json({ draft, source });
}
