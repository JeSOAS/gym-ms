import { Schema, models, model } from "mongoose";

const TrainerSchema = new Schema(
  {
    name: { type: String, required: true, maxlength: 30 },
    specialization: { type: String, required: true, maxlength: 50 },
    clients: [{ type: Schema.Types.ObjectId, ref: "member", default: [] }],
  },
  { timestamps: true }
);

export default models.trainer || model("trainer", TrainerSchema);