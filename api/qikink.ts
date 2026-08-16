
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { action } = req.method === 'POST' ? req.body : req.query;
  const apiKey = process.env.QIKINK_API_KEY || "54247f907400087c18b23dfce719caee2b50e2004db57d0e38e9d344f0443c7a";

  if (action === 'send-order') {
    
    try {
      const { order } = req.body;
      if (!order) {
        return res.status(400).json({ error: "No order data provided" 
  }

  if (action === 'track-order') {
    
    try {
      const { orderId } = req.body;
      if (!orderId) {
        return res.status(400).json({ error: "No order ID specified" 
  }

  return res.status(400).json({ success: false, error: 'Invalid action' });
}
