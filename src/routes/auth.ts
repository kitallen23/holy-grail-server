import { FastifyInstance } from "fastify";
import bcrypt from "bcrypt";
import {
    generateSessionToken,
    createSession,
    validateSessionToken,
    invalidateSession,
} from "../lib/auth.js";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { encodeBase32LowerCaseNoPadding } from "@oslojs/encoding";

function generateUserId(): string {
    const bytes = new Uint8Array(15);
    crypto.getRandomValues(bytes);
    return encodeBase32LowerCaseNoPadding(bytes);
}

export async function authRoutes(fastify: FastifyInstance) {
    // Register
    fastify.post("/register", async (request, reply) => {
        const { email, password } = request.body as { email: string; password: string };

        const hashedPassword = await bcrypt.hash(password, 10);
        const userId = generateUserId();

        try {
            await db.insert(users).values({
                id: userId,
                email,
                hashedPassword,
            });

            const token = generateSessionToken();
            await createSession(token, userId);

            reply.setCookie("session", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                maxAge: 60 * 60 * 24 * 30, // 30 days
            });

            return { success: true };
        } catch (error) {
            reply.code(400);
            return { error: "Email already exists" };
        }
    });

    // Login
    fastify.post("/login", async (request, reply) => {
        const { email, password } = request.body as { email: string; password: string };

        const user = await db.select().from(users).where(eq(users.email, email)).limit(1);
        if (!user.length) {
            reply.code(400);
            return { error: "Invalid credentials" };
        }

        const validPassword = await bcrypt.compare(password, user[0].hashedPassword);
        if (!validPassword) {
            reply.code(400);
            return { error: "Invalid credentials" };
        }

        const token = generateSessionToken();
        await createSession(token, user[0].id);

        reply.setCookie("session", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 30, // 30 days
        });

        return { success: true };
    });

    // Logout
    fastify.post("/logout", async (request, reply) => {
        const token = request.cookies.session;
        if (token) {
            const { session } = await validateSessionToken(token);
            if (session) {
                await invalidateSession(session.id);
            }
        }

        reply.setCookie("session", "", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 0,
        });

        return { success: true };
    });
}
