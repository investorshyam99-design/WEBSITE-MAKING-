const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const search = `          let errorMsg = "Failed to create shipment.";
          if (data.packages && data.packages.length > 0 && data.packages[0].remarks && data.packages[0].remarks.length > 0) {
            errorMsg = data.packages[0].remarks.join(" ");
          } else if (typeof data.error === "string") {
            errorMsg = data.error;
          } else if (data.rmk) {
            errorMsg = data.rmk;
          } else if (data.error) {
            errorMsg = JSON.stringify(data.error);
          }`;

const replace = `          let errorMsg = "Failed to create shipment.";
          if (data.packages && data.packages.length > 0 && data.packages[0].remarks && data.packages[0].remarks.length > 0) {
            errorMsg = data.packages[0].remarks.join(" ");
          } else if (typeof data.error === "string") {
            errorMsg = data.error;
          } else if (data.rmk) {
            errorMsg = data.rmk;
          } else if (data.error !== undefined) {
            errorMsg = JSON.stringify(data.error);
          }
          
          errorMsg = String(errorMsg); // Ensure it is always a string`;

if (code.includes(search)) {
    code = code.replace(search, replace);
    fs.writeFileSync('server.ts', code);
    console.log('patched server.ts errorMsg stringification');
} else {
    console.log('could not find search string in server.ts');
}
