async function fetchQikink(url) {
  const payload = {
    api_key: "54247f907400087c18b23dfce719caee2b50e2004db57d0e38e9d344f0443c7a",
    order_id: "test_" + Date.now()
  };
  try {
    const qikinkRes = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    console.log(url, qikinkRes.status);
  } catch (e) {
    console.log(url, "Error");
  }
}
fetchQikink("https://admin.qikink.com/index.php/api/api/create_order/");
fetchQikink("https://seller.qikink.com/index.php/api/api/create_order/");
fetchQikink("https://api.qikink.com/index.php/api/api/create_order/");
fetchQikink("https://dashboard.qikink.com/api/api/create_order/");
