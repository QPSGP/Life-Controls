import { redirect } from "next/navigation";
import Link from "next/link";
import { getMemberIdFromCookie } from "@/lib/member-auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function PortalPlanPage() {
  const memberId = await getMemberIdFromCookie();
  if (!memberId) redirect("/login");

  const subjects = await prisma.subjectBusiness.findMany({
    where: { memberId },
    orderBy: { sortOrder: "asc" },
    select: { id: true, name: true },
  });

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 p-6">
      <div className="max-w-2xl mx-auto">
        <header className="flex items-center justify-between border-b border-neutral-800 pb-4 mb-6">
          <h1 className="text-2xl font-semibold">My plan</h1>
          <div className="flex items-center gap-3">
            <Link href="/portal/schedule" className="text-emerald-400 hover:text-white text-sm">Miniday schedule</Link>
            <Link href="/portal" className="text-neutral-400 hover:text-white text-sm">← My account</Link>
          </div>
        </header>

        {subjects.length === 0 ? (
          <p className="text-neutral-500 text-sm">No life plan linked to your account yet.</p>
        ) : (
          <ul className="space-y-2">
            {subjects.map((s) => (
              <li key={s.id}>
                <Link href={`/portal/plan/subject/${s.id}`} className="block rounded-lg bg-neutral-900 p-4 text-white hover:bg-neutral-800">
                  {s.name}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
