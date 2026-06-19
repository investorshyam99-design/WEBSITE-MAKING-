"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@medusajs/framework/utils");
const index_1 = require("./index");
const qikink_product_mapping_1 = __importDefault(require("./models/qikink-product-mapping"));
class QikinkProductMappingModuleService extends (0, utils_1.MedusaService)({
    QikinkProductMapping: qikink_product_mapping_1.default,
}) {
    constructor(container) {
        super(container);
        this.manager_ = container.manager;
    }
    get moduleKey() {
        return index_1.QIKINK_PRODUCT_MAPPING_MODULE;
    }
    normalizeMapping(raw) {
        if (!raw ||
            typeof raw !== "object" ||
            !("id" in raw) ||
            !("qikink_sku_id" in raw) ||
            !("variant_id" in raw)) {
            throw new Error("Invalid qikink product mapping data");
        }
        const row = raw;
        const printTypeId = row.print_type_id != null
            ? typeof row.print_type_id === "number"
                ? row.print_type_id
                : Number(row.print_type_id)
            : 1;
        return {
            id: row.id,
            qikink_sku_id: row.qikink_sku_id,
            variant_id: row.variant_id,
            print_type_id: Number.isFinite(printTypeId) && printTypeId > 0 ? printTypeId : 1,
            created_at: new Date(row.created_at ?? new Date()),
            updated_at: new Date(row.updated_at ?? new Date()),
        };
    }
    async listMappings(selector = {}, config = {}) {
        const [mappings, count] = await this.listAndCountQikinkProductMappings(selector, config);
        return {
            mappings: mappings.map((m) => this.normalizeMapping(m)),
            count,
        };
    }
    async getMapping(id) {
        const mapping = await this.retrieveQikinkProductMapping(id);
        if (!mapping) {
            throw new utils_1.MedusaError(utils_1.MedusaError.Types.NOT_FOUND, `Qikink product mapping with id ${id} not found`);
        }
        return this.normalizeMapping(mapping);
    }
    async getMappingByQikinkSku(qikink_sku_id) {
        const [mappings] = await this.listAndCountQikinkProductMappings({ qikink_sku_id }, { take: 1 });
        const mapping = mappings[0];
        return mapping ? this.normalizeMapping(mapping) : null;
    }
    async getMappingByVariantId(variant_id) {
        const [mappings] = await this.listAndCountQikinkProductMappings({ variant_id }, { take: 1 });
        const mapping = mappings[0];
        return mapping ? this.normalizeMapping(mapping) : null;
    }
    async createMapping(input) {
        const existingBySku = await this.getMappingByQikinkSku(input.qikink_sku_id);
        if (existingBySku) {
            throw new utils_1.MedusaError(utils_1.MedusaError.Types.DUPLICATE_ERROR, `A mapping for qikink_sku_id "${input.qikink_sku_id}" already exists`);
        }
        const existingByVariant = await this.getMappingByVariantId(input.variant_id);
        if (existingByVariant) {
            throw new utils_1.MedusaError(utils_1.MedusaError.Types.DUPLICATE_ERROR, `A Qikink mapping for this variant already exists`);
        }
        const created = await this.createQikinkProductMappings({
            qikink_sku_id: input.qikink_sku_id,
            variant_id: input.variant_id,
            print_type_id: (input.print_type_id ?? 1),
        });
        return this.normalizeMapping(created);
    }
    async updateMapping(id, input) {
        await this.getMapping(id);
        if (input.qikink_sku_id !== undefined) {
            const existingBySku = await this.getMappingByQikinkSku(input.qikink_sku_id);
            if (existingBySku && existingBySku.id !== id) {
                throw new utils_1.MedusaError(utils_1.MedusaError.Types.DUPLICATE_ERROR, `A mapping for qikink_sku_id "${input.qikink_sku_id}" already exists`);
            }
        }
        const updateData = { id };
        if (input.qikink_sku_id !== undefined)
            updateData.qikink_sku_id = input.qikink_sku_id;
        if (input.print_type_id !== undefined) {
            updateData.print_type_id = input.print_type_id;
        }
        const updated = await this.updateQikinkProductMappings(updateData);
        return this.normalizeMapping(updated);
    }
    async deleteMapping(id) {
        await this.getMapping(id);
        await this.deleteQikinkProductMappings({ id });
    }
}
exports.default = QikinkProductMappingModuleService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9tb2R1bGVzL3Fpa2luay1wcm9kdWN0LW1hcHBpbmcvc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLHFEQUFzRTtBQUV0RSxtQ0FBdUQ7QUFDdkQsNkZBQWtFO0FBK0JsRSxNQUFxQixpQ0FBa0MsU0FBUSxJQUFBLHFCQUFhLEVBQUM7SUFDM0Usb0JBQW9CLEVBQXBCLGdDQUFvQjtDQUNyQixDQUFDO0lBR0EsWUFBWSxTQUErQjtRQUN6QyxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUE7UUFDaEIsSUFBSSxDQUFDLFFBQVEsR0FBRyxTQUFTLENBQUMsT0FBTyxDQUFBO0lBQ25DLENBQUM7SUFFRCxJQUFJLFNBQVM7UUFDWCxPQUFPLHFDQUE2QixDQUFBO0lBQ3RDLENBQUM7SUFFUyxnQkFBZ0IsQ0FBQyxHQUFZO1FBQ3JDLElBQ0UsQ0FBQyxHQUFHO1lBQ0osT0FBTyxHQUFHLEtBQUssUUFBUTtZQUN2QixDQUFDLENBQUMsSUFBSSxJQUFJLEdBQUcsQ0FBQztZQUNkLENBQUMsQ0FBQyxlQUFlLElBQUksR0FBRyxDQUFDO1lBQ3pCLENBQUMsQ0FBQyxZQUFZLElBQUksR0FBRyxDQUFDLEVBQ3RCLENBQUM7WUFDRCxNQUFNLElBQUksS0FBSyxDQUFDLHFDQUFxQyxDQUFDLENBQUE7UUFDeEQsQ0FBQztRQUNELE1BQU0sR0FBRyxHQUFHLEdBT1gsQ0FBQTtRQUNELE1BQU0sV0FBVyxHQUNmLEdBQUcsQ0FBQyxhQUFhLElBQUksSUFBSTtZQUN2QixDQUFDLENBQUMsT0FBTyxHQUFHLENBQUMsYUFBYSxLQUFLLFFBQVE7Z0JBQ3JDLENBQUMsQ0FBQyxHQUFHLENBQUMsYUFBYTtnQkFDbkIsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDO1lBQzdCLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDUCxPQUFPO1lBQ0ws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