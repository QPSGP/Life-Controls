import { prisma } from "@/lib/db";
import { startOfTodayUtc } from "@/lib/calendar";
import { applyModelOrder, ruleBrief, sortDayItems, type DayItem } from "@/lib/day-plan";
import { completeJson } from "@/lib/ai";

export async function loadDayItems(memberId: string): Promise<DayItem[]> {
  const today = startOfTodayUtc();
  const end = new Date(today.getTime() + 24 * 60 * 60 * 1000);
  const rows = await prisma.physicalMovement.findMany({
    where: {
      done: false,
      OR: [{ scheduledDate: null }, { scheduledDate: { lt: end } }],
      areaOfResponsibility: { areaOfPurpose: { subjectBusiness: { memberId } } },
    },
    orderBy: [{ scheduledTime: "asc" }, { sortOrder: "asc" }],
    take: 24,
    include: {
      areaOfResponsibility: {
        select: { name: true, areaOfPurpose: { select: { name: true } } },
      },
    },
  });

  const items: DayItem[] = rows.map((row) => ({
    id: row.id,
    verb: row.verb,
    noun: row.noun,
    object: row.object,
    scheduledTime: row.scheduledTime,
    overdue: row.scheduledDate != null && row.scheduledDate < today,
    purpose: row.areaOfResponsibility.areaOfPurpose.name,
    responsibility: row.areaOfResponsibility.name,
  }));
  return sortDayItems(items);
}

export async function draftDay(memberId: string): Promise<{ items: DayItem[]; brief: string; source: "schedule" | "model" }> {
  const items = await loadDayItems(memberId);
  const fallback = { items, brief: ruleBrief(items), source: "schedule" as const };
  if (items.length === 0) return fallback;

  const payload = items.map((item) => ({
    id: item.id,
    label: [item.verb, item.noun, item.object].filter(Boolean).join(" "),
    time: item.scheduledTime,
    overdue: item.overdue,
    purpose: item.purpose,
  }));
  const raw = await completeJson(
    "You order a person's day. Reply with JSON {\"brief\": string, \"order\": string[]}. brief is 2 to 4 short sentences. order is the item ids, most important first. Use only ids you were given.",
    JSON.stringify(payload)
  );
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw) as { brief?: string; order?: string[] };
    const order = Array.isArray(parsed.order) ? parsed.order.filter((id) => typeof id === "string") : [];
    const brief = typeof parsed.brief === "string" && parsed.brief.trim() ? parsed.brief.trim() : fallback.brief;
    return { items: applyModelOrder(items, order), brief, source: "model" };
  } catch {
    return fallback;
  }
}
