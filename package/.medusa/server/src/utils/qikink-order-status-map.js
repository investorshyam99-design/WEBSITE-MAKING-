"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TERMINAL_ORDER_STATUSES = void 0;
exports.isTerminalStatus = isTerminalStatus;
exports.qikinkStatusToInternal = qikinkStatusToInternal;
const UNKNOWN_STATUS_FALLBACK = "pending_review";
/**
 * Statuses that do not change after being set; refresh will skip mappings in these statuses.
 */
exports.TERMINAL_ORDER_STATUSES = [
    "completed",
    "canceled",
    "returned",
];
/**
 * Returns true if the given internal status is terminal (completed, canceled, returned).
 */
function isTerminalStatus(status) {
    const normalized = (status ?? "").trim().toLowerCase();
    return exports.TERMINAL_ORDER_STATUSES.includes(normalized);
}
/**
 * Qikink status (normalized lower-case) -> internal status.
 * Covers: On Hold, Pending, In Production, Ready to Ship, Shipped, Delivered,
 * Cancelled, Rejected, RTO Initiated, RTO Delivered, Failed Delivery.
 */
const QIKINK_TO_INTERNAL = {
    "on hold": "pending_review",
    "pending": "confirmed",
    "in production": "processing",
    "ready to ship": "fulfilled_pending_pickup",
    "shipped": "fulfilled",
    "delivered": "completed",
    "cancelled": "canceled",
    "canceled": "canceled",
    "rejected": "canceled",
    "rto initiated": "return_in_progress",
    "rto delivered": "returned",
    "failed delivery": "failed_delivery",
};
/**
 * Normalizes a raw Qikink status string for lookup (trim + lower case).
 */
function normalizeQikinkStatus(raw) {
    return (raw ?? "").trim().toLowerCase();
}
/**
 * Maps a Qikink API status string to internal order status.
 * - Uses case-insensitive lookup.
 * - If hasAwb is true and status suggests "ready to ship" or similar, returns "fulfilled" for shipping confirmation.
 * - Unknown statuses are logged (if logger provided) and mapped to pending_review.
 *
 * @param qikinkStatus - Raw status from Qikink API (e.g. "On Hold", "Shipped")
 * @param hasAwb - Whether AWB is present; when true, can upgrade to fulfilled for shipped state
 * @param options - Optional logger and qikink_order_id for unknown-status logging
 * @returns Internal status for qikink_order_mapping.status
 */
