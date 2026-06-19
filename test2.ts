async function fetchQikink() {
  const qikinkRes = await fetch("https://qikink.com/index.php/api/api/create_order/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({})
  });
  console.log(qikinkRes.status);
  const text = await qikinkRes.text();
  console.log(text.substring(0, 500));
}
fetchQikink();
