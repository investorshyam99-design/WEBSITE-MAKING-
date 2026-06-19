"use strict";
/**
 * In-memory rate limiter for Qikink API: max N requests per 60-second window.
 * Used by the Qikink client so all outbound calls share the same window.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.QikinkRateLimitError = void 0;
exports.checkAndRecordRateLimit = checkAndRecordRateLimit;
exports.resetRateLimitStateForTesting = resetRateLimitStateForTesting;
const WINDOW_MS = 60 * 1000;
const timestamps = [];
class QikinkRateLimitError extends Error {
    constructor(limit, messageOrSecondsRemaining) {
        const seconds = typeof messageOrSecondsRemaining === "number"
            ? messageOrSecondsRemaining
            : 60;
        const message = typeof messageOrSecondsRemaining === "string"
            ? messageOrSecondsRemaining
            : `Rate limit exceeded. Try again later. You can access api ${limit} times per minute. Please try again after ${seconds} seconds.`;
        super(message);
        this.limit = limit;
        this.name = "QikinkRateLimitError";
        Object.setPrototypeOf(this, QikinkRateLimitError.prototype);
    }
}
exports.QikinkRateLimitError = QikinkRateLimitError;
/**
 * Check if a request is allowed under the given limit (per minute), then record it.
 * If limit is 0, no limit is applied.
 * @throws QikinkRateLimitError when the limit is exceeded
 */
function checkAndRecordRateLimit(limit) {
    if (limit <= 0)
        return;
    const now = Date.now();
    const cutoff = now - WINDOW_MS;
    while (timestamps.length > 0 && timestamps[0] < cutoff) {
        timestamps.shift();
    }
    if (timestamps.length >= limit) {
        const oldest = timestamps[0];
        const secondsRemaining = Math.max(1, Math.ceil((oldest + WINDOW_MS - now) / 1000));
        throw new QikinkRateLimitError(limit, secondsRemaining);
    }
    timestamps.push(now);
}
/**
 * Reset rate limit state. Only for use in tests (so the shared timestamps array does not leak between tests).
 */
function resetRateLimitStateForTesting() {
    timestamps.length = 0;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicWlraW5rLXJhdGUtbGltaXRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy91dGlscy9xaWtpbmstcmF0ZS1saW1pdGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7O0dBR0c7OztBQThCSCwwREFtQkM7QUFLRCxzRUFFQztBQXRERCxNQUFNLFNBQVMsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFBO0FBRTNCLE1BQU0sVUFBVSxHQUFhLEVBQUUsQ0FBQTtBQUUvQixNQUFhLG9CQUFxQixTQUFRLEtBQUs7SUFDN0MsWUFDa0IsS0FBYSxFQUM3Qix5QkFBMkM7UUFFM0MsTUFBTSxPQUFPLEdBQ1gsT0FBTyx5QkFBeUIsS0FBSyxRQUFRO1lBQzNDLENBQUMsQ0FBQyx5QkFBeUI7WUFDM0IsQ0FBQyxDQUFDLEVBQUUsQ0FBQTtRQUNSLE1BQU0sT0FBTyxHQUNYLE9BQU8seUJBQXlCLEtBQUssUUFBUTtZQUMzQyxDQUFDLENBQUMseUJBQXlCO1lBQzNCLENBQUMsQ0FBQyw0REFBNEQsS0FBSyw2Q0FBNkMsT0FBTyxXQUFXLENBQUE7UUFDdEksS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFBO1FBWEUsVUFBSyxHQUFMLEtBQUssQ0FBUTtRQVk3QixJQUFJLENBQUMsSUFBSSxHQUFHLHNCQUFzQixDQUFBO1FBQ2xDLE1BQU0sQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLG9CQUFvQixDQUFDLFNBQVMsQ0FBQyxDQUFBO0lBQzdELENBQUM7Q0FDRjtBQWpCRCxvREFpQkM7QUFFRDs7OztHQUlHO0FBQ0gsU0FBZ0IsdUJBQXVCLENBQUMsS0FBYTtJQUNuRCxJQUFJLEtBQUssSUFBSSxDQUFDO1FBQUUsT0FBTTtJQUV0QixNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUE7SUFDdEIsTUFBTSxNQUFNLEdBQUcsR0FBRyxHQUFHLFNBQVMsQ0FBQTtJQUM5QixPQUFPLFVBQVUsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxJQUFJLFVBQVUsQ0FBQyxDQUFDLENBQUMsR0FBRyxNQUFNLEVBQUUsQ0FBQztRQUN2RCxVQUFVLENBQUMsS0FBSyxFQUFFLENBQUE7SUFDcEIsQ0FBQztJQUVELElBQUksVUFBVSxDQUFDLE1BQU0sSUFBSSxLQUFLLEVBQUUsQ0FBQztRQUMvQixNQUFNLE1BQU0sR0FBRyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDNUIsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUMvQixDQUFDLEVBQ0QsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLE1BQU0sR0FBRyxTQUFTLEdBQUcsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQzdDLENBQUE7UUFDRCxNQUFNLElBQUksb0JBQW9CLENBQUMsS0FBSyxFQUFFLGdCQUFnQixDQUFDLENBQUE7SUFDekQsQ0FBQztJQUVELFVBQVUsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUE7QUFDdEIsQ0FBQztBQUVEOztHQUVHO0FBQ0gsU0FBZ0IsNkJBQTZCO0lBQzNDLFVBQVUsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFBO0FBQ3ZCLENBQUMifQ==