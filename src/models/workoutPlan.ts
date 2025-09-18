import { Schema, models, model } from "mongoose";

const ExerciseSchema = new Schema({
  name: { type: String, required: true },
  sets: { type: Number, default: 0, min: 0 },
  reps: { type: Number, default: 0, min: 0 },
});

const WorkoutPlanSchema = new Schema(
  {
    planId: { type: String, required: true, unique: true },
    exercises: { type: [ExerciseSchema], default: [] },
    trainerId: { type: Schema.Types.ObjectId, ref: "trainer", required: true },
    memberId: { type: Schema.Types.ObjectId, ref: "member", required: true },
  },
  { timestamps: true }
);

export default models.workoutPlan || model("workoutPlan", WorkoutPlanSchema);