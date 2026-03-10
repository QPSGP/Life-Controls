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

        {/* Value props — simple and scannable */}
        <ul className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm text-zinc-500 sm:gap-x-12">
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
        <div className="mt-14 flex flex-col gap-4 sm:flex-row sm:gap-5">
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
        </div>
      </section>

      {/* Subtle footer line */}
      <footer className="border-t border-zinc-800/80 px-6 py-4 text-center text-xs text-zinc-600">
        Life plan · Schedule · Reports · One tool for what matters.
      </footer>
    </main>
  );
}
