import { VercelRequest, VercelResponse } from "@vercel/node";
import { createApp } from "../src/app-factory.js";
import { getHttpMethod, forwardHeaders } from "./lib/vercel-utils.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const app = await createApp();
    await app.ready();

    // Properly reconstruct query string from query parameters
    const queryString = new URLSearchParams();
    Object.entries(req.query).forEach(([key, value]) => {
        if (Array.isArray(value)) {
            value.forEach((v) => queryString.append(key, String(v)));
        } else if (value) {
            queryString.append(key, String(value));
        }
    });

    const url = "/items" + (queryString.toString() ? `?${queryString.toString()}` : "");

    const response = await app.inject({
        method: getHttpMethod(req.method),
        url,
        headers: req.headers as Record<string, string>,
        payload: req.body,
    });

    // Forward CORS and cache headers from Fastify response
    forwardHeaders(response.headers, res);

    if (response.body) {
        res.status(response.statusCode).json(JSON.parse(response.body));
    } else {
        res.status(response.statusCode).send("");
    }
}
