import { FastifyRequest, FastifyReply } from "fastify";
import { validateSessionToken } from "../lib/auth.js";

export async function requireAuth(request: FastifyRequest, reply: FastifyReply) {
    const token = request.cookies.session;

    if (!token) {
        reply.code(401);
        return { error: "Authentication required" };
    }

    const { session, user } = await validateSessionToken(token);

    if (!session) {
        reply.code(401);
        return { error: "Invalid session" };
    }

    // Add user to request object for use in routes
    request.user = user;
}

// Extend FastifyRequest type
declare module "fastify" {
    interface FastifyRequest {
        user?: {
            id: string;
            email: string;
            hashedPassword: string;
            createdAt: Date;
        };
    }
}
