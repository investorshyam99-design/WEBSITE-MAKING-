async function testToken() {
  const clientId = "873512293843020";
  const clientSecret = "54247f907400087c18b23dfce719caee2b50e2004db57d0e38e9d344f0443c7a";

  const postData = new URLSearchParams({
    ClientId: clientId,
    client_secret: clientSecret
  }).toString();

  for (const url of ["https://api-sandbox.qikink.com/api/token", "https://api-dev.qikink.com/api/token"]) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: postData
      });

      console.log(url, res.status, await res.text());
    } catch(e) {
      console.log(url, "Fetch failed");
    }
  }
}
testToken();
