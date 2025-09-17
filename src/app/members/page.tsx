"use client";
import { useEffect, useState } from "react";
import type { Member, MembershipType } from "@/types/entities";

export default function MembersPage() {
  const [items, setItems] = useState<Member[]>([]);
  const [form, setForm] = useState<{ name: string; email: string; membershipType: MembershipType }>({
    name: "", email: "", membershipType: "basic",
  });

  async function load() {
    const res = await fetch("/api/members");
    const data = (await res.json()) as Member[];
    setItems(data);
  }
  useEffect(() => { void load(); }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/members", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ name: "", email: "", membershipType: "basic" });
    void load();
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Members</h1>
      <ul className="space-y-2">
        {items.map((m) => (
          <li key={m._id} className="border p-3 rounded">
            <div className="font-semibold">{m.name}</div>
            <div className="text-sm">{m.email} — {m.membershipType}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}