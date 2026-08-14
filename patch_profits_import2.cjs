const fs = require('fs');
let file = fs.readFileSync('src/components/AdminProfitsDashboard.tsx', 'utf8');

file = file.replace(/import \{ db \} from '\.\.\/lib\/firebase';/, "import { db } from '../lib/firebase';\nimport { getOrderCalculations } from '../lib/utils';");

if (!file.includes('getOrderCalculations')) {
    file = file.replace(/import \{ db \} from "\.\.\/lib\/firebase";/, "import { db } from '../lib/firebase';\nimport { getOrderCalculations } from '../lib/utils';");
}

fs.writeFileSync('src/components/AdminProfitsDashboard.tsx', file);
