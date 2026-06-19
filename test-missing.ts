async function fetchQikink() {
  const url = "https://api.qikink.com/api/order/create";
  const res = await fetch(url, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({})
  });
  console.log("No auth:", res.status, await res.text());
}
fetchQikink();
