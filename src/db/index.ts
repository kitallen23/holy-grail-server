import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema.js";

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString, {
    max: 1, // Single connection for Lambda
    idle_timeout: 2, // Close idle connections quickly (seconds)
    connect_timeout: 10, // Fast connection timeout (seconds)
    max_lifetime: 60 * 30, // 30 min max connection life (seconds)
    transform: { undefined: null },
    prepare: false, // Disable prepared statements for Lambda
    onnotice: () => {}, // Disable notices to prevent hanging
});
export const db = drizzle(client, { schema });
