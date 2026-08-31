const fs = require('fs');

function updateFile(file) {
    if (!fs.existsSync(file)) return;
    let content = fs.readFileSync(file, 'utf8');
    
    // Replace: const ai = new GoogleGenAI({ apiKey: currentKey });
    // With: const ai = new GoogleGenAI({ apiKey: currentKey, httpOptions: { headers: { 'User-Agent': 'aistudio-build' } } });
    
    let newContent = content.replace(
        /const ai = new GoogleGenAI\(\{ apiKey: currentKey \}\);/g, 
        "const ai = new GoogleGenAI({ apiKey: currentKey, httpOptions: { headers: { 'User-Agent': 'aistudio-build' } } });"
    );
    
    if (content !== newContent) {
        fs.writeFileSync(file, newContent, 'utf8');
        console.log(`Updated ${file}`);
    }
}

updateFile('server.ts');
updateFile('api/gemini.ts');
