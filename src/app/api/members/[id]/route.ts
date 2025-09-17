import { connectToDB } from "@/lib/db";
import member from "@/models/member";
import { NextRequest, NextResponse } from "next/server";

export async function POST(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  await connectToDB();
  const item = await member.findById(id).lean();
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(item);
}
export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  await connectToDB();
  const body = await req.json();
  const updated = await member.findByIdAndUpdate(id, body, { new: true });
  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(updated);
}
export async function DELETE(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  await connectToDB();
  const deleted = await member.findByIdAndDelete(id);
  if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
