import { pgTable, text, timestamp, uuid, boolean } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
    id: text("id").primaryKey(),
    email: text("email"),
    googleId: text("google_id").unique(),
    discordId: text("discord_id").unique(),
    createdAt: timestamp("created_at").defaultNow(),
});

export const sessions = pgTable("sessions", {
    id: text("id").primaryKey(),
    userId: text("user_id")
        .notNull()
        .references(() => users.id),
    expiresAt: timestamp("expires_at", { withTimezone: true, mode: "date" }).notNull(),
});

export const userItems = pgTable("user_items", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
        .notNull()
        .references(() => users.id),
    itemKey: text("item_key").notNull(),
    found: boolean("found").default(false).notNull(),
    foundAt: timestamp("found_at"),
});
