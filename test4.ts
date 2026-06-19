import http from "http";

async function fetchQikink(url) {
  const payload = {
    api_key: "54247f907400087c18b23dfce719caee2b50e2004db57d0e38e9d344f0443c7a",
    order_id: "test_" + Date.now(),
    first_name: "Test",
    last_name: "User",
    address: "Address",
    city: "City",
    state: "State",
    pincode: "123456",
    phone_number: "9876543210",
    payment_method: "Prepaid",
    order_items: [{ product_id: "JERSEY", quantity: 1, size: "M" }]
  };
  const qikinkRes = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  console.log(url, qikinkRes.status);
  const text = await qikinkRes.text();
  console.log(text);
}
fetchQikink("https://qikink.com/index.php/api/api/create_order/");
