"use client";

import { useState } from "react";
import Link from "next/link";
import { itemLabel, type DayItem } from "@/lib/day-plan";

export function TodayPanel({ items, brief }: { items: DayItem[]; brief: string }) {
  const [list, setList] = useState(items);
  const [text, setText] = useState(brief);
  const [source, setSource] = useState<"schedule" | "model">("schedule");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function orderDay() {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/portal/today", { method: "POST" });
      if (!res.ok) throw new Error("Could not order the day");
      const data = (await res.json()) as { items: DayItem[]; brief: string; source: "schedule" | "model" };
      setList(data.items);
      setText(data.brief);
      setSource(data.source);
    } catch {
      setError("Could not order the day. The list below is still from your schedule.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mb-8 rounded-xl border border-white/10 bg-black/40 p-4 backdrop-blur-xl">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <h2 className="font-display text-xl text-white">Today</h2>
          <p className="text-sm text-neutral-300 mt-1">{text}</p>
          <p className="font-mono text-[11px] uppercase tracking-wider text-neutral-500 mt-2">
            {source === "model" ? "Drafted from your schedule" : "Ordered from your schedule"}
          </p>
        </div>
        <button
          type="button"
          onClick={orderDay}
          disabled={busy || list.length === 0}
          className="shrink-0 rounded bg-accent px-3 py-2 text-xs font-semibold text-black hover:bg-accent-hover disabled:opacity-50"
        >
          {busy ? "Ordering…" : "Order my day"}
        </button>
      </div>
      {error && <p className="text-amber-400 text-sm mb-3">{error}</p>}
      {list.length === 0 ? (
        <p className="text-neutral-500 text-sm">No calls or tasks are due.</p>
      ) : (
        <ul className="space-y-2">
          {list.map((item) => (
            <li key={item.id} className="rounded-lg bg-neutral-900 px-3 py-3 flex items-start justify-between gap-3">
              <div className="text-sm min-w-0">
                <p className="font-medium text-white">{itemLabel(item)}</p>
                <p className="text-neutral-500">
                  <span className="font-mono text-xs text-accent">{item.verb || "Task"}</span>
                  {" · "}
                  {item.purpose}
                  {item.scheduledTime ? ` · ${item.scheduledTime}` : ""}
                  {item.overdue ? " · rolled over" : ""}
                </p>
              </div>
              <form action={`/api/portal/life-plan/physical-movement/${item.id}/done`} method="POST">
                <input type="hidden" name="done" value="true" />
                <input type="hidden" name="next" value="/portal" />
                <button type="submit" className="rounded px-2 py-1 text-xs bg-emerald-700 text-white hover:bg-emerald-600">
                  Mark done
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-3">
        <Link href="/portal/schedule?done=no" className="text-emerald-400 text-sm hover:underline">
          Open the schedule →
        </Link>
      </p>
    </section>
  );
}
