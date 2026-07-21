import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { contactDisplayName } from "@/lib/crm";
import { ContactsImportClient } from "@/app/portal/(protected)/contacts/import/ContactsImportClient";

export const dynamic = "force-dynamic";

export default async function AdminMemberContactsImportPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id: memberId } = await props.params;

  const member = await prisma.member.findUnique({
    where: { id: memberId },
    select: { id: true, email: true, firstName: true, lastName: true },
  });
  if (!member) notFound();

  const label = contactDisplayName(member);

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 p-6">
      <div className="max-w-2xl mx-auto">
        <header className="border-b border-neutral-800 pb-4 mb-6">
          <Link href="/admin" className="text-neutral-400 hover:text-white text-sm">← Admin</Link>
          <h1 className="text-2xl font-semibold mt-2">Import contacts for member</h1>
          <p className="text-neutral-400 text-sm mt-1">{label} · {member.email}</p>
          <p className="text-neutral-500 text-sm mt-1">Contacts will be owned by this member in their portal CRM.</p>
        </header>

        <ContactsImportClient
          batchApiPath={`/api/admin/members/${memberId}/contacts/import/batch`}
          successPath="/admin"
          successKeys={{
            imported: "contacts_imported",
            updated: "contacts_updated",
            skipped: "contacts_skipped",
          }}
        />

        <p className="mt-4">
          <a
            href={`/api/admin/members/${memberId}/contacts/export?format=vcf`}
            className="text-sm text-neutral-400 hover:text-white"
          >
            Export this member&apos;s contacts (vCard) →
          </a>
        </p>
      </div>
    </main>
  );
}
