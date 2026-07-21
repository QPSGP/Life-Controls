import type { Prisma } from "@prisma/client";

export const CONTACT_PAGE_SIZE = 50;

export const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export type ContactListParams = {
  q?: string;
  letter?: string;
  category?: string;
  visibility?: string;
  memberId?: string;
  page?: string;
};

export function parseContactPage(pageRaw: string | undefined): number {
  const n = parseInt(pageRaw ?? "1", 10);
  return Number.isFinite(n) && n > 0 ? n : 1;
}

export function parseContactLetter(letterRaw: string | undefined): string | undefined {
  if (!letterRaw) return undefined;
  const up = letterRaw.trim().toUpperCase();
  if (up === "#") return "#";
  if (LETTERS.includes(up)) return up;
  return undefined;
}

/** Build Prisma where for searchable contact list. */
export function buildContactListWhere(
  memberId: string | undefined,
  params: ContactListParams
): Prisma.ContactWhereInput {
  const where: Prisma.ContactWhereInput = {};
  if (memberId) where.memberId = memberId;
  else if (params.memberId) where.memberId = params.memberId;

  if (params.category === "business" || params.category === "personal") {
    where.category = params.category;
  }
  if (params.visibility === "private" || params.visibility === "public") {
    where.visibility = params.visibility;
  }

  const q = params.q?.trim();
  if (q) {
    where.OR = [
      { firstName: { contains: q, mode: "insensitive" } },
      { lastName: { contains: q, mode: "insensitive" } },
      { displayName: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
      { emailSecondary: { contains: q, mode: "insensitive" } },
      { phone: { contains: q, mode: "insensitive" } },
      { mobile: { contains: q, mode: "insensitive" } },
      { companyName: { contains: q, mode: "insensitive" } },
      { jobTitle: { contains: q, mode: "insensitive" } },
      { tags: { contains: q, mode: "insensitive" } },
      { company: { name: { contains: q, mode: "insensitive" } } },
    ];
  }

  const letter = parseContactLetter(params.letter);
  if (letter && letter !== "#") {
    const letterFilter: Prisma.ContactWhereInput = {
      OR: [
        { lastName: { startsWith: letter, mode: "insensitive" } },
        {
          AND: [
            { OR: [{ lastName: null }, { lastName: "" }] },
            { firstName: { startsWith: letter, mode: "insensitive" } },
          ],
        },
        {
          AND: [
            { OR: [{ lastName: null }, { lastName: "" }] },
            { OR: [{ firstName: null }, { firstName: "" }] },
            { displayName: { startsWith: letter, mode: "insensitive" } },
          ],
        },
      ],
    };
    where.AND = [...(Array.isArray(where.AND) ? where.AND : where.AND ? [where.AND] : []), letterFilter];
  } else if (letter === "#") {
    // Names that don't start with A–Z (digits, symbols, empty)
    const letterOr: Prisma.ContactWhereInput[] = LETTERS.map((L) => ({
      OR: [
        { lastName: { startsWith: L, mode: "insensitive" } },
        {
          AND: [
            { OR: [{ lastName: null }, { lastName: "" }] },
            { firstName: { startsWith: L, mode: "insensitive" } },
          ],
        },
        {
          AND: [
            { OR: [{ lastName: null }, { lastName: "" }] },
            { OR: [{ firstName: null }, { firstName: "" }] },
            { displayName: { startsWith: L, mode: "insensitive" } },
          ],
        },
      ],
    }));
    where.AND = [
      ...(Array.isArray(where.AND) ? where.AND : where.AND ? [where.AND] : []),
      { NOT: { OR: letterOr } },
    ];
  }

  return where;
}

export function contactListHref(
  basePath: string,
  current: ContactListParams,
  patch: { [K in keyof ContactListParams]?: string | number | null }
): string {
  const next: ContactListParams = { ...current };
  for (const [key, value] of Object.entries(patch)) {
    const k = key as keyof ContactListParams;
    if (value === null || value === undefined || value === "" || value === "all") {
      delete next[k];
    } else {
      next[k] = String(value);
    }
  }
  // Reset page when changing filters (unless page is explicitly set)
  if (!("page" in patch)) {
    delete next.page;
  } else if (patch.page === 1 || patch.page === "1") {
    delete next.page;
  }

  const params = new URLSearchParams();
  if (next.q) params.set("q", next.q);
  if (next.letter) params.set("letter", next.letter);
  if (next.category) params.set("category", next.category);
  if (next.visibility) params.set("visibility", next.visibility);
  if (next.memberId) params.set("memberId", next.memberId);
  if (next.page && next.page !== "1") params.set("page", next.page);
  const qs = params.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

export function sortNameForContact(c: {
  lastName?: string | null;
  firstName?: string | null;
  displayName?: string | null;
  email?: string | null;
}): string {
  const last = c.lastName?.trim();
  const first = c.firstName?.trim();
  if (last) return last;
  if (first) return first;
  if (c.displayName?.trim()) return c.displayName.trim();
  if (c.email?.trim()) return c.email.trim();
  return "#";
}

export function letterBucket(sortName: string): string {
  const ch = sortName.charAt(0).toUpperCase();
  return LETTERS.includes(ch) ? ch : "#";
}
