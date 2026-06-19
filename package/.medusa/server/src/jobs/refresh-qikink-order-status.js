"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
exports.default = refreshQikinkOrderStatusJob;
const run_qikink_order_refresh_1 = require("../utils/run-qikink-order-refresh");
const config_1 = require("../config");
const DEFAULT_LIMIT = 500;
const DEFAULT_CONCURRENCY = 20;
async function refreshQikinkOrderStatusJob(container) {
    try {
        const result = await (0, run_qikink_order_refresh_1.runBulkOrderStatusRefresh)(container, {
            limit: DEFAULT_LIMIT,
            concurrency: DEFAULT_CONCURRENCY,
        });
        try {
            const logger = container.resolve("logger");
            if (logger?.info) {
                logger.info(`Qikink refresh order status: updated ${result.updated}, processed ${result.processed}, total_eligible ${result.total_eligible}`);
            }
        }
        catch {
            // Logger not available, skip
        }
    }
    catch (err) {
        try {
            const logger = container.resolve("logger");
            if (logger?.error) {
                logger.error("Qikink refresh order status job failed", err instanceof Error ? { message: err.message, stack: err.stack } : err);
            }
        }
        catch {
            // Logger not available
        }
        throw err;
    }
}
exports.config = {
    name: "qikink-refresh-order-status",
    schedule: (0, config_1.getRefreshCronSchedule)(),
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVmcmVzaC1xaWtpbmstb3JkZXItc3RhdHVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2pvYnMvcmVmcmVzaC1xaWtpbmstb3JkZXItc3RhdHVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQU9BLDhDQThCQztBQXBDRCxnRkFBNkU7QUFDN0Usc0NBQWtEO0FBRWxELE1BQU0sYUFBYSxHQUFHLEdBQUcsQ0FBQTtBQUN6QixNQUFNLG1CQUFtQixHQUFHLEVBQUUsQ0FBQTtBQUVmLEtBQUssVUFBVSwyQkFBMkIsQ0FBQyxTQUEwQjtJQUNsRixJQUFJLENBQUM7UUFDSCxNQUFNLE1BQU0sR0FBRyxNQUFNLElBQUEsb0RBQXlCLEVBQUMsU0FBUyxFQUFFO1lBQ3hELEtBQUssRUFBRSxhQUFhO1lBQ3BCLFdBQVcsRUFBRSxtQkFBbUI7U0FDakMsQ0FBQyxDQUFBO1FBQ0YsSUFBSSxDQUFDO1lBQ0gsTUFBTSxNQUFNLEdBQUcsU0FBUyxDQUFDLE9BQU8sQ0FBbUMsUUFBUSxDQUFDLENBQUE7WUFDNUUsSUFBSSxNQUFNLEVBQUUsSUFBSSxFQUFFLENBQUM7Z0JBQ2pCLE1BQU0sQ0FBQyxJQUFJLENBQ1Qsd0NBQXdDLE1BQU0sQ0FBQyxPQUFPLGVBQWUsTUFBTSxDQUFDLFNBQVMsb0JBQW9CLE1BQU0sQ0FBQyxjQUFjLEVBQUUsQ0FDakksQ0FBQTtZQUNILENBQUM7UUFDSCxDQUFDO1FBQUMsTUFBTSxDQUFDO1lBQ1AsNkJBQTZCO1FBQy9CLENBQUM7SUFDSCxDQUFDO0lBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQztRQUNiLElBQUksQ0FBQztZQUNILE1BQU0sTUFBTSxHQUFHLFNBQVMsQ0FBQyxPQUFPLENBQW9ELFFBQVEsQ0FBQyxDQUFBO1lBQzdGLElBQUksTUFBTSxFQUFFLEtBQUssRUFBRSxDQUFDO2dCQUNsQixNQUFNLENBQUMsS0FBSyxDQUNWLHdDQUF3QyxFQUN4QyxHQUFHLFlBQVksS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLE9BQU8sRUFBRSxHQUFHLENBQUMsT0FBTyxFQUFFLEtBQUssRUFBRSxHQUFHLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FDeEUsQ0FBQTtZQUNILENBQUM7UUFDSCxDQUFDO1FBQUMsTUFBTSxDQUFDO1lBQ1AsdUJBQXVCO1FBQ3pCLENBQUM7UUFDRCxNQUFNLEdBQUcsQ0FBQTtJQUNYLENBQUM7QUFDSCxDQUFDO0FBRVksUUFBQSxNQUFNLEdBQUc7SUFDcEIsSUFBSSxFQUFFLDZCQUE2QjtJQUNuQyxRQUFRLEVBQUUsSUFBQSwrQkFBc0IsR0FBRTtDQUNuQyxDQUFBIn0=