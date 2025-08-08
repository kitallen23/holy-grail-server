import { FastifyRequest, FastifyReply } from "fastify";
import { validateSessionToken } from "../lib/auth.js";
import { db } from "../db/index.js";
import { sessions } from "../db/schema.js";
import { eq } from "drizzle-orm";

export async function requireAuth(request: FastifyRequest, reply: FastifyReply) {
    const token = request.cookies.session;

    if (!token) {
        reply.code(401).send({ error: "Authentication required" });
        return;
    }

    const validationPromise = validateSessionToken(token);
    const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Validation timeout")), 5000)
    );

    try {
        const result = (await Promise.race([validationPromise, timeoutPromise])) as {
            session: any; //eslint-disable-line @typescript-eslint/no-explicit-any
            user: any; //eslint-disable-line @typescript-eslint/no-explicit-any
        };
        const { session, user } = result;

        if (!session) {
            reply.code(401).send({ error: "Invalid session" });
            return;
        }

        request.user = user;
    } catch {
        reply.code(401).send({ error: "Authentication required" });
        return;
    }
}

export async function optionalAuth(request: FastifyRequest) {
    const token = request.cookies.session;

    if (token) {
        const { session, user } = await validateSessionToken(token);

        if (session && user) {
            // Extend session by 30 days
            const newExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
            await db
                .update(sessions)
                .set({ expiresAt: newExpiresAt })
                .where(eq(sessions.id, session.id));

            // Add user to request
            request.user = user;
        }
    }

    // Don't return anything - let the request continue regardless
}

declare module "fastify" {
    interface FastifyRequest {
        user?: {
            id: string;
            email: string | null;
            googleId: string | null;
            discordId: string | null;
            createdAt: Date | null;
        };
    }
}
