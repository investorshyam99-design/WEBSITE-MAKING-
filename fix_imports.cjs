const fs = require('fs');

let content = fs.readFileSync('src/components/AIChatbot.tsx', 'utf8');
if (!content.includes("import { useProducts }")) {
    content = content.replace("import { useLocation } from 'react-router-dom';", "import { useLocation } from 'react-router-dom';\nimport { useProducts } from '../data/products';");
    fs.writeFileSync('src/components/AIChatbot.tsx', content, 'utf8');
    console.log("Fixed AIChatbot.tsx");
}
