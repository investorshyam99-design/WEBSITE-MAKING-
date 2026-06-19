"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeQikinkOrderId = normalizeQikinkOrderId;
/**
 * Returns a normalized Qikink order id string from a list or single order response.
 * Handles both id and order_id from list vs get endpoints.
 */
function normalizeQikinkOrderId(order) {
    const raw = order?.id ?? order?.order_id;
    return raw != null ? String(raw) : "";
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicWlraW5rLWFwaS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy90eXBlcy9xaWtpbmstYXBpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBaUJBLHdEQUdDO0FBUEQ7OztHQUdHO0FBQ0gsU0FBZ0Isc0JBQXNCLENBQUMsS0FBMEI7SUFDL0QsTUFBTSxHQUFHLEdBQUcsS0FBSyxFQUFFLEVBQUUsSUFBSSxLQUFLLEVBQUUsUUFBUSxDQUFBO0lBQ3hDLE9BQU8sR0FBRyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUE7QUFDdkMsQ0FBQyJ9