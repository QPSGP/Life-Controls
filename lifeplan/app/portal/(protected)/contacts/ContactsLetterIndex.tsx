import Link from "next/link";
import { LETTERS, contactListHref, type ContactListParams } from "@/lib/crm-contact-query";

export function ContactsLetterIndex({
  basePath,
  current,
}: {
  basePath: string;
  current: ContactListParams;
}) {
  const active = current.letter?.toUpperCase() || "";

  const chip = (letter: string | null, label: string) => {
    const href = contactListHref(basePath, current, { letter: letter, page: null });
    const isActive = letter ? active === letter : !active;
    return (
      <Link
        key={label}
        href={href}
        className={`min-w-[1.75rem] text-center px-1.5 py-1 rounded text-xs font-medium ${
          isActive ? "bg-emerald-700 text-white" : "bg-neutral-800 text-neutral-400 hover:text-white"
        }`}
      >
        {label}
      </Link>
    );
  };

  return (
    <div className="mb-4">
      <p className="text-xs text-neutral-500 mb-2">Jump to letter</p>
      <div className="flex flex-wrap gap-1">
        {chip(null, "All")}
        {LETTERS.map((L) => chip(L, L))}
        {chip("#", "#")}
      </div>
    </div>
  );
}