function qikinkStatusToInternal(qikinkStatus, hasAwb, options) {
    const normalized = normalizeQikinkStatus(qikinkStatus);
    if (!normalized) {
        return UNKNOWN_STATUS_FALLBACK;
    }
    let internal = QIKINK_TO_INTERNAL[normalized];
    if (internal === undefined) {
        const meta = { qikinkStatus: qikinkStatus.trim() };
        if (options?.qikinkOrderId != null)
            meta.qikink_order_id = options.qikinkOrderId;
        if (options?.logger) {
            options.logger.warn("[Qikink] Unknown order status; using fallback", meta);
        }
        return UNKNOWN_STATUS_FALLBACK;
    }
    // If AWB is present and we're in a "ready to ship" state, treat as fulfilled (shipping confirmed)
    if (hasAwb && internal === "fulfilled_pending_pickup") {
        return "fulfilled";
    }
    return internal;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicWlraW5rLW9yZGVyLXN0YXR1cy1tYXAuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvdXRpbHMvcWlraW5rLW9yZGVyLXN0YXR1cy1tYXAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBOEJBLDRDQUdDO0FBK0NELHdEQTBCQztBQTFGRCxNQUFNLHVCQUF1QixHQUF3QixnQkFBZ0IsQ0FBQTtBQUVyRTs7R0FFRztBQUNVLFFBQUEsdUJBQXVCLEdBQTBCO0lBQzVELFdBQVc7SUFDWCxVQUFVO0lBQ1YsVUFBVTtDQUNYLENBQUE7QUFFRDs7R0FFRztBQUNILFNBQWdCLGdCQUFnQixDQUFDLE1BQWM7SUFDN0MsTUFBTSxVQUFVLEdBQUcsQ0FBQyxNQUFNLElBQUksRUFBRSxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsV0FBVyxFQUFFLENBQUE7SUFDdEQsT0FBUSwrQkFBb0MsQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLENBQUE7QUFDbkUsQ0FBQztBQUVEOzs7O0dBSUc7QUFDSCxNQUFNLGtCQUFrQixHQUF3QztJQUM5RCxTQUFTLEVBQUUsZ0JBQWdCO0lBQzNCLFNBQVMsRUFBRSxXQUFXO0lBQ3RCLGVBQWUsRUFBRSxZQUFZO0lBQzdCLGVBQWUsRUFBRSwwQkFBMEI7SUFDM0MsU0FBUyxFQUFFLFdBQVc7SUFDdEIsV0FBVyxFQUFFLFdBQVc7SUFDeEIsV0FBVyxFQUFFLFVBQVU7SUFDdkIsVUFBVSxFQUFFLFVBQVU7SUFDdEIsVUFBVSxFQUFFLFVBQVU7SUFDdEIsZUFBZSxFQUFFLG9CQUFvQjtJQUNyQyxlQUFlLEVBQUUsVUFBVTtJQUMzQixpQkFBaUIsRUFBRSxpQkFBaUI7Q0FDckMsQ0FBQTtBQUVEOztHQUVHO0FBQ0gsU0FBUyxxQkFBcUIsQ0FBQyxHQUFXO0lBQ3hDLE9BQU8sQ0FBQyxHQUFHLElBQUksRUFBRSxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsV0FBVyxFQUFFLENBQUE7QUFDekMsQ0FBQztBQVNEOzs7Ozs7Ozs7O0dBVUc7QUFDSCxTQUFnQixzQkFBc0IsQ0FDcEMsWUFBb0IsRUFDcEIsTUFBZ0IsRUFDaEIsT0FBbUM7SUFFbkMsTUFBTSxVQUFVLEdBQUcscUJBQXFCLENBQUMsWUFBWSxDQUFDLENBQUE7SUFDdEQsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO1FBQ2hCLE9BQU8sdUJBQXVCLENBQUE7SUFDaEMsQ0FBQztJQUVELElBQUksUUFBUSxHQUFHLGtCQUFrQixDQUFDLFVBQVUsQ0FBQyxDQUFBO0lBQzdDLElBQUksUUFBUSxLQUFLLFNBQVMsRUFBRSxDQUFDO1FBQzNCLE1BQU0sSUFBSSxHQUE0QixFQUFFLFlBQVksRUFBRSxZQUFZLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQTtRQUMzRSxJQUFJLE9BQU8sRUFBRSxhQUFhLElBQUksSUFBSTtZQUFFLElBQUksQ0FBQyxlQUFlLEdBQUcsT0FBTyxDQUFDLGFBQWEsQ0FBQTtRQUNoRixJQUFJLE9BQU8sRUFBRSxNQUFNLEVBQUUsQ0FBQztZQUNwQixPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQywrQ0FBK0MsRUFBRSxJQUFJLENBQUMsQ0FBQTtRQUM1RSxDQUFDO1FBQ0QsT0FBTyx1QkFBdUIsQ0FBQTtJQUNoQyxDQUFDO0lBRUQsa0dBQWtHO0lBQ2xHLElBQUksTUFBTSxJQUFJLFFBQVEsS0FBSywwQkFBMEIsRUFBRSxDQUFDO1FBQ3RELE9BQU8sV0FBVyxDQUFBO0lBQ3BCLENBQUM7SUFFRCxPQUFPLFFBQVEsQ0FBQTtBQUNqQixDQUFDIn0=