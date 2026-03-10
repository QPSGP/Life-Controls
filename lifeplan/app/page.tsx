import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* Hero */}
      <section className="flex flex-1 flex-col items-center justify-center px-6 py-20 text-center sm:px-8">
        <p className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-zinc-500">
          Take control
        </p>
        <h1 className="font-display max-w-4xl text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl md:text-6xl">
          Sovereign Life Control Tool
        </h1>
        <p className="mt-6 max-w-xl text-lg text-zinc-400 sm:text-xl">
          The tool that gives you iron-clad control of your life—personal and
          business.
        </p>

        {/* What you get — easy to follow */}
        <section className="mt-14 w-full max-w-md" aria-label="What you get">
          <h2 className="text-sm font-medium uppercase tracking-wider text-zinc-500 mb-4">
            What you get
          </h2>
          <ul className="space-y-3 text-left text-zinc-300">
            <li className="flex gap-3">
              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-accent" aria-hidden />
              <span><strong className="text-white">Life plan</strong> — Organize by subject, purpose, responsibility, and physical movements.</span>
            </li>
            <li className="flex gap-3">
              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-accent" aria-hidden />
              <span><strong className="text-white">Schedule</strong> — Your miniday by type (Read, Write, Call, etc.) so you know what to do and when.</span>
            </li>
            <li className="flex gap-3">
              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-accent" aria-hidden />
              <span><strong className="text-white">One place</strong> — Personal and business in a single tool.</span>
            </li>
          </ul>
        </section>

        {/* Value props — simple and scannable */}
        <ul className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm text-zinc-500 sm:gap-x-12">
          <li className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden />
            Personal
          </li>
          <li className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden />
            Business
          </li>
          <li className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden />
            One place
          </li>
        </ul>

        {/* CTAs */}
        <div className="mt-12 flex flex-col gap-4 sm:flex-row sm:gap-5">
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-lg bg-accent px-8 py-3.5 text-sm font-semibold text-black transition-colors hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-[#0a0a0a]"
          >
            Member portal
          </Link>
          <Link
            href="/admin"
            className="inline-flex items-center justify-center rounded-lg border border-zinc-600 bg-transparent px-8 py-3.5 text-sm font-semibold text-white transition-colors hover:border-zinc-500 hover:bg-zinc-800/50 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:ring-offset-[#0a0a0a]"
          >
            Admin
          </Link>
          <Link
            href="/learn"
            className="inline-flex items-center justify-center rounded-lg border border-zinc-600/80 bg-transparent px-6 py-3.5 text-sm font-medium text-zinc-300 transition-colors hover:border-zinc-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:ring-offset-[#0a0a0a]"
          >
            Learn more
          </Link>
        </div>
      </section>

      {/* Subtle footer line */}
      <footer className="border-t border-zinc-800/80 px-6 py-4 text-center text-xs text-zinc-600">
        Life plan · Schedule · Reports · One tool for what matters.
      </footer>
    </main>
  );
}
