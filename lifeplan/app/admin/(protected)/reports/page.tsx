import Link from "next/link";

export const dynamic = "force-dynamic";

export default function AdminReportsPage() {
  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 p-6">
      <div className="max-w-2xl mx-auto">
        <header className="flex items-center justify-between border-b border-neutral-800 pb-4 mb-6">
          <h1 className="text-2xl font-semibold">Reports</h1>
          <Link href="/admin" className="text-neutral-400 hover:text-white text-sm">← Admin</Link>
        </header>

        <section className="space-y-4 mb-8">
          <h2 className="text-sm font-medium text-neutral-400 uppercase tracking-wide">Exports</h2>
          <div className="rounded bg-neutral-900 p-4">
            <h3 className="font-medium text-neutral-300 mb-2">Members (PERSONAL / MARKEVNT-style)</h3>
            <p className="text-neutral-500 text-sm mb-2">Export all members with contact info and categories as CSV.</p>
            <a href="/api/reports/members" className="inline-block rounded bg-emerald-700 px-4 py-2 text-sm text-white hover:bg-emerald-600">Download members.csv</a>
          </div>
          <div className="rounded bg-neutral-900 p-4">
            <h3 className="font-medium text-neutral-300 mb-2">Transactions (TRANSCOL-style)</h3>
            <p className="text-neutral-500 text-sm mb-2">Export invoices and payment balances as CSV.</p>
            <a href="/api/reports/transactions" className="inline-block rounded bg-emerald-700 px-4 py-2 text-sm text-white hover:bg-emerald-600">Download transactions.csv</a>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-sm font-medium text-neutral-400 uppercase tracking-wide">Query-style reports (from database)</h2>
          <div className="rounded bg-neutral-900 p-4">
            <h3 className="font-medium text-neutral-300 mb-2">Live PM — Physical movements (PM table, life plan)</h3>
            <p className="text-neutral-500 text-sm mb-2">All rows from the life plan PM table: subject, area of purpose, area of responsibility, verb/noun/object, done status. Same data as the Life Plan hierarchy (Subject → Purpose → Responsibility → Physical movement).</p>
            <a href="/admin/reports/physical-movements" className="inline-block rounded bg-emerald-700 px-4 py-2 text-sm text-white hover:bg-emerald-600 mr-2">Live PM — View on screen</a>
            <a href="/api/reports/physical-movements?format=csv" className="inline-block rounded bg-neutral-600 px-4 py-2 text-sm text-white hover:bg-neutral-500 mr-2">Download all</a>
            <a href="/api/reports/physical-movements?format=csv&done=yes" className="inline-block rounded bg-neutral-600 px-4 py-2 text-sm text-white hover:bg-neutral-500 mr-2">Download completed only</a>
            <a href="/api/reports/physical-movements?format=csv&done=no" className="inline-block rounded bg-neutral-600 px-4 py-2 text-sm text-white hover:bg-neutral-500">Download pending only</a>
          </div>
        </section>
      </div>
    </main>
  );
}
