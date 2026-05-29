"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

type StaffUser = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
  createdAt: string;
  _count: { subjectBusinesses: number };
};

export default function AdminStaffPage() {
  const [users, setUsers] = useState<StaffUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newFirst, setNewFirst] = useState("");
  const [newLast, setNewLast] = useState("");
  const [newRole, setNewRole] = useState<"admin" | "agent">("agent");
  const [creating, setCreating] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    fetch("/api/admin/users", { credentials: "include" })
      .then((res) => {
        if (res.status === 401) {
          window.location.href = "/admin/login";
          return null;
        }
        if (!res.ok) throw new Error(`Failed ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (data) setUsers(data.users ?? []);
      })
      .catch((e) => setError(e instanceof Error ? e.message : String(e)))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function createUser(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: newEmail,
          password: newPassword,
          firstName: newFirst || undefined,
          lastName: newLast || undefined,
          role: newRole,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || res.statusText);
      setNewEmail("");
      setNewPassword("");
      setNewFirst("");
      setNewLast("");
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setCreating(false);
    }
  }

  async function deleteUser(id: string) {
    if (!confirm("Delete this plan owner? Their subject/business hierarchy will be removed (cascade).")) return;
    setError(null);
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE", credentials: "include" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || res.statusText);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 p-6">
      <div className="max-w-3xl mx-auto">
        <header className="flex items-center justify-between border-b border-neutral-800 pb-4 mb-6">
          <h1 className="text-2xl font-semibold">Staff — plan owners</h1>
          <div className="flex items-center gap-4">
            <Link href="/admin/life-plan" className="text-neutral-400 hover:text-white text-sm">
              Life Plan
            </Link>
            <Link href="/admin" className="text-neutral-400 hover:text-white text-sm">
              Admin
            </Link>
          </div>
        </header>

        <p className="text-neutral-500 text-sm mb-6">
          Users here own the <strong>Life Plan</strong> hierarchy (subjects, purposes, responsibilities, physical movements). Admin login to this site still uses{" "}
          <code className="text-neutral-400">ADMIN_PASSWORD</code> in the environment; these accounts are for data ownership and optional future staff sign-in.
        </p>

        {error && (
          <div className="mb-4 p-4 rounded bg-amber-950/50 border border-amber-800 text-amber-200 text-sm">{error}</div>
        )}

        <section className="mb-8 rounded bg-neutral-900 p-4 border border-neutral-800">
          <h2 className="text-sm font-medium text-neutral-400 mb-3">Add plan owner</h2>
          <form onSubmit={createUser} className="flex flex-col gap-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="flex flex-col gap-1 text-sm">
                <span className="text-neutral-500">Email</span>
                <input
                  required
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span className="text-neutral-500">Password</span>
                <input
                  required
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700"
                  autoComplete="new-password"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span className="text-neutral-500">First name</span>
                <input value={newFirst} onChange={(e) => setNewFirst(e.target.value)} className="rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700" />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span className="text-neutral-500">Last name</span>
                <input value={newLast} onChange={(e) => setNewLast(e.target.value)} className="rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700" />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span className="text-neutral-500">Role</span>
                <select value={newRole} onChange={(e) => setNewRole(e.target.value as "admin" | "agent")} className="rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700">
                  <option value="agent">agent</option>
                  <option value="admin">admin</option>
                </select>
              </label>
            </div>
            <button type="submit" disabled={creating} className="self-start rounded bg-emerald-700 px-4 py-2 text-sm text-white hover:bg-emerald-600 disabled:opacity-50">
              {creating ? "Creating…" : "Create user"}
            </button>
          </form>
        </section>

        <section>
          <h2 className="text-sm font-medium text-neutral-400 mb-3">Existing users</h2>
          {loading ? (
            <p className="text-neutral-500">Loading…</p>
          ) : users.length === 0 ? (
            <p className="text-neutral-500">No users yet. Create one above or use Life Plan → “Create default plan owner”.</p>
          ) : (
            <ul className="space-y-3">
              {users.map((u) => (
                <StaffUserRow key={u.id} user={u} onUpdated={load} onDelete={() => deleteUser(u.id)} onError={setError} />
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}

function StaffUserRow({
  user,
  onUpdated,
  onDelete,
  onError,
}: {
  user: StaffUser;
  onUpdated: () => void;
  onDelete: () => void;
  onError: (msg: string | null) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [firstName, setFirstName] = useState(user.firstName ?? "");
  const [lastName, setLastName] = useState(user.lastName ?? "");
  const [role, setRole] = useState(user.role);
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    onError(null);
    try {
      const body: Record<string, string> = { firstName, lastName, role };
      if (password.trim()) body.password = password.trim();
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || res.statusText);
      setEditing(false);
      setPassword("");
      onUpdated();
    } catch (err) {
      onError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <li className="rounded bg-neutral-900 border border-neutral-800 p-4">
      {!editing ? (
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="font-medium text-white">{user.email}</p>
            <p className="text-sm text-neutral-400">
              {[user.firstName, user.lastName].filter(Boolean).join(" ") || "—"} · role: {user.role} · {user._count.subjectBusinesses} subject(s)/business(es)
            </p>
            <Link href={`/admin/life-plan?userId=${encodeURIComponent(user.id)}`} className="text-emerald-500 hover:text-emerald-400 text-sm mt-1 inline-block">
              Open Life Plan for this user →
            </Link>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => setEditing(true)} className="rounded bg-neutral-700 px-3 py-1.5 text-sm hover:bg-neutral-600">
              Edit
            </button>
            <button type="button" onClick={onDelete} className="rounded bg-red-900/50 px-3 py-1.5 text-sm text-red-200 hover:bg-red-900/70">
              Delete
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={save} className="flex flex-col gap-3">
          <p className="text-sm text-neutral-500">{user.email}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-neutral-500">First name</span>
              <input value={firstName} onChange={(e) => setFirstName(e.target.value)} className="rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700" />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-neutral-500">Last name</span>
              <input value={lastName} onChange={(e) => setLastName(e.target.value)} className="rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700" />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-neutral-500">Role</span>
              <select value={role} onChange={(e) => setRole(e.target.value)} className="rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700">
                <option value="agent">agent</option>
                <option value="admin">admin</option>
              </select>
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-neutral-500">New password (optional)</span>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700" autoComplete="new-password" />
            </label>
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={saving} className="rounded bg-emerald-700 px-3 py-1.5 text-sm text-white hover:bg-emerald-600 disabled:opacity-50">
              Save
            </button>
            <button type="button" onClick={() => { setEditing(false); setPassword(""); }} className="rounded bg-neutral-700 px-3 py-1.5 text-sm">
              Cancel
            </button>
          </div>
        </form>
      )}
    </li>
  );
}
