"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@medusajs/framework/utils");
const QikinkProductMapping = utils_1.model.define("qikink_product_mapping", {
    id: utils_1.model.id().primaryKey(),
    qikink_sku_id: utils_1.model.text().searchable(),
    variant_id: utils_1.model.text().searchable(),
    print_type_id: utils_1.model.json(), // stored as jsonb; value is number (e.g. 1) for single print type
});
exports.default = QikinkProductMapping;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicWlraW5rLXByb2R1Y3QtbWFwcGluZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tb2R1bGVzL3Fpa2luay1wcm9kdWN0LW1hcHBpbmcvbW9kZWxzL3Fpa2luay1wcm9kdWN0LW1hcHBpbmcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxxREFBaUQ7QUFFakQsTUFBTSxvQkFBb0IsR0FBRyxhQUFLLENBQUMsTUFBTSxDQUFDLHdCQUF3QixFQUFFO0lBQ2xFLEVBQUUsRUFBRSxhQUFLLENBQUMsRUFBRSxFQUFFLENBQUMsVUFBVSxFQUFFO0lBQzNCLGFBQWEsRUFBRSxhQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsVUFBVSxFQUFFO0lBQ3hDLFVBQVUsRUFBRSxhQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsVUFBVSxFQUFFO0lBQ3JDLGFBQWEsRUFBRSxhQUFLLENBQUMsSUFBSSxFQUFFLEVBQUUsa0VBQWtFO0NBQ2hHLENBQUMsQ0FBQTtBQUVGLGtCQUFlLG9CQUFvQixDQUFBIn0=