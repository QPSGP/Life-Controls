import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { resolveSearchParams, CRM_CATEGORY_OPTIONS, CRM_VISIBILITY_OPTIONS, contactDisplayName } from "@/lib/crm";

export const dynamic = "force-dynamic";

export default async function AdminMemberContactsImportPage(props: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }> | { error?: string };
}) {
  const { id: memberId } = await props.params;
  const params = await resolveSearchParams(props.searchParams);

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

        {params.error === "file" && <p className="text-amber-500 text-sm mb-4">Choose a CSV or vCard file to import.</p>}
        {params.error === "size" && <p className="text-amber-500 text-sm mb-4">File is too large (max 5 MB).</p>}
        {params.error === "empty" && <p className="text-amber-500 text-sm mb-4">No contacts found in that file.</p>}
        {params.error === "import" && <p className="text-amber-500 text-sm mb-4">Import failed. Try a different file.</p>}

        <form
          action={`/api/admin/members/${memberId}/contacts/import`}
          method="POST"
          encType="multipart/form-data"
          className="rounded-lg bg-neutral-900 p-4 border border-neutral-800 space-y-4"
        >
          <div>
            <label className="block text-sm text-neutral-400 mb-1">Contact file</label>
            <input
              type="file"
              name="file"
              accept=".csv,.vcf,text/csv,text/vcard,text/x-vcard"
              required
              className="w-full text-sm text-neutral-300 file:mr-3 file:rounded file:border-0 file:bg-neutral-700 file:px-3 file:py-2 file:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-neutral-400 mb-1">Default category</label>
              <select name="category" defaultValue="business" className="w-full rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700">
                {CRM_CATEGORY_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-neutral-400 mb-1">Default visibility</label>
              <select name="visibility" defaultValue="private" className="w-full rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700">
                {CRM_VISIBILITY_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          <p className="text-xs text-neutral-500">
            Rows matching an existing email for this member will be merged (new channels added, notes appended).
          </p>

          <button type="submit" className="rounded bg-emerald-700 px-4 py-3 text-sm text-white hover:bg-emerald-600">
            Import into member CRM
          </button>
        </form>

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
