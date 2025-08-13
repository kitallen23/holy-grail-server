import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import cookie from "@fastify/cookie";
import "dotenv/config";

import { authRoutes } from "./routes/auth.js";
import { userItemsRoutes } from "./routes/userItems.js";
import { itemsRoutes } from "./routes/items.js";
import { runewordsRoutes } from "./routes/runewords.js";
import { statusRoutes } from "./routes/status.js";
import { optionalAuth } from "./middleware/auth.js";
import { HttpError } from "./types/errors.js";

export async function createApp() {
    const fastify = Fastify({
        logger: true,
    });

    // Register plugins
    await fastify.register(cors, {
        origin: process.env.CLIENT_URL || "http://localhost:5173",
        credentials: true,
        methods: ["GET", "HEAD", "POST", "DELETE", "OPTIONS"],
    });
    await fastify.register(helmet);
    await fastify.register(cookie);

    if (process.env.NODE_ENV !== "production") {
        fastify.addHook("onRequest", async (request) => {
            console.info(`[FASTIFY] ${request.method} ${request.url}`);
        });
    }

    fastify.setErrorHandler((error, _, reply) => {
        if (error instanceof HttpError) {
            return reply.code(error.statusCode).send({
                error: error.message,
                statusCode: error.statusCode,
            });
        }

        console.error(error);
        return reply.code(500).send({
            error: "Internal Server Error",
            statusCode: 500,
        });
    });

    fastify.addHook("preHandler", optionalAuth);

    await fastify.register(authRoutes, { prefix: "/auth" });
    await fastify.register(userItemsRoutes, { prefix: "/user-items" });
    await fastify.register(itemsRoutes, { prefix: "/items" });
    await fastify.register(runewordsRoutes, { prefix: "/runewords" });
    await fastify.register(statusRoutes);

    return fastify;
}
