/** CRM communication channel — stored as JSON on Contact; shape matches future ContactChannel rows. */

export type ChannelType = "phone" | "email" | "social" | "messaging" | "url" | "other";

export type ContactChannel = {
  type: ChannelType;
  label: string;
  value: string;
  primary?: boolean;
};

export type ContactAction = {
  kind: "call" | "text" | "email" | "whatsapp" | "open";
  label: string;
  href: string;
};

const VALID_TYPES: ChannelType[] = ["phone", "email", "social", "messaging", "url", "other"];

export const CHANNEL_TYPE_OPTIONS: { value: ChannelType; label: string }[] = [
  { value: "phone", label: "Phone" },
  { value: "email", label: "Email" },
  { value: "social", label: "Social" },
  { value: "messaging", label: "Messaging" },
  { value: "url", label: "Website / link" },
  { value: "other", label: "Other" },
];

export const CHANNEL_LABELS: Record<ChannelType, { value: string; label: string }[]> = {
  phone: [
    { value: "mobile", label: "Mobile" },
    { value: "work", label: "Work" },
    { value: "home", label: "Home" },
    { value: "fax", label: "Fax" },
    { value: "other", label: "Other" },
  ],
  email: [
    { value: "work", label: "Work" },
    { value: "personal", label: "Personal" },
    { value: "other", label: "Other" },
  ],
  social: [
    { value: "linkedin", label: "LinkedIn" },
    { value: "x", label: "X (Twitter)" },
    { value: "facebook", label: "Facebook" },
    { value: "instagram", label: "Instagram" },
    { value: "youtube", label: "YouTube" },
    { value: "github", label: "GitHub" },
    { value: "other", label: "Other" },
  ],
  messaging: [
    { value: "whatsapp", label: "WhatsApp" },
    { value: "telegram", label: "Telegram" },
    { value: "signal", label: "Signal" },
    { value: "slack", label: "Slack" },
    { value: "teams", label: "Microsoft Teams" },
    { value: "zoom", label: "Zoom" },
    { value: "other", label: "Other" },
  ],
  url: [
    { value: "website", label: "Website" },
    { value: "other", label: "Other" },
  ],
  other: [{ value: "other", label: "Other" }],
};

export const PREFERRED_CHANNEL_OPTIONS = [
  { value: "", label: "Auto (use primary channels)" },
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone call" },
  { value: "sms", label: "Text / SMS" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "linkedin", label: "LinkedIn" },
] as const;

export function channelLabelDisplay(type: ChannelType, label: string): string {
  const match = CHANNEL_LABELS[type]?.find((o) => o.value === label);
  return match?.label ?? label;
}

export function phoneDigits(value: string): string {
  return value.replace(/[^\d+]/g, "").replace(/^\+/, "");
}

export function normalizeChannelValue(type: ChannelType, value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return trimmed;
  if (type === "email") return trimmed.toLowerCase();
  if (type === "phone" || (type === "messaging" && ["whatsapp", "signal"].includes(trimmed))) {
    return trimmed;
  }
  if (type === "social" || type === "url") {
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    if (type === "social" && trimmed.includes(".")) return `https://${trimmed}`;
    return trimmed;
  }
  return trimmed;
}

