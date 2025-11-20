import * as Documentos from '../models/documentos_asesor.model.js';
import * as AsesorPerfiles from '../models/asesor_perfiles.model.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configurar multer para subir archivos
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/documentos');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    // Usar un ID temporal, se validará en el controlador
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `doc-temp-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB máximo
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos PDF, imágenes (JPG, PNG) o documentos (DOC, DOCX)'));
    }
  }
});

export const uploadMiddleware = upload.single('archivo');

/**
 * Obtener todos los documentos del asesor autenticado
 */
export async function getDocumentos(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(403).json({ 
        success: false,
        message: 'Usuario no autenticado' 
      });
    }

    // Obtener el preregistro_id (id_asesor) desde el perfil del asesor
    const perfil = await AsesorPerfiles.getByUserId(userId).catch(() => null);
    if (!perfil || !perfil.preregistro_id) {
      return res.status(403).json({ 
        success: false,
        message: 'No se encontró el perfil del asesor' 
      });
    }
    
    const id_asesor = perfil.preregistro_id;

    // Asegurar que la tabla existe antes de usarla
    try {
      await Documentos.ensureTable?.();
    } catch (err) {
      console.warn('[Documentos] Error asegurando tabla:', err?.message);
    }

    // Inicializar documentos por defecto si no tiene ninguno (solo documentos y contratos)
    try {
      await Documentos.inicializarDocumentosPorDefecto(id_asesor);
    } catch (err) {
      console.warn('[Documentos] Error inicializando documentos por defecto:', err?.message);
      // Continuar aunque falle la inicialización
    }

    // Obtener documentos del asesor (solo documentos y contratos)
    let documentos = [];
    try {
      documentos = await Documentos.getDocumentosByAsesor(id_asesor) || [];
    } catch (err) {
      console.error('[Documentos] Error obteniendo documentos del asesor:', err?.message);
      documentos = [];
    }
    
    // Obtener lineamientos globales (disponibles para todos)
    let lineamientos = [];
    try {
      lineamientos = await Documentos.getLineamientosGlobales() || [];
    } catch (err) {
      console.error('[Documentos] Error obteniendo lineamientos globales:', err?.message);
      lineamientos = [];
    }
    
    // Agrupar por tipo_seccion
    const agrupados = {
      documento: Array.isArray(documentos) ? documentos.filter(d => d.tipo_seccion === 'documento') : [],
      contrato: Array.isArray(documentos) ? documentos.filter(d => d.tipo_seccion === 'contrato') : [],
      lineamiento: Array.isArray(lineamientos) ? lineamientos : []
    };

    res.json({
      success: true,
      data: agrupados,
      total: documentos.length + lineamientos.length
    });
  } catch (error) {
    console.error('[Documentos] Error crítico obteniendo documentos:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener documentos',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor'
    });
  }
}

/**
 * Obtener un documento por ID
 */
export async function getDocumento(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    if (!userId) {
      return res.status(403).json({ message: 'Usuario no autenticado' });
    }

    // Obtener el preregistro_id (id_asesor) desde el perfil del asesor
    const perfil = await AsesorPerfiles.getByUserId(userId).catch(() => null);
    if (!perfil || !perfil.preregistro_id) {
      return res.status(403).json({ message: 'No se encontró el perfil del asesor' });
    }
    const id_asesor = perfil.preregistro_id;

    const documento = await Documentos.getDocumentoById(id);
    
    if (!documento) {
      return res.status(404).json({ message: 'Documento no encontrado' });
    }

    // Verificar que el documento pertenece al asesor
    if (documento.id_asesor !== id_asesor) {
      return res.status(403).json({ message: 'No tienes permiso para ver este documento' });
    }

    res.json({ success: true, data: documento });
  } catch (error) {
    console.error('Error obteniendo documento:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener documento',
      error: error.message 
    });
  }
}

/**
 * Subir/actualizar un documento
 */
export async function uploadDocumento(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    if (!userId) {
      return res.status(403).json({ message: 'Usuario no autenticado' });
    }

    // Obtener el preregistro_id (id_asesor) desde el perfil del asesor
    const perfil = await AsesorPerfiles.getByUserId(userId).catch(() => null);
    if (!perfil || !perfil.preregistro_id) {
      return res.status(403).json({ message: 'No se encontró el perfil del asesor' });
    }
    const id_asesor = perfil.preregistro_id;

    const documento = await Documentos.getDocumentoById(id);
    
    if (!documento) {
      return res.status(404).json({ message: 'Documento no encontrado' });
    }

    // Los lineamientos no se pueden subir por asesores (son documentos de la empresa)
    if (documento.tipo_seccion === 'lineamiento') {
      return res.status(403).json({ message: 'Los lineamientos son documentos de la empresa y no se pueden modificar' });
    }

    // Verificar que el documento pertenece al asesor
    if (documento.id_asesor !== id_asesor) {
      return res.status(403).json({ message: 'No tienes permiso para actualizar este documento' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No se proporcionó ningún archivo' });
    }

    // Renombrar el archivo con el id_asesor correcto
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(req.file.originalname);
    const newFilename = `doc-${id_asesor}-${uniqueSuffix}${ext}`;
    const oldPath = req.file.path;
    const newPath = path.join(path.dirname(oldPath), newFilename);
    
    try {
      await fs.rename(oldPath, newPath);
    } catch (error) {
      // Si falla el renombrado, eliminar el archivo temporal
      await fs.unlink(oldPath).catch(() => {});
      return res.status(500).json({ message: 'Error al guardar el archivo' });
    }

    // Eliminar archivo anterior si existe
    if (documento.archivo_path) {
      try {
        const oldDocPath = path.join(__dirname, '..', documento.archivo_path);
        await fs.unlink(oldDocPath);
      } catch (error) {
        console.warn('No se pudo eliminar el archivo anterior:', error.message);
      }
    }

    // Guardar ruta relativa del archivo
    const archivo_path = `/uploads/documentos/${newFilename}`;

    // Actualizar documento
    const updated = await Documentos.updateDocumento(id, {
      archivo_path,
      estado: 'pending' // Cambiar a pending para que el admin lo revise
    });

    res.json({
      success: true,
      message: 'Documento subido correctamente',
      data: updated
    });
  } catch (error) {
    console.error('Error subiendo documento:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al subir documento',
      error: error.message 
    });
  }
}

/**
 * Actualizar estado de un documento (solo admin)
 */
export async function updateEstadoDocumento(req, res) {
  try {
    const { id } = req.params;
    const { estado, observaciones } = req.body;

    if (!['pending', 'done', 'rechazado'].includes(estado)) {
      return res.status(400).json({ message: 'Estado inválido' });
    }

    const documento = await Documentos.getDocumentoById(id);
    if (!documento) {
      return res.status(404).json({ message: 'Documento no encontrado' });
    }

    const updated = await Documentos.updateDocumento(id, {
      estado,
      observaciones: observaciones || null
    });

    res.json({
      success: true,
      message: 'Estado del documento actualizado',
      data: updated
    });
  } catch (error) {
    console.error('Error actualizando estado:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al actualizar estado',
      error: error.message 
    });
  }
}

/**
 * Eliminar un documento
 */
export async function deleteDocumento(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    if (!userId) {
      return res.status(403).json({ message: 'Usuario no autenticado' });
    }

    // Obtener el preregistro_id (id_asesor) desde el perfil del asesor
    const perfil = await AsesorPerfiles.getByUserId(userId).catch(() => null);
    if (!perfil || !perfil.preregistro_id) {
      return res.status(403).json({ message: 'No se encontró el perfil del asesor' });
    }
    const id_asesor = perfil.preregistro_id;

    const documento = await Documentos.getDocumentoById(id);
    
    if (!documento) {
      return res.status(404).json({ message: 'Documento no encontrado' });
    }

    // Verificar que el documento pertenece al asesor
    if (documento.id_asesor !== id_asesor) {
      return res.status(403).json({ message: 'No tienes permiso para eliminar este documento' });
    }

    // Eliminar archivo si existe
    if (documento.archivo_path) {
      try {
        const filePath = path.join(__dirname, '..', documento.archivo_path);
        await fs.unlink(filePath);
      } catch (error) {
        console.warn('No se pudo eliminar el archivo:', error.message);
      }
    }

    await Documentos.deleteDocumento(id);

    res.json({
      success: true,
      message: 'Documento eliminado correctamente'
    });
  } catch (error) {
    console.error('Error eliminando documento:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al eliminar documento',
      error: error.message 
    });
  }
}

/**
 * Descargar un documento
 */
export async function downloadDocumento(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    if (!userId) {
      return res.status(403).json({ message: 'Usuario no autenticado' });
    }

    // Obtener el preregistro_id (id_asesor) desde el perfil del asesor
    const perfil = await AsesorPerfiles.getByUserId(userId).catch(() => null);
    if (!perfil || !perfil.preregistro_id) {
      return res.status(403).json({ message: 'No se encontró el perfil del asesor' });
    }
    const id_asesor = perfil.preregistro_id;

    const documento = await Documentos.getDocumentoById(id);
    
    if (!documento) {
      return res.status(404).json({ message: 'Documento no encontrado' });
    }

    // Para lineamientos (globales), todos los asesores pueden descargarlos
    // Para otros documentos, verificar que pertenece al asesor
    if (documento.tipo_seccion !== 'lineamiento' && documento.id_asesor !== id_asesor) {
      return res.status(403).json({ message: 'No tienes permiso para descargar este documento' });
    }

    if (!documento.archivo_path) {
      return res.status(404).json({ message: 'El documento no tiene archivo asociado' });
    }

    const filePath = path.join(__dirname, '..', documento.archivo_path);
    
    // Verificar que el archivo existe
    try {
      await fs.access(filePath);
    } catch {
      return res.status(404).json({ message: 'El archivo no existe en el servidor' });
    }

    res.download(filePath, documento.nombre);
  } catch (error) {
    console.error('Error descargando documento:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al descargar documento',
      error: error.message 
    });
  }
}

