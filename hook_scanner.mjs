import fs from 'fs';
import path from 'path';

function scanDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      scanDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const lines = content.split('\n');
      
      let inComponent = false;
      let hasEarlyReturn = false;
      let earlyReturnLine = 0;
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // Very basic heuristic
        if (line.match(/export function [A-Z]/) || line.match(/function [A-Z]/)) {
          inComponent = true;
          hasEarlyReturn = false;
        }
        
        if (inComponent) {
          if (line.match(/if\s*\(.*return\s+/) && !line.includes('=>') && !line.includes('function')) {
            hasEarlyReturn = true;
            earlyReturnLine = i + 1;
          }
          
          if (hasEarlyReturn && line.match(/\s+use[A-Z]/)) {
            console.log(`Potential violation in ${fullPath}:${i + 1}`);
            console.log(`Early return was at line ${earlyReturnLine}`);
            console.log(line);
          }
        }
      }
    }
  }
}

scanDir('src');
