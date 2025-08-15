import { FastifyInstance } from "fastify";
import { googleAuthURL, discordAuthURL } from "../lib/oauth.js";
import {
    generateSessionToken,
    createSession,
    validateSessionToken,
    invalidateSession,
} from "../lib/auth.js";
import { db } from "../db/index.js";
import { users, oauthStates } from "../db/schema.js";
import { eq, or } from "drizzle-orm";
import { encodeBase32LowerCaseNoPadding } from "@oslojs/encoding";

function generateUserId(): string {
    const bytes = new Uint8Array(15);
    crypto.getRandomValues(bytes);
    return encodeBase32LowerCaseNoPadding(bytes);
}

export async function authRoutes(fastify: FastifyInstance) {
    fastify.get("/me", async (request, reply) => {
        reply.header("Cache-Control", "no-cache, no-store, must-revalidate");
        reply.header("Pragma", "no-cache");
        reply.header("Expires", "0");

        const token = request.cookies.session;
        if (!token) {
            reply.code(401).send({ error: "Not authenticated" });
            return;
        }

        const { user } = await validateSessionToken(token);
        if (!user) {
            reply.code(401).send({ error: "Invalid session" });
            return;
        }

        const response = { email: user.email };
        return response;
    });

    // Google OAuth initiation
    fastify.get("/google", async (_, reply) => {
        const state = crypto.randomUUID();

        // Store state in database instead of cookie
        await db.insert(oauthStates).values({
            state,
            expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
        });

        reply.redirect(googleAuthURL(state));
    });

    // Discord OAuth initiation
    fastify.get("/discord", async (_, reply) => {
        const state = crypto.randomUUID();

        // Store state in database instead of cookie
        await db.insert(oauthStates).values({
            state,
            expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
        });

        reply.redirect(discordAuthURL(state));
    });

    // Logout
    fastify.post("/logout", async (request, reply) => {
        reply.header("Cache-Control", "no-cache, no-store, must-revalidate");
        reply.header("Pragma", "no-cache");
        reply.header("Expires", "0");

        const token = request.cookies.session;
        if (token) {
            const { session } = await validateSessionToken(token);
            if (session) {
                await invalidateSession(session.id);
            }
        }

        // Manually set cookie header to clear session cookie
        const cookieOptions = [
            "session=",
            "Max-Age=0",
            "Path=/",
            "HttpOnly",
            "SameSite=Lax",
            process.env.NODE_ENV === "production" ? "Secure" : "",
            process.env.NODE_ENV === "production" ? "Domain=.chuggs.net" : "",
        ]
            .filter(Boolean)
            .join("; ");

        reply.header("Set-Cookie", cookieOptions);

        return { success: true };
    });

    // Google OAuth callback
    fastify.get("/google/callback", async (request, reply) => {
        const { code, state, error } = request.query as {
            code?: string;
            state: string;
            error?: string;
        };
        // Handle OAuth errors (user cancelled, access denied, etc.)
        if (error) {
            // Redirect back to client with error info
            const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
            const redirectUrl = new URL(clientUrl);
            redirectUrl.searchParams.set("auth_error", error);
            redirectUrl.searchParams.set("auth_cancelled", "true");

            reply.redirect(redirectUrl.toString());
            return;
        }

        // Validate state from database instead of cookie
        const validState = await db
            .select()
            .from(oauthStates)
            .where(eq(oauthStates.state, state))
            .limit(1);

        if (!validState.length) {
            reply.code(400);
            return { error: "Invalid state" };
        }

        // Clean up used state immediately
        await db.delete(oauthStates).where(eq(oauthStates.state, state));

        if (!code) {
            reply.code(400);
            return { error: "Missing authorization code" };
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

        // Manually set cookie header to work around Fastify/Vercel serialization issue
        const cookieOptions = [
            `session=${token}`,
            `Max-Age=${60 * 60 * 24 * 30}`,
            "Path=/",
            "HttpOnly",
            "SameSite=Lax",
            process.env.NODE_ENV === "production" ? "Secure" : "",
            process.env.NODE_ENV === "production" ? "Domain=.chuggs.net" : "",
        ]
            .filter(Boolean)
            .join("; ");

        reply.header("Set-Cookie", cookieOptions);

        const redirectUrl = process.env.CLIENT_URL || "http://localhost:5173";
        reply.redirect(redirectUrl);
    });

    // Discord OAuth callback
    fastify.get("/discord/callback", async (request, reply) => {
        const { code, state, error } = request.query as {
            code?: string;
            state: string;
            error?: string;
        };

        // Handle OAuth errors (user cancelled, access denied, etc.)
        if (error) {
            // Redirect back to client with error info
            const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
            const redirectUrl = new URL(clientUrl);
            redirectUrl.searchParams.set("auth_error", error);
            redirectUrl.searchParams.set("auth_cancelled", "true");

            reply.redirect(redirectUrl.toString());
            return;
        }

        // Validate state from database
        const validState = await db
            .select()
            .from(oauthStates)
            .where(eq(oauthStates.state, state))
            .limit(1);

        if (!validState.length) {
            reply.code(400);
            return { error: "Invalid state" };
        }

        // Clean up used state immediately
        await db.delete(oauthStates).where(eq(oauthStates.state, state));

        if (!code) {
            reply.code(400);
            return { error: "Missing authorization code" };
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

        // Manually set cookie header to work around Fastify/Vercel serialization issue
        const cookieOptions = [
            `session=${token}`,
            `Max-Age=${60 * 60 * 24 * 30}`,
            "Path=/",
            "HttpOnly",
            "SameSite=Lax",
            process.env.NODE_ENV === "production" ? "Secure" : "",
            process.env.NODE_ENV === "production" ? "Domain=.chuggs.net" : "",
        ]
            .filter(Boolean)
            .join("; ");

        reply.header("Set-Cookie", cookieOptions);

        const redirectUrl = process.env.CLIENT_URL || "http://localhost:5173";
        reply.redirect(redirectUrl);
    });
}
