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

const DateStringSchema = z
  .string()
  .refine((v) => (mmddyy.safeParse(v).success ? true : !Number.isNaN(Date.parse(v))), {
    message: "Invalid date",
  })
  .transform((v) => (mmddyy.safeParse(v).success ? mmddyyToISO(v) : new Date(v).toISOString()));

const UpdateSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().optional(),
  membershipType: z.enum(["basic", "standard", "premium"]).optional(),
  planStartAt: DateStringSchema.optional(),
  planEndAt: DateStringSchema.optional(),
});

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  await connectToDB();
  const doc = await Member.findById(id).lean();
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
  const updated = await Member.findByIdAndUpdate(id, parsed.data, { new: true }).lean();
  if (!updated) return new NextResponse("Not found", { status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  await connectToDB();
  const deleted = await Member.findByIdAndDelete(id).lean();
  if (!deleted) return new NextResponse("Not found", { status: 404 });
  return new NextResponse(null, { status: 204 });
}