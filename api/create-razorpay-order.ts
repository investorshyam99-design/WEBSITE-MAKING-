import type { VercelRequest, VercelResponse } from '@vercel/node';
import Razorpay from 'razorpay';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { items, paymentMode, deliveryMethod } = req.body;
    
    // Fallback environment variables
    const key_id = process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    if (!key_id || !key_secret) {
      console.error('Missing Razorpay credentials');
      return res.status(500).json({ error: 'Missing Razorpay configuration on server' });
    }

    const razorpay = new Razorpay({ key_id, key_secret });
    
    let amount = 0;
    const itemsTotal = items.reduce((sum: any, item: any) => sum + (item.price * item.quantity), 0);

    const totalQuantity = items.reduce((sum: any, item: any) => sum + item.quantity, 0);
    const fastDeliveryFee = deliveryMethod === "FAST" ? 50 * totalQuantity : 0;
    
    if (paymentMode === 'partial') {
      amount = 50 * totalQuantity + fastDeliveryFee; // 50 advance per item + fast delivery
    } else {
      amount = itemsTotal + fastDeliveryFee;
    }

    const options = {
      amount: amount * 100, // amount in the smallest currency unit
      currency: "INR",
      receipt: "receipt_order_" + Date.now(),
    };

    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    res.status(500).json({ error: 'Failed to create Razorpay order' });
  }
}
