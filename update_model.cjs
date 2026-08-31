const fs = require('fs');

function updateFile(file) {
    if (!fs.existsSync(file)) return;
    let content = fs.readFileSync(file, 'utf8');
    
    // Find gemini-2.0-flash and replace with gemini-3.7-flash
    let newContent = content.replace(/gemini-2\.0-flash/g, 'gemini-3.7-flash');
    
    if (content !== newContent) {
        fs.writeFileSync(file, newContent, 'utf8');
        console.log(`Updated ${file}`);
    }
}

updateFile('server.ts');
updateFile('api/gemini.ts');
