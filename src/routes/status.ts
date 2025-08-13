import type { FastifyInstance } from "fastify";
import { neon } from "@neondatabase/serverless";
import { readFileSync } from "fs";
import { join } from "path";
import { cleanupExpiredOAuthStates } from "../lib/oauth-cleanup.js";
import { cleanupExpiredSessions } from "../lib/auth.js";

export async function statusRoutes(fastify: FastifyInstance) {
    // Public health check endpoint
    fastify.get(
        "/health",
        {
            config: {
                rateLimit: {
                    max: 10,
                    timeWindow: "1 minute",
                },
            },
        },
        async (_, reply) => {
            const packageJson = JSON.parse(
                readFileSync(join(process.cwd(), "package.json"), "utf-8")
            );

            const checks = {
                status: "healthy",
                timestamp: new Date().toISOString(),
                version: packageJson.version,
                database: "unknown",
            };

            try {
                const sql = neon(process.env.DATABASE_URL!);
                await sql`SELECT 1`; // Simple connectivity test

                // Run cleanup in background without blocking health check
                cleanupExpiredOAuthStates().catch((err) =>
                    console.warn("OAuth cleanup failed:", err)
                );
                cleanupExpiredSessions().catch((err) =>
                    console.warn("Session cleanup failed:", err)
                );

                checks.database = "connected";
                return checks;
            } catch {
                checks.status = "unhealthy";
                checks.database = "disconnected";

                return reply.code(503).send(checks); // Service Unavailable
            }
        }
    );
}
