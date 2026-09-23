export type DayItem = {
  id: string;
  verb: string | null;
  noun: string | null;
  object: string | null;
  scheduledTime: string | null;
  overdue: boolean;
  purpose: string;
  responsibility: string;
};

export function itemLabel(item: DayItem): string {
  const parts = [item.verb, item.noun, item.object].filter((p) => p && p.trim());
  return parts.join(" ") || "Open item";
}

/** Overdue first, then calls, then earlier times. */
export function sortDayItems(items: DayItem[]): DayItem[] {
  return [...items].sort((a, b) => {
    if (a.overdue !== b.overdue) return a.overdue ? -1 : 1;
    const aCall = (a.verb || "").toLowerCase() === "call" ? 0 : 1;
    const bCall = (b.verb || "").toLowerCase() === "call" ? 0 : 1;
    if (aCall !== bCall) return aCall - bCall;
    return (a.scheduledTime || "99:99").localeCompare(b.scheduledTime || "99:99");
  });
}

export function ruleBrief(items: DayItem[]): string {
  if (items.length === 0) {
    return "Nothing is due. Rollover work shows up here each morning.";
  }
  const first = items[0];
  const calls = items.filter((i) => (i.verb || "").toLowerCase() === "call").length;
  const overdue = items.filter((i) => i.overdue).length;
  const bits = [`${items.length} open.`];
  if (overdue) bits.push(`${overdue} rolled over from an earlier day.`);
  bits.push(`Start with ${itemLabel(first)}.`);
  if (calls) bits.push(`${calls} call${calls === 1 ? "" : "s"} in the list.`);
  return bits.join(" ");
}

export function applyModelOrder(items: DayItem[], ids: string[]): DayItem[] {
  const byId = new Map(items.map((item) => [item.id, item]));
  const ordered: DayItem[] = [];
  for (const id of ids) {
    const item = byId.get(id);
    if (item) {
      ordered.push(item);
      byId.delete(id);
    }
  }
  for (const item of items) {
    if (byId.has(item.id)) ordered.push(item);
  }
  return ordered;
}
