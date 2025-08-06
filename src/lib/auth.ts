import { encodeBase32LowerCaseNoPadding, encodeHexLowerCase } from "@oslojs/encoding";
import { sha256 } from "@oslojs/crypto/sha2";
import { db } from "../db/index.js";
import { sessions, users } from "../db/schema.js";
import { eq, lt } from "drizzle-orm";

export function generateSessionToken(): string {
    const bytes = new Uint8Array(20);
    crypto.getRandomValues(bytes);
    return encodeBase32LowerCaseNoPadding(bytes);
}

export function generateSessionId(token: string): string {
    return encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
}

export async function createSession(token: string, userId: string) {
    const sessionId = generateSessionId(token);
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30); // 30 days

    await db.insert(sessions).values({
        id: sessionId,
        userId,
        expiresAt,
    });

    return { id: sessionId, userId, expiresAt };
}

export async function validateSessionToken(token: string) {
    const sessionId = generateSessionId(token);
    const result = await db
        .select({ user: users, session: sessions })
        .from(sessions)
        .innerJoin(users, eq(sessions.userId, users.id))
        .where(eq(sessions.id, sessionId));

    if (result.length < 1) {
        return { session: null, user: null };
    }

    const { user, session } = result[0];

    if (Date.now() >= session.expiresAt.getTime()) {
        await db.delete(sessions).where(eq(sessions.id, sessionId));
        return { session: null, user: null };
    }

    return { session, user };
}

export async function invalidateSession(sessionId: string) {
    await db.delete(sessions).where(eq(sessions.id, sessionId));
}

export async function cleanupExpiredSessions() {
    await db.delete(sessions).where(lt(sessions.expiresAt, new Date()));
}
