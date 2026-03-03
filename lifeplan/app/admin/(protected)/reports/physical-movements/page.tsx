import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { MOVEMENT_TYPE_ORDER } from "@/lib/movement-types";
import { PrintButton } from "./PrintButton";

export const dynamic = "force-dynamic";

const DEFAULT_VERB_ORDER = [...MOVEMENT_TYPE_ORDER, "Other"];

async function reportPageDoneAction(formData: FormData) {
  "use server";
  const id = (formData.get("id") as string)?.trim();
  const done = formData.get("done") === "true";
  const returnQuery = (formData.get("returnQuery") as string)?.trim() || "";
  if (!id) {
    redirect("/admin/reports/physical-movements");
  }
  try {
    await prisma.physicalMovement.update({
      where: { id },
      data: { done, doneAt: done ? new Date() : null },
    });
  } catch {
    redirect("/admin/life-plan?error=update");
  }
  redirect("/admin/reports/physical-movements" + (returnQuery ? "?" + returnQuery : ""));
}

type Row = {
  id: string;
  subjectName: string;
  subjectOwner: string;
  areaOfPurpose: string;
  areaOfResponsibility: string;
  verb: string;
  noun: string;
  object: string;
  objective: string;
  results: string;
  scheduledDate: Date | null;
  scheduledTime: string | null;
  dateOrRollover: string | null; // D = Date Specific, R = Rolls over
  done: boolean;
  doneAt: Date | null;
};

/** Group by PM verb (miniday category). */
function groupByVerb(rows: Row[]): Map<string, Row[]> {
  const map = new Map<string, Row[]>();
  for (const r of rows) {
    const key = r.verb?.trim() || "Other";
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(r);
  }
  return map;
}

