import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { contactDisplayName, resolveSearchParams } from "@/lib/crm";
import { ContactReachSection, buildContactActions } from "@/app/portal/(protected)/contacts/ContactReachSection";
import { ContactActionBar } from "@/app/portal/(protected)/contacts/ContactActionBar";
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

export default async function AdminContactDetailPage(props: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ updated?: string; deleted?: string; return?: string }> | { updated?: string; deleted?: string; return?: string };
}) {
  const { id } = await props.params;
  const params = await resolveSearchParams(props.searchParams);

  const contact = await prisma.contact.findUnique({
    where: { id },
    include: {
      member: { select: { id: true, email: true, firstName: true, lastName: true } },
      company: { select: { id: true, name: true } },
      communications: { orderBy: { createdAt: "desc" }, take: 50 },
    },
  });
  if (!contact) notFound();

  const backHref = params.return?.startsWith("/admin") ? params.return : "/admin/contacts";
  const actions = buildContactActions(contact);

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 p-6">
      <div className="max-w-2xl mx-auto">
        <header className="border-b border-neutral-800 pb-4 mb-6">
          <Link href={backHref} className="text-neutral-400 hover:text-white text-sm">← Contacts</Link>
          <div className="flex flex-wrap items-start justify-between gap-3 mt-2">
            <div>
              <h1 className="text-2xl font-semibold">{contactDisplayName(contact)}</h1>
              <p className="text-neutral-500 text-sm capitalize mt-0.5">{contact.category} · {contact.visibility}</p>
              <p className="text-neutral-400 text-sm mt-1">
                Owner:{" "}
                <Link href={`/admin/contacts?memberId=${contact.member.id}`} className="text-emerald-400 hover:underline">
                  {contact.member.email}
                </Link>
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href={`/admin/members/${contact.member.id}/contacts/import`} className="rounded bg-neutral-800 px-3 py-1.5 text-sm hover:bg-neutral-700">Import for member</Link>
              <Link href={`/admin/contacts/${id}/edit`} className="rounded bg-neutral-800 px-3 py-1.5 text-sm hover:bg-neutral-700">Edit</Link>
            </div>
          </div>
        </header>

        {params.updated && <p className="text-emerald-500 text-sm mb-4">Contact updated.</p>}

        <ContactActionBar actions={actions} />
        <ContactReachSection contact={contact} />

        {(contact.company || contact.companyName || contact.street || contact.city) && (
          <section className="rounded-lg bg-neutral-900 p-4 border border-neutral-800 text-sm space-y-1 mt-4">
            <h2 className="text-neutral-400 text-xs uppercase tracking-wider mb-2">Organization & address</h2>
            {contact.company ? (
              <p>
                <span className="text-neutral-500">Company:</span>{" "}
                <Link href={`/admin/companies/${contact.company.id}`} className="text-emerald-400 hover:underline">
                  {contact.company.name}
                </Link>
              </p>
            ) : (
              <ProfileRow label="Company" value={contact.companyName} />
            )}
            {(contact.street || contact.city) && (
              <ProfileRow
                label="Address"
                value={[contact.street, contact.city, contact.state, contact.zip, contact.country].filter(Boolean).join(", ")}
              />
            )}
          </section>
        )}

        {(contact.notes || contact.howToEngage || contact.keyFacts || contact.tags) && (
          <section className="rounded-lg bg-neutral-900 p-4 border border-neutral-800 text-sm mt-4 space-y-3">
            <h2 className="text-neutral-400 text-xs uppercase tracking-wider">Profile</h2>
            {contact.notes && <div><p className="text-neutral-500 text-xs mb-1">Notes</p><p className="whitespace-pre-wrap">{contact.notes}</p></div>}
            {contact.howToEngage && <div><p className="text-neutral-500 text-xs mb-1">How to engage</p><p className="whitespace-pre-wrap">{contact.howToEngage}</p></div>}
            {contact.keyFacts && <div><p className="text-neutral-500 text-xs mb-1">Key facts</p><p className="whitespace-pre-wrap">{contact.keyFacts}</p></div>}
            {contact.tags && <ProfileRow label="Tags" value={contact.tags} />}
            {contact.source && <ProfileRow label="Source" value={contact.source} />}
          </section>
        )}

        <CommunicationTimeline
          communications={contact.communications}
          returnTo={`/admin/contacts/${id}`}
          contactId={contact.id}
          companyId={contact.companyId ?? undefined}
          action="/api/admin/communications"
          memberId={contact.memberId}
        />

        <form action={`/api/admin/contacts/${id}/delete`} method="POST" className="mt-8 pt-6 border-t border-neutral-800">
          <DeleteConfirmButton label="Delete contact" />
        </form>
      </div>
    </main>
  );
}
