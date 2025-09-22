import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import Trainer from "@/models/trainer";
import { connectToDB } from "@/lib/db";

const TrainerUpdateSchema = z.object({
  name: z.string().min(1).max(30).optional(),
  specialization: z.string().min(1).max(50).optional(),
});

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  await connectToDB();
  const doc = await Trainer.findById(id).lean();
  if (!doc) return new NextResponse("Not found", { status: 404 });
  return NextResponse.json(doc);
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const body = await req.json();
  const parsed = TrainerUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(z.treeifyError(parsed.error), { status: 400 });
  }
  await connectToDB();
  const updated = await Trainer.findByIdAndUpdate(id, parsed.data, { new: true }).lean();
  if (!updated) return new NextResponse("Not found", { status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  await connectToDB();
  const deleted = await Trainer.findByIdAndDelete(id).lean();
  if (!deleted) return new NextResponse("Not found", { status: 404 });
  return new NextResponse(null, { status: 204 });
}