"use client";
import { useEffect, useState } from "react";
import type { WorkoutPlan, Member, Trainer } from "@/types/entities";

type ExerciseRow = { name: string; sets?: number; reps?: number };

const BASE = process.env.NEXT_PUBLIC_BASE_PATH || ""; // e.g. "/gym-ms"
const api = (path: string) => {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${BASE}${p}`;
};

export default function WorkoutPlansPage() {
  const [items, setItems] = useState<WorkoutPlan[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState<{
    planId: string;
    trainerId: string;
    memberId: string;
    exercises: ExerciseRow[];
  }>({
    planId: "",
    trainerId: "",
    memberId: "",
    exercises: [{ name: "Squat", sets: 5, reps: 5 }],
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{
    planId: string;
    trainerId: string;
    memberId: string;
    exercises: ExerciseRow[];
  }>({
    planId: "",
    trainerId: "",
    memberId: "",
    exercises: [{ name: "", sets: undefined, reps: undefined }],
  });

  async function load() {
    setLoading(true);
    try {
      const [plansRes, memRes, trRes] = await Promise.all([
        fetch(api("/api/workout-plans"), { cache: "no-store" }),
        fetch(api("/api/members"), { cache: "no-store" }),
        fetch(api("/api/trainers"), { cache: "no-store" }),
      ]);
      setItems((await plansRes.json()) as WorkoutPlan[]);
      setMembers((await memRes.json()) as Member[]);
      setTrainers((await trRes.json()) as Trainer[]);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    void load();
  }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch(api("/api/workout-plans"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      const msg = await safeText(res);
      alert(`Create failed: ${msg}`);
      return;
    }
    setForm({
      planId: "",
      trainerId: "",
      memberId: "",
      exercises: [{ name: "Squat", sets: 5, reps: 5 }],
    });
    void load();
  }

  function startEdit(p: WorkoutPlan) {
    setEditingId(p._id);
    setEditForm({
      planId: p.planId,
      trainerId: typeof p.trainerId === "string" ? p.trainerId : p.trainerId?._id || "",
      memberId: typeof p.memberId === "string" ? p.memberId : p.memberId?._id || "",
      exercises: (p.exercises || []).map((e) => ({ name: e.name, sets: e.sets, reps: e.reps })),
    });
  }

  async function saveEdit(id: string) {
    const res = await fetch(api(`/api/workout-plans/${id}`), {
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
    const ok = window.confirm("Are you sure you want to delete this workout plan?");
    if (!ok) return;
    const res = await fetch(api(`/api/workout-plans/${id}`), { method: "DELETE" });
    if (!res.ok) {
      const msg = await safeText(res);
      alert(`Delete failed: ${msg}`);
      return;
    }
    void load();
  }

  function setExercise<T extends "form" | "edit">(which: T, idx: number, patch: Partial<ExerciseRow>) {
    if (which === "form") {
      const next = [...form.exercises];
      next[idx] = { ...next[idx], ...patch };
      setForm({ ...form, exercises: next });
    } else {
      const next = [...editForm.exercises];
      next[idx] = { ...next[idx], ...patch };
      setEditForm({ ...editForm, exercises: next });
    }
  }

  function addExercise(which: "form" | "edit") {
    const row = { name: "", sets: undefined, reps: undefined };
    if (which === "form") setForm({ ...form, exercises: [...form.exercises, row] });
    else setEditForm({ ...editForm, exercises: [...editForm.exercises, row] });
  }

  function removeExercise(which: "form" | "edit", idx: number) {
    if (which === "form") {
      setForm({ ...form, exercises: form.exercises.filter((_, i) => i !== idx) });
    } else {
      setEditForm({ ...editForm, exercises: editForm.exercises.filter((_, i) => i !== idx) });
    }
  }

  return (
    <div className="container stack-lg">
      <h1 className="title-xl">Workout Plans</h1>

      {/* Create */}
      <form onSubmit={create} className="card stack-sm">
        <div className="title-md">Create Plan</div>

        <input
          className="input"
          placeholder="Plan ID (e.g., WP-001)"
          value={form.planId}
          onChange={(e) => setForm({ ...form, planId: e.target.value })}
        />

        <select
          className="select select-dark"
          value={form.trainerId}
          onChange={(e) => setForm({ ...form, trainerId: e.target.value })}
        >
          <option value="">Select trainer</option>
          {trainers.map((t) => (
            <option key={t._id} value={t._id}>
              {t.name} {t.specialization ? `— ${t.specialization}` : ""}
            </option>
          ))}
        </select>

        <select
          className="select select-dark"
          value={form.memberId}
          onChange={(e) => setForm({ ...form, memberId: e.target.value })}
        >
          <option value="">Select member</option>
          {members.map((m) => (
            <option key={m._id} value={m._id}>
              {m.name} ({m.membershipType})
            </option>
          ))}
        </select>

        <div className="stack-sm">
          <div className="label">Exercises</div>
          {form.exercises.map((ex, i) => (
            <div key={i} className="row gap-sm">
              <input
                className="input"
                placeholder="Name (e.g., Squat)"
                value={ex.name}
                onChange={(e) => setExercise("form", i, { name: e.target.value })}
              />
              <input
                className="input"
                type="number"
                min={0}
                placeholder="Sets"
                value={ex.sets ?? ""}
                onChange={(e) =>
                  setExercise("form", i, { sets: e.target.value === "" ? undefined : Number(e.target.value) })
                }
              />
              <input
                className="input"
                type="number"
                min={0}
                placeholder="Reps"
                value={ex.reps ?? ""}
                onChange={(e) =>
                  setExercise("form", i, { reps: e.target.value === "" ? undefined : Number(e.target.value) })
                }
              />
              <button type="button" className="btn" onClick={() => removeExercise("form", i)}>
                Remove
              </button>
            </div>
          ))}
          <button type="button" className="btn" onClick={() => addExercise("form")}>
            + Add exercise
          </button>
        </div>

        <button className="btn btn-primary">Create</button>
      </form>

      {/* List */}
      <div className="stack-sm">
        <div className="text-muted small">{loading ? "Loading..." : `Total: ${items.length}`}</div>
        {items.map((p) => (
          <div key={p._id} className="card">
            {editingId === p._id ? (
              <div className="stack-sm">
                <input
                  className="input"
                  placeholder="Plan ID"
                  value={editForm.planId}
                  onChange={(e) => setEditForm({ ...editForm, planId: e.target.value })}
                />

                <select
                  className="select select-dark"
                  value={editForm.trainerId}
                  onChange={(e) => setEditForm({ ...editForm, trainerId: e.target.value })}
                >
                  <option value="">Select trainer</option>
                  {trainers.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.name} {t.specialization ? `— ${t.specialization}` : ""}
                    </option>
                  ))}
                </select>

                <select
                  className="select select-dark"
                  value={editForm.memberId}
                  onChange={(e) => setEditForm({ ...editForm, memberId: e.target.value })}
                >
                  <option value="">Select member</option>
                  {members.map((m) => (
                    <option key={m._id} value={m._id}>
                      {m.name} ({m.membershipType})
                    </option>
                  ))}
                </select>

                <div className="stack-sm">
                  <div className="label">Exercises</div>
                  {editForm.exercises.map((ex, i) => (
                    <div key={i} className="row gap-sm">
                      <input
                        className="input"
                        placeholder="Name"
                        value={ex.name}
                        onChange={(e) => setExercise("edit", i, { name: e.target.value })}
                      />
                      <input
                        className="input"
                        type="number"
                        min={0}
                        placeholder="Sets"
                        value={ex.sets ?? ""}
                        onChange={(e) =>
                          setExercise("edit", i, { sets: e.target.value === "" ? undefined : Number(e.target.value) })
                        }
                      />
                      <input
                        className="input"
                        type="number"
                        min={0}
                        placeholder="Reps"
                        value={ex.reps ?? ""}
                        onChange={(e) =>
                          setExercise("edit", i, { reps: e.target.value === "" ? undefined : Number(e.target.value) })
                        }
                      />
                      <button type="button" className="btn" onClick={() => removeExercise("edit", i)}>
                        Remove
                      </button>
                    </div>
                  ))}
                  <button type="button" className="btn" onClick={() => addExercise("edit")}>
                    + Add exercise
                  </button>
                </div>

                <div className="hstack gap-sm">
                  <button type="button" className="btn btn-primary" onClick={() => void saveEdit(p._id)}>
                    Save
                  </button>
                  <button type="button" className="btn" onClick={() => setEditingId(null)}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="row between gap-md">
                <div>
                  <div className="semibold">{p.planId}</div>
                  <div className="small">
                    Trainer: {typeof p.trainerId === "string" ? p.trainerId : p.trainerId?.name || "—"} —{" "}
                    Member: {typeof p.memberId === "string" ? p.memberId : p.memberId?.name || "—"}
                  </div>
                  <div className="xsmall muted mt-1">
                    {(p.exercises || []).map((e, i) => (
                      <span key={i}>
                        {e.name} {e.sets ?? 0}x{e.reps ?? 0}
                        {i < (p.exercises?.length || 0) - 1 ? ", " : null}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="hstack gap-sm">
                  <button className="btn" onClick={() => startEdit(p)}>Edit</button>
                  <button className="btn btn-danger" onClick={() => void remove(p._id)}>Delete</button>
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