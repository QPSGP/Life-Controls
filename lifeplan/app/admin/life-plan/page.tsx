import { Suspense } from "react";
import { LifePlanClient } from "./LifePlanClient";

export const dynamic = "force-dynamic";

function Loading() {
  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 p-6">
      <div className="max-w-2xl mx-auto">
        <p className="text-neutral-500">Loading Life Plan…</p>
      </div>
    </main>
  );
}

export default function AdminLifePlanPage() {
  return (
    <Suspense fallback={<Loading />}>
      <LifePlanClient />
    </Suspense>
  );
}
