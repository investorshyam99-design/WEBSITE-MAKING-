"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
exports.default = orderPlacedQikinkHandler;
const utils_1 = require("@medusajs/framework/utils");
const qikink_client_1 = require("../helpers/qikink-client");
const resolve_options_1 = require("../utils/resolve-options");
const normalize_qikink_address_1 = require("../utils/normalize-qikink-address");
const qikink_order_mapping_1 = require("../modules/qikink-order-mapping");
const qikink_product_mapping_1 = require("../modules/qikink-product-mapping");
function str(obj, ...keys) {
    for (const k of keys) {
        const v = obj[k];
        if (v != null && typeof v === "string" && v.trim() !== "")
            return v.trim();
    }
    return "";
}
/** Map Medusa address to Qikink shipping_address format. Supports snake_case and camelCase. No empty strings (Qikink rejects them). */
function mapOrderAddressToQikink(addr, orderEmail) {
    const o = addr && typeof addr === "object" ? addr : {};
    const first = str(o, "first_name", "firstName");
    const last = str(o, "last_name", "lastName");
    const address1 = str(o, "address_1", "address1");
    const phone = str(o, "phone");
    const email = str(o, "email") || (orderEmail && String(orderEmail).trim()) || "";
    const city = str(o, "city");
    const zip = str(o, "postal_code", "zip");
    const provinceRaw = str(o, "province");
    const country = str(o, "country_code", "countryCode");
    const countryCode = (country || "").toUpperCase().slice(0, 2);
    const province = provinceRaw
        ? provinceRaw.trim().charAt(0).toUpperCase() + provinceRaw.trim().slice(1).toLowerCase()
        : "";
    return {
        first_name: first || "",
        last_name: last || "",
        address1: address1 || "",
        phone: phone || "",
        email: email || "",
        city: city || "",
        zip: zip || "",
        province,
        country_code: countryCode || "",
    };
}
function getLogger(container) {
    try {
        return container.resolve("logger");
    }
    catch {
        return undefined;
    }
}
async function orderPlacedQikinkHandler({ event: { data }, container, }) {
    const logger = getLogger(container);
    const orderId = data?.id;
    if (!orderId) {
        logger?.warn?.("[Qikink order.placed] Subscriber invoked but event data has no order id", { data });
        return;
    }
    logger?.info?.("[Qikink order.placed] Subscriber invoked", { orderId });
    let orderModule;
    try {
        orderModule = container.resolve(utils_1.Modules.ORDER);
    }
    catch (err) {
        logger?.warn?.("[Qikink order.placed] Order module not available; skipping", { orderId, error: err });
        return;
    }
    let productMappingService;
    let orderMappingService;
    try {
        productMappingService = container.resolve(qikink_product_mapping_1.QIKINK_PRODUCT_MAPPING_MODULE);
        orderMappingService = container.resolve(qikink_order_mapping_1.QIKINK_ORDER_MAPPING_MODULE);
    }
    catch (err) {
        logger?.warn?.("[Qikink order.placed] Qikink mapping modules not available; skipping", { orderId, error: err });
        return;
    }
    const configModule = container.resolve(utils_1.ContainerRegistrationKeys.CONFIG_MODULE);
    const rawOptions = (0, resolve_options_1.extractQikinkOptions)(configModule);
    let options;
    try {
        options = (0, resolve_options_1.resolveQikinkOptions)(rawOptions);
    }
    catch (err) {
        logger?.warn?.("[Qikink order.placed] Qikink options invalid or missing; skipping", { orderId, error: err });
        return;
    }
    const { count: existingCount } = await orderMappingService.listMappings({ medusa_order_id: orderId }, { take: 1 });
    if (existingCount > 0) {
        logger?.info?.("[Qikink order.placed] Mapping already exists for order; skipping", { orderId });
        return;
    }
    let order;
    try {
        order = await orderModule.retrieveOrder(orderId, { relations: ["items", "shipping_address"] });
    }
    catch (err) {
        logger?.warn?.("[Qikink order.placed] Failed to retrieve order", { orderId, error: err });
        return;
    }
    logger?.info?.("[Qikink order.placed] Order retrieved", { orderId, itemCount: order.items?.length ?? 0 });
    const items = order.items ?? [];
    // search_from_my_products: 0 = use exact SKU (required with print_type_id); 1 = Qikink looks up by SKU
    const qikinkLineItems = [];
    for (const item of items) {
        const variantId = item.variant_id;
        if (!variantId)
            continue;
        const mapping = await productMappingService.getMappingByVariantId(variantId);
        if (!mapping)
            continue;
        const qty = typeof item.quantity === "number" ? item.quantity : Number(item.quantity) || 1;
        const unitPrice = item.unit_price != null
            ? typeof item.unit_price === "number"
                ? String(item.unit_price)
                : String(item.unit_price)
            : "0";
        qikinkLineItems.push({
            search_from_my_products: 0,
            print_type_id: mapping.print_type_id ?? 1,
            quantity: String(qty),
            price: unitPrice,
            sku: mapping.qikink_sku_id,
        });
    }
    if (qikinkLineItems.length === 0) {
        logger?.info?.("[Qikink order.placed] No mappable line items (no product mappings); skipping", {
            orderId,
            totalItems: items.length,
        });
        return;
    }
    // Compute order total from line items when summary is missing or zero (Medusa may not populate summary on retrieveOrder)
    const totalFromSummary = order.summary?.[0]?.current_order_total != null
        ? Number(order.summary[0].current_order_total)
        : NaN;
    const totalFromItems = qikinkLineItems.reduce((sum, li) => sum + Number(li.price) * Number(li.quantity), 0);
    const orderTotal = Number.isFinite(totalFromSummary) && totalFromSummary > 0
        ? String(totalFromSummary)
        : String(Math.round(totalFromItems * 100) / 100);
    logger?.info?.("[Qikink order.placed] Mapped line items for Qikink", { orderId, lineItemCount: qikinkLineItems.length, lineItems: qikinkLineItems });
    const client = (0, qikink_client_1.createQikinkClient)(options);
    let accessToken;
    try {
        const tokenRes = await client.getToken();
        accessToken = tokenRes.access_token;
        if (!accessToken) {
            const responseKeys = typeof tokenRes === "object" && tokenRes !== null && !Array.isArray(tokenRes)
                ? Object.keys(tokenRes)
                : [];
            const responseType = Array.isArray(tokenRes) ? "array" : typeof tokenRes;
            logger?.warn?.("[Qikink order.placed] Qikink token response missing access_token", {
                orderId,
                responseKeys,
                responseType,
                hint: "Check QIKINK_API_URL and credentials. If keys look correct, token value may be empty.",
            });
            return;
        }
    }
    catch (err) {
        logger?.warn?.("[Qikink order.placed] Failed to get Qikink access token", { orderId, error: err });
        return;
    }
    logger?.info?.("[Qikink order.placed] Qikink token obtained; creating order", { orderId });
    const orderNumber = String(order.display_id ?? order.id);
    const shippingAddress = mapOrderAddressToQikink(order.shipping_address ?? order.billing_address ?? null, order.email);
    const payload = {
        order_number: orderNumber,
        qikink_shipping: "1",
        gateway: "COD",
        total_order_value: orderTotal,
        line_items: qikinkLineItems,
        shipping_address: (0, normalize_qikink_address_1.normalizeQikinkShippingAddress)(shippingAddress),
    };
    const skusSent = qikinkLineItems.map((item) => item.sku);
    logger?.info?.("[Qikink order.placed] Qikink payload", {
        orderId,
        order_number: payload.order_number,
        line_item_count: payload.line_items.length,
        skus_sent: skusSent,
        hint: "If Qikink returns 'Invalid SKU', ensure each SKU exists in your Qikink catalog and matches exactly (case, format).",
    });
    logger?.info?.("[Qikink createOrder] Request body:\n" + JSON.stringify(payload, null, 2));
    let result;
    try {
        result = await client.createOrder(accessToken, payload);
    }
    catch (err) {
        const errMessage = err instanceof Error ? err.message : String(err);
        logger?.warn?.("[Qikink order.placed] Qikink createOrder failed", {
            orderId,
            orderNumber,
            errorMessage: errMessage,
            error: err,
        });
        return;
    }
    const qikinkOrderId = result.order_id != null ? String(result.order_id) : "";
    if (!qikinkOrderId) {
        logger?.warn?.("[Qikink order.placed] Qikink API did not return order_id", { orderId, result });
        return;
    }
    logger?.info?.("[Qikink order.placed] Qikink order created", { orderId, qikinkOrderId, orderNumber });
    try {
        await orderMappingService.createMapping({
            qikink_order_id: qikinkOrderId,
            medusa_order_id: orderId,
            status: "created",
        });
        logger?.info?.("[Qikink order.placed] Mapping created successfully", { orderId, qikinkOrderId });
    }
    catch (err) {
        logger?.error?.("[Qikink order.placed] Failed to create order mapping (duplicate or DB error)", err);
        // Duplicate or other error - avoid throwing in subscriber
    }
}
exports.config = {
    event: "order.placed",
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3JkZXItcGxhY2VkLXFpa2luay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9zdWJzY3JpYmVycy9vcmRlci1wbGFjZWQtcWlraW5rLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQXFGQSwyQ0F1TUM7QUEzUkQscURBQThFO0FBQzlFLDREQUE0RjtBQUM1Riw4REFBcUY7QUFDckYsZ0ZBQWtGO0FBQ2xGLDBFQUE2RTtBQUU3RSw4RUFBaUY7QUE2QmpGLFNBQVMsR0FBRyxDQUFDLEdBQTRCLEVBQUUsR0FBRyxJQUFjO0lBQzFELEtBQUssTUFBTSxDQUFDLElBQUksSUFBSSxFQUFFLENBQUM7UUFDckIsTUFBTSxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2hCLElBQUksQ0FBQyxJQUFJLElBQUksSUFBSSxPQUFPLENBQUMsS0FBSyxRQUFRLElBQUksQ0FBQyxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUU7WUFBRSxPQUFPLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQTtJQUM1RSxDQUFDO0lBQ0QsT0FBTyxFQUFFLENBQUE7QUFDWCxDQUFDO0FBRUQsdUlBQXVJO0FBQ3ZJLFNBQVMsdUJBQXVCLENBQzlCLElBQWdELEVBQ2hELFVBQTBCO0lBRTFCLE1BQU0sQ0FBQyxHQUFHLElBQUksSUFBSSxPQUFPLElBQUksS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUUsRUFBOEIsQ0FBQTtJQUNuRixNQUFNLEtBQUssR0FBRyxHQUFHLENBQUMsQ0FBQyxFQUFFLFlBQVksRUFBRSxXQUFXLENBQUMsQ0FBQTtJQUMvQyxNQUFNLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxFQUFFLFdBQVcsRUFBRSxVQUFVLENBQUMsQ0FBQTtJQUM1QyxNQUFNLFFBQVEsR0FBRyxHQUFHLENBQUMsQ0FBQyxFQUFFLFdBQVcsRUFBRSxVQUFVLENBQUMsQ0FBQTtJQUNoRCxNQUFNLEtBQUss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