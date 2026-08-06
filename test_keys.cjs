console.log("Keys loaded:");
const envs = ["G1", "G3", "G5", "G6", "G7", "GEMINI_API_KEY"];
for (const env of envs) {
  if (process.env[env]) console.log(env, "is present");
  else console.log(env, "is missing");
}
