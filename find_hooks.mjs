import fs from 'fs';
import path from 'path';

function searchDirectory(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            searchDirectory(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            checkFile(fullPath);
        }
    }
}

function checkFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    let insideComponent = false;
    let braceDepth = 0;
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        if (line.match(/export (default )?(function|const) [A-Z]/)) {
            insideComponent = true;
            braceDepth = 0;
        }
        
        if (insideComponent) {
            braceDepth += (line.match(/\{/g) || []).length;
            braceDepth -= (line.match(/\}/g) || []).length;
            
            // basic check for if statements BEFORE hooks
            if (line.match(/^[ \t]*if[ \t]*\(.*return/)) {
                // If there's an early return, check if there are hooks after it
                for(let j = i + 1; j < lines.length; j++) {
                    if (lines[j].match(/^[ \t]*(const \[[^\]]+\] = use|use[A-Z][a-zA-Z0-9_]*\()/)) {
                        console.log(`POTENTIAL VIOLATION in ${filePath}: early return at line ${i+1}, hook at line ${j+1}`);
                        break;
                    }
                    if (lines[j].match(/^[ \t]*\}/) && braceDepth <= 1) {
                         break;
                    }
                }
            }
            
            if (braceDepth === 0 && line.includes('}')) {
                insideComponent = false;
            }
        }
    }
}

searchDirectory('src');
