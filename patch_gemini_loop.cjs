const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const search = `    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const responseText = response.text || "I'm sorry, I couldn't process your request.";
    return res.status(200).json({ text: responseText, audio: null });

  } catch (error: any) {`;

const replace = `    let lastError: any = null;
    
    for (let i = 0; i < keys.length; i++) {
      const currentKey = keys[i];
      try {
        const ai = new GoogleGenAI({ apiKey: currentKey });
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash", // stable fast model
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
    return res.status(500).json({ error: "Our AI Assistant is temporarily unavailable. Please try again in a few minutes." });
  } catch (error: any) {`;

if (code.includes(search)) {
    code = code.replace(search, replace);
    fs.writeFileSync('server.ts', code);
    console.log('patched server.ts with key rotation loop');
} else {
    console.log('could not find search string in server.ts');
}
