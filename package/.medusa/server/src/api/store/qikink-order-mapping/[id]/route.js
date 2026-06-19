"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
const utils_1 = require("@medusajs/framework/utils");
const qikink_order_mapping_1 = require("../../../../modules/qikink-order-mapping");
/**
 * GET /store/qikink-order-mapping/:id
 * Get a single order mapping by ID. Public (store + admin).
 */
async function GET(req, res) {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ message: "Missing id" });
    }
    try {
        const service = req.scope.resolve(qikink_order_mapping_1.QIKINK_ORDER_MAPPING_MODULE);
        const mapping = await service.getMapping(id);
        return res.status(200).json({ mapping });
    }
    catch (err) {
        if (err instanceof utils_1.MedusaError && err.type === utils_1.MedusaError.Types.NOT_FOUND) {
            return res.status(404).json({ message: err.message, code: err.type });
        }
        const message = err instanceof Error ? err.message : "Get mapping failed";
        return res.status(500).json({ message });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL3N0b3JlL3Fpa2luay1vcmRlci1tYXBwaW5nL1tpZF0vcm91dGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFTQSxrQkFrQkM7QUExQkQscURBQXVEO0FBQ3ZELG1GQUFzRjtBQUd0Rjs7O0dBR0c7QUFDSSxLQUFLLFVBQVUsR0FBRyxDQUFDLEdBQWtCLEVBQUUsR0FBbUI7SUFDL0QsTUFBTSxFQUFFLEVBQUUsRUFBRSxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUE7SUFDekIsSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFDO1FBQ1IsT0FBTyxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLE9BQU8sRUFBRSxZQUFZLEVBQUUsQ0FBQyxDQUFBO0lBQ3hELENBQUM7SUFDRCxJQUFJLENBQUM7UUFDSCxNQUFNLE9BQU8sR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FDL0Isa0RBQTJCLENBQzVCLENBQUE7UUFDRCxNQUFNLE9BQU8sR0FBRyxNQUFNLE9BQU8sQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLENBQUE7UUFDNUMsT0FBTyxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUE7SUFDMUMsQ0FBQztJQUFDLE9BQU8sR0FBRyxFQUFFLENBQUM7UUFDYixJQUFJLEdBQUcsWUFBWSxtQkFBVyxJQUFJLEdBQUcsQ0FBQyxJQUFJLEtBQUssbUJBQVcsQ0FBQyxLQUFLLENBQUMsU0FBUyxFQUFFLENBQUM7WUFDM0UsT0FBTyxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLE9BQU8sRUFBRSxHQUFHLENBQUMsT0FBTyxFQUFFLElBQUksRUFBRSxHQUFHLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQTtRQUN2RSxDQUFDO1FBQ0QsTUFBTSxPQUFPLEdBQUcsR0FBRyxZQUFZLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsb0JBQW9CLENBQUE7UUFDekUsT0FBTyxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUE7SUFDMUMsQ0FBQztBQUNILENBQUMifQ==