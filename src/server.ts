import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import cookie from "@fastify/cookie";
import "dotenv/config";

import { authRoutes } from "./routes/auth.js";
import { userItemsRoutes } from "./routes/userItems.js";
import { itemsRoutes } from "./routes/items.js";

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

// Health check route
fastify.get("/health", async () => {
    return { status: "ok" };
});

await fastify.register(authRoutes, { prefix: "/auth" });
await fastify.register(userItemsRoutes, { prefix: "/user-items" });
await fastify.register(itemsRoutes, { prefix: "/items" });

const start = async () => {
    try {
        const port = Number(process.env.PORT) || 3000;
        await fastify.listen({ port, host: "0.0.0.0" });
        console.info(`Server running on port ${port}`);
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start();
