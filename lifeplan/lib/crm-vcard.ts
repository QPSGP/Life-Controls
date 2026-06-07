import {
  parseChannelsJson,
  type ContactChannel,
  normalizeChannelValue,
  channelLabelDisplay,
} from "@/lib/crm-channels";

export type VCardContact = {
  firstName?: string;
  lastName?: string;
  displayName?: string;
  email?: string;
  emailSecondary?: string;
  phone?: string;
  mobile?: string;
  fax?: string;
  companyName?: string;
  jobTitle?: string;
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  notes?: string;
  channels: ContactChannel[];
};

function escapeVCard(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

function foldLine(line: string): string {
  if (line.length <= 75) return line;
  const parts: string[] = [];
  let rest = line;
  parts.push(rest.slice(0, 75));
  rest = rest.slice(75);
  while (rest.length > 0) {
    parts.push(" " + rest.slice(0, 74));
    rest = rest.slice(74);
  }
  return parts.join("\r\n");
}

function telType(label: string): string {
  if (label === "mobile") return "CELL";
  if (label === "work") return "WORK";
  if (label === "home") return "HOME";
  if (label === "fax") return "FAX";
  return "VOICE";
}

export function contactToVCard(contact: {
  firstName?: string | null;
  lastName?: string | null;
  displayName?: string | null;
  email?: string | null;
  emailSecondary?: string | null;
  phone?: string | null;
  mobile?: string | null;
  fax?: string | null;
  companyName?: string | null;
  jobTitle?: string | null;
  street?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  country?: string | null;
  notes?: string | null;
  channels?: unknown;
}): string {
  const channels = parseChannelsJson(contact.channels);
  const fn = [contact.firstName, contact.lastName].filter(Boolean).join(" ").trim();
  const lines: string[] = ["BEGIN:VCARD", "VERSION:3.0"];
  if (fn) lines.push(foldLine(`N:${escapeVCard(contact.lastName ?? "")};${escapeVCard(contact.firstName ?? "")};;;`));
  const display = contact.displayName?.trim() || fn || contact.email || "Contact";
  lines.push(foldLine(`FN:${escapeVCard(display)}`));
  if (contact.email) lines.push(foldLine(`EMAIL;TYPE=INTERNET:${escapeVCard(contact.email)}`));
  if (contact.emailSecondary) lines.push(foldLine(`EMAIL;TYPE=INTERNET:${escapeVCard(contact.emailSecondary)}`));
  if (contact.mobile) lines.push(foldLine(`TEL;TYPE=CELL:${escapeVCard(contact.mobile)}`));
  if (contact.phone) lines.push(foldLine(`TEL;TYPE=WORK:${escapeVCard(contact.phone)}`));
  if (contact.fax) lines.push(foldLine(`TEL;TYPE=FAX:${escapeVCard(contact.fax)}`));
  if (contact.companyName) lines.push(foldLine(`ORG:${escapeVCard(contact.companyName)}`));
  if (contact.jobTitle) lines.push(foldLine(`TITLE:${escapeVCard(contact.jobTitle)}`));
  const adrParts = ["", "", contact.street ?? "", contact.city ?? "", contact.state ?? "", contact.zip ?? "", contact.country ?? ""];
  if (adrParts.some((p) => p?.trim())) {
    lines.push(foldLine(`ADR;TYPE=WORK:${adrParts.map((p) => escapeVCard(p ?? "")).join(";")}`));
  }
  if (contact.notes) lines.push(foldLine(`NOTE:${escapeVCard(contact.notes)}`));

  for (const ch of channels) {
    if (ch.type === "phone") {
      lines.push(foldLine(`TEL;TYPE=${telType(ch.label)}:${escapeVCard(ch.value)}`));
    } else if (ch.type === "email") {
      lines.push(foldLine(`EMAIL;TYPE=INTERNET:${escapeVCard(ch.value)}`));
    } else if (ch.type === "social" || ch.type === "url") {
      lines.push(foldLine(`URL:${escapeVCard(ch.value)}`));
    } else if (ch.type === "messaging" && ch.label === "whatsapp") {
      lines.push(foldLine(`TEL;TYPE=CELL:${escapeVCard(ch.value)}`));
      lines.push(foldLine(`X-SOCIALPROFILE;TYPE=whatsapp:${escapeVCard(ch.value)}`));
    }
  }

  lines.push("END:VCARD");
  return lines.join("\r\n");
}

export function contactsToVCardFile(
  contacts: Parameters<typeof contactToVCard>[0][]
): string {
  return contacts.map((c) => contactToVCard(c)).join("\r\n");
}

function unfoldVCardLines(text: string): string[] {
  const raw = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
  const lines: string[] = [];
  for (const line of raw) {
    if (line.startsWith(" ") || line.startsWith("\t")) {
      lines[lines.length - 1] += line.slice(1);
    } else {
      lines.push(line);
    }
  }
  return lines;
}

function unescapeVCard(value: string): string {
  return value.replace(/\\n/g, "\n").replace(/\\,/g, ",").replace(/\\;/g, ";").replace(/\\\\/g, "\\");
}

function parseVCardBlock(lines: string[]): VCardContact | null {
  const data: VCardContact = { channels: [] };
  for (const line of lines) {
    if (!line || line === "BEGIN:VCARD" || line === "END:VCARD") continue;
    const idx = line.indexOf(":");
    if (idx < 0) continue;
    const keyPart = line.slice(0, idx).toUpperCase();
    const value = unescapeVCard(line.slice(idx + 1).trim());
    const key = keyPart.split(";")[0];

    if (key === "N") {
      const parts = value.split(";");
      data.lastName = parts[0]?.trim() || undefined;
      data.firstName = parts[1]?.trim() || undefined;
    } else if (key === "FN") {
      data.displayName = value;
    } else if (key === "EMAIL") {
      if (!data.email) data.email = value;
      else if (!data.emailSecondary) data.emailSecondary = value;
      else data.channels.push({ type: "email", label: "other", value: normalizeChannelValue("email", value) });
    } else if (key === "TEL") {
      const type = keyPart.toUpperCase();
      if (type.includes("CELL") || type.includes("MOBILE")) {
        if (!data.mobile) data.mobile = value;
        else data.channels.push({ type: "phone", label: "mobile", value });
      } else if (type.includes("FAX")) {
        if (!data.fax) data.fax = value;
        else data.channels.push({ type: "phone", label: "fax", value });
      } else if (!data.phone) {
        data.phone = value;
      } else {
        data.channels.push({ type: "phone", label: type.includes("HOME") ? "home" : "work", value });
      }
    } else if (key === "ORG") {
      data.companyName = value;
    } else if (key === "TITLE") {
      data.jobTitle = value;
    } else if (key === "ADR") {
      const parts = value.split(";");
      data.street = parts[2]?.trim() || undefined;
      data.city = parts[3]?.trim() || undefined;
      data.state = parts[4]?.trim() || undefined;
      data.zip = parts[5]?.trim() || undefined;
      data.country = parts[6]?.trim() || undefined;
    } else if (key === "NOTE") {
      data.notes = value;
    } else if (key === "URL") {
      const lower = value.toLowerCase();
      if (lower.includes("linkedin.com")) {
        data.channels.push({ type: "social", label: "linkedin", value });
      } else {
        data.channels.push({ type: "url", label: "website", value });
      }
    } else if (keyPart.includes("WHATSAPP")) {
      data.channels.push({ type: "messaging", label: "whatsapp", value });
    }
  }

  if (!data.firstName && !data.lastName && !data.displayName && !data.email && !data.phone && !data.mobile && data.channels.length === 0) {
    return null;
  }
  return data;
}

export function parseVCardFile(text: string): VCardContact[] {
  const normalized = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const blocks = normalized.split("BEGIN:VCARD").slice(1);
  const results: VCardContact[] = [];
  for (const block of blocks) {
    const lines = unfoldVCardLines("BEGIN:VCARD" + block.split("END:VCARD")[0] + "END:VCARD");
    const parsed = parseVCardBlock(lines);
    if (parsed) results.push(parsed);
  }
  return results;
}

export function vCardContactLabel(c: VCardContact): string {
  return c.displayName || [c.firstName, c.lastName].filter(Boolean).join(" ").trim() || c.email || "Contact";
}

export { channelLabelDisplay };
