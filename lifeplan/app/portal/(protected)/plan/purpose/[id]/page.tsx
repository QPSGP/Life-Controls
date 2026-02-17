import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getMemberIdFromCookie } from "@/lib/member-auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function PortalPurposePage({ params }: { params: Promise<{ id: string }> }) {
  const memberId = await getMemberIdFromCookie();
  if (!memberId) redirect("/login");

  const { id: areaOfPurposeId } = await params;
  const purpose = await prisma.areaOfPurpose.findFirst({
    where: {
      id: areaOfPurposeId,
      subjectBusiness: { memberId },
    },
    include: {
      areasOfResponsibility: { orderBy: { sortOrder: "asc" } },
      subjectBusiness: { select: { id: true, name: true } },
    },
  });
  if (!purpose) notFound();

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 p-6">
      <div className="max-w-2xl mx-auto">
        <header className="border-b border-neutral-800 pb-4 mb-6">
          <Link href={"/portal/plan/subject/" + purpose.subjectBusiness.id} className="text-neutral-400 hover:text-white text-sm">← {purpose.subjectBusiness.name}</Link>
          <h1 className="text-2xl font-semibold mt-2">{purpose.name}</h1>
        </header>

        <h2 className="text-lg font-medium text-neutral-300 mb-3">Areas of responsibility</h2>
        <ul className="space-y-2">
          {purpose.areasOfResponsibility.map((a) => (
            <li key={a.id} className="flex items-center justify-between py-2 px-3 rounded bg-neutral-900">
              <span>{a.name}</span>
              <Link href={"/portal/plan/responsibility/" + a.id} className="text-emerald-400 text-sm hover:underline">Physical movements →</Link>
            </li>
          ))}
          {purpose.areasOfResponsibility.length === 0 && <li className="text-neutral-500 text-sm">No areas of responsibility yet.</li>}
        </ul>
      </div>
    </main>
  );
}
