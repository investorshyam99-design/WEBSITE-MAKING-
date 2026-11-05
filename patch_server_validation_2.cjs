const fs = require('fs');
const path = 'server.ts';
let code = fs.readFileSync(path, 'utf8');

// Replace the old validation logic we added earlier
code = code.replace(
  /if \(price !== 500\) \{/g,
  'if (price !== 499) {'
);

code = code.replace(
  /const isBarca = allTags\.includes\('fc barcelona'\) \|\| allTags\.includes\('barcelona'\) \|\| nameLower\.includes\('barcelona'\);/g,
  `const isBarca = allTags.includes('fc barcelona') || allTags.includes('barcelona') || nameLower.includes('barcelona');
          const isPortugal = allTags.includes('portugal') || nameLower.includes('portugal');
          const isArgentina = allTags.includes('argentina') || nameLower.includes('argentina');`
);

code = code.replace(
  /if \(\(printName === "THANK GOD I AM NOT BARCELONISTA" \|\| printName === "12 YEARS NO UCL, THANK GOD I AM NOT A BARCA FAN"\) && !isMadrid\) \{[\s\S]*?return res\.status\(400\)\.json\(\{ error: "Invalid Cool Print for this team\." \}\);\n          \}/g,
  `if ((printName === "THANK GOD I AM NOT BARCELONISTA" || printName === "12 YEARS NO UCL, THANK GOD I AM NOT A BARCA FAN") && !isMadrid) {
             return res.status(400).json({ error: "Invalid Cool Print for this team." });
          }
          if (printName === "SHE WAS MY WORLD CUP, BUT I WAS RONALDO" && !isPortugal) {
             return res.status(400).json({ error: "Invalid Cool Print for this team." });
          }
          if (printName === "THE GOAT DEBATE ALREADY ENDED IN QATAR 2022" && !isArgentina) {
             return res.status(400).json({ error: "Invalid Cool Print for this team." });
          }`
);

code = code.replace(
  /if \(!isBarca && !isMadrid\) \{/g,
  'if (!isBarca && !isMadrid && !isPortugal && !isArgentina) {'
);

code = code.replace(
  /if \(item\.coolPrint\?\.selected\) \{/g,
  `if (item.coolPrint?.selected && item.customization) {
          return res.status(400).json({ error: "Cannot select both Customization and Cool Print on the same jersey." });
        }
        if (item.coolPrint?.selected) {`
);

fs.writeFileSync(path, code);
console.log("Success");
