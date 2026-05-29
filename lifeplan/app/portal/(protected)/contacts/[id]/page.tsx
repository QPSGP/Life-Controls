import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getMemberIdFromCookie } from "@/lib/member-auth";
import { prisma } from "@/lib/db";
import { contactDisplayName, resolveSearchParams } from "@/lib/crm";
import { CommunicationTimeline } from "../../CommunicationTimeline";
import { DeleteConfirmButton } from "../../DeleteConfirmButton";

export const dynamic = "force-dynamic";

function ProfileRow({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value?.trim()) return null;
  return (
    <p>
      <span className="text-neutral-500">{label}:</span> {value}
    </p>
  );
}

export default async function PortalContactDetailPage(props: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string; updated?: string; comm?: string; error?: string }> | { created?: string; updated?: string; comm?: string; error?: string };
}) {
  const memberId = await getMemberIdFromCookie();
  if (!memberId) redirect("/login");

  const { id } = await props.params;
  const params = await resolveSearchParams(props.searchParams);

  const contact = await prisma.contact.findFirst({
    where: { id, memberId },
    include: {
      company: { select: { id: true, name: true } },
      communications: { orderBy: { createdAt: "desc" }, take: 50 },
    },
  });
  if (!contact) notFound();

  const returnTo = `/portal/contacts/${id}`;

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 p-6">
      <div className="max-w-2xl mx-auto">
        <header className="border-b border-neutral-800 pb-4 mb-6">
          <Link href="/portal/contacts" className="text-neutral-400 hover:text-white text-sm">← My contacts</Link>
          <div className="flex flex-wrap items-start justify-between gap-3 mt-2">
            <div>
              <h1 className="text-2xl font-semibold">{contactDisplayName(contact)}</h1>
              <p className="text-neutral-500 text-sm capitalize mt-0.5">{contact.category} · {contact.visibility}</p>
            </div>
            <Link href={`/portal/contacts/${id}/edit`} className="rounded bg-neutral-800 px-3 py-1.5 text-sm hover:bg-neutral-700">Edit</Link>
          </div>
        </header>

        {params.created && <p className="text-emerald-500 text-sm mb-4">Contact created.</p>}
        {params.updated && <p className="text-emerald-500 text-sm mb-4">Contact updated.</p>}
        {params.comm && <p className="text-emerald-500 text-sm mb-4">Activity logged.</p>}
        {params.error?.startsWith("comm_") && <p className="text-amber-500 text-sm mb-4">Could not log activity.</p>}

        <section className="rounded-lg bg-neutral-900 p-4 border border-neutral-800 text-sm space-y-1">
          <h2 className="text-neutral-400 text-xs uppercase tracking-wider mb-2">Contact info</h2>
          <ProfileRow label="Email" value={contact.email} />
          <ProfileRow label="Secondary email" value={contact.emailSecondary} />
          <ProfileRow label="Phone" value={contact.phone} />
          <ProfileRow label="Mobile" value={contact.mobile} />
          <ProfileRow label="Job title" value={contact.jobTitle} />
          {contact.company ? (
            <p>
              <span className="text-neutral-500">Company:</span>{" "}
              <Link href={`/portal/companies/${contact.company.id}`} className="text-emerald-400 hover:underline">
                {contact.company.name}
              </Link>
            </p>
          ) : (
            <ProfileRow label="Company" value={contact.companyName} />
          )}
          {(contact.street || contact.city) && (
            <ProfileRow label="Address" value={[contact.street, contact.city, contact.state, contact.zip, contact.country].filter(Boolean).join(", ")} />
          )}
        </section>

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
          returnTo={returnTo}
          contactId={contact.id}
          companyId={contact.companyId ?? undefined}
        />

        <form action={`/api/portal/contacts/${id}/delete`} method="POST" className="mt-8 pt-6 border-t border-neutral-800">
          <DeleteConfirmButton label="Delete contact" />
        </form>
      </div>
    </main>
  );
}
