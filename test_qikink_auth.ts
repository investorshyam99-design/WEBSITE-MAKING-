import https from "https";

async function scrape() {
  // Let's just pass clientToken and accessToken in different ways
  const url = "https://api.qikink.com/api/order/create";
  
  const combos = [
    {headers: {"client_id": "873512293843020", "access_token": "54247f907400087c18b23dfce719caee2b50e2004db57d0e38e9d344f0443c7a"}},
    {body: {"client_id": "873512293843020", "access_token": "54247f907400087c18b23dfce719caee2b50e2004db57d0e38e9d344f0443c7a"}},
    {body: {"ClientId": "873512293843020", "AccessToken": "54247f907400087c18b23dfce719caee2b50e2004db57d0e38e9d344f0443c7a"}},
    {body: {"clientId": "873512293843020", "accessToken": "54247f907400087c18b23dfce719caee2b50e2004db57d0e38e9d344f0443c7a"}},
    {headers: {"Client-Id": "873512293843020", "Access-Token": "54247f907400087c18b23dfce719caee2b50e2004db57d0e38e9d344f0443c7a"}},
    {headers: {"X-Client-Id": "873512293843020", "X-Access-Token": "54247f907400087c18b23dfce719caee2b50e2004db57d0e38e9d344f0443c7a"}},
  ];

  for (const combo of combos) {
     const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(combo.headers || {}) },
        body: JSON.stringify({...combo.body, "orders": []})
     });
     console.log("Status:", res.status, await res.text());
  }
}
scrape();
