import { VercelRequest, VercelResponse } from "@vercel/node";
import { createApp } from "../../src/app-factory.js";
import { getHttpMethod, forwardHeaders, filterHeaders } from "../lib/vercel-utils.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const app = await createApp();
    await app.ready();

    const { slug } = req.query;
    const slugStr = Array.isArray(slug) ? slug.join("-") : slug;
    const url = `/user-items/${slugStr}`;

    const response = await app.inject({
        method: getHttpMethod(req.method),
        url,
        headers: filterHeaders(req.headers),
        payload: req.body,
    });

    // Handle cookies from auth middleware
    const cookies = response.cookies;
    if (cookies) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        cookies.forEach((cookie: any) => {
            res.setHeader("Set-Cookie", cookie.toString());
        });
    }

    // Forward CORS and cache headers from Fastify response
    forwardHeaders(response.headers, res);

    if (response.body) {
        res.status(response.statusCode).json(JSON.parse(response.body));
    } else {
        res.status(response.statusCode).send("");
    }
}
