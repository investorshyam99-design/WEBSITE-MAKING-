const process = {
  env: {
    G1: "key1",
    G3: "key3",
    GEMINI_API_KEY: "main",
    SOME_OTHER: "no",
  }
}
const apiKeys = Object.entries(process.env)
  .filter(([key, value]) => {
    const k = key.toUpperCase();
    return (
      k.includes("GEMINI") || 
      k.match(/^G[0-9]+$/) || 
      (k.includes("API_KEY") && !k.includes("RAZORPAY") && !k.includes("QIKINK"))
    ) && value && value.trim().length > 0;
  })
  .map(([_, value]) => value?.trim())
  .filter(Boolean);
console.log(apiKeys);
