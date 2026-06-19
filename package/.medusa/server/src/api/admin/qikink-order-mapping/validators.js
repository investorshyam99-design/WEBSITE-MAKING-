"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminListQikinkOrderMappingsSchema = void 0;
const zod_1 = require("zod");
exports.AdminListQikinkOrderMappingsSchema = zod_1.z.object({
    qikink_order_id: zod_1.z.string().optional(),
    medusa_order_id: zod_1.z.string().min(1).optional(),
    status: zod_1.z.string().optional(),
    limit: zod_1.z.coerce.number().int().positive().max(100).default(20),
    offset: zod_1.z.coerce.number().int().nonnegative().default(0),
    order: zod_1.z.enum(["created_at", "updated_at", "qikink_order_id", "status"]).optional(),
    order_direction: zod_1.z.enum(["ASC", "DESC"]).default("DESC"),
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmFsaWRhdG9ycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9hcGkvYWRtaW4vcWlraW5rLW9yZGVyLW1hcHBpbmcvdmFsaWRhdG9ycy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSw2QkFBdUI7QUFFVixRQUFBLGtDQUFrQyxHQUFHLE9BQUMsQ0FBQyxNQUFNLENBQUM7SUFDekQsZUFBZSxFQUFFLE9BQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxRQUFRLEVBQUU7SUFDdEMsZUFBZSxFQUFFLE9BQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFO0lBQzdDLE1BQU0sRUFBRSxPQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsUUFBUSxFQUFFO0lBQzdCLEtBQUssRUFBRSxPQUFDLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDLFFBQVEsRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDO0lBQzlELE1BQU0sRUFBRSxPQUFDLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDLFdBQVcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7SUFDeEQsS0FBSyxFQUFFLE9BQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxZQUFZLEVBQUUsWUFBWSxFQUFFLGlCQUFpQixFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFO0lBQ25GLGVBQWUsRUFBRSxPQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQztDQUN6RCxDQUFDLENBQUEifQ==