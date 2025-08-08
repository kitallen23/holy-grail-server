import { FastifyInstance } from "fastify";

import { Items } from "../types/items.js";

export async function itemsRoutes(fastify: FastifyInstance) {
    // Get items (public route)
    fastify.get("/", async (request, reply) => {
        const { types } = request.query as { types: keyof Items | (keyof Items)[] };

        if (!types) {
            reply.code(400).send({ error: "Types parameter is required" });
            return;
        }

        const { items } = await import("../data/items.js");
        const typeArray = Array.isArray(types) ? types : [types];
        const result: Partial<Items> = {};

        typeArray.forEach((type) => {
            switch (type) {
                case "uniqueItems":
                    result.uniqueItems = items.uniqueItems;
                    break;
                case "setItems":
                    result.setItems = items.setItems;
                    break;
                case "runes":
                    result.runes = items.runes;
                    break;
                case "baseItems":
                    result.baseItems = items.baseItems;
                    break;
            }
        });

        return { items: result };
    });

    // Get single item by key (public route)
    fastify.get("/:itemKey", async (request, reply) => {
        const { items } = await import("../data/items.js");
        const { itemKey } = request.params as { itemKey: string };

        // Search across all item types
        const item = items.uniqueItems[itemKey] || items.setItems[itemKey] || items.runes[itemKey];

        if (!item) {
            reply.code(404);
            return { error: "Item not found" };
        }

        return { item };
    });
}
