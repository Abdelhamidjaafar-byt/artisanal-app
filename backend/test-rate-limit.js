import fetch from "node-fetch";

const API_URL = "http://localhost:5000/api/auth/login";

async function testRateLimit() {
    console.log("Starting rate limit test...");

    for (let i = 1; i <= 7; i++) {
        console.log(`\nAttempt ${i}:`);
        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email: "test@example.com",
                    password: "wrongpassword"
                })
            });

            const data = await response.json();
            console.log(`Status: ${response.status}`);
            console.log(`Response: ${JSON.stringify(data)}`);

            if (response.status === 429) {
                console.log("SUCCESS: Rate limit hit!");
            }
        } catch (error) {
            console.error(`Error on attempt ${i}:`, error.message);
        }
    }
}

testRateLimit();
