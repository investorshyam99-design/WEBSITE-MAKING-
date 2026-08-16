const fs = require('fs');
let file = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

file = file.replace(/trackingId\?: string;/, `trackingId?: string;\n  trackingUrl?: string;`);

file = file.replace(/onUpdateTracking: \(t: string, c: string\) => void;/, `onUpdateTracking: (t: string, c: string, url: string) => void;`);

file = file.replace(/const \[trackingId, setTrackingId\] = useState\(order\.trackingId \|\| ""\);/, `const [trackingId, setTrackingId] = useState(order.trackingId || "");\n  const [trackingUrl, setTrackingUrl] = useState(order.trackingUrl || "");`);

file = file.replace(/onUpdateTracking\(\n\s*orderId: string,\n\s*trackingId: string,\n\s*courierName: string,\n\s*\) => \{/, `onUpdateTracking(\n    orderId: string,\n    trackingId: string,\n    courierName: string,\n    trackingUrl: string = ""\n  ) => {`);

file = file.replace(/await updateDoc\(doc\(db, "orders", orderId\), \{ trackingId, courierName \}\);/, `await updateDoc(doc(db, "orders", orderId), { trackingId, courierName, trackingUrl });`);

file = file.replace(/<input\s*type="text"\s*placeholder="Tracking ID"/, `<input\n                      type="text"\n                      placeholder="Tracking URL"\n                      value={trackingUrl}\n                      onChange={(e) => setTrackingUrl(e.target.value)}\n                      className="w-full p-2 bg-gray-50 border border-gray-200 rounded text-sm focus:outline-none focus:border-blue-400 mb-2"\n                    />\n                    <input\n                      type="text"\n                      placeholder="Tracking ID"`);

file = file.replace(/onUpdateTracking\(trackingId, courierName\);/, `onUpdateTracking(trackingId, courierName, trackingUrl);`);

file = file.replace(/onUpdateTracking\(order\.id, trackingId, courierName\)/g, `onUpdateTracking(order.id, trackingId, courierName, trackingUrl)`);

fs.writeFileSync('src/components/AdminDashboard.tsx', file);
