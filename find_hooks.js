const fs = require('fs');
const glob = require('glob');

// Since glob might not be installed, we can just use fs.readdirSync recursively
function getFiles(dir, files_) {
  files_ = files_ || [];
  let files = fs.readdirSync(dir);
  for (let i in files) {
    let name = dir + '/' + files[i];
    if (fs.statSync(name).isDirectory()) {
      getFiles(name, files_);
    } else if (name.endsWith('.tsx') || name.endsWith('.ts')) {
      files_.push(name);
    }
  }
  return files_;
}

const files = getFiles('src');

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  
  let currentComponent = null;
  let hasReturned = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Naive component boundary detection
    if (line.match(/^(export )?(function|const) [A-Z][a-zA-Z0-9_]*.*=>|^(export )?function [A-Z]/)) {
      currentComponent = line;
      hasReturned = false;
    }
    
    if (currentComponent) {
      if (line.match(/^[ \t]*if[ \t]*\(.*return /) || line.match(/^[ \t]*return /)) {
        // If it's a return, check if it's returning JSX or null, inside the component body
        // We'll just flag if there is an early return
        if (line.match(/return[ \t]*(null|;|true|false|[a-zA-Z0-9]+;)/) || line.match(/return[ \t]*\(/)) {
           // this might be an early return
           if (!hasReturned) {
               hasReturned = i + 1;
           }
        }
      }
      
      if (hasReturned && line.match(/^[ \t]*(const \[.*\] = use|useEffect|useMemo|useCallback|useRef|useContext)/)) {
        // check if this hook is inside the same block (heuristically, if it has a small indent)
        const indent = line.match(/^[ \t]*/)[0].length;
        if (indent <= 4) { // usually hooks are at indent 2
            console.log(`POTENTIAL VIOLATION in ${file}: hook at line ${i+1} after return at line ${hasReturned}\n  Hook: ${line.trim()}`);
        }
      }
      
      // Reset if we see the end of the component
      if (line.match(/^}/)) {
        currentComponent = null;
        hasReturned = false;
      }
    }
  }
});
