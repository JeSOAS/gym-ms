"use client";
import { useEffect, useState } from "react";
import type { Trainer } from "@/types/entities";

export default function TrainersPage() {
  const [items, setItems] = useState<Trainer[]>([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState<{ name: string; specialization: string }>({
    name: "",
    specialization: "",
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ name: string; specialization: string }>({
    name: "",
    specialization: "",
  });

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/trainers", { cache: "no-store" });
      const data = (await res.json()) as Trainer[];
      setItems(data);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    void load();
  }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/trainers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      const msg = await safeText(res);
      alert(`Create failed: ${msg}`);
      return;
    }
    setForm({ name: "", specialization: "" });
    void load();
  }

  function startEdit(t: Trainer) {
    setEditingId(t._id);
    setEditForm({ name: t.name, specialization: t.specialization });
  }

  async function saveEdit(id: string) {
    const res = await fetch(`/api/trainers/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    });
    if (!res.ok) {
      const msg = await safeText(res);
      alert(`Update failed: ${msg}`);
      return;
    }
    setEditingId(null);
    void load();
  }

  async function remove(id: string) {
    const ok = window.confirm("Are you sure?");
    if (!ok) return;
    const res = await fetch(`/api/trainers/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const msg = await safeText(res);
      alert(`Delete failed: ${msg}`);
      return;
    }
    void load();
  }

  return (
    <div className="container stack-lg">
      <h1 className="title-xl">Trainers</h1>

      {/* Create */}
      <form onSubmit={create} className="card stack-sm">
        <div className="title-md">Create Trainer</div>
        <input
          className="input"
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          className="input"
          placeholder="Specialization (e.g., Strength, Yoga)"
          value={form.specialization}
          onChange={(e) => setForm({ ...form, specialization: e.target.value })}
        />
        <button className="btn btn-primary">Create</button>
      </form>

      <div className="stack-sm">
        <div className="text-muted small">{loading ? "Loading..." : `Total: ${items.length}`}</div>
        {items.map((t) => (
          <div key={t._id} className="card">
            {editingId === t._id ? (
              <div className="stack-sm">
                <input
                  className="input"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                />
                <input
                  className="input"
                  value={editForm.specialization}
                  onChange={(e) => setEditForm({ ...editForm, specialization: e.target.value })}
                />
                <div className="hstack gap-sm">
                  <button
                    type="button"
                    onClick={() => void saveEdit(t._id)}
                    className="btn btn-primary"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    className="btn"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="row between gap-md">
                <div>
                  <div className="semibold">{t.name}</div>
                  <div className="small muted">{t.specialization}</div>
                </div>
                <div className="hstack gap-sm">
                  <button onClick={() => startEdit(t)} className="btn">
                    Edit
                  </button>
                  <button onClick={() => void remove(t._id)} className="btn btn-danger">
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

async function safeText(res: Response) {
  try {
    return await res.text();
  } catch {
    return res.statusText || "Unknown error";
  }
}