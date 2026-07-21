import { redirect } from "next/navigation";
import Link from "next/link";
import { getMemberIdFromCookie } from "@/lib/member-auth";
import { prisma } from "@/lib/db";
import { resolveSearchParams } from "@/lib/crm";
import {
  CONTACT_PAGE_SIZE,
  buildContactListWhere,
  parseContactLetter,
  parseContactPage,
  sortNameForContact,
  type ContactListParams,
} from "@/lib/crm-contact-query";
import { CrmFilterTabs } from "../CrmFilterTabs";
import { ContactsSearchBar } from "./ContactsSearchBar";
import { ContactsLetterIndex } from "./ContactsLetterIndex";
import { ContactsPagination } from "./ContactsPagination";
import { ContactListRow } from "./ContactListRow";

export const dynamic = "force-dynamic";

export default async function PortalContactsPage(props: {
  searchParams:
    | Promise<{
        category?: string;
        visibility?: string;
        q?: string;
        letter?: string;
        page?: string;
        deleted?: string;
        error?: string;
        imported?: string;
        updated?: string;
        skipped?: string;
      }>
    | {
        category?: string;
        visibility?: string;
        q?: string;
        letter?: string;
        page?: string;
        deleted?: string;
        error?: string;
        imported?: string;
        updated?: string;
        skipped?: string;
      };
}) {
  const memberId = await getMemberIdFromCookie();
  if (!memberId) redirect("/login");

  const params = await resolveSearchParams(props.searchParams);
  const page = parseContactPage(params.page);
  const letter = parseContactLetter(params.letter);

  const listParams: ContactListParams = {
    q: params.q?.trim() || undefined,
    letter,
    category: params.category,
    visibility: params.visibility,
  };

  const where = buildContactListWhere(memberId, listParams);

  const [total, contacts] = await Promise.all([
    prisma.contact.count({ where }),
    prisma.contact.findMany({
      where,
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }, { displayName: "asc" }],
      skip: (page - 1) * CONTACT_PAGE_SIZE,
      take: CONTACT_PAGE_SIZE,
      include: { company: { select: { id: true, name: true } } },
    }),
  ]);

  const basePath = "/portal/contacts";

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 p-4 sm:p-6">
      <div className="max-w-2xl mx-auto pb-10">
        <header className="border-b border-neutral-800 pb-4 mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <Link href="/portal" className="text-neutral-400 hover:text-white text-sm">← My account</Link>
            <h1 className="text-2xl font-semibold mt-2">My contacts</h1>
            <p className="text-neutral-500 text-sm mt-0.5">
              {total} contact{total === 1 ? "" : "s"}
              {listParams.q ? ` matching “${listParams.q}”` : ""}
              {letter ? ` · ${letter}` : ""}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/portal/contacts/import" className="rounded bg-neutral-800 px-3 py-2 text-sm hover:bg-neutral-700">Import</Link>
            <a href="/api/portal/contacts/export?format=vcf" className="rounded bg-neutral-800 px-3 py-2 text-sm hover:bg-neutral-700">Export vCard</a>
            <a href="/api/portal/contacts/export?format=csv" className="rounded bg-neutral-800 px-3 py-2 text-sm hover:bg-neutral-700 hidden sm:inline-block">Export CSV</a>
            <Link href="/portal/contacts/new" className="rounded bg-emerald-700 px-4 py-2 text-sm text-white hover:bg-emerald-600">Add contact</Link>
          </div>
        </header>

        {params.imported && (
          <p className="text-emerald-500 text-sm mb-4">
            Import complete — {params.imported} added
            {params.updated ? `, ${params.updated} updated` : ""}
            {params.skipped ? `, ${params.skipped} skipped` : ""}.
          </p>
        )}

        {params.deleted && <p className="text-emerald-500 text-sm mb-4">Contact deleted.</p>}
        {params.error === "notfound" && <p className="text-amber-500 text-sm mb-4">Contact not found.</p>}

        <ContactsSearchBar basePath={basePath} current={listParams} />
        <ContactsLetterIndex basePath={basePath} current={listParams} />
        <CrmFilterTabs
          basePath={basePath}
          category={params.category}
          visibility={params.visibility}
          preserve={{ q: listParams.q, letter: listParams.letter }}
        />

        {contacts.length === 0 ? (
          <div className="text-neutral-500 text-sm space-y-2">
            {total === 0 && !listParams.q && !letter ? (
              <>
                <p>No contacts yet.</p>
                <p>
                  <Link href="/portal/contacts/new" className="text-emerald-400 hover:underline">Add your first contact</Link>
                  {" or "}
                  <Link href="/portal/contacts/import" className="text-emerald-400 hover:underline">import from your phone</Link>.
                </p>
              </>
            ) : (
              <p>
                No matches
                {listParams.q ? ` for “${listParams.q}”` : ""}
                {letter ? ` in ${letter}` : ""}.{" "}
                <Link href={basePath} className="text-emerald-400 hover:underline">Clear filters</Link>
              </p>
            )}
          </div>
        ) : (
          <ul className="space-y-2">
            {contacts.map((c, i) => (
              <ContactListRow
                key={c.id}
                contact={c}
                href={`/portal/contacts/${c.id}`}
                showLetterHeader={!letter}
                previousSortName={i > 0 ? sortNameForContact(contacts[i - 1]) : undefined}
              />
            ))}
          </ul>
        )}

        <ContactsPagination basePath={basePath} current={listParams} page={page} total={total} />

        <p className="mt-6">
          <Link href="/portal/companies" className="text-sm text-neutral-400 hover:text-white">My companies →</Link>
        </p>
      </div>
    </main>
  );
}
