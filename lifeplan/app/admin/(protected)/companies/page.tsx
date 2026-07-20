import Link from "next/link";
import { prisma } from "@/lib/db";
import { companyDisplayName, resolveSearchParams, CRM_CATEGORY_OPTIONS, CRM_VISIBILITY_OPTIONS } from "@/lib/crm";

export const dynamic = "force-dynamic";

export default async function AdminCompaniesPage(props: {
  searchParams:
    | Promise<{ memberId?: string; category?: string; visibility?: string; deleted?: string; error?: string }>
    | { memberId?: string; category?: string; visibility?: string; deleted?: string; error?: string };
}) {
  const params = await resolveSearchParams(props.searchParams);

  let members: { id: string; email: string; firstName: string | null; lastName: string | null }[] = [];
  let companies: {
    id: string;
    name: string | null;
    website: string | null;
    phone: string | null;
    category: string;
    visibility: string;
    industry: string | null;
    member: { id: string; email: string; firstName: string | null; lastName: string | null };
    _count: { contacts: number };
  }[] = [];
  let dbError: string | null = null;

  try {
    members = await prisma.member.findMany({
      orderBy: { lastName: "asc" },
      select: { id: true, email: true, firstName: true, lastName: true },
    });

    const where: { memberId?: string; category?: string; visibility?: string } = {};
    if (params.memberId) where.memberId = params.memberId;
    if (params.category === "business" || params.category === "personal") where.category = params.category;
    if (params.visibility === "private" || params.visibility === "public") where.visibility = params.visibility;

    companies = await prisma.company.findMany({
      where,
      orderBy: { name: "asc" },
      take: 200,
      include: {
        member: { select: { id: true, email: true, firstName: true, lastName: true } },
        _count: { select: { contacts: true } },
      },
    });
  } catch (e) {
    dbError = e instanceof Error ? e.message : String(e);
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 p-6">
      <div className="max-w-5xl mx-auto">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800 pb-4 mb-6">
          <div>
            <h1 className="text-2xl font-semibold">CRM — Companies</h1>
            <p className="text-neutral-500 text-sm mt-0.5">Support view of member company databases.</p>
          </div>
          <div className="flex flex-wrap gap-3 text-sm">
            <Link href="/admin/contacts" className="text-neutral-400 hover:text-white">Contacts</Link>
            <Link href="/admin" className="text-neutral-400 hover:text-white">← Admin</Link>
          </div>
        </header>

        {dbError && (
          <div className="mb-4 p-4 rounded bg-red-950/50 border border-red-800 text-red-200 text-sm">
            Database error: {dbError}. Run &quot;DB push and seed&quot; if companies tables are missing.
          </div>
        )}
        {params.deleted && <p className="text-emerald-500 text-sm mb-4">Company deleted.</p>}
        {params.error === "notfound" && <p className="text-amber-500 text-sm mb-4">Company not found.</p>}

        <form method="GET" className="mb-6 flex flex-wrap gap-3 items-end rounded-lg bg-neutral-900 p-4 border border-neutral-800">
          <div>
            <label className="block text-xs text-neutral-500 mb-1">Member</label>
            <select name="memberId" defaultValue={params.memberId ?? ""} className="rounded bg-neutral-800 px-3 py-2 text-sm text-white border border-neutral-700 min-w-[200px]">
              <option value="">All members</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {[m.firstName, m.lastName].filter(Boolean).join(" ") || m.email} — {m.email}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-neutral-500 mb-1">Category</label>
            <select name="category" defaultValue={params.category ?? ""} className="rounded bg-neutral-800 px-3 py-2 text-sm text-white border border-neutral-700">
              <option value="">All</option>
              {CRM_CATEGORY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-neutral-500 mb-1">Visibility</label>
            <select name="visibility" defaultValue={params.visibility ?? ""} className="rounded bg-neutral-800 px-3 py-2 text-sm text-white border border-neutral-700">
              <option value="">All</option>
              {CRM_VISIBILITY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <button type="submit" className="rounded bg-neutral-700 px-4 py-2 text-sm text-white hover:bg-neutral-600">Filter</button>
          {(params.memberId || params.category || params.visibility) && (
            <Link href="/admin/companies" className="text-sm text-neutral-400 hover:text-white py-2">Clear</Link>
          )}
        </form>

        <p className="text-neutral-500 text-sm mb-3">{companies.length} compan{companies.length === 1 ? "y" : "ies"}{companies.length >= 200 ? " (showing first 200)" : ""}</p>

        {companies.length === 0 && !dbError ? (
          <p className="text-neutral-500 text-sm">No companies match.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="text-left text-neutral-400 border-b border-neutral-700">
                  <th className="py-2 pr-3">Name</th>
                  <th className="py-2 pr-3">Member</th>
                  <th className="py-2 pr-3">Phone / web</th>
                  <th className="py-2 pr-3">Contacts</th>
                  <th className="py-2 pr-3">Category</th>
                  <th className="py-2 pr-3"></th>
                </tr>
              </thead>
              <tbody>
                {companies.map((c) => (
                  <tr key={c.id} className="border-b border-neutral-800">
                    <td className="py-2 pr-3">
                      <Link href={`/admin/companies/${c.id}`} className="text-emerald-400 hover:underline font-medium">
                        {companyDisplayName(c)}
                      </Link>
                      {c.industry && <p className="text-neutral-500 text-xs">{c.industry}</p>}
                    </td>
                    <td className="py-2 pr-3 text-neutral-400">
                      <Link href={`/admin/companies?memberId=${c.member.id}`} className="hover:text-white">{c.member.email}</Link>
                    </td>
                    <td className="py-2 pr-3 text-neutral-400">
                      {[c.phone, c.website].filter(Boolean).join(" · ") || "—"}
                    </td>
                    <td className="py-2 pr-3 text-neutral-400">{c._count.contacts}</td>
                    <td className="py-2 pr-3 capitalize text-neutral-500">{c.category} · {c.visibility}</td>
                    <td className="py-2 pr-3">
                      <Link href={`/admin/companies/${c.id}/edit`} className="text-neutral-400 hover:text-white text-xs">Edit</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
