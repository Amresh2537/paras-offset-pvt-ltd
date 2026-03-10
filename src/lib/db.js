import mongoose from "mongoose";

let cached = global._mongoose;

if (!cached) {
  cached = global._mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  const MONGODB_URI = process.env.MONGODB_URI ?? process.env["MONGODB_URI"];

  if (!MONGODB_URI) {
    if (process.env.NODE_ENV !== "production") {
      console.error(
        "[db] MONGODB_URI is not defined. Env keys containing 'MONGO':",
        Object.keys(process.env).filter((key) => key.toLowerCase().includes("mongo"))
      );
    }
    throw new Error("Please define the MONGODB_URI environment variable");
  }

  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    if (process.env.NODE_ENV !== "production") {
      try {
        const parsed = new URL(MONGODB_URI);
        // Do not log password/whole URI. This helps verify which env is loaded.
        console.log("[db] Connecting to MongoDB", {
          protocol: parsed.protocol,
          host: parsed.host,
          username: parsed.username,
        });
      } catch {
        console.log("[db] Connecting to MongoDB (unable to parse URI)");
      }
    }

    cached.promise = mongoose
      .connect(MONGODB_URI, {
        dbName: "paras_offset_saas",
      })
      .then((mongooseInstance) => mongooseInstance);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

