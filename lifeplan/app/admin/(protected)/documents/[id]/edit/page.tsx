import { prisma } from "@/lib/db";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

function dateStr(d: Date | null): string {
  if (!d) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default async function AdminDocumentEditPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const doc = await prisma.universaDocument.findUnique({
    where: { id },
    include: { grantors: true, grantees: true },
  });
  if (!doc) notFound();

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 p-6">
      <div className="max-w-3xl mx-auto">
        <header className="border-b border-neutral-800 pb-4 mb-6">
          <Link href="/admin/documents" className="text-neutral-400 hover:text-white text-sm">← Documents</Link>
          <h1 className="text-2xl font-semibold mt-2">Edit document — {doc.docNumber}</h1>
        </header>

        {error && (
          <p className="text-amber-500 text-sm mb-4">
            {error === "update" && "Could not update document."}
            {error === "grantor" && "Could not add grantor."}
            {error === "grantee" && "Could not add grantee."}
          </p>
        )}

        <form action={"/api/universa/documents/" + id} method="POST" className="rounded-lg bg-neutral-900 p-4 space-y-4 mb-8">
          <p className="text-neutral-500 text-sm">Doc #: <span className="font-mono text-neutral-300">{doc.docNumber}</span> (cannot change)</p>
          {/* Preserve fields not in this form */}
          <input type="hidden" name="documentNumberAlt" defaultValue={doc.documentNumberAlt ?? ""} />
          <input type="hidden" name="recReqBy" defaultValue={doc.recReqBy ?? ""} />
          <input type="hidden" name="sendTo" defaultValue={doc.sendTo ?? ""} />
          <input type="hidden" name="sendAdrs" defaultValue={doc.sendAdrs ?? ""} />
          <input type="hidden" name="sendAdrs2" defaultValue={doc.sendAdrs2 ?? ""} />
          <input type="hidden" name="sendTaxTo" defaultValue={doc.sendTaxTo ?? ""} />
          <input type="hidden" name="sendTaxAdrs" defaultValue={doc.sendTaxAdrs ?? ""} />
          <input type="hidden" name="sendTaxAdrs2" defaultValue={doc.sendTaxAdrs2 ?? ""} />
          <input type="hidden" name="considerationOther" defaultValue={doc.considerationOther ?? ""} />
          <input type="hidden" name="lot" defaultValue={doc.lot ?? ""} />
          <input type="hidden" name="block" defaultValue={doc.block ?? ""} />
          <input type="hidden" name="tract" defaultValue={doc.tract ?? ""} />
          <input type="hidden" name="book" defaultValue={doc.book ?? ""} />
          <input type="hidden" name="pages" defaultValue={doc.pages ?? ""} />
          <input type="hidden" name="parcelNumber" defaultValue={doc.parcelNumber ?? ""} />
          <input type="hidden" name="propertyAdrs2" defaultValue={doc.propertyAdrs2 ?? ""} />
          <input type="hidden" name="propertyAdrs3" defaultValue={doc.propertyAdrs3 ?? ""} />
          <input type="hidden" name="notarizationDate" defaultValue={dateStr(doc.notarizationDate)} />
          <input type="hidden" name="signerTitle" defaultValue={doc.signerTitle ?? ""} />
          <input type="hidden" name="signedBy2" defaultValue={doc.signedBy2 ?? ""} />
          <input type="hidden" name="signer2Title" defaultValue={doc.signer2Title ?? ""} />
          <input type="hidden" name="signedBy3" defaultValue={doc.signedBy3 ?? ""} />
          <input type="hidden" name="signer3Title" defaultValue={doc.signer3Title ?? ""} />
          <input type="hidden" name="numberOfPages" defaultValue={doc.numberOfPages ?? ""} />
          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="block text-sm text-neutral-400 mb-1">Document title</label>
              <input type="text" name="documentTitle" defaultValue={doc.documentTitle ?? ""} className="w-full rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-neutral-400 mb-1">Recorded date</label>
                <input type="date" name="recordedAt" defaultValue={dateStr(doc.recordedAt)} className="w-full rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700" />
              </div>
              <div>
                <label className="block text-sm text-neutral-400 mb-1">Date signed</label>
                <input type="date" name="dateSigned" defaultValue={dateStr(doc.dateSigned)} className="w-full rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700" />
              </div>
            </div>
            <div>
              <label className="block text-sm text-neutral-400 mb-1">Consideration amount</label>
              <input type="text" name="considerationAmt" defaultValue={doc.considerationAmt ?? ""} className="w-full rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700" />
            </div>
            <div>
              <label className="block text-sm text-neutral-400 mb-1">Property county</label>
              <input type="text" name="propertyCounty" defaultValue={doc.propertyCounty ?? ""} className="w-full rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700" />
            </div>
            <div>
              <label className="block text-sm text-neutral-400 mb-1">Property address</label>
              <input type="text" name="propertyAdrs" defaultValue={doc.propertyAdrs ?? ""} className="w-full rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700" />
            </div>
            <div>
              <label className="block text-sm text-neutral-400 mb-1">Notary name</label>
              <input type="text" name="notaryName" defaultValue={doc.notaryName ?? ""} className="w-full rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700" />
            </div>
            <div>
              <label className="block text-sm text-neutral-400 mb-1">Signed by</label>
              <input type="text" name="signedBy" defaultValue={doc.signedBy ?? ""} className="w-full rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700" />
            </div>
            <div>
              <label className="block text-sm text-neutral-400 mb-1">Comments</label>
              <textarea name="comments" rows={2} defaultValue={doc.comments ?? ""} className="w-full rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700" />
            </div>
          </div>
          <button type="submit" className="rounded bg-emerald-700 px-4 py-2 text-sm text-white hover:bg-emerald-600">Save document</button>
        </form>

        <section className="mb-8">
          <h2 className="text-lg font-medium text-neutral-300 mb-3">Grantors</h2>
          {doc.grantors.length === 0 ? (
            <p className="text-neutral-500 text-sm mb-3">None. Add below.</p>
          ) : (
            <ul className="space-y-3 mb-4">
              {doc.grantors.map((g) => (
                <li key={g.id} className="rounded bg-neutral-900 p-3 text-sm">
                  <form action={"/api/universa/grantors/" + g.id} method="POST" className="space-y-2">
                    <input type="text" name="name" defaultValue={g.name ?? ""} placeholder="Name" className="rounded bg-neutral-800 px-2 py-1 text-white border border-neutral-700 w-full max-w-xs" />
                    <input type="text" name="address" defaultValue={g.address ?? ""} placeholder="Address" className="rounded bg-neutral-800 px-2 py-1 text-white border border-neutral-700 w-full text-xs" />
                    <input type="hidden" name="grantorNumber" defaultValue={g.grantorNumber ?? ""} />
                    <input type="hidden" name="address2" defaultValue={g.address2 ?? ""} />
                    <input type="hidden" name="address3" defaultValue={g.address3 ?? ""} />
                    <input type="hidden" name="percentShare" defaultValue={g.percentShare ?? ""} />
                    <input type="hidden" name="comment" defaultValue={g.comment ?? ""} />
                    <div className="flex gap-2">
                      <button type="submit" className="rounded bg-neutral-600 px-2 py-1 text-xs text-white hover:bg-neutral-500">Save</button>
                      <form action={"/api/universa/grantors/" + g.id + "/delete"} method="POST" className="inline">
                        <button type="submit" className="rounded bg-red-900/50 px-2 py-1 text-xs text-red-200 hover:bg-red-800/50">Delete</button>
                      </form>
                    </div>
                  </form>
                </li>
              ))}
            </ul>
          )}
          <form action={"/api/universa/documents/" + id + "/grantors"} method="POST" className="rounded bg-neutral-900 p-3 space-y-2">
            <p className="text-neutral-500 text-sm mb-2">Add grantor</p>
            <input type="text" name="name" placeholder="Name" className="rounded bg-neutral-800 px-2 py-1 text-white border border-neutral-700 w-full" />
            <input type="text" name="address" placeholder="Address" className="rounded bg-neutral-800 px-2 py-1 text-white border border-neutral-700 w-full text-sm" />
            <button type="submit" className="rounded bg-emerald-700 px-3 py-1 text-sm text-white hover:bg-emerald-600">Add grantor</button>
          </form>
        </section>

        <section>
          <h2 className="text-lg font-medium text-neutral-300 mb-3">Grantees</h2>
          {doc.grantees.length === 0 ? (
            <p className="text-neutral-500 text-sm mb-3">None. Add below.</p>
          ) : (
            <ul className="space-y-3 mb-4">
              {doc.grantees.map((g) => (
                <li key={g.id} className="rounded bg-neutral-900 p-3 text-sm">
                  <form action={"/api/universa/grantees/" + g.id} method="POST" className="space-y-2">
                    <input type="text" name="name" defaultValue={g.name ?? ""} placeholder="Name" className="rounded bg-neutral-800 px-2 py-1 text-white border border-neutral-700 w-full max-w-xs" />
                    <input type="text" name="address" defaultValue={g.address ?? ""} placeholder="Address" className="rounded bg-neutral-800 px-2 py-1 text-white border border-neutral-700 w-full text-xs" />
                    <input type="hidden" name="granteeNumber" defaultValue={g.granteeNumber ?? ""} />
                    <input type="hidden" name="address2" defaultValue={g.address2 ?? ""} />
                    <input type="hidden" name="address3" defaultValue={g.address3 ?? ""} />
                    <input type="hidden" name="percentShare" defaultValue={g.percentShare ?? ""} />
                    <input type="hidden" name="comment" defaultValue={g.comment ?? ""} />
                    <div className="flex gap-2">
                      <button type="submit" className="rounded bg-neutral-600 px-2 py-1 text-xs text-white hover:bg-neutral-500">Save</button>
                      <form action={"/api/universa/grantees/" + g.id + "/delete"} method="POST" className="inline">
                        <button type="submit" className="rounded bg-red-900/50 px-2 py-1 text-xs text-red-200 hover:bg-red-800/50">Delete</button>
                      </form>
                    </div>
                  </form>
                </li>
              ))}
            </ul>
          )}
          <form action={"/api/universa/documents/" + id + "/grantees"} method="POST" className="rounded bg-neutral-900 p-3 space-y-2">
            <p className="text-neutral-500 text-sm mb-2">Add grantee</p>
            <input type="text" name="name" placeholder="Name" className="rounded bg-neutral-800 px-2 py-1 text-white border border-neutral-700 w-full" />
            <input type="text" name="address" placeholder="Address" className="rounded bg-neutral-800 px-2 py-1 text-white border border-neutral-700 w-full text-sm" />
            <button type="submit" className="rounded bg-emerald-700 px-3 py-1 text-sm text-white hover:bg-emerald-600">Add grantee</button>
          </form>
        </section>
      </div>
    </main>
  );
}
