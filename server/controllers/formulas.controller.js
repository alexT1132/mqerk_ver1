import * as Formulas from "../models/formulas.model.js";
import * as Usuarios from "../models/usuarios.model.js";

export const getAllFormulas = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    const user = await Usuarios.getUsuarioPorid(userId);
    const role = (user?.role || '').toLowerCase();
    if (!user || (role !== 'admin' && role !== 'asesor')) return res.status(403).json({ message: 'Forbidden' });

    const activoOnly = req.query.activoOnly !== 'false';
    const formulas = await Formulas.getAllFormulas(activoOnly);
    
    // Agrupar por categoría
    const grouped = {};
    formulas.forEach(f => {
      if (!grouped[f.categoria]) {
        grouped[f.categoria] = [];
      }
      grouped[f.categoria].push({
        id: f.id,
        nombre: f.nombre,
        latex: f.latex,
        descripcion: f.descripcion,
        tienePlaceholders: f.tiene_placeholders === 1,
        activo: f.activo === 1,
        orden: f.orden
      });
    });

    return res.status(200).json(grouped);
  } catch (e) {
    console.error('getAllFormulas error:', e);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const getCategories = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    const user = await Usuarios.getUsuarioPorid(userId);
    const role = (user?.role || '').toLowerCase();
    if (!user || (role !== 'admin' && role !== 'asesor')) return res.status(403).json({ message: 'Forbidden' });

    const activoOnly = req.query.activoOnly !== 'false';
    const categories = await Formulas.getCategories(activoOnly);
    return res.status(200).json(categories);
  } catch (e) {
    console.error('getCategories error:', e);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const getFormulasByCategory = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    const user = await Usuarios.getUsuarioPorid(userId);
    const role = (user?.role || '').toLowerCase();
    if (!user || (role !== 'admin' && role !== 'asesor')) return res.status(403).json({ message: 'Forbidden' });

    const { categoria } = req.params;
    if (!categoria) {
      return res.status(400).json({ message: 'categoria es obligatorio' });
    }

    const activoOnly = req.query.activoOnly !== 'false';
    const formulas = await Formulas.getFormulasByCategory(categoria, activoOnly);
    
    const mapped = formulas.map(f => ({
      id: f.id,
      nombre: f.nombre,
      latex: f.latex,
      descripcion: f.descripcion,
      tienePlaceholders: f.tiene_placeholders === 1,
      activo: f.activo === 1,
      orden: f.orden
    }));

    return res.status(200).json(mapped);
  } catch (e) {
    console.error('getFormulasByCategory error:', e);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const getFormulaById = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    const user = await Usuarios.getUsuarioPorid(userId);
    const role = (user?.role || '').toLowerCase();
    if (!user || (role !== 'admin' && role !== 'asesor')) return res.status(403).json({ message: 'Forbidden' });

    const { id } = req.params;
    const formula = await Formulas.getFormulaById(Number(id));
    
    if (!formula) {
      return res.status(404).json({ message: 'Fórmula no encontrada' });
    }

    const mapped = {
      id: formula.id,
      categoria: formula.categoria,
      nombre: formula.nombre,
      latex: formula.latex,
      descripcion: formula.descripcion,
      tienePlaceholders: formula.tiene_placeholders === 1,
      activo: formula.activo === 1,
      orden: formula.orden
    };

    return res.status(200).json(mapped);
  } catch (e) {
    console.error('getFormulaById error:', e);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const createFormula = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    const user = await Usuarios.getUsuarioPorid(userId);
    if (!user || user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });

    const body = req.body || {};
    if (!body.categoria || !body.latex) {
      return res.status(400).json({ message: 'categoria y latex son obligatorios' });
    }

    const created = await Formulas.createFormula({
      categoria: body.categoria,
      nombre: body.nombre || null,
      latex: body.latex,
      descripcion: body.descripcion || null,
      activo: body.activo !== false,
      orden: body.orden || 0
    });

    const mapped = {
      id: created.id,
      categoria: created.categoria,
      nombre: created.nombre,
      latex: created.latex,
      descripcion: created.descripcion,
      tienePlaceholders: created.tiene_placeholders === 1,
      activo: created.activo === 1,
      orden: created.orden
    };

    return res.status(201).json(mapped);
  } catch (e) {
    console.error('createFormula error:', e);
    return res.status(500).json({ message: e.message || 'Error interno del servidor' });
  }
};

export const updateFormula = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    const user = await Usuarios.getUsuarioPorid(userId);
    if (!user || user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });

    const { id } = req.params;
    const body = req.body || {};

    const updates = {};
    if (body.categoria !== undefined) updates.categoria = body.categoria;
    if (body.nombre !== undefined) updates.nombre = body.nombre;
    if (body.latex !== undefined) updates.latex = body.latex;
    if (body.descripcion !== undefined) updates.descripcion = body.descripcion;
    if (body.activo !== undefined) updates.activo = body.activo;
    if (body.orden !== undefined) updates.orden = body.orden;

    const updated = await Formulas.updateFormula(Number(id), updates);
    if (!updated) {
      return res.status(404).json({ message: 'Fórmula no encontrada' });
    }

    const mapped = {
      id: updated.id,
      categoria: updated.categoria,
      nombre: updated.nombre,
      latex: updated.latex,
      descripcion: updated.descripcion,
      tienePlaceholders: updated.tiene_placeholders === 1,
      activo: updated.activo === 1,
      orden: updated.orden
    };

    return res.status(200).json(mapped);
  } catch (e) {
    console.error('updateFormula error:', e);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const deleteFormula = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    const user = await Usuarios.getUsuarioPorid(userId);
    if (!user || user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });

    const { id } = req.params;
    const ok = await Formulas.deleteFormula(Number(id));
    if (!ok) {
      return res.status(404).json({ message: 'Fórmula no encontrada' });
    }
    return res.sendStatus(204);
  } catch (e) {
    console.error('deleteFormula error:', e);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const bulkCreateFormulas = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    const user = await Usuarios.getUsuarioPorid(userId);
    if (!user || user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });

    const { formulas } = req.body || {};
    if (!Array.isArray(formulas) || formulas.length === 0) {
      return res.status(400).json({ message: 'formulas debe ser un array no vacío' });
    }

    const created = await Formulas.bulkCreateFormulas(formulas);
    
    const mapped = created.map(f => ({
      id: f.id,
      categoria: f.categoria,
      nombre: f.nombre,
      latex: f.latex,
      descripcion: f.descripcion,
      tienePlaceholders: f.tiene_placeholders === 1,
      activo: f.activo === 1,
      orden: f.orden
    }));

    return res.status(201).json(mapped);
  } catch (e) {
    console.error('bulkCreateFormulas error:', e);
    return res.status(500).json({ message: e.message || 'Error interno del servidor' });
  }
};

