const fs = require('fs');
let content = fs.readFileSync('src/components/AIChatbot.tsx', 'utf8');

if (!content.includes('import { useProducts }')) {
    content = content.replace('import { Send, X, Sparkles } from "lucide-react";', 'import { Send, X, Sparkles } from "lucide-react";\nimport { useProducts } from "../data/products";');
}

if (!content.includes('const { products } = useProducts();')) {
    content = content.replace('export function AIChatbot() {', 'export function AIChatbot() {\n  const { products } = useProducts();');
}

let replaceFrom = `        body: JSON.stringify({
          messages: [
            ...messages.map(m => ({ role: m.role, content: m.text })),
            { role: 'user', content: userMessage }
          ]
        })`;

let replaceTo = `        body: JSON.stringify({
          messages: [
            ...messages.map(m => ({ role: m.role, content: m.text })),
            { role: 'user', content: userMessage }
          ],
          storeContext: products.length > 0 ? "Available Products:\\n" + products.map(p => \`- \${p.name} (₹\${p.price}) [URL: /product/\${p.slug}]\`).join('\\n') : ""
        })`;

content = content.replace(replaceFrom, replaceTo);
fs.writeFileSync('src/components/AIChatbot.tsx', content, 'utf8');
console.log("Updated AIChatbot.tsx");
