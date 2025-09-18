import { Schema, models, model } from "mongoose";

const MemberSchema = new Schema(
  {
    name: { type: String, required: true, maxlength: 30 },
    email: { type: String, required: true, maxlength: 20 },
    membershipType: { type: String, enum: ["basic", "standard", "premium"], required: true },
    planStartAt: { type: Date },
    planEndAt: { type: Date },
  },
  { timestamps: true }
);

export default models.member || model("member", MemberSchema);