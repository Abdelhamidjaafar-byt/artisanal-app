// using built-in fetch
const API_URL = 'http://localhost:3000/api';

const ARTISAN_USER = {
    name: "Artisan Test",
    email: `artisan_${Date.now()}@test.com`, // Unique email
    password: "password123",
    role: ["ARTISAN"]
};

let authToken = "";
let createdProductId = "";

async function testProductCRUD() {
    console.log("🚀 Starting Product CRUD Test...");

    try {
        // 1. Register/Login as Artisan
        console.log("\n1️⃣  Registering Artisan...");
        const authRes = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(ARTISAN_USER)
        });

        if (!authRes.ok) throw new Error(await authRes.text());
        const authData = await authRes.json();
        authToken = authData.token || authData.user?.token; // Adjust based on your API response structure, your login returns { token, user }

        // If register logs in automatically (passport req.login), it might not return token directly in some implementations, 
        // but your controller returns { message, user }.
        // Wait, looking at auth.controller.js: register returns { message, user }, BUT NOT TOKEN.
        // Login returns { token, user }.
        // So we need to Login after Register if Register doesn't return token.

        console.log("   (Registration successful, now helping to login...)");
        const loginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: ARTISAN_USER.email, password: ARTISAN_USER.password })
        });
        const loginData = await loginRes.json();
        authToken = loginData.token;

        console.log("✅ Authenticated! Token:", authToken.substring(0, 15) + "...");

        // 2. Create Product
        console.log("\n2️⃣  Creating Product...");
        const productRes = await fetch(`${API_URL}/products`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
                title: "Test Pottery",
                description: "Automated test description",
                price: 50,
                stock: 5,
                category: "Pottery"
            })
        });

        if (!productRes.ok) throw new Error(`Create Failed: ${await productRes.text()}`);
        const productData = await productRes.json();
        createdProductId = productData._id;
        console.log("✅ Product Created! ID:", createdProductId);

        // 3. Get Products (Public)
        console.log("\n3️⃣  Reading Products...");
        const getRes = await fetch(`${API_URL}/products`);
        const products = await getRes.json();
        console.log(`✅ Fetched ${products.length} products.`);
        const found = products.find(p => p._id === createdProductId);
        if (found) console.log("   Found our new product in the list.");

        // 4. Update Product
        console.log("\n4️⃣  Updating Product...");
        const updateRes = await fetch(`${API_URL}/products/${createdProductId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ price: 75, stock: 4 })
        });
        if (!updateRes.ok) throw new Error(`Update Failed: ${await updateRes.text()}`);
        const updatedData = await updateRes.json();
        console.log("✅ Product Updated! New Price:", updatedData.price);

        // 5. Delete Product
        console.log("\n5️⃣  Deleting Product...");
        const deleteRes = await fetch(`${API_URL}/products/${createdProductId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        if (!deleteRes.ok) throw new Error(`Delete Failed: ${await deleteRes.text()}`);
        console.log("✅ Product Deleted!");

    } catch (error) {
        console.error("❌ Test Failed:", error);
    }
}

testProductCRUD();
