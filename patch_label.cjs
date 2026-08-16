const fs = require('fs');

function patchLabel(code) {
  const search = `    if (action === 'label') {
      const response = await fetch(\`https://track.delhivery.com/api/p/packing_slip?wbns=\${awb}&pdf=true\`, { headers: { "Authorization": \`Token \${apiKey}\` } });
      const data = await response.json(); return res.json(data);
    }`;
    
  const replace = `    if (action === 'label') {
      const response = await fetch(\`https://track.delhivery.com/api/p/packing_slip?wbns=\${awb}&pdf=true\`, { headers: { "Authorization": \`Token \${apiKey}\` } });
      const data: any = await response.json();
      if (data && data.packages && data.packages.length > 0 && data.packages[0].pdf_download_link) {
        return res.redirect(data.packages[0].pdf_download_link);
      }
      return res.json(data);
    }`;
    return code.replace(search, replace);
}

let apiCode = fs.readFileSync('api/delhivery.ts', 'utf8');
apiCode = patchLabel(apiCode);
fs.writeFileSync('api/delhivery.ts', apiCode);

let serverCode = fs.readFileSync('server.ts', 'utf8');
serverCode = patchLabel(serverCode);
fs.writeFileSync('server.ts', serverCode);

console.log('patched label redirect');
