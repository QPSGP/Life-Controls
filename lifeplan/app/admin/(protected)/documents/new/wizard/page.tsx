import Link from "next/link";

export const dynamic = "force-dynamic";

const WIZARD_NEXT = "/admin/documents/{id}/wizard?step=2";

export default async function NewDocumentWizardPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 p-6">
      <div className="max-w-xl mx-auto">
        <header className="border-b border-neutral-800 pb-4 mb-6">
          <Link href="/admin/documents" className="text-neutral-400 hover:text-white text-sm">
            ← Documents
          </Link>
          <h1 className="text-2xl font-semibold mt-2">Record new document</h1>
          <p className="text-neutral-500 text-sm mt-1">Step 1 of 5 — Basic info</p>
        </header>

        {error === "missing" && (
          <p className="text-amber-500 text-sm mb-4">Doc # is required.</p>
        )}
        {error === "invalid_date" && (
          <p className="text-amber-500 text-sm mb-4">Invalid date. Use a valid date (e.g. YYYY-MM-DD).</p>
        )}
        {error === "duplicate" && (
          <p className="text-amber-500 text-sm mb-4">A document with that Doc # already exists.</p>
        )}
        {error === "create" && (
          <p className="text-amber-500 text-sm mb-4">Could not create document.</p>
        )}

        <form
          action="/api/universa/documents"
          method="POST"
          className="rounded-lg bg-neutral-900 p-6 space-y-4"
        >
          <input type="hidden" name="wizard" value="1" />
          <input type="hidden" name="redirectTo" value={WIZARD_NEXT} />
          <div>
            <label className="block text-sm text-neutral-400 mb-1">Doc # (required)</label>
            <input
              type="text"
              name="docNumber"
              required
              placeholder="e.g. 2024-001"
              className="w-full rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700"
            />
          </div>
          <div>
            <label className="block text-sm text-neutral-400 mb-1">Document number (alt)</label>
            <input
              type="text"
              name="documentNumberAlt"
              placeholder="Optional"
              className="w-full rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700"
            />
          </div>
          <div>
            <label className="block text-sm text-neutral-400 mb-1">Document title</label>
            <input
              type="text"
              name="documentTitle"
              placeholder="Optional"
              className="w-full rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-neutral-400 mb-1">Recorded date</label>
              <input
                type="date"
                name="recordedAt"
                className="w-full rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700"
              />
            </div>
            <div>
              <label className="block text-sm text-neutral-400 mb-1">Rec. req. by</label>
              <input
                type="text"
                name="recReqBy"
                placeholder="Recording requested by"
                className="w-full rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700"
              />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="rounded bg-emerald-700 px-4 py-2 text-sm text-white hover:bg-emerald-600"
            >
              Next: Property →
            </button>
            <Link
              href="/admin/documents"
              className="rounded border border-neutral-600 px-4 py-2 text-sm text-neutral-300 hover:bg-neutral-800"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}
