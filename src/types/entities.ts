export type MembershipType = "basic" | "standard" | "premium";

export type MemberLite = {
  _id: string;
  name: string;
  email: string;
};

export type Member = MemberLite & {
  membershipType: MembershipType;
  planStartAt?: string;
  planEndAt?: string;
};

export type Trainer = {
  _id: string;
  name: string;
  specialization: string;
  clients: MemberLite[];
};

export type Exercise = {
  name: string;
  sets?: number;
  reps?: number;
};

export type Excercise = Exercise;

export type WorkoutPlan = {
  _id: string;
  planId: string;
  exercises: Exercise[];
  trainerId: Trainer | string;
  memberId: Member | string;
};
