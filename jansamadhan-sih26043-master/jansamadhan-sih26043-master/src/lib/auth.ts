import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import db from "./db";

const JWT_SECRET = process.env.JWT_SECRET || "jansamadhan-super-secret-jwt-key-sih-2024-gov-jharkhand";

export interface TokenPayload {
  userId: string;
  email: string;
  name: string;
  role: string;
  organization?: string;
  district?: string;
}

export async function hashPassword(plainText: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plainText, salt);
}

export async function verifyPassword(plainText: string, hashed: string): Promise<boolean> {
  return bcrypt.compare(plainText, hashed);
}

export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function decodeToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<TokenPayload | null> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("jansahaya_token")?.value || cookieStore.get("jansamadhan_token")?.value;
    if (!token) return null;
    return decodeToken(token);
  } catch {
    return null;
  }
}

export async function getUserFromRequest(request: Request): Promise<TokenPayload | null> {
  try {
    // 1. Check Authorization header
    const authHeader = request.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      const decoded = decodeToken(token);
      if (decoded) return decoded;
    }

    // 2. Check cookies
    const cookieHeader = request.headers.get("cookie");
    if (cookieHeader) {
      const match = cookieHeader.match(/(?:jansahaya_token|jansamadhan_token)=([^;]+)/);
      if (match && match[1]) {
        return decodeToken(match[1]);
      }
    }

    return null;
  } catch {
    return null;
  }
}
