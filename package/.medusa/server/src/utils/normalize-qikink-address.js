"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeQikinkShippingAddress = normalizeQikinkShippingAddress;
/**
 * Normalize shipping_address for Qikink API:
 * - country_code: always uppercase (e.g. "IN" not "in")
 * - province: title-case (e.g. "Gujrat" not "gujrat")
 */
function normalizeQikinkShippingAddress(shippingAddress) {
    const addr = shippingAddress && typeof shippingAddress === "object" ? shippingAddress : {};
    const country = (addr.country_code ?? addr.countryCode ?? "");
    const province = (addr.province ?? "");
    const countryCode = (country || "").toString().trim().toUpperCase().slice(0, 2);
    const provinceNormalized = province
        ? province.trim().charAt(0).toUpperCase() + province.trim().slice(1).toLowerCase()
        : "";
    return {
        ...addr,
        country_code: countryCode,
        province: provinceNormalized,
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm9ybWFsaXplLXFpa2luay1hZGRyZXNzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL3V0aWxzL25vcm1hbGl6ZS1xaWtpbmstYWRkcmVzcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUtBLHdFQWtCQztBQXZCRDs7OztHQUlHO0FBQ0gsU0FBZ0IsOEJBQThCLENBQzVDLGVBQTJEO0lBRTNELE1BQU0sSUFBSSxHQUFHLGVBQWUsSUFBSSxPQUFPLGVBQWUsS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFBO0lBQzFGLE1BQU0sT0FBTyxHQUNYLENBQUMsSUFBSSxDQUFDLFlBQVksSUFBSSxJQUFJLENBQUMsV0FBVyxJQUFJLEVBQUUsQ0FBVyxDQUFBO0lBQ3pELE1BQU0sUUFBUSxHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsSUFBSSxFQUFFLENBQVcsQ0FBQTtJQUVoRCxNQUFNLFdBQVcsR0FBRyxDQUFDLE9BQU8sSUFBSSxFQUFFLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFBO0lBQy9FLE1BQU0sa0JBQWtCLEdBQUcsUUFBUTtRQUNqQyxDQUFDLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLEVBQUUsR0FBRyxRQUFRLENBQUMsSUFBSSxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsRUFBRTtRQUNsRixDQUFDLENBQUMsRUFBRSxDQUFBO0lBRU4sT0FBTztRQUNMLEdBQUcsSUFBSTtRQUNQLFlBQVksRUFBRSxXQUFXO1FBQ3pCLFFBQVEsRUFBRSxrQkFBa0I7S0FDN0IsQ0FBQTtBQUNILENBQUMifQ==