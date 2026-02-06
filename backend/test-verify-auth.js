// using built-in fetch

// If node-fetch isn't available, we rely on Node 18+ built-in fetch.
// Since you are on Node 24, global fetch is available.

const API_URL = 'http://localhost:3000/api/auth';
const TEST_USER = {
    email: "postman1@test.com",
    password: "password123"
};

async function testAuthFlow() {
    console.log("1. Attempting Login...");
    try {
        const loginRes = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(TEST_USER)
        });

        if (!loginRes.ok) {
            const errText = await loginRes.text();
            throw new Error(`Login Failed: ${loginRes.status} ${loginRes.statusText} - ${errText}`);
        }

        const loginData = await loginRes.json();
        console.log("✅ Login Successful!");

        const token = loginData.token;
        if (!token) throw new Error("No token received in login response");
        console.log(`🔑 Token received: ${token.substring(0, 20)}...`);

        console.log("\n2. Accessing Protected Route (/test)...");
        const protectedRes = await fetch(`${API_URL}/test`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!protectedRes.ok) {
            const errText = await protectedRes.text();
            throw new Error(`Protected Route Failed: ${protectedRes.status} ${protectedRes.statusText} - ${errText}`);
        }

        const protectedData = await protectedRes.json();
        console.log("✅ Protected Route Accessed Successfully!");
        console.log("📄 Response:", protectedData);

    } catch (error) {
        console.error("❌ Test Failed:", error.message);
    }
}

testAuthFlow();
