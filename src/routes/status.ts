import type { FastifyInstance } from "fastify";
import postgres from "postgres";

export async function healthRoutes(fastify: FastifyInstance) {
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
            const checks = {
                status: "healthy",
                timestamp: new Date().toISOString(),
                database: "unknown",
            };

            try {
                const sql = postgres(process.env.DATABASE_URL!, {
                    max: 1,
                    connect_timeout: 5, // Quick timeout for health checks
                });

                await sql`SELECT 1`; // Simple connectivity test
                await sql.end();

                checks.database = "connected";
                return checks;
            } catch {
                checks.status = "unhealthy";
                checks.database = "disconnected";

                return reply.code(503).send(checks); // Service Unavailable
            }
        }
    );

    // Detailed status endpoint (for debugging)
    fastify.get(
        "/status",
        {
            config: {
                rateLimit: {
                    max: 5,
                    timeWindow: "1 minute",
                },
            },
        },
        async (_, reply) => {
            try {
                const sql = postgres(process.env.DATABASE_URL!, {
                    max: 1,
                    connect_timeout: 5,
                });

                const result = await sql`SELECT version(), current_database(), current_user`;
                await sql.end();

                return {
                    status: "healthy",
                    database: {
                        connected: true,
                        name: result[0].current_database,
                        user: result[0].current_user,
                        version: result[0].version.split(" ")[0], // Only major version, not full string
                    },
                    timestamp: new Date().toISOString(),
                };
            } catch {
                return reply.code(503).send({
                    status: "unhealthy",
                    database: {
                        connected: false,
                        error: "Connection failed",
                    },
                    timestamp: new Date().toISOString(),
                });
            }
        }
    );
}
