const fs = require('fs');

let content = fs.readFileSync('server.ts', 'utf8');

// The bug might be that deliveryType is in the required array. Wait, in lines 656 it is NOT in the required array. 
// "const required = ['fullName', 'phone', 'address', 'pincode', 'paymentMode'];"

// Oh wait, did my previous fix add it to another place? Let's check.
