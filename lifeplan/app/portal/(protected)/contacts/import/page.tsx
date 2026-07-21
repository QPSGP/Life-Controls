import { redirect } from "next/navigation";
import Link from "next/link";
import { getMemberIdFromCookie } from "@/lib/member-auth";
import { ContactsImportClient } from "./ContactsImportClient";

export const dynamic = "force-dynamic";

export default async function PortalContactsImportPage() {
  const memberId = await getMemberIdFromCookie();
  if (!memberId) redirect("/login");

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 p-4 sm:p-6">
      <div className="max-w-2xl mx-auto">
        <header className="border-b border-neutral-800 pb-4 mb-6">
          <Link href="/portal/contacts" className="text-neutral-400 hover:text-white text-sm">← My contacts</Link>
          <h1 className="text-2xl font-semibold mt-2">Import contacts</h1>
          <p className="text-neutral-500 text-sm mt-1">
            Upload a vCard (.vcf) from your phone or a CSV from Outlook / Google Contacts.
          </p>
        </header>

        <ContactsImportClient
          batchApiPath="/api/portal/contacts/import/batch"
          successPath="/portal/contacts"
        />
      </div>
    </main>
  );
}
