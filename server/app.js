import express from "express";
import morgan from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from 'path';

import EstudiantesRoutes from "./routes/estudiantes.routes.js";
import UsuariosRoutes from "./routes/usuarios.routes.js";
import ComprobantesRoutes from "./routes/comprobantes.routes.js";
import CalendarRoutes from "./routes/calendar.routes.js";
import EmailsRoutes from "./routes/emails.routes.js";
import GmailRoutes from "./routes/gmail.routes.js";
import HealthRoutes from "./routes/health.routes.js";

const app = express();

app.use('/public', express.static('public'));
app.use('/comprobantes', express.static('comprobantes'));

// CORS
// - In development (NODE_ENV !== 'production') or when ALLOW_ALL_CORS=true, allow all origins and reflect the Origin header.
// - In production, fall back to a safe allowlist with limited LAN pattern support.
const allowAllCors = process.env.ALLOW_ALL_CORS === 'true' || process.env.NODE_ENV !== 'production';
const allowedOrigins = new Set([
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://192.168.0.14:5173',
    'http://192.168.0.16:5173',
]);

app.use(cors({
    origin: allowAllCors
        ? true // reflect request origin; enables credentials with any origin
        : (origin, callback) => {
            // Permitir orígenes conocidos o cualquier 192.168.x.x:5173 durante producción limitada
            const devLanMatch = origin && /^http:\/\/192\.168\.(?:\d{1,3})\.(?:\d{1,3}):5173$/.test(origin);
            if (!origin || allowedOrigins.has(origin) || devLanMatch) return callback(null, true);
            return callback(new Error('CORS not allowed for this origin: ' + origin));
        },
    credentials: true,
}));
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());

app.use("/api", EstudiantesRoutes);
app.use("/api", UsuariosRoutes);
app.use("/api", ComprobantesRoutes);
app.use("/api", CalendarRoutes);
app.use("/api", EmailsRoutes);
app.use("/api", GmailRoutes);
app.use("/api", HealthRoutes);

export default app;