// Load environment variables from .env and override existing ones (helps when OS vars are misquoted)
import dotenv from 'dotenv';
dotenv.config({ override: true });
import app from "./app.js";
import db from './db.js';
import http from 'http';
import os from 'os';
import { setupWebSocket } from './ws.js';
import { ensureEstatusColumn } from './models/estudiantes.model.js';
import { ensureEEAUTable } from './models/eeau.model.js';
import { schedulePlantillasJob } from './jobs/plantillasAuto.js';

const PORT = Number(process.env.PORT) || 1002;
const HOST = process.env.HOST || '0.0.0.0';
const server = http.createServer(app);

// Ensure DB has required structures before accepting requests
Promise.all([
	ensureEstatusColumn().catch(() => {}),
	ensureEEAUTable().catch(() => {})
]).catch(()=>{});
setupWebSocket(server);
server.listen(PORT, HOST, () => {
	console.log(`[server] Escuchando en http://${HOST === '0.0.0.0' ? '0.0.0.0' : HOST}:${PORT}`);
	// Imprimir URLs de red locales útiles
	try {
		const nets = os.networkInterfaces();
		const addrs = [];
		for (const name of Object.keys(nets)) {
			for (const net of nets[name] || []) {
				if (net.family === 'IPv4' && !net.internal) addrs.push(net.address);
			}
		}
		if (addrs.length) {
			console.log('[server] Acceso LAN:');
			for (const ip of addrs) console.log(`  -> http://${ip}:${PORT}`);
		}
	} catch {}
	try {
		// Programar job diario (hora México). Se puede ajustar con PLANTILLAS_CRON y TZ
		schedulePlantillasJob();
	} catch (e) {
		console.error('[plantillasAuto] No se pudo programar el cron', e);
	}
});