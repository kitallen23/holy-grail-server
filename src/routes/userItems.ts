import { FastifyInstance } from "fastify";
import { requireAuth } from "../middleware/auth.js";
import { db } from "../db/index.js";
import { userItems } from "../db/schema.js";
import { eq, and } from "drizzle-orm";
import { items } from "../data/items.js";
import { HttpError } from "../types/errors.js";

export async function userItemsRoutes(fastify: FastifyInstance) {
    // Get user's grail items
    fastify.get("/", { preHandler: requireAuth }, async (request) => {
        const userId = request.user!.id;

        const foundItems = await db.select().from(userItems).where(eq(userItems.userId, userId));

        return { items: foundItems };
    });

    // Get only found items
    fastify.get("/found", { preHandler: requireAuth }, async (request) => {
        const userId = request.user!.id;

        const foundItems = await db
            .select()
            .from(userItems)
            .where(and(eq(userItems.userId, userId), eq(userItems.found, true)));

        return { items: foundItems };
    });

    // Mark item as found/unfound
    fastify.post("/set", { preHandler: requireAuth }, async (request) => {
        const { itemKey, found } = request.body as { itemKey: string; found: boolean };
        const userId = request.user!.id;

        // Check if record exists
        const existing = await db
            .select()
            .from(userItems)
            .where(and(eq(userItems.userId, userId), eq(userItems.itemKey, itemKey)))
            .limit(1);

        if (existing.length > 0) {
            if (existing[0].found === true && found === false) {
                // Delete existing record if it's being set to false (save DB space)
                await db.delete(userItems).where(eq(userItems.id, existing[0].id));
            } else {
                // Update existing record
                await db
                    .update(userItems)
                    .set({
                        found,
                        foundAt: found ? new Date() : null,
                    })
                    .where(eq(userItems.id, existing[0].id));
            }
        } else {
            // First, check that the item actually exists
            const allItemKeys = Object.keys(items.uniqueItems).concat(
                Object.keys(items.setItems).concat(Object.keys(items.runes))
            );
            if (allItemKeys.includes(itemKey)) {
                // Create new record
                await db.insert(userItems).values({
                    userId,
                    itemKey,
                    found,
                    foundAt: found ? new Date() : null,
                });
            } else {
                throw new HttpError(400, "Item key not found");
            }
        }

        return { success: true, found };
    });
}
