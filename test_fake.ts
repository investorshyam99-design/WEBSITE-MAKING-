import { GoogleGenAI } from "@google/genai";
async function test() {
    const ai = new GoogleGenAI({ apiKey: "fake_key_123", httpOptions: { headers: { 'User-Agent': 'aistudio-build' } } });
    try {
        const response = await ai.models.generateContent({
            model: "gemini-3.7-flash",
            contents: "Hello"
        });
        console.log("Success:", response.text);
    } catch (e) {
        console.error("Error:", e);
    }
}
test();
