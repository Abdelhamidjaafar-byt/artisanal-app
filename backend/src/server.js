import "./config/env.js";
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import http from "http";
import app from "./app.js";
import connectDB from "./config/db.js";
import socketHandler from "./socket.js";

const server = http.createServer(app);
socketHandler(server);

const PORT = process.env.PORT || 5000;

connectDB();

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
