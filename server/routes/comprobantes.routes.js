import { Router } from "express";
import { crear, obtenerComprobantes, GetEnableVerificacion } from "../controllers/comprobantes.controller.js";
import { verifyToken } from "../controllers/usuarios.controller.js";
import { authREquired } from "../middlewares/validateToken.js";
import { upload } from "../middlewares/comprobantesMulter.js";

const router = Router();

router.post("/comprobante", upload.single('comprobante'), crear);

router.get("/comprobante/:grupo/:curso", obtenerComprobantes);

router.put("/comprobante/verificacion/:folio", authREquired, GetEnableVerificacion);

// router.get("/estudiantes", authREquired, obtener);

// router.get("/estudiantes/:id", obtenerUno);

// router.put("/estudiantes/:id", actualizar);

// router.delete("/estudiantes/:id", eliminar);

// router.get("/folio", getUltimoFolio);

export default router;