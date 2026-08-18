const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Fix /api/store-inventory back to { query }
code = code.replace(
    /app\.get\("\/api\/store-inventory", async \(req, res\) => \{[\s\S]*?body: JSON\.stringify\(req\.body\),/m,
    (match) => {
        return match.replace('body: JSON.stringify(req.body),', 'body: JSON.stringify({ query }),');
    }
);

// Fix /api/catalog to use req.body
code = code.replace(
    /app\.post\("\/api\/catalog", async \(req, res\) => \{[\s\S]*?body: JSON\.stringify\(\{ query \}\),/m,
    (match) => {
        return match.replace('body: JSON.stringify({ query }),', 'body: JSON.stringify(req.body),');
    }
);

fs.writeFileSync('server.ts', code);
console.log("Patched server.ts correctly");
