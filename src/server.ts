import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import cookie from "@fastify/cookie";
import "dotenv/config";

import { authRoutes } from "./routes/auth.js";
import { userItemsRoutes } from "./routes/userItems.js";
import { itemsRoutes } from "./routes/items.js";
import { runewordsRoutes } from "./routes/runewords.js";
import { cleanupExpiredSessions } from "./lib/auth.js";
import { optionalAuth } from "./middleware/auth.js";
import { HttpError } from "./types/errors.js";

const fastify = Fastify({
    logger: true,
});

// Register plugins
await fastify.register(cors, {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
});

await fastify.register(helmet);
await fastify.register(cookie);

fastify.setErrorHandler((error, _, reply) => {
    if (error instanceof HttpError) {
        return reply.code(error.statusCode).send({
            error: error.message,
            statusCode: error.statusCode,
        });
    }

    // Log unexpected errors
    fastify.log.error(error);
    if (process.env.NODE_ENV !== "production") {
        console.error(`Error: `, error);
    }

    return reply.code(500).send({
        error: "Internal Server Error",
        statusCode: 500,
    });
});

// Health check route
fastify.get("/health", async () => {
    return { status: "ok" };
});

// Automatically extend session whenever any endpoint is hit
fastify.addHook("preHandler", optionalAuth);

await fastify.register(authRoutes, { prefix: "/auth" });
await fastify.register(userItemsRoutes, { prefix: "/user-items" });
await fastify.register(itemsRoutes, { prefix: "/items" });
await fastify.register(runewordsRoutes, { prefix: "/runewords" });

const start = async () => {
    try {
        const port = Number(process.env.PORT) || 3000;
        await fastify.listen({ port, host: "0.0.0.0" });
        console.info(`Server running on port ${port}`);

        setInterval(
            async () => {
                await cleanupExpiredSessions();
            },
            24 * 60 * 60 * 1000
        ); // Daily cleanup
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start();
