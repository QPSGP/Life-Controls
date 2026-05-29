import { redirect } from "next/navigation";
import Link from "next/link";
import { getMemberIdFromCookie } from "@/lib/member-auth";
import { prisma } from "@/lib/db";
import { companyDisplayName, resolveSearchParams } from "@/lib/crm";
import { CrmFilterTabs } from "../CrmFilterTabs";

export const dynamic = "force-dynamic";

export default async function PortalCompaniesPage(props: {
  searchParams: Promise<{ category?: string; visibility?: string; deleted?: string; error?: string }> | { category?: string; visibility?: string; deleted?: string; error?: string };
}) {
  const memberId = await getMemberIdFromCookie();
  if (!memberId) redirect("/login");

  const params = await resolveSearchParams(props.searchParams);

  const where: { memberId: string; category?: string; visibility?: string } = { memberId };
  if (params.category === "business" || params.category === "personal") where.category = params.category;
  if (params.visibility === "private" || params.visibility === "public") where.visibility = params.visibility;

  const companies = await prisma.company.findMany({
    where,
    orderBy: { name: "asc" },
    include: { _count: { select: { contacts: true } } },
  });

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 p-6">
      <div className="max-w-2xl mx-auto">
        <header className="border-b border-neutral-800 pb-4 mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <Link href="/portal" className="text-neutral-400 hover:text-white text-sm">← My account</Link>
            <h1 className="text-2xl font-semibold mt-2">My companies</h1>
            <p className="text-neutral-500 text-sm mt-0.5">Organizations you track — clients, partners, vendors.</p>
          </div>
          <Link href="/portal/companies/new" className="rounded bg-emerald-700 px-4 py-2 text-sm text-white hover:bg-emerald-600">Add company</Link>
        </header>

        {params.deleted && <p className="text-emerald-500 text-sm mb-4">Company deleted.</p>}

        <CrmFilterTabs basePath="/portal/companies" category={params.category} visibility={params.visibility} />

        {companies.length === 0 ? (
          <p className="text-neutral-500 text-sm">
            No companies yet.{" "}
            <Link href="/portal/companies/new" className="text-emerald-400 hover:underline">Add a company</Link>
          </p>
        ) : (
          <ul className="space-y-2">
            {companies.map((c) => (
              <li key={c.id}>
                <Link href={`/portal/companies/${c.id}`} className="block rounded-lg bg-neutral-900 p-4 border border-neutral-800 hover:bg-neutral-800">
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-medium">{companyDisplayName(c)}</span>
                    <span className="text-xs text-neutral-500 capitalize">{c.category} · {c.visibility}</span>
                  </div>
                  {c.industry && <p className="text-neutral-400 text-sm mt-0.5">{c.industry}</p>}
                  <p className="text-neutral-500 text-sm mt-1">{c._count.contacts} linked contact{c._count.contacts === 1 ? "" : "s"}</p>
                </Link>
              </li>
            ))}
          </ul>
        )}

        <p className="mt-6">
          <Link href="/portal/contacts" className="text-sm text-neutral-400 hover:text-white">My contacts →</Link>
        </p>
      </div>
    </main>
  );
}
