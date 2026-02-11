import fetch from 'node-fetch';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const BASE_URL = 'http://localhost:3000/api';

async function checkAlexProfile() {
    try {
        console.log('Logging in as alex...');
        const loginRes = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'alexnorth@gmail.com',
                password: 'password123'
            })
        });

        const loginData = await loginRes.json();
        if (!loginRes.ok) throw new Error(`Login failed: ${loginData.message}`);

        const token = loginData.token;
        console.log('Logged in!');

        const profileRes = await fetch(`${BASE_URL}/users/profile`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        const profileData = await profileRes.json();
        console.log('Profile Response (isApproved):', profileData.isApproved);
        console.log('Full Profile Data:', JSON.stringify(profileData, null, 2));

    } catch (err) {
        console.error('Error:', err.message);
    }
}

checkAlexProfile();
