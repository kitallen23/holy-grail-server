import { FastifyInstance } from "fastify";
import { readFileSync } from "fs";
import { join } from "path";

import { items } from "../data/items";

export async function itemsRoutes(fastify: FastifyInstance) {
    // Get all items (public route)
    fastify.get("/", async () => {
        return { items };
    });

    // Get single item by key (public route)
    fastify.get("/:itemKey", async (request, reply) => {
        const { itemKey } = request.params as { itemKey: string };

        // Search across all item types
        const item =
            items.uniqueItems[itemKey] || items.setItems[itemKey] || items.runewords[itemKey];

        if (!item) {
            reply.code(404);
            return { error: "Item not found" };
        }

        return { item };
    });

    fastify.get("/unique", async () => {
        return { items: items.uniqueItems };
    });

    fastify.get("/sets", async () => {
        return { items: items.setItems };
    });

    fastify.get("/runewords", async () => {
        return { items: items.runewords };
    });
}
