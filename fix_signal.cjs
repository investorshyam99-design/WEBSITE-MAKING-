const fs = require('fs');

function fixFile(file) {
    if (!fs.existsSync(file)) return;
    let content = fs.readFileSync(file, 'utf8');

    let replaceFrom = `        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000);
        
        const response = await ai.models.generateContent({
          model: "gemini-3.7-flash",
          contents: prompt,
          config: {
            systemInstruction,
            temperature: 0.7,
            httpOptions: { signal: controller.signal }
          }
        });
        clearTimeout(timeout);`;
        
    let replaceTo = `        const response = await ai.models.generateContent({
          model: "gemini-3.7-flash",
          contents: prompt,
          config: {
            systemInstruction,
            temperature: 0.7
          }
        });`;

    if (content.includes(replaceFrom)) {
        content = content.replace(replaceFrom, replaceTo);
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Fixed ${file}`);
    } else {
        console.log(`Could not find target in ${file}`);
    }
}

fixFile('server.ts');
fixFile('api/gemini.ts');
