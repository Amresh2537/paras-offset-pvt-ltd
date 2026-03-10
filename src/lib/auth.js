import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";
const JWT_EXPIRES_IN = "7d";

export function signJwt(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyJwt(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

export async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

export function createAuthCookie(token) {
  const maxAgeDays = 7;
  const maxAgeSeconds = maxAgeDays * 24 * 60 * 60;
  return `token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAgeSeconds}; Secure=${
    process.env.NODE_ENV === "production"
  }`;
}

