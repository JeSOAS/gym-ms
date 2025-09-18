import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import WorkoutPlan from "@/models/workoutPlan";
import Member from "@/models/member";
import Trainer from "@/models/trainer";
import { connectToDB } from "@/lib/db";

const ExerciseSchema = z.object({
  name: z.string().min(1, "Exercise name is required"),
  sets: z.number().int().min(0).optional(),
  reps: z.number().int().min(0).optional(),
});

const CreateSchema = z.object({
  planId: z.string().min(1, "planId is required").max(50, "Max 50 chars"),
  trainerId: z.string().min(1, "trainerId is required"),
  memberId: z.string().min(1, "memberId is required"),
  exercises: z.array(ExerciseSchema).default([]),
});

export async function GET() {
  await connectToDB();
  const docs = await WorkoutPlan.find({})
    .populate("trainerId", "name specialization")
    .populate("memberId", "name membershipType")
    .lean();
  return NextResponse.json(docs);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(z.treeifyError(parsed.error), { status: 400 });
  }
  await connectToDB();

  // ensure relations exist
  const [trainer, member] = await Promise.all([
    Trainer.findById(parsed.data.trainerId).lean(),
    Member.findById(parsed.data.memberId).lean(),
  ]);
  if (!trainer) return new NextResponse("Trainer not found", { status: 400 });
  if (!member) return new NextResponse("Member not found", { status: 400 });

  const doc = await WorkoutPlan.create(parsed.data);
  const populated = await WorkoutPlan.findById(doc._id)
    .populate("trainerId", "name specialization")
    .populate("memberId", "name membershipType")
    .lean();
  return NextResponse.json(populated, { status: 201 });
}