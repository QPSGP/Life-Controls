import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminNewDocumentPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 p-6">
      <div className="max-w-xl mx-auto">
        <header className="border-b border-neutral-800 pb-4 mb-6">
          <Link href="/admin/documents" className="text-neutral-400 hover:text-white text-sm">← Documents</Link>
          <h1 className="text-2xl font-semibold mt-2">Add document</h1>
        </header>
        {error === "missing" && <p className="text-amber-500 text-sm mb-4">Doc # is required.</p>}
        {error === "duplicate" && <p className="text-amber-500 text-sm mb-4">A document with that Doc # already exists.</p>}
        {error === "create" && <p className="text-amber-500 text-sm mb-4">Could not create document.</p>}
        <form action="/api/universa/documents" method="POST" className="rounded-lg bg-neutral-900 p-4 space-y-3">
          <div>
            <label className="block text-sm text-neutral-400 mb-1">Doc # (required)</label>
            <input type="text" name="docNumber" required placeholder="e.g. 2024-001" className="w-full rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700" />
          </div>
          <div>
            <label className="block text-sm text-neutral-400 mb-1">Document title</label>
            <input type="text" name="documentTitle" placeholder="Optional" className="w-full rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700" />
          </div>
          <button type="submit" className="rounded bg-emerald-700 px-4 py-2 text-sm text-white hover:bg-emerald-600">Create document</button>
        </form>
      </div>
    </main>
  );
}
