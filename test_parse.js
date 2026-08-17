const data = {  "cash_pickups_count": 0,  "package_count": 1,  "prepaid_count": 0,  "pickups_count": 0,  "replacement_count": 0,  "cash_pickups": 0,  "cod_amount": 0,  "cod_count": 0,  "upload_wbn": "UPL14765554496171951366",  "packages": [    {      "waybill": "",      "refnum": "TEST-123456789",      "client": "758ada-Thefashionhouse-do",      "payment": "COD",      "cod_amount": 999,      "status": "Fail",      "sort_code": "KLT/MDH",      "serviceable": true,      "err_code": "ER0005",      "remarks": [        "Crashing while saving package due to exception suspicious order/consignee. Package might have been partially saved."      ]    }  ],  "success": false,  "rmk": "An internal Error has occurred, Please get in touch with client.support@delhivery.com"};

let errorMsg = "Failed to create shipment.";
if (data.packages && data.packages.length > 0 && data.packages[0].remarks && data.packages[0].remarks.length > 0) {
  errorMsg = data.packages[0].remarks.join(" ");
} else if (typeof data.error === "string") {
  errorMsg = data.error;
} else if (data.rmk) {
  errorMsg = data.rmk;
} else if (data.error) {
  errorMsg = JSON.stringify(data.error);
}
console.log(errorMsg);
