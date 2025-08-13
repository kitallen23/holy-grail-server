import { VercelRequest, VercelResponse } from "@vercel/node";
import { createApp } from "../src/app-factory.js";
import { getHttpMethod, forwardHeaders } from "./lib/types.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const app = await createApp();
    await app.ready();

    const response = await app.inject({
        method: getHttpMethod(req.method),
        url: "/health",
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
