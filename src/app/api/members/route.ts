import { NextRequest } from "next/server";
import { connectToDB } from "@/lib/db";
import Member from "@/models/member";
import { z } from "zod";

const MemberSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  membershipType: z.enum(["basic","standard","premium"]),
});

export async function GET() {
  await connectToDB();
  const items = await Member.find().lean();
  return Response.json(items);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = MemberSchema.safeParse(body);
  if (!parsed.success) return new Response(JSON.stringify(parsed.error.flatten()), { status: 400 });
  await connectToDB();
  const created = await Member.create(parsed.data);
  return new Response(JSON.stringify(created), { status: 201 });
}
