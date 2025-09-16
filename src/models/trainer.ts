// src/models/trainer.ts
import { Schema, models, model } from "mongoose";

const TrainerSchema = new Schema({
  name: { type: String, required: true },
  specialization: { type: String, required: true },
  clients: [{ type: Schema.Types.ObjectId, ref: "member" }],
}, { timestamps: true });

export default models.trainer || model("trainer", TrainerSchema);
