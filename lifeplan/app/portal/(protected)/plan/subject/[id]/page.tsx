import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getMemberIdFromCookie } from "@/lib/member-auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function PortalSubjectPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const memberId = await getMemberIdFromCookie();
  if (!memberId) redirect("/login");
  const { error } = await searchParams;

  const { id: subjectBusinessId } = await params;
  const subject = await prisma.subjectBusiness.findFirst({
    where: { id: subjectBusinessId, memberId },
    include: { areasOfPurpose: { orderBy: { sortOrder: "asc" } } },
  });
  if (!subject) notFound();

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 p-6">
      <div className="max-w-2xl mx-auto">
        <header className="border-b border-neutral-800 pb-4 mb-6">
          <Link href="/portal/plan" className="text-neutral-400 hover:text-white text-sm">← My plan</Link>
          <h1 className="text-2xl font-semibold mt-2">{subject.name}</h1>
        </header>

        {error === "exists" && <p className="text-amber-500 text-sm mb-4">That program name is already on this subject.</p>}
        {error === "build" && <p className="text-amber-500 text-sm mb-4">Add a program name, for example “LinkedIn, same shape as Daily control”.</p>}
        {error && error !== "exists" && error !== "build" && <p className="text-amber-500 text-sm mb-4">Name is required.</p>}

        <h2 className="font-display text-lg text-white mb-3">Build a program</h2>
        <form action={"/api/portal/life-plan/subject/" + subjectBusinessId + "/build"} method="POST" className="rounded-xl border border-white/10 bg-black/40 p-4 mb-6 space-y-3 backdrop-blur-xl">
          <p className="text-neutral-400 text-sm">Name the program and, if you want the same responsibilities, say which one to copy.</p>
          <input type="text" name="sentence" required placeholder="LinkedIn, same shape as Daily control" className="w-full rounded bg-neutral-950 px-3 py-2 text-white border border-neutral-700" />
          {subject.areasOfPurpose.length > 0 && (
            <select name="templateId" className="w-full rounded bg-neutral-950 px-3 py-2 text-white border border-neutral-700" defaultValue="">
              <option value="">Template from the sentence</option>
              {subject.areasOfPurpose.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          )}
          <button type="submit" className="rounded bg-accent px-4 py-2 text-sm font-semibold text-black hover:bg-accent-hover">Create program</button>
        </form>

        <h2 className="text-lg font-medium text-neutral-300 mb-3">Edit this subject/business</h2>
        <form action={"/api/portal/life-plan/subject-business/" + subjectBusinessId} method="POST" className="rounded bg-neutral-900 p-4 mb-6 space-y-2">
          <input type="text" name="name" placeholder="Name (required)" required defaultValue={subject.name} className="w-full rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700" />
          <div className="grid grid-cols-2 gap-2">
            <input type="text" name="verb" placeholder="Verb" defaultValue={subject.verb ?? ""} className="rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700" />
            <input type="text" name="noun" placeholder="Noun" defaultValue={subject.noun ?? ""} className="rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700" />
            <input type="text" name="object" placeholder="Object" defaultValue={subject.object ?? ""} className="rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700" />
            <input type="text" name="objective" placeholder="Objective" defaultValue={subject.objective ?? ""} className="rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700" />
          </div>
          <button type="submit" className="rounded bg-emerald-700 px-4 py-2 text-sm text-white hover:bg-emerald-600">Save changes</button>
        </form>

        <h2 className="text-lg font-medium text-neutral-300 mb-3">Areas of purpose</h2>
        <ul className="space-y-2">
          {subject.areasOfPurpose.map((a) => (
            <li key={a.id} className="flex items-center justify-between py-2 px-3 rounded bg-neutral-900">
              <span>{a.name}</span>
              <Link href={"/portal/plan/purpose/" + a.id} className="text-emerald-400 text-sm hover:underline">Areas of responsibility →</Link>
            </li>
          ))}
          {subject.areasOfPurpose.length === 0 && <li className="text-neutral-500 text-sm">No areas of purpose yet.</li>}
        </ul>
      </div>
    </main>
  );
}
