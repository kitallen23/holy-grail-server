import { db } from "../db/index.js";
import { oauthStates } from "../db/schema.js";
import { lt } from "drizzle-orm";

export async function cleanupExpiredOAuthStates() {
    const result = await db.delete(oauthStates).where(lt(oauthStates.expiresAt, new Date()));
    console.info(`Cleaned up ${result.rowCount || 0} expired OAuth states`);
    return result;
}
