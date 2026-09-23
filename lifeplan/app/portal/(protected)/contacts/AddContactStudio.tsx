"use client";

import { useState } from "react";
import { ContactForm } from "./ContactForm";
import type { ContactDraft } from "@/lib/parse-contact";

type CompanyOption = { id: string; name: string | null };

export function AddContactStudio({ companies }: { companies: CompanyOption[] }) {
  const [note, setNote] = useState("");
  const [draft, setDraft] = useState<ContactDraft | null>(null);
  const [source, setSource] = useState<"text" | "model" | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function fill() {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/portal/contacts/capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: note }),
      });
      const data = (await res.json()) as { draft?: ContactDraft; source?: "text" | "model"; error?: string };
      if (!res.ok || !data.draft) throw new Error(data.error || "Could not read that note");
      setDraft(data.draft);
      setSource(data.source ?? "text");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not read that note");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-white/10 bg-black/40 p-4 backdrop-blur-xl space-y-3">
        <h2 className="font-display text-lg text-white">Capture</h2>
        <p className="text-sm text-neutral-400">Paste a signature, a card, or a note. The form fills underneath. Nothing is saved until you create the contact.</p>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={5}
          placeholder={"Jane Doe\nDirector, Acme LLC\njane@acme.com\n(415) 555-0100"}
          className="w-full rounded bg-neutral-950 px-3 py-2 text-white border border-neutral-700"
        />
        <button
          type="button"
          onClick={fill}
          disabled={busy || note.trim().length < 3}
          className="rounded bg-accent px-4 py-2 text-sm font-semibold text-black hover:bg-accent-hover disabled:opacity-50"
        >
          {busy ? "Reading…" : "Fill the form"}
        </button>
        {source && (
          <p className="font-mono text-[11px] uppercase tracking-wider text-neutral-500">
            {source === "model" ? "Drafted from your note" : "Read from your note"}
          </p>
        )}
        {error && <p className="text-amber-400 text-sm">{error}</p>}
      </section>

      <ContactForm
        key={draft ? `${draft.email}-${draft.phone}-${draft.firstName}` : "empty"}
        action="/api/portal/contacts"
        companies={companies}
        submitLabel="Create contact"
        contact={
          draft
            ? {
                visibility: "private",
                category: "business",
                firstName: draft.firstName,
                lastName: draft.lastName,
                displayName: draft.displayName,
                email: draft.email,
                emailSecondary: null,
                phone: draft.phone,
                mobile: draft.mobile,
                fax: null,
                jobTitle: draft.jobTitle,
                companyName: draft.companyName,
                companyId: null,
                street: null,
                city: null,
                state: null,
                zip: null,
                country: null,
                notes: draft.notes,
                howToEngage: draft.howToEngage,
                keyFacts: null,
                tags: null,
                source: source === "model" ? "Capture" : "Capture",
                preferredChannel: null,
              }
            : undefined
        }
      />
    </div>
  );
}
