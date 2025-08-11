import { Router } from "express";
import { crear, obtener, obtenerUno, actualizar, eliminar, getUltimoFolio, obtenerGruposConCantidad, getConfiguracion, upsertConfiguracion, changePassword, actualizarFoto, softDeleteCuenta, getApprovedStudents, getByFolioAdmin  } from "../controllers/estudiantes.controller.js";
import { authREquired } from "../middlewares/validateToken.js";
import { upload } from "../middlewares/multer.js";

const router = Router();

router.post("/estudiantes", upload.single('foto'), crear);

router.get("/estudiantes", authREquired, obtener);

router.get("/estudiantes/:id", obtenerUno);

router.put("/estudiantes/:id", actualizar);

router.delete("/estudiantes/:id", eliminar);

router.get("/folio", getUltimoFolio);

router.get("/grupos/:curso", obtenerGruposConCantidad);

// Alumnos aprobados (admin)
router.get("/admin/estudiantes/aprobados", authREquired, getApprovedStudents);

// Perfil de alumno por folio (admin)
router.get("/admin/estudiantes/folio/:folio", authREquired, getByFolioAdmin);

// Configuración del alumno (protegido)
router.get("/estudiantes/:id/config", authREquired, getConfiguracion);
router.put("/estudiantes/:id/config", authREquired, upsertConfiguracion);

// Cambio de contraseña (usuario id)
router.put("/usuarios/:id/password", authREquired, changePassword);

// Foto de perfil del alumno
router.put("/estudiantes/:id/foto", authREquired, upload.single('foto'), actualizarFoto);

// Soft delete de cuenta del alumno
router.post("/estudiantes/:id/soft-delete", authREquired, softDeleteCuenta);

export default router;