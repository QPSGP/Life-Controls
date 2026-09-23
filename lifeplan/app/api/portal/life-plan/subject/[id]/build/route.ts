import { NextRequest, NextResponse } from "next/server";
import { getMemberIdFromCookie } from "@/lib/member-auth";
import { prisma } from "@/lib/db";
import { duplicateAreaOfPurpose } from "@/lib/duplicate-purpose";
import { parseProgramSentence } from "@/lib/parse-program";
import { completeJson } from "@/lib/ai";

export const dynamic = "force-dynamic";

/** POST — create an area of purpose from a sentence, copying a template when one is named. */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const memberId = await getMemberIdFromCookie();
  const origin = req.nextUrl.origin;
  if (!memberId) return NextResponse.redirect(new URL("/login", origin));

  const { id: subjectId } = await params;
  const form = await req.formData();
  const sentence = ((form.get("sentence") as string) ?? "").trim();
  const templateFromForm = ((form.get("templateId") as string) ?? "").trim();
  const back = `/portal/plan/subject/${subjectId}`;
  if (!sentence) return NextResponse.redirect(new URL(`${back}?error=build`, origin));

  const subject = await prisma.subjectBusiness.findFirst({
    where: { id: subjectId, memberId },
    include: { areasOfPurpose: { select: { id: true, name: true } } },
  });
  if (!subject) return NextResponse.redirect(new URL("/portal/plan", origin));

  const parsed = parseProgramSentence(sentence, subject.areasOfPurpose);
  const templateId = subject.areasOfPurpose.some((p) => p.id === templateFromForm)
    ? templateFromForm
    : parsed.templateId;
  if (!parsed.name) return NextResponse.redirect(new URL(`${back}?error=build`, origin));

  let verb: string | null = null;
  let noun: string | null = null;
  let object: string | null = null;
  let objective: string | null = null;
  const raw = await completeJson(
    "Turn a program sentence into life-plan fields. Reply with JSON {\"name\",\"verb\",\"noun\",\"object\",\"objective\"}. name is a short label. Keep each field under 12 words.",
    sentence
  );
  let name = parsed.name;
  if (raw) {
    try {
      const fields = JSON.parse(raw) as { name?: string; verb?: string; noun?: string; object?: string; objective?: string };
      if (fields.name?.trim()) name = fields.name.trim();
      verb = fields.verb?.trim() || null;
      noun = fields.noun?.trim() || null;
      object = fields.object?.trim() || null;
      objective = fields.objective?.trim() || null;
    } catch {
      name = parsed.name;
    }
  }

  if (templateId) {
    const copied = await duplicateAreaOfPurpose(templateId, name, memberId);
    if ("error" in copied) {
      const code = copied.error === "exists" ? "exists" : "build";
      return NextResponse.redirect(new URL(`${back}?error=${code}`, origin));
    }
    if (verb || noun || object || objective) {
      await prisma.areaOfPurpose.update({
        where: { id: copied.id },
        data: {
          ...(verb ? { verb } : {}),
          ...(noun ? { noun } : {}),
          ...(object ? { object } : {}),
          ...(objective ? { objective } : {}),
        },
      });
    }
    return NextResponse.redirect(new URL(`/portal/plan/purpose/${copied.id}?copied=1`, origin));
  }

  const max = await prisma.areaOfPurpose.aggregate({
    where: { subjectBusinessId: subject.id },
    _max: { sortOrder: true },
  });
  try {
    const created = await prisma.areaOfPurpose.create({
      data: {
        subjectBusinessId: subject.id,
        name,
        verb,
        noun,
        object,
        objective,
        sortOrder: (max._max.sortOrder ?? 0) + 1,
      },
    });
    return NextResponse.redirect(new URL(`/portal/plan/purpose/${created.id}?copied=1`, origin));
  } catch (e) {
    console.error(e);
    return NextResponse.redirect(new URL(`${back}?error=build`, origin));
  }
}
