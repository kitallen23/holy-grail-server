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

    const { session, user } = await validateSessionToken(token);

    if (!session) {
        reply.code(401).send({ error: "Invalid session" });
        return;
    }

    // Add user to request object for use in routes
    request.user = user;
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
