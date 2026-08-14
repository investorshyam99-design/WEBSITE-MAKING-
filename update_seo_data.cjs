const fs = require('fs');

let file = fs.readFileSync('src/lib/seoData.ts', 'utf8');

file = file.replace(/title:\s*"Buy\s+(.*?)\s+Jersey\s+Online\s+India\s+\|\s+Jersey\s+Unicorn"/g, 'title: "$1 Football Jerseys India – Jersey Unicorn"');
file = file.replace(/title:\s*"Buy\s+(.*?)\s+Jerseys\s+Online\s+India\s+\|\s+Jersey\s+Unicorn"/g, 'title: "$1 Football Jerseys India – Jersey Unicorn"');
file = file.replace(/title:\s*"Buy\s+(.*?)\s+Jerseys\s+India\s+\|\s+Jersey\s+Unicorn"/g, 'title: "$1 Football Jerseys India – Jersey Unicorn"');
file = file.replace(/title:\s*"Buy\s+(.*?)\s+Online\s+India\s+\|\s+Jersey\s+Unicorn"/g, 'title: "$1 Football Jerseys India – Jersey Unicorn"');
file = file.replace(/title:\s*"(.*?)\s+\|\s+Jersey\s+Unicorn"/g, 'title: "$1 Football Jerseys India – Jersey Unicorn"');

fs.writeFileSync('src/lib/seoData.ts', file);
