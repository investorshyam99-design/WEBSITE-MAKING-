const keys = Object.keys(process.env).filter(k => k.includes("GEMINI") || /^G[1-9]$/.test(k) || /API_KEY/.test(k));
console.log(keys);
