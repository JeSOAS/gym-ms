import { connectToDB } from "@/lib/db";
import member from "@/models/member";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  await connectToDB();
  const { note } = await req.json();
  const Member = await member.findById(id);
  if (!Member) return NextResponse.json({ error: "Not found" }, { status: 404 });
  Member.attendanceLog.push({ date: new Date(), note });
  await Member.save();
  return NextResponse.json(Member);
}