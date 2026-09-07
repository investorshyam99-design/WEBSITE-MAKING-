const fs = require('fs');
let code = fs.readFileSync('src/pages/TrackOrderPage.tsx', 'utf8');

// Replace fetchTracking logic
code = code.replace(/const fetchTracking = async \(queryVal: string\) => \{[\s\S]*?const res = await fetch\(\`\/api\/delhivery\`/, `const fetchTracking = async (queryVal: string) => {
    if (!queryVal) return;
    setLoading(true);
    setError("");
    setTrackingData(null);
    try {
      let awbToTrack = queryVal;
      const res = await fetch(\`/api/delhivery\``);

// Replace UI text
code = code.replace(/Enter your Order Number or AWB to check delivery status./g, "Enter your AWB / Tracking Number to check delivery status.");
code = code.replace(/Order # or AWB Number/g, "AWB Number");

fs.writeFileSync('src/pages/TrackOrderPage.tsx', code, 'utf8');
