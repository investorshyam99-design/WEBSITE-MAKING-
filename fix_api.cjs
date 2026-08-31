const fs = require('fs');

function fixFile(file) {
    if (!fs.existsSync(file)) return;
    let content = fs.readFileSync(file, 'utf8');

    let replaceFrom = `    let lastError: any = null;
    
    for (let i = 0; i < keys.length; i++) {
      try {
        const apiKey = keys[i] as string;
        const ai = new GoogleGenAI({ apiKey, httpOptions: { headers: { 'User-Agent': 'aistudio-build' } } });
        
        const response = await ai.models.generateContent({
          model: "gemini-3.7-flash", // stable fast model
          contents: prompt,
          config: {
            systemInstruction,
            temperature: 0.7,
          }
        });
        
        console.log(\`[Gemini AI] Successfully used key index \${i}\`);
        const responseText = response.text || "I'm sorry, I couldn't process your request.";
        return res.status(200).json({ text: responseText, audio: null });
      } catch (err: any) {
        console.error(\`[Gemini AI] Error with key index \${i}: \`, err.message || err);
        lastError = err;
      }
    }
    console.error("[Gemini AI] All keys failed. Last error: ", lastError);
    return res.status(500).json({ error: "Our AI Assistant is temporarily unavailable. Please try again in a few minutes." });`;

    let replaceTo = `    let lastError: any = null;
    
    for (let i = 0; i < keys.length; i++) {
      try {
        const apiKey = keys[i] as string;
        const ai = new GoogleGenAI({ apiKey, httpOptions: { headers: { 'User-Agent': 'aistudio-build' } } });
        
        const controller = new AbortController();
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
        clearTimeout(timeout);
        
        console.log(\`[Gemini AI] Successfully used key index \${i}\`);
        const responseText = response.text || "I'm sorry, I couldn't process your request.";
        return res.status(200).json({ text: responseText, audio: null });
      } catch (err: any) {
        console.error(\`[Gemini AI] Error with key index \${i}: \`, err?.message || err);
        lastError = err;
        
        const status = err?.status || err?.response?.status;
        const msg = err?.message || "";
        
        if (status === 401 || status === 403) continue;
        if (status === 429) continue;
        if (status === 404) return res.status(500).json({ error: "AI model configuration is invalid." });
        if (status === 500) return res.status(500).json({ error: "AI backend error. Please try again later." });
        if (status === 503 || msg.includes("UNAVAILABLE") || msg.includes("high demand") || msg.includes("overloaded")) {
           return res.status(503).json({ error: "AI is temporarily unavailable due to high demand. Please try again in a few minutes." });
        }
        if (msg.includes("abort") || msg.includes("timeout")) continue;
      }
    }
    console.error("[Gemini AI] All keys failed. Last error: ", lastError?.message || lastError);
    return res.status(500).json({ error: "AI is temporarily unavailable. Please try again in a few minutes." });`;

    const idx = content.indexOf('    let lastError: any = null;');
    if (idx !== -1) {
        content = content.substring(0, idx) + replaceTo + "\n  } catch (error: any) {\n    console.error(\"[Gemini AI] Unexpected Server Error: \", error);\n    return res.status(500).json({ error: \"Our AI Assistant is temporarily unavailable. Please try again in a few minutes.\" });\n  }\n}";
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Updated ${file}`);
    }
}

fixFile('api/gemini.ts');
