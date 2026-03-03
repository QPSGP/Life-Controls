import Link from "next/link";

export const dynamic = "force-dynamic";

export default function ForgotPasswordPage() {
  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center p-6">
      <div className="w-full max-w-sm rounded-lg bg-neutral-900 p-6 border border-neutral-800">
        <h1 className="text-xl font-semibold mb-2">Forgot password?</h1>
        <p className="text-sm text-neutral-400 mb-4">
          Member passwords are set by your administrator. Contact your admin to have your password reset or set for the first time.
        </p>
        <p className="text-sm text-neutral-500">
          If you have an admin account, use the admin login to set member passwords from the dashboard.
        </p>
        <p className="mt-6 text-center">
          <Link href="/login" className="text-emerald-400 text-sm hover:underline">← Back to sign in</Link>
        </p>
      </div>
    </main>
  );
}
