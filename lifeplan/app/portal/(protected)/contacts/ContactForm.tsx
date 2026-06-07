import { CRM_CATEGORY_OPTIONS, CRM_VISIBILITY_OPTIONS } from "@/lib/crm";
import { PREFERRED_CHANNEL_OPTIONS } from "@/lib/crm-channels";
import { ContactChannelsEditor } from "./ContactChannelsEditor";

type CompanyOption = { id: string; name: string | null };

type ContactFormProps = {
  action: string;
  companies: CompanyOption[];
  contact?: {
    visibility: string;
    category: string;
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
    preferredChannel?: string | null;
    channels?: unknown;
  };
  submitLabel?: string;
};

const inputClass = "w-full rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700";
const labelClass = "block text-sm text-neutral-400 mb-1";

export function ContactForm({ action, companies, contact, submitLabel = "Save contact" }: ContactFormProps) {
  return (
    <form action={action} method="POST" className="rounded-lg bg-neutral-900 p-4 space-y-4 border border-neutral-800">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Category</label>
          <select name="category" defaultValue={contact?.category ?? "business"} className={inputClass}>
            {CRM_CATEGORY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Visibility</label>
          <select name="visibility" defaultValue={contact?.visibility ?? "private"} className={inputClass}>
            {CRM_VISIBILITY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>First name</label>
          <input type="text" name="firstName" defaultValue={contact?.firstName ?? ""} className={inputClass} autoComplete="given-name" />
        </div>
        <div>
          <label className={labelClass}>Last name</label>
          <input type="text" name="lastName" defaultValue={contact?.lastName ?? ""} className={inputClass} autoComplete="family-name" />
        </div>
      </div>

      <div>
        <label className={labelClass}>Display name (optional)</label>
        <input type="text" name="displayName" defaultValue={contact?.displayName ?? ""} className={inputClass} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Email</label>
          <input type="email" name="email" defaultValue={contact?.email ?? ""} className={inputClass} autoComplete="email" inputMode="email" />
        </div>
        <div>
          <label className={labelClass}>Secondary email</label>
          <input type="email" name="emailSecondary" defaultValue={contact?.emailSecondary ?? ""} className={inputClass} inputMode="email" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className={labelClass}>Phone</label>
          <input type="tel" name="phone" defaultValue={contact?.phone ?? ""} className={inputClass} autoComplete="tel" inputMode="tel" />
        </div>
        <div>
          <label className={labelClass}>Mobile</label>
          <input type="tel" name="mobile" defaultValue={contact?.mobile ?? ""} className={inputClass} autoComplete="tel" inputMode="tel" />
        </div>
        <div>
          <label className={labelClass}>Fax</label>
          <input type="tel" name="fax" defaultValue={contact?.fax ?? ""} className={inputClass} inputMode="tel" />
        </div>
      </div>

      <div>
        <label className={labelClass}>Preferred way to reach them</label>
        <select name="preferredChannel" defaultValue={contact?.preferredChannel ?? ""} className={inputClass}>
          {PREFERRED_CHANNEL_OPTIONS.map((o) => (
            <option key={o.value || "auto"} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      <ContactChannelsEditor initialChannels={contact?.channels} />

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Job title</label>
          <input type="text" name="jobTitle" defaultValue={contact?.jobTitle ?? ""} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Company (text)</label>
          <input type="text" name="companyName" defaultValue={contact?.companyName ?? ""} className={inputClass} />
        </div>
      </div>

      <div>
        <label className={labelClass}>Link to company record</label>
        <select name="companyId" defaultValue={contact?.companyId ?? ""} className={inputClass}>
          <option value="">— None —</option>
          {companies.map((c) => (
            <option key={c.id} value={c.id}>{c.name || "Unnamed"}</option>
          ))}
        </select>
      </div>

      <div>
        <label className={labelClass}>Street</label>
        <input type="text" name="street" defaultValue={contact?.street ?? ""} className={inputClass} autoComplete="street-address" />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className={labelClass}>City</label>
          <input type="text" name="city" defaultValue={contact?.city ?? ""} className={inputClass} autoComplete="address-level2" />
        </div>
        <div>
          <label className={labelClass}>State</label>
          <input type="text" name="state" defaultValue={contact?.state ?? ""} className={inputClass} autoComplete="address-level1" />
        </div>
        <div>
          <label className={labelClass}>ZIP</label>
          <input type="text" name="zip" defaultValue={contact?.zip ?? ""} className={inputClass} autoComplete="postal-code" />
        </div>
      </div>
      <div>
        <label className={labelClass}>Country</label>
        <input type="text" name="country" defaultValue={contact?.country ?? ""} className={inputClass} autoComplete="country-name" />
      </div>

      <div>
        <label className={labelClass}>Notes</label>
        <textarea name="notes" rows={3} defaultValue={contact?.notes ?? ""} className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>How to engage</label>
        <textarea name="howToEngage" rows={2} defaultValue={contact?.howToEngage ?? ""} placeholder="e.g. Prefers email, mornings best" className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>Key facts</label>
        <textarea name="keyFacts" rows={2} defaultValue={contact?.keyFacts ?? ""} className={inputClass} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Tags (comma-separated)</label>
          <input type="text" name="tags" defaultValue={contact?.tags ?? ""} placeholder="VIP, Prospect" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Source</label>
          <input type="text" name="source" defaultValue={contact?.source ?? "Manual"} className={inputClass} />
        </div>
      </div>

      <button type="submit" className="w-full sm:w-auto rounded bg-emerald-700 px-4 py-3 text-sm text-white hover:bg-emerald-600">{submitLabel}</button>
    </form>
  );
}
