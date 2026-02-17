"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function LifePlanError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Life Plan error:", error);
  }, [error]);

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 p-6">
      <div className="max-w-2xl mx-auto">
        <header className="flex items-center justify-between border-b border-neutral-800 pb-4 mb-6">
          <h1 className="text-2xl font-semibold">Life Plan</h1>
          <Link href="/admin" className="text-neutral-400 hover:text-white text-sm">← Admin</Link>
        </header>
        <div className="p-4 rounded bg-red-950/50 border border-red-800 text-red-200 text-sm space-y-3">
          <p className="font-medium">Something went wrong</p>
          <p className="break-all">{error.message}</p>
          <p className="text-red-300/80">
            If this looks like a database error (e.g. relation &quot;users&quot; does not exist), run the &quot;DB push and seed&quot; workflow or <code className="bg-neutral-800 px-1">npx prisma db push</code> so the schema matches your database.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            className="rounded bg-neutral-700 px-4 py-2 text-sm text-white hover:bg-neutral-600"
          >
            Try again
          </button>
        </div>
      </div>
    </main>
  );
}
