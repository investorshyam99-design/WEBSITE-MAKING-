const fs = require('fs');

const configPath = './firebase-applet-config.json';
if (!fs.existsSync(configPath)) {
  console.log('No firebase config found');
  process.exit(1);
}

const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
console.log('Config:', config);
