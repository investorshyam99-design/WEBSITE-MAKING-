const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const search = `        body: JSON.stringify({ query }),`;
const replace = `        body: JSON.stringify(req.body),`;

if (code.includes(search)) {
    code = code.replace(search, replace);
    fs.writeFileSync('server.ts', code);
    console.log("Patched server.ts to include req.body fully");
} else {
    console.log("Could not find the target string in server.ts");
}
