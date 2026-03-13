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

function FormSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-400 border-b border-neutral-700 pb-1">
        {title}
      </h3>
      {children}
    </section>
  );
}

function FormField({
  label,
  name,
  defaultValue,
  type = "text",
  placeholder,
  rows,
}: {
  label: string;
  name: string;
  defaultValue?: string | number | null;
  type?: string;
  placeholder?: string;
  rows?: number;
}) {
  const value = defaultValue != null && defaultValue !== "" ? String(defaultValue) : "";
  const inputClass =
    "w-full rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700 focus:border-neutral-500 focus:outline-none";
  return (
    <div>
      <label className="block text-sm text-neutral-400 mb-1">{label}</label>
      {rows ? (
        <textarea
          name={name}
          defaultValue={value}
          rows={rows}
          placeholder={placeholder}
          className={inputClass}
        />
      ) : (
        <input
          type={type}
          name={name}
          defaultValue={value}
          placeholder={placeholder}
          className={inputClass}
        />
      )}
    </div>
  );
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
  const [doc, persons, members] = await Promise.all([
    prisma.universaDocument.findUnique({
      where: { id },
      include: {
        grantors: { orderBy: { sortOrder: "asc" }, include: { person: { select: { id: true, personalId: true, lastName: true, firstName: true } } } },
        grantees: { orderBy: { sortOrder: "asc" }, include: { person: { select: { id: true, personalId: true, lastName: true, firstName: true } } } },
      },
    }),
    prisma.universaPerson.findMany({ orderBy: [{ lastName: "asc" }, { firstName: "asc" }], select: { id: true, personalId: true, lastName: true, firstName: true, middle: true } }),
    prisma.member.findMany({ orderBy: [{ lastName: "asc" }, { firstName: "asc" }, { email: "asc" }], select: { id: true, email: true, firstName: true, lastName: true } }),
  ]);
  if (!doc) notFound();

  function personLabel(p: { personalId: string | null; lastName: string | null; firstName: string | null; middle?: string | null }) {
    const parts = [p.lastName, p.firstName, p.middle].filter(Boolean);
    const name = parts.length ? parts.join(", ") : "—";
    return p.personalId ? `${name} (${p.personalId})` : name;
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 p-6">
      <div className="max-w-3xl mx-auto">
        <header className="border-b border-neutral-800 pb-4 mb-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <Link href="/admin/documents" className="text-neutral-400 hover:text-white text-sm">
                ← Documents
              </Link>
              <h1 className="text-2xl font-semibold mt-2">Edit document — {doc.docNumber}</h1>
            </div>
            <form action={"/api/universa/documents/" + id + "/duplicate"} method="POST" className="flex gap-2">
              <input type="text" name="newDocNumber" placeholder="New Doc # (optional)" className="rounded bg-neutral-800 px-2 py-1 text-sm text-white border border-neutral-700 w-36" />
              <button type="submit" className="rounded border border-neutral-600 px-3 py-1.5 text-sm text-neutral-300 hover:bg-neutral-800">Duplicate document</button>
            </form>
          </div>
        </header>

        {error && (
          <p className="text-amber-500 text-sm mb-4">
            {error === "update" && "Could not update document."}
            {error === "grantor" && "Could not add grantor. Enter a name or link to a person."}
            {error === "grantee" && "Could not add grantee. Enter a name or link to a person."}
            {error === "duplicate" && "That Doc # is already in use."}
            {error === "copy" && "Could not duplicate document."}
            {error === "invalid_date" && "Invalid date. Use a valid date (e.g. YYYY-MM-DD)."}
          </p>
        )}

        <form
          action={"/api/universa/documents/" + id}
          method="POST"
          className="rounded-lg bg-neutral-900 p-6 space-y-6 mb-8"
        >
          <FormSection title="Document">
            <p className="text-neutral-500 text-sm">
              Doc #: <span className="font-mono text-neutral-300">{doc.docNumber}</span> (cannot
              change)
            </p>
            <div>
              <label className="block text-sm text-neutral-400 mb-1">Portal member (read-only in portal)</label>
              <select name="memberId" defaultValue={doc.memberId ?? ""} className="w-full rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700 focus:border-neutral-500 focus:outline-none">
                <option value="">None</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {[m.firstName, m.lastName].filter(Boolean).join(" ") || m.email} ({m.email})
                  </option>
                ))}
              </select>
              <p className="text-neutral-500 text-xs mt-0.5">If set, this member can view this document in the portal (read-only).</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField
                label="Document number (alt)"
                name="documentNumberAlt"
                defaultValue={doc.documentNumberAlt}
                placeholder="Alternate doc number"
              />
              <FormField
                label="Document title"
                name="documentTitle"
                defaultValue={doc.documentTitle}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField
                label="Recorded date"
                name="recordedAt"
                defaultValue={dateStr(doc.recordedAt)}
                type="date"
              />
              <FormField
                label="Rec. req. by"
                name="recReqBy"
                defaultValue={doc.recReqBy}
                placeholder="Recording requested by"
              />
            </div>
          </FormSection>

          <FormSection title="Property">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <FormField label="Property county" name="propertyCounty" defaultValue={doc.propertyCounty} />
              <FormField label="Lot" name="lot" defaultValue={doc.lot} />
              <FormField label="Block" name="block" defaultValue={doc.block} />
              <FormField label="Tract" name="tract" defaultValue={doc.tract} />
              <FormField label="Book" name="book" defaultValue={doc.book} />
              <FormField label="Pages" name="pages" defaultValue={doc.pages} />
              <FormField label="Parcel #" name="parcelNumber" defaultValue={doc.parcelNumber} />
            </div>
            <FormField label="Property address" name="propertyAdrs" defaultValue={doc.propertyAdrs} />
            <FormField label="Property address 2" name="propertyAdrs2" defaultValue={doc.propertyAdrs2} />
            <FormField label="Property address 3" name="propertyAdrs3" defaultValue={doc.propertyAdrs3} />
          </FormSection>

          <FormSection title="Consideration">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField
                label="Consideration amount"
                name="considerationAmt"
                defaultValue={doc.considerationAmt}
              />
              <FormField
                label="Consideration other"
                name="considerationOther"
                defaultValue={doc.considerationOther}
              />
            </div>
          </FormSection>

          <FormSection title="Send to / Tax">
            <FormField label="Send to" name="sendTo" defaultValue={doc.sendTo} />
            <FormField label="Send address" name="sendAdrs" defaultValue={doc.sendAdrs} />
            <FormField label="Send address 2" name="sendAdrs2" defaultValue={doc.sendAdrs2} />
            <FormField label="Send Tax To" name="sendTaxTo" defaultValue={doc.sendTaxTo} />
            <FormField label="Send Tax address" name="sendTaxAdrs" defaultValue={doc.sendTaxAdrs} />
            <FormField label="Send Tax address 2" name="sendTaxAdrs2" defaultValue={doc.sendTaxAdrs2} />
          </FormSection>

          <FormSection title="Signing / Notary">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField label="Notary name" name="notaryName" defaultValue={doc.notaryName} />
              <FormField
                label="Notarization date"
                name="notarizationDate"
                defaultValue={dateStr(doc.notarizationDate)}
                type="date"
              />
              <FormField label="Date signed" name="dateSigned" defaultValue={dateStr(doc.dateSigned)} type="date" />
              <FormField
                label="# of pages"
                name="numberOfPages"
                defaultValue={doc.numberOfPages ?? ""}
                type="number"
                placeholder=""
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField label="Signed by" name="signedBy" defaultValue={doc.signedBy} />
              <FormField label="Signer title" name="signerTitle" defaultValue={doc.signerTitle} />
              <FormField label="Signed by 2" name="signedBy2" defaultValue={doc.signedBy2} />
              <FormField label="Signer 2 title" name="signer2Title" defaultValue={doc.signer2Title} />
              <FormField label="Signed by 3" name="signedBy3" defaultValue={doc.signedBy3} />
              <FormField label="Signer 3 title" name="signer3Title" defaultValue={doc.signer3Title} />
            </div>
          </FormSection>

          <FormSection title="Comments">
            <FormField label="Comments" name="comments" defaultValue={doc.comments} rows={3} />
          </FormSection>

          <button
            type="submit"
            className="rounded bg-emerald-700 px-4 py-2 text-sm text-white hover:bg-emerald-600"
          >
            Save document
          </button>
        </form>

        <section className="mb-8">
          <h2 className="text-lg font-medium text-neutral-300 mb-3">Grantors</h2>
          {doc.grantors.length === 0 ? (
            <p className="text-neutral-500 text-sm mb-3">None. Add below.</p>
          ) : (
            <ul className="space-y-4 mb-4">
              {doc.grantors.map((g) => (
                <li key={g.id} className="rounded-lg bg-neutral-900 p-4 border border-neutral-800">
                  <form action={"/api/universa/grantors/" + g.id} method="POST" className="space-y-3">
                    <div>
                      <label className="block text-sm text-neutral-400 mb-1">Link to person</label>
                      <select name="universaPersonId" defaultValue={g.person?.id ?? ""} className="w-full rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700 focus:border-neutral-500 focus:outline-none">
                        <option value="">None</option>
                        {persons.map((p) => (
                          <option key={p.id} value={p.id}>{personLabel(p)}</option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <FormField label="Grantor #" name="grantorNumber" defaultValue={g.grantorNumber} />
                      <FormField label="Name" name="name" defaultValue={g.name} />
                    </div>
                    <FormField label="Address" name="address" defaultValue={g.address} />
                    <FormField label="Address 2" name="address2" defaultValue={g.address2} />
                    <FormField label="Address 3" name="address3" defaultValue={g.address3} />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <FormField label="% share" name="percentShare" defaultValue={g.percentShare} />
                      <FormField label="Comment" name="comment" defaultValue={g.comment} />
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="rounded bg-neutral-600 px-3 py-1.5 text-sm text-white hover:bg-neutral-500"
                      >
                        Save
                      </button>
                      <form action={"/api/universa/grantors/" + g.id + "/delete"} method="POST" className="inline">
                        <button
                          type="submit"
                          className="rounded bg-red-900/50 px-3 py-1.5 text-sm text-red-200 hover:bg-red-800/50"
                        >
                          Delete
                        </button>
                      </form>
                    </div>
                  </form>
                </li>
              ))}
            </ul>
          )}
          <div className="rounded-lg bg-neutral-900 p-4 border border-neutral-800 border-dashed">
            <p className="text-neutral-500 text-sm mb-3">Add grantor</p>
            <form action={"/api/universa/documents/" + id + "/grantors"} method="POST" className="space-y-3">
              <div>
                <label className="block text-sm text-neutral-400 mb-1">Link to person</label>
                <select name="universaPersonId" className="w-full rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700 focus:border-neutral-500 focus:outline-none">
                  <option value="">None</option>
                  {persons.map((p) => (
                    <option key={p.id} value={p.id}>{personLabel(p)}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <FormField label="Grantor #" name="grantorNumber" placeholder="Optional" />
                <FormField label="Name" name="name" placeholder="Required if not linking to a person" />
              </div>
              <p className="text-neutral-500 text-xs">Provide either a name or link to a person above.</p>
              <FormField label="Address" name="address" />
              <FormField label="Address 2" name="address2" />
              <FormField label="Address 3" name="address3" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <FormField label="% share" name="percentShare" />
                <FormField label="Comment" name="comment" />
              </div>
              <button
                type="submit"
                className="rounded bg-emerald-700 px-3 py-1.5 text-sm text-white hover:bg-emerald-600"
              >
                Add grantor
              </button>
            </form>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-medium text-neutral-300 mb-3">Grantees</h2>
          {doc.grantees.length === 0 ? (
            <p className="text-neutral-500 text-sm mb-3">None. Add below.</p>
          ) : (
            <ul className="space-y-4 mb-4">
              {doc.grantees.map((g) => (
                <li key={g.id} className="rounded-lg bg-neutral-900 p-4 border border-neutral-800">
                  <form action={"/api/universa/grantees/" + g.id} method="POST" className="space-y-3">
                    <div>
                      <label className="block text-sm text-neutral-400 mb-1">Link to person</label>
                      <select name="universaPersonId" defaultValue={g.person?.id ?? ""} className="w-full rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700 focus:border-neutral-500 focus:outline-none">
                        <option value="">None</option>
                        {persons.map((p) => (
                          <option key={p.id} value={p.id}>{personLabel(p)}</option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <FormField label="Grantee #" name="granteeNumber" defaultValue={g.granteeNumber} />
                      <FormField label="Name" name="name" defaultValue={g.name} />
                    </div>
                    <FormField label="Address" name="address" defaultValue={g.address} />
                    <FormField label="Address 2" name="address2" defaultValue={g.address2} />
                    <FormField label="Address 3" name="address3" defaultValue={g.address3} />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <FormField label="% share" name="percentShare" defaultValue={g.percentShare} />
                      <FormField label="Comment" name="comment" defaultValue={g.comment} />
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="rounded bg-neutral-600 px-3 py-1.5 text-sm text-white hover:bg-neutral-500"
                      >
                        Save
                      </button>
                      <form action={"/api/universa/grantees/" + g.id + "/delete"} method="POST" className="inline">
                        <button
                          type="submit"
                          className="rounded bg-red-900/50 px-3 py-1.5 text-sm text-red-200 hover:bg-red-800/50"
                        >
                          Delete
                        </button>
                      </form>
                    </div>
                  </form>
                </li>
              ))}
            </ul>
          )}
          <div className="rounded-lg bg-neutral-900 p-4 border border-neutral-800 border-dashed">
            <p className="text-neutral-500 text-sm mb-3">Add grantee</p>
            <form action={"/api/universa/documents/" + id + "/grantees"} method="POST" className="space-y-3">
              <div>
                <label className="block text-sm text-neutral-400 mb-1">Link to person</label>
                <select name="universaPersonId" className="w-full rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700 focus:border-neutral-500 focus:outline-none">
                  <option value="">None</option>
                  {persons.map((p) => (
                    <option key={p.id} value={p.id}>{personLabel(p)}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <FormField label="Grantee #" name="granteeNumber" placeholder="Optional" />
                <FormField label="Name" name="name" placeholder="Required if not linking to a person" />
              </div>
              <p className="text-neutral-500 text-xs">Provide either a name or link to a person above.</p>
              <FormField label="Address" name="address" />
              <FormField label="Address 2" name="address2" />
              <FormField label="Address 3" name="address3" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <FormField label="% share" name="percentShare" />
                <FormField label="Comment" name="comment" />
              </div>
              <button
                type="submit"
                className="rounded bg-emerald-700 px-3 py-1.5 text-sm text-white hover:bg-emerald-600"
              >
                Add grantee
              </button>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
