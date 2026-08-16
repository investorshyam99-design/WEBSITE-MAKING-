const fs = require('fs');
let file = fs.readFileSync('src/App.tsx', 'utf8');

if (!file.includes('TrackOrderPage')) {
  file = file.replace(/import \{ AccountPage \} from "\.\/pages\/AccountPage";/, 'import { AccountPage } from "./pages/AccountPage";\nimport { TrackOrderPage } from "./pages/TrackOrderPage";');
  file = file.replace(/<Route path="\/account" element=\{<AccountPage \/>\} \/>/, '<Route path="/account" element={<AccountPage />} />\n        <Route path="/track" element={<TrackOrderPage />} />');
  fs.writeFileSync('src/App.tsx', file);
}
