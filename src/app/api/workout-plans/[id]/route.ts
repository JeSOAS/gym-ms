import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/lib/db";
import WorkoutPlan from "@/models/workoutPlan";

export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  await connectToDB();
  const item = await WorkoutPlan.findById(id)
    .populate("trainerId", "name specialization")
    .populate("memberId", "name email")
    .lean();
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(item);
}

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  await connectToDB();
  const body = await req.json();
  const updated = await WorkoutPlan.findByIdAndUpdate(id, body, { new: true });
  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  await connectToDB();
  const deleted = await WorkoutPlan.findByIdAndDelete(id);
  if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}