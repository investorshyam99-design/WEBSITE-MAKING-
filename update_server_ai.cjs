const fs = require('fs');

function updateFile(file) {
    if (!fs.existsSync(file)) return;
    let content = fs.readFileSync(file, 'utf8');

    // 1. Add storeContext to the request body destructuring
    content = content.replace('const { messages } = req.body;', 'const { messages, storeContext } = req.body;');

    // 2. Append storeContext to the prompt
    let promptReplaceFrom = 'let prompt = `Conversation History:\\n${contextStr}\\n\\nUser: ${currentMessage.content}\\n\\nPlease reply as Jersey Unicorn AI.`;';
    let promptReplaceTo = 'let prompt = `Conversation History:\\n${contextStr}\\n\\nUser: ${currentMessage.content}\\n\\nPlease reply as Jersey Unicorn AI.`;\n    if (storeContext) prompt += `\\n\\nSTORE CONTEXT (For your reference to answer user queries about products):\\n${storeContext}`;';
    
    // Fallback if history is empty
    let emptyReplaceFrom = 'prompt = currentMessage.content;';
    let emptyReplaceTo = 'prompt = currentMessage.content;\n      if (storeContext) prompt += `\\n\\nSTORE CONTEXT (For your reference to answer user queries about products):\\n${storeContext}`;';

    if (content.includes(promptReplaceFrom)) {
        content = content.replace(promptReplaceFrom, promptReplaceTo);
    }
    if (content.includes(emptyReplaceFrom)) {
        content = content.replace(emptyReplaceFrom, emptyReplaceTo);
    }

    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}`);
}

updateFile('server.ts');
updateFile('api/gemini.ts');
