"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@medusajs/framework/utils");
const index_1 = require("./index");
const qikink_order_mapping_1 = __importDefault(require("./models/qikink-order-mapping"));
const qikink_order_status_map_1 = require("../../utils/qikink-order-status-map");
class QikinkOrderMappingModuleService extends (0, utils_1.MedusaService)({
    QikinkOrderMapping: qikink_order_mapping_1.default,
}) {
    constructor(container) {
        super(container);
        this.manager_ = container.manager;
    }
    get moduleKey() {
        return index_1.QIKINK_ORDER_MAPPING_MODULE;
    }
    normalizeMapping(raw) {
        if (!raw ||
            typeof raw !== "object" ||
            !("id" in raw) ||
            !("qikink_order_id" in raw) ||
            !("medusa_order_id" in raw) ||
            !("status" in raw)) {
            throw new Error("Invalid qikink order mapping data");
        }
        const row = raw;
        return {
            id: row.id,
            qikink_order_id: row.qikink_order_id,
            medusa_order_id: row.medusa_order_id,
            status: row.status,
            created_at: new Date(row.created_at ?? new Date()),
            updated_at: new Date(row.updated_at ?? new Date()),
        };
    }
    async listMappings(selector = {}, config = {}) {
        const [mappings, count] = await this.listAndCountQikinkOrderMappings(selector, config);
        return {
            mappings: mappings.map((m) => this.normalizeMapping(m)),
            count,
        };
    }
    /**
     * List mappings whose status is not terminal (completed, canceled, returned), for refresh.
     * When coolingThreshold is provided, only mappings with updated_at <= threshold are returned (DB-level filter).
     */
    async listMappingsForRefresh(config = {}) {
        const take = config.take ?? 500;
        const selector = {};
        if (config.coolingThreshold != null) {
            selector.updated_at = { $lte: config.coolingThreshold };
        }
        const [allMappings] = await this.listAndCountQikinkOrderMappings(selector, { take: Math.min(take * 5, 5000), skip: 0, order: { updated_at: "ASC" } });
        const normalized = allMappings.map((m) => this.normalizeMapping(m));
        const nonTerminal = normalized.filter((m) => !(0, qikink_order_status_map_1.isTerminalStatus)(m.status));
        const mappings = nonTerminal.slice(0, take);
        return { mappings, count: mappings.length };
    }
    async getMapping(id) {
        const mapping = await this.retrieveQikinkOrderMapping(id);
        if (!mapping) {
            throw new utils_1.MedusaError(utils_1.MedusaError.Types.NOT_FOUND, `Qikink order mapping with id ${id} not found`);
        }
        return this.normalizeMapping(mapping);
    }
    async getMappingByQikinkOrderId(qikink_order_id) {
        const [mappings] = await this.listAndCountQikinkOrderMappings({ qikink_order_id }, { take: 1 });
        const mapping = mappings[0];
        return mapping ? this.normalizeMapping(mapping) : null;
    }
    async createMapping(input) {
        const existing = await this.getMappingByQikinkOrderId(input.qikink_order_id);
        if (existing) {
            throw new utils_1.MedusaError(utils_1.MedusaError.Types.DUPLICATE_ERROR, `A mapping for qikink_order_id "${input.qikink_order_id}" already exists`);
        }
        const created = await this.createQikinkOrderMappings(input);
        const mapping = Array.isArray(created) ? created[0] : created;
        return this.normalizeMapping(mapping);
    }
    async updateStatus(id, status) {
        await this.getMapping(id);
        await this.updateQikinkOrderMappings({
            selector: { id },
            data: { status },
        });
        return this.getMapping(id);
    }
    async updateStatusByQikinkOrderId(qikink_order_id, status) {
        const mapping = await this.getMappingByQikinkOrderId(qikink_order_id);
        if (!mapping)
            return null;
        return this.updateStatus(mapping.id, status);
    }
}
exports.default = QikinkOrderMappingModuleService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9tb2R1bGVzL3Fpa2luay1vcmRlci1tYXBwaW5nL3NlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSxxREFBc0U7QUFFdEUsbUNBQXFEO0FBQ3JELHlGQUE4RDtBQUM5RCxpRkFBc0U7QUE2QnRFLE1BQXFCLCtCQUFnQyxTQUFRLElBQUEscUJBQWEsRUFBQztJQUN6RSxrQkFBa0IsRUFBbEIsOEJBQWtCO0NBQ25CLENBQUM7SUFHQSxZQUFZLFNBQStCO1FBQ3pDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQTtRQUNoQixJQUFJLENBQUMsUUFBUSxHQUFHLFNBQVMsQ0FBQyxPQUFPLENBQUE7SUFDbkMsQ0FBQztJQUVELElBQUksU0FBUztRQUNYLE9BQU8sbUNBQTJCLENBQUE7SUFDcEMsQ0FBQztJQUVTLGdCQUFnQixDQUFDLEdBQVk7UUFDckMsSUFDRSxDQUFDLEdBQUc7WUFDSixPQUFPLEdBQUcsS0FBSyxRQUFRO1lBQ3ZCLENBQUMsQ0FBQyxJQUFJLElBQUksR0FBRyxDQUFDO1lBQ2QsQ0FBQyxDQUFDLGlCQUFpQixJQUFJLEdBQUcsQ0FBQztZQUMzQixDQUFDLENBQUMsaUJBQWlCLElBQUksR0FBRyxDQUFDO1lBQzNCLENBQUMsQ0FBQyxRQUFRLElBQUksR0FBRyxDQUFDLEVBQ2xCLENBQUM7WUFDRCxNQUFNLElBQUksS0FBSyxDQUFDLG1DQUFtQyxDQUFDLENBQUE7UUFDdEQsQ0FBQztRQUNELE1BQU0sR0FBRyxHQUFHLEdBT1gsQ0FBQTtRQUNELE9BQU87WUFDTCxFQUFFLEVBQUUsR0FBRyxDQUFDLEVBQUU7WUFDVixlQUFlLEVBQUUsR0FBRyxDQUFDLGVBQWU7WUFDcEMsZUFBZSxFQUFFLEdBQUcsQ0FBQyxlQUFlO1lBQ3BDLE1BQU0sRUFBRSxHQUFHLENBQUMsTUFBTTtZQUNsQixVQUFVLEVBQUUsSUFBSSxJQUFJLENB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