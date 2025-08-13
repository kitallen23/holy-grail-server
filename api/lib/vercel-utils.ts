import { VercelResponse } from "@vercel/node";
import type { LightMyRequestResponse } from "fastify";

// Supported HTTP methods for Fastify inject
const HTTP_METHODS = ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"] as const;
type HttpMethod = (typeof HTTP_METHODS)[number];

export function isValidHttpMethod(method: string | undefined): method is HttpMethod {
    return method !== undefined && HTTP_METHODS.includes(method.toUpperCase() as HttpMethod);
}

export function getHttpMethod(method: string | undefined): HttpMethod {
    if (isValidHttpMethod(method)) {
        return method.toUpperCase() as HttpMethod;
    }
    return "GET"; // Default fallback
}

export function filterHeaders(
    headers: Record<string, string | string[] | undefined>
): Record<string, string> {
    const filtered: Record<string, string> = {};
    Object.entries(headers).forEach(([key, value]) => {
        // Skip content-length header to avoid mismatch issues
        if (key.toLowerCase() !== "content-length" && value) {
            filtered[key] = Array.isArray(value) ? value.join(", ") : String(value);
        }
    });
    return filtered;
}

export function forwardHeaders(
    fastifyHeaders: LightMyRequestResponse["headers"],
    res: VercelResponse
): void {
    Object.entries(fastifyHeaders).forEach(([key, value]) => {
        const lowerKey = key.toLowerCase();
        if (
            (lowerKey.startsWith("access-control-") ||
                lowerKey === "cache-control" ||
                lowerKey === "pragma" ||
                lowerKey === "expires" ||
                lowerKey === "set-cookie") &&
            value
        ) {
            res.setHeader(key, String(value));
        }
    });
}
