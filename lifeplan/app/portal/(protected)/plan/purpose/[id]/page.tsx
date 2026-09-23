import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getMemberIdFromCookie } from "@/lib/member-auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function PortalPurposePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; copied?: string }>;
}) {
  const memberId = await getMemberIdFromCookie();
  if (!memberId) redirect("/login");

  const { id: areaOfPurposeId } = await params;
  const { error, copied } = await searchParams;
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

        {copied && <p className="text-emerald-500 text-sm mb-4">Program copied.</p>}
        {error === "exists" && <p className="text-amber-500 text-sm mb-4">That name is already used. Choose another.</p>}
        {error === "missing" && <p className="text-amber-500 text-sm mb-4">Name is required, and the program must be yours.</p>}

        <h2 id="copy" className="text-lg font-medium text-neutral-300 mb-3">Copy this program</h2>
        <form action={"/api/portal/life-plan/area-of-purpose/" + areaOfPurposeId + "/duplicate"} method="POST" className="rounded bg-neutral-900 p-4 mb-6 space-y-2">
          <p className="text-neutral-500 text-sm">Same responsibilities and movements, under a new name.</p>
          <input type="text" name="name" placeholder="New program name" required className="w-full rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700" />
          <button type="submit" className="rounded bg-emerald-700 px-4 py-2 text-sm text-white hover:bg-emerald-600">Duplicate</button>
        </form>

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
