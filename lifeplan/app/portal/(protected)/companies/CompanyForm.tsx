import { CRM_CATEGORY_OPTIONS, CRM_VISIBILITY_OPTIONS } from "@/lib/crm";

type CompanyFormProps = {
  action: string;
  company?: {
    visibility: string;
    category: string;
    name: string | null;
    website: string | null;
    phone: string | null;
    street: string | null;
    city: string | null;
    state: string | null;
    zip: string | null;
    country: string | null;
    industry: string | null;
    size: string | null;
    notes: string | null;
    keyPeople: string | null;
    tags: string | null;
    source: string | null;
  };
  submitLabel?: string;
};

const inputClass = "w-full rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700";
const labelClass = "block text-sm text-neutral-400 mb-1";

export function CompanyForm({ action, company, submitLabel = "Save company" }: CompanyFormProps) {
  return (
    <form action={action} method="POST" className="rounded-lg bg-neutral-900 p-4 space-y-4 border border-neutral-800">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Category</label>
          <select name="category" defaultValue={company?.category ?? "business"} className={inputClass}>
            {CRM_CATEGORY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Visibility</label>
          <select name="visibility" defaultValue={company?.visibility ?? "private"} className={inputClass}>
            {CRM_VISIBILITY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className={labelClass}>Company name *</label>
        <input type="text" name="name" required defaultValue={company?.name ?? ""} className={inputClass} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Website</label>
          <input type="text" name="website" defaultValue={company?.website ?? ""} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Phone</label>
          <input type="text" name="phone" defaultValue={company?.phone ?? ""} className={inputClass} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Industry</label>
          <input type="text" name="industry" defaultValue={company?.industry ?? ""} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Size</label>
          <input type="text" name="size" defaultValue={company?.size ?? ""} placeholder="SMB, Enterprise" className={inputClass} />
        </div>
      </div>

      <div>
        <label className={labelClass}>Street</label>
        <input type="text" name="street" defaultValue={company?.street ?? ""} className={inputClass} />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className={labelClass}>City</label>
          <input type="text" name="city" defaultValue={company?.city ?? ""} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>State</label>
          <input type="text" name="state" defaultValue={company?.state ?? ""} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>ZIP</label>
          <input type="text" name="zip" defaultValue={company?.zip ?? ""} className={inputClass} />
        </div>
      </div>
      <div>
        <label className={labelClass}>Country</label>
        <input type="text" name="country" defaultValue={company?.country ?? ""} className={inputClass} />
      </div>

      <div>
        <label className={labelClass}>Notes</label>
        <textarea name="notes" rows={3} defaultValue={company?.notes ?? ""} className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>Key people</label>
        <textarea name="keyPeople" rows={2} defaultValue={company?.keyPeople ?? ""} className={inputClass} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Tags</label>
          <input type="text" name="tags" defaultValue={company?.tags ?? ""} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Source</label>
          <input type="text" name="source" defaultValue={company?.source ?? "Manual"} className={inputClass} />
        </div>
      </div>

      <button type="submit" className="rounded bg-emerald-700 px-4 py-2 text-sm text-white hover:bg-emerald-600">{submitLabel}</button>
    </form>
  );
}
