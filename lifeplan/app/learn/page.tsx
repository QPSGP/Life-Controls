import Link from "next/link";

export const metadata = {
  title: "Learn more — Sovereign Life Control Tool",
  description:
    "How the Sovereign Life Control Tool helps you take iron-clad control of your life, personal and business.",
};

export default function LearnPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <div className="flex-1 mx-auto w-full max-w-2xl px-6 py-16 sm:px-8">
        <p className="text-xs font-medium uppercase tracking-wider text-zinc-500 mb-2">
          Sovereign Life Control Tool
        </p>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Learn more
        </h1>
        <p className="mt-4 text-lg text-zinc-400">
          One tool for life plan, schedule, and reports—personal and business.
        </p>

        <section className="mt-10 space-y-6 text-zinc-300">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 mb-2">
              Life plan
            </h2>
            <p>
              Organize your life by <strong className="text-white">subjects</strong> (e.g. yourself, a business),{" "}
              <strong className="text-white">areas of purpose</strong>, and{" "}
              <strong className="text-white">areas of responsibility</strong>. Under each, define{" "}
              <strong className="text-white">physical movements</strong>—concrete tasks with date, time, and type (Read, Write, Call, etc.).
            </p>
          </div>
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 mb-2">
              Schedule (Live PM)
            </h2>
            <p>
              Your physical movements appear in a <strong className="text-white">miniday schedule</strong> grouped by type. See what to do and when, mark items done, and keep personal and business in one place.
            </p>
          </div>
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 mb-2">
              Reports &amp; control
            </h2>
            <p>
              Admins get reports and full life plan management. Members get their plan, schedule, profile, and subscriptions. Everything stays in sync so you have iron-clad control.
            </p>
          </div>
        </section>

        <div className="mt-12 flex flex-wrap gap-4">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-lg border border-zinc-600 px-6 py-2.5 text-sm font-medium text-zinc-300 hover:border-zinc-500 hover:text-white"
          >
            ← Home
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-lg bg-accent px-6 py-2.5 text-sm font-semibold text-black hover:bg-accent-hover"
          >
            Member portal
          </Link>
        </div>
      </div>

      <footer className="border-t border-zinc-800/80 px-6 py-4 text-center text-xs text-zinc-600">
        <Link href="/" className="text-zinc-500 hover:text-zinc-400">Sovereign Life Control Tool</Link>
      </footer>
    </main>
  );
}
