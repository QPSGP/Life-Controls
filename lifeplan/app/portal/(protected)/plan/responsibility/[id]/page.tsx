import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getMemberIdFromCookie } from "@/lib/member-auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function PortalResponsibilityPage({ params }: { params: Promise<{ id: string }> }) {
  const memberId = await getMemberIdFromCookie();
  if (!memberId) redirect("/login");

  const { id: areaOfResponsibilityId } = await params;
  const responsibility = await prisma.areaOfResponsibility.findFirst({
    where: {
      id: areaOfResponsibilityId,
      areaOfPurpose: { subjectBusiness: { memberId } },
    },
    include: {
      physicalMovements: { orderBy: [{ done: "asc" }, { sortOrder: "asc" }] },
      areaOfPurpose: { include: { subjectBusiness: { select: { id: true, name: true } } } },
    },
  });
  if (!responsibility) notFound();

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 p-6">
      <div className="max-w-2xl mx-auto">
        <header className="border-b border-neutral-800 pb-4 mb-6">
          <Link href={"/portal/plan/purpose/" + responsibility.areaOfPurpose.id} className="text-neutral-400 hover:text-white text-sm">← {responsibility.areaOfPurpose.name}</Link>
          <h1 className="text-2xl font-semibold mt-2">{responsibility.name}</h1>
        </header>

        <h2 className="text-lg font-medium text-neutral-300 mb-3">Physical movements</h2>
        <ul className="space-y-2">
          {responsibility.physicalMovements.map((m) => (
            <li key={m.id} className="py-2 px-3 rounded bg-neutral-900 text-sm">
              <span className={m.done ? "text-neutral-500 line-through" : ""}>
                {[m.verb, m.noun, m.object].filter(Boolean).join(" ") || "(no verb/noun/object)"}
              </span>
              {m.objective && <span className="text-neutral-500 block">Objective: {m.objective}</span>}
              {m.results && <span className="text-neutral-500 block">Results: {m.results}</span>}
              {m.done && <span className="text-emerald-500 text-xs">Done</span>}
            </li>
          ))}
          {responsibility.physicalMovements.length === 0 && <li className="text-neutral-500 text-sm">No physical movements yet.</li>}
        </ul>
      </div>
    </main>
  );
}
