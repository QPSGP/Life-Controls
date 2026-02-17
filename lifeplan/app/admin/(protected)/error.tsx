"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("Admin error:", error);
  }, [error]);

  const message = error?.message ?? "Unknown error";
  const digest = error?.digest;

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-semibold mb-4">Admin</h1>
        <div className="p-4 rounded bg-red-950/50 border border-red-800 text-red-200 text-sm space-y-3">
          <p className="font-medium">Something went wrong</p>
          <p className="font-mono text-xs break-all">{message}</p>
          {digest && <p className="text-neutral-500 text-xs">Digest: {digest}</p>}
          <p>
            <Link href="/api/db-status" target="_blank" rel="noopener noreferrer" className="underline">Open /api/db-status</Link> to confirm the database is OK.
          </p>
          <div className="flex flex-wrap gap-2 mt-3">
            <button type="button" onClick={() => reset()} className="rounded bg-neutral-700 px-4 py-2 text-sm text-white hover:bg-neutral-600">
              Try again
            </button>
            <form action="/api/auth/admin/logout" method="POST" className="inline">
              <button type="submit" className="rounded bg-amber-800 px-4 py-2 text-sm text-amber-100 hover:bg-amber-700">
                Clear session and go to login
              </button>
            </form>
          </div>
        </div>
        <p className="mt-4">
          <Link href="/admin/login" className="text-neutral-400 hover:text-white text-sm">← Admin login</Link>
        </p>
      </div>
    </main>
  );
}
