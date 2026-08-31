const fs = require('fs');

function fixFile(file) {
    if (!fs.existsSync(file)) return;
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/model: "gemini-1.5-flash"/g, 'model: "gemini-2.5-flash"');
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Fixed ${file}`);
}
fixFile('server.ts');
fixFile('api/gemini.ts');
