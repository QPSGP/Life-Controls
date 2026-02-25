import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { MOVEMENT_TYPE_ORDER } from "@/lib/movement-types";

export const dynamic = "force-dynamic";

const DEFAULT_VERB_ORDER = [...MOVEMENT_TYPE_ORDER, "Other"];

function sortRowsByVerbOrder<T>(rows: T[], getVerb: (r: T) => string | null, verbOrder: string[]): T[] {
  return [...rows].sort((a, b) => {
    const va = getVerb(a)?.trim() || "Other";
    const vb = getVerb(b)?.trim() || "Other";
    const ia = verbOrder.indexOf(va);
    const ib = verbOrder.indexOf(vb);
    const iA = ia === -1 ? verbOrder.length : ia;
    const iB = ib === -1 ? verbOrder.length : ib;
    return iA - iB || va.localeCompare(vb);
  });
}

/** GET /api/reports/physical-movements — Report of all (or completed) physical movements from the PM table / life plan. format=json|csv, done=all|yes|no */
export async function GET(req: NextRequest) {
  const format = req.nextUrl.searchParams.get("format") || "csv";
  const doneFilter = req.nextUrl.searchParams.get("done") || "all"; // all | yes | no
  const where = doneFilter === "yes" ? { done: true } : doneFilter === "no" ? { done: false } : {};
  const movements = await prisma.physicalMovement.findMany({
    where,
    orderBy: [{ areaOfResponsibilityId: "asc" }, { sortOrder: "asc" }, { createdAt: "asc" }],
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

  let categories: { name: string; active: boolean; sortOrder: number }[] = [];
  try {
    if ("minidayCategory" in prisma && typeof (prisma as { minidayCategory?: { findMany: (opts: unknown) => Promise<{ name: string; active: boolean; sortOrder: number }[]> } }).minidayCategory?.findMany === "function") {
      categories = await (prisma as { minidayCategory: { findMany: (opts: unknown) => Promise<{ name: string; active: boolean; sortOrder: number }[]> } }).minidayCategory.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] });
    }
  } catch {
    // Prisma client may not include MinidayCategory yet
  }
  const verbOrder = categories.length > 0
    ? [
        ...categories.filter((c) => c.active).map((c) => c.name),
        ...categories.filter((c) => !c.active).map((c) => c.name),
        "Other",
      ]
    : DEFAULT_VERB_ORDER;

  const rows = movements.map((m) => {
    const sub = m.areaOfResponsibility.areaOfPurpose.subjectBusiness;
    const purpose = m.areaOfResponsibility.areaOfPurpose;
    const resp = m.areaOfResponsibility;
    return {
      verb: m.verb ?? "",
      subjectName: sub.name,
      subjectOwner: [sub.user.firstName, sub.user.lastName].filter(Boolean).join(" ") || sub.user.email,
      areaOfPurpose: purpose.name,
      areaOfResponsibility: resp.name,
      noun: m.noun ?? "",
      object: m.object ?? "",
      objective: m.objective ?? "",
      results: m.results ?? "",
      scheduledDate: m.scheduledDate?.toISOString().slice(0, 10) ?? "",
      scheduledTime: m.scheduledTime ?? "",
      dateOrRollover: m.dateOrRollover ?? "",
      done: m.done,
      doneAt: m.doneAt?.toISOString().slice(0, 10) ?? "",
      doneTime: m.doneAt?.toTimeString().slice(0, 5) ?? "",
      sortOrder: m.sortOrder,
    };
  });

  const sortedRows = sortRowsByVerbOrder(rows, (r) => r.verb || null, verbOrder);

  if (format === "json") {
    return NextResponse.json({ report: "Report of all physical movements", rows: sortedRows });
  }

  const headers = [
    "Verb",
    "Subject",
    "Owner",
    "Area of purpose",
    "Area of responsibility",
    "Noun",
    "Object",
    "Objective",
    "Results",
    "DATE",
    "TIME",
    "D/R",
    "Done",
    "DDATE",
    "DTIME",
    "Sort",
  ];
  const escape = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
  const csvRows = sortedRows.map((r) =>
    [
      r.verb,
      r.subjectName,
      r.subjectOwner,
      r.areaOfPurpose,
      r.areaOfResponsibility,
      r.noun,
      r.object,
      r.objective,
      r.results,
      r.scheduledDate,
      r.scheduledTime,
      r.dateOrRollover,
      r.done ? "Yes" : "No",
      r.doneAt,
      r.doneTime,
      r.sortOrder,
    ].map(escape).join(",")
  );
  const csv = [headers.join(","), ...csvRows].join("\n");
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="report-physical-movements${doneFilter === "yes" ? "-completed" : doneFilter === "no" ? "-pending" : "-all"}.csv"`,
    },
  });
}
