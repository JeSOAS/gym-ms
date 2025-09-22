import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import WorkoutPlan from "@/models/workoutPlan";
import Member from "@/models/member";
import Trainer from "@/models/trainer";
import { connectToDB } from "@/lib/db";

const ExerciseSchema = z.object({
  name: z.string().min(1),
  sets: z.number().int().min(0).optional(),
  reps: z.number().int().min(0).optional(),
});

const UpdateSchema = z.object({
  planId: z.string().min(1).max(50).optional(),
  trainerId: z.string().min(1).optional(),
  memberId: z.string().min(1).optional(),
  exercises: z.array(ExerciseSchema).optional(),
});

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  await connectToDB();
  const doc = await WorkoutPlan.findById(id)
    .populate("trainerId", "name specialization")
    .populate("memberId", "name membershipType")
    .lean();
  if (!doc) return new NextResponse("Not found", { status: 404 });
  return NextResponse.json(doc);
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const body = await req.json();
  const parsed = UpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(z.treeifyError(parsed.error), { status: 400 });
  }
  await connectToDB();

  if (parsed.data.trainerId) {
    const t = await Trainer.findById(parsed.data.trainerId).lean();
    if (!t) return new NextResponse("Trainer not found", { status: 400 });
  }
  if (parsed.data.memberId) {
    const m = await Member.findById(parsed.data.memberId).lean();
    if (!m) return new NextResponse("Member not found", { status: 400 });
  }

  const updated = await WorkoutPlan.findByIdAndUpdate(id, parsed.data, { new: true })
    .populate("trainerId", "name specialization")
    .populate("memberId", "name membershipType")
    .lean();
  if (!updated) return new NextResponse("Not found", { status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  await connectToDB();
  const deleted = await WorkoutPlan.findByIdAndDelete(id).lean();
  if (!deleted) return new NextResponse("Not found", { status: 404 });
  return new NextResponse(null, { status: 204 });
}