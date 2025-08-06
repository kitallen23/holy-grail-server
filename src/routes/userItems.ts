import { FastifyInstance } from "fastify";
import { requireAuth } from "../middleware/auth.js";
import { db } from "../db/index.js";
import { userItems } from "../db/schema.js";
import { eq, and, inArray } from "drizzle-orm";
import { items } from "../data/items.js";
import { HttpError } from "../types/errors.js";

export async function userItemsRoutes(fastify: FastifyInstance) {
    // Get user's grail items
    fastify.get("/", { preHandler: requireAuth }, async (request) => {
        const userId = request.user!.id;

        const foundItems = await db.select().from(userItems).where(eq(userItems.userId, userId));

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
            const allItemKeys = Object.keys(items.uniqueItems)
                .concat(Object.keys(items.setItems))
                .concat(Object.keys(items.runes));
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

    fastify.post("/set-bulk", { preHandler: requireAuth }, async (request) => {
        const { items: itemsToImport } = request.body as {
            items: { itemKey: string; foundAt?: string; found: boolean }[];
        };
        const userId = request.user!.id;

        // Validate all item keys exist
        const allItemKeys = Object.keys(items.uniqueItems)
            .concat(Object.keys(items.setItems))
            .concat(Object.keys(items.runes));

        const validItemsToImport = itemsToImport.filter(
            (item) => allItemKeys.includes(item.itemKey) && !!item.found
        );

        const itemKeys = validItemsToImport.map((item) => item.itemKey);
        const existing = await db
            .select()
            .from(userItems)
            .where(and(eq(userItems.userId, userId), inArray(userItems.itemKey, itemKeys)));

        const existingMap = new Map(existing.map((record) => [record.itemKey, record]));

        const itemsToInsert: {
            userId: string;
            itemKey: string;
            found: boolean;
            foundAt: Date;
        }[] = [];

        const itemsToUpdate: {
            id: string;
            foundAt: Date;
        }[] = [];

        for (const item of validItemsToImport) {
            const existingRecord = existingMap.get(item.itemKey);

            if (!existingRecord) {
                // Item not in DB - add it
                itemsToInsert.push({
                    userId,
                    itemKey: item.itemKey,
                    found: true,
                    foundAt: item.foundAt ? new Date(item.foundAt) : new Date(),
                });
            } else if (existingRecord.found === false) {
                // Item exists but not found - update it
                itemsToUpdate.push({
                    id: existingRecord.id,
                    foundAt: item.foundAt ? new Date(item.foundAt) : new Date(),
                });
            }
            // Skip if existingRecord.found === true
        }

        // Perform batch operations
        if (itemsToInsert.length > 0) {
            await db.insert(userItems).values(itemsToInsert);
        }

        if (itemsToUpdate.length > 0) {
            await db.transaction(async (tx) => {
                const promises = itemsToUpdate.map((updateItem) =>
                    tx
                        .update(userItems)
                        .set({
                            found: true,
                            foundAt: updateItem.foundAt,
                        })
                        .where(eq(userItems.id, updateItem.id))
                );
                await Promise.all(promises);
            });
        }

        const totalProcessed = itemsToInsert.length + itemsToUpdate.length;
        const skipped = validItemsToImport.length - totalProcessed;

        return {
            success: true,
            inserted: itemsToInsert.length,
            updated: itemsToUpdate.length,
            skipped,
        };
    });

    fastify.delete("/clear", { preHandler: requireAuth }, async (request) => {
        const userId = request.user!.id;

        await db.delete(userItems).where(eq(userItems.userId, userId));

        return { success: true };
    });
}
