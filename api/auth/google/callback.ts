import { VercelRequest, VercelResponse } from "@vercel/node";
import { createApp } from "../../../src/app-factory.js";
import { getHttpMethod, forwardHeaders } from "../../lib/vercel-utils.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const app = await createApp();
    await app.ready();

    const url = `/auth/google/callback${req.url?.includes("?") ? req.url.substring(req.url.indexOf("?")) : ""}`;

    const response = await app.inject({
        method: getHttpMethod(req.method),
        url,
        headers: req.headers as Record<string, string>,
        payload: req.body,
    });

    // Handle redirects for OAuth
    if (response.statusCode >= 300 && response.statusCode < 400) {
        const location = response.headers.location;
        if (location) {
            // Preserve Set-Cookie header during redirect
            if (response.headers["set-cookie"]) {
                res.setHeader("Set-Cookie", response.headers["set-cookie"]);
            }

            // Forward other headers before redirecting
            forwardHeaders(response.headers, res);

            res.redirect(response.statusCode, location);
            return;
        }
    }

    // Forward CORS and cache headers from Fastify response
    forwardHeaders(response.headers, res);

    if (response.body) {
        res.status(response.statusCode).json(JSON.parse(response.body));
    } else {
        res.status(response.statusCode).send("");
    }
}
