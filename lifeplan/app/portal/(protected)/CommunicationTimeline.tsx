import Link from "next/link";

type Comm = {
  id: string;
  type: string;
  subject: string | null;
  notes: string | null;
  createdAt: Date;
};

export function CommunicationTimeline({
  communications,
  returnTo,
  contactId,
  companyId,
}: {
  communications: Comm[];
  returnTo: string;
  contactId?: string;
  companyId?: string;
}) {
  return (
    <section className="mt-8">
      <h2 className="text-lg font-medium text-neutral-300 mb-3">Activity timeline</h2>

      <form action="/api/portal/communications" method="POST" className="rounded-lg bg-neutral-900 p-4 space-y-3 border border-neutral-800 mb-6">
        <input type="hidden" name="returnTo" value={returnTo} />
        {contactId && <input type="hidden" name="contactId" value={contactId} />}
        {companyId && <input type="hidden" name="companyId" value={companyId} />}
        <div className="flex flex-wrap gap-3">
          <select name="type" className="rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700 text-sm">
            <option value="call">Call</option>
            <option value="email">Email</option>
            <option value="mailout">Mailout</option>
          </select>
        </div>
        <input type="text" name="subject" required placeholder="Subject" className="w-full rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700 text-sm" />
        <textarea name="notes" rows={2} placeholder="Notes (optional)" className="w-full rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700 text-sm" />
        <button type="submit" className="rounded bg-emerald-700 px-3 py-1.5 text-sm text-white hover:bg-emerald-600">Log activity</button>
      </form>

      {communications.length === 0 ? (
        <p className="text-neutral-500 text-sm">No calls, emails, or mailouts logged yet.</p>
      ) : (
        <ul className="space-y-2">
          {communications.map((c) => (
            <li key={c.id} className="rounded-lg bg-neutral-900 border border-neutral-800 p-3 text-sm">
              <div className="flex items-center justify-between gap-2">
                <span className="text-emerald-400 capitalize">{c.type}</span>
                <span className="text-neutral-500 text-xs">{c.createdAt.toLocaleString()}</span>
              </div>
              <p className="font-medium mt-1">{c.subject}</p>
              {c.notes && <p className="text-neutral-400 mt-1">{c.notes}</p>}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
