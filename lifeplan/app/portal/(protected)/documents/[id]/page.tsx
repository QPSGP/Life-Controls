import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getMemberIdFromCookie } from "@/lib/member-auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

function formatDate(d: Date | null): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString();
}

export default async function PortalDocumentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const memberId = await getMemberIdFromCookie();
  if (!memberId) redirect("/login");

  const { id } = await params;
  const doc = await prisma.universaDocument.findFirst({
    where: { id, memberId },
    include: {
      grantors: { orderBy: { sortOrder: "asc" } },
      grantees: { orderBy: { sortOrder: "asc" } },
    },
  });
  if (!doc) notFound();

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 p-6">
      <div className="max-w-3xl mx-auto">
        <header className="border-b border-neutral-800 pb-4 mb-6">
          <Link href="/portal/documents" className="text-neutral-400 hover:text-white text-sm">← My documents</Link>
          <h1 className="text-2xl font-semibold mt-2">{doc.docNumber}</h1>
          {doc.documentTitle && (
            <p className="text-neutral-400 mt-0.5">{doc.documentTitle}</p>
          )}
          <p className="text-neutral-500 text-sm mt-1">Read-only</p>
        </header>

        <div className="space-y-6 rounded-lg bg-neutral-900 p-6">
          <section>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-400 border-b border-neutral-700 pb-1 mb-3">Document</h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              <div><dt className="text-neutral-500">Doc #</dt><dd className="font-mono">{doc.docNumber}</dd></div>
              {doc.documentNumberAlt && <div><dt className="text-neutral-500">Document number (alt)</dt><dd>{doc.documentNumberAlt}</dd></div>}
              <div><dt className="text-neutral-500">Recorded</dt><dd>{formatDate(doc.recordedAt)}</dd></div>
              <div><dt className="text-neutral-500">Rec. req. by</dt><dd>{doc.recReqBy ?? "—"}</dd></div>
            </dl>
          </section>

          {(doc.propertyCounty || doc.lot || doc.block || doc.propertyAdrs) && (
            <section>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-400 border-b border-neutral-700 pb-1 mb-3">Property</h2>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                {doc.propertyCounty && <div><dt className="text-neutral-500">County</dt><dd>{doc.propertyCounty}</dd></div>}
                {doc.lot && <div><dt className="text-neutral-500">Lot</dt><dd>{doc.lot}</dd></div>}
                {doc.block && <div><dt className="text-neutral-500">Block</dt><dd>{doc.block}</dd></div>}
                {doc.tract && <div><dt className="text-neutral-500">Tract</dt><dd>{doc.tract}</dd></div>}
                {doc.book && <div><dt className="text-neutral-500">Book</dt><dd>{doc.book}</dd></div>}
                {doc.pages && <div><dt className="text-neutral-500">Pages</dt><dd>{doc.pages}</dd></div>}
                {doc.parcelNumber && <div><dt className="text-neutral-500">Parcel #</dt><dd>{doc.parcelNumber}</dd></div>}
                {doc.propertyAdrs && <div className="sm:col-span-2"><dt className="text-neutral-500">Property address</dt><dd>{doc.propertyAdrs}</dd></div>}
              </dl>
            </section>
          )}

          {doc.grantors.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-400 border-b border-neutral-700 pb-1 mb-3">Grantors</h2>
              <ul className="space-y-2 text-sm">
                {doc.grantors.map((g) => (
                  <li key={g.id} className="rounded bg-neutral-800 p-3">
                    <span className="font-medium">{g.name ?? "—"}</span>
                    {g.grantorNumber && <span className="text-neutral-500 ml-2">#{g.grantorNumber}</span>}
                    {g.address && <p className="text-neutral-400 mt-0.5">{g.address}</p>}
                    {g.percentShare && <p className="text-neutral-500 text-xs">{g.percentShare}%</p>}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {doc.grantees.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-400 border-b border-neutral-700 pb-1 mb-3">Grantees</h2>
              <ul className="space-y-2 text-sm">
                {doc.grantees.map((g) => (
                  <li key={g.id} className="rounded bg-neutral-800 p-3">
                    <span className="font-medium">{g.name ?? "—"}</span>
                    {g.granteeNumber && <span className="text-neutral-500 ml-2">#{g.granteeNumber}</span>}
                    {g.address && <p className="text-neutral-400 mt-0.5">{g.address}</p>}
                    {g.percentShare && <p className="text-neutral-500 text-xs">{g.percentShare}%</p>}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {(doc.considerationAmt || doc.comments) && (
            <section>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-400 border-b border-neutral-700 pb-1 mb-3">Other</h2>
              <dl className="text-sm space-y-1">
                {doc.considerationAmt && <div><dt className="text-neutral-500">Consideration</dt><dd>{doc.considerationAmt}</dd></div>}
                {doc.comments && <div><dt className="text-neutral-500">Comments</dt><dd className="whitespace-pre-wrap">{doc.comments}</dd></div>}
              </dl>
            </section>
          )}
        </div>
      </div>
    </main>
  );
}
