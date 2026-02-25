"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Category = { id: string; name: string; sortOrder: number; active: boolean };

export default function MinidayCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editActive, setEditActive] = useState(true);

  const fetchCategories = async () => {
    const res = await fetch("/api/life-plan/miniday-categories");
    if (!res.ok) {
      setError("Failed to load categories");
      return;
    }
    const data = await res.json();
    setCategories(data);
    setError(null);
  };

  useEffect(() => {
    fetchCategories().finally(() => setLoading(false));
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;
    const res = await fetch("/api/life-plan/miniday-categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, sortOrder: categories.length }),
      credentials: "include",
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Failed to add");
      return;
    }
    setNewName("");
    await fetchCategories();
  };

  const handleUpdate = async (id: string) => {
    const res = await fetch("/api/life-plan/miniday-categories/" + id, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName.trim(), active: editActive }),
      credentials: "include",
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Failed to update");
      return;
    }
    setEditingId(null);
    await fetchCategories();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this verb/category? Only admin can delete.")) return;
    const res = await fetch("/api/life-plan/miniday-categories/" + id, {
      method: "DELETE",
      credentials: "include",
    });
    if (!res.ok) {
      setError("Failed to delete (or unauthorized)");
      return;
    }
    await fetchCategories();
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-neutral-950 text-neutral-100 p-6">
        <div className="max-w-2xl mx-auto">
          <p className="text-neutral-500">Loading…</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 p-6">
      <div className="max-w-2xl mx-auto">
        <header className="border-b border-neutral-800 pb-4 mb-6">
          <Link href="/admin/life-plan" className="text-neutral-400 hover:text-white text-sm">← Life Plan</Link>
          <h1 className="text-2xl font-semibold mt-2">Miniday categories (PM verbs)</h1>
          <p className="text-neutral-500 text-sm mt-1">These verbs group the Live PM report and member schedule. Edit, add, or set inactive. Admin only can delete.</p>
        </header>

        {error && (
          <p className="text-amber-500 text-sm mb-4">{error}</p>
        )}

        <form onSubmit={handleAdd} className="rounded bg-neutral-900 p-4 mb-6 flex gap-2 items-end">
          <label className="flex-1">
            <span className="block text-sm text-neutral-400 mb-1">New verb / category</span>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Call, Read"
              className="w-full rounded bg-neutral-800 px-3 py-2 text-white border border-neutral-700"
            />
          </label>
          <button type="submit" className="rounded bg-emerald-700 px-4 py-2 text-sm text-white hover:bg-emerald-600">Add</button>
        </form>

        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="text-left text-neutral-400 border-b border-neutral-700">
                <th className="py-2 pr-4">Order</th>
                <th className="py-2 pr-4">Name (verb)</th>
                <th className="py-2 pr-4">Active</th>
                <th className="py-2"></th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c.id} className={`border-b border-neutral-800 ${!c.active ? "opacity-60" : ""}`}>
                  <td className="py-2 pr-4 text-neutral-500">{c.sortOrder}</td>
                  <td className="py-2 pr-4">
                    {editingId === c.id ? (
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full max-w-[180px] rounded bg-neutral-800 px-2 py-1 text-white border border-neutral-600"
                        autoFocus
                      />
                    ) : (
                      <span>{c.name}</span>
                    )}
                  </td>
                  <td className="py-2 pr-4">
                    {editingId === c.id ? (
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={editActive}
                          onChange={(e) => setEditActive(e.target.checked)}
                          className="rounded border-neutral-600"
                        />
                        Active
                      </label>
                    ) : (
                      <span className={c.active ? "text-emerald-400" : "text-neutral-500"}>{c.active ? "Yes" : "Inactive"}</span>
                    )}
                  </td>
                  <td className="py-2">
                    {editingId === c.id ? (
                      <span className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleUpdate(c.id)}
                          className="rounded bg-neutral-600 px-2 py-1 text-xs text-white hover:bg-neutral-500"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => { setEditingId(null); setEditName(""); setEditActive(true); }}
                          className="rounded bg-neutral-700 px-2 py-1 text-xs text-neutral-300 hover:bg-neutral-600"
                        >
                          Cancel
                        </button>
                      </span>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => { setEditingId(c.id); setEditName(c.name); setEditActive(c.active); }}
                          className="text-emerald-400 text-sm hover:underline mr-2"
                        >
                          Edit
                        </button>
                        <span className="mx-1 text-neutral-600">|</span>
                        <button
                          type="button"
                          onClick={() => handleDelete(c.id)}
                          className="text-red-400 text-sm hover:underline"
                          title="Admin only: delete this category"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {categories.length === 0 && <p className="text-neutral-500 text-sm py-4">No categories yet. Add one above or run seed.</p>}
        </div>
      </div>
    </main>
  );
}
