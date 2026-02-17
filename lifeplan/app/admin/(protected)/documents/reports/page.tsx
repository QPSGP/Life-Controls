"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type ReportRow = {
  id: string;
  docNumber: string;
  documentTitle: string;
  recordedAt: string;
  dateSigned: string;
  considerationAmt: string;
  propertyCounty: string;
  propertyAdrs: string;
  granteeNames: string;
  grantorNames: string;
};

export default function AdminDocumentsReportsPage() {
  const [rows, setRows] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState<"full" | "byDate" | "byGrantee" | "byGrantor">("full");
  const [recordedFrom, setRecordedFrom] = useState("");
  const [recordedTo, setRecordedTo] = useState("");
  const [nameSearch, setNameSearch] = useState("");

  const fetchReport = () => {
    setLoading(true);
    const params = new URLSearchParams({ query, format: "json" });
    if (recordedFrom) params.set("recordedFrom", recordedFrom);
    if (recordedTo) params.set("recordedTo", recordedTo);
    if (nameSearch.trim() && (query === "byGrantee" || query === "byGrantor")) params.set("name", nameSearch.trim());
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
        if (data != null) setRows(data.documents ?? []);
      })
      .catch((e) => setError(e instanceof Error ? e.message : String(e)))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchReport();
  }, [query]);

  const csvUrl = () => {
    const params = new URLSearchParams({ query, format: "csv" });
    if (recordedFrom) params.set("recordedFrom", recordedFrom);
    if (recordedTo) params.set("recordedTo", recordedTo);
    if (nameSearch.trim() && (query === "byGrantee" || query === "byGrantor")) params.set("name", nameSearch.trim());
    return `/api/universa/reports?${params.toString()}`;
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 p-6">
      <div className="max-w-5xl mx-auto">
        <header className="flex items-center justify-between border-b border-neutral-800 pb-4 mb-6">
          <h1 className="text-2xl font-semibold">Documents — Reports &amp; queries</h1>
          <div className="flex items-center gap-4">
            <Link href="/admin/documents" className="text-neutral-400 hover:text-white text-sm">← List documents</Link>
            <Link href="/admin" className="text-neutral-400 hover:text-white text-sm">Admin</Link>
          </div>
        </header>

        <section className="mb-6 rounded bg-neutral-900 p-4">
          <h2 className="text-sm font-medium text-neutral-400 mb-3">Query / report</h2>
          <div className="flex flex-wrap items-end gap-3">
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-neutral-500">View</span>
              <select
                value={query}
                onChange={(e) => setQuery(e.target.value as typeof query)}
                className="rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700"
              >
                <option value="full">Full list (all documents)</option>
                <option value="byDate">By recorded date range</option>
                <option value="byGrantee">By grantee name</option>
                <option value="byGrantor">By grantor name</option>
              </select>
            </label>
            {(query === "byDate" || query === "full") && (
              <>
                <label className="flex flex-col gap-1 text-sm">
                  <span className="text-neutral-500">Recorded from</span>
                  <input type="date" value={recordedFrom} onChange={(e) => setRecordedFrom(e.target.value)} className="rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700" />
                </label>
                <label className="flex flex-col gap-1 text-sm">
                  <span className="text-neutral-500">Recorded to</span>
                  <input type="date" value={recordedTo} onChange={(e) => setRecordedTo(e.target.value)} className="rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700" />
                </label>
              </>
            )}
            {(query === "byGrantee" || query === "byGrantor") && (
              <label className="flex flex-col gap-1 text-sm">
                <span className="text-neutral-500">{query === "byGrantee" ? "Grantee name contains" : "Grantor name contains"}</span>
                <input type="text" value={nameSearch} onChange={(e) => setNameSearch(e.target.value)} placeholder="Search…" className="rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700 min-w-[180px]" />
              </label>
            )}
            <button type="button" onClick={fetchReport} className="rounded bg-emerald-700 px-4 py-2 text-sm text-white hover:bg-emerald-600">Run</button>
            <a href={csvUrl()} className="rounded bg-neutral-700 px-4 py-2 text-sm text-white hover:bg-neutral-600" target="_blank" rel="noopener noreferrer">Download CSV</a>
          </div>
        </section>

        {error && (
          <div className="mb-4 p-4 rounded bg-amber-950/50 border border-amber-800 text-amber-200 text-sm">{error}</div>
        )}

        {loading ? (
          <p className="text-neutral-500">Loading…</p>
        ) : rows.length === 0 ? (
          <p className="text-neutral-500">No documents match. Try different filters or add data.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-neutral-700 text-left text-neutral-400">
                  <th className="py-2 pr-4">Doc #</th>
                  <th className="py-2 pr-4">Title</th>
                  <th className="py-2 pr-4">Recorded</th>
                  <th className="py-2 pr-4">Signed</th>
                  <th className="py-2 pr-4">Consideration</th>
                  <th className="py-2 pr-4">County</th>
                  <th className="py-2 pr-4">Property</th>
                  <th className="py-2 pr-4">Grantees</th>
                  <th className="py-2 pr-4">Grantors</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-b border-neutral-800 hover:bg-neutral-900/50">
                    <td className="py-2 pr-4 font-mono text-neutral-300">{r.docNumber}</td>
                    <td className="py-2 pr-4 max-w-[180px] truncate" title={r.documentTitle}>{r.documentTitle || "—"}</td>
                    <td className="py-2 pr-4 text-neutral-400">{r.recordedAt || "—"}</td>
                    <td className="py-2 pr-4 text-neutral-400">{r.dateSigned || "—"}</td>
                    <td className="py-2 pr-4 text-neutral-400">{r.considerationAmt || "—"}</td>
                    <td className="py-2 pr-4 text-neutral-400">{r.propertyCounty || "—"}</td>
                    <td className="py-2 pr-4 max-w-[120px] truncate text-neutral-400" title={r.propertyAdrs}>{r.propertyAdrs || "—"}</td>
                    <td className="py-2 pr-4 text-neutral-400 max-w-[140px] truncate" title={r.granteeNames}>{r.granteeNames || "—"}</td>
                    <td className="py-2 pr-4 text-neutral-400 max-w-[140px] truncate" title={r.grantorNames}>{r.grantorNames || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
