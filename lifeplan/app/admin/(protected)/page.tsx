import { Suspense } from "react";
import { AdminDashboardClient } from "./AdminDashboardClient";

export const dynamic = "force-dynamic";

export default function AdminPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-neutral-950 text-neutral-100 p-6 flex items-center"><p className="text-neutral-400">Loading…</p></div>}>
      <AdminDashboardClient />
    </Suspense>
  );
}
