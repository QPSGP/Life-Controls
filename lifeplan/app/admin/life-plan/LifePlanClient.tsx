"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

type User = { id: string; email: string; firstName: string | null; lastName: string | null };
type Subject = { id: string; name: string; verb?: string | null; noun?: string | null; object?: string | null; objective?: string | null };
type MemberWithPlan = { subjectId: string; subjectName: string; memberId: string; memberName: string; memberEmail: string };

export function LifePlanClient() {
  const searchParams = useSearchParams();
  const selectedUserId = searchParams.get("userId") ?? undefined;
  const error = searchParams.get("error") ?? undefined;

  const [users, setUsers] = useState<User[]>([]);
  const [subjectBusinesses, setSubjectBusinesses] = useState<Subject[]>([]);
  const [membersWithPlans, setMembersWithPlans] = useState<MemberWithPlan[]>([]);
  const [dbError, setDbError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const q = selectedUserId ? `?userId=${encodeURIComponent(selectedUserId)}` : "";
    fetch(`/api/life-plan${q}`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        if (data.error) {
          setDbError(data.error);
          setUsers(data.users ?? []);
          setSubjectBusinesses(data.subjectBusinesses ?? []);
          setMembersWithPlans(data.membersWithPlans ?? []);
        } else {
          setUsers(data.users ?? []);
          setSubjectBusinesses(data.subjectBusinesses ?? []);
          setMembersWithPlans(data.membersWithPlans ?? []);
        }
      })
      .catch((e) => {
        if (!cancelled) setDbError(e instanceof Error ? e.message : String(e));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [selectedUserId]);

  if (loading) {
    return (
      <main className="min-h-screen bg-neutral-950 text-neutral-100 p-6">
        <div className="max-w-2xl mx-auto">
          <header className="flex items-center justify-between border-b border-neutral-800 pb-4 mb-6">
            <h1 className="text-2xl font-semibold">Life Plan</h1>
            <Link href="/admin" className="text-neutral-400 hover:text-white text-sm">← Admin</Link>
          </header>
          <p className="text-neutral-500">Loading…</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 p-6">
      <div className="max-w-2xl mx-auto">
        <header className="flex items-center justify-between border-b border-neutral-800 pb-4 mb-6">
          <h1 className="text-2xl font-semibold">Life Plan</h1>
          <Link href="/admin" className="text-neutral-400 hover:text-white text-sm">← Admin</Link>
        </header>

        {error === "missing" && <p className="text-amber-500 text-sm mb-4">Name and user are required.</p>}
        {error === "create" && <p className="text-amber-500 text-sm mb-4">Failed to create.</p>}

        {membersWithPlans.length > 0 && (
          <section className="mb-6">
            <h2 className="text-lg font-medium text-neutral-300 mb-2">View plan for member</h2>
            <p className="text-neutral-500 text-sm mb-2">Jump to a member&apos;s life plan (Demo Personal, Demo Business, etc.).</p>
            <select
              defaultValue=""
              onChange={(e) => {
                const subjectId = e.target.value;
                if (subjectId) window.location.href = "/admin/life-plan/subject/" + subjectId;
              }}
              className="rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700 min-w-[280px]"
            >
              <option value="">Select member…</option>
              {membersWithPlans.map((m) => (
                <option key={m.memberId} value={m.subjectId}>
                  {m.memberName || m.memberEmail} — {m.subjectName}
                </option>
              ))}
            </select>
          </section>
        )}

        {dbError && (
          <div className="mb-4 p-4 rounded bg-red-950/50 border border-red-800 text-red-200 text-sm">
            <p className="font-medium">Database error</p>
            <p className="mt-1 break-all">{dbError}</p>
            <p className="mt-2 text-red-300/80">
              Run &quot;DB push and seed&quot; (GitHub Action or <code className="bg-neutral-800 px-1">npx prisma db push</code> + <code className="bg-neutral-800 px-1">npm run db:seed</code>) so the schema matches the database.
            </p>
            <p className="mt-2 text-red-300/80">
              <Link href="/api/db-status" target="_blank" rel="noopener noreferrer" className="underline">Open /api/db-status</Link> to see the exact error.
            </p>
          </div>
        )}

        <section className="mb-8">
          <h2 className="text-lg font-medium text-neutral-300 mb-3">User (plan owner)</h2>
          <p className="text-neutral-500 text-sm mb-2">Plan owners are <strong>staff users</strong> (e.g. admin). To view a <strong>member</strong>&apos;s plan, use &quot;View plan for member&quot; above.</p>
          {users.length === 0 ? (
            <div className="text-neutral-300 space-y-2">
              <p className="text-neutral-500 text-sm">No plan owners yet. Life Plan uses <strong>Users</strong> (not Members) as plan owners.</p>
              <form action="/api/life-plan/seed-user" method="POST">
                <button type="submit" className="rounded bg-emerald-700 px-4 py-2 text-sm text-white hover:bg-emerald-600">
                  Create default plan owner (Admin User)
                </button>
              </form>
              <p className="text-neutral-500 text-xs">This creates the same user as the seed: admin@sovereign-life-plan.local.</p>
            </div>
          ) : (
            <>
              <form method="GET" className="flex gap-2 mb-4">
                <select
                  name="userId"
                  defaultValue={selectedUserId ?? ""}
                  onChange={(e) => e.target.form?.submit()}
                  className="rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700"
                >
                  <option value="">Select user…</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.firstName ?? ""} {u.lastName ?? ""} ({u.email})
                    </option>
                  ))}
                </select>
              </form>

              {selectedUserId && (
                <>
                  <h3 className="text-md font-medium text-neutral-400 mb-2">Subject / Business</h3>
                  <form action="/api/life-plan/subject-business" method="POST" className="rounded bg-neutral-900 p-4 mb-4 space-y-2">
                    <input type="hidden" name="userId" value={selectedUserId} />
                    <input type="text" name="name" placeholder="Name (required)" required className="w-full rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700" />
                    <div className="grid grid-cols-2 gap-2">
                      <input type="text" name="verb" placeholder="Verb" className="rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700" />
                      <input type="text" name="noun" placeholder="Noun" className="rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700" />
                      <input type="text" name="object" placeholder="Object" className="rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700" />
                      <input type="text" name="objective" placeholder="Objective" className="rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700" />
                    </div>
                    <button type="submit" className="rounded bg-emerald-700 px-4 py-2 text-sm text-white hover:bg-emerald-600">Add</button>
                  </form>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="text-left text-neutral-400 border-b border-neutral-700">
                          <th className="py-2 pr-4">Name</th>
                          <th className="py-2 pr-4">Verb</th>
                          <th className="py-2 pr-4">Noun</th>
                          <th className="py-2 pr-4">Object</th>
                          <th className="py-2 pr-4">Objective</th>
                          <th className="py-2 pr-4"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {subjectBusinesses.map((s) => (
                          <tr key={s.id} className="border-b border-neutral-800">
                            <td className="py-2 pr-4">{s.name}</td>
                            <td className="py-2 pr-4 text-neutral-400">{s.verb ?? "—"}</td>
                            <td className="py-2 pr-4 text-neutral-400">{s.noun ?? "—"}</td>
                            <td className="py-2 pr-4 text-neutral-400">{s.object ?? "—"}</td>
                            <td className="py-2 pr-4 text-neutral-400">{s.objective ?? "—"}</td>
                            <td className="py-2">
                              <Link href={"/admin/life-plan/subject/" + s.id} className="text-emerald-400 hover:underline">Open</Link>
                              <span className="mx-1 text-neutral-600">|</span>
                              <Link href={"/admin/life-plan/subject/" + s.id + "#edit"} className="text-neutral-400 text-sm hover:underline">Edit</Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {subjectBusinesses.length === 0 && <p className="text-neutral-500 text-sm py-2">No Subject/Business yet. Add one above.</p>}
                  </div>
                </>
              )}
            </>
          )}
        </section>
      </div>
    </main>
  );
}
