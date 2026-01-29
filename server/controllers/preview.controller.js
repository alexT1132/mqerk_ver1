import {
  getPreviewsModel,
  getPreviewByIdModel,
  getPreviewByCourseIdModel,
  createPreviewModel,
  updatePreviewModel,
  deletePreviewModel,
  checkPreviewExistsModel
} from "../models/previews.model.js";

// Obtener todos los previews
export const getPreviews = async (req, res) => {
  try {
    const previews = await getPreviewsModel();
    res.json(previews);
  } catch (error) {
    console.error("Error al obtener previews:", error);
    res.status(500).json({ 
      message: "Error al obtener los previews",
      error: error.message 
    });
  }
};

// Obtener preview por ID
export const getPreviewById = async (req, res) => {
  try {
    const { id } = req.params;
    const preview = await getPreviewByIdModel(id);
    
    if (!preview) {
      return res.status(404).json({ 
        message: "Preview no encontrado" 
      });
    }
    
    res.json(preview);
  } catch (error) {
    console.error("Error al obtener preview:", error);
    res.status(500).json({ 
      message: "Error al obtener el preview",
      error: error.message 
    });
  }
};

// Obtener preview por course_id
export const getPreviewByCourseId = async (req, res) => {
  try {
    const { courseId } = req.params;
    const preview = await getPreviewByCourseIdModel(courseId);
    
    if (!preview) {
      return res.status(404).json({ 
        message: "No se encontró preview para este curso" 
      });
    }
    
    res.json(preview);
  } catch (error) {
    console.error("Error al obtener preview por curso:", error);
    res.status(500).json({ 
      message: "Error al obtener el preview del curso",
      error: error.message 
    });
  }
};

// Crear nuevo preview
export const createPreview = async (req, res) => {
  try {
    const previewData = req.body;
    
    // Validar que venga el course_id
    if (!previewData.course_id) {
      return res.status(400).json({ 
        message: "El course_id es obligatorio" 
      });
    }
    
    // Verificar si ya existe un preview para este curso
    const exists = await checkPreviewExistsModel(previewData.course_id);
    if (exists) {
      return res.status(409).json({ 
        message: "Ya existe un preview para este curso. Use actualizar en su lugar." 
      });
    }
    
    const newPreviewId = await createPreviewModel(previewData);
    const newPreview = await getPreviewByIdModel(newPreviewId);
    
    res.status(201).json({
      message: "Preview creado exitosamente",
      preview: newPreview
    });
  } catch (error) {
    console.error("Error al crear preview:", error);
    
    // Manejar error de clave foránea
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({ 
        message: "El curso especificado no existe" 
      });
    }
    
    res.status(500).json({ 
      message: "Error al crear el preview",
      error: error.message 
    });
  }
};

// Actualizar preview
export const updatePreview = async (req, res) => {
  try {
    const { id } = req.params;
    const previewData = req.body;
    
    // Verificar que el preview existe
    const existingPreview = await getPreviewByIdModel(id);
    if (!existingPreview) {
      return res.status(404).json({ 
        message: "Preview no encontrado" 
      });
    }
    
    const updated = await updatePreviewModel(id, previewData);
    
    if (!updated) {
      return res.status(400).json({ 
        message: "No se pudo actualizar el preview" 
      });
    }
    
    const updatedPreview = await getPreviewByIdModel(id);
    
    res.json({
      message: "Preview actualizado exitosamente",
      preview: updatedPreview
    });
  } catch (error) {
    console.error("Error al actualizar preview:", error);
    res.status(500).json({ 
      message: "Error al actualizar el preview",
      error: error.message 
    });
  }
};

// Eliminar preview
export const deletePreview = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar que el preview existe
    const existingPreview = await getPreviewByIdModel(id);
    if (!existingPreview) {
      return res.status(404).json({ 
        message: "Preview no encontrado" 
      });
    }
    
    const deleted = await deletePreviewModel(id);
    
    if (!deleted) {
      return res.status(400).json({ 
        message: "No se pudo eliminar el preview" 
      });
    }
    
    res.json({
      message: "Preview eliminado exitosamente"
    });
  } catch (error) {
    console.error("Error al eliminar preview:", error);
    res.status(500).json({ 
      message: "Error al eliminar el preview",
      error: error.message 
    });
  }
};