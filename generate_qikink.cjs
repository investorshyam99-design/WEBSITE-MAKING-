const fs = require('fs');

let server = fs.readFileSync('server.ts', 'utf8');

// Extract the Qikink handlers
const sendOrderMatch = server.match(/app\.post\("\/api\/qikink\/send-order"[\s\S]*?\}\);/);
const trackOrderMatch = server.match(/app\.post\("\/api\/qikink\/track-order"[\s\S]*?\}\);/);

let qikinkCode = `
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { action } = req.method === 'POST' ? req.body : req.query;
  const apiKey = process.env.QIKINK_API_KEY || "54247f907400087c18b23dfce719caee2b50e2004db57d0e38e9d344f0443c7a";

  if (action === 'send-order') {
    ${sendOrderMatch[0].replace(/app\.post\("\/api\/qikink\/send-order", async \(req, res\) => {/, '').replace(/}\);$/, '')}
  }

  if (action === 'track-order') {
    ${trackOrderMatch[0].replace(/app\.post\("\/api\/qikink\/track-order", async \(req, res\) => {/, '').replace(/}\);$/, '')}
  }

  return res.status(400).json({ success: false, error: 'Invalid action' });
}
`;

fs.writeFileSync('api/qikink.ts', qikinkCode);
console.log('qikink regenerated');
