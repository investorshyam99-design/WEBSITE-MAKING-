const fs = require('fs');

function fixFile(file) {
    if (!fs.existsSync(file)) return;
    let content = fs.readFileSync(file, 'utf8');

    let replaceFrom = `        const response = await ai.models.generateContent({
          model: "gemini-3.7-flash",
          contents: prompt,
          config: {
            systemInstruction,
            temperature: 0.7
          }
        });`;
        
    let replaceTo = `        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error("timeout")), 10000); // 10 seconds max per key
        });

        const response = await Promise.race([
          ai.models.generateContent({
            model: "gemini-3.7-flash",
            contents: prompt,
            config: {
              systemInstruction,
              temperature: 0.7
            }
          }),
          timeoutPromise
        ]) as any;`;

    if (content.includes(replaceFrom)) {
        content = content.replace(replaceFrom, replaceTo);
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Fixed ${file}`);
    } else {
        console.log(`Target not found in ${file}`);
    }
}

fixFile('server.ts');
fixFile('api/gemini.ts');
