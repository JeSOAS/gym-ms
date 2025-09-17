export type membershipType = "basic" | "standard" | "premium";

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
    membershipType: membershipType;
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
    excercises: Excercise[];
    trainderId: Trainer | string;
    memberId: Member | string;
}