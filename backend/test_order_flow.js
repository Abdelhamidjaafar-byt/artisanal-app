
import fetch from "node-fetch";

const BASE_URL = "http://localhost:3000/api";

async function testOrderFlow() {
    console.log("🚀 Starting Order Flow Test...");

    try {
        // 1. Client Login
        console.log("\n1. Logging in as Client...");
        const clientRes = await fetch(`${BASE_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: "john@client.com", password: "client123" })
        });
        const clientData = await clientRes.json();

        if (!clientRes.ok) throw new Error(`Client Login Failed: ${clientData.message}`);
        const clientToken = clientData.token;
        console.log("✅ Client Logged In");

        // 2. Get Products (Find a product from Ahmed)
        console.log("\n2. Fetching Products...");
        const productsRes = await fetch(`${BASE_URL}/products`);
        const products = await productsRes.json();

        if (!products || products.length === 0) throw new Error("No products found");

        // Find "Traditional Berber Rug" or any product
        const product = products.find(p => p.title.includes("Rug")) || products[0];
        console.log(`✅ Selected Product: ${product.title} (ID: ${product._id})`);

        // 3. Create Order
        console.log("\n3. Creating Order...");
        const orderPayload = {
            items: [{
                product: product._id,
                quantity: 1,
                customizationDetails: "Test Customization"
            }],
            shippingAddress: "Test Address, 123 Street",
            paymentInfo: { method: "stripe", status: "pending" }
        };

        const createOrderRes = await fetch(`${BASE_URL}/orders`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${clientToken}`
            },
            body: JSON.stringify(orderPayload)
        });

        const orderData = await createOrderRes.json();
        if (!createOrderRes.ok) {
            console.error("Order Creation Error Response:", JSON.stringify(orderData, null, 2));
            throw new Error(`Order Creation Failed: ${orderData.message}`);
        }

        const order = Array.isArray(orderData) ? orderData[0] : orderData;
        const orderId = order._id;
        console.log(`✅ Order Created! ID: ${orderId}`);
        console.log(`   Status: ${order.status}`);

        // 4. Artisan Login
        console.log("\n4. Logging in as Artisan...");
        const artisanRes = await fetch(`${BASE_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: "ahmed@artisan.com", password: "artisan123" })
        });
        const artisanData = await artisanRes.json();

        if (!artisanRes.ok) throw new Error(`Artisan Login Failed: ${artisanData.message}`);
        const artisanToken = artisanData.token;
        console.log("✅ Artisan Logged In");

        // 5. Update Order Status
        console.log("\n5. Updating Order Status to 'manufacturing'...");
        const updateRes = await fetch(`${BASE_URL}/orders/${orderId}/status`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${artisanToken}`
            },
            body: JSON.stringify({ status: "IN_FABRICATION" })
        });

        const updateData = await updateRes.json();
        if (!updateRes.ok) {
            console.error("Update Status Error Response:", JSON.stringify(updateData, null, 2));
            throw new Error(`Update Failed: ${updateData.message}`);
        }

        console.log(`✅ Order Status Updated to: ${updateData.status}`);

        // 6. Verify Update as Client
        console.log("\n6. Verifying Order Status as Client...");
        const verifyRes = await fetch(`${BASE_URL}/orders/${orderId}`, {
            headers: {
                "Authorization": `Bearer ${clientToken}`
            }
        });

        const verifiedOrder = await verifyRes.json();
        if (verifiedOrder.status !== "IN_FABRICATION") {
            throw new Error(`Verification Failed! Expected 'IN_FABRICATION', got '${verifiedOrder.status}'`);
        }
        console.log("✅ Client sees correct status: IN_FABRICATION");

        console.log("\n🎉 TEST PASSED SUCCESSFULLY!");

    } catch (error) {
        console.error("\n❌ TEST FAILED:", error.message);
    }
}

testOrderFlow();
