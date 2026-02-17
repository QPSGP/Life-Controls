export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="text-3xl font-bold tracking-tight">Sovereign Life Plan</h1>
      <p className="mt-2 text-neutral-400">
        Multi-tiered subscription service · Fiat &amp; crypto payments
      </p>
      <p className="mt-6 text-sm text-neutral-500">
        API: <code className="rounded bg-neutral-800 px-1.5 py-0.5">/api/health</code>
      </p>
      <div className="mt-4 flex gap-6">
        <a href="/login" className="text-sm text-neutral-400 hover:text-white underline">Member portal →</a>
        <a href="/admin" className="text-sm text-neutral-400 hover:text-white underline">Admin dashboard →</a>
      </div>
    </main>
  );
}
