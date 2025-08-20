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
import AsesoresRoutes from "./routes/asesores.routes.js";
import FeedbackRoutes from "./routes/feedback.routes.js";
import ActividadesRoutes from "./routes/actividades.routes.js";
import QuizzesRoutes from "./routes/quizzes.routes.js";
import AreasRoutes from "./routes/areas.routes.js";
import StudentNotificationsRoutes from "./routes/student_notifications.routes.js";

const app = express();

// CORS

const allowAllCors = process.env.ALLOW_ALL_CORS === 'true' || process.env.NODE_ENV !== 'production';
const allowedOrigins = new Set([
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://192.168.0.14:5173',
    'http://192.168.0.16:5173',
]);

// CORS primero para que también afecte a archivos estáticos (PDFs, etc.) y evite fallos intermitentes en iframes
app.use(cors({
    origin: allowAllCors
        ? true
        : (origin, callback) => {
            const devLanMatch = origin && /^http:\/\/192\.168\.(?:\d{1,3})\.(?:\d{1,3}):5173$/.test(origin);
            if (!origin || allowedOrigins.has(origin) || devLanMatch) return callback(null, true);
            return callback(new Error('CORS not allowed for this origin: ' + origin));
        },
    credentials: true,
}));

// Archivos estáticos (después de CORS para incluir cabeceras)
app.use('/public', express.static('public'));
app.use('/comprobantes', express.static('comprobantes'));
app.use('/contratos', express.static('contratos'));
app.use('/uploads/asesores', express.static('uploads/asesores'));
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());

// Debug middleware para inspeccionar cookies entrantes en rutas clave (solo desarrollo)
if (process.env.NODE_ENV !== 'production') {
    app.use((req, _res, next) => {
        if (req.path === '/api/login' || req.path === '/api/verify' || req.path === '/api/token/refresh') {
            console.log('[REQ]', req.method, req.path, 'CookieHeader=', req.headers.cookie || '(none)');
        }
        next();
    });
    // Endpoint auxiliar para ver qué cookies detecta el servidor
    app.get('/api/debug/cookies', (req, res) => {
        res.json({ cookies: req.cookies || {} });
    });
}

app.use("/api", EstudiantesRoutes);
app.use("/api", UsuariosRoutes);
app.use("/api", ComprobantesRoutes);
app.use("/api", CalendarRoutes);
app.use("/api", EmailsRoutes);
app.use("/api", GmailRoutes);
app.use("/api", HealthRoutes);
app.use("/api", AsesoresRoutes);
app.use("/api", FeedbackRoutes);
app.use("/api", ActividadesRoutes);
app.use("/api", QuizzesRoutes);
app.use("/api", AreasRoutes);
app.use("/api", StudentNotificationsRoutes);

export default app;