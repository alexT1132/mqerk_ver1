import { Router } from "express";
import {
  getPreviews,
  getPreviewById,
  getPreviewByCourseId,
  createPreview,
  updatePreview,
  deletePreview
} from "../controllers/preview.controller.js";

const router = Router();

// GET /api/previews - Obtener todos los previews
router.get("/previews", getPreviews);

// GET /api/previews/:id - Obtener un preview por ID
router.get("/previews/:id", getPreviewById);

// GET /api/previews/by-course/:courseId - Obtener preview por course_id
router.get("/previews/by-course/:courseId", getPreviewByCourseId);

// POST /api/previews - Crear un nuevo preview
router.post("/previews", createPreview);

// PUT /api/previews/:id - Actualizar un preview
router.put("/previews/:id", updatePreview);

// DELETE /api/previews/:id - Eliminar un preview
router.delete("/previews/:id", deletePreview);

export default router;