import { Schema, model, models } from "mongoose";

const MemberSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    membershipType: {
      type: String,
      enum: ["basic", "standard", "premium"],
      required: true,
    },
    planStartAt: { type: Date },
    planEndAt: { type: Date },
  },
  { timestamps: true }
);

export default models.Member || model("Member", MemberSchema);