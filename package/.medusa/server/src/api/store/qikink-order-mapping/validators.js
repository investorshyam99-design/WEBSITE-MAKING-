"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListQikinkOrderMappingsSchema = exports.UpdateQikinkOrderMappingStatusSchema = exports.CreateQikinkOrderMappingSchema = void 0;
const zod_1 = require("zod");
exports.CreateQikinkOrderMappingSchema = zod_1.z.object({
    qikink_order_id: zod_1.z.string().min(1, "qikink_order_id is required"),
    medusa_order_id: zod_1.z.string().uuid("medusa_order_id must be a valid UUID"),
    status: zod_1.z.string().min(1, "status is required"),
});
exports.UpdateQikinkOrderMappingStatusSchema = zod_1.z.object({
    status: zod_1.z.string().min(1, "status is required"),
});
exports.ListQikinkOrderMappingsSchema = zod_1.z.object({
    qikink_order_id: zod_1.z.string().optional(),
    medusa_order_id: zod_1.z.string().uuid().optional(),
    status: zod_1.z.string().optional(),
    limit: zod_1.z.coerce.number().int().positive().max(100).default(20),
    offset: zod_1.z.coerce.number().int().nonnegative().default(0),
    order: zod_1.z.enum(["created_at", "updated_at", "qikink_order_id", "status"]).optional(),
    order_direction: zod_1.z.enum(["ASC", "DESC"]).default("DESC"),
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmFsaWRhdG9ycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9hcGkvc3RvcmUvcWlraW5rLW9yZGVyLW1hcHBpbmcvdmFsaWRhdG9ycy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSw2QkFBdUI7QUFFVixRQUFBLDhCQUE4QixHQUFHLE9BQUMsQ0FBQyxNQUFNLENBQUM7SUFDckQsZUFBZSxFQUFFLE9BQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLDZCQUE2QixDQUFDO0lBQ2pFLGVBQWUsRUFBRSxPQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsSUFBSSxDQUFDLHNDQUFzQyxDQUFDO0lBQ3hFLE1BQU0sRUFBRSxPQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxvQkFBb0IsQ0FBQztDQUNoRCxDQUFDLENBQUE7QUFNVyxRQUFBLG9DQUFvQyxHQUFHLE9BQUMsQ0FBQyxNQUFNLENBQUM7SUFDM0QsTUFBTSxFQUFFLE9BQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLG9CQUFvQixDQUFDO0NBQ2hELENBQUMsQ0FBQTtBQU1XLFFBQUEsNkJBQTZCLEdBQUcsT0FBQyxDQUFDLE1BQU0sQ0FBQztJQUNwRCxlQUFlLEVBQUUsT0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLFFBQVEsRUFBRTtJQUN0QyxlQUFlLEVBQUUsT0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLElBQUksRUFBRSxDQUFDLFFBQVEsRUFBRTtJQUM3QyxNQUFNLEVBQUUsT0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLFFBQVEsRUFBRTtJQUM3QixLQUFLLEVBQUUsT0FBQyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQztJQUM5RCxNQUFNLEVBQUUsT0FBQyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO0lBQ3hELEtBQUssRUFBRSxPQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsWUFBWSxFQUFFLFlBQVksRUFBRSxpQkFBaUIsRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRTtJQUNuRixlQUFlLEVBQUUsT0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUM7Q0FDekQsQ0FBQyxDQUFBIn0=