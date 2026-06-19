"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
exports.POST = POST;
const utils_1 = require("@medusajs/framework/utils");
const qikink_client_1 = require("../../../../helpers/qikink-client");
const resolve_options_1 = require("../../../../utils/resolve-options");
const normalize_qikink_address_1 = require("../../../../utils/normalize-qikink-address");
const qikink_rate_limiter_1 = require("../../../../utils/qikink-rate-limiter");
/**
 * GET /store/qikink/orders
 * List all orders, or get a single order when query.id (and optional from_date, to_date) is provided.
 */
async function GET(req, res) {
    try {
        const configModule = req.scope.resolve(utils_1.ContainerRegistrationKeys.CONFIG_MODULE);
        const rawOptions = (0, resolve_options_1.extractQikinkOptions)(configModule);
        const options = (0, resolve_options_1.resolveQikinkOptions)(rawOptions);
        const client = (0, qikink_client_1.createQikinkClient)(options);
        const tokenResponse = await client.getToken();
        const accessToken = tokenResponse.access_token;
        if (!accessToken) {
            return res.status(502).json({ message: "Qikink did not return an access token" });
        }
        const id = typeof req.query?.id === "string" ? req.query.id : undefined;
        const from_date = typeof req.query?.from_date === "string" ? req.query.from_date : undefined;
        const to_date = typeof req.query?.to_date === "string" ? req.query.to_date : undefined;
        if (id !== undefined || from_date !== undefined || to_date !== undefined) {
            const order = await client.getOrder(accessToken, { id, from_date, to_date });
            return res.status(200).json(order);
        }
        const orders = await client.listOrders(accessToken);
        return res.status(200).json(orders);
    }
    catch (err) {
        if (err instanceof qikink_rate_limiter_1.QikinkRateLimitError) {
            return res.status(429).json({ message: err.message });
        }
        const message = err instanceof Error ? err.message : "Qikink orders request failed";
        const status = message.includes("required") ? 400 : 502;
        return res.status(status).json({ message });
    }
}
/**
 * POST /store/qikink/orders
 * Create a Qikink order. Body must be the Qikink create-order JSON payload.
 */
