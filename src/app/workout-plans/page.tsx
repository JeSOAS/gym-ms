"use client";
import { useEffect, useState } from "react";
import type { WorkoutPlan, Member, Trainer } from "@/types/entities";

export default function WorkoutPlansPage() {
  const [items, setItems] = useState<WorkoutPlan[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [form, setForm] = useState<{
    planId: string; trainerId: string; memberId: string;
    exercises: { name: string; sets?: number; reps?: number }[];
  }>({
    planId: "", trainerId: "", memberId: "",
    exercises: [{ name: "Squat", sets: 5, reps: 5 }],
  });

  async function load() {
    const [plansRes, memRes, trRes] = await Promise.all([
      fetch("/api/workout-plans"),
      fetch("/api/members"),
      fetch("/api/trainers"),
    ]);
    setItems((await plansRes.json()) as WorkoutPlan[]);
    setMembers((await memRes.json()) as Member[]);
    setTrainers((await trRes.json()) as Trainer[]);
  }
  useEffect(() => { void load(); }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/workout-plans", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ planId: "", trainerId: "", memberId: "", exercises: [{ name: "Squat", sets: 5, reps: 5 }] });
    void load();
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Workout Plans</h1>
      {/* form … unchanged */}
      <ul className="space-y-2">
        {items.map((p) => (
          <li key={p._id} className="border p-3 rounded">
            <div className="font-semibold">{p.planId}</div>
            <div className="text-sm">
              Trainer: {typeof p.trainerId === "string" ? p.trainerId : p.trainerId.name}
              {" "}— Member: {typeof p.memberId === "string" ? p.memberId : p.memberId.name}
            </div>
            <div className="text-xs mt-1">
              {p.exercises?.map((e, i) => (
                <span key={i}>{e.name} {e.sets ?? 0}x{e.reps ?? 0}{i < p.exercises.length - 1 ? ", " : null}</span>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
