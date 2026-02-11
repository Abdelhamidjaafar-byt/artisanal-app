import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000/api'; // Backend runs on 3000

const run = async () => {
    // 1. Login as Artisan
    console.log('Logging in...');
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'dadas@gmail.com', password: '12344321' })
    });

    const loginData = await loginRes.json();
    if (!loginRes.ok) {
        console.error('Login failed:', loginData);
        process.exit(1);
    }
    console.log('Login successful. Token:', loginData.token ? 'Yes' : 'No');
    const token = loginData.token;

    // 2. Get Orders
    console.log('Fetching orders...');
    const ordersRes = await fetch(`${BASE_URL}/orders/my-orders`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const orders = await ordersRes.json();

    if (!ordersRes.ok) {
        console.error('Fetch orders failed:', orders);
        process.exit(1);
    }
    console.log(`Found ${orders.length} orders.`);

    if (orders.length === 0) {
        console.error('No orders found to test update.');
        process.exit(1);
    }

    const orderId = orders[0]._id;
    const currentStatus = orders[0].status;
    console.log(`Testing update on order ${orderId}. Current status: ${currentStatus}`);

    // 3. Update Status
    const newStatus = "IN_FABRICATION"; // Valid status
    console.log(`Attempting to update status to ${newStatus}...`);

    const updateRes = await fetch(`${BASE_URL}/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
    });

    const updateData = await updateRes.json(); // May be error object
    const statusText = updateRes.statusText;
    const status = updateRes.status;

    console.log('---------------------------------------------------');
    console.log(`Response Status: ${status} ${statusText}`);
    console.log('Response Body:', JSON.stringify(updateData, null, 2));
    console.log('---------------------------------------------------');
};

run();
