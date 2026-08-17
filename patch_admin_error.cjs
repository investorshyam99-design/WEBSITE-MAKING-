const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

const search = `      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || "Failed to create shipment");
      }`;

const replace = `      const data = await response.json();
      if (!data.success) {
        const fullErr = data.delhiveryResponse ? \`\${data.error}\\nHTTP: \${data.delhiveryStatus}\\nResponse: \${JSON.stringify(data.delhiveryResponse)}\` : data.error;
        throw new Error(fullErr || "Failed to create shipment");
      }`;

if (code.includes(search)) {
    code = code.replace(search, replace);
    fs.writeFileSync('src/components/AdminDashboard.tsx', code);
    console.log('patched admin dashboard error display');
} else {
    console.log('could not find admin dashboard error handler');
}
