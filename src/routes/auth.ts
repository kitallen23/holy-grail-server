import { FastifyInstance } from "fastify";
import { googleAuthURL, discordAuthURL } from "../lib/oauth.js";
import {
    generateSessionToken,
    createSession,
    validateSessionToken,
    invalidateSession,
} from "../lib/auth.js";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";
import { eq, or } from "drizzle-orm";
import { encodeBase32LowerCaseNoPadding } from "@oslojs/encoding";

function generateUserId(): string {
    const bytes = new Uint8Array(15);
    crypto.getRandomValues(bytes);
    return encodeBase32LowerCaseNoPadding(bytes);
}

export async function authRoutes(fastify: FastifyInstance) {
    // Google OAuth initiation
    fastify.get("/google", async (request, reply) => {
        const state = crypto.randomUUID();
        reply.setCookie("oauth_state", state, { httpOnly: true, maxAge: 600 });
        reply.redirect(googleAuthURL(state));
    });

    // Discord OAuth initiation
    fastify.get("/discord", async (request, reply) => {
        const state = crypto.randomUUID();
        reply.setCookie("oauth_state", state, { httpOnly: true, maxAge: 600 });
        reply.redirect(discordAuthURL(state));
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
            path: "/",
        });

        return { success: true };
    });

    // Google OAuth callback
    fastify.get("/google/callback", async (request, reply) => {
        const { code, state } = request.query as { code: string; state: string };
        const storedState = request.cookies.oauth_state;

        if (!state || !storedState || state !== storedState) {
            reply.code(400);
            return { error: "Invalid state" };
        }

        // Exchange code for access token
        const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                client_id: process.env.GOOGLE_CLIENT_ID!,
                client_secret: process.env.GOOGLE_CLIENT_SECRET!,
                code,
                grant_type: "authorization_code",
                redirect_uri: `${process.env.BASE_URL}/auth/google/callback`,
            }),
        });

        const tokens = await tokenResponse.json();

        // Get user info
        const userResponse = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
            headers: { Authorization: `Bearer ${tokens.access_token}` },
        });

        const googleUser = await userResponse.json();

        // Find or create user
        let user = await db
            .select()
            .from(users)
            .where(or(eq(users.email, googleUser.email), eq(users.googleId, googleUser.sub)))
            .limit(1);

        if (!user.length) {
            const userId = generateUserId();
            await db.insert(users).values({
                id: userId,
                googleId: googleUser.sub,
                email: googleUser.email,
            });
            user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
        } else if (!user[0].googleId) {
            // User exists with email but no googleId - link the accounts
            await db
                .update(users)
                .set({ googleId: googleUser.sub })
                .where(eq(users.id, user[0].id));
        }

        // Create session
        const token = generateSessionToken();
        await createSession(token, user[0].id);

        reply.setCookie("session", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 30,
            path: "/",
        });

        reply.redirect(process.env.CLIENT_URL || "http://localhost:5173");
    });

    // Discord OAuth callback
    fastify.get("/discord/callback", async (request, reply) => {
        const { code, state } = request.query as { code: string; state: string };
        const storedState = request.cookies.oauth_state;

        if (!state || !storedState || state !== storedState) {
            reply.code(400);
            return { error: "Invalid state" };
        }

        // Exchange code for access token
        const tokenResponse = await fetch("https://discord.com/api/oauth2/token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                client_id: process.env.DISCORD_CLIENT_ID!,
                client_secret: process.env.DISCORD_CLIENT_SECRET!,
                code,
                grant_type: "authorization_code",
                redirect_uri: `${process.env.BASE_URL}/auth/discord/callback`,
            }),
        });

        const tokens = await tokenResponse.json();

        // Get user info
        const userResponse = await fetch("https://discord.com/api/users/@me", {
            headers: { Authorization: `Bearer ${tokens.access_token}` },
        });

        const discordUser = await userResponse.json();

        // Find or create user
        let user = await db
            .select()
            .from(users)
            .where(or(eq(users.email, discordUser.email), eq(users.discordId, discordUser.id)))
            .limit(1);

        if (!user.length) {
            const userId = generateUserId();
            await db.insert(users).values({
                id: userId,
                discordId: discordUser.id,
                email: discordUser.email,
            });
            user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
        } else if (!user[0].discordId) {
            // User exists with email but no discordId - link the accounts
            await db
                .update(users)
                .set({ discordId: discordUser.id })
                .where(eq(users.id, user[0].id));
        }

        // Create session
        const token = generateSessionToken();
        await createSession(token, user[0].id);

        reply.setCookie("session", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 30,
            path: "/",
        });

        reply.redirect(process.env.CLIENT_URL || "http://localhost:5173");
    });
}
