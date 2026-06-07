import { redirect } from "next/navigation";
import Link from "next/link";
import { getMemberIdFromCookie } from "@/lib/member-auth";
import { resolveSearchParams, CRM_CATEGORY_OPTIONS, CRM_VISIBILITY_OPTIONS } from "@/lib/crm";

export const dynamic = "force-dynamic";

export default async function PortalContactsImportPage(props: {
  searchParams: Promise<{ error?: string }> | { error?: string };
}) {
  const memberId = await getMemberIdFromCookie();
  if (!memberId) redirect("/login");

  const params = await resolveSearchParams(props.searchParams);

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

        {params.error === "file" && <p className="text-amber-500 text-sm mb-4">Choose a CSV or vCard file to import.</p>}
        {params.error === "size" && <p className="text-amber-500 text-sm mb-4">File is too large (max 5 MB).</p>}
        {params.error === "empty" && <p className="text-amber-500 text-sm mb-4">No contacts found in that file.</p>}
        {params.error === "import" && <p className="text-amber-500 text-sm mb-4">Import failed. Try a different file.</p>}

        <form
          action="/api/portal/contacts/import"
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
            <p className="text-xs text-neutral-500 mt-2">
              On iPhone: Contacts → select contact → Share → export vCard. On Android: Contacts app → Export to .vcf.
            </p>
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
            Rows matching an existing email on your list will be merged (new phone numbers and social links added, not replaced).
          </p>

          <button type="submit" className="w-full rounded bg-emerald-700 px-4 py-3 text-sm text-white hover:bg-emerald-600">
            Import contacts
          </button>
        </form>
      </div>
    </main>
  );
}
