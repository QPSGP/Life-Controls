"use client";

import { useMemo, useState } from "react";
import {
  CHANNEL_LABELS,
  CHANNEL_TYPE_OPTIONS,
  channelsToJson,
  parseChannelsJson,
  type ChannelType,
  type ContactChannel,
} from "@/lib/crm-channels";

type Props = {
  initialChannels?: unknown;
};

const inputClass = "w-full rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700 text-sm";
const labelClass = "block text-sm text-neutral-400 mb-1";

function emptyChannel(): ContactChannel {
  return { type: "phone", label: "mobile", value: "" };
}

export function ContactChannelsEditor({ initialChannels }: Props) {
  const [channels, setChannels] = useState<ContactChannel[]>(() => {
    const parsed = parseChannelsJson(initialChannels);
    return parsed.length > 0 ? parsed : [];
  });

  const jsonValue = useMemo(() => channelsToJson(channels.filter((c) => c.value.trim())), [channels]);

  function update(index: number, patch: Partial<ContactChannel>) {
    setChannels((prev) => {
      const next = [...prev];
      const current = { ...next[index], ...patch };
      if (patch.type) {
        current.label = CHANNEL_LABELS[patch.type][0]?.value ?? "other";
      }
      if (patch.primary) {
        for (let i = 0; i < next.length; i++) {
          if (i !== index && next[i].type === current.type) next[i] = { ...next[i], primary: false };
        }
      }
      next[index] = current;
      return next;
    });
  }

  function remove(index: number) {
    setChannels((prev) => prev.filter((_, i) => i !== index));
  }

  function add() {
    setChannels((prev) => [...prev, emptyChannel()]);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-medium text-neutral-300">More ways to reach them</h3>
          <p className="text-xs text-neutral-500 mt-0.5">Social, messaging, and extra phones or emails.</p>
        </div>
        <button
          type="button"
          onClick={add}
          className="rounded bg-neutral-700 px-3 py-1.5 text-xs text-white hover:bg-neutral-600 shrink-0"
        >
          + Add
        </button>
      </div>

      {channels.length === 0 ? (
        <p className="text-neutral-500 text-sm">No extra channels yet. Tap Add for LinkedIn, WhatsApp, etc.</p>
      ) : (
        <ul className="space-y-3">
          {channels.map((ch, index) => (
            <li key={index} className="rounded-lg border border-neutral-800 bg-neutral-950 p-3 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className={labelClass}>Type</label>
                  <select
                    value={ch.type}
                    onChange={(e) => update(index, { type: e.target.value as ChannelType })}
                    className={inputClass}
                  >
                    {CHANNEL_TYPE_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Label</label>
                  <select
                    value={ch.label}
                    onChange={(e) => update(index, { label: e.target.value })}
                    className={inputClass}
                  >
                    {CHANNEL_LABELS[ch.type].map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className={labelClass}>Value</label>
                <input
                  type="text"
                  value={ch.value}
                  onChange={(e) => update(index, { value: e.target.value })}
                  placeholder={
                    ch.type === "email"
                      ? "name@example.com"
                      : ch.type === "phone" || ch.label === "whatsapp"
                        ? "+1 555 0100"
                        : "https://…"
                  }
                  className={inputClass}
                />
              </div>
              <div className="flex items-center justify-between gap-2">
                <label className="flex items-center gap-2 text-xs text-neutral-400">
                  <input
                    type="checkbox"
                    checked={!!ch.primary}
                    onChange={(e) => update(index, { primary: e.target.checked })}
                    className="rounded"
                  />
                  Primary for this type
                </label>
                <button type="button" onClick={() => remove(index)} className="text-red-400 text-xs hover:text-red-300">
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <input type="hidden" name="channelsJson" value={jsonValue} />
    </div>
  );
}
