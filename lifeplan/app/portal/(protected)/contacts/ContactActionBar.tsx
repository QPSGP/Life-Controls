"use client";

import type { ContactAction } from "@/lib/crm-channels";

const kindStyles: Record<ContactAction["kind"], string> = {
  call: "bg-emerald-800 hover:bg-emerald-700",
  text: "bg-sky-800 hover:bg-sky-700",
  email: "bg-violet-800 hover:bg-violet-700",
  whatsapp: "bg-green-800 hover:bg-green-700",
  open: "bg-neutral-700 hover:bg-neutral-600",
};

export function ContactActionBar({ actions }: { actions: ContactAction[] }) {
  if (actions.length === 0) return null;

  const primary = actions.slice(0, 4);
  const rest = actions.slice(4);

  return (
    <section className="mb-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {primary.map((action) => (
          <a
            key={action.href + action.label}
            href={action.href}
            className={`rounded-lg px-3 py-3 text-center text-sm font-medium text-white ${kindStyles[action.kind]}`}
          >
            {action.label}
          </a>
        ))}
      </div>
      {rest.length > 0 && (
        <ul className="mt-3 space-y-1">
          {rest.map((action) => (
            <li key={action.href + action.label}>
              <a href={action.href} className="text-emerald-400 text-sm hover:underline break-all">
                {action.label}
              </a>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
