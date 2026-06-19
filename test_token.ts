async function testToken() {
  const clientId = "873512293843020";
  const clientSecret = "54247f907400087c18b23dfce719caee2b50e2004db57d0e38e9d344f0443c7a";

  const postData = new URLSearchParams({
    ClientId: clientId,
    client_secret: clientSecret
  }).toString();

  const res = await fetch("https://api.qikink.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: postData
  });

  console.log("Status:", res.status);
  console.log("Body:", await res.text());
}
testToken();
