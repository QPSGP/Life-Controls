"use client";

export function CancelSubscriptionButton({
  subscriptionId,
  memberEmail,
  planName,
}: {
  subscriptionId: string;
  memberEmail: string;
  planName: string;
}) {
  return (
    <form
      action={`/api/members/subscriptions/${subscriptionId}/cancel`}
      method="POST"
      className="inline ml-auto"
      onSubmit={(e) => {
        if (
          !confirm(
            `Cancel ${planName} for ${memberEmail}? They will no longer show as actively subscribed to this plan.`
          )
        ) {
          e.preventDefault();
        }
      }}
    >
      <button
        type="submit"
        className="rounded bg-red-900/80 px-2 py-1 text-xs text-red-200 hover:bg-red-800"
      >
        Cancel
      </button>
    </form>
  );
}
