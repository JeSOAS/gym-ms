import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

const globalForMongoose = globalThis as unknown as { mongooseCache?: MongooseCache };

const cached: MongooseCache =
  globalForMongoose.mongooseCache ??
  (globalForMongoose.mongooseCache = { conn: null, promise: null });

export async function connectToDB() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, { dbName: "gymms" });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
