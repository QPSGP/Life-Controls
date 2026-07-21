"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CRM_CATEGORY_OPTIONS, CRM_VISIBILITY_OPTIONS } from "@/lib/crm";
import { parseCsvContacts } from "@/lib/crm-csv-contacts";
import { parseVCardFile, type VCardContact } from "@/lib/crm-vcard";

const BATCH_SIZE = 40;

type Props = {
  /** API path that accepts JSON batches */
  batchApiPath: string;
  /** Where to go after success (query params added) */
  successPath: string;
  /** Query param names for the success redirect */
  successKeys?: { imported: string; updated: string; skipped: string };
};

export function ContactsImportClient({
  batchApiPath,
  successPath,
  successKeys = { imported: "imported", updated: "updated", skipped: "skipped" },
}: Props) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [category, setCategory] = useState("business");
  const [visibility, setVisibility] = useState("private");
  const [status, setStatus] = useState<"idle" | "parsing" | "uploading" | "done" | "error">("idle");
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [totals, setTotals] = useState({ created: 0, updated: 0, skipped: 0 });
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!file) {
      setError("Choose a CSV or vCard file to import.");
      return;
    }

    setStatus("parsing");
    let rows: VCardContact[];
    let source: string;
    try {
      const text = await file.text();
      const name = file.name.toLowerCase();
      if (name.endsWith(".vcf") || text.includes("BEGIN:VCARD")) {
        rows = parseVCardFile(text);
        source = "Import vCard";
      } else {
        rows = parseCsvContacts(text);
        source = "Import CSV";
      }
    } catch {
      setStatus("error");
      setError("Could not read that file. Try exporting again from iCloud as a .vcf.");
      return;
    }

    if (rows.length === 0) {
      setStatus("error");
      setError("No contacts found in that file.");
      return;
    }

    setStatus("uploading");
    setProgress({ done: 0, total: rows.length });
    let created = 0;
    let updated = 0;
    let skipped = 0;

    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
      const batch = rows.slice(i, i + BATCH_SIZE);
      try {
        const res = await fetch(batchApiPath, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contacts: batch, category, visibility, source }),
        });
        if (res.status === 401) {
          window.location.href = "/login";
          return;
        }
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setStatus("error");
          setError(
            data?.error === "batch_too_large"
              ? "Batch too large — try again (a smaller chunk size will be used)."
              : `Import failed after ${i} of ${rows.length} contacts. You can run import again; matching emails will merge.`
          );
          setTotals({ created, updated, skipped });
          return;
        }
        const result = await res.json();
        created += result.created ?? 0;
        updated += result.updated ?? 0;
        skipped += result.skipped ?? 0;
        setProgress({ done: Math.min(i + batch.length, rows.length), total: rows.length });
        setTotals({ created, updated, skipped });
      } catch {
        setStatus("error");
        setError(
          `Network error after ${i} of ${rows.length} contacts. You can run import again; matching emails will merge.`
        );
        setTotals({ created, updated, skipped });
        return;
      }
    }

    setStatus("done");
    const q = new URLSearchParams({
      [successKeys.imported]: String(created),
      [successKeys.updated]: String(updated),
      [successKeys.skipped]: String(skipped),
    });
    router.push(`${successPath}?${q.toString()}`);
  }

  const busy = status === "parsing" || status === "uploading";

  return (
    <form onSubmit={onSubmit} className="rounded-lg bg-neutral-900 p-4 border border-neutral-800 space-y-4">
      <div>
        <label className="block text-sm text-neutral-400 mb-1">Contact file</label>
        <input
          type="file"
          accept=".csv,.vcf,text/csv,text/vcard,text/x-vcard"
          disabled={busy}
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="w-full text-sm text-neutral-300 file:mr-3 file:rounded file:border-0 file:bg-neutral-700 file:px-3 file:py-2 file:text-white"
        />
        <p className="text-xs text-neutral-500 mt-2">
          Large iPhone lists are fine — the file is read on your device and uploaded in small batches (avoids Vercel size limits).
        </p>
        <p className="text-xs text-neutral-500 mt-1">
          Best source: iCloud.com → Contacts → Select All → Export vCard, then choose that .vcf here.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm text-neutral-400 mb-1">Default category</label>
          <select
            value={category}
            disabled={busy}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700"
          >
            {CRM_CATEGORY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm text-neutral-400 mb-1">Default visibility</label>
          <select
            value={visibility}
            disabled={busy}
            onChange={(e) => setVisibility(e.target.value)}
            className="w-full rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700"
          >
            {CRM_VISIBILITY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      <p className="text-xs text-neutral-500">
        Rows matching an existing email on your list will be merged (new phone numbers and social links added, not replaced).
      </p>

      {status === "parsing" && <p className="text-sky-400 text-sm">Reading file on this device…</p>}
      {status === "uploading" && (
        <div className="space-y-1">
          <p className="text-sky-400 text-sm">
            Uploading {progress.done} of {progress.total}…
          </p>
          <div className="h-2 rounded bg-neutral-800 overflow-hidden">
            <div
              className="h-full bg-emerald-600 transition-all"
              style={{ width: progress.total ? `${(progress.done / progress.total) * 100}%` : "0%" }}
            />
          </div>
          <p className="text-xs text-neutral-500">
            So far: {totals.created} added, {totals.updated} updated, {totals.skipped} skipped
          </p>
        </div>
      )}

      {error && <p className="text-amber-500 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={busy || !file}
        className="w-full rounded bg-emerald-700 px-4 py-3 text-sm text-white hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {busy ? "Importing…" : "Import contacts"}
      </button>
    </form>
  );
}