async function POST(req, res) {
    try {
        const configModule = req.scope.resolve(utils_1.ContainerRegistrationKeys.CONFIG_MODULE);
        const rawOptions = (0, resolve_options_1.extractQikinkOptions)(configModule);
        const options = (0, resolve_options_1.resolveQikinkOptions)(rawOptions);
        const client = (0, qikink_client_1.createQikinkClient)(options);
        const tokenResponse = await client.getToken();
        const accessToken = tokenResponse.access_token;
        if (!accessToken) {
            return res.status(502).json({ message: "Qikink did not return an access token" });
        }
        const body = req.body;
        if (!body || typeof body !== "object" || !("order_number" in body)) {
            return res.status(400).json({
                message: "Invalid body: expected Qikink create-order payload with order_number, line_items, shipping_address, etc.",
            });
        }
        const payload = { ...body };
        if (payload.shipping_address && typeof payload.shipping_address === "object") {
            payload.shipping_address = (0, normalize_qikink_address_1.normalizeQikinkShippingAddress)(payload.shipping_address);
        }
        const result = await client.createOrder(accessToken, payload);
        return res.status(200).json(result);
    }
    catch (err) {
        if (err instanceof qikink_rate_limiter_1.QikinkRateLimitError) {
            return res.status(429).json({ message: err.message });
        }
        const message = err instanceof Error ? err.message : "Qikink create order failed";
        const status = message.includes("required") || message.includes("Invalid body") ? 400 : 502;
        return res.status(status).json({ message });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL3N0b3JlL3Fpa2luay9vcmRlcnMvcm91dGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFjQSxrQkErQkM7QUFNRCxvQkFvQ0M7QUF0RkQscURBQXFFO0FBQ3JFLHFFQUcwQztBQUMxQyx1RUFBOEY7QUFDOUYseUZBQTJGO0FBQzNGLCtFQUE0RTtBQUU1RTs7O0dBR0c7QUFDSSxLQUFLLFVBQVUsR0FBRyxDQUFDLEdBQWtCLEVBQUUsR0FBbUI7SUFDL0QsSUFBSSxDQUFDO1FBQ0gsTUFBTSxZQUFZLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsaUNBQXlCLENBQUMsYUFBYSxDQUFDLENBQUE7UUFDL0UsTUFBTSxVQUFVLEdBQUcsSUFBQSxzQ0FBb0IsRUFBQyxZQUFZLENBQUMsQ0FBQTtRQUNyRCxNQUFNLE9BQU8sR0FBRyxJQUFBLHNDQUFvQixFQUFDLFVBQVUsQ0FBQyxDQUFBO1FBQ2hELE1BQU0sTUFBTSxHQUFHLElBQUEsa0NBQWtCLEVBQUMsT0FBTyxDQUFDLENBQUE7UUFDMUMsTUFBTSxhQUFhLEdBQUcsTUFBTSxNQUFNLENBQUMsUUFBUSxFQUFFLENBQUE7UUFDN0MsTUFBTSxXQUFXLEdBQUcsYUFBYSxDQUFDLFlBQVksQ0FBQTtRQUM5QyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDakIsT0FBTyxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLE9BQU8sRUFBRSx1Q0FBdUMsRUFBRSxDQUFDLENBQUE7UUFDbkYsQ0FBQztRQUVELE1BQU0sRUFBRSxHQUFHLE9BQU8sR0FBRyxDQUFDLEtBQUssRUFBRSxFQUFFLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFBO1FBQ3ZFLE1BQU0sU0FBUyxHQUFHLE9BQU8sR0FBRyxDQUFDLEtBQUssRUFBRSxTQUFTLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFBO1FBQzVGLE1BQU0sT0FBTyxHQUFHLE9BQU8sR0FBRyxDQUFDLEtBQUssRUFBRSxPQUFPLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFBO1FBRXRGLElBQUksRUFBRSxLQUFLLFNBQVMsSUFBSSxTQUFTLEtBQUssU0FBUyxJQUFJLE9BQU8sS0FBSyxTQUFTLEVBQUUsQ0FBQztZQUN6RSxNQUFNLEtBQUssR0FBRyxNQUFNLE1BQU0sQ0FBQyxRQUFRLENBQUMsV0FBVyxFQUFFLEVBQUUsRUFBRSxFQUFFLFNBQVMsRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFBO1lBQzVFLE9BQU8sR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUE7UUFDcEMsQ0FBQztRQUVELE1BQU0sTUFBTSxHQUFHLE1BQU0sTUFBTSxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsQ0FBQTtRQUNuRCxPQUFPLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFBO0lBQ3JDLENBQUM7SUFBQyxPQUFPLEdBQUcsRUFBRSxDQUFDO1FBQ2IsSUFBSSxHQUFHLFlBQVksMENBQW9CLEVBQUUsQ0FBQztZQUN4QyxPQUFPLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsT0FBTyxFQUFFLEdBQUcsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFBO1FBQ3ZELENBQUM7UUFDRCxNQUFNLE9BQU8sR0FBRyxHQUFHLFlBQVksS0FBSyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyw4QkFBOEIsQ0FBQTtRQUNuRixNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQTtRQUN2RCxPQUFPLEdBQUcsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQTtJQUM3QyxDQUFDO0FBQ0gsQ0FBQztBQUVEOzs7R0FHRztBQUNJLEtBQUssVUFBVSxJQUFJLENBQUMsR0FBa0IsRUFBRSxHQUFtQjtJQUNoRSxJQUFJLENBQUM7UUFDSCxNQUFNLFlBQVksR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxpQ0FBeUIsQ0FBQyxhQUFhLENBQUMsQ0FBQTtRQUMvRSxNQUFNLFVBQVUsR0FBRyxJQUFBLHNDQUFvQixFQUFDLFlBQVksQ0FBQyxDQUFBO1FBQ3JELE1BQU0sT0FBTyxHQUFHLElBQUEsc0NBQW9CLEVBQUMsVUFBVSxDQUFDLENBQUE7UUFDaEQsTUFBTSxNQUFNLEdBQUcsSUFBQSxrQ0FBa0IsRUFBQyxPQUFPLENBQUMsQ0FBQTtRQUMxQyxNQUFNLGFBQWEsR0FBRyxNQUFNLE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FBQTtRQUM3QyxNQUFNLFdBQVcsR0FBRyxhQUFhLENBQUMsWUFBWSxDQUFBO1FBQzlDLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUNqQixPQUFPLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsT0FBTyxFQUFFLHVDQUF1QyxFQUFFLENBQUMsQ0FBQTtRQUNuRixDQUFDO1FBRUQsTUFBTSxJQUFJLEdBQUcsR0FBRyxDQUFDLElBQWUsQ0FBQTtRQUNoQyxJQUFJLENBQUMsSUFBSSxJQUFJLE9BQU8sSUFBSSxLQUFLLFFBQVEsSUFBSSxDQUFDLENBQUMsY0FBYyxJQUFJLElBQUksQ0FBQyxFQUFFLENBQUM7WUFDbkUsT0FBTyxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQztnQkFDMUIsT0FBTyxFQUFFLDBHQUEwRzthQUNwSCxDQUFDLENBQUE7UUFDSixDQUFDO1FBRUQsTUFBTSxPQUFPLEdBQUcsRUFBRSxHQUFHLElBQUksRUFBOEIsQ0FBQTtRQUN2RCxJQUFJLE9BQU8sQ0FBQyxnQkFBZ0IsSUFBSSxPQUFPLE9BQU8sQ0FBQyxnQkFBZ0IsS0FBSyxRQUFRLEVBQUUsQ0FBQztZQUM3RSxPQUFPLENBQUMsZ0JBQWdCLEdBQUcsSUFBQSx5REFBOEIsRUFDdkQsT0FBTyxDQUFDLGdCQUEyQyxDQUNKLENBQUE7UUFDbkQsQ0FBQztRQUVELE1BQU0sTUFBTSxHQUFHLE1BQU0sTUFBTSxDQUFDLFdBQVcsQ0FBQyxXQUFXLEVBQUUsT0FBTyxDQUFDLENBQUE7UUFDN0QsT0FBTyxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQTtJQUNyQyxDQUFDO0lBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQztRQUNiLElBQUksR0FBRyxZQUFZLDBDQUFvQixFQUFFLENBQUM7WUFDeEMsT0FBTyxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLE9BQU8sRUFBRSxHQUFHLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQTtRQUN2RCxDQUFDO1FBQ0QsTUFBTSxPQUFPLEdBQUcsR0FBRyxZQUFZLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsNEJBQTRCLENBQUE7UUFDakYsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsSUFBSSxPQUFPLENBQUMsUUFBUSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQTtRQUMzRixPQUFPLEdBQUcsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQTtJQUM3QyxDQUFDO0FBQ0gsQ0FBQyJ9