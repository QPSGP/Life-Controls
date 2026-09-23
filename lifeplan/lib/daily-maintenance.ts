import { prisma } from "@/lib/db";
import { startOfTodayUtc } from "@/lib/calendar";

export type MaintenanceResult = {
  rolled: number;
  reopened: number;
  pastDue: number;
};

/**
 * Bring rollover (R) movements onto today and mark open invoices past their due date.
 * Pass memberId to limit the work to one portal account (safe to run on each visit).
 */
export async function runDailyMaintenance(memberId?: string): Promise<MaintenanceResult> {
  const today = startOfTodayUtc();
  const movementScope = memberId
    ? { areaOfResponsibility: { areaOfPurpose: { subjectBusiness: { memberId } } } }
    : {};

  const rolled = await prisma.physicalMovement.updateMany({
    where: {
      dateOrRollover: "R",
      done: false,
      OR: [{ scheduledDate: null }, { scheduledDate: { lt: today } }],
      ...movementScope,
    },
    data: { scheduledDate: today },
  });

  const reopened = await prisma.physicalMovement.updateMany({
    where: {
      dateOrRollover: "R",
      done: true,
      scheduledDate: { lt: today },
      ...movementScope,
    },
    data: { scheduledDate: today, done: false, doneAt: null },
  });

  const pastDue = await prisma.invoice.updateMany({
    where: {
      status: "open",
      dueDate: { lt: today },
      ...(memberId ? { memberId } : {}),
    },
    data: { status: "past_due" },
  });

  return { rolled: rolled.count, reopened: reopened.count, pastDue: pastDue.count };
}

export type TodayCall = {
  id: string;
  noun: string | null;
  object: string | null;
  objective: string | null;
  scheduledTime: string | null;
  purpose: string;
  responsibility: string;
};

/** Undone Call movements due today or earlier, after rollover has run. */
export async function todaysCalls(memberId: string): Promise<TodayCall[]> {
  const today = startOfTodayUtc();
  const end = new Date(today.getTime() + 24 * 60 * 60 * 1000);
  const rows = await prisma.physicalMovement.findMany({
    where: {
      done: false,
      verb: { equals: "Call", mode: "insensitive" },
      OR: [{ scheduledDate: null }, { scheduledDate: { lt: end } }],
      areaOfResponsibility: { areaOfPurpose: { subjectBusiness: { memberId } } },
    },
    orderBy: [{ scheduledTime: "asc" }, { sortOrder: "asc" }],
    take: 12,
    include: {
      areaOfResponsibility: {
        select: { name: true, areaOfPurpose: { select: { name: true } } },
      },
    },
  });
  return rows.map((r) => ({
    id: r.id,
    noun: r.noun,
    object: r.object,
    objective: r.objective,
    scheduledTime: r.scheduledTime,
    purpose: r.areaOfResponsibility.areaOfPurpose.name,
    responsibility: r.areaOfResponsibility.name,
  }));
}
