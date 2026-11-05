const fs = require('fs');
const path = 'server.ts';
let code = fs.readFileSync(path, 'utf8');

const validationLogic = `
      // Validate Cool Print pricing & team logic on backend
      for (const item of items) {
        if (item.coolPrint?.selected) {
          const printName = item.coolPrint.name;
          const price = item.coolPrint.price;
          const allTags = item.tags || [];
          const nameLower = (item.name || "").toLowerCase();
          const isBarca = allTags.includes('fc barcelona') || allTags.includes('barcelona') || nameLower.includes('barcelona');
          const isMadrid = allTags.includes('real madrid') || nameLower.includes('real madrid');
          
          if (price !== 500) {
            return res.status(400).json({ error: "Invalid Cool Print price." });
          }
          
          if (printName === "THANK GOD I AM NOT MADRIDISTA" && !isBarca) {
            return res.status(400).json({ error: "Invalid Cool Print for this team." });
          }
          
          if ((printName === "THANK GOD I AM NOT BARCELONISTA" || printName === "12 YEARS NO UCL, THANK GOD I AM NOT A BARCA FAN") && !isMadrid) {
             return res.status(400).json({ error: "Invalid Cool Print for this team." });
          }
          
          if (!isBarca && !isMadrid) {
             return res.status(400).json({ error: "Cool Prints not allowed for this product." });
          }
        }
      }
`;

code = code.replace(
  /const \{ deliveryMethod \} = req\.body;/g,
  'const { deliveryMethod } = req.body;\n' + validationLogic
);

fs.writeFileSync(path, code);
console.log("Success");
