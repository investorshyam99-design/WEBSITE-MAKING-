"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
const utils_1 = require("@medusajs/framework/utils");
const qikink_order_mapping_1 = require("../../../modules/qikink-order-mapping");
const validators_1 = require("./validators");
/**
 * GET /store/qikink-order-mapping
 * List order mappings. Public (store + admin).
 */
async function GET(req, res) {
    try {
        const query = validators_1.ListQikinkOrderMappingsSchema.parse(req.query ?? {});
        const service = req.scope.resolve(qikink_order_mapping_1.QIKINK_ORDER_MAPPING_MODULE);
        const selector = {};
        if (query.qikink_order_id)
            selector.qikink_order_id = query.qikink_order_id;
        if (query.medusa_order_id)
            selector.medusa_order_id = query.medusa_order_id;
        if (query.status)
            selector.status = query.status;
        const order = {};
        if (query.order) {
            order[query.order] = query.order_direction ?? "DESC";
        }
        else {
            order.created_at = query.order_direction ?? "DESC";
        }
        const { mappings, count } = await service.listMappings(selector, {
            take: query.limit,
            skip: query.offset,
            order,
        });
        return res.status(200).json({
            mappings,
            count,
            offset: query.offset,
            limit: query.limit,
        });
    }
    catch (err) {
        if (err instanceof Error && err.name === "ZodError") {
            return res.status(400).json({
                message: "Invalid query parameters",
                errors: err.errors,
            });
        }
        if (err instanceof utils_1.MedusaError) {
            const status = err.type === utils_1.MedusaError.Types.NOT_FOUND ? 404 : 400;
            return res.status(status).json({ message: err.message, code: err.type });
        }
        const message = err instanceof Error ? err.message : "List mappings failed";
        return res.status(500).json({ message });
    }
}
// POST removed: order mappings are created internally by the order.placed subscriber when the order contains Qikink-mapped variants.
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL3N0b3JlL3Fpa2luay1vcmRlci1tYXBwaW5nL3JvdXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBVUEsa0JBOENDO0FBdkRELHFEQUF1RDtBQUN2RCxnRkFBbUY7QUFFbkYsNkNBQTREO0FBRTVEOzs7R0FHRztBQUNJLEtBQUssVUFBVSxHQUFHLENBQUMsR0FBa0IsRUFBRSxHQUFtQjtJQUMvRCxJQUFJLENBQUM7UUFDSCxNQUFNLEtBQUssR0FBRywwQ0FBNkIsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEtBQUssSUFBSSxFQUFFLENBQUMsQ0FBQTtRQUNsRSxNQUFNLE9BQU8sR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FDL0Isa0RBQTJCLENBQzVCLENBQUE7UUFFRCxNQUFNLFFBQVEsR0FBNEIsRUFBRSxDQUFBO1FBQzVDLElBQUksS0FBSyxDQUFDLGVBQWU7WUFBRSxRQUFRLENBQUMsZUFBZSxHQUFHLEtBQUssQ0FBQyxlQUFlLENBQUE7UUFDM0UsSUFBSSxLQUFLLENBQUMsZUFBZTtZQUFFLFFBQVEsQ0FBQyxlQUFlLEdBQUcsS0FBSyxDQUFDLGVBQWUsQ0FBQTtRQUMzRSxJQUFJLEtBQUssQ0FBQyxNQUFNO1lBQUUsUUFBUSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFBO1FBRWhELE1BQU0sS0FBSyxHQUEyQixFQUFFLENBQUE7UUFDeEMsSUFBSSxLQUFLLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDaEIsS0FBSyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxLQUFLLENBQUMsZUFBZSxJQUFJLE1BQU0sQ0FBQTtRQUN0RCxDQUFDO2FBQU0sQ0FBQztZQUNOLEtBQUssQ0FBQyxVQUFVLEdBQUcsS0FBSyxDQUFDLGVBQWUsSUFBSSxNQUFNLENBQUE7UUFDcEQsQ0FBQztRQUVELE1BQU0sRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLEdBQUcsTUFBTSxPQUFPLENBQUMsWUFBWSxDQUFDLFFBQVEsRUFBRTtZQUMvRCxJQUFJLEVBQUUsS0FBSyxDQUFDLEtBQUs7WUFDakIsSUFBSSxFQUFFLEtBQUssQ0FBQyxNQUFNO1lBQ2xCLEtBQUs7U0FDTixDQUFDLENBQUE7UUFFRixPQUFPLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDO1lBQzFCLFFBQVE7WUFDUixLQUFLO1lBQ0wsTUFBTSxFQUFFLEtBQUssQ0FBQyxNQUFNO1lBQ3BCLEtBQUssRUFBRSxLQUFLLENBQUMsS0FBSztTQUNuQixDQUFDLENBQUE7SUFDSixDQUFDO0lBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQztRQUNiLElBQUksR0FBRyxZQUFZLEtBQUssSUFBSSxHQUFHLENBQUMsSUFBSSxLQUFLLFVBQVUsRUFBRSxDQUFDO1lBQ3BELE9BQU8sR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUM7Z0JBQzFCLE9BQU8sRUFBRSwwQkFBMEI7Z0JBQ25DLE1BQU0sRUFBRyxHQUE4QixDQUFDLE1BQU07YUFDL0MsQ0FBQyxDQUFBO1FBQ0osQ0FBQztRQUNELElBQUksR0FBRyxZQUFZLG1CQUFXLEVBQUUsQ0FBQztZQUMvQixNQUFNLE1BQU0sR0FDVixHQUFHLENBQUMsSUFBSSxLQUFLLG1CQUFXLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUE7WUFDdEQsT0FBTyxHQUFHLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLE9BQU8sRUFBRSxHQUFHLENBQUMsT0FBTyxFQUFFLElBQUksRUFBRSxHQUFHLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQTtRQUMxRSxDQUFDO1FBQ0QsTUFBTSxPQUFPLEdBQUcsR0FBRyxZQUFZLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsc0JBQXNCLENBQUE7UUFDM0UsT0FBTyxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUE7SUFDMUMsQ0FBQztBQUNILENBQUM7QUFFRCxxSUFBcUkifQ==