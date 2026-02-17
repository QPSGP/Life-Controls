"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Doc = {
  id: string;
  docNumber: string;
  documentTitle: string | null;
  recordedAt: string | null;
  dateSigned: string | null;
  considerationAmt: string | null;
  propertyCounty: string | null;
  propertyAdrs: string | null;
  grantors: { id: string; name: string | null }[];
  grantees: { id: string; name: string | null }[];
};

export default function AdminDocumentsPage() {
  const [documents, setDocuments] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [recordedFrom, setRecordedFrom] = useState("");
  const [recordedTo, setRecordedTo] = useState("");
  const [sort, setSort] = useState("recordedDesc");

  const fetchDocs = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (title.trim()) params.set("title", title.trim());
    if (recordedFrom) params.set("recordedFrom", recordedFrom);
    if (recordedTo) params.set("recordedTo", recordedTo);
    if (sort) params.set("sort", sort);
    fetch(`/api/universa/documents?${params.toString()}`, { credentials: "include" })
      .then((res) => {
        if (res.status === 401) {
          window.location.href = "/admin/login";
          return null;
        }
        if (!res.ok) throw new Error(`Failed ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (data != null) setDocuments(data.documents ?? []);
      })
      .catch((e) => setError(e instanceof Error ? e.message : String(e)))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const formatDate = (s: string | null) => (s ? new Date(s).toLocaleDateString() : "—");

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 p-6">
      <div className="max-w-5xl mx-auto">
        <header className="flex items-center justify-between border-b border-neutral-800 pb-4 mb-6">
          <h1 className="text-2xl font-semibold">Documents (UNIVERSA)</h1>
          <div className="flex items-center gap-4">
            <Link href="/admin/documents/new" className="rounded bg-emerald-700 px-3 py-1.5 text-sm text-white hover:bg-emerald-600">Add document</Link>
            <Link href="/admin/documents/reports" className="text-neutral-400 hover:text-white text-sm">Reports &amp; queries</Link>
            <Link href="/admin" className="text-neutral-400 hover:text-white text-sm">← Admin</Link>
          </div>
        </header>

        <section className="mb-6 rounded bg-neutral-900 p-4">
          <h2 className="text-sm font-medium text-neutral-400 mb-3">Filters</h2>
          <div className="flex flex-wrap items-end gap-3">
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-neutral-500">Title</span>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Search title…"
                className="rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700 min-w-[180px]"
              />
            </label>
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
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-neutral-500">Sort</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700"
              >
                <option value="recordedDesc">Recorded (newest first)</option>
                <option value="recordedAsc">Recorded (oldest first)</option>
                <option value="titleAsc">Title A–Z</option>
                <option value="titleDesc">Title Z–A</option>
              </select>
            </label>
            <button
              type="button"
              onClick={fetchDocs}
              className="rounded bg-emerald-700 px-4 py-2 text-sm text-white hover:bg-emerald-600"
            >
              Apply
            </button>
          </div>
        </section>

        {error && (
          <div className="mb-4 p-4 rounded bg-amber-950/50 border border-amber-800 text-amber-200 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-neutral-500">Loading documents…</p>
        ) : documents.length === 0 ? (
          <p className="text-neutral-500">No documents. Add data via CSV import (<code className="bg-neutral-800 px-1">npm run db:import:universa</code>) or add documents later.</p>
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
                  <th className="py-2 pr-4">Grantees</th>
                  <th className="py-2 pr-4">Grantors</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((d) => (
                  <tr key={d.id} className="border-b border-neutral-800 hover:bg-neutral-900/50">
                    <td className="py-2 pr-4 font-mono text-neutral-300">
                      <Link href={"/admin/documents/" + d.id + "/edit"} className="text-emerald-400 hover:underline">{d.docNumber}</Link>
                    </td>
                    <td className="py-2 pr-4 max-w-[200px] truncate" title={d.documentTitle ?? ""}>{d.documentTitle ?? "—"}</td>
                    <td className="py-2 pr-4 text-neutral-400">{formatDate(d.recordedAt)}</td>
                    <td className="py-2 pr-4 text-neutral-400">{formatDate(d.dateSigned)}</td>
                    <td className="py-2 pr-4 text-neutral-400">{d.considerationAmt ?? "—"}</td>
                    <td className="py-2 pr-4 text-neutral-400">{d.propertyCounty ?? "—"}</td>
                    <td className="py-2 pr-4 text-neutral-400">{d.grantees.map((g) => g.name).filter(Boolean).join(", ") || "—"}</td>
                    <td className="py-2 pr-4 text-neutral-400">{d.grantors.map((g) => g.name).filter(Boolean).join(", ") || "—"}</td>
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
