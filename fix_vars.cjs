const fs = require('fs');

const path = 'src/pages/CheckoutPage.tsx';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  /const \[address, setHouseNo\] = useState\(""\);\s*const \[areaStreet, setAreaStreet\] = useState\(""\);\s*const \[city, setCity\] = useState\(deliveryLocation\?\.city \|\| ""\);\s*const \[state, setState\] = useState\(deliveryLocation\?\.state \|\| ""\);/g,
  'const [address, setAddress] = useState("");'
);

code = code.replace(
  /deliveryCity: deliveryLocation\?\.city \|\| city,/g,
  'deliveryCity: deliveryLocation?.city || "",'
);

code = code.replace(
  /deliveryState: deliveryLocation\?\.state \|\| state,/g,
  'deliveryState: deliveryLocation?.state || "",'
);

code = code.replace(
  /address,\s*areaStreet,\s*city,\s*state,/g,
  'address,'
);

fs.writeFileSync(path, code);
console.log("Success");
