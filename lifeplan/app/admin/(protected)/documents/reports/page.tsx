"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type ReportRow = Record<string, string | undefined>;

type QueryType =
  | "full"
  | "byDate"
  | "byGrantee"
  | "byGrantor"
  | "byTitle"
  | "bySigner"
  | "property"
  | "byDocNumber"
  | "sendTo"
  | "consider"
  | "deed";

export default function AdminDocumentsReportsPage() {
  const [rows, setRows] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState<QueryType>("full");
  const [recordedFrom, setRecordedFrom] = useState("");
  const [recordedTo, setRecordedTo] = useState("");
  const [nameSearch, setNameSearch] = useState("");
  const [titleSearch, setTitleSearch] = useState("");
  const [signerSearch, setSignerSearch] = useState("");
  const [docNumberSearch, setDocNumberSearch] = useState("");

  const fetchReport = () => {
    setLoading(true);
    const params = new URLSearchParams({ query, format: "json" });
    if (recordedFrom) params.set("recordedFrom", recordedFrom);
    if (recordedTo) params.set("recordedTo", recordedTo);
    if (nameSearch.trim() && (query === "byGrantee" || query === "byGrantor")) params.set("name", nameSearch.trim());
    if (titleSearch.trim() && query === "byTitle") params.set("title", titleSearch.trim());
    if (signerSearch.trim() && query === "bySigner") params.set("signer", signerSearch.trim());
    if (docNumberSearch.trim() && query === "byDocNumber") params.set("docNumber", docNumberSearch.trim());
    fetch(`/api/universa/reports?${params.toString()}`, { credentials: "include" })
      .then((res) => {
        if (res.status === 401) {
          window.location.href = "/admin/login";
          return null;
        }
        if (!res.ok) throw new Error(`Failed ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (data != null) {
          const docs = data.documents ?? [];
          setRows(docs.map((r: Record<string, unknown>) => stringifyRow(r)));
        }
      })
      .catch((e) => setError(e instanceof Error ? e.message : String(e)))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Run on query preset change; filters applied via Run
  }, [query]);

  const csvUrl = () => {
    const params = new URLSearchParams({ query, format: "csv" });
    if (recordedFrom) params.set("recordedFrom", recordedFrom);
    if (recordedTo) params.set("recordedTo", recordedTo);
    if (nameSearch.trim() && (query === "byGrantee" || query === "byGrantor")) params.set("name", nameSearch.trim());
    if (titleSearch.trim() && query === "byTitle") params.set("title", titleSearch.trim());
    if (signerSearch.trim() && query === "bySigner") params.set("signer", signerSearch.trim());
    if (docNumberSearch.trim() && query === "byDocNumber") params.set("docNumber", docNumberSearch.trim());
    return `/api/universa/reports?${params.toString()}`;
  };

  const dateFilterQueries: QueryType[] = ["full", "byDate", "property", "byDocNumber", "sendTo", "consider", "deed"];

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 p-6">
      <div className="max-w-6xl mx-auto">
        <header className="flex items-center justify-between border-b border-neutral-800 pb-4 mb-6">
          <h1 className="text-2xl font-semibold">Documents — Reports &amp; queries</h1>
          <div className="flex items-center gap-4">
            <Link href="/admin/documents" className="text-neutral-400 hover:text-white text-sm">
              ← List documents
            </Link>
            <Link href="/admin" className="text-neutral-400 hover:text-white text-sm">
              Admin
            </Link>
          </div>
        </header>

        <section className="mb-6 rounded bg-neutral-900 p-4">
          <h2 className="text-sm font-medium text-neutral-400 mb-3">Query / report</h2>
          <p className="text-xs text-neutral-500 mb-3">
            Presets <strong>Send / signers</strong>, <strong>Consideration + property</strong>, and <strong>Deed lines</strong> mirror legacy UNIVERSA GROSS queries (1Q, CONSIDER, QUERY1-style). Use <strong>Doc #</strong> to narrow by document number.
          </p>
          <div className="flex flex-wrap items-end gap-3">
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-neutral-500">View</span>
              <select
                value={query}
                onChange={(e) => setQuery(e.target.value as QueryType)}
                className="rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700 max-w-[280px]"
              >
                <option value="full">Full list (all documents)</option>
                <option value="byDate">By recorded date range</option>
                <option value="byDocNumber">By document # (contains)</option>
                <option value="byTitle">By document title (contains)</option>
                <option value="bySigner">By signer name (contains)</option>
                <option value="byGrantee">By grantee name</option>
                <option value="byGrantor">By grantor name</option>
                <option value="property">Property focus (lot, block, tract, etc.)</option>
                <option value="sendTo">Send to / property / signers (legacy 1Q)</option>
                <option value="consider">Consideration + property lines (CONSIDER)</option>
                <option value="deed">Deed-style — one row per grantee (QUERY1-style)</option>
              </select>
            </label>
            {dateFilterQueries.includes(query) && (
              <>
                <label className="flex flex-col gap-1 text-sm">
                  <span className="text-neutral-500">Recorded from</span>
                  <input
                    type="date"
                    value={recordedFrom}
                    onChange={(e) => setRecordedFrom(e.target.value)}
                    className="rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700"
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm">
                  <span className="text-neutral-500">Recorded to</span>
                  <input
                    type="date"
                    value={recordedTo}
                    onChange={(e) => setRecordedTo(e.target.value)}
                    className="rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700"
                  />
                </label>
              </>
            )}
            {query === "byDocNumber" && (
              <label className="flex flex-col gap-1 text-sm">
                <span className="text-neutral-500">Doc # contains</span>
                <input
                  type="text"
                  value={docNumberSearch}
                  onChange={(e) => setDocNumberSearch(e.target.value)}
                  placeholder="e.g. 2024-"
                  className="rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700 min-w-[160px]"
                />
              </label>
            )}
            {query === "byTitle" && (
              <label className="flex flex-col gap-1 text-sm">
                <span className="text-neutral-500">Title contains</span>
                <input
                  type="text"
                  value={titleSearch}
                  onChange={(e) => setTitleSearch(e.target.value)}
                  placeholder="e.g. Judgement"
                  className="rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700 min-w-[180px]"
                />
              </label>
            )}
            {query === "bySigner" && (
              <label className="flex flex-col gap-1 text-sm">
                <span className="text-neutral-500">Signer name contains</span>
                <input
                  type="text"
                  value={signerSearch}
                  onChange={(e) => setSignerSearch(e.target.value)}
                  placeholder="e.g. Bernard Gross"
                  className="rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700 min-w-[180px]"
                />
              </label>
            )}
            {(query === "byGrantee" || query === "byGrantor") && (
              <label className="flex flex-col gap-1 text-sm">
                <span className="text-neutral-500">{query === "byGrantee" ? "Grantee name contains" : "Grantor name contains"}</span>
                <input
                  type="text"
                  value={nameSearch}
                  onChange={(e) => setNameSearch(e.target.value)}
                  placeholder="Search…"
                  className="rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700 min-w-[180px]"
                />
              </label>
            )}
            <button type="button" onClick={fetchReport} className="rounded bg-emerald-700 px-4 py-2 text-sm text-white hover:bg-emerald-600">
              Run
            </button>
            <a href={csvUrl()} className="rounded bg-neutral-700 px-4 py-2 text-sm text-white hover:bg-neutral-600" target="_blank" rel="noopener noreferrer">
              Download CSV
            </a>
          </div>
        </section>

        {error && <div className="mb-4 p-4 rounded bg-amber-950/50 border border-amber-800 text-amber-200 text-sm">{error}</div>}

        {loading ? (
          <p className="text-neutral-500">Loading…</p>
        ) : rows.length === 0 ? (
          <p className="text-neutral-500">No documents match. Try different filters or add data.</p>
        ) : (
          <ReportTable query={query} rows={rows} />
        )}
      </div>
    </main>
  );
}

function stringifyRow(r: Record<string, unknown>): ReportRow {
  const out: ReportRow = {};
  for (const [k, v] of Object.entries(r)) {
    if (k === "grantors" || k === "grantees") continue;
    out[k] = v == null ? "" : typeof v === "string" ? v : String(v);
  }
  return out;
}

function ReportTable({ query, rows }: { query: QueryType; rows: ReportRow[] }) {
  if (query === "sendTo") {
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-neutral-700 text-left text-neutral-400">
              <th className="py-2 pr-3">Doc #</th>
              <th className="py-2 pr-3">Title</th>
              <th className="py-2 pr-3">Recorded</th>
              <th className="py-2 pr-3">Send to</th>
              <th className="py-2 pr-3">Send adrs</th>
              <th className="py-2 pr-3">Property</th>
              <th className="py-2 pr-3">Signed by</th>
              <th className="py-2 pr-3">Grantees</th>
              <th className="py-2 pr-3">Grantors</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-neutral-800 hover:bg-neutral-900/50">
                <td className="py-2 pr-3 font-mono text-neutral-300 whitespace-nowrap">{r.docNumber}</td>
                <td className="py-2 pr-3 max-w-[120px] truncate" title={r.documentTitle}>
                  {r.documentTitle || "—"}
                </td>
                <td className="py-2 pr-3 text-neutral-400 whitespace-nowrap">{r.recordedAt || "—"}</td>
                <td className="py-2 pr-3 max-w-[100px] truncate" title={r.sendTo}>
                  {r.sendTo || "—"}
                </td>
                <td className="py-2 pr-3 max-w-[120px] truncate" title={[r.sendAdrs, r.sendAdrs2].filter(Boolean).join(" ")}>
                  {r.sendAdrs || "—"}
                </td>
                <td className="py-2 pr-3 max-w-[120px] truncate" title={[r.propertyAdrs, r.propertyAdrs2].filter(Boolean).join(" ")}>
                  {r.propertyAdrs || "—"}
                </td>
                <td className="py-2 pr-3 max-w-[140px] truncate" title={[r.signedBy, r.signerTitle].filter(Boolean).join(" — ")}>
                  {r.signedBy || "—"}
                </td>
                <td className="py-2 pr-3 max-w-[100px] truncate" title={r.granteeNames}>
                  {r.granteeNames || "—"}
                </td>
                <td className="py-2 pr-3 max-w-[100px] truncate" title={r.grantorNames}>
                  {r.grantorNames || "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (query === "consider") {
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-neutral-700 text-left text-neutral-400">
              <th className="py-2 pr-4">Doc #</th>
              <th className="py-2 pr-4">Title</th>
              <th className="py-2 pr-4">Recorded</th>
              <th className="py-2 pr-4">Consideration</th>
              <th className="py-2 pr-4">Other</th>
              <th className="py-2 pr-4">Property</th>
              <th className="py-2 pr-4">Property 2</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-neutral-800 hover:bg-neutral-900/50">
                <td className="py-2 pr-4 font-mono text-neutral-300">{r.docNumber}</td>
                <td className="py-2 pr-4 max-w-[160px] truncate" title={r.documentTitle}>
                  {r.documentTitle || "—"}
                </td>
                <td className="py-2 pr-4 text-neutral-400">{r.recordedAt || "—"}</td>
                <td className="py-2 pr-4 text-neutral-400">{r.considerationAmt || "—"}</td>
                <td className="py-2 pr-4 max-w-[140px] truncate" title={r.considerationOther}>
                  {r.considerationOther || "—"}
                </td>
                <td className="py-2 pr-4 max-w-[140px] truncate" title={r.propertyAdrs}>
                  {r.propertyAdrs || "—"}
                </td>
                <td className="py-2 pr-4 max-w-[140px] truncate" title={r.propertyAdrs2}>
                  {r.propertyAdrs2 || "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (query === "deed") {
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-neutral-700 text-left text-neutral-400">
              <th className="py-2 pr-3">Doc #</th>
              <th className="py-2 pr-3">Title</th>
              <th className="py-2 pr-3">Recorded</th>
              <th className="py-2 pr-3">Grantee #</th>
              <th className="py-2 pr-3">Grantee</th>
              <th className="py-2 pr-3">%</th>
              <th className="py-2 pr-3">Grantee addr</th>
              <th className="py-2 pr-3">Grantors</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-neutral-800 hover:bg-neutral-900/50">
                <td className="py-2 pr-3 font-mono text-neutral-300 whitespace-nowrap">{r.docNumber}</td>
                <td className="py-2 pr-3 max-w-[120px] truncate" title={r.documentTitle}>
                  {r.documentTitle || "—"}
                </td>
                <td className="py-2 pr-3 text-neutral-400 whitespace-nowrap">{r.recordedAt || "—"}</td>
                <td className="py-2 pr-3 text-neutral-400">{r.granteeNumber || "—"}</td>
                <td className="py-2 pr-3 max-w-[120px] truncate" title={r.granteeName}>
                  {r.granteeName || "—"}
                </td>
                <td className="py-2 pr-3 text-neutral-400">{r.granteePercent || "—"}</td>
                <td className="py-2 pr-3 max-w-[140px] truncate" title={r.granteeAddress}>
                  {r.granteeAddress || "—"}
                </td>
                <td className="py-2 pr-3 max-w-[160px] truncate" title={r.grantorsSummary}>
                  {r.grantorsSummary || "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  const isPropertyView = query === "property";

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-neutral-700 text-left text-neutral-400">
            <th className="py-2 pr-4">Doc #</th>
            <th className="py-2 pr-4">Title</th>
            <th className="py-2 pr-4">Recorded</th>
            {!isPropertyView && <th className="py-2 pr-4">Signed</th>}
            {isPropertyView && (
              <>
                <th className="py-2 pr-4">County</th>
                <th className="py-2 pr-4">Lot</th>
                <th className="py-2 pr-4">Block</th>
                <th className="py-2 pr-4">Tract</th>
                <th className="py-2 pr-4">Book</th>
                <th className="py-2 pr-4">Pages</th>
                <th className="py-2 pr-4">Parcel #</th>
                <th className="py-2 pr-4">Property</th>
              </>
            )}
            {!isPropertyView && (
              <>
                <th className="py-2 pr-4">Consideration</th>
                <th className="py-2 pr-4">County</th>
                <th className="py-2 pr-4">Property</th>
              </>
            )}
            {isPropertyView && <th className="py-2 pr-4">Consideration</th>}
            <th className="py-2 pr-4">Grantees</th>
            <th className="py-2 pr-4">Grantors</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-b border-neutral-800 hover:bg-neutral-900/50">
              <td className="py-2 pr-4 font-mono text-neutral-300">{r.docNumber}</td>
              <td className="py-2 pr-4 max-w-[180px] truncate" title={r.documentTitle}>
                {r.documentTitle || "—"}
              </td>
              <td className="py-2 pr-4 text-neutral-400">{r.recordedAt || "—"}</td>
              {!isPropertyView && <td className="py-2 pr-4 text-neutral-400">{r.dateSigned || "—"}</td>}
              {isPropertyView && (
                <>
                  <td className="py-2 pr-4 text-neutral-400">{r.propertyCounty || "—"}</td>
                  <td className="py-2 pr-4 text-neutral-400">{r.lot || "—"}</td>
                  <td className="py-2 pr-4 text-neutral-400">{r.block || "—"}</td>
                  <td className="py-2 pr-4 text-neutral-400">{r.tract || "—"}</td>
                  <td className="py-2 pr-4 text-neutral-400">{r.book || "—"}</td>
                  <td className="py-2 pr-4 text-neutral-400">{r.pages || "—"}</td>
                  <td className="py-2 pr-4 text-neutral-400">{r.parcelNumber || "—"}</td>
                  <td className="py-2 pr-4 max-w-[120px] truncate text-neutral-400" title={[r.propertyAdrs, r.propertyAdrs2, r.propertyAdrs3].filter(Boolean).join(" ")}>
                    {r.propertyAdrs || "—"}
                  </td>
                </>
              )}
              {!isPropertyView && (
                <>
                  <td className="py-2 pr-4 text-neutral-400">{r.considerationAmt || "—"}</td>
                  <td className="py-2 pr-4 text-neutral-400">{r.propertyCounty || "—"}</td>
                  <td className="py-2 pr-4 max-w-[120px] truncate text-neutral-400" title={r.propertyAdrs}>
                    {r.propertyAdrs || "—"}
                  </td>
                </>
              )}
              {isPropertyView && <td className="py-2 pr-4 text-neutral-400">{r.considerationAmt || "—"}</td>}
              <td className="py-2 pr-4 text-neutral-400 max-w-[140px] truncate" title={r.granteeNames}>
                {r.granteeNames || "—"}
              </td>
              <td className="py-2 pr-4 text-neutral-400 max-w-[140px] truncate" title={r.grantorNames}>
                {r.grantorNames || "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
