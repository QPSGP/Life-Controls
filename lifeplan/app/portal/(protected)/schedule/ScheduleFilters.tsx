"use client";

type ScheduleFiltersProps = {
  verb?: string;
  done?: string;
  dateFrom?: string;
  dateTo?: string;
  verbOptions: string[];
};

export function ScheduleFilters({ verb, done, dateFrom, dateTo, verbOptions }: ScheduleFiltersProps) {
  return (
    <div className="mb-6 print:hidden flex flex-wrap gap-3 items-end">
      <form method="GET" className="flex flex-wrap gap-2 items-end">
        <input type="hidden" name="verb" value={verb ?? ""} />
        <input type="hidden" name="dateFrom" value={dateFrom ?? ""} />
        <input type="hidden" name="dateTo" value={dateTo ?? ""} />
        <label className="text-sm text-neutral-400">Done</label>
        <select
          name="done"
          onChange={(e) => e.currentTarget.form?.submit()}
          className="rounded bg-neutral-800 px-2 py-1.5 text-white border border-neutral-700 text-sm"
          defaultValue={done ?? "all"}
        >
          <option value="all">All</option>
          <option value="no">To do</option>
          <option value="yes">Done</option>
        </select>
      </form>
      {verbOptions.length > 0 && (
        <form method="GET" className="flex flex-wrap gap-2 items-end">
          <input type="hidden" name="done" value={done ?? ""} />
          <input type="hidden" name="dateFrom" value={dateFrom ?? ""} />
          <input type="hidden" name="dateTo" value={dateTo ?? ""} />
          <label className="text-sm text-neutral-400">Verb</label>
          <select
            name="verb"
            onChange={(e) => e.currentTarget.form?.submit()}
            className="rounded bg-neutral-800 px-2 py-1.5 text-white border border-neutral-700 text-sm"
            defaultValue={verb ?? ""}
          >
            <option value="">All</option>
            {verbOptions.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </form>
      )}
      <form method="GET" className="flex flex-wrap gap-2 items-end">
        <input type="hidden" name="verb" value={verb ?? ""} />
        <input type="hidden" name="done" value={done ?? ""} />
        <label className="text-sm text-neutral-400">From</label>
        <input
          type="date"
          name="dateFrom"
          defaultValue={dateFrom ?? ""}
          onChange={(e) => e.currentTarget.form?.submit()}
          className="rounded bg-neutral-800 px-2 py-1.5 text-white border border-neutral-700 text-sm"
        />
        <label className="text-sm text-neutral-400">To</label>
        <input
          type="date"
          name="dateTo"
          defaultValue={dateTo ?? ""}
          onChange={(e) => e.currentTarget.form?.submit()}
          className="rounded bg-neutral-800 px-2 py-1.5 text-white border border-neutral-700 text-sm"
        />
        <button type="submit" className="rounded bg-neutral-700 px-2 py-1.5 text-sm text-white hover:bg-neutral-600">
          Apply
        </button>
      </form>
      {(verb || done || dateFrom || dateTo) && (
        <a href="/portal/schedule" className="text-neutral-400 text-sm hover:text-white">
          Clear filters
        </a>
      )}
    </div>
  );
}
