import { redirect } from "next/navigation";
import Link from "next/link";
import { getMemberIdFromCookie } from "@/lib/member-auth";
import { prisma } from "@/lib/db";
import { MOVEMENT_TYPE_ORDER } from "@/lib/movement-types";
import { SchedulePrintButton } from "./SchedulePrintButton";

export const dynamic = "force-dynamic";

const DEFAULT_VERB_ORDER = [...MOVEMENT_TYPE_ORDER, "Other"];

type ScheduleRow = {
  id: string;
  subjectName: string;
  areaOfPurpose: string;
  areaOfResponsibility: string;
  task: string;
  objective: string;
  results: string;
  done: boolean;
  doneAt: Date | null;
  verb: string | null;
  scheduledDate: Date | null;
};

/** Group by PM verb (miniday category). */
function groupByVerb(rows: ScheduleRow[]): Map<string, ScheduleRow[]> {
  const map = new Map<string, ScheduleRow[]>();
  for (const r of rows) {
    const key = r.verb?.trim() || "Other";
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(r);
  }
  return map;
}

export default async function PortalSchedulePage({
  searchParams,
}: {
  searchParams: Promise<{ verb?: string; done?: string; dateFrom?: string; dateTo?: string; error?: string }>;
}) {
  const memberId = await getMemberIdFromCookie();
  if (!memberId) redirect("/login");
  const params = await searchParams;
  const filterVerb = params.verb?.trim() || undefined;
  const filterDone = params.done === "yes" ? true : params.done === "no" ? false : undefined;
  const dateFrom = params.dateFrom ? new Date(params.dateFrom + "T00:00:00") : undefined;
  const dateTo = params.dateTo ? new Date(params.dateTo + "T23:59:59") : undefined;
  const dateFilter =
    dateFrom !== undefined && dateTo !== undefined
      ? { gte: dateFrom, lte: dateTo }
      : dateFrom !== undefined
        ? { gte: dateFrom }
        : dateTo !== undefined
          ? { lte: dateTo }
          : undefined;

  const movements = await prisma.physicalMovement.findMany({
    where: {
      areaOfResponsibility: {
        areaOfPurpose: {
          subjectBusiness: { memberId },
        },
      },
      ...(filterVerb !== undefined && filterVerb !== "" && { verb: filterVerb }),
      ...(filterDone !== undefined && { done: filterDone }),
      ...(dateFilter !== undefined && { scheduledDate: dateFilter }),
    },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    include: {
      areaOfResponsibility: {
        include: {
          areaOfPurpose: {
            include: {
              subjectBusiness: { select: { name: true } },
            },
          },
        },
      },
    },
  });

  let categories: { name: string; active: boolean; sortOrder: number }[] = [];
  try {
    if ("minidayCategory" in prisma && typeof (prisma as { minidayCategory?: { findMany: (opts: unknown) => Promise<{ name: string; active: boolean; sortOrder: number }[]> } }).minidayCategory?.findMany === "function") {
      categories = await (prisma as { minidayCategory: { findMany: (opts: unknown) => Promise<{ name: string; active: boolean; sortOrder: number }[]> } }).minidayCategory.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] });
    }
  } catch {
    // Prisma client may not include MinidayCategory yet
  }
  if (categories.length === 0) {
    categories = DEFAULT_VERB_ORDER.slice(0, -1).map((name, i) => ({ name, active: true, sortOrder: i }));
  }

  const rows: ScheduleRow[] = movements.map((m) => {
    const sub = m.areaOfResponsibility.areaOfPurpose.subjectBusiness;
    const purpose = m.areaOfResponsibility.areaOfPurpose;
    const resp = m.areaOfResponsibility;
    const task = [m.verb, m.noun, m.object].filter(Boolean).join(" ") || "—";
    return {
      id: m.id,
      subjectName: sub.name,
      areaOfPurpose: purpose.name,
      areaOfResponsibility: resp.name,
      task,
      objective: m.objective ?? "",
      results: m.results ?? "",
      done: m.done,
      doneAt: m.doneAt,
      verb: m.verb,
      scheduledDate: m.scheduledDate,
    };
  });

  const categoryOrder = [
    ...categories.filter((c) => c.active).map((c) => c.name),
    ...categories.filter((c) => !c.active).map((c) => c.name),
    "Other",
  ];
  const byVerb = groupByVerb(rows);
  const sectionOrder = [
    ...categoryOrder.filter((k) => byVerb.has(k)),
    ...[...byVerb.keys()].filter((k) => !categoryOrder.includes(k)),
  ];

  const verbOptions: string[] = [...new Set(rows.map((r) => r.verb).filter((v): v is string => typeof v === "string" && v.length > 0))].sort();

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 p-6 print:bg-white print:text-black">
      <div className="max-w-3xl mx-auto print:max-w-none">
        <header className="flex items-center justify-between border-b border-neutral-800 pb-4 mb-6 print:border-black print:mb-4">
          <h1 className="text-2xl font-semibold print:text-xl">My miniday schedule <span className="text-neutral-400 font-normal text-lg">(Live PM)</span></h1>
          <div className="flex items-center gap-3 print:hidden">
            <SchedulePrintButton />
            <Link href="/portal" className="text-neutral-400 hover:text-white text-sm">← My account</Link>
          </div>
          <p className="hidden print:block text-sm text-gray-600 mt-1">Activities I need to do</p>
        </header>

        {params.error === "unauthorized" && <p className="text-amber-500 text-sm mb-4">You can only update tasks in your own plan.</p>}
        {params.error === "update" && <p className="text-amber-500 text-sm mb-4">Update failed. Try again.</p>}

        <div className="mb-6 print:hidden flex flex-wrap gap-3 items-end">
          <form method="GET" className="flex flex-wrap gap-2 items-end">
            <input type="hidden" name="verb" value={params.verb ?? ""} />
            <input type="hidden" name="dateFrom" value={params.dateFrom ?? ""} />
            <input type="hidden" name="dateTo" value={params.dateTo ?? ""} />
            <label className="text-sm text-neutral-400">Done</label>
            <select name="done" onChange={(e) => e.currentTarget.form?.submit()} className="rounded bg-neutral-800 px-2 py-1.5 text-white border border-neutral-700 text-sm" defaultValue={params.done ?? "all"}>
              <option value="all">All</option>
              <option value="no">To do</option>
              <option value="yes">Done</option>
            </select>
          </form>
          {verbOptions.length > 0 && (
            <form method="GET" className="flex flex-wrap gap-2 items-end">
              <input type="hidden" name="done" value={params.done ?? ""} />
              <input type="hidden" name="dateFrom" value={params.dateFrom ?? ""} />
              <input type="hidden" name="dateTo" value={params.dateTo ?? ""} />
              <label className="text-sm text-neutral-400">Verb</label>
              <select name="verb" onChange={(e) => e.currentTarget.form?.submit()} className="rounded bg-neutral-800 px-2 py-1.5 text-white border border-neutral-700 text-sm" defaultValue={params.verb ?? ""}>
                <option value="">All</option>
                {verbOptions.map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </form>
          )}
          <form method="GET" className="flex flex-wrap gap-2 items-end">
            <input type="hidden" name="verb" value={params.verb ?? ""} />
            <input type="hidden" name="done" value={params.done ?? ""} />
            <label className="text-sm text-neutral-400">From</label>
            <input type="date" name="dateFrom" defaultValue={params.dateFrom ?? ""} onChange={(e) => e.currentTarget.form?.submit()} className="rounded bg-neutral-800 px-2 py-1.5 text-white border border-neutral-700 text-sm" />
            <label className="text-sm text-neutral-400">To</label>
            <input type="date" name="dateTo" defaultValue={params.dateTo ?? ""} onChange={(e) => e.currentTarget.form?.submit()} className="rounded bg-neutral-800 px-2 py-1.5 text-white border border-neutral-700 text-sm" />
            <button type="submit" className="rounded bg-neutral-700 px-2 py-1.5 text-sm text-white hover:bg-neutral-600">Apply</button>
          </form>
          {(params.verb || params.done || params.dateFrom || params.dateTo) && (
            <Link href="/portal/schedule" className="text-neutral-400 text-sm hover:text-white">Clear filters</Link>
          )}
        </div>

        {rows.length === 0 ? (
          <div className="rounded-lg bg-neutral-900 p-6 text-center">
            <p className="text-neutral-500 text-sm">
              {movements.length === 0 && !filterVerb && filterDone === undefined && !dateFrom && !dateTo
                ? "No activities in your plan yet. Your life plan will show here once linked."
                : "No activities match the current filters. Try clearing filters."}
            </p>
            {(params.verb || params.done || params.dateFrom || params.dateTo) && (
              <Link href="/portal/schedule" className="inline-block mt-3 text-emerald-400 text-sm hover:underline">Clear filters</Link>
            )}
          </div>
        ) : (
          <section className="schedule-list space-y-8" aria-label="Activities by verb">
            {sectionOrder.map((verbName) => {
              const sectionRows = byVerb.get(verbName);
              if (!sectionRows?.length) return null;
              return (
                <div key={verbName}>
                  <h2 className="text-lg font-medium text-neutral-200 mb-3 print:text-black print:border-b print:border-gray-300 print:pb-1">{verbName}</h2>
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-neutral-700 text-left text-neutral-400 print:border-black">
                        <th className="py-2 pr-3 print:py-1">Subject</th>
                        <th className="py-2 pr-3 print:py-1">Area of purpose</th>
                        <th className="py-2 pr-3 print:py-1">Area of responsibility</th>
                        <th className="py-2 pr-3 print:py-1">Activity / task</th>
                        <th className="py-2 pr-3 print:py-1 w-20">Done</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sectionRows.map((r, i) => (
                        <tr key={i} className="border-b border-neutral-800 print:border-gray-300">
                          <td className="py-2 pr-3 print:py-1 print:text-black">{r.subjectName}</td>
                          <td className="py-2 pr-3 text-neutral-300 print:py-1 print:text-gray-800">{r.areaOfPurpose}</td>
                          <td className="py-2 pr-3 text-neutral-300 print:py-1 print:text-gray-800">{r.areaOfResponsibility}</td>
                          <td className="py-2 pr-3 print:py-1 print:text-black">
                            {r.task}
                            {r.objective && <span className="block text-neutral-500 text-xs mt-0.5 print:text-gray-600">{r.objective}</span>}
                          </td>
                          <td className="py-2 pr-3 print:py-1">
                            {r.done ? (
                              <>
                                <span className="text-emerald-400 print:text-green-700">Yes{r.doneAt ? ` ${r.doneAt.toLocaleDateString()}` : ""}</span>
                                <form action={`/api/portal/life-plan/physical-movement/${r.id}/done`} method="POST" className="inline ml-2 print:hidden">
                                  <input type="hidden" name="done" value="false" />
                                  <button type="submit" className="text-neutral-400 text-xs hover:text-white underline">Undo</button>
                                </form>
                              </>
                            ) : (
                              <form action={`/api/portal/life-plan/physical-movement/${r.id}/done`} method="POST" className="inline print:hidden">
                                <input type="hidden" name="done" value="true" />
                                <button type="submit" className="rounded px-2 py-1 text-xs bg-emerald-700 text-white hover:bg-emerald-600">Mark done</button>
                              </form>
                            )}
                            {r.done && <span className="print:inline hidden text-green-700">Yes{r.doneAt ? ` ${r.doneAt.toLocaleDateString()}` : ""}</span>}
                            {!r.done && <span className="print:inline hidden text-amber-700">To do</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })}
          </section>
        )}

        <p className="mt-6 text-center text-neutral-500 text-sm print:hidden">
          <Link href="/portal/plan" className="text-emerald-400 hover:underline">View my plan</Link>
          {" · "}
          <Link href="/portal" className="text-emerald-400 hover:underline">My account</Link>
        </p>
      </div>
    </main>
  );
}
