"use server";

import { jwtVerify, SignJWT } from "jose";
import { SessionPayload } from "./definitions";
import { cookies } from "next/headers";

const secretKey = process.env.SESSION_SECRET;
const encodedSecretKey = new TextEncoder().encode(secretKey);
const COOKIE_NAME = "session";

export async function encrypt(payload: SessionPayload) {
    return new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256", typ: "JWT" })
        .setIssuedAt()
        .setExpirationTime("24h")
        .sign(await crypto.subtle.importKey(
            "raw",
            encodedSecretKey,
            { name: "HMAC", hash: "SHA-256" },
            false,
            ["sign"]
        ));
}
export async function decrypt(session: string | undefined = '') {
  try {
    const { payload } = await jwtVerify(session, encodedSecretKey, {
      algorithms: ['HS256'],
    })
    return payload as SessionPayload;
  } catch (error) {
    console.log('Failed to verify session')
  }
}
export async function createSession(userId: string, email: string, name: string) {
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 dias
    const session = await encrypt({ userId, email, name, expiresAt });

    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, session, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        expires: expiresAt,
        sameSite: 'lax',
        path: '/',
    });
}

// ✅ VERIFICAR SESSÃO
export async function verifySession() {
    const cookieStore = await cookies();
    const cookie = cookieStore.get(COOKIE_NAME)?.value;
    const session = await decrypt(cookie);

    if (!session?.userId) {
        return { isAuth: false };
    }

    return { isAuth: true, userId: session.userId, email: session.email, name: session.name };
}

export async function getId() {
    const cookieStore = await cookies();
    const cookie = cookieStore.get(COOKIE_NAME)?.value;
    const session = await decrypt(cookie);
    return session?.userId;
}

// ✅ DELETAR SESSÃO (LOGOUT)
export async function deleteSession() {
    const cookieStore = await cookies();
    cookieStore.delete(COOKIE_NAME);
}