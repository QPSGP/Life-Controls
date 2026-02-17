"use client";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="rounded bg-emerald-700 px-4 py-2 text-sm text-white hover:bg-emerald-600"
    >
      Print
    </button>
  );
}
