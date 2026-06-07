import { redirect } from "next/navigation";
import Link from "next/link";
import { getMemberIdFromCookie } from "@/lib/member-auth";
import { prisma } from "@/lib/db";
import { contactDisplayName, resolveSearchParams } from "@/lib/crm";
import { CrmFilterTabs } from "../CrmFilterTabs";

export const dynamic = "force-dynamic";

export default async function PortalContactsPage(props: {
  searchParams: Promise<{ category?: string; visibility?: string; deleted?: string; error?: string; imported?: string; updated?: string; skipped?: string }> | { category?: string; visibility?: string; deleted?: string; error?: string; imported?: string; updated?: string; skipped?: string };
}) {
  const memberId = await getMemberIdFromCookie();
  if (!memberId) redirect("/login");

  const params = await resolveSearchParams(props.searchParams);

  const where: { memberId: string; category?: string; visibility?: string } = { memberId };
  if (params.category === "business" || params.category === "personal") where.category = params.category;
  if (params.visibility === "private" || params.visibility === "public") where.visibility = params.visibility;

  const contacts = await prisma.contact.findMany({
    where,
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    include: { company: { select: { id: true, name: true } } },
  });

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 p-6">
      <div className="max-w-2xl mx-auto">
        <header className="border-b border-neutral-800 pb-4 mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <Link href="/portal" className="text-neutral-400 hover:text-white text-sm">← My account</Link>
            <h1 className="text-2xl font-semibold mt-2">My contacts</h1>
            <p className="text-neutral-500 text-sm mt-0.5">People you know — business and personal profiles.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/portal/contacts/import" className="rounded bg-neutral-800 px-3 py-2 text-sm hover:bg-neutral-700">Import</Link>
            <a href="/api/portal/contacts/export?format=vcf" className="rounded bg-neutral-800 px-3 py-2 text-sm hover:bg-neutral-700">Export vCard</a>
            <a href="/api/portal/contacts/export?format=csv" className="rounded bg-neutral-800 px-3 py-2 text-sm hover:bg-neutral-700 hidden sm:inline-block">Export CSV</a>
            <Link href="/portal/contacts/new" className="rounded bg-emerald-700 px-4 py-2 text-sm text-white hover:bg-emerald-600">Add contact</Link>
          </div>
        </header>

        {params.imported && (
          <p className="text-emerald-500 text-sm mb-4">
            Import complete — {params.imported} added
            {params.updated ? `, ${params.updated} updated` : ""}
            {params.skipped ? `, ${params.skipped} skipped` : ""}.
          </p>
        )}

        {params.deleted && <p className="text-emerald-500 text-sm mb-4">Contact deleted.</p>}
        {params.error === "notfound" && <p className="text-amber-500 text-sm mb-4">Contact not found.</p>}

        <CrmFilterTabs basePath="/portal/contacts" category={params.category} visibility={params.visibility} />

        {contacts.length === 0 ? (
          <div className="text-neutral-500 text-sm space-y-2">
            <p>No contacts yet.</p>
            <p>
              <Link href="/portal/contacts/new" className="text-emerald-400 hover:underline">Add your first contact</Link>
              {" or "}
              <Link href="/portal/companies/new" className="text-emerald-400 hover:underline">add a company</Link> first.
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {contacts.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/portal/contacts/${c.id}`}
                  className="block rounded-lg bg-neutral-900 p-4 border border-neutral-800 hover:bg-neutral-800"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-medium">{contactDisplayName(c)}</span>
                    <span className="text-xs text-neutral-500 capitalize">{c.category} · {c.visibility}</span>
                  </div>
                  {c.jobTitle && <p className="text-neutral-400 text-sm mt-0.5">{c.jobTitle}</p>}
                  {(c.company?.name || c.companyName) && (
                    <p className="text-neutral-500 text-sm">{c.company?.name || c.companyName}</p>
                  )}
                  {(c.email || c.phone) && (
                    <p className="text-neutral-500 text-sm mt-1">{[c.email, c.phone].filter(Boolean).join(" · ")}</p>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}

        <p className="mt-6">
          <Link href="/portal/companies" className="text-sm text-neutral-400 hover:text-white">My companies →</Link>
        </p>
      </div>
    </main>
  );
}
