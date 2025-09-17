import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import Member from "@/models/member";
import { connectToDB } from "@/lib/db";

const mmddyy = z.string().regex(/^\d{2}\/\d{2}\/\d{2}$/);

function mmddyyToISO(s: string): string {
  const [m, d, y2] = s.split("/").map((v) => parseInt(v, 10));
  const year = y2 + 2000;
  const dt = new Date(year, m - 1, d);
  return dt.toISOString();
}

const DateStringSchema = z.string().refine((v) => (mmddyy.safeParse(v).success ? true : !Number.isNaN(Date.parse(v))), {
    message: "Invalid date",
  }).transform((v) => (mmddyy.safeParse(v).success ? mmddyyToISO(v) : new Date(v).toISOString()));

const CreateSchema = z.object({
  name: z.string().min(1),
  email: z.string(),
  membershipType: z.enum(["basic", "standard", "premium"]),
  planStartAt: DateStringSchema.optional(),
  planEndAt: DateStringSchema.optional(),
});

export async function GET() {
  await connectToDB();
  const docs = await Member.find({}).lean();
  return NextResponse.json(docs);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(z.treeifyError(parsed.error), { status: 400 });
  }
  await connectToDB();
  const doc = await Member.create(parsed.data);
  return NextResponse.json(doc, { status: 201 });
}