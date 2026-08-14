import { SignJWT, jwtVerify } from "jose";
import type { UserRole } from "@marin-froid/types";

function getSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET is not set");
  return new TextEncoder().encode(secret);
}

export interface MobileSessionPayload {
  userId: string;
  organizationId: string | null;
  role: UserRole;
  fullName: string;
  [key: string]: unknown;
}

export async function signMobileToken(payload: MobileSessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(getSecret());
}

export async function getSessionFromRequest(request: Request): Promise<MobileSessionPayload | null> {
  const auth = request.headers.get("authorization");
  const token = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload as unknown as MobileSessionPayload;
  } catch {
    return null;
  }
}
