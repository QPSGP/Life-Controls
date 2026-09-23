import { redirect } from "next/navigation";
import { isAdminPasswordSet, getAdminSessionToken, setAdminCookie, setStaffCookie } from "@/lib/auth";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import Link from "next/link";

export const dynamic = "force-dynamic";

async function adminLoginAction(formData: FormData) {
  "use server";
  const email = (formData.get("email") as string)?.trim().toLowerCase() ?? "";
  const password = (formData.get("password") as string)?.trim() ?? "";
  if (!getAdminSessionToken()) {
    redirect("/admin/login?error=config");
  }

  if (email) {
    const user = await prisma.user.findUnique({ where: { email }, select: { id: true, passwordHash: true } });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      redirect("/admin/login?error=1");
    }
    const ok = await setStaffCookie(user.id);
    if (!ok) redirect("/admin/login?error=config");
    redirect("/admin");
  }

  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || password !== expected) {
    redirect("/admin/login?error=1");
  }
  await setAdminCookie();
  redirect("/admin");
}

export default async function AdminLoginPage(props: { searchParams: Promise<{ error?: string }> | { error?: string } }) {
  const passwordRequired = isAdminPasswordSet();
  if (!passwordRequired) {
    return (
      <main className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center p-6">
        <div className="w-full max-w-sm rounded-lg bg-neutral-900 p-6 border border-neutral-800">
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500 mb-2">Sovereign Life Control Tool</p>
          <h1 className="text-xl font-semibold mb-4">Admin login</h1>
          <p className="text-neutral-400 text-sm mb-4">Admin password is not configured. You can go to the dashboard without logging in.</p>
          <Link href="/admin" className="block w-full rounded bg-emerald-700 py-2 text-white hover:bg-emerald-600 text-center text-sm">Go to Admin dashboard</Link>
          <p className="mt-4 text-center">
            <Link href="/" className="text-sm text-neutral-400 hover:text-white">← Home</Link>
          </p>
        </div>
      </main>
    );
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
        <p className="text-xs font-medium uppercase tracking-wider text-zinc-500 mb-2">Sovereign Life Control Tool</p>
        <h1 className="text-xl font-semibold mb-4">Admin login</h1>
        {error === "1" && (
          <p className="mb-4 rounded bg-red-950/50 border border-red-800 text-red-200 text-sm px-3 py-2">Wrong email or password.</p>
        )}
        {error === "config" && (
          <p className="mb-4 rounded bg-amber-950/50 border border-amber-800 text-amber-200 text-sm px-3 py-2">Server configuration error. Set <code className="bg-neutral-800 px-1">AUTH_SECRET</code> in Vercel (Environment Variables) for admin login to work.</p>
        )}
        <form action={adminLoginAction} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm text-neutral-400 mb-1">Staff email</label>
            <input type="email" id="email" name="email" autoComplete="username" placeholder="Leave blank to use the shared admin password" className="w-full rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700" />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm text-neutral-400 mb-1">Password</label>
            <input type="password" id="password" name="password" required autoFocus className="w-full rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700" />
          </div>
          <button type="submit" className="w-full rounded bg-emerald-700 py-2 text-white hover:bg-emerald-600">Log in</button>
        </form>
        <p className="mt-3 text-xs text-neutral-500">Staff accounts are created under Admin → Staff. The shared admin password still works if the email is left blank.</p>
        <p className="mt-4 text-center">
          <Link href="/" className="text-sm text-neutral-400 hover:text-white">← Home</Link>
          {" · "}
          <a href="/api/auth/clear-session" className="text-sm text-neutral-400 hover:text-white">Clear session</a>
        </p>
      </div>
    </main>
  );
}
