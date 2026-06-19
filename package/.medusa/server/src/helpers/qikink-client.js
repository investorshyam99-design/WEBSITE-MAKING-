"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearTokenCacheForTesting = clearTokenCacheForTesting;
exports.createQikinkClient = createQikinkClient;
const node_https_1 = __importDefault(require("node:https"));
const node_querystring_1 = __importDefault(require("node:querystring"));
const qikink_rate_limiter_1 = require("../utils/qikink-rate-limiter");
/** Default token TTL in seconds when API does not return expires_in */
const DEFAULT_TOKEN_TTL_SEC = 3600;
/** Buffer before expiry (ms): refresh token this long before it expires */
const EXPIRY_BUFFER_MS = 30 * 1000;
/** Shared token cache across client instances with the same config (so we call getToken only when token is missing or expired). */
const tokenCacheByKey = new Map();
function tokenCacheKey(options) {
    return `${options.apiUrl}|${options.clientId}`;
}
/**
 * Clear token cache. Only for use in tests (so cached token from one test does not affect the next).
 */
function clearTokenCacheForTesting() {
    tokenCacheByKey.clear();
}
function parseBaseUrl(apiUrl) {
    const u = new URL(apiUrl.startsWith("http") ? apiUrl : `https://${apiUrl}`);
    const port = u.port && u.port !== "443" ? parseInt(u.port, 10) : undefined;
    return { hostname: u.hostname, port };
}
function request(options) {
    return new Promise((resolve, reject) => {
        const req = node_https_1.default.request({
            hostname: options.hostname,
            port: options.port ?? 443,
            path: options.path,
            method: options.method,
            headers: options.headers ?? {},
        }, (res) => {
            const chunks = [];
            res.on("data", (chunk) => chunks.push(chunk));
            res.on("end", () => {
                const body = Buffer.concat(chunks).toString();
                resolve({ statusCode: res.statusCode ?? 0, body });
            });
            res.on("error", reject);
        });
        req.on("error", reject);
        if (options.body)
            req.write(options.body);
        req.end();
    });
}
function createQikinkClient(options) {
    const { hostname, port } = parseBaseUrl(options.apiUrl);
    const limit = options.rateLimitRequestsPerMinute ?? 0;
    const rateLimitedRequest = async (reqOptions) => {
        (0, qikink_rate_limiter_1.checkAndRecordRateLimit)(limit);
        return request(reqOptions);
    };
    const cacheKey = tokenCacheKey(options);
    return {
        async getToken() {
            const now = Date.now();
            const cached = tokenCacheByKey.get(cacheKey);
            if (cached &&
                cached.expiresAt > now + EXPIRY_BUFFER_MS) {
                return cached.response;
            }
            const path = "/api/token";
            const postData = node_querystring_1.default.stringify({
                ClientId: options.clientId,
                client_secret: options.clientSecret,
            });
            const { statusCode, body } = await rateLimitedRequest({
                hostname,
                port,
                path,
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "Content-Length": Buffer.byteLength(postData).toString(),
                },
                body: postData,
            });
            if (statusCode < 200 || statusCode >= 300) {
                throw new Error(`Qikink token failed (${statusCode}): ${body}`);
            }
            let parsed;
            try {
                parsed = JSON.parse(body);
            }
            catch {
                throw new Error(`Qikink token invalid JSON: ${body}`);
            }
            // Response may be a raw token string
            if (typeof parsed === "string" && parsed.length > 0) {
                const response = { access_token: parsed };
                const ttlSec = DEFAULT_TOKEN_TTL_SEC;
                tokenCacheByKey.set(cacheKey, {
                    accessToken: parsed,
                    response,
                    expiresAt: now + ttlSec * 1000,
                });
                return response;
            }
            if (typeof parsed !== "object" || parsed === null) {
                return {};
            }
            const obj = parsed;
            // Normalize: try common keys and nested shapes (API returns "Accesstoken" with lowercase 's')
            const token = obj["access_token"] ??
                obj["Accesstoken"] ??
                obj["AccessToken"] ??
                obj["accessToken"] ??
                obj["token"] ??
                (obj["data"] != null && typeof obj["data"] === "object" && obj["data"]["access_token"]) ??
                (obj["result"] != null && typeof obj["result"] === "object" && obj["result"]["access_token"]);
            if (token != null && typeof token === "string") {
                obj["access_token"] = token;
            }
            const expiresInSec = typeof obj["expires_in"] === "number" && Number.isFinite(obj["expires_in"]) && obj["expires_in"] > 0
                ? obj["expires_in"]
                : DEFAULT_TOKEN_TTL_SEC;
            const accessToken = obj["access_token"] ?? "";
            if (accessToken) {
                tokenCacheByKey.set(cacheKey, {
                    accessToken,
                    response: obj,
                    expiresAt: now + expiresInSec * 1000,
                });
            }
            else {
                tokenCacheByKey.delete(cacheKey);
            }
            return obj;
        },
        async createOrder(accessToken, payload) {
            const path = "/api/order/create";
            const bodyStr = JSON.stringify(payload);
            const { statusCode, body } = await rateLimitedRequest({
                hostname,
                port,
                path,
                method: "POST",
                headers: {
                    ClientId: options.clientId,
                    Accesstoken: accessToken,
                    "Content-Type": "application/json",
                    "Content-Length": Buffer.byteLength(bodyStr).toString(),
                },
                body: bodyStr,
            });
            if (statusCode < 200 || statusCode >= 300) {
                throw new Error(`Qikink create order failed (${statusCode}): ${body}`);
            }
            try {
                return JSON.parse(body);
            }
            catch {
                throw new Error(`Qikink create order invalid JSON: ${body}`);
            }
        },
        async listOrders(accessToken) {
            const path = "/api/order";
            const { statusCode, body } = await rateLimitedRequest({
                hostname,
                port,
                path,
                method: "GET",
                headers: {
                    ClientId: options.clientId,
                    Accesstoken: accessToken,
                },
            });
            if (statusCode < 200 || statusCode >= 300) {
                throw new Error(`Qikink list orders failed (${statusCode}): ${body}`);
            }
            try {
                return JSON.parse(body);
            }
            catch {
                throw new Error(`Qikink list orders invalid JSON: ${body}`);
            }
        },
        async getOrder(accessToken, params) {
            const search = new URLSearchParams();
            if (params.id)
                search.set("id", params.id);
            if (params.from_date)
                search.set("from_date", params.from_date);
            if (params.to_date)
                search.set("to_date", params.to_date);
            const path = `/api/order${search.toString() ? `?${search.toString()}` : ""}`;
            const { statusCode, body } = await rateLimitedRequest({
                hostname,
                port,
                path,
                method: "GET",
                headers: {
                    ClientId: options.clientId,
                    Accesstoken: accessToken,
                },
            });
            if (statusCode < 200 || statusCode >= 300) {
                throw new Error(`Qikink get order failed (${statusCode}): ${body}`);
            }
            try {
                return JSON.parse(body);
            }
            catch {
                throw new Error(`Qikink get order invalid JSON: ${body}`);
            }
        },
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicWlraW5rLWNsaWVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9oZWxwZXJzL3Fpa2luay1jbGllbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUF3QkEsOERBRUM7QUFxRUQsZ0RBMktDO0FBMVFELDREQUE4QjtBQUM5Qix3RUFBMEM7QUFFMUMsc0VBQXNFO0FBRXRFLHVFQUF1RTtBQUN2RSxNQUFNLHFCQUFxQixHQUFHLElBQUksQ0FBQTtBQUVsQywyRUFBMkU7QUFDM0UsTUFBTSxnQkFBZ0IsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFBO0FBRWxDLG1JQUFtSTtBQUNuSSxNQUFNLGVBQWUsR0FHakIsSUFBSSxHQUFHLEVBQUUsQ0FBQTtBQUViLFNBQVMsYUFBYSxDQUFDLE9BQTRCO0lBQ2pELE9BQU8sR0FBRyxPQUFPLENBQUMsTUFBTSxJQUFJLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQTtBQUNoRCxDQUFDO0FBRUQ7O0dBRUc7QUFDSCxTQUFnQix5QkFBeUI7SUFDdkMsZUFBZSxDQUFDLEtBQUssRUFBRSxDQUFBO0FBQ3pCLENBQUM7QUE0QkQsU0FBUyxZQUFZLENBQUMsTUFBYztJQUNsQyxNQUFNLENBQUMsR0FBRyxJQUFJLEdBQUcsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLFdBQVcsTUFBTSxFQUFFLENBQUMsQ0FBQTtJQUMzRSxNQUFNLElBQUksR0FBRyxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQyxJQUFJLEtBQUssS0FBSyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFBO0lBQzFFLE9BQU8sRUFBRSxRQUFRLEVBQUUsQ0FBQyxDQUFDLFFBQVEsRUFBRSxJQUFJLEVBQUUsQ0FBQTtBQUN2QyxDQUFDO0FB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