// Load environment variables from .env and override existing ones (helps when OS vars are misquoted)
import dotenv from 'dotenv';
dotenv.config({ override: true });
import app from "./app.js";
import db from './db.js';
import http from 'http';
import { setupWebSocket } from './ws.js';

const PORT = 1002;
const server = http.createServer(app);
setupWebSocket(server);
server.listen(PORT, () => console.log('Conectado en el puerto', PORT));