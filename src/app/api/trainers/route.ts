import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import Trainer from "@/models/trainer";
import { connectToDB } from "@/lib/db";

const TrainerCreateSchema = z.object({
  name: z.string().min(1, "Name is required").max(30, "Max 30 chars"),
  specialization: z.string().min(1, "Specialization is required").max(50, "Max 50 chars"),
});

export async function GET() {
  await connectToDB();
  const docs = await Trainer.find({}).lean();
  return NextResponse.json(docs);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = TrainerCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(z.treeifyError(parsed.error), { status: 400 });
  }
  await connectToDB();
  const doc = await Trainer.create(parsed.data);
  return NextResponse.json(doc, { status: 201 });
}