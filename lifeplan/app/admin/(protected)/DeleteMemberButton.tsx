"use client";

export function DeleteMemberButton({ memberId, memberName }: { memberId: string; memberName: string }) {
  return (
    <form
      action={`/api/members/${memberId}/delete`}
      method="POST"
      className="inline"
      onSubmit={(e) => {
        if (!confirm(`Delete member "${memberName}"? This removes their subscriptions, invoices, and all related data.`)) {
          e.preventDefault();
        }
      }}
    >
      <button type="submit" className="rounded bg-red-900/80 px-2 py-1 text-xs text-red-200 hover:bg-red-800">
        Delete
      </button>
    </form>
  );
}
