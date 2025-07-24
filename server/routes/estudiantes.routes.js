import { Router } from "express";
import { crear, obtener, obtenerUno, actualizar, eliminar, getUltimoFolio } from "../controllers/estudiantes.controller.js";
import { authREquired } from "../middlewares/validateToken.js";
import { upload } from "../middlewares/multer.js";

const router = Router();

router.post("/estudiantes", upload.single('foto'), crear);

router.get("/estudiantes", authREquired, obtener);

router.get("/estudiantes/:id", obtenerUno);

router.put("/estudiantes/:id", actualizar);

router.delete("/estudiantes/:id", eliminar);

router.get("/folio", getUltimoFolio);

export default router;