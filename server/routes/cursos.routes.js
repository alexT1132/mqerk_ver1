import { Router } from "express";
import {
  crearCurso,
  listarCursos,
  actualizarCurso,
  eliminarCurso,
} from "../controllers/cursos.controller.js";
import { uploadCourseImage } from "../middlewares/upload.js";

const router = Router();

router.get("/cursos", listarCursos);

// router.get("/cursos/:id", obtenerCurso);

router.post("/cursos", uploadCourseImage.single("imagen"), crearCurso);

router.put("/cursos/:id", uploadCourseImage.single("imagen"), actualizarCurso);

router.delete("/cursos/:id", eliminarCurso);

export default router;
