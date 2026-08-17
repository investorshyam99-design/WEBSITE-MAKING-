const fs = require('fs');
let code = fs.readFileSync('src/services/pincode.ts', 'utf8');

const search = `export async function checkPincodeServiceability(pincode: string): Promise<PincodeDetails> {
  if (!/^[1-9][0-9]{5}$/.test(pincode)) {
    return {
      isServiceable: false,
      message: "Please enter a valid Indian pincode.",
    };
  }`;

const replace = `
const pincodeCache = new Map<string, { data: PincodeDetails; timestamp: number }>();
const CACHE_TTL = 3600000; // 1 hour in ms

export async function checkPincodeServiceability(pincode: string): Promise<PincodeDetails> {
  if (!/^[1-9][0-9]{5}$/.test(pincode)) {
    return {
      isServiceable: false,
      message: "Please enter a valid Indian pincode.",
    };
  }

  const cached = pincodeCache.get(pincode);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
`;

if (code.includes(search)) {
    code = code.replace(search, replace);
    
    // now wrap the return to cache it
    code = code.replace(/return \{/g, 'const result = {').replace(/\};\n    \} else \{/g, '};\n      pincodeCache.set(pincode, { data: result, timestamp: Date.now() });\n      return result;\n    } else {')
    
    // just do manual patch instead of complex replace
}
console.log('will write manually');
