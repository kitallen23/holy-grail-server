import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema.js";

// Configure Neon to disable HTTP keep-alive to prevent Lambda hanging
const sql = neon(process.env.DATABASE_URL!, {
    fetchOptions: {
        keepalive: false,
    },
});
export const db = drizzle(sql, { schema });
