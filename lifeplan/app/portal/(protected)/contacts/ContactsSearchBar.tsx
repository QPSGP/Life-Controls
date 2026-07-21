"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { contactListHref, type ContactListParams } from "@/lib/crm-contact-query";

export function ContactsSearchBar({
  basePath,
  current,
}: {
  basePath: string;
  current: ContactListParams;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [q, setQ] = useState(current.q ?? "");

  useEffect(() => {
    setQ(current.q ?? "");
  }, [current.q]);

  function go(nextQ: string) {
    startTransition(() => {
      router.push(contactListHref(basePath, current, { q: nextQ.trim() || null, page: null }));
    });
  }

  return (
    <form
      className="mb-3"
      onSubmit={(e) => {
        e.preventDefault();
        go(q);
      }}
    >
      <div className="flex gap-2">
        <input
          type="search"
          name="q"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name, email, phone, company…"
          enterKeyHint="search"
          autoComplete="off"
          className="flex-1 rounded-lg bg-neutral-900 border border-neutral-700 px-3 py-3 text-sm text-white placeholder:text-neutral-500"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-emerald-700 px-4 py-3 text-sm text-white hover:bg-emerald-600 disabled:opacity-60 shrink-0"
        >
          Search
        </button>
      </div>
      {current.q && (
        <button
          type="button"
          onClick={() => {
            setQ("");
            go("");
          }}
          className="mt-2 text-xs text-neutral-400 hover:text-white"
        >
          Clear search “{current.q}”
        </button>
      )}
    </form>
  );
}
