import {
  buildContactActions,
  channelLabelDisplay,
  parseChannelsJson,
  type ChannelType,
} from "@/lib/crm-channels";

function LinkRow({ label, href, value }: { label: string; href: string; value: string }) {
  return (
    <p className="flex flex-wrap gap-x-2 gap-y-1">
      <span className="text-neutral-500 shrink-0">{label}:</span>
      <a href={href} className="text-emerald-400 hover:underline break-all">
        {value}
      </a>
    </p>
  );
}

function channelHref(type: ChannelType, label: string, value: string): string {
  const actions = buildContactActions({ channels: [{ type, label, value }] });
  return actions[0]?.href ?? value;
}

export function ContactReachSection({
  contact,
}: {
  contact: {
    email?: string | null;
    emailSecondary?: string | null;
    phone?: string | null;
    mobile?: string | null;
    fax?: string | null;
    channels?: unknown;
  };
}) {
  const channels = parseChannelsJson(contact.channels);
  const hasLegacy = !!(contact.email || contact.emailSecondary || contact.phone || contact.mobile || contact.fax);

  if (!hasLegacy && channels.length === 0) return null;

  return (
    <section className="rounded-lg bg-neutral-900 p-4 border border-neutral-800 text-sm space-y-1">
      <h2 className="text-neutral-400 text-xs uppercase tracking-wider mb-2">Contact info</h2>
      {contact.email && (
        <LinkRow label="Email" href={`mailto:${contact.email}`} value={contact.email} />
      )}
      {contact.emailSecondary && (
        <LinkRow label="Secondary email" href={`mailto:${contact.emailSecondary}`} value={contact.emailSecondary} />
      )}
      {contact.mobile && (
        <LinkRow label="Mobile" href={`tel:${contact.mobile}`} value={contact.mobile} />
      )}
      {contact.phone && (
        <LinkRow label="Phone" href={`tel:${contact.phone}`} value={contact.phone} />
      )}
      {contact.fax && <p><span className="text-neutral-500">Fax:</span> {contact.fax}</p>}
      {channels.map((ch, i) => (
        <LinkRow
          key={`${ch.type}-${ch.label}-${i}`}
          label={channelLabelDisplay(ch.type, ch.label) + (ch.primary ? " ★" : "")}
          href={channelHref(ch.type, ch.label, ch.value)}
          value={ch.value}
        />
      ))}
    </section>
  );
}

export { buildContactActions };
