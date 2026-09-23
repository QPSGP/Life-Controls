import { prisma } from "@/lib/db";

export type DuplicateResult =
  | { id: string }
  | { error: "missing" | "name" | "exists" };

/** Copy an area of purpose, its responsibilities, and its physical movements. Done flags start fresh. */
export async function duplicateAreaOfPurpose(
  purposeId: string,
  newName: string,
  memberId?: string
): Promise<DuplicateResult> {
  const name = newName.trim();
  if (!name) return { error: "name" };

  const purpose = await prisma.areaOfPurpose.findFirst({
    where: {
      id: purposeId,
      ...(memberId ? { subjectBusiness: { memberId } } : {}),
    },
    include: {
      areasOfResponsibility: {
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        include: {
          physicalMovements: { orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] },
        },
      },
    },
  });
  if (!purpose) return { error: "missing" };

  const clash = await prisma.areaOfPurpose.findFirst({
    where: { subjectBusinessId: purpose.subjectBusinessId, name },
  });
  if (clash) return { error: "exists" };

  const max = await prisma.areaOfPurpose.aggregate({
    where: { subjectBusinessId: purpose.subjectBusinessId },
    _max: { sortOrder: true },
  });

  const created = await prisma.$transaction(async (tx) => {
    const copy = await tx.areaOfPurpose.create({
      data: {
        subjectBusinessId: purpose.subjectBusinessId,
        name,
        verb: purpose.verb,
        noun: purpose.noun,
        object: purpose.object,
        objective: purpose.objective,
        sortOrder: (max._max.sortOrder ?? 0) + 1,
      },
    });

    for (const resp of purpose.areasOfResponsibility) {
      const createdResp = await tx.areaOfResponsibility.create({
        data: {
          areaOfPurposeId: copy.id,
          name: resp.name,
          verb: resp.verb,
          noun: resp.noun,
          object: resp.object,
          objective: resp.objective,
          sortOrder: resp.sortOrder,
        },
      });
      if (resp.physicalMovements.length > 0) {
        await tx.physicalMovement.createMany({
          data: resp.physicalMovements.map((pm) => ({
            areaOfResponsibilityId: createdResp.id,
            movementType: pm.movementType,
            verb: pm.verb,
            noun: pm.noun,
            object: pm.object,
            objective: pm.objective,
            scheduledDate: pm.scheduledDate,
            scheduledTime: pm.scheduledTime,
            dateOrRollover: pm.dateOrRollover,
            done: false,
            sortOrder: pm.sortOrder,
          })),
        });
      }
    }
    return copy;
  });

  return { id: created.id };
}