export default async function AdminPhysicalMovementsReportPage(props: {
  searchParams?: Promise<{ subjectId?: string; memberId?: string; dateFrom?: string; dateTo?: string; verb?: string; done?: string }> | { subjectId?: string; memberId?: string; dateFrom?: string; dateTo?: string; verb?: string; done?: string };
}) {
  let params: { subjectId?: string; memberId?: string; dateFrom?: string; dateTo?: string; verb?: string; done?: string } = {};
  try {
    const raw = props.searchParams;
    params = raw && typeof (raw as Promise<unknown>)?.then === "function" ? await (raw as Promise<typeof params>) : (raw ?? {}) as typeof params;
  } catch {
    params = {};
  }
  const subjectId = params.subjectId?.trim() || undefined;
  const memberId = params.memberId?.trim() || undefined;
  const dateFrom = params.dateFrom ? new Date(params.dateFrom + "T00:00:00") : undefined;
  const dateTo = params.dateTo ? new Date(params.dateTo + "T23:59:59") : undefined;
  const filterVerb = params.verb?.trim() || undefined;
  const filterDone = params.done === "yes" ? true : params.done === "no" ? false : undefined;
  const dateFilter =
    dateFrom !== undefined && dateTo !== undefined
      ? { gte: dateFrom, lte: dateTo }
      : dateFrom !== undefined
        ? { gte: dateFrom }
        : dateTo !== undefined
          ? { lte: dateTo }
          : undefined;

  let movements: Array<{
    id: string;
    verb: string | null;
    noun: string | null;
    object: string | null;
    objective: string | null;
    results: string | null;
    scheduledDate: Date | null;
    scheduledTime: string | null;
    dateOrRollover: string | null;
    done: boolean;
    doneAt: Date | null;
    areaOfResponsibility: {
      name: string;
      areaOfPurpose: {
        name: string;
        subjectBusiness: {
          name: string;
          user: { firstName: string | null; lastName: string | null; email: string } | null;
        };
      };
    };
  }>;
  let subjects: { id: string; name: string }[];
  let members: { id: string; email: string; firstName: string | null; lastName: string | null }[];

  try {
    const result = await Promise.all([
      prisma.physicalMovement.findMany({
        where: {
          ...(subjectId && {
            areaOfResponsibility: {
              areaOfPurpose: { subjectBusinessId: subjectId },
            },
          }),
          ...(memberId && {
            areaOfResponsibility: {
              areaOfPurpose: {
                subjectBusiness: { memberId },
              },
            },
          }),
          ...(filterVerb && filterVerb !== "" && { verb: filterVerb }),
          ...(filterDone !== undefined && { done: filterDone }),
          ...(dateFilter !== undefined && { scheduledDate: dateFilter }),
        },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        include: {
          areaOfResponsibility: {
            include: {
              areaOfPurpose: {
                include: {
                  subjectBusiness: {
                    include: { user: { select: { firstName: true, lastName: true, email: true } } },
                  },
                },
              },
            },
          },
        },
      }),
      prisma.subjectBusiness.findMany({
        orderBy: { sortOrder: "asc" },
        select: { id: true, name: true },
      }),
      prisma.member.findMany({
        orderBy: { createdAt: "desc" },
        take: 100,
        select: { id: true, email: true, firstName: true, lastName: true },
      }),
    ]);
    movements = result[0];
    subjects = result[1];
    members = result[2];
  } catch (err) {
    console.error("Live PM report data fetch error:", err);
    return (
      <main className="min-h-screen bg-neutral-950 text-neutral-100 p-6">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-xl font-semibold mb-4">Report of all physical movements</h1>
          <div className="rounded-lg bg-amber-950/50 border border-amber-800 p-4 text-amber-200 text-sm">
            <p className="font-medium">Could not load the report.</p>
            <p className="mt-2">This is often due to the production database schema not matching the app (e.g. missing tables or columns). Run <code className="bg-neutral-800 px-1">npx prisma db push</code> against the production database, then redeploy.</p>
            <p className="mt-3">
              <a href="/api/db-status" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">Open /api/db-status</a> to confirm the database connection and basic tables.
            </p>
            <p className="mt-2">
              <Link href="/admin/reports" className="text-emerald-400 hover:underline">← Back to Reports</Link>
            </p>
          </div>
        </div>
      </main>
    );
  }

  function renderError(msg: string) {
    return (
      <main className="min-h-screen bg-neutral-950 text-neutral-100 p-6">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-xl font-semibold mb-4">Report of all physical movements</h1>
          <div className="rounded-lg bg-amber-950/50 border border-amber-800 p-4 text-amber-200 text-sm">
            <p className="font-medium">{msg}</p>
            <p className="mt-3">
              <a href="/api/db-status" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">Open /api/db-status</a>
            </p>
            <p className="mt-2">
              <Link href="/admin/reports" className="text-emerald-400 hover:underline">← Back to Reports</Link>
            </p>
          </div>
        </div>
      </main>
    );
  }

  try {
  let categories: { name: string; active: boolean; sortOrder: number }[] = [];
  try {
    if ("minidayCategory" in prisma && typeof (prisma as { minidayCategory?: { findMany: (opts: unknown) => Promise<{ name: string; active: boolean; sortOrder: number }[]> } }).minidayCategory?.findMany === "function") {
      categories = await (prisma as { minidayCategory: { findMany: (opts: unknown) => Promise<{ name: string; active: boolean; sortOrder: number }[]> } }).minidayCategory.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] });
    }
  } catch {
    // Prisma client may not include MinidayCategory yet (run npx prisma generate)
  }
  if (categories.length === 0) {
    categories = DEFAULT_VERB_ORDER.slice(0, -1).map((name, i) => ({ name, active: true, sortOrder: i }));
  }

  const rows: Row[] = movements.map((m) => {
    const resp = m.areaOfResponsibility;
    const purpose = resp?.areaOfPurpose;
    const sub = purpose?.subjectBusiness;
    if (!resp || !purpose || !sub) {
      return {
        id: m.id,
        subjectName: "—",
        subjectOwner: "—",
        areaOfPurpose: "—",
        areaOfResponsibility: "—",
        verb: m.verb ?? "",
        noun: m.noun ?? "",
        object: m.object ?? "",
        objective: m.objective ?? "",
        results: m.results ?? "",
        scheduledDate: m.scheduledDate ?? null,
        scheduledTime: m.scheduledTime ?? null,
        dateOrRollover: m.dateOrRollover ?? null,
        done: m.done,
        doneAt: m.doneAt,
      };
    }
    const user = sub.user;
    const subjectOwner = user ? [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email : "—";
    return {
      id: m.id,
      subjectName: sub.name,
      subjectOwner,
      areaOfPurpose: purpose.name,
      areaOfResponsibility: resp.name,
      verb: m.verb ?? "",
      noun: m.noun ?? "",
      object: m.object ?? "",
      objective: m.objective ?? "",
      results: m.results ?? "",
      scheduledDate: m.scheduledDate ?? null,
      scheduledTime: m.scheduledTime ?? null,
      dateOrRollover: m.dateOrRollover ?? null,
      done: m.done,
      doneAt: m.doneAt,
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

  const verbOptions = [...new Set(rows.map((r) => r.verb).filter(Boolean))].sort();
  const hasFilters = !!(subjectId || memberId || params.dateFrom || params.dateTo || filterVerb || filterDone !== undefined);
  const q: Record<string, string> = {};
  if (params.subjectId) q.subjectId = params.subjectId;
  if (params.memberId) q.memberId = params.memberId;
  if (params.dateFrom) q.dateFrom = params.dateFrom;
  if (params.dateTo) q.dateTo = params.dateTo;
  if (params.verb) q.verb = params.verb;
  if (params.done) q.done = params.done;
  const returnQuery = new URLSearchParams(q).toString();

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 p-6 print:bg-white print:text-black">
      <div className="max-w-5xl mx-auto print:max-w-none">
        <header className="flex items-center justify-between border-b border-neutral-800 pb-4 mb-6 print:border-black print:mb-4">
          <h1 className="text-2xl font-semibold print:text-xl">Report of all physical movements</h1>
          <div className="flex items-center gap-3 print:hidden">
            <PrintButton />
            <Link href="/admin/reports" className="text-neutral-400 hover:text-white text-sm">← Reports</Link>
          </div>
          <p className="hidden print:block text-sm text-gray-600 mt-1">PM table, life plan</p>
        </header>

        <div className="mb-6 print:hidden flex flex-wrap gap-4 items-end">
          <form method="GET" className="flex flex-wrap gap-2 items-end">
            <input type="hidden" name="memberId" value={params.memberId ?? ""} />
            <input type="hidden" name="dateFrom" value={params.dateFrom ?? ""} />
            <input type="hidden" name="dateTo" value={params.dateTo ?? ""} />
            <input type="hidden" name="verb" value={params.verb ?? ""} />
            <input type="hidden" name="done" value={params.done ?? ""} />
            <label className="text-sm text-neutral-400">Subject</label>
            <select name="subjectId" onChange={(e) => e.currentTarget.form?.submit()} className="rounded bg-neutral-800 px-2 py-1.5 text-white border border-neutral-700 text-sm min-w-[140px]" defaultValue={subjectId ?? ""}>
              <option value="">All</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </form>
          <form method="GET" className="flex flex-wrap gap-2 items-end">
            <input type="hidden" name="subjectId" value={params.subjectId ?? ""} />
            <input type="hidden" name="dateFrom" value={params.dateFrom ?? ""} />
            <input type="hidden" name="dateTo" value={params.dateTo ?? ""} />
            <input type="hidden" name="verb" value={params.verb ?? ""} />
            <input type="hidden" name="done" value={params.done ?? ""} />
            <label className="text-sm text-neutral-400">Member plan</label>
            <select name="memberId" onChange={(e) => e.currentTarget.form?.submit()} className="rounded bg-neutral-800 px-2 py-1.5 text-white border border-neutral-700 text-sm min-w-[160px]" defaultValue={memberId ?? ""}>
              <option value="">All</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>{[m.firstName, m.lastName].filter(Boolean).join(" ") || m.email}</option>
              ))}
            </select>
          </form>
          {verbOptions.length > 0 && (
            <form method="GET" className="flex flex-wrap gap-2 items-end">
              <input type="hidden" name="subjectId" value={params.subjectId ?? ""} />
              <input type="hidden" name="memberId" value={params.memberId ?? ""} />
              <input type="hidden" name="dateFrom" value={params.dateFrom ?? ""} />
              <input type="hidden" name="dateTo" value={params.dateTo ?? ""} />
              <input type="hidden" name="done" value={params.done ?? ""} />
              <label className="text-sm text-neutral-400">Verb</label>
              <select name="verb" onChange={(e) => e.currentTarget.form?.submit()} className="rounded bg-neutral-800 px-2 py-1.5 text-white border border-neutral-700 text-sm" defaultValue={filterVerb ?? ""}>
                <option value="">All</option>
                {verbOptions.map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </form>
          )}
          <form method="GET" className="flex flex-wrap gap-2 items-end">
            <input type="hidden" name="subjectId" value={params.subjectId ?? ""} />
            <input type="hidden" name="memberId" value={params.memberId ?? ""} />
            <input type="hidden" name="verb" value={params.verb ?? ""} />
            <input type="hidden" name="done" value={params.done ?? ""} />
            <label className="text-sm text-neutral-400">Done</label>
            <select name="done" onChange={(e) => e.currentTarget.form?.submit()} className="rounded bg-neutral-800 px-2 py-1.5 text-white border border-neutral-700 text-sm" defaultValue={params.done ?? "all"}>
              <option value="all">All</option>
              <option value="no">To do</option>
              <option value="yes">Done</option>
            </select>
          </form>
          <form method="GET" className="flex flex-wrap gap-2 items-end">
            <input type="hidden" name="subjectId" value={params.subjectId ?? ""} />
            <input type="hidden" name="memberId" value={params.memberId ?? ""} />
            <input type="hidden" name="verb" value={params.verb ?? ""} />
            <input type="hidden" name="done" value={params.done ?? ""} />
            <label className="text-sm text-neutral-400">From</label>
            <input type="date" name="dateFrom" defaultValue={params.dateFrom ?? ""} className="rounded bg-neutral-800 px-2 py-1.5 text-white border border-neutral-700 text-sm" />
            <label className="text-sm text-neutral-400">To</label>
            <input type="date" name="dateTo" defaultValue={params.dateTo ?? ""} className="rounded bg-neutral-800 px-2 py-1.5 text-white border border-neutral-700 text-sm" />
            <button type="submit" className="rounded bg-neutral-700 px-2 py-1.5 text-sm text-white hover:bg-neutral-600">Apply</button>
          </form>
          {hasFilters && (
            <Link href="/admin/reports/physical-movements" className="text-neutral-400 text-sm hover:text-white">Clear filters</Link>
          )}
        </div>

        <p className="text-neutral-500 text-sm mb-6 print:text-black">
          Sections by PM verb (miniday category). D = Date Specific, R = Rolls over. All PM fields shown.
        </p>

        {rows.length === 0 ? (
          <p className="text-neutral-500 text-sm">No physical movements in the database yet.</p>
        ) : (
          <section className="space-y-8" aria-label="Physical movements by verb">
            {sectionOrder.map((verbName) => {
              const sectionRows = byVerb.get(verbName);
              if (!sectionRows?.length) return null;
              return (
                <div key={verbName}>
                  <h2 className="text-lg font-medium text-neutral-200 mb-3 print:text-black print:border-b print:border-gray-300 print:pb-1">
                    {verbName}
                  </h2>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="border-b border-neutral-700 text-left text-neutral-400 print:border-black">
                          <th className="py-2 pr-2 print:py-1 whitespace-nowrap">Subject</th>
                          <th className="py-2 pr-2 print:py-1 whitespace-nowrap">Area of purpose</th>
                          <th className="py-2 pr-2 print:py-1 whitespace-nowrap">Area of responsibility</th>
                          <th className="py-2 pr-2 print:py-1">Verb</th>
                          <th className="py-2 pr-2 print:py-1">PM NOUN</th>
                          <th className="py-2 pr-2 print:py-1">PM OBJECT</th>
                          <th className="py-2 pr-2 print:py-1 min-w-[120px]">Objective</th>
                          <th className="py-2 pr-2 print:py-1">Results</th>
                          <th className="py-2 pr-2 print:py-1 whitespace-nowrap">DATE</th>
                          <th className="py-2 pr-2 print:py-1 whitespace-nowrap">TIME</th>
                          <th className="py-2 pr-2 print:py-1 whitespace-nowrap">D/R</th>
                          <th className="py-2 pr-2 print:py-1 w-14">DONE?</th>
                          <th className="py-2 pr-2 print:py-1 whitespace-nowrap">DDATE</th>
                          <th className="py-2 pr-2 print:py-1 whitespace-nowrap">DTIME</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sectionRows.map((r) => (
                          <tr key={r.id} className="border-b border-neutral-800 print:border-gray-300">
                            <td className="py-2 pr-2 print:py-1 print:text-black">{r.subjectName}</td>
                            <td className="py-2 pr-2 print:py-1 print:text-black">{r.areaOfPurpose}</td>
                            <td className="py-2 pr-2 print:py-1 print:text-black">{r.areaOfResponsibility}</td>
                            <td className="py-2 pr-2 print:py-1 print:text-black">{r.verb || "—"}</td>
                            <td className="py-2 pr-2 print:py-1 print:text-black">{r.noun || "—"}</td>
                            <td className="py-2 pr-2 print:py-1 print:text-black">{r.object || "—"}</td>
                            <td className="py-2 pr-2 text-neutral-300 print:py-1 print:text-gray-800 max-w-[160px]">{r.objective || "—"}</td>
                            <td className="py-2 pr-2 text-neutral-400 print:py-1 print:text-gray-700">{r.results || "—"}</td>
                            <td className="py-2 pr-2 print:py-1 print:text-gray-700">{r.scheduledDate instanceof Date && !Number.isNaN(r.scheduledDate.getTime()) ? r.scheduledDate.toLocaleDateString() : "—"}</td>
                            <td className="py-2 pr-2 print:py-1 print:text-gray-700">{r.scheduledTime || "—"}</td>
                            <td className="py-2 pr-2 print:py-1 print:text-gray-700" title={r.dateOrRollover === "D" ? "Date Specific" : r.dateOrRollover === "R" ? "Rolls over" : ""}>{r.dateOrRollover || "—"}</td>
                            <td className="py-2 pr-2 print:py-1">
                              {r.done ? (
                                <>
                                  <span className="text-emerald-400 print:text-green-700">Yes</span>
                                  <form action={reportPageDoneAction} className="inline ml-1 print:hidden">
                                    <input type="hidden" name="id" value={r.id} />
                                    <input type="hidden" name="done" value="false" />
                                    <input type="hidden" name="returnQuery" value={returnQuery} />
                                    <button type="submit" className="text-neutral-400 text-xs hover:text-white underline">Undo</button>
                                  </form>
                                </>
                              ) : (
                                <form action={reportPageDoneAction} className="inline print:hidden">
                                  <input type="hidden" name="id" value={r.id} />
                                  <input type="hidden" name="done" value="true" />
                                  <input type="hidden" name="returnQuery" value={returnQuery} />
                                  <button type="submit" className="rounded px-1.5 py-0.5 text-xs bg-emerald-700 text-white hover:bg-emerald-600">Done</button>
                                </form>
                              )}
                              <span className="print:inline hidden">{r.done ? "Yes" : "No"}</span>
                            </td>
                            <td className="py-2 pr-2 print:py-1 print:text-gray-700">{r.doneAt instanceof Date && !Number.isNaN(r.doneAt.getTime()) ? r.doneAt.toLocaleDateString() : "—"}</td>
                            <td className="py-2 pr-2 print:py-1 print:text-gray-700">{r.doneAt instanceof Date && !Number.isNaN(r.doneAt.getTime()) ? r.doneAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </section>
        )}

        <p className="mt-8 text-center text-neutral-500 text-sm print:hidden">
          <a href="/api/reports/physical-movements?format=csv" className="text-emerald-400 hover:underline">Download CSV (all)</a>
          {" · "}
          <Link href="/admin/reports" className="text-emerald-400 hover:underline">← Reports</Link>
        </p>
      </div>
    </main>
  );
  } catch (err) {
    console.error("Live PM report render error:", err);
    return renderError("Something went wrong while rendering the report. Check /api/db-status and try again.");
  }
}
