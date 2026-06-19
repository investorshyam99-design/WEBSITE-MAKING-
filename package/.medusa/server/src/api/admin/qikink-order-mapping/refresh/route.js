"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const utils_1 = require("@medusajs/framework/utils");
const qikink_client_1 = require("../../../../helpers/qikink-client");
const resolve_options_1 = require("../../../../utils/resolve-options");
const qikink_order_status_map_1 = require("../../../../utils/qikink-order-status-map");
const qikink_rate_limiter_1 = require("../../../../utils/qikink-rate-limiter");
const qikink_order_mapping_1 = require("../../../../modules/qikink-order-mapping");
const config_1 = require("../../../../config");
const run_qikink_order_refresh_1 = require("../../../../utils/run-qikink-order-refresh");
const DEFAULT_REFRESH_LIMIT = 500;
const MAX_REFRESH_LIMIT = 1000;
const DEFAULT_CONCURRENCY = 20;
/**
 * POST /admin/qikink-order-mapping/refresh
 * Sync order status from Qikink into qikink_order_mapping.
 * - Query order_id (optional): if set, refresh only that Qikink order's mapping.
 * - If omitted, list only our mappings that are not in terminal status (completed, canceled, returned), then fetch each from Qikink by id and update.
 * - Query limit (optional): max mappings to process per request (default 500, max 1000).
 * - Query concurrency (optional): how many to fetch/update in parallel (default 20).
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
        const orderIdQuery = typeof req.query?.order_id === "string" ? req.query.order_id.trim() : undefined;
        const limitParam = typeof req.query?.limit === "string" ? parseInt(req.query.limit, 10) : DEFAULT_REFRESH_LIMIT;
        const limit = Number.isFinite(limitParam)
            ? Math.min(Math.max(1, limitParam), MAX_REFRESH_LIMIT)
            : DEFAULT_REFRESH_LIMIT;
        const concurrencyParam = typeof req.query?.concurrency === "string" ? parseInt(req.query.concurrency, 10) : DEFAULT_CONCURRENCY;
        const concurrency = Number.isFinite(concurrencyParam) && concurrencyParam > 0
            ? Math.min(concurrencyParam, 100)
            : DEFAULT_CONCURRENCY;
        const service = req.scope.resolve(qikink_order_mapping_1.QIKINK_ORDER_MAPPING_MODULE);
        const coolingMinutes = config_1.qikinkConfig.refreshCoolingTimeMinutes ?? 10;
        const threshold = new Date(Date.now() - coolingMinutes * 60 * 1000);
        if (orderIdQuery !== undefined && orderIdQuery !== "") {
            const mapping = await service.getMappingByQikinkOrderId(orderIdQuery);
            if (!mapping) {
                return res.status(404).json({
                    message: `No qikink_order_mapping found for Qikink order_id: ${orderIdQuery}`,
                });
            }
            const updatedAt = mapping.updated_at;
            if (updatedAt == null || updatedAt > threshold) {
                return res.status(200).json({ updated: 0, skipped_cooling: true });
            }
            const order = await client.getOrder(accessToken, { id: orderIdQuery });
            const qikinkOrder = order;
            const status = qikinkOrder?.status ?? "";
            const hasAwb = Boolean(qikinkOrder?.awb && String(qikinkOrder.awb).trim() !== "") ||
                Boolean(qikinkOrder?.tracking_link && String(qikinkOrder.tracking_link).trim() !== "");
            const internalStatus = (0, qikink_order_status_map_1.qikinkStatusToInternal)(status, hasAwb, {
                qikinkOrderId: orderIdQuery,
            });
            const updated = await service.updateStatusByQikinkOrderId(orderIdQuery, internalStatus);
            if (!updated) {
                return res.status(404).json({
                    message: `No qikink_order_mapping found for Qikink order_id: ${orderIdQuery}`,
                });
            }
            return res.status(200).json({ updated: 1, mapping: updated });
        }
        const result = await (0, run_qikink_order_refresh_1.runBulkOrderStatusRefresh)(req.scope, { limit, concurrency });
        return res.status(200).json({
            updated: result.updated,
            processed: result.processed,
            total_eligible: result.total_eligible,
            limit,
        });
    }
    catch (err) {
        if (err instanceof qikink_rate_limiter_1.QikinkRateLimitError) {
            return res.status(429).json({ message: err.message });
        }
        const message = err instanceof Error ? err.message : "Refresh order status failed";
        const status = message.includes("required") ? 400 : 502;
        return res.status(status).json({ message });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL2FkbWluL3Fpa2luay1vcmRlci1tYXBwaW5nL3JlZnJlc2gvcm91dGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUF3QkEsb0JBNEVDO0FBbkdELHFEQUFxRTtBQUNyRSxxRUFBc0U7QUFDdEUsdUVBQThGO0FBQzlGLHVGQUFrRjtBQUNsRiwrRUFBNEU7QUFFNUUsbUZBQXNGO0FBRXRGLCtDQUFpRDtBQUNqRCx5RkFBc0Y7QUFFdEYsTUFBTSxxQkFBcUIsR0FBRyxHQUFHLENBQUE7QUFDakMsTUFBTSxpQkFBaUIsR0FBRyxJQUFJLENBQUE7QUFDOUIsTUFBTSxtQkFBbUIsR0FBRyxFQUFFLENBQUE7QUFFOUI7Ozs7Ozs7R0FPRztBQUNJLEtBQUssVUFBVSxJQUFJLENBQUMsR0FBa0IsRUFBRSxHQUFtQjtJQUNoRSxJQUFJLENBQUM7UUFDSCxNQUFNLFlBQVksR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxpQ0FBeUIsQ0FBQyxhQUFhLENBQUMsQ0FBQTtRQUMvRSxNQUFNLFVBQVUsR0FBRyxJQUFBLHNDQUFvQixFQUFDLFlBQVksQ0FBQyxDQUFBO1FBQ3JELE1BQU0sT0FBTyxHQUFHLElBQUEsc0NBQW9CLEVBQUMsVUFBVSxDQUFDLENBQUE7UUFDaEQsTUFBTSxNQUFNLEdBQUcsSUFBQSxrQ0FBa0IsRUFBQyxPQUFPLENBQUMsQ0FBQTtRQUMxQyxNQUFNLGFBQWEsR0FBRyxNQUFNLE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FBQTtRQUM3QyxNQUFNLFdBQVcsR0FBRyxhQUFhLENBQUMsWUFBWSxDQUFBO1FBQzlDLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUNqQixPQUFPLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsT0FBTyxFQUFFLHVDQUF1QyxFQUFFLENBQUMsQ0FB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