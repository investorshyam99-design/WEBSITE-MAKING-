"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@medusajs/framework/utils");
const QikinkOrderMapping = utils_1.model.define("qikink_order_mapping", {
    id: utils_1.model.id().primaryKey(),
    qikink_order_id: utils_1.model.text().searchable(),
    medusa_order_id: utils_1.model.text().searchable(),
    status: utils_1.model.text().searchable(),
});
exports.default = QikinkOrderMapping;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicWlraW5rLW9yZGVyLW1hcHBpbmcuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbW9kdWxlcy9xaWtpbmstb3JkZXItbWFwcGluZy9tb2RlbHMvcWlraW5rLW9yZGVyLW1hcHBpbmcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxxREFBaUQ7QUFFakQsTUFBTSxrQkFBa0IsR0FBRyxhQUFLLENBQUMsTUFBTSxDQUFDLHNCQUFzQixFQUFFO0lBQzlELEVBQUUsRUFBRSxhQUFLLENBQUMsRUFBRSxFQUFFLENBQUMsVUFBVSxFQUFFO0lBQzNCLGVBQWUsRUFBRSxhQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsVUFBVSxFQUFFO0lBQzFDLGVBQWUsRUFBRSxhQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsVUFBVSxFQUFFO0lBQzFDLE1BQU0sRUFBRSxhQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsVUFBVSxFQUFFO0NBQ2xDLENBQUMsQ0FBQTtBQUVGLGtCQUFlLGtCQUFrQixDQUFBIn0=