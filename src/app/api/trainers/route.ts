import { NextRequest } from "next/server";
import { z } from "zod";
import { connectToDB } from "@/lib/db";
import Trainer from "@/models/trainer";

const CreateTrainer = z.object({
  name: z.string().min(1),
  specialization: z.string().min(1),
});

export async function GET() {
  await connectToDB();
  const items = await Trainer.find().populate("clients", "name email").lean();
  return Response.json(items);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = CreateTrainer.safeParse(body);
  if (!parsed.success) {
    return new Response(JSON.stringify(parsed.error.flatten()), { status: 400 });
  }
  await connectToDB();
  const created = await Trainer.create(parsed.data);
  return new Response(JSON.stringify(created), { status: 201 });
}
