export function AddMemberForm() {
  return (
    <form action="/api/members" method="POST" className="flex flex-wrap gap-3 rounded bg-neutral-900 p-4">
      <input type="text" name="firstName" placeholder="First name" className="rounded bg-neutral-800 px-3 py-2 text-sm text-white border border-neutral-700 w-40" />
      <input type="text" name="lastName" placeholder="Last name" className="rounded bg-neutral-800 px-3 py-2 text-sm text-white border border-neutral-700 w-40" />
      <input type="email" name="email" placeholder="Email" required className="rounded bg-neutral-800 px-3 py-2 text-sm text-white border border-neutral-700 w-48" />
      <input type="text" name="company" placeholder="Company" className="rounded bg-neutral-800 px-3 py-2 text-sm text-white border border-neutral-700 w-40" />
      <button type="submit" className="rounded bg-emerald-700 px-4 py-2 text-sm text-white hover:bg-emerald-600">Add member</button>
    </form>
  );
}
