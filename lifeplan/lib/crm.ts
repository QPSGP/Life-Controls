/** Display label for a CRM contact row */
export function contactDisplayName(c: {
  displayName?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
}): string {
  if (c.displayName?.trim()) return c.displayName.trim();
  const name = [c.firstName, c.lastName].filter(Boolean).join(" ").trim();
  if (name) return name;
  if (c.email?.trim()) return c.email.trim();
  return "Unnamed contact";
}

export function companyDisplayName(c: { name?: string | null }): string {
  return c.name?.trim() || "Unnamed company";
}

export function parseCategory(value: FormDataEntryValue | null): "business" | "personal" {
  return value === "personal" ? "personal" : "business";
}

export function parseVisibility(value: FormDataEntryValue | null): "private" | "public" {
  return value === "public" ? "public" : "private";
}

export function trimOrNull(value: FormDataEntryValue | null): string | null {
  const s = (value as string)?.trim();
  return s || null;
}

export const CRM_CATEGORY_OPTIONS = [
  { value: "business", label: "Business" },
  { value: "personal", label: "Personal" },
] as const;

export const CRM_VISIBILITY_OPTIONS = [
  { value: "private", label: "Private" },
  { value: "public", label: "Public" },
] as const;

/** Next.js 14/15: searchParams may be a Promise in production */
export async function resolveSearchParams<T extends Record<string, string | undefined>>(
  searchParams: Promise<T> | T
): Promise<T> {
  if (typeof (searchParams as Promise<T>)?.then === "function") {
    return await (searchParams as Promise<T>);
  }
  return searchParams as T;
}
