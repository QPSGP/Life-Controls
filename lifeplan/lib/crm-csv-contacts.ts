import { normalizeChannelValue, type ContactChannel } from "@/lib/crm-channels";
import type { VCardContact } from "@/lib/crm-vcard";

export type CsvContactRow = VCardContact;

const COLUMN_ALIASES: Record<string, keyof CsvContactRow | "linkedin" | "whatsapp"> = {
  "first name": "firstName",
  firstname: "firstName",
  "given name": "firstName",
  "last name": "lastName",
  lastname: "lastName",
  surname: "lastName",
  "display name": "displayName",
  name: "displayName",
  email: "email",
  "e-mail": "email",
  "e-mail address": "email",
  "email address": "email",
  "email 1": "email",
  "email 2": "emailSecondary",
  "secondary email": "emailSecondary",
  phone: "phone",
  "business phone": "phone",
  "work phone": "phone",
  telephone: "phone",
  mobile: "mobile",
  "mobile phone": "mobile",
  cell: "mobile",
  "cell phone": "mobile",
  fax: "fax",
  company: "companyName",
  organization: "companyName",
  "job title": "jobTitle",
  title: "jobTitle",
  street: "street",
  address: "street",
  city: "city",
  state: "state",
  province: "state",
  zip: "zip",
  "postal code": "zip",
  "post code": "zip",
  country: "country",
  notes: "notes",
  note: "notes",
  linkedin: "linkedin",
  "linkedin url": "linkedin",
  whatsapp: "whatsapp",
};

function parseCsvLine(line: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      fields.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  fields.push(current.trim());
  return fields;
}

function normalizeHeader(h: string): string {
  return h.trim().toLowerCase().replace(/\s+/g, " ");
}

export function parseCsvContacts(text: string): CsvContactRow[] {
  const lines = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n").filter((l) => l.trim());
  if (lines.length < 2) return [];

  const headers = parseCsvLine(lines[0]).map(normalizeHeader);
  const rows: CsvContactRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvLine(lines[i]);
    if (values.every((v) => !v.trim())) continue;

    const row: CsvContactRow = { channels: [] };
    headers.forEach((header, idx) => {
      const value = values[idx]?.trim();
      if (!value) return;
      const field = COLUMN_ALIASES[header];
      if (!field) return;
      if (field === "linkedin") {
        row.channels!.push({
          type: "social",
          label: "linkedin",
          value: normalizeChannelValue("social", value),
        });
      } else if (field === "whatsapp") {
        row.channels!.push({
          type: "messaging",
          label: "whatsapp",
          value,
        });
      } else if (field === "channels") {
        // skip
      } else {
        (row as Record<string, unknown>)[field] = value;
      }
    });

    if (row.firstName || row.lastName || row.displayName || row.email || row.phone || row.mobile || row.channels!.length) {
      rows.push(row);
    }
  }

  return rows;
}

export function contactsToCsv(
  contacts: {
    firstName?: string | null;
    lastName?: string | null;
    displayName?: string | null;
    email?: string | null;
    emailSecondary?: string | null;
    phone?: string | null;
    mobile?: string | null;
    companyName?: string | null;
    jobTitle?: string | null;
    street?: string | null;
    city?: string | null;
    state?: string | null;
    zip?: string | null;
    country?: string | null;
    notes?: string | null;
    category?: string | null;
    channels?: unknown;
  }[]
): string {
  const headers = [
    "First Name",
    "Last Name",
    "Display Name",
    "E-mail Address",
    "Secondary Email",
    "Mobile Phone",
    "Business Phone",
    "Company",
    "Job Title",
    "Street",
    "City",
    "State",
    "Postal Code",
    "Country",
    "Notes",
    "Category",
    "LinkedIn",
    "WhatsApp",
  ];

  function esc(value: string | null | undefined): string {
    const s = value ?? "";
    if (s.includes(",") || s.includes('"') || s.includes("\n")) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  }

  function linkedIn(channels: unknown): string {
    const arr = (Array.isArray(channels) ? channels : []) as ContactChannel[];
    return arr.find((c) => c.type === "social" && c.label === "linkedin")?.value ?? "";
  }

  function whatsapp(channels: unknown): string {
    const arr = (Array.isArray(channels) ? channels : []) as ContactChannel[];
    return arr.find((c) => c.type === "messaging" && c.label === "whatsapp")?.value ?? "";
  }

  const lines = [headers.join(",")];
  for (const c of contacts) {
    lines.push(
      [
        esc(c.firstName),
        esc(c.lastName),
        esc(c.displayName),
        esc(c.email),
        esc(c.emailSecondary),
        esc(c.mobile),
        esc(c.phone),
        esc(c.companyName),
        esc(c.jobTitle),
        esc(c.street),
        esc(c.city),
        esc(c.state),
        esc(c.zip),
        esc(c.country),
        esc(c.notes),
        esc(c.category),
        esc(linkedIn(c.channels)),
        esc(whatsapp(c.channels)),
      ].join(",")
    );
  }
  return lines.join("\r\n");
}

export function csvContactDisplayName(row: CsvContactRow): string {
  return row.displayName || [row.firstName, row.lastName].filter(Boolean).join(" ").trim() || row.email || "Contact";
}
