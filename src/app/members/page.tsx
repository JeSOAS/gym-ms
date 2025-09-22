"use client";
import { useEffect, useState } from "react";
import type { Member, MembershipType, WorkoutPlan } from "@/types/entities";

type MemberWithPlan = Member & {
  planStartAt?: string;
  planEndAt?: string;
};

const BASE = process.env.NEXT_PUBLIC_BASE_PATH || ""; // e.g. "/gym-ms"
const api = (path: string) => {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${BASE}${p}`;
};

export default function MembersPage() {
  const [items, setItems] = useState<MemberWithPlan[]>([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState<{
    name: string;
    email: string;
    membershipType: MembershipType;
    planStartAt?: string;
    planEndAt?: string;
  }>({
    name: "",
    email: "",
    membershipType: "basic",
    planStartAt: "",
    planEndAt: "",
  });

  const [startMode, setStartMode] = useState<"today" | "manual">("today");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{
    name: string;
    email: string;
    membershipType: MembershipType;
    planStartAt?: string;
    planEndAt?: string;
  }>({
    name: "",
    email: "",
    membershipType: "basic",
    planStartAt: "",
    planEndAt: "",
  });

  const [editStartMode, setEditStartMode] = useState<"today" | "manual">("today");

  function todayMMDDYY() {
    const d = new Date();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const yy = String(d.getFullYear()).slice(-2);
    return `${mm}/${dd}/${yy}`;
  }
  function mmddyyToISO(s?: string) {
    if (!s) return undefined;
    const m = s.match(/^(\d{2})\/(\d{2})\/(\d{2})$/);
    if (!m) return undefined;
    const mm = parseInt(m[1], 10);
    const dd = parseInt(m[2], 10);
    const yy = parseInt(m[3], 10);
    const year = 2000 + yy;
    const dt = new Date(year, mm - 1, dd, 0, 0, 0, 0);
    return dt.toISOString();
  }
  function isoToDateInput(iso?: string) {
    if (!iso) return "";
    const d = new Date(iso);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }
  function addDaysISO(isoStart?: string, days = 30) {
    if (!isoStart) return undefined;
    const d = new Date(isoStart);
    d.setDate(d.getDate() + days);
    const v = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    return v.toISOString();
  }
  function endISOFromStart(start?: string) {
    if (!start) return undefined;
    const isoStart =
      /^\d{2}\/\d{2}\/\d{2}$/.test(start) ? mmddyyToISO(start) : new Date(start).toISOString();
    return addDaysISO(isoStart, 30);
  }
  function isExpired(endIso?: string) {
    if (!endIso) return true;
    const end = new Date(endIso);
    const endLocal = new Date(end.getFullYear(), end.getMonth(), end.getDate(), 23, 59, 59, 999);
    return new Date() > endLocal;
  }
  function formatMMDDYY(iso?: string) {
    if (!iso) return "";
    const d = new Date(iso);
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const yy = String(d.getFullYear()).slice(-2);
    return `${mm}/${dd}/${yy}`;
  }

  async function load() {
    setLoading(true);
    try {
      const res = await fetch(api("/api/members"), { cache: "no-store" });
      const data = (await res.json()) as MemberWithPlan[];
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

    if (form.name.length > 30) {
      alert("Name must be 30 characters or fewer.");
      return;
    }
    if (form.email.length > 20) {
      alert("Email must be 20 characters or fewer.");
      return;
    }

    const start = startMode === "today" ? todayMMDDYY() : (form.planStartAt || "");
    const payload = {
      ...form,
      planStartAt: start,
      planEndAt: endISOFromStart(start),
    };

    const res = await fetch(api("/api/members"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const msg = await safeText(res);
      alert(`Create failed: ${msg}`);
      return;
    }
    setForm({ name: "", email: "", membershipType: "basic", planStartAt: "", planEndAt: "" });
    setStartMode("today");
    void load();
  }

  function startEdit(m: MemberWithPlan) {
    setEditingId(m._id);
    setEditForm({
      name: m.name,
      email: m.email,
      membershipType: m.membershipType,
      planStartAt: isoToDateInput(m.planStartAt),
      planEndAt: m.planEndAt,
    });
    setEditStartMode(m.planStartAt ? "manual" : "today");
  }

  async function saveEdit(id: string) {
    if (editForm.name.length > 30) {
      alert("Name must be 30 characters or fewer.");
      return;
    }
    if (editForm.email.length > 20) {
      alert("Email must be 20 characters or fewer.");
      return;
    }

    const start = editStartMode === "today" ? todayMMDDYY() : (editForm.planStartAt || "");
    const payload = {
      ...editForm,
      planStartAt: start,
      planEndAt: endISOFromStart(start),
    };

    const res = await fetch(api(`/api/members/${id}`), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
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

    // delete this member's plans first
    const plansRes = await fetch(api("/api/workout-plans"), { cache: "no-store" });
    if (plansRes.ok) {
      const plans = (await plansRes.json()) as WorkoutPlan[];
      const mine = plans.filter((p) => {
        const mid = typeof p.memberId === "string" ? p.memberId : p.memberId?._id;
        return mid === id;
      });
      await Promise.all(
        mine.map((p) => fetch(api(`/api/workout-plans/${p._id}`), { method: "DELETE" }))
      );
    }

    const res = await fetch(api(`/api/members/${id}`), { method: "DELETE" });
    if (!res.ok) {
      const msg = await safeText(res);
      alert(`Delete failed: ${msg}`);
      return;
    }
    void load();
  }

  function membershipStatus(endIso?: string) {
    return isExpired(endIso)
      ? { label: "expired", cls: "status-danger" }
      : { label: "paid", cls: "status-success" };
  }

  return (
    <div className="container stack-lg">
      <h1 className="title-xl">Members</h1>

      {/* Create */}
      <form onSubmit={create} className="card stack-sm">
        <div className="title-md">Create Member</div>
        <input
          className="input"
          placeholder="Name"
          maxLength={30}
          title="Max 30 characters"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          className="input"
          placeholder="Email"
          maxLength={20}
          title="Max 20 characters"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <select
          className="select select-dark"
          value={form.membershipType}
          onChange={(e) => setForm({ ...form, membershipType: e.target.value as MembershipType })}
        >
          <option value="basic">basic</option>
          <option value="standard">standard</option>
          <option value="premium">premium</option>
        </select>

        <div className="stack-sm">
          <label className="label">Plan start</label>
          <select
            className="select select-dark"
            value={startMode}
            onChange={(e) => {
              const v = e.target.value as "today" | "manual";
              setStartMode(v);
              setForm((f) => ({
                ...f,
                planStartAt: v === "today" ? "" : (f.planStartAt || ""),
              }));
            }}
          >
            <option value="today">today</option>
            <option value="manual">manual</option>
          </select>

          <input
            type="date"
            className="input"
            disabled={startMode === "today"}
            value={startMode === "today" ? "" : (form.planStartAt ?? "")}
            onChange={(e) => setForm({ ...form, planStartAt: e.target.value })}
          />

          <label className="label">Plan end</label>
          <input
            type="text"
            className="input input-readonly"
            disabled
            value={
              formatMMDDYY(
                startMode === "today"
                  ? addDaysISO(mmddyyToISO(todayMMDDYY()), 30)
                  : endISOFromStart(form.planStartAt)
              ) || ""
            }
            readOnly
          />
        </div>

        <button className="btn btn-primary">Create</button>
      </form>

      {/* List */}
      <div className="stack-sm">
        <div className="text-muted small">{loading ? "Loading..." : `Total: ${items.length}`}</div>
        {items.map((m) => {
          const status = membershipStatus(m.planEndAt);
          return (
            <div key={m._id} className="card">
              {editingId === m._id ? (
                <div className="stack-sm">
                  <input
                    className="input"
                    maxLength={30}
                    title="Max 30 characters"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  />
                  <input
                    className="input"
                    maxLength={20}
                    title="Max 20 characters"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  />
                  <select
                    className="select select-dark"
                    value={editForm.membershipType}
                    onChange={(e) => setEditForm({ ...editForm, membershipType: e.target.value as MembershipType })}
                  >
                    <option value="basic">basic</option>
                    <option value="standard">standard</option>
                    <option value="premium">premium</option>
                  </select>

                  <div className="stack-sm">
                    <label className="label">Plan start</label>
                    <select
                      className="select select-dark"
                      value={editStartMode}
                      onChange={(e) => {
                        const v = e.target.value as "today" | "manual";
                        setEditStartMode(v);
                        setEditForm((f) => ({
                          ...f,
                          planStartAt: v === "today" ? "" : (f.planStartAt || ""),
                        }));
                      }}
                    >
                      <option value="today">today</option>
                      <option value="manual">manual</option>
                    </select>

                    <input
                      type="date"
                      className="input"
                      disabled={editStartMode === "today"}
                      value={editStartMode === "today" ? "" : (editForm.planStartAt ?? "")}
                      onChange={(e) => setEditForm({ ...editForm, planStartAt: e.target.value })}
                    />

                    <label className="label">Plan end (auto +30 days)</label>
                    <input
                      type="text"
                      className="input input-readonly"
                      disabled
                      value={
                        formatMMDDYY(
                          editStartMode === "today"
                            ? addDaysISO(mmddyyToISO(todayMMDDYY()), 30)
                            : endISOFromStart(editForm.planStartAt)
                        ) || ""
                      }
                      readOnly
                    />
                  </div>

                  <div className="hstack gap-sm">
                    <button type="button" onClick={() => void saveEdit(m._id)} className="btn btn-primary">
                      Save
                    </button>
                    <button type="button" onClick={() => setEditingId(null)} className="btn">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="row between gap-md">
                  <div>
                    <div className="semibold hstack gap-xs">
                      {m.name}
                      <span className={status.cls}>• {status.label}</span>
                    </div>
                    <div className="small">
                      {m.email} — {m.membershipType}
                    </div>
                    <div className="xsmall muted mt-1">
                      Start: {m.planStartAt ? formatMMDDYY(m.planStartAt) : "—"} | End:{" "}
                      {m.planEndAt ? formatMMDDYY(m.planEndAt) : "—"}
                    </div>
                  </div>
                  <div className="hstack gap-sm">
                    <button onClick={() => startEdit(m)} className="btn">Edit</button>
                    <button onClick={() => void remove(m._id)} className="btn btn-danger">Delete</button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
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