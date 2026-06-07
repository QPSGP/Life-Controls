import { parseCategory, parseVisibility, trimOrNull } from "@/lib/crm";
import { parseChannelsFromForm, parsePreferredChannel, type ContactChannel } from "@/lib/crm-channels";
import type { Prisma } from "@prisma/client";

export type ParsedContactForm = {
  visibility: "private" | "public";
  category: "business" | "personal";
  firstName: string | null;
  lastName: string | null;
  displayName: string | null;
  email: string | null;
  emailSecondary: string | null;
  phone: string | null;
  mobile: string | null;
  fax: string | null;
  jobTitle: string | null;
  companyName: string | null;
  companyId: string | null;
  street: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  country: string | null;
  notes: string | null;
  howToEngage: string | null;
  keyFacts: string | null;
  tags: string | null;
  source: string | null;
  preferredChannel: string | null;
  channels: ContactChannel[];
};

export function parseContactForm(form: FormData, options?: { defaultSource?: string }): ParsedContactForm {
  const channels = parseChannelsFromForm(form);
  return {
    visibility: parseVisibility(form.get("visibility")),
    category: parseCategory(form.get("category")),
    firstName: trimOrNull(form.get("firstName")),
    lastName: trimOrNull(form.get("lastName")),
    displayName: trimOrNull(form.get("displayName")),
    email: trimOrNull(form.get("email")),
    emailSecondary: trimOrNull(form.get("emailSecondary")),
    phone: trimOrNull(form.get("phone")),
    mobile: trimOrNull(form.get("mobile")),
    fax: trimOrNull(form.get("fax")),
    jobTitle: trimOrNull(form.get("jobTitle")),
    companyName: trimOrNull(form.get("companyName")),
    companyId: trimOrNull(form.get("companyId")),
    street: trimOrNull(form.get("street")),
    city: trimOrNull(form.get("city")),
    state: trimOrNull(form.get("state")),
    zip: trimOrNull(form.get("zip")),
    country: trimOrNull(form.get("country")),
    notes: trimOrNull(form.get("notes")),
    howToEngage: trimOrNull(form.get("howToEngage")),
    keyFacts: trimOrNull(form.get("keyFacts")),
    tags: trimOrNull(form.get("tags")),
    source: trimOrNull(form.get("source")) || options?.defaultSource || "Manual",
    preferredChannel: parsePreferredChannel(form.get("preferredChannel")),
    channels,
  };
}

export function contactFormToPrismaData(
  data: ParsedContactForm
): Omit<Prisma.ContactCreateInput, "member"> {
  const channelsJson = data.channels.length > 0 ? (data.channels as Prisma.InputJsonValue) : undefined;
  return {
    visibility: data.visibility,
    category: data.category,
    firstName: data.firstName,
    lastName: data.lastName,
    displayName: data.displayName,
    email: data.email,
    emailSecondary: data.emailSecondary,
    phone: data.phone,
    mobile: data.mobile,
    fax: data.fax,
    jobTitle: data.jobTitle,
    companyName: data.companyName,
    street: data.street,
    city: data.city,
    state: data.state,
    zip: data.zip,
    country: data.country,
    notes: data.notes,
    howToEngage: data.howToEngage,
    keyFacts: data.keyFacts,
    tags: data.tags,
    source: data.source,
    preferredChannel: data.preferredChannel,
    ...(channelsJson ? { channels: channelsJson } : {}),
  };
}

export function hasContactIdentity(data: ParsedContactForm): boolean {
  return !!(data.firstName || data.lastName || data.displayName || data.email || data.phone || data.mobile || data.channels.length);
}
