import Link from "next/link";
import { prisma } from "@/lib/db";
import { contactDisplayName, resolveSearchParams, CRM_CATEGORY_OPTIONS, CRM_VISIBILITY_OPTIONS } from "@/lib/crm";
import {
  CONTACT_PAGE_SIZE,
  buildContactListWhere,
  contactListHref,
  parseContactLetter,
  parseContactPage,
  type ContactListParams,
} from "@/lib/crm-contact-query";
import { ContactsSearchBar } from "@/app/portal/(protected)/contacts/ContactsSearchBar";
import { ContactsLetterIndex } from "@/app/portal/(protected)/contacts/ContactsLetterIndex";
import { ContactsPagination } from "@/app/portal/(protected)/contacts/ContactsPagination";

export const dynamic = "force-dynamic";

export default async function AdminContactsPage(props: {
  searchParams:
    | Promise<{
        memberId?: string;
        category?: string;
        visibility?: string;
        q?: string;
        letter?: string;
        page?: string;
        deleted?: string;
        error?: string;
      }>
    | {
        memberId?: string;
        category?: string;
        visibility?: string;
        q?: string;
        letter?: string;
        page?: string;
        deleted?: string;
        error?: string;
      };
}) {
  const params = await resolveSearchParams(props.searchParams);
  const page = parseContactPage(params.page);
  const letter = parseContactLetter(params.letter);

  const listParams: ContactListParams = {
    q: params.q?.trim() || undefined,
    letter,
    category: params.category,
    visibility: params.visibility,
    memberId: params.memberId || undefined,
  };

  let members: { id: string; email: string; firstName: string | null; lastName: string | null }[] = [];
  let contacts: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    displayName: string | null;
    email: string | null;
    phone: string | null;
    mobile: string | null;
    category: string;
    visibility: string;
    jobTitle: string | null;
    companyName: string | null;
    member: { id: string; email: string; firstName: string | null; lastName: string | null };
    company: { id: string; name: string | null } | null;
  }[] = [];
  let total = 0;
  let dbError: string | null = null;

  const where = buildContactListWhere(undefined, listParams);
  const basePath = "/admin/contacts";

  try {
    members = await prisma.member.findMany({
      orderBy: { lastName: "asc" },
      select: { id: true, email: true, firstName: true, lastName: true },
    });

    [total, contacts] = await Promise.all([
      prisma.contact.count({ where }),
      prisma.contact.findMany({
        where,
        orderBy: [{ lastName: "asc" }, { firstName: "asc" }, { displayName: "asc" }],
        skip: (page - 1) * CONTACT_PAGE_SIZE,
        take: CONTACT_PAGE_SIZE,
        include: {
          member: { select: { id: true, email: true, firstName: true, lastName: true } },
          company: { select: { id: true, name: true } },
        },
      }),
    ]);
  } catch (e) {
    dbError = e instanceof Error ? e.message : String(e);
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 p-6">
      <div className="max-w-5xl mx-auto">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800 pb-4 mb-6">
          <div>
            <h1 className="text-2xl font-semibold">CRM — Contacts</h1>
            <p className="text-neutral-500 text-sm mt-0.5">
              {total} contact{total === 1 ? "" : "s"}
              {listParams.q ? ` matching “${listParams.q}”` : ""}
            </p>
          </div>
          <div className="flex flex-wrap gap-3 text-sm">
            <Link href="/admin/companies" className="text-neutral-400 hover:text-white">Companies</Link>
            <Link href="/admin" className="text-neutral-400 hover:text-white">← Admin</Link>
          </div>
        </header>

        {dbError && (
          <div className="mb-4 p-4 rounded bg-red-950/50 border border-red-800 text-red-200 text-sm">
            Database error: {dbError}. Run &quot;DB push and seed&quot; if contacts tables are missing.
          </div>
        )}
        {params.deleted && <p className="text-emerald-500 text-sm mb-4">Contact deleted.</p>}
        {params.error === "notfound" && <p className="text-amber-500 text-sm mb-4">Contact not found.</p>}

        <ContactsSearchBar basePath={basePath} current={listParams} />
        <ContactsLetterIndex basePath={basePath} current={listParams} />

        <form method="GET" className="mb-4 flex flex-wrap gap-3 items-end rounded-lg bg-neutral-900 p-4 border border-neutral-800">
          {listParams.q && <input type="hidden" name="q" value={listParams.q} />}
          {listParams.letter && <input type="hidden" name="letter" value={listParams.letter} />}
          <div>
            <label className="block text-xs text-neutral-500 mb-1">Member</label>
            <select name="memberId" defaultValue={params.memberId ?? ""} className="rounded bg-neutral-800 px-3 py-2 text-sm text-white border border-neutral-700 min-w-[200px]">
              <option value="">All members</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {[m.firstName, m.lastName].filter(Boolean).join(" ") || m.email} — {m.email}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-neutral-500 mb-1">Category</label>
            <select name="category" defaultValue={params.category ?? ""} className="rounded bg-neutral-800 px-3 py-2 text-sm text-white border border-neutral-700">
              <option value="">All</option>
              {CRM_CATEGORY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-neutral-500 mb-1">Visibility</label>
            <select name="visibility" defaultValue={params.visibility ?? ""} className="rounded bg-neutral-800 px-3 py-2 text-sm text-white border border-neutral-700">
              <option value="">All</option>
              {CRM_VISIBILITY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <button type="submit" className="rounded bg-neutral-700 px-4 py-2 text-sm text-white hover:bg-neutral-600">Filter</button>
          {(params.memberId || params.category || params.visibility || listParams.q || letter) && (
            <Link href="/admin/contacts" className="text-sm text-neutral-400 hover:text-white py-2">Clear</Link>
          )}
        </form>

        {params.memberId && (
          <p className="text-sm text-neutral-400 mb-4 flex flex-wrap gap-3">
            <Link href={`/admin/members/${params.memberId}/contacts/import`} className="text-emerald-400 hover:underline">
              Import contacts for this member
            </Link>
            <a href={`/api/admin/members/${params.memberId}/contacts/export?format=vcf`} className="text-emerald-400 hover:underline">
              Export vCard
            </a>
          </p>
        )}

        {contacts.length === 0 && !dbError ? (
          <p className="text-neutral-500 text-sm">
            No contacts match.{" "}
            <Link href="/admin/contacts" className="text-emerald-400 hover:underline">Clear filters</Link>
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="text-left text-neutral-400 border-b border-neutral-700">
                  <th className="py-2 pr-3">Name</th>
                  <th className="py-2 pr-3">Member</th>
                  <th className="py-2 pr-3">Email / phone</th>
                  <th className="py-2 pr-3">Company</th>
                  <th className="py-2 pr-3">Category</th>
                  <th className="py-2 pr-3"></th>
                </tr>
              </thead>
              <tbody>
                {contacts.map((c) => (
                  <tr key={c.id} className="border-b border-neutral-800">
                    <td className="py-2 pr-3">
                      <Link href={`/admin/contacts/${c.id}`} className="text-emerald-400 hover:underline font-medium">
                        {contactDisplayName(c)}
                      </Link>
                      {c.jobTitle && <p className="text-neutral-500 text-xs">{c.jobTitle}</p>}
                    </td>
                    <td className="py-2 pr-3 text-neutral-400">
                      <Link href={contactListHref(basePath, listParams, { memberId: c.member.id, page: null })} className="hover:text-white">
                        {c.member.email}
                      </Link>
                    </td>
                    <td className="py-2 pr-3 text-neutral-400">
                      {[c.email, c.mobile || c.phone].filter(Boolean).join(" · ") || "—"}
                    </td>
                    <td className="py-2 pr-3 text-neutral-400">
                      {c.company ? (
                        <Link href={`/admin/companies/${c.company.id}`} className="hover:text-white">{c.company.name}</Link>
                      ) : (
                        c.companyName || "—"
                      )}
                    </td>
                    <td className="py-2 pr-3 capitalize text-neutral-500">{c.category} · {c.visibility}</td>
                    <td className="py-2 pr-3 whitespace-nowrap">
                      <Link href={`/admin/contacts/${c.id}/edit`} className="text-neutral-400 hover:text-white text-xs">Edit</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <ContactsPagination basePath={basePath} current={listParams} page={page} total={total} />
      </div>
    </main>
  );
}
