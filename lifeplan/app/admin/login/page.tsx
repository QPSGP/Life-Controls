import { redirect } from "next/navigation";
import { isAdminPasswordSet } from "@/lib/auth";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage(props: { searchParams: Promise<{ error?: string }> | { error?: string } }) {
  if (!isAdminPasswordSet()) {
    redirect("/admin");
  }
  let error: string | undefined;
  try {
    const params = typeof (props.searchParams as Promise<unknown>)?.then === "function"
      ? await (props.searchParams as Promise<{ error?: string }>)
      : (props.searchParams as { error?: string });
    error = params.error;
  } catch {
    // ignore
  }
  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center p-6">
      <div className="w-full max-w-sm rounded-lg bg-neutral-900 p-6 border border-neutral-800">
        <h1 className="text-xl font-semibold mb-4">Admin login</h1>
        {error === "1" && (
          <p className="mb-4 rounded bg-red-950/50 border border-red-800 text-red-200 text-sm px-3 py-2">Wrong password.</p>
        )}
        {error === "config" && (
          <p className="mb-4 rounded bg-amber-950/50 border border-amber-800 text-amber-200 text-sm px-3 py-2">Server configuration error. Set <code className="bg-neutral-800 px-1">AUTH_SECRET</code> in Vercel (Environment Variables) for admin login to work.</p>
        )}
        <form action="/api/auth/admin" method="POST" className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm text-neutral-400 mb-1">Password</label>
            <input type="password" id="password" name="password" required autoFocus className="w-full rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700" />
          </div>
          <button type="submit" className="w-full rounded bg-emerald-700 py-2 text-white hover:bg-emerald-600">Log in</button>
        </form>
        <p className="mt-4 text-center">
          <Link href="/" className="text-sm text-neutral-400 hover:text-white">← Home</Link>
        </p>
      </div>
    </main>
  );
}
