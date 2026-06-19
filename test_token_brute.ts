async function brute() {
  const urls = ["https://api.qikink.com/api/token", "https://api-sandbox.qikink.com/api/token", "https://sandbox.qikink.com/api/token"];
  const id = "873512293843020";
  const sec = "54247f907400087c18b23dfce719caee2b50e2004db57d0e38e9d344f0443c7a";
  
  const combos = [
    { ClientId: id, client_secret: sec },
    { client_id: id, client_secret: sec },
    { clientId: id, clientSecret: sec },
    { ClientId: id, ClientSecret: sec },
    { client_id: id, client_secret: sec, grant_type: "client_credentials" },
  ];

  for (const url of urls) {
    for (const c of combos) {
      const postData = new URLSearchParams(c as any).toString();
      try {
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: postData
        });
        console.log(url, JSON.stringify(c), res.status, await res.text());
      } catch(e) {
        console.log(url, "Failed");
      }
    }
  }
}
brute();
