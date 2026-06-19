"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
exports.POST = POST;
const utils_1 = require("@medusajs/framework/utils");
const qikink_product_mapping_1 = require("../../../modules/qikink-product-mapping");
const validators_1 = require("./validators");
/**
 * GET /admin/qikink-product-mapping
 * List product mappings with optional filters. Admin only.
 */
async function GET(req, res) {
    try {
        const query = validators_1.AdminListQikinkProductMappingsSchema.parse(req.query ?? {});
        const service = req.scope.resolve(qikink_product_mapping_1.QIKINK_PRODUCT_MAPPING_MODULE);
        const selector = {};
        if (query.qikink_sku_id)
            selector.qikink_sku_id = query.qikink_sku_id;
        if (query.variant_id)
            selector.variant_id = query.variant_id;
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
            const status = err.type === utils_1.MedusaError.Types.NOT_FOUND
                ? 404
                : err.type === utils_1.MedusaError.Types.DUPLICATE_ERROR
                    ? 409
                    : 400;
            return res.status(status).json({ message: err.message, code: err.type });
        }
        const message = err instanceof Error ? err.message : "List mappings failed";
        return res.status(500).json({ message });
    }
}
/**
 * POST /admin/qikink-product-mapping
 * Create a product mapping. Admin only.
 */
async function POST(req, res) {
    try {
        const body = validators_1.AdminCreateQikinkProductMappingSchema.parse(req.body ?? {});
        const service = req.scope.resolve(qikink_product_mapping_1.QIKINK_PRODUCT_MAPPING_MODULE);
        const mapping = await service.createMapping({
            qikink_sku_id: body.qikink_sku_id,
            variant_id: body.variant_id,
            ...(body.print_type_id != null && { print_type_id: body.print_type_id }),
        });
        return res.status(201).json({ mapping });
    }
    catch (err) {
        if (err instanceof Error && err.name === "ZodError") {
            return res.status(400).json({
                message: "Invalid request body",
                errors: err.errors,
            });
        }
        if (err instanceof utils_1.MedusaError) {
            const status = err.type === utils_1.MedusaError.Types.DUPLICATE_ERROR ? 409 : 400;
            return res.status(status).json({ message: err.message, code: err.type });
        }
        const message = err instanceof Error ? err.message : "Create mapping failed";
        return res.status(500).json({ message });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL2FkbWluL3Fpa2luay1wcm9kdWN0LW1hcHBpbmcvcm91dGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFhQSxrQkFpREM7QUFNRCxvQkE2QkM7QUFoR0QscURBQXVEO0FBQ3ZELG9GQUF1RjtBQUV2Riw2Q0FHcUI7QUFFckI7OztHQUdHO0FBQ0ksS0FBSyxVQUFVLEdBQUcsQ0FBQyxHQUFrQixFQUFFLEdBQW1CO0lBQy9ELElBQUksQ0FBQztRQUNILE1BQU0sS0FBSyxHQUFHLGlEQUFvQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsS0FBSyxJQUFJLEVBQUUsQ0FBQyxDQUFBO1FBQ3pFLE1BQU0sT0FBTyxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUMvQixzREFBNkIsQ0FDOUIsQ0FBQTtRQUVELE1BQU0sUUFBUSxHQUE0QixFQUFFLENBQUE7UUFDNUMsSUFBSSxLQUFLLENBQUMsYUFBYTtZQUFFLFFBQVEsQ0FBQyxhQUFhLEdBQUcsS0FBSyxDQUFDLGFBQWEsQ0FBQTtRQUNyRSxJQUFJLEtBQUssQ0FBQyxVQUFVO1lBQUUsUUFBUSxDQUFDLFVBQVUsR0FBRyxLQUFLLENBQUMsVUFBVSxDQUFBO1FBRTVELE1BQU0sS0FBSyxHQUEyQixFQUFFLENBQUE7UUFDeEMsSUFBSSxLQUFLLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDaEIsS0FBSyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxLQUFLLENBQUMsZUFBZSxJQUFJLE1BQU0sQ0FBQTtRQUN0RCxDQUFDO2FBQU0sQ0FBQztZQUNOLEtBQUssQ0FBQyxVQUFVLEdBQUcsS0FBSyxDQUFDLGVBQWUsSUFBSSxNQUFNLENBQUE7UUFDcEQsQ0FBQztRQUVELE1BQU0sRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLEdBQUcsTUFBTSxPQUFPLENBQUMsWUFBWSxDQUFDLFFBQVEs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O1FBQ0QsSUFBSSxHQUFHLFlBQVksbUJBQVcsRUFBRSxDQUFDO1lBQy9CLE1BQU0sTUFBTSxHQUNWLEdBQUcsQ0FBQyxJQUFJLEtBQUssbUJBQVcsQ0FBQyxLQUFLLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQTtZQUM1RCxPQUFPLEdBQUcsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsT0FBTyxFQUFFLEdBQUcsQ0FBQyxPQUFPLEVBQUUsSUFBSSxFQUFFLEdBQUcsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFBO1FBQzFFLENBQUM7UUFDRCxNQUFNLE9BQU8sR0FBRyxHQUFHLFlBQVksS0FBSyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyx1QkFBdUIsQ0FBQTtRQUM1RSxPQUFPLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQTtJQUMxQyxDQUFDO0FBQ0gsQ0FBQyJ9