const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(/const formData = new URLSearchParams\(\);\s*formData\.append\("format", "json"\);\s*formData\.append\("data", JSON\.stringify\(payload\.data\)\);\s*const formData = new URLSearchParams\(\);\s*formData\.append\("format", "json"\); formData\.append\("data", JSON\.stringify\(payload\)\);/, 
  'const formData = new URLSearchParams(); formData.append("format", "json"); formData.append("data", JSON.stringify(payload.data));');

fs.writeFileSync('server.ts', code);
console.log("Fixed duplicate form data in server.ts");
