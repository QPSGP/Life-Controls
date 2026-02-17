import { redirect } from "next/navigation";
import Link from "next/link";
import { getMemberIdFromCookie } from "@/lib/member-auth";
import { prisma } from "@/lib/db";
import { MOVEMENT_TYPE_ORDER } from "@/lib/movement-types";
import { SchedulePrintButton } from "./SchedulePrintButton";

export const dynamic = "force-dynamic";

type ScheduleRow = {
  subjectName: string;
  areaOfPurpose: string;
  areaOfResponsibility: string;
  task: string;
  objective: string;
  results: string;
  done: boolean;
  doneAt: Date | null;
  movementType: string | null;
};

function groupByType(rows: ScheduleRow[]): Map<string, ScheduleRow[]> {
  const map = new Map<string, ScheduleRow[]>();
  for (const r of rows) {
    const key = r.movementType?.trim() || "Other";
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(r);
  }
  return map;
}

export default async function PortalSchedulePage() {
  const memberId = await getMemberIdFromCookie();
  if (!memberId) redirect("/login");

  const movements = await prisma.physicalMovement.findMany({
    where: {
      areaOfResponsibility: {
        areaOfPurpose: {
          subjectBusiness: { memberId },
        },
      },
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

  const rows: ScheduleRow[] = movements.map((m) => {
    const sub = m.areaOfResponsibility.areaOfPurpose.subjectBusiness;
    const purpose = m.areaOfResponsibility.areaOfPurpose;
    const resp = m.areaOfResponsibility;
    const task = [m.verb, m.noun, m.object].filter(Boolean).join(" ") || "—";
    return {
      subjectName: sub.name,
      areaOfPurpose: purpose.name,
      areaOfResponsibility: resp.name,
      task,
      objective: m.objective ?? "",
      results: m.results ?? "",
      done: m.done,
      doneAt: m.doneAt,
      movementType: m.movementType,
    };
  });

  const byType = groupByType(rows);
  const sectionOrder: string[] = byType.has("Other") ? [...MOVEMENT_TYPE_ORDER, "Other"] : [...MOVEMENT_TYPE_ORDER];

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 p-6 print:bg-white print:text-black">
      <div className="max-w-3xl mx-auto print:max-w-none">
        <header className="flex items-center justify-between border-b border-neutral-800 pb-4 mb-6 print:border-black print:mb-4">
          <h1 className="text-2xl font-semibold print:text-xl">My miniday schedule</h1>
          <div className="flex items-center gap-3 print:hidden">
            <SchedulePrintButton />
            <Link href="/portal" className="text-neutral-400 hover:text-white text-sm">← My account</Link>
          </div>
          <p className="hidden print:block text-sm text-gray-600 mt-1">Activities I need to do</p>
        </header>

        {rows.length === 0 ? (
          <p className="text-neutral-500 text-sm">No activities in your plan yet. Your life plan will show here once linked.</p>
        ) : (
          <section className="schedule-list space-y-8" aria-label="Activities by type">
            {sectionOrder.map((typeName) => {
              const sectionRows = byType.get(typeName);
              if (!sectionRows?.length) return null;
              return (
                <div key={typeName}>
                  <h2 className="text-lg font-medium text-neutral-200 mb-3 print:text-black print:border-b print:border-gray-300 print:pb-1">{typeName}</h2>
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
                            {r.done ? <span className="text-emerald-400 print:text-green-700">Yes{r.doneAt ? ` ${r.doneAt.toLocaleDateString()}` : ""}</span> : <span className="text-amber-500 print:text-amber-700">To do</span>}
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
