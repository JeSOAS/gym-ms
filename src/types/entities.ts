export type MembershipType = "basic" | "standard" | "premium";

export type Attendance = {
    date: string;
    note?: string;
}

export type MemberLite = {
    _id: string; 
    name: string; 
    email: string;
}

export type Member = MemberLite & {
    membershipType: MembershipType;
    ettendanceLog: Attendance[];
}

export type Trainer = {
    _id: string;
    name: string;
    specialization: string;
    clients: MemberLite[];
}

export type Excercise = {
    name: string; 
    sets?: number; 
    reps?: number;
}

export type WorkoutPlan = {
    _id: string;
    planId: string;
    exercises: Excercise[];
    trainerId: Trainer | string;
    memberId: Member | string;
}