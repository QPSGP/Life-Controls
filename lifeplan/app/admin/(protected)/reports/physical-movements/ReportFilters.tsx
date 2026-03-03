"use client";

import Link from "next/link";

type Params = {
  subjectId?: string;
  memberId?: string;
  dateFrom?: string;
  dateTo?: string;
  verb?: string;
  done?: string;
};

export function ReportFilters({
  params,
  subjects,
  members,
  verbOptions,
  hasFilters,
}: {
  params: Params;
  subjects: { id: string; name: string }[];
  members: { id: string; email: string; firstName: string | null; lastName: string | null }[];
  verbOptions: string[];
  hasFilters: boolean;
}) {
  const submitOnChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    e.currentTarget.form?.requestSubmit();
  };
  const subjectId = params.subjectId ?? "";
  const memberId = params.memberId ?? "";
  const dateFrom = params.dateFrom ?? "";
  const dateTo = params.dateTo ?? "";
  const verb = params.verb ?? "";
  const done = params.done ?? "";

  return (
    <div className="mb-6 print:hidden flex flex-wrap gap-4 items-end">
      <form method="GET" className="flex flex-wrap gap-2 items-end">
        <input type="hidden" name="memberId" value={memberId} />
        <input type="hidden" name="dateFrom" value={dateFrom} />
        <input type="hidden" name="dateTo" value={dateTo} />
        <input type="hidden" name="verb" value={verb} />
        <input type="hidden" name="done" value={done} />
        <label className="text-sm text-neutral-400">Subject</label>
        <select name="subjectId" onChange={submitOnChange} className="rounded bg-neutral-800 px-2 py-1.5 text-white border border-neutral-700 text-sm min-w-[140px]" defaultValue={subjectId}>
          <option value="">All</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </form>
      <form method="GET" className="flex flex-wrap gap-2 items-end">
        <input type="hidden" name="subjectId" value={subjectId} />
        <input type="hidden" name="dateFrom" value={dateFrom} />
        <input type="hidden" name="dateTo" value={dateTo} />
        <input type="hidden" name="verb" value={verb} />
        <input type="hidden" name="done" value={done} />
        <label className="text-sm text-neutral-400">Member plan</label>
        <select name="memberId" onChange={submitOnChange} className="rounded bg-neutral-800 px-2 py-1.5 text-white border border-neutral-700 text-sm min-w-[160px]" defaultValue={memberId}>
          <option value="">All</option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>{[m.firstName, m.lastName].filter(Boolean).join(" ") || m.email}</option>
          ))}
        </select>
      </form>
      {verbOptions.length > 0 && (
        <form method="GET" className="flex flex-wrap gap-2 items-end">
          <input type="hidden" name="subjectId" value={subjectId} />
          <input type="hidden" name="memberId" value={memberId} />
          <input type="hidden" name="dateFrom" value={dateFrom} />
          <input type="hidden" name="dateTo" value={dateTo} />
          <input type="hidden" name="done" value={done} />
          <label className="text-sm text-neutral-400">Verb</label>
          <select name="verb" onChange={submitOnChange} className="rounded bg-neutral-800 px-2 py-1.5 text-white border border-neutral-700 text-sm" defaultValue={verb}>
            <option value="">All</option>
            {verbOptions.map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </form>
      )}
      <form method="GET" className="flex flex-wrap gap-2 items-end">
        <input type="hidden" name="subjectId" value={subjectId} />
        <input type="hidden" name="memberId" value={memberId} />
        <input type="hidden" name="verb" value={verb} />
        <input type="hidden" name="done" value={done} />
        <label className="text-sm text-neutral-400">Done</label>
        <select name="done" onChange={submitOnChange} className="rounded bg-neutral-800 px-2 py-1.5 text-white border border-neutral-700 text-sm" defaultValue={done || "all"}>
          <option value="all">All</option>
          <option value="no">To do</option>
          <option value="yes">Done</option>
        </select>
      </form>
      <form method="GET" className="flex flex-wrap gap-2 items-end">
        <input type="hidden" name="subjectId" value={subjectId} />
        <input type="hidden" name="memberId" value={memberId} />
        <input type="hidden" name="verb" value={verb} />
        <input type="hidden" name="done" value={done} />
        <label className="text-sm text-neutral-400">From</label>
        <input type="date" name="dateFrom" defaultValue={dateFrom} className="rounded bg-neutral-800 px-2 py-1.5 text-white border border-neutral-700 text-sm" />
        <label className="text-sm text-neutral-400">To</label>
        <input type="date" name="dateTo" defaultValue={dateTo} className="rounded bg-neutral-800 px-2 py-1.5 text-white border border-neutral-700 text-sm" />
        <button type="submit" className="rounded bg-neutral-700 px-2 py-1.5 text-sm text-white hover:bg-neutral-600">Apply</button>
      </form>
      {hasFilters && (
        <Link href="/admin/reports/physical-movements" className="text-neutral-400 text-sm hover:text-white">Clear filters</Link>
      )}
    </div>
  );
}
