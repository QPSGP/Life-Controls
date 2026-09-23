export type ContactDraft = {
  firstName: string;
  lastName: string;
  displayName: string;
  email: string;
  phone: string;
  mobile: string;
  jobTitle: string;
  companyName: string;
  notes: string;
  howToEngage: string;
};

const EMAIL = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;
const PHONE = /(?:\+?1[\s.-]?)?(?:\(\d{3}\)|\d{3})[\s.-]\d{3}[\s.-]\d{4}/;

export function parseContactText(text: string): ContactDraft {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const email = text.match(EMAIL)?.[0] ?? "";
  const phone = text.match(PHONE)?.[0] ?? "";
  const nameLine =
    lines.find((line) => !line.includes("@") && !PHONE.test(line) && line.length < 80 && !/^https?:/i.test(line)) ??
    "";
  const parts = nameLine.split(/\s+/).filter(Boolean);
  const titleLine =
    lines.find((line) => /director|manager|founder|president|officer|partner|consultant/i.test(line) && line !== nameLine) ??
    "";
  const orgLine =
    lines.find((line) => /\b(inc|llc|ltd|corp|company|group)\b/i.test(line) && line !== titleLine) ?? "";
  let jobTitle = titleLine;
  let companyName = orgLine;
  if (!companyName && titleLine.includes(",")) {
    const [role, org] = titleLine.split(",");
    jobTitle = role.trim();
    companyName = org.trim();
  }

  return {
    firstName: parts[0] ?? "",
    lastName: parts.slice(1).join(" "),
    displayName: nameLine,
    email,
    phone,
    mobile: phone,
    jobTitle,
    companyName,
    notes: "",
    howToEngage: "",
  };
}

export function mergeContactDraft(base: ContactDraft, extra: Partial<ContactDraft>): ContactDraft {
  const next = { ...base };
  (Object.keys(base) as (keyof ContactDraft)[]).forEach((key) => {
    const value = extra[key];
    if (typeof value === "string" && value.trim()) next[key] = value.trim();
  });
  return next;
}
