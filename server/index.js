// Load environment variables from .env and override existing ones (helps when OS vars are misquoted)
import dotenv from 'dotenv';
dotenv.config({ override: true });
import app from "./app.js";
import db from './db.js';
import http from 'http';
import { setupWebSocket } from './ws.js';
import { ensureEstatusColumn } from './models/estudiantes.model.js';
import { ensureEEAUTable } from './models/eeau.model.js';

const PORT = Number(process.env.PORT) || 1002;
const server = http.createServer(app);

// Ensure DB has required structures before accepting requests
Promise.all([
	ensureEstatusColumn().catch(() => {}),
	ensureEEAUTable().catch(() => {})
]).catch(()=>{});
setupWebSocket(server);
server.listen(PORT, () => console.log('Conectado en el puerto', PORT));