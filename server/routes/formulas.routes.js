import { Router } from 'express';
import { authREquired } from '../middlewares/validateToken.js';
import {
  getAllFormulas,
  getCategories,
  getFormulasByCategory,
  getFormulaById,
  createFormula,
  updateFormula,
  deleteFormula,
  bulkCreateFormulas
} from '../controllers/formulas.controller.js';

const router = Router();

// Obtener todas las fórmulas agrupadas por categoría
router.get('/formulas', authREquired, getAllFormulas);

// Obtener todas las categorías
router.get('/formulas/categories', authREquired, getCategories);

// Obtener fórmulas por categoría
router.get('/formulas/category/:categoria', authREquired, getFormulasByCategory);

// Obtener una fórmula por ID
router.get('/formulas/:id', authREquired, getFormulaById);

// Crear una nueva fórmula
router.post('/formulas', authREquired, createFormula);

// Actualizar una fórmula
router.put('/formulas/:id', authREquired, updateFormula);

// Eliminar una fórmula
router.delete('/formulas/:id', authREquired, deleteFormula);

// Crear múltiples fórmulas (bulk)
router.post('/formulas/bulk', authREquired, bulkCreateFormulas);

export default router;

