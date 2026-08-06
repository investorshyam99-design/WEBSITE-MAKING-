const fs = require('fs');

function fix() {
  let lines = fs.readFileSync('server.ts', 'utf8').split('\n');
  
  // 18:
  lines[17] = lines[17].replace('{ key_id, key_secret }', '{ key_id, key_secret });');
  
  // 64-65:
  // key_id: process.env.RAZORPAY_KEY_ID,
  // } catch (error: any) {
  lines[64] = lines[64].replace('}', '});\n    }');

  // 68: res.status(500).json({ error: error.message }
  lines[68] = lines[68].replace('error.message }', 'error.message });\n    }');

  fs.writeFileSync('server.ts', lines.join('\n'));
}
fix();
