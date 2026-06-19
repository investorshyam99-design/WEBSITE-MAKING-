async function fetchQikink(clientId, accessToken) {
  const url = "https://api.qikink.com/api/order/create";
  
  // Basic Auth
  const res1 = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Basic " + Buffer.from(clientId + ":" + accessToken).toString('base64')
    },
    body: JSON.stringify({})
  });
  console.log("Basic Auth test:", res1.status, await res1.text());

  // Bearer Token
  const res2 = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + accessToken
    },
    body: JSON.stringify({ client_id: clientId })
  });
  console.log("Bearer test:", res2.status, await res2.text());
}
fetchQikink("873512293843020", "54247f907400087c18b23dfce719caee2b50e2004db57d0e38e9d344f0443c7a");
