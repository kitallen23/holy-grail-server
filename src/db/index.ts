import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import { drizzle as drizzleNode } from "drizzle-orm/node-postgres";
import { neon } from "@neondatabase/serverless";
import pkg from "pg";
const { Pool } = pkg;
import * as schema from "./schema.js";

const DATABASE_URL = process.env.DATABASE_URL!;

// Create the appropriate database connection based on environment
const createDatabase = () => {
    if (DATABASE_URL.includes("neon.tech")) {
        // Neon serverless (production) - no keepalive config needed for Vercel
        const sql = neon(DATABASE_URL);
        return drizzleNeon(sql, { schema });
    } else {
        // Local PostgreSQL (development)
        const pool = new Pool({
            connectionString: DATABASE_URL,
        });
        return drizzleNode(pool, { schema });
    }
};

// Use any to avoid complex union types - both drivers have compatible interfaces
export const db = createDatabase() as any; //eslint-disable-line @typescript-eslint/no-explicit-any
