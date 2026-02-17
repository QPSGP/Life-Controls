import Link from "next/link";
import { prisma } from "@/lib/db";
import { MOVEMENT_TYPE_ORDER } from "@/lib/movement-types";
import { PrintButton } from "./PrintButton";

export const dynamic = "force-dynamic";

type Row = {
  id: string;
  subjectName: string;
  subjectOwner: string;
  areaOfPurpose: string;
  areaOfResponsibility: string;
  movementType: string | null;
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

function groupByType(rows: Row[]): Map<string, Row[]> {
  const map = new Map<string, Row[]>();
  for (const r of rows) {
    const key = r.movementType?.trim() || "Other";
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(r);
  }
  return map;
}

export default async function AdminPhysicalMovementsReportPage() {
  const movements = await prisma.physicalMovement.findMany({
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
  });

  const rows: Row[] = movements.map((m) => {
    const sub = m.areaOfResponsibility.areaOfPurpose.subjectBusiness;
    const purpose = m.areaOfResponsibility.areaOfPurpose;
    const resp = m.areaOfResponsibility;
    return {
      id: m.id,
      subjectName: sub.name,
      subjectOwner: [sub.user.firstName, sub.user.lastName].filter(Boolean).join(" ") || sub.user.email,
      areaOfPurpose: purpose.name,
      areaOfResponsibility: resp.name,
      movementType: m.movementType,
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

  const byType = groupByType(rows);
  const sectionOrder: string[] = byType.has("Other") ? [...MOVEMENT_TYPE_ORDER, "Other"] : [...MOVEMENT_TYPE_ORDER];

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

        <p className="text-neutral-500 text-sm mb-6 print:text-black">
          Sections by type (Go To, Read, Think, Write, Call, Operation, Arithmetic, Design/Art, Health). D = Date Specific, R = Rolls over. All PM fields shown.
        </p>

        {rows.length === 0 ? (
          <p className="text-neutral-500 text-sm">No physical movements in the database yet.</p>
        ) : (
          <section className="space-y-8" aria-label="Physical movements by type">
            {sectionOrder.map((typeName) => {
              const sectionRows = byType.get(typeName);
              if (!sectionRows?.length) return null;
              return (
                <div key={typeName}>
                  <h2 className="text-lg font-medium text-neutral-200 mb-3 print:text-black print:border-b print:border-gray-300 print:pb-1">
                    {typeName}
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
                            <td className="py-2 pr-2 print:py-1 print:text-gray-700">{r.scheduledDate ? r.scheduledDate.toLocaleDateString() : "—"}</td>
                            <td className="py-2 pr-2 print:py-1 print:text-gray-700">{r.scheduledTime || "—"}</td>
                            <td className="py-2 pr-2 print:py-1 print:text-gray-700" title={r.dateOrRollover === "D" ? "Date Specific" : r.dateOrRollover === "R" ? "Rolls over" : ""}>{r.dateOrRollover || "—"}</td>
                            <td className="py-2 pr-2 print:py-1">
                              {r.done ? <span className="text-emerald-400 print:text-green-700">Yes</span> : <span className="text-amber-500 print:text-amber-700">No</span>}
                            </td>
                            <td className="py-2 pr-2 print:py-1 print:text-gray-700">{r.doneAt ? r.doneAt.toLocaleDateString() : "—"}</td>
                            <td className="py-2 pr-2 print:py-1 print:text-gray-700">{r.doneAt ? r.doneAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}</td>
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
}
