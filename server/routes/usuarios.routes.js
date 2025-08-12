import { Router } from "express";
import { obtener, crear, login, verifyToken, obtenerUno, logout, registrarAdmin, registrarAdminBootstrap, getAdminProfile, getBootstrapStatus, updateAdminProfile, updateAdminPhoto, changePassword, softDeleteSelf, getAdminConfig, updateAdminConfig, getDashboardMetrics, getPaymentReports, exportPaymentReportsExcel, exportPaymentReportsPDF } from "../controllers/usuarios.controller.js";
import { refreshToken } from '../tokens/refresh.controller.js';
import { upload } from "../middlewares/multer.js";
import { authREquired } from "../middlewares/validateToken.js";

const router = Router();

router.get("/usuario", obtener);

router.get("/usuario/:id", obtenerUno);

router.post("/register", crear);

// Registro de administradores con foto (multipart) - requiere sesión admin
router.post("/admin/register", authREquired, upload.single('foto'), registrarAdmin);

// Bootstrap del primer admin (sin sesión). Requiere header x-bootstrap-token y que no existan admins
router.post("/admin/register-bootstrap", upload.single('foto'), registrarAdminBootstrap);

router.post("/login", login);
// Refresh access token using rtoken cookie
router.post('/token/refresh', refreshToken);

router.get("/verify", verifyToken);

// Cerrar sesión (borra cookie token en servidor)
router.post("/logout", authREquired, logout);

// Perfil admin actual
router.get('/admin/profile', authREquired, getAdminProfile);
// Actualizar perfil admin (JSON)
router.put('/admin/profile', authREquired, updateAdminProfile);
// Actualizar foto de admin (multipart campo 'foto')
router.put('/admin/profile/foto', authREquired, upload.single('foto'), updateAdminPhoto);

// Estado del bootstrap (público)
router.get('/admin/bootstrap-status', getBootstrapStatus);

// Seguridad
router.put('/admin/change-password', authREquired, changePassword);
router.post('/admin/soft-delete', authREquired, softDeleteSelf);
// Configuración del sistema (seguridad)
router.get('/admin/config', authREquired, getAdminConfig);
router.put('/admin/config', authREquired, updateAdminConfig);

// Dashboard admin: métricas principales
router.get('/admin/dashboard/metrics', authREquired, getDashboardMetrics);

// Reportes de pagos
router.get('/admin/reports/payments', authREquired, getPaymentReports);
router.get('/admin/reports/export/excel', authREquired, exportPaymentReportsExcel);
router.get('/admin/reports/export/pdf', authREquired, exportPaymentReportsPDF);

export default router;