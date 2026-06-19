"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminListQikinkProductMappingsSchema = exports.AdminUpdateQikinkProductMappingSchema = exports.AdminCreateQikinkProductMappingSchema = void 0;
const zod_1 = require("zod");
const print_types_1 = require("../../../constants/print-types");
const printTypeIdSchema = zod_1.z
    .number()
    .int()
    .refine((n) => print_types_1.PRINT_TYPE_IDS.includes(n), {
    message: `print_type_id must be one of: ${print_types_1.PRINT_TYPE_IDS.join(", ")}`,
});
const optionalPrintTypeId = zod_1.z.union([
    zod_1.z.undefined(),
    zod_1.z.coerce.number().int().pipe(printTypeIdSchema),
]);
exports.AdminCreateQikinkProductMappingSchema = zod_1.z.object({
    qikink_sku_id: zod_1.z.string().min(1, "qikink_sku_id is required"),
    variant_id: zod_1.z.string().min(1, "variant_id is required"),
    print_type_id: optionalPrintTypeId.optional(),
});
exports.AdminUpdateQikinkProductMappingSchema = zod_1.z.object({
    qikink_sku_id: zod_1.z.string().min(1).optional(),
    print_type_id: optionalPrintTypeId.optional(),
});
exports.AdminListQikinkProductMappingsSchema = zod_1.z.object({
    qikink_sku_id: zod_1.z.string().optional(),
    variant_id: zod_1.z.string().min(1).optional(),
    limit: zod_1.z.coerce.number().int().positive().max(100).default(20),
    offset: zod_1.z.coerce.number().int().nonnegative().default(0),
    order: zod_1.z.enum(["created_at", "updated_at", "qikink_sku_id"]).optional(),
    order_direction: zod_1.z.enum(["ASC", "DESC"]).default("DESC"),
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmFsaWRhdG9ycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9hcGkvYWRtaW4vcWlraW5rLXByb2R1Y3QtbWFwcGluZy92YWxpZGF0b3JzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLDZCQUF1QjtBQUN2QixnRUFBK0Q7QUFFL0QsTUFBTSxpQkFBaUIsR0FBRyxPQUFDO0tBQ3hCLE1BQU0sRUFBRTtLQUNSLEdBQUcsRUFBRTtLQUNMLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsNEJBQWMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLEVBQUU7SUFDekMsT0FBTyxFQUFFLGlDQUFpQyw0QkFBYyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRTtDQUN0RSxDQUFDLENBQUE7QUFFSixNQUFNLG1CQUFtQixHQUFHLE9BQUMsQ0FBQyxLQUFLLENBQUM7SUFDbEMsT0FBQyxDQUFDLFNBQVMsRUFBRTtJQUNiLE9BQUMsQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDO0NBQ2hELENBQUMsQ0FBQTtBQUVXLFFBQUEscUNBQXFDLEdBQUcsT0FBQyxDQUFDLE1BQU0sQ0FBQztJQUM1RCxhQUFhLEVBQUUsT0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsMkJBQTJCLENBQUM7SUFDN0QsVUFBVSxFQUFFLE9BQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLHdCQUF3QixDQUFDO0lBQ3ZELGFBQWEsRUFBRSxtQkFBbUIsQ0FBQyxRQUFRLEVBQUU7Q0FDOUMsQ0FBQyxDQUFBO0FBTVcsUUFBQSxxQ0FBcUMsR0FBRyxPQUFDLENBQUMsTUFBTSxDQUFDO0lBQzVELGFBQWEsRUFBRSxPQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRTtJQUMzQyxhQUFhLEVBQUUsbUJBQW1CLENBQUMsUUFBUSxFQUFFO0NBQzlDLENBQUMsQ0FBQTtBQU1XLFFBQUEsb0NBQW9DLEdBQUcsT0FBQyxDQUFDLE1BQU0sQ0FBQztJQUMzRCxhQUFhLEVBQUUsT0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLFFBQVEsRUFBRTtJQUNwQyxVQUFVLEVBQUUsT0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUU7SUFDeEMsS0FBSyxFQUFFLE9BQUMsQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUMsUUFBUSxFQUFFLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7SUFDOUQsTUFBTSxFQUFFLE9BQUMsQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUMsV0FBVyxFQUFFLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztJQUN4RCxLQUFLLEVBQUUsT0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLFlBQVksRUFBRSxZQUFZLEVBQUUsZUFBZSxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUU7SUFDdkUsZUFBZSxFQUFFLE9BQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDO0NBQ3pELENBQUMsQ0FBQSJ9