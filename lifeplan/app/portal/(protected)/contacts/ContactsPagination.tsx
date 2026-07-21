import Link from "next/link";
import { CONTACT_PAGE_SIZE, contactListHref, type ContactListParams } from "@/lib/crm-contact-query";

export function ContactsPagination({
  basePath,
  current,
  page,
  total,
}: {
  basePath: string;
  current: ContactListParams;
  page: number;
  total: number;
}) {
  const totalPages = Math.max(1, Math.ceil(total / CONTACT_PAGE_SIZE));
  if (total === 0) return null;

  const from = (page - 1) * CONTACT_PAGE_SIZE + 1;
  const to = Math.min(page * CONTACT_PAGE_SIZE, total);

  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
      <p className="text-neutral-500">
        Showing {from}–{to} of {total}
        {totalPages > 1 ? ` · Page ${page} of ${totalPages}` : ""}
      </p>
      {totalPages > 1 && (
        <div className="flex gap-2">
          {page > 1 ? (
            <Link
              href={contactListHref(basePath, current, { page: page - 1 })}
              className="rounded bg-neutral-800 px-3 py-2 text-neutral-200 hover:bg-neutral-700"
            >
              Previous
            </Link>
          ) : (
            <span className="rounded bg-neutral-900 px-3 py-2 text-neutral-600">Previous</span>
          )}
          {page < totalPages ? (
            <Link
              href={contactListHref(basePath, current, { page: page + 1 })}
              className="rounded bg-neutral-800 px-3 py-2 text-neutral-200 hover:bg-neutral-700"
            >
              Next
            </Link>
          ) : (
            <span className="rounded bg-neutral-900 px-3 py-2 text-neutral-600">Next</span>
          )}
        </div>
      )}
    </div>
  );
}
