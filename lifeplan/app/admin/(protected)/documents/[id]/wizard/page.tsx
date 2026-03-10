import { prisma } from "@/lib/db";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

function dateStr(d: Date | null): string {
  if (!d) return "";
  return d.toISOString().slice(0, 10);
}

export default async function DocumentWizardPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ step?: string; error?: string }>;
}) {
  const { id } = await params;
  const { step = "2", error } = await searchParams;
  const doc = await prisma.universaDocument.findUnique({
    where: { id },
    include: {
      grantors: { orderBy: { sortOrder: "asc" } },
      grantees: { orderBy: { sortOrder: "asc" } },
    },
  });
  if (!doc) notFound();

  const base = `/admin/documents/${id}/wizard`;
  const stepNum = parseInt(step, 10) || 2;

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 p-6">
      <div className="max-w-2xl mx-auto">
        <header className="border-b border-neutral-800 pb-4 mb-6">
          <Link href="/admin/documents" className="text-neutral-400 hover:text-white text-sm">
            ← Documents
          </Link>
          <h1 className="text-2xl font-semibold mt-2">Record new document — {doc.docNumber}</h1>
          <p className="text-neutral-500 text-sm mt-1">
            Step {stepNum} of 5 — {stepNum === 2 ? "Property" : stepNum === 3 ? "Grantors" : stepNum === 4 ? "Grantees" : "Review"}
          </p>
        </header>

        {error && (
          <p className="text-amber-500 text-sm mb-4">
            {error === "update" && "Could not update document."}
            {error === "grantor" && "Could not add grantor."}
            {error === "grantee" && "Could not add grantee."}
          </p>
        )}

        {/* Step 2: Property */}
        {stepNum === 2 && (
          <form
            action={`/api/universa/documents/${id}`}
            method="POST"
            className="rounded-lg bg-neutral-900 p-6 space-y-4"
          >
            <input type="hidden" name="wizardStep" value="property" />
            <input type="hidden" name="redirectTo" value={`${base}?step=3`} />
            <section className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-400">
                Property
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm text-neutral-400 mb-1">Property county</label>
                  <input type="text" name="propertyCounty" defaultValue={doc.propertyCounty ?? ""} className="w-full rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700" />
                </div>
                <div><label className="block text-sm text-neutral-400 mb-1">Lot</label><input type="text" name="lot" defaultValue={doc.lot ?? ""} className="w-full rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700" /></div>
                <div><label className="block text-sm text-neutral-400 mb-1">Block</label><input type="text" name="block" defaultValue={doc.block ?? ""} className="w-full rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700" /></div>
                <div><label className="block text-sm text-neutral-400 mb-1">Tract</label><input type="text" name="tract" defaultValue={doc.tract ?? ""} className="w-full rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700" /></div>
                <div><label className="block text-sm text-neutral-400 mb-1">Book</label><input type="text" name="book" defaultValue={doc.book ?? ""} className="w-full rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700" /></div>
                <div><label className="block text-sm text-neutral-400 mb-1">Pages</label><input type="text" name="pages" defaultValue={doc.pages ?? ""} className="w-full rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700" /></div>
                <div><label className="block text-sm text-neutral-400 mb-1">Parcel #</label><input type="text" name="parcelNumber" defaultValue={doc.parcelNumber ?? ""} className="w-full rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700" /></div>
              </div>
              <div>
                <label className="block text-sm text-neutral-400 mb-1">Property address</label>
                <input type="text" name="propertyAdrs" defaultValue={doc.propertyAdrs ?? ""} className="w-full rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700" />
              </div>
              <div>
                <label className="block text-sm text-neutral-400 mb-1">Property address 2</label>
                <input type="text" name="propertyAdrs2" defaultValue={doc.propertyAdrs2 ?? ""} className="w-full rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700" />
              </div>
              <div>
                <label className="block text-sm text-neutral-400 mb-1">Property address 3</label>
                <input type="text" name="propertyAdrs3" defaultValue={doc.propertyAdrs3 ?? ""} className="w-full rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700" />
              </div>
            </section>
            <div className="flex gap-3 pt-2">
              <button type="submit" className="rounded bg-emerald-700 px-4 py-2 text-sm text-white hover:bg-emerald-600">Next: Grantors →</button>
              <Link href={`${base}?step=3`} className="rounded border border-neutral-600 px-4 py-2 text-sm text-neutral-300 hover:bg-neutral-800">Skip</Link>
              <Link href={`/admin/documents/${id}/edit`} className="rounded border border-neutral-600 px-4 py-2 text-sm text-neutral-300 hover:bg-neutral-800">Edit full document</Link>
            </div>
          </form>
        )}

        {/* Step 3: Grantors */}
        {stepNum === 3 && (
          <div className="space-y-6">
            {doc.grantors.length > 0 && (
              <ul className="rounded-lg bg-neutral-900 p-4 space-y-2">
                <li className="text-sm font-medium text-neutral-400">Grantors added</li>
                {doc.grantors.map((g) => (
                  <li key={g.id} className="text-neutral-200">{g.name || g.grantorNumber || "(no name)"} {g.address && `— ${g.address}`}</li>
                ))}
              </ul>
            )}
            <div className="rounded-lg bg-neutral-900 p-6 border border-neutral-800 border-dashed">
              <p className="text-neutral-500 text-sm mb-3">Add grantor</p>
              <form action={`/api/universa/documents/${id}/grantors`} method="POST" className="space-y-3">
                <input type="hidden" name="redirectTo" value={`${base}?step=3`} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div><label className="block text-sm text-neutral-400 mb-1">Grantor #</label><input type="text" name="grantorNumber" className="w-full rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700" /></div>
                  <div><label className="block text-sm text-neutral-400 mb-1">Name</label><input type="text" name="name" className="w-full rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700" /></div>
                </div>
                <div><label className="block text-sm text-neutral-400 mb-1">Address</label><input type="text" name="address" className="w-full rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700" /></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div><label className="block text-sm text-neutral-400 mb-1">% share</label><input type="text" name="percentShare" className="w-full rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700" /></div>
                  <div><label className="block text-sm text-neutral-400 mb-1">Comment</label><input type="text" name="comment" className="w-full rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700" /></div>
                </div>
                <button type="submit" className="rounded bg-emerald-700 px-3 py-1.5 text-sm text-white hover:bg-emerald-600">Add grantor</button>
              </form>
            </div>
            <div className="flex gap-3">
              <Link href={`${base}?step=4`} className="rounded bg-emerald-700 px-4 py-2 text-sm text-white hover:bg-emerald-600">Next: Grantees →</Link>
              <Link href={`${base}?step=2`} className="rounded border border-neutral-600 px-4 py-2 text-sm text-neutral-300 hover:bg-neutral-800">← Back</Link>
              <Link href={`/admin/documents/${id}/edit`} className="rounded border border-neutral-600 px-4 py-2 text-sm text-neutral-300 hover:bg-neutral-800">Edit full document</Link>
            </div>
          </div>
        )}

        {/* Step 4: Grantees */}
        {stepNum === 4 && (
          <div className="space-y-6">
            {doc.grantees.length > 0 && (
              <ul className="rounded-lg bg-neutral-900 p-4 space-y-2">
                <li className="text-sm font-medium text-neutral-400">Grantees added</li>
                {doc.grantees.map((g) => (
                  <li key={g.id} className="text-neutral-200">{g.name || g.granteeNumber || "(no name)"} {g.address && `— ${g.address}`}</li>
                ))}
              </ul>
            )}
            <div className="rounded-lg bg-neutral-900 p-6 border border-neutral-800 border-dashed">
              <p className="text-neutral-500 text-sm mb-3">Add grantee</p>
              <form action={`/api/universa/documents/${id}/grantees`} method="POST" className="space-y-3">
                <input type="hidden" name="redirectTo" value={`${base}?step=4`} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div><label className="block text-sm text-neutral-400 mb-1">Grantee #</label><input type="text" name="granteeNumber" className="w-full rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700" /></div>
                  <div><label className="block text-sm text-neutral-400 mb-1">Name</label><input type="text" name="name" className="w-full rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700" /></div>
                </div>
                <div><label className="block text-sm text-neutral-400 mb-1">Address</label><input type="text" name="address" className="w-full rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700" /></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div><label className="block text-sm text-neutral-400 mb-1">% share</label><input type="text" name="percentShare" className="w-full rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700" /></div>
                  <div><label className="block text-sm text-neutral-400 mb-1">Comment</label><input type="text" name="comment" className="w-full rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700" /></div>
                </div>
                <button type="submit" className="rounded bg-emerald-700 px-3 py-1.5 text-sm text-white hover:bg-emerald-600">Add grantee</button>
              </form>
            </div>
            <div className="flex gap-3">
              <Link href={`${base}?step=5`} className="rounded bg-emerald-700 px-4 py-2 text-sm text-white hover:bg-emerald-600">Next: Review →</Link>
              <Link href={`${base}?step=3`} className="rounded border border-neutral-600 px-4 py-2 text-sm text-neutral-300 hover:bg-neutral-800">← Back</Link>
              <Link href={`/admin/documents/${id}/edit`} className="rounded border border-neutral-600 px-4 py-2 text-sm text-neutral-300 hover:bg-neutral-800">Edit full document</Link>
            </div>
          </div>
        )}

        {/* Step 5: Review */}
        {stepNum === 5 && (
          <div className="space-y-6">
            <div className="rounded-lg bg-neutral-900 p-6">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-400 mb-3">Document</h3>
              <p><span className="text-neutral-500">Doc #:</span> {doc.docNumber}</p>
              {doc.documentTitle && <p><span className="text-neutral-500">Title:</span> {doc.documentTitle}</p>}
              {doc.recordedAt && <p><span className="text-neutral-500">Recorded:</span> {dateStr(doc.recordedAt)}</p>}
              {doc.propertyCounty && <p><span className="text-neutral-500">County:</span> {doc.propertyCounty}</p>}
              {doc.propertyAdrs && <p><span className="text-neutral-500">Property:</span> {doc.propertyAdrs}</p>}
            </div>
            <div className="rounded-lg bg-neutral-900 p-6">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-400 mb-2">Grantors ({doc.grantors.length})</h3>
              {doc.grantors.length === 0 ? <p className="text-neutral-500 text-sm">None</p> : (
                <ul className="space-y-1 text-sm">{doc.grantors.map((g) => <li key={g.id}>{g.name || g.grantorNumber || "—"} {g.percentShare && `(${g.percentShare})`}</li>)}</ul>
              )}
            </div>
            <div className="rounded-lg bg-neutral-900 p-6">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-400 mb-2">Grantees ({doc.grantees.length})</h3>
              {doc.grantees.length === 0 ? <p className="text-neutral-500 text-sm">None</p> : (
                <ul className="space-y-1 text-sm">{doc.grantees.map((g) => <li key={g.id}>{g.name || g.granteeNumber || "—"} {g.percentShare && `(${g.percentShare})`}</li>)}</ul>
              )}
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href={`/admin/documents/${id}/edit`} className="rounded bg-emerald-700 px-4 py-2 text-sm text-white hover:bg-emerald-600">Edit document</Link>
              <Link href="/admin/documents" className="rounded border border-neutral-600 px-4 py-2 text-sm text-neutral-300 hover:bg-neutral-800">Back to documents</Link>
              <Link href={`${base}?step=4`} className="rounded border border-neutral-600 px-4 py-2 text-sm text-neutral-300 hover:bg-neutral-800">← Add more grantees</Link>
            </div>
          </div>
        )}

        {stepNum < 2 && (
          <p className="text-neutral-500">Invalid step. <Link href={`${base}?step=2`} className="text-emerald-400 hover:underline">Go to step 2</Link> or <Link href={`/admin/documents/${id}/edit`} className="text-emerald-400 hover:underline">edit document</Link>.</p>
        )}
        {stepNum > 5 && (
          <p className="text-neutral-500">Invalid step. <Link href={`${base}?step=5`} className="text-emerald-400 hover:underline">Go to review</Link>.</p>
        )}
      </div>
    </main>
  );
}
