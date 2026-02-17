type Sub = {
  id: string;
  status: string;
  member: { email: string; firstName: string | null; lastName: string | null };
  plan: { name: string };
};

export function SubscriptionList({ subscriptions }: { subscriptions: Sub[] }) {
  if (subscriptions.length === 0) {
    return <p className="text-neutral-500 text-sm">No active subscriptions.</p>;
  }
  return (
    <ul className="space-y-2">
      {subscriptions.map((s) => (
        <li key={s.id} className="flex items-center gap-4 py-2 px-3 rounded bg-neutral-900 text-sm">
          <span>{s.member.firstName ?? ""} {s.member.lastName ?? ""}</span>
          <span className="text-neutral-400">{s.member.email}</span>
          <span className="text-emerald-400">{s.plan.name}</span>
          <span className="text-neutral-500">{s.status}</span>
        </li>
      ))}
    </ul>
  );
}
