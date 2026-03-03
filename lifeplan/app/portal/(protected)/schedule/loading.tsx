export default function ScheduleLoading() {
  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="border-b border-neutral-800 pb-4 mb-6">
          <div className="h-6 w-48 rounded bg-neutral-800 animate-pulse" />
        </div>
        <p className="text-neutral-500 text-sm">Loading schedule…</p>
      </div>
    </main>
  );
}
