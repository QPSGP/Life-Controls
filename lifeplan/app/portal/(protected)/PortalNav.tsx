import Link from "next/link";

export function PortalNav({
  docCount,
  planCount,
}: {
  docCount: number;
  planCount: number;
}) {
  const linkClass =
    "text-sm text-neutral-400 hover:text-white px-2 py-1 rounded hover:bg-neutral-800";

  return (
    <nav className="border-b border-neutral-800 bg-neutral-950/95 backdrop-blur-sm sticky top-0 z-10">
      <div className="max-w-2xl mx-auto px-6 py-3 flex flex-wrap items-center gap-1 sm:gap-3">
        <span className="text-neutral-500 text-xs uppercase tracking-wider mr-2 hidden sm:inline">Portal</span>
        <Link href="/portal" className={linkClass}>
          My account
        </Link>
        <Link href="/portal/schedule" className={linkClass}>
          Live PM
        </Link>
        {planCount > 0 && (
          <Link href="/portal/plan" className={linkClass}>
            My plan
          </Link>
        )}
        <Link href="/portal/documents" className={linkClass}>
          Documents
          {docCount > 0 && (
            <span className="ml-1 text-neutral-500">({docCount})</span>
          )}
        </Link>
        <Link href="/portal/profile/edit" className={linkClass}>
          Profile
        </Link>
        <a
          href="/api/auth/member/logout"
          className={"ml-auto " + linkClass}
        >
          Sign out
        </a>
      </div>
    </nav>
  );
}
