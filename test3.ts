async function fetchQikink(url) {
  const qikinkRes = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({})
  });
  console.log(url, qikinkRes.status);
  const text = await qikinkRes.text();
  console.log(text.substring(0, 100));
}
fetchQikink("https://dashboard.qikink.com/index.php/api/api/create_order/");
fetchQikink("https://dashboard.qikink.com/api/create_order/");
