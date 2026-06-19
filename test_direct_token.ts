async function testDirectToken() {
  const url = "https://api.qikink.com/api/order/create";
  const clientId = "873512293843020";
  const accessToken = "54247f907400087c18b23dfce719caee2b50e2004db57d0e38e9d344f0443c7a";

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "ClientId": clientId,
      "Accesstoken": accessToken
    },
    body: JSON.stringify({})
  });
  console.log("Status:", res.status);
  console.log("Body:", await res.text());
}
testDirectToken();
