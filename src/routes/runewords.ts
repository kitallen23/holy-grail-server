import { FastifyInstance } from "fastify";

import { runewords } from "../data/items.js";

export async function runewordsRoutes(fastify: FastifyInstance) {
    // Get all runewords (public route)
    fastify.get("/", async () => {
        return { runewords };
    });

    // Get single runeword by key (public route)
    fastify.get("/:runewordKey", async (request, reply) => {
        const { runewordKey } = request.params as { runewordKey: string };

        // Search across all item types
        const runeword = runewords[runewordKey];

        if (!runeword) {
            reply.code(404);
            return { error: "Runeword not found" };
        }

        return { runeword };
    });
}