function dedupeChannels(channels: ContactChannel[]): ContactChannel[] {
  const seen = new Set<string>();
  const out: ContactChannel[] = [];
  for (const ch of channels) {
    const key = `${ch.type}:${ch.label}:${ch.value.toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(ch);
  }
  return out;
}

export function parseChannelsJson(raw: unknown): ContactChannel[] {
  if (raw == null) return [];
  let data = raw;
  if (typeof data === "string") {
    const s = data.trim();
    if (!s) return [];
    try {
      data = JSON.parse(s);
    } catch {
      return [];
    }
  }
  if (!Array.isArray(data)) return [];

  const result: ContactChannel[] = [];
  for (const item of data) {
    if (!item || typeof item !== "object") continue;
    const rec = item as Record<string, unknown>;
    const type = rec.type as ChannelType;
    const label = String(rec.label ?? "")
      .trim()
      .toLowerCase();
    const value = String(rec.value ?? "").trim();
    if (!VALID_TYPES.includes(type) || !label || !value || value.length > 500) continue;
    result.push({
      type,
      label,
      value: normalizeChannelValue(type, value),
      primary: !!rec.primary,
    });
  }
  return dedupeChannels(result);
}

export function parseChannelsFromForm(form: FormData): ContactChannel[] {
  return parseChannelsJson(form.get("channelsJson"));
}

export function channelsToJson(channels: ContactChannel[]): string {
  return JSON.stringify(channels);
}

type ContactLike = {
  email?: string | null;
  emailSecondary?: string | null;
  phone?: string | null;
  mobile?: string | null;
  fax?: string | null;
  channels?: unknown;
  preferredChannel?: string | null;
};

function telHref(value: string): string {
  const digits = phoneDigits(value);
  return digits ? `tel:${value.trim()}` : "";
}

function smsHref(value: string): string {
  const digits = phoneDigits(value);
  return digits ? `sms:${digits}` : "";
}

function mailtoHref(value: string): string {
  return value.trim() ? `mailto:${value.trim()}` : "";
}

function whatsappHref(value: string): string {
  const digits = phoneDigits(value);
  return digits ? `https://wa.me/${digits.replace(/\D/g, "")}` : "";
}

function openHref(type: ChannelType, label: string, value: string): string {
  if (type === "social" || type === "url") {
    if (/^https?:\/\//i.test(value)) return value;
    if (label === "linkedin" && !value.includes("://")) {
      return value.startsWith("linkedin.com") ? `https://${value}` : `https://linkedin.com/in/${value.replace(/^\/+/, "")}`;
    }
    return value.includes("://") ? value : `https://${value}`;
  }
  if (type === "messaging" && label === "whatsapp") return whatsappHref(value);
  if (type === "messaging" && label === "telegram") {
    const h = value.replace(/^@/, "");
    return h.includes("://") ? h : `https://t.me/${h}`;
  }
  if (type === "email") return mailtoHref(value);
  if (type === "phone") return telHref(value);
  return value.includes("://") ? value : `https://${value}`;
}

/** Collect phone/email values from legacy columns + channels (primary first). */
export function allPhones(contact: ContactLike): string[] {
  const channels = parseChannelsJson(contact.channels);
  const primary = channels.filter((c) => c.type === "phone" && c.primary).map((c) => c.value);
  const rest = channels.filter((c) => c.type === "phone" && !c.primary).map((c) => c.value);
  const legacy = [contact.mobile, contact.phone, contact.fax].filter(Boolean) as string[];
  return dedupeStrings([...primary, ...legacy, ...rest]);
}

export function allEmails(contact: ContactLike): string[] {
  const channels = parseChannelsJson(contact.channels);
  const primary = channels.filter((c) => c.type === "email" && c.primary).map((c) => c.value);
  const rest = channels.filter((c) => c.type === "email" && !c.primary).map((c) => c.value);
  const legacy = [contact.email, contact.emailSecondary].filter(Boolean) as string[];
  return dedupeStrings([...primary, ...legacy, ...rest]);
}

function dedupeStrings(values: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const v of values) {
    const key = v.trim().toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(v.trim());
  }
  return out;
}

/** Mobile-friendly tap actions — Call, Text, Email, WhatsApp, plus channel links. */
export function buildContactActions(contact: ContactLike): ContactAction[] {
  const actions: ContactAction[] = [];
  const seen = new Set<string>();
  const pref = contact.preferredChannel?.trim().toLowerCase() ?? "";

  const phones = allPhones(contact);
  const emails = allEmails(contact);
  const channels = parseChannelsJson(contact.channels);

  function add(action: ContactAction) {
    if (seen.has(action.href)) return;
    seen.add(action.href);
    actions.push(action);
  }

  if (pref === "whatsapp") {
    const wa = channels.find((c) => c.type === "messaging" && c.label === "whatsapp");
    const num = wa?.value ?? phones[0];
    if (num) add({ kind: "whatsapp", label: "WhatsApp", href: whatsappHref(num) });
  }

  if (pref === "email" && emails[0]) {
    add({ kind: "email", label: "Email", href: mailtoHref(emails[0]) });
  } else if (pref === "sms" && phones[0]) {
    add({ kind: "text", label: "Text", href: smsHref(phones[0]) });
  } else if (pref === "phone" && phones[0]) {
    add({ kind: "call", label: "Call", href: telHref(phones[0]) });
  }

  if (phones[0]) {
    add({ kind: "call", label: "Call", href: telHref(phones[0]) });
    add({ kind: "text", label: "Text", href: smsHref(phones[0]) });
  }
  if (emails[0]) add({ kind: "email", label: "Email", href: mailtoHref(emails[0]) });

  const waChannel = channels.find((c) => c.type === "messaging" && c.label === "whatsapp");
  if (waChannel) add({ kind: "whatsapp", label: "WhatsApp", href: whatsappHref(waChannel.value) });

  for (const ch of channels) {
    if (ch.type === "phone") continue;
    if (ch.type === "email") {
      add({ kind: "email", label: channelLabelDisplay("email", ch.label), href: mailtoHref(ch.value) });
      continue;
    }
    if (ch.type === "messaging" && ch.label === "whatsapp") continue;
    const href = openHref(ch.type, ch.label, ch.value);
    if (!href) continue;
    add({
      kind: ch.label === "whatsapp" ? "whatsapp" : "open",
      label: channelLabelDisplay(ch.type, ch.label),
      href,
    });
  }

  return actions;
}

export function parsePreferredChannel(value: FormDataEntryValue | null): string | null {
  const s = (value as string)?.trim();
  if (!s) return null;
  const allowed = ["email", "phone", "sms", "whatsapp", "linkedin"];
  return allowed.includes(s) ? s : null;
}
