import { prisma } from "@/lib/db";
import type { Prisma } from "@prisma/client";
import type { ContactChannel } from "@/lib/crm-channels";
import { parseChannelsJson } from "@/lib/crm-channels";
import type { VCardContact } from "@/lib/crm-vcard";

export type ImportContactRow = VCardContact & {
  category?: "business" | "personal";
  visibility?: "private" | "public";
};

export type ImportResult = { created: number; updated: number; skipped: number };

function mergeChannels(existing: unknown, incoming: ContactChannel[]): ContactChannel[] {
  const base = parseChannelsJson(existing);
  const seen = new Set(base.map((c) => `${c.type}:${c.label}:${c.value.toLowerCase()}`));
  for (const ch of incoming) {
    const key = `${ch.type}:${ch.label}:${ch.value.toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    base.push(ch);
  }
  return base;
}

function rowToData(
  row: ImportContactRow,
  defaults: { category: "business" | "personal"; visibility: "private" | "public"; source: string }
): Omit<Prisma.ContactCreateInput, "member"> {
  const channels = row.channels ?? [];
  return {
    visibility: row.visibility ?? defaults.visibility,
    category: row.category ?? defaults.category,
    firstName: row.firstName ?? null,
    lastName: row.lastName ?? null,
    displayName: row.displayName ?? null,
    email: row.email ?? null,
    emailSecondary: row.emailSecondary ?? null,
    phone: row.phone ?? null,
    mobile: row.mobile ?? null,
    fax: row.fax ?? null,
    jobTitle: row.jobTitle ?? null,
    companyName: row.companyName ?? null,
    street: row.street ?? null,
    city: row.city ?? null,
    state: row.state ?? null,
    zip: row.zip ?? null,
    country: row.country ?? null,
    notes: row.notes ?? null,
    source: defaults.source,
    channels: channels.length > 0 ? (channels as Prisma.InputJsonValue) : undefined,
  };
}

function hasIdentity(row: ImportContactRow): boolean {
  return !!(row.firstName || row.lastName || row.displayName || row.email || row.phone || row.mobile || (row.channels && row.channels.length));
}

/** Import contacts for a member; merge on matching email (case-insensitive). */
export async function importContactsForMember(
  memberId: string,
  rows: ImportContactRow[],
  options: {
    category: "business" | "personal";
    visibility: "private" | "public";
    source: string;
  }
): Promise<ImportResult> {
  const result: ImportResult = { created: 0, updated: 0, skipped: 0 };

  for (const row of rows) {
    if (!hasIdentity(row)) {
      result.skipped++;
      continue;
    }

    const data = rowToData(row, options);
    const emailKey = row.email?.trim().toLowerCase();

    if (emailKey) {
      const existing = await prisma.contact.findFirst({
        where: { memberId, email: { equals: row.email!.trim(), mode: "insensitive" } },
      });
      if (existing) {
        const mergedChannels = mergeChannels(existing.channels, row.channels ?? []);
        await prisma.contact.update({
          where: { id: existing.id },
          data: {
            firstName: data.firstName ?? existing.firstName,
            lastName: data.lastName ?? existing.lastName,
            displayName: data.displayName ?? existing.displayName,
            phone: data.phone ?? existing.phone,
            mobile: data.mobile ?? existing.mobile,
            fax: data.fax ?? existing.fax,
            jobTitle: data.jobTitle ?? existing.jobTitle,
            companyName: data.companyName ?? existing.companyName,
            street: data.street ?? existing.street,
            city: data.city ?? existing.city,
            state: data.state ?? existing.state,
            zip: data.zip ?? existing.zip,
            country: data.country ?? existing.country,
            notes: data.notes ? [existing.notes, data.notes].filter(Boolean).join("\n\n") : existing.notes,
            channels: mergedChannels.length > 0 ? (mergedChannels as Prisma.InputJsonValue) : existing.channels ?? undefined,
            source: existing.source || options.source,
          },
        });
        result.updated++;
        continue;
      }
    }

    await prisma.contact.create({
      data: {
        ...data,
        member: { connect: { id: memberId } },
      },
    });
    result.created++;
  }

  return result;
}
