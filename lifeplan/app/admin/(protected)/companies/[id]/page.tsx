import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { companyDisplayName, contactDisplayName, resolveSearchParams } from "@/lib/crm";
import { CommunicationTimeline } from "@/app/portal/(protected)/CommunicationTimeline";
import { DeleteConfirmButton } from "@/app/portal/(protected)/DeleteConfirmButton";

export const dynamic = "force-dynamic";

function ProfileRow({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value?.trim()) return null;
  return (
    <p>
      <span className="text-neutral-500">{label}:</span> {value}
    </p>
  );
}

export default async function AdminCompanyDetailPage(props: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ updated?: string; comm?: string }> | { updated?: string; comm?: string };
}) {
  const { id } = await props.params;
  const params = await resolveSearchParams(props.searchParams);

  const company = await prisma.company.findUnique({
    where: { id },
    include: {
      member: { select: { id: true, email: true, firstName: true, lastName: true } },
      contacts: { orderBy: [{ lastName: "asc" }, { firstName: "asc" }], take: 50 },
      communications: { orderBy: { createdAt: "desc" }, take: 50 },
    },
  });
  if (!company) notFound();

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 p-6">
      <div className="max-w-2xl mx-auto">
        <header className="border-b border-neutral-800 pb-4 mb-6">
          <Link href="/admin/companies" className="text-neutral-400 hover:text-white text-sm">← Companies</Link>
          <div className="flex flex-wrap items-start justify-between gap-3 mt-2">
            <div>
              <h1 className="text-2xl font-semibold">{companyDisplayName(company)}</h1>
              <p className="text-neutral-500 text-sm capitalize mt-0.5">{company.category} · {company.visibility}</p>
              <p className="text-neutral-400 text-sm mt-1">
                Owner:{" "}
                <Link href={`/admin/companies?memberId=${company.member.id}`} className="text-emerald-400 hover:underline">
                  {company.member.email}
                </Link>
              </p>
            </div>
            <Link href={`/admin/companies/${id}/edit`} className="rounded bg-neutral-800 px-3 py-1.5 text-sm hover:bg-neutral-700">Edit</Link>
          </div>
        </header>

        {params.updated && <p className="text-emerald-500 text-sm mb-4">Company updated.</p>}
        {params.comm && <p className="text-emerald-500 text-sm mb-4">Activity logged.</p>}

        <section className="rounded-lg bg-neutral-900 p-4 border border-neutral-800 text-sm space-y-1">
          <h2 className="text-neutral-400 text-xs uppercase tracking-wider mb-2">Company info</h2>
          {company.website && (
            <p>
              <span className="text-neutral-500">Website:</span>{" "}
              <a href={company.website.startsWith("http") ? company.website : `https://${company.website}`} className="text-emerald-400 hover:underline break-all" target="_blank" rel="noopener noreferrer">
                {company.website}
              </a>
            </p>
          )}
          {company.phone && (
            <p>
              <span className="text-neutral-500">Phone:</span>{" "}
              <a href={`tel:${company.phone}`} className="text-emerald-400 hover:underline">{company.phone}</a>
            </p>
          )}
          <ProfileRow label="Industry" value={company.industry} />
          <ProfileRow label="Size" value={company.size} />
          {(company.street || company.city) && (
            <ProfileRow
              label="Address"
              value={[company.street, company.city, company.state, company.zip, company.country].filter(Boolean).join(", ")}
            />
          )}
        </section>

        {(company.notes || company.keyPeople || company.tags) && (
          <section className="rounded-lg bg-neutral-900 p-4 border border-neutral-800 text-sm mt-4 space-y-3">
            <h2 className="text-neutral-400 text-xs uppercase tracking-wider">Profile</h2>
            {company.notes && <div><p className="text-neutral-500 text-xs mb-1">Notes</p><p className="whitespace-pre-wrap">{company.notes}</p></div>}
            {company.keyPeople && <div><p className="text-neutral-500 text-xs mb-1">Key people</p><p className="whitespace-pre-wrap">{company.keyPeople}</p></div>}
            {company.tags && <ProfileRow label="Tags" value={company.tags} />}
            {company.source && <ProfileRow label="Source" value={company.source} />}
          </section>
        )}

        {company.contacts.length > 0 && (
          <section className="mt-6">
            <h2 className="text-lg font-medium text-neutral-300 mb-2">Linked contacts</h2>
            <ul className="space-y-1">
              {company.contacts.map((c) => (
                <li key={c.id}>
                  <Link href={`/admin/contacts/${c.id}`} className="text-emerald-400 text-sm hover:underline">
                    {contactDisplayName(c)}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <CommunicationTimeline
          communications={company.communications}
          returnTo={`/admin/companies/${id}`}
          companyId={company.id}
          action="/api/admin/communications"
          memberId={company.memberId}
        />

        <form action={`/api/admin/companies/${id}/delete`} method="POST" className="mt-8 pt-6 border-t border-neutral-800">
          <DeleteConfirmButton label="Delete company" />
        </form>
      </div>
    </main>
  );
}
