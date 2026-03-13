import { redirect } from "next/navigation";
import Link from "next/link";
import { getMemberIdFromCookie } from "@/lib/member-auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function PortalDocumentsPage() {
  const memberId = await getMemberIdFromCookie();
  if (!memberId) redirect("/login");

  const documents = await prisma.universaDocument.findMany({
    where: { memberId },
    orderBy: { recordedAt: "desc" },
    select: {
      id: true,
      docNumber: true,
      documentTitle: true,
      recordedAt: true,
      dateSigned: true,
    },
  });

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 p-6">
      <div className="max-w-2xl mx-auto">
        <header className="border-b border-neutral-800 pb-4 mb-6">
          <Link href="/portal" className="text-neutral-400 hover:text-white text-sm">← My account</Link>
          <h1 className="text-2xl font-semibold mt-2">My documents</h1>
          <p className="text-neutral-500 text-sm mt-0.5">Read-only view of documents shared with you.</p>
        </header>

        {documents.length === 0 ? (
          <p className="text-neutral-500 text-sm">No documents have been shared with you yet.</p>
        ) : (
          <ul className="space-y-2">
            {documents.map((d) => (
              <li key={d.id}>
                <Link
                  href={"/portal/documents/" + d.id}
                  className="block rounded-lg bg-neutral-900 p-4 text-white hover:bg-neutral-800 border border-neutral-800"
                >
                  <span className="font-medium">{d.docNumber}</span>
                  {d.documentTitle && (
                    <span className="text-neutral-400 ml-2">— {d.documentTitle}</span>
                  )}
                  {d.recordedAt && (
                    <p className="text-neutral-500 text-sm mt-1">
                      Recorded {new Date(d.recordedAt).toLocaleDateString()}
                    </p>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
