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
import SimulacionesRoutes from "./routes/simulaciones.routes.js";
import AreasRoutes from "./routes/areas.routes.js";
import StudentNotificationsRoutes from "./routes/student_notifications.routes.js";
import AsesorNotificationsRoutes from "./routes/asesor_notifications.routes.js";
import StudentRemindersRoutes from "./routes/student_reminders.routes.js";
import AsesorRemindersRoutes from "./routes/asesor_reminders.routes.js";
import AsesorResourcesRoutes from "./routes/asesor_resources.routes.js";
import StudentResourcesRoutes from "./routes/student_resources.routes.js";
import AdminResourcesRoutes from "./routes/admin_resources.routes.js";
import EEAURoutes from "./routes/eeau.routes.js";
import FinanzasRoutes from "./routes/finanzas.routes.js";
import StudentAreaAccessRoutes from "./routes/student_area_access.routes.js";
import GeminiRoutes from "./routes/gemini.routes.js";
import GroqRoutes from "./routes/groq.routes.js";
import AIQuotaRoutes from "./routes/ai_quota.routes.js";
import FormulasRoutes from "./routes/formulas.routes.js";
import AsistenciasRoutes from "./routes/asistencias.routes.js";
import DocumentosRoutes from "./routes/documentos.routes.js";
import LoggerRoutes from "./routes/logger.routes.js";
import GradingRoutes from "./routes/grading.routes.js";
import ChatRoutes from "./routes/chat.routes.js";
import AiUsageRoutes from "./routes/aiUsageRoutes.js";
import cursosRoutes from "./routes/cursos.routes.js";
import previewRoutes from "./routes/preview.routes.js";
import uploadsRoutes from "./routes/uploads.routes.js";

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
// CORS primero para que también afecte a archivos estáticos (PDFs, etc.) y evite fallos intermitentes en iframes
app.use(cors({
  origin: allowAllCors
    ? true
    : (origin, callback) => {
      // Permitir solicitudes sin origen (como apps móviles o curl)
      if (!origin) return callback(null, true);

      // Permitir localhost y dominios locales
      if (allowedOrigins.has(origin)) return callback(null, true);

      // Regex robusto para redes privadas (LAN):
      // 192.168.x.x
      // 10.x.x.x
      // 172.16.x.x - 172.31.x.x
      const privateIpRegex = /^http:\/\/(?:192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(?:1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3})(?::\d+)?$/;

      if (privateIpRegex.test(origin)) {
        return callback(null, true);
      }

      console.warn(`[CORS] Bloqueado origen no permitido: ${origin}`);
      return callback(new Error('CORS not allowed for this origin: ' + origin));
    },
  credentials: true,
}));

// Archivos estáticos (después de CORS para incluir cabeceras)
app.use('/public', express.static('public'));
app.use('/comprobantes', express.static('comprobantes'));
app.use('/contratos', express.static('contratos'));
app.use('/uploads/asesores', express.static('uploads/asesores'));
app.use('/uploads/recursos-educativos', express.static('uploads/recursos-educativos'));
app.use('/uploads/documentos', express.static('uploads/documentos'));
app.use('/uploads/chat', express.static('uploads/chat'));
app.use('/uploads/preguntas', express.static('uploads/preguntas'));
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
app.use("/api", SimulacionesRoutes);
app.use("/api", AreasRoutes);
app.use("/api", StudentNotificationsRoutes);
app.use("/api", AsesorNotificationsRoutes);
app.use("/api", StudentRemindersRoutes);
app.use("/api", AsesorRemindersRoutes);
app.use("/api", AsesorResourcesRoutes);
app.use("/api", StudentResourcesRoutes);
app.use("/api", AdminResourcesRoutes);
app.use("/api", EEAURoutes);
app.use("/api", FinanzasRoutes);
app.use("/api", StudentAreaAccessRoutes);
app.use("/api", GeminiRoutes);
app.use("/api", GroqRoutes);
app.use("/api", AIQuotaRoutes);
app.use("/api", FormulasRoutes);
app.use("/api", AsistenciasRoutes);
app.use("/api/documentos", DocumentosRoutes);
app.use("/api", LoggerRoutes);
app.use("/api/grading", GradingRoutes);
app.use("/api", ChatRoutes);
app.use("/api/ai-usage", AiUsageRoutes);
app.use("/api", cursosRoutes);
app.use("/api", previewRoutes);
app.use("/api", uploadsRoutes);

// Middleware de manejo de errores global (debe ir al final, después de todas las rutas)
app.use((err, req, res, next) => {
  console.error('[ERROR HANDLER]', {
    path: req.path,
    method: req.method,
    message: err?.message,
    code: err?.code,
    errno: err?.errno,
    stack: process.env.NODE_ENV !== 'production' ? err?.stack : undefined
  });

  // Si la respuesta ya fue enviada, delegar al handler por defecto de Express
  if (res.headersSent) {
    return next(err);
  }

  // Para rutas críticas como health y eeau, intentar devolver respuestas útiles
  const path = req.path || req.originalUrl || '';
  const isHealth = path === '/api/health' || path === '/health' || path.includes('/health');
  const isEEAU = path === '/api/eeau' || path === '/eeau' || path.includes('/eeau');

  if (isHealth) {
    return res.status(200).json({
      ok: false,
      db: { ok: false, error: err?.message || 'Unknown error' },
      timestamp: new Date().toISOString()
    });
  }

  if (isEEAU) {
    return res.status(200).json({
      data: {
        id: null,
        codigo: 'EEAU',
        titulo: 'Programa EEAU',
        asesor: 'Kelvin Valentin Ramirez',
        duracion_meses: 8,
        imagen_portada: '/public/eeau_portada.png',
        activo: 1,
      },
      fallback: true,
      error: err?.message || String(err)
    });
  }

  // Para otras rutas, devolver error 500 estándar
  res.status(err?.status || 500).json({
    message: err?.message || 'Internal server error',
    ...(process.env.NODE_ENV !== 'production' && { stack: err?.stack })
  });
});

// Manejo de rutas no encontradas (404)
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found', path: req.path });
});

export default app;