"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function PortalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Portal error:", error);
  }, [error]);

  const isDb = /relation|does not exist|column .* does not exist|P1001|P1017/i.test(error.message);

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 p-6">
      <div className="max-w-2xl mx-auto">
        <header className="border-b border-neutral-800 pb-4 mb-6">
          <h1 className="text-2xl font-semibold">Member portal</h1>
        </header>
        <div className="p-4 rounded bg-red-950/50 border border-red-800 text-red-200 text-sm space-y-3">
          <p className="font-medium">Something went wrong</p>
          {error.digest && <p className="text-red-300/80 text-xs">Digest: {error.digest}</p>}
          <p className="break-all text-xs">{error.message}</p>
          {isDb && (
            <p className="text-red-300/80">
              This looks like a database schema issue. Run GitHub Actions → <strong>DB push and seed</strong>, or{" "}
              <code className="bg-neutral-800 px-1">npm run db:push</code> from the lifeplan folder.
            </p>
          )}
          <div className="flex flex-wrap gap-3 pt-2">
            <button type="button" onClick={() => reset()} className="rounded bg-neutral-700 px-4 py-2 text-sm text-white hover:bg-neutral-600">
              Try again
            </button>
            <Link href="/portal" className="rounded bg-neutral-800 px-4 py-2 text-sm text-white hover:bg-neutral-700">
              My account
            </Link>
            <a href="/api/db-status" target="_blank" rel="noopener noreferrer" className="rounded bg-neutral-800 px-4 py-2 text-sm text-white hover:bg-neutral-700">
              DB status
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
