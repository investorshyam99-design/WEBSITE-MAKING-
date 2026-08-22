const fs = require('fs');

let content = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

// 1. Add initial state
const stateBlock = `  const [paymentEditTotal, setPaymentEditTotal] = useState<string>("");
  const [paymentEditPaid, setPaymentEditPaid] = useState<string>("");
  const [paymentEditCod, setPaymentEditCod] = useState<string>("");`;

const newStateBlock = `  const [paymentEditTotal, setPaymentEditTotal] = useState<string>("");
  const [paymentEditPaid, setPaymentEditPaid] = useState<string>("");
  const [paymentEditCod, setPaymentEditCod] = useState<string>("");
  const [initialPaymentEditTotal, setInitialPaymentEditTotal] = useState<string>("");
  const [initialPaymentEditPaid, setInitialPaymentEditPaid] = useState<string>("");
  const [initialPaymentEditCod, setInitialPaymentEditCod] = useState<string>("");`;

content = content.replace(stateBlock, newStateBlock);
fs.writeFileSync('src/components/AdminDashboard.tsx', content, 'utf8');
console.log('Patched state declarations');
