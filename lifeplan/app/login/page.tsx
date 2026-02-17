import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function MemberLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center p-6">
      <div className="w-full max-w-sm rounded-lg bg-neutral-900 p-6 border border-neutral-800">
        <h1 className="text-xl font-semibold mb-2">Member portal</h1>
        <p className="text-sm text-neutral-400 mb-4">Sign in to view your subscription and account.</p>
        {error === "invalid" && <p className="text-amber-500 text-sm mb-2">Invalid email or password.</p>}
        {error === "missing" && <p className="text-amber-500 text-sm mb-2">Email and password required.</p>}
        {error === "server" && (
          <p className="text-amber-500 text-sm mb-2">
            Server error. Run the &quot;DB push and seed&quot; workflow in GitHub Actions once to add the password column, then have admin set a password for your account.
          </p>
        )}
        <form action="/api/auth/member" method="POST" className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm text-neutral-400 mb-1">Email</label>
            <input type="email" id="email" name="email" required autoComplete="email" className="w-full rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700" />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm text-neutral-400 mb-1">Password</label>
            <input type="password" id="password" name="password" required autoComplete="current-password" className="w-full rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700" />
          </div>
          <button type="submit" className="w-full rounded bg-emerald-700 py-2 text-white hover:bg-emerald-600">Sign in</button>
        </form>
        <p className="mt-4 text-center text-sm text-neutral-500">
          No account? Ask your admin to add you and set a password.
        </p>
        <p className="mt-2 text-center">
          <Link href="/" className="text-sm text-neutral-400 hover:text-white">← Home</Link>
        </p>
      </div>
    </main>
  );
}
