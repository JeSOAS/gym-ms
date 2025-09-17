import { NextRequest } from "next/server";
import { z } from "zod";
import { connectToDB } from "@/lib/db";
import { Types } from "mongoose";
import WorkoutPlan from "@/models/workoutPlan";
import Member from "@/models/member";
import Trainer from "@/models/trainer";

const Exercise = z.object({
  name: z.string().min(1),
  sets: z.number().int().nonnegative().optional(),
  reps: z.number().int().nonnegative().optional(),
});

const CreatePlan = z.object({
  planId: z.string().min(1),
  exercises: z.array(Exercise).default([]),
  trainerId: z.string().min(1),
  memberId: z.string().min(1),
});

export async function GET() {
  await connectToDB();
  const items = await WorkoutPlan.find()
    .populate("trainerId", "name specialization")
    .populate("memberId", "name email")
    .lean();
  return Response.json(items);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = CreatePlan.safeParse(body);
  if (!parsed.success) {
    return new Response(JSON.stringify(parsed.error.flatten()), { status: 400 });
  }
  await connectToDB();

  // Check foreign keys
  const [trainer, member] = await Promise.all([
    Trainer.findById(parsed.data.trainerId),
    Member.findById(parsed.data.memberId),
  ]);
  if (!trainer) return new Response(JSON.stringify({ error: "trainerId not found" }), { status: 400 });
  if (!member) return new Response(JSON.stringify({ error: "memberId not found" }), { status: 400 });

  // Create plan
  const created = await WorkoutPlan.create(parsed.data);

  // Ensure member is in trainer.clients
  if (!trainer.clients.some((c: Types.ObjectId) => c.equals(member._id as Types.ObjectId))) {
    trainer.clients.push(member._id as Types.ObjectId);
    await trainer.save();
  }

  return new Response(JSON.stringify(created), { status: 201 });
}