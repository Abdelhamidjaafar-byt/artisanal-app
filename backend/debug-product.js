import http from 'http';

const id = '6989b69adf88a8df3229e420';
http.get(`http://localhost:3000/api/products/${id}`, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
        console.log(`Status: ${res.statusCode}`);
        console.log(data);
    });
}).on('error', (e) => {
    console.error(e);
});
