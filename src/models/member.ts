import { Schema, models, model } from "mongoose";
const AttendanceSchema = new Schema({
  date: { type: Date, required: true, default: Date.now },
  note: String,
});
const MemberSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  membershipType: { type: String, enum: ["basic", "standard", "premium"], required: true },
  attendanceLog: { type: [AttendanceSchema], default: [] },
}, { timestamps: true });
export default models.member || model("member", MemberSchema);