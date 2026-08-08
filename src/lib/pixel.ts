// Meta Pixel ID: 1772338310420314
export const FB_PIXEL_ID = "1772338310420314";

declare global {
  interface Window {
    fbq?: any;
    _fbq?: any;
  }
}

/**
 * Fires standard PageView event
 */
export function trackPageView() {
  if (typeof window !== "undefined" && window.fbq) {
    try {
      window.fbq("track", "PageView");
    } catch (err) {
      console.warn("[Meta Pixel] PageView tracking error:", err);
    }
  }
}

/**
 * Fires ViewContent event when a customer views a product
 */
export function trackViewContent(product: {
  id: string | number;
  name: string;
  price: number;
  category?: string;
}) {
  if (typeof window !== "undefined" && window.fbq && product) {
    try {
      window.fbq("track", "ViewContent", {
        content_ids: [String(product.id)],
        content_name: product.name,
        content_category: product.category || "Apparel",
        content_type: "product",
        value: Number(product.price) || 0,
        currency: "INR",
      });
    } catch (err) {
      console.warn("[Meta Pixel] ViewContent tracking error:", err);
    }
  }
}

/**
 * Fires AddToCart event when a customer adds a product to cart
 */
export function trackAddToCart(product: {
  id: string | number;
  name: string;
  price: number;
  quantity?: number;
}) {
  if (typeof window !== "undefined" && window.fbq && product) {
    try {
      const qty = product.quantity || 1;
      const totalVal = (Number(product.price) || 0) * qty;
      window.fbq("track", "AddToCart", {
        content_ids: [String(product.id)],
        content_name: product.name,
        content_type: "product",
        value: totalVal,
        currency: "INR",
      });
    } catch (err) {
      console.warn("[Meta Pixel] AddToCart tracking error:", err);
    }
  }
}

/**
 * Fires InitiateCheckout event when a customer enters or starts checkout
 */
export function trackInitiateCheckout(
  items: { id: string | number; price: number; quantity: number }[],
  totalValue: number
) {
  if (typeof window !== "undefined" && window.fbq) {
    try {
      const contentIds = items.map((i) => String(i.id));
      const numItems = items.reduce((acc, i) => acc + (i.quantity || 1), 0);
      window.fbq("track", "InitiateCheckout", {
        content_ids: contentIds,
        content_type: "product",
        value: Number(totalValue) || 0,
        currency: "INR",
        num_items: numItems,
      });
    } catch (err) {
      console.warn("[Meta Pixel] InitiateCheckout tracking error:", err);
    }
  }
}

/**
 * Fires Purchase event ONLY after successful order/payment completion.
 * Includes deduplication via sessionStorage to prevent firing duplicate events on refresh or double callbacks.
 */
export function trackPurchase(
  orderId: string | number,
  value: number,
  items?: { id: string | number; price: number; quantity: number }[]
) {
  if (!orderId) return;

  const orderKey = `pixel_purchased_${orderId}`;

  // Check if this order was already tracked
  try {
    if (sessionStorage.getItem(orderKey) === "true") {
      console.log(`[Meta Pixel] Purchase event for order ${orderId} already tracked. Skipping duplicate.`);
      return;
    }
    sessionStorage.setItem(orderKey, "true");
  } catch (e) {
    // Fallback if sessionStorage is disabled/blocked
  }

  if (typeof window !== "undefined" && window.fbq) {
    try {
      const contentIds = items ? items.map((i) => String(i.id)) : [];
      const numItems = items ? items.reduce((acc, i) => acc + (i.quantity || 1), 0) : 1;

      window.fbq("track", "Purchase", {
        content_ids: contentIds,
        content_type: "product",
        value: Number(value) || 0,
        currency: "INR",
        order_id: String(orderId),
        num_items: numItems,
      });
      console.log(`[Meta Pixel] Purchase tracked for order ${orderId} with value ₹${value}`);
    } catch (err) {
      console.warn("[Meta Pixel] Purchase tracking error:", err);
    }
  }
}
