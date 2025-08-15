import { VercelRequest, VercelResponse } from "@vercel/node";
import { createApp } from "../../src/app-factory.js";
import { getHttpMethod, forwardHeaders } from "../lib/vercel-utils.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const app = await createApp();
    await app.ready();

    const { slug } = req.query;
    const slugArray = Array.isArray(slug) ? slug : [slug];
    const basePath = `/auth/${slugArray.join("/")}`;

    // Properly reconstruct query string from query parameters (excluding slug)
    const queryString = new URLSearchParams();
    Object.entries(req.query).forEach(([key, value]) => {
        if (key !== "slug") {
            if (Array.isArray(value)) {
                value.forEach((v) => queryString.append(key, String(v)));
            } else if (value) {
                queryString.append(key, String(value));
            }
        }
    });

    const url = basePath + (queryString.toString() ? `?${queryString.toString()}` : "");

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
            res.redirect(response.statusCode, location);
            return;
        }
    }

    // Handle cookies from auth
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
