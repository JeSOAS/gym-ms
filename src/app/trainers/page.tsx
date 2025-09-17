"use client";
import { useEffect, useState } from "react";
import type { Trainer } from "@/types/entities";

export default function TrainersPage() {
  const [items, setItems] = useState<Trainer[]>([]);
  const [form, setForm] = useState<{ name: string; specialization: string }>({ name: "", specialization: "" });

  async function load() {
    const res = await fetch("/api/trainers");
    const data = (await res.json()) as Trainer[];
    setItems(data);
  }
  useEffect(() => { void load(); }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/trainers", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ name: "", specialization: "" });
    void load();
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Trainers</h1>
      <ul className="space-y-2">
        {items.map((t) => (
          <li key={t._id} className="border p-3 rounded">
            <div className="font-semibold">{t.name}</div>
            <div className="text-sm">{t.specialization}</div>
            {!!t.clients?.length && (
              <div className="text-xs mt-1 opacity-70">
                Clients: {t.clients.map((c) => c.name).join(", ")}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}