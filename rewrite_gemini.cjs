const fs = require('fs');

const originalChat = fs.readFileSync('api/gemini/chat.ts', 'utf8');
const instructionRegex = /const systemInstruction = \`([^]*?)\`;/;
const match = originalChat.match(instructionRegex);
const systemInstruction = match ? match[1] : '';

const newChatTs = `import { GoogleGenAI, Modality } from "@google/genai";

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { messages } = req.body;

    // Dynamically collect all possible Gemini API keys from environment variables
    const targetKeys = ["G1", "G3", "G5", "G6", "G7", "GEMINI_API_KEY"];
    const apiKeys = [];
    
    // Verify each specified variable
    for (const k of targetKeys) {
      if (process.env[k] && process.env[k].trim().length > 0) {
        if (!apiKeys.includes(process.env[k].trim())) {
          apiKeys.push(process.env[k].trim());
        }
      } else {
        console.warn(\`[Gemini AI] Environment variable \${k} is missing or empty in production.\`);
      }
    }

    // Also dynamically collect any other matching keys just in case
    Object.entries(process.env).forEach(([key, value]) => {
      const k = key.toUpperCase();
      if (
        (k.includes("GEMINI") || k.match(/^G[0-9]+$/) || (k.includes("API_KEY") && !k.includes("RAZORPAY") && !k.includes("QIKINK"))) &&
        value && typeof value === 'string' && value.trim().length > 0
      ) {
        if (!apiKeys.includes(value.trim())) {
          apiKeys.push(value.trim());
        }
      }
    });

    if (apiKeys.length === 0) {
      console.error("[Gemini AI] FATAL: No Gemini API keys found in environment variables.");
      return res
        .status(500)
        .json({ error: "Our AI Assistant is temporarily unavailable. Please try again in a few minutes." });
    }
    
    console.log(\`[Gemini AI] Loaded \${apiKeys.length} API keys for rotation.\`);

    const systemInstruction = \`${systemInstruction.replace(/`/g, '\\`')}\`;

    let history = messages.slice(0, -1);
    const currentMessage = messages[messages.length - 1];
    
    // Restore history if this is a continued conversation.
    let contextStr = history
      .map(
        (m: any) =>
          \`\${m.role === "user" ? "User" : "Jersey Unicorn AI"}: \${m.content}\`,
      )
      .join("\\n");
      
    let prompt = \`Conversation History:\\n\${contextStr}\\n\\nUser: \${currentMessage.content}\\n\\nPlease reply as Jersey Unicorn AI.\`;
    
    if (history.length === 0) {
      prompt = currentMessage.content;
    }

    let responseText = "";
    let lastError = null;

    // Strategy: We will attempt to use each key.
    // If a key fails with a retryable error (like a transient network issue or temporary 503),
    // we do one exponential backoff retry for that specific key. 
    // If it still fails, or if it's a hard error (401, 403, 429 quota exceeded), 
    // we move to the next key.

    for (let i = 0; i < apiKeys.length; i++) {
      const key = apiKeys[i];
      let maxRetriesPerKey = 1;
      let attempt = 0;
      let successWithKey = false;
      
      while (attempt <= maxRetriesPerKey) {
        attempt++;
        try {
          console.log(\`[Gemini AI] Attempting API key index \${i}, Retry attempt \${attempt}\`);
          
          const ai = new GoogleGenAI({
            apiKey: key,
            httpOptions: {
              headers: {
                "User-Agent": "aistudio-build",
              },
            },
          });

          const chat = ai.chats.create({
            model: "gemini-2.0-flash",
            config: {
              systemInstruction,
              temperature: 0.7,
            },
          });

          const response = await chat.sendMessage({ message: prompt });
          responseText = response.text || "";
          
          if (responseText) {
            successWithKey = true;
            break; // Break the retry loop for this key
          }
        } catch (err: any) {
          const status = err?.status || err?.response?.status || 'unknown';
          const errMsg = err?.message || err?.toString() || 'Unknown Error';
          
          console.error(\`[Gemini AI] API key index \${i} failed on attempt \${attempt}. HTTP Status: \${status}. Error: \${errMsg}\`);
          lastError = err;
          
          // Determine if we should retry the SAME key, or move to the next key.
          // Hard errors where retrying the same key won't help immediately:
          // 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 429 Quota Exceeded
          if (
            status === 400 || 
            status === 401 || 
            status === 403 || 
            status === 404 || 
            status === 429
          ) {
            console.log(\`[Gemini AI] Fatal or Quota error (\${status}). Skipping to next key.\`);
            break; // Break the retry loop for this key, move to next key
          }

          // If we haven't exhausted retries for this key, wait and retry.
          if (attempt <= maxRetriesPerKey) {
            const backoffMs = Math.pow(2, attempt) * 500; // 1s, 2s, etc.
            console.log(\`[Gemini AI] Temporary failure. Waiting \${backoffMs}ms before retrying same key...\`);
            await sleep(backoffMs);
          }
        }
      }

      if (successWithKey) {
        console.log(\`[Gemini AI] Successfully generated response using API key index \${i}.\`);
        lastError = null;
        break; // Success! Break the main key loop
      }
    }

    if (lastError || !responseText) {
      console.error("[Gemini AI] FINAL REASON: All API keys exhausted or failed.");
      return res.status(500).json({ error: "Our AI Assistant is temporarily unavailable. Please try again in a few minutes." });
    }

    return res.status(200).json({ text: responseText, audio: null });

  } catch (error: any) {
    console.error("[Gemini AI] Unexpected Server Error: ", error);
    return res.status(500).json({ error: "Our AI Assistant is temporarily unavailable. Please try again in a few minutes." });
  }
}
`;

fs.writeFileSync('api/gemini/chat.ts', newChatTs);
console.log('Successfully wrote api/gemini/chat.ts');
