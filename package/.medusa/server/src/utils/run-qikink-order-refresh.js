"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QikinkRateLimitError = void 0;
exports.runWithConcurrency = runWithConcurrency;
exports.runBulkOrderStatusRefresh = runBulkOrderStatusRefresh;
const utils_1 = require("@medusajs/framework/utils");
const qikink_client_1 = require("../helpers/qikink-client");
const resolve_options_1 = require("./resolve-options");
const qikink_order_status_map_1 = require("./qikink-order-status-map");
const qikink_rate_limiter_1 = require("./qikink-rate-limiter");
Object.defineProperty(exports, "QikinkRateLimitError", { enumerable: true, get: function () { return qikink_rate_limiter_1.QikinkRateLimitError; } });
const qikink_order_mapping_1 = require("../modules/qikink-order-mapping");
const config_1 = require("../config");
/**
 * Process items in parallel with a concurrency limit.
 */
async function runWithConcurrency(items, concurrency, fn) {
    const results = [];
    for (let i = 0; i < items.length; i += concurrency) {
        const chunk = items.slice(i, i + concurrency);
        const chunkResults = await Promise.all(chunk.map(fn));
        results.push(...chunkResults);
    }
    return results;
}
const DEFAULT_LIMIT = 500;
const DEFAULT_CONCURRENCY = 20;
/**
 * Runs the bulk order-status refresh flow: list non-terminal mappings outside cooling,
 * fetch each from Qikink, map status, update mapping. Same logic as POST /admin/qikink-order-mapping/refresh (bulk path).
 * @param container - Medusa container (e.g. req.scope or job container)
 * @param options - Optional limit (default 500) and concurrency (default 20)
 * @returns updated count, processed count, total_eligible
 * @throws on missing token, rate limit (QikinkRateLimitError), or resolve/options errors
 */
async function runBulkOrderStatusRefresh(container, options = {}) {
    const limit = options.limit ?? DEFAULT_LIMIT;
    const concurrency = options.concurrency ?? DEFAULT_CONCURRENCY;
    const configModule = container.resolve(utils_1.ContainerRegistrationKeys.CONFIG_MODULE);
    const rawOptions = (0, resolve_options_1.extractQikinkOptions)(configModule);
    const resolvedOptions = (0, resolve_options_1.resolveQikinkOptions)(rawOptions);
    const client = (0, qikink_client_1.createQikinkClient)(resolvedOptions);
    const tokenResponse = await client.getToken();
    const accessToken = tokenResponse.access_token;
    if (!accessToken) {
        throw new Error("Qikink did not return an access token");
    }
    const service = container.resolve(qikink_order_mapping_1.QIKINK_ORDER_MAPPING_MODULE);
    const coolingMinutes = config_1.qikinkConfig.refreshCoolingTimeMinutes ?? 10;
    const threshold = new Date(Date.now() - coolingMinutes * 60 * 1000);
    const { mappings: toProcess, count: totalEligible } = await service.listMappingsForRefresh({
        take: limit,
        coolingThreshold: threshold,
    });
    const results = await runWithConcurrency(toProcess, concurrency, async (mapping) => {
        try {
            const order = await client.getOrder(accessToken, { id: mapping.qikink_order_id });
            const qikinkOrder = order;
            const status = qikinkOrder?.status ?? "";
            const hasAwb = Boolean(qikinkOrder?.awb && String(qikinkOrder.awb).trim() !== "") ||
                Boolean(qikinkOrder?.tracking_link && String(qikinkOrder.tracking_link).trim() !== "");
            const internalStatus = (0, qikink_order_status_map_1.qikinkStatusToInternal)(status, hasAwb, {
                qikinkOrderId: mapping.qikink_order_id,
            });
            await service.updateStatus(mapping.id, internalStatus);
            return 1;
        }
        catch {
            return 0;
        }
    });
    const updatedCount = results.filter((r) => r === 1).length;
    return {
        updated: updatedCount,
        processed: toProcess.length,
        total_eligible: totalEligible,
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicnVuLXFpa2luay1vcmRlci1yZWZyZXNoLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL3V0aWxzL3J1bi1xaWtpbmstb3JkZXItcmVmcmVzaC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUEwQkEsZ0RBWUM7QUFhRCw4REF3REM7QUExR0QscURBQXFFO0FBQ3JFLDREQUE2RDtBQUM3RCx1REFBOEU7QUFDOUUsdUVBQWtFO0FBQ2xFLCtEQUE0RDtBQXdHbkQscUdBeEdBLDBDQUFvQixPQXdHQTtBQXRHN0IsMEVBQTZFO0FBRzdFLHNDQUF3QztBQWF4Qzs7R0FFRztBQUNJLEtBQUssVUFBVSxrQkFBa0IsQ0FDdEMsS0FBVSxFQUNWLFdBQW1CLEVBQ25CLEVBQTJCO0lBRTNCLE1BQU0sT0FBTyxHQUFRLEVBQUUsQ0FBQTtJQUN2QixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDLElBQUksV0FBVyxFQUFFLENBQUM7UUFDbkQsTUFBTSxLQUFLLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFdBQVcsQ0FBQyxDQUFBO1FBQzdDLE1BQU0sWUFBWSxHQUFHLE1BQU0sT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUE7UUFDckQsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLFlBQVksQ0FBQyxDQUFBO0lBQy9CLENBQUM7SUFDRCxPQUFPLE9BQU8sQ0FBQTtBQUNoQixDQUFDO0FBRUQsTUFBTSxhQUFhLEdBQUcsR0FBRyxDQUFBO0FBQ3pCLE1BQU0sbUJBQW1CLEdBQUcsRUFBRSxDQUFBO0FBRTlCOzs7Ozs7O0dBT0c7QUFDSSxLQUFLLFVBQVUseUJBQXlCLENBQzdDLFNBQTBCLEVBQzFCLFVBQTRDLEVBQUU7SUFFOUMsTUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFD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