import http from 'http';

const check = (url, name) => {
    const req = http.get(url, (res) => {
        console.log(`${name}: UP (Status: ${res.statusCode})`);
        res.resume();
    }).on('error', (e) => {
        console.log(`${name}: DOWN (Error: ${e.message})`);
    });
};

check('http://localhost:3000/api/products', 'Backend API');
check('http://localhost:5173', 'Frontend Server');
