import { prisma } from "@/lib/db";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminMemberEditPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const member = await prisma.member.findUnique({
    where: { id },
    select: { id: true, email: true, firstName: true, lastName: true, company: true, title: true, phone: true, street: true, city: true, state: true, zip: true, country: true, notes: true },
  });
  if (!member) notFound();

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 p-6">
      <div className="max-w-2xl mx-auto">
        <header className="border-b border-neutral-800 pb-4 mb-6">
          <Link href="/admin" className="text-neutral-400 hover:text-white text-sm">← Admin</Link>
          <h1 className="text-2xl font-semibold mt-2">Edit member</h1>
        </header>

        {error && <p className="text-amber-500 text-sm mb-4">Email is required.</p>}

        <form action={"/api/members/" + id} method="POST" className="rounded-lg bg-neutral-900 p-4 space-y-3">
          <div>
            <label className="block text-sm text-neutral-400 mb-1">Email (required)</label>
            <input type="email" name="email" required defaultValue={member.email} className="w-full rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-neutral-400 mb-1">First name</label>
              <input type="text" name="firstName" defaultValue={member.firstName ?? ""} className="w-full rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700" />
            </div>
            <div>
              <label className="block text-sm text-neutral-400 mb-1">Last name</label>
              <input type="text" name="lastName" defaultValue={member.lastName ?? ""} className="w-full rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700" />
            </div>
          </div>
          <div>
            <label className="block text-sm text-neutral-400 mb-1">Company</label>
            <input type="text" name="company" defaultValue={member.company ?? ""} className="w-full rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700" />
          </div>
          <div>
            <label className="block text-sm text-neutral-400 mb-1">Title</label>
            <input type="text" name="title" defaultValue={member.title ?? ""} className="w-full rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700" />
          </div>
          <div>
            <label className="block text-sm text-neutral-400 mb-1">Phone</label>
            <input type="text" name="phone" defaultValue={member.phone ?? ""} className="w-full rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700" />
          </div>
          <div>
            <label className="block text-sm text-neutral-400 mb-1">Street</label>
            <input type="text" name="street" defaultValue={member.street ?? ""} className="w-full rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm text-neutral-400 mb-1">City</label>
              <input type="text" name="city" defaultValue={member.city ?? ""} className="w-full rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700" />
            </div>
            <div>
              <label className="block text-sm text-neutral-400 mb-1">State</label>
              <input type="text" name="state" defaultValue={member.state ?? ""} className="w-full rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700" />
            </div>
            <div>
              <label className="block text-sm text-neutral-400 mb-1">ZIP</label>
              <input type="text" name="zip" defaultValue={member.zip ?? ""} className="w-full rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700" />
            </div>
          </div>
          <div>
            <label className="block text-sm text-neutral-400 mb-1">Country</label>
            <input type="text" name="country" defaultValue={member.country ?? ""} className="w-full rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700" />
          </div>
          <div>
            <label className="block text-sm text-neutral-400 mb-1">Notes</label>
            <textarea name="notes" rows={2} defaultValue={member.notes ?? ""} className="w-full rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700" />
          </div>
          <button type="submit" className="rounded bg-emerald-700 px-4 py-2 text-sm text-white hover:bg-emerald-600">Save changes</button>
        </form>
      </div>
    </main>
  );
}
