import { VercelRequest, VercelResponse } from "@vercel/node";
import { createApp } from "../../src/app-factory.js";
import { getHttpMethod } from "../lib/types.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const app = await createApp();
    await app.ready();

    const { slug } = req.query;
    const slugArray = Array.isArray(slug) ? slug : [slug];

    // Handle root path (empty slug) vs runeword key path
    const path = slugArray[0] ? `/runewords/${slugArray.join("/")}` : "/runewords";

    const response = await app.inject({
        method: getHttpMethod(req.method),
        url: path + (req.url?.includes("?") ? "?" + req.url.split("?")[1] : ""),
        headers: req.headers as Record<string, string>,
        payload: req.body,
    });

    res.status(response.statusCode).json(JSON.parse(response.body));
}
