import { VercelRequest, VercelResponse } from "@vercel/node";
import { createApp } from "../../src/app-factory.js";
import { getHttpMethod } from "../lib/types.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const app = await createApp();
    await app.ready();

    const { slug } = req.query;
    const slugArray = Array.isArray(slug) ? slug : [slug];
    const path = `/auth/${slugArray.join("/")}`;

    const response = await app.inject({
        method: getHttpMethod(req.method),
        url: path + (req.url?.includes("?") ? "?" + req.url.split("?")[1] : ""),
        headers: req.headers as Record<string, string>,
        payload: req.body,
    });

    // Handle redirects
    if (response.statusCode >= 300 && response.statusCode < 400) {
        const location = response.headers.location;
        if (location) {
            res.redirect(response.statusCode, location);
            return;
        }
    }

    // Handle cookies
    const cookies = response.cookies;
    if (cookies) {
        cookies.forEach((cookie) => {
            res.setHeader("Set-Cookie", cookie.toString());
        });
    }

    res.status(response.statusCode).json(JSON.parse(response.body));
}
