import * as Usuarios from '../models/usuarios.model.js';
import * as AsesorResources from '../models/asesor_resources.model.js';
import path from 'path';
import fs from 'fs';
import { buildStaticUrl } from '../utils/url.js';

// Asegurar que la tabla exista al cargar el módulo
AsesorResources.ensureTable().catch(err => {
  console.error('Error inicializando tabla asesor_resources:', err?.code || err?.message || err);
  if (err?.code === 'ETIMEDOUT') {
    console.error('[DB] ⚠️  No se puede conectar a MySQL. Verifica que el servidor MySQL esté corriendo.');
  }
});

/**
 * Resolver ID de asesor desde user ID
 */
async function resolveAsesorUserId(userId) {
  const user = await Usuarios.getUsuarioPorid(userId).catch(() => null);
  if (!user || user.role !== 'asesor') return null;
  return user.id;
}

/**
 * Listar recursos educativos del asesor
 */
export const list = async (req, res) => {
  try {
    const asesorUserId = await resolveAsesorUserId(req.user.id);
    if (!asesorUserId) return res.status(403).json({ message: 'Solo asesores' });
    
    const resources = await AsesorResources.listByAsesor(asesorUserId);
    
    // Formatear respuesta con tags parseados y URLs
    const formatted = resources.map(r => {
      // Extraer solo el nombre del archivo de la ruta completa
      let fileUrl = null;
      if (r.resource_type === 'file' && r.file_path) {
        const normalized = r.file_path.replace(/\\/g, '/');
        const match = normalized.match(/uploads\/recursos-educativos\/([^\/]+)$/);
        if (match) {
          fileUrl = `/uploads/recursos-educativos/${match[1]}`;
        } else {
          // Si no contiene la ruta esperada, usar buildStaticUrl como fallback
          fileUrl = buildStaticUrl(r.file_path);
        }
      } else if (r.resource_type === 'link' && r.link_url) {
        fileUrl = r.link_url;
      }
      
      return {
        ...r,
        tags: r.tags ? (typeof r.tags === 'string' ? JSON.parse(r.tags) : r.tags) : [],
        file_url: fileUrl,
        file_size_mb: r.file_size ? (r.file_size / (1024 * 1024)).toFixed(2) : null,
        file_type_display: getFileTypeDisplay(r.resource_type, r.file_type, r.file_name, r.link_url)
      };
    });
    
    res.json({ data: formatted });
  } catch (e) {
    console.error('asesor_resources list error:', e);
    res.status(500).json({ message: 'Error interno' });
  }
};

/**
 * Obtener un recurso por ID
 */
export const getById = async (req, res) => {
  try {
    const asesorUserId = await resolveAsesorUserId(req.user.id);
    if (!asesorUserId) return res.status(403).json({ message: 'Solo asesores' });
    
    const { id } = req.params;
    const resource = await AsesorResources.getById(Number(id), asesorUserId);
    if (!resource) return res.status(404).json({ message: 'Recurso no encontrado' });
    
    // Extraer URL para respuesta
    let fileUrl = null;
    if (resource.resource_type === 'file' && resource.file_path) {
      const normalized = resource.file_path.replace(/\\/g, '/');
      const match = normalized.match(/uploads\/recursos-educativos\/([^\/]+)$/);
      if (match) {
        fileUrl = `/uploads/recursos-educativos/${match[1]}`;
      } else {
        fileUrl = buildStaticUrl(resource.file_path);
      }
    } else if (resource.resource_type === 'link' && resource.link_url) {
      fileUrl = resource.link_url;
    }
    
    const formatted = {
      ...resource,
      tags: resource.tags ? (typeof resource.tags === 'string' ? JSON.parse(resource.tags) : resource.tags) : [],
      file_url: fileUrl,
      file_size_mb: resource.file_size ? (resource.file_size / (1024 * 1024)).toFixed(2) : null,
      file_type_display: getFileTypeDisplay(resource.resource_type, resource.file_type, resource.file_name, resource.link_url)
    };
    
    res.json({ data: formatted });
  } catch (e) {
    console.error('asesor_resources getById error:', e);
    res.status(500).json({ message: 'Error interno' });
  }
};

/**
 * Crear nuevo recurso educativo (archivo o enlace)
 */
export const create = async (req, res) => {
  try {
    const asesorUserId = await resolveAsesorUserId(req.user.id);
    if (!asesorUserId) return res.status(403).json({ message: 'Solo asesores' });
    
    const { title, description, tags, resource_type, link_url } = req.body || {};
    if (!title || !title.trim()) return res.status(400).json({ message: 'Título es obligatorio' });
    
    // Parsear tags si viene como string
    let tagsArray = [];
    if (tags) {
      try {
        tagsArray = typeof tags === 'string' ? JSON.parse(tags) : tags;
        if (!Array.isArray(tagsArray)) tagsArray = [];
      } catch {
        tagsArray = [];
      }
    }
    
    const isLink = resource_type === 'link' || link_url;
    
    // Validar enlace
    if (isLink) {
      if (!link_url || !link_url.trim()) {
        return res.status(400).json({ message: 'URL del enlace es requerida' });
      }
      // Validar formato de URL
      try {
        const url = new URL(link_url);
        if (!['http:', 'https:'].includes(url.protocol)) {
          return res.status(400).json({ message: 'La URL debe comenzar con http:// o https://' });
        }
      } catch {
        return res.status(400).json({ message: 'URL inválida' });
      }
    }
    
    // Validar archivo
    const file = req.file;
    if (!isLink && !file) {
      return res.status(400).json({ message: 'Archivo requerido' });
    }
    
    let resource;
    if (isLink) {
      // Crear recurso de tipo enlace
      resource = await AsesorResources.create(asesorUserId, {
        title: title.trim(),
        description: description?.trim() || null,
        resource_type: 'link',
        link_url: link_url.trim(),
        tags: tagsArray
      });
    } else {
      // Crear recurso de tipo archivo
      const filePath = file.path.replace(/\\/g, '/');
      resource = await AsesorResources.create(asesorUserId, {
        title: title.trim(),
        description: description?.trim() || null,
        resource_type: 'file',
        file_path: filePath,
        file_name: file.originalname,
        file_size: file.size,
        file_type: file.mimetype,
        tags: tagsArray
      });
    }
    
    // Extraer URL para respuesta
    let fileUrl = null;
    if (isLink) {
      fileUrl = resource.link_url;
    } else if (resource.file_path) {
      const normalized = resource.file_path.replace(/\\/g, '/');
      const match = normalized.match(/uploads\/recursos-educativos\/([^\/]+)$/);
      if (match) {
        fileUrl = `/uploads/recursos-educativos/${match[1]}`;
      } else {
        fileUrl = buildStaticUrl(resource.file_path);
      }
    }
    
    // Formatear respuesta
    const formatted = {
      ...resource,
      tags: tagsArray,
      file_url: fileUrl,
      file_size_mb: resource.file_size ? (resource.file_size / (1024 * 1024)).toFixed(2) : null,
      file_type_display: getFileTypeDisplay(
        resource.resource_type, 
        resource.file_type, 
        resource.file_name, 
        resource.link_url
      )
    };
    
    res.status(201).json({ data: formatted });
  } catch (e) {
    console.error('asesor_resources create error:', e);
    // Si falla, eliminar el archivo subido
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch {}
    }
    res.status(500).json({ message: 'Error interno' });
  }
};

/**
 * Actualizar recurso educativo
 */
export const update = async (req, res) => {
  try {
    const asesorUserId = await resolveAsesorUserId(req.user.id);
    if (!asesorUserId) return res.status(403).json({ message: 'Solo asesores' });
    
    const { id } = req.params;
    const { title, description, tags } = req.body || {};
    
    const payload = {};
    if (title !== undefined) payload.title = title.trim();
    if (description !== undefined) payload.description = description?.trim() || null;
    if (tags !== undefined) {
      try {
        payload.tags = typeof tags === 'string' ? JSON.parse(tags) : tags;
        if (!Array.isArray(payload.tags)) payload.tags = [];
      } catch {
        payload.tags = [];
      }
    }
    
    const ok = await AsesorResources.update(Number(id), asesorUserId, payload);
    if (!ok) return res.status(404).json({ message: 'Recurso no encontrado' });
    
    res.json({ ok: true });
  } catch (e) {
    console.error('asesor_resources update error:', e);
    res.status(500).json({ message: 'Error interno' });
  }
};

/**
 * Eliminar recurso educativo
 */
export const remove = async (req, res) => {
  try {
    const asesorUserId = await resolveAsesorUserId(req.user.id);
    if (!asesorUserId) return res.status(403).json({ message: 'Solo asesores' });
    
    const { id } = req.params;
    
    // Obtener el recurso para eliminar el archivo
    const resource = await AsesorResources.getById(Number(id), asesorUserId);
    if (!resource) return res.status(404).json({ message: 'Recurso no encontrado' });
    
    // Eliminar de la base de datos
    const ok = await AsesorResources.remove(Number(id), asesorUserId);
    if (!ok) return res.status(404).json({ message: 'Recurso no encontrado' });
    
    // Eliminar archivo físico (solo si es un archivo, no un enlace)
    if (resource.resource_type === 'file' && resource.file_path) {
      try {
        const fullPath = path.resolve(resource.file_path);
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      } catch (err) {
        console.error('Error eliminando archivo físico:', err);
        // No fallar si no se puede eliminar el archivo
      }
    }
    
    res.sendStatus(204);
  } catch (e) {
    console.error('asesor_resources remove error:', e);
    res.status(500).json({ message: 'Error interno' });
  }
};

/**
 * Descargar recurso educativo
 */
export const download = async (req, res) => {
  try {
    const asesorUserId = await resolveAsesorUserId(req.user.id);
    if (!asesorUserId) return res.status(403).json({ message: 'Solo asesores' });
    
    const { id } = req.params;
    const resource = await AsesorResources.getById(Number(id), asesorUserId);
    if (!resource) return res.status(404).json({ message: 'Recurso no encontrado' });
    
    // Si es un enlace, redirigir a la URL
    if (resource.resource_type === 'link' && resource.link_url) {
      return res.redirect(resource.link_url);
    }
    
    // Si es un archivo, descargarlo
    if (resource.resource_type === 'file' && resource.file_path) {
      const filePath = path.resolve(resource.file_path);
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: 'Archivo no encontrado' });
      }
      
      res.download(filePath, resource.file_name, (err) => {
        if (err) {
          console.error('Error descargando archivo:', err);
          if (!res.headersSent) {
            res.status(500).json({ message: 'Error al descargar archivo' });
          }
        }
      });
    } else {
      return res.status(400).json({ message: 'Recurso no es descargable' });
    }
  } catch (e) {
    console.error('asesor_resources download error:', e);
    res.status(500).json({ message: 'Error interno' });
  }
};

/**
 * Listar recursos del asesor del estudiante autenticado
 */
export const listByEstudianteAsesor = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'No autenticado' });
    
    // Obtener el estudiante desde el user ID
    const user = await Usuarios.getUsuarioPorid(userId).catch(() => null);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    if (user.role !== 'estudiante' || !user.id_estudiante) {
      return res.status(403).json({ message: 'Solo estudiantes' });
    }
    
    // Obtener el asesor del estudiante usando la función existente
    const AsesorNotifs = await import('../models/asesor_notifications.model.js');
    const asesorUserId = await AsesorNotifs.getAsesorUserIdByEstudianteId(user.id_estudiante);
    
    if (!asesorUserId) {
      // Si no tiene asesor asignado, devolver array vacío
      return res.json({ data: [] });
    }
    
    // Obtener recursos del asesor
    const resources = await AsesorResources.listByAsesor(asesorUserId);
    
    // Formatear respuesta con tags parseados y URLs
    const formatted = resources.map(r => {
      let fileUrl = null;
      if (r.resource_type === 'file' && r.file_path) {
        const normalized = r.file_path.replace(/\\/g, '/');
        const match = normalized.match(/uploads\/recursos-educativos\/([^\/]+)$/);
        if (match) {
          fileUrl = `/uploads/recursos-educativos/${match[1]}`;
        } else {
          fileUrl = buildStaticUrl(r.file_path);
        }
      } else if (r.resource_type === 'link' && r.link_url) {
        fileUrl = r.link_url;
      }
      
      return {
        ...r,
        tags: r.tags ? (typeof r.tags === 'string' ? JSON.parse(r.tags) : r.tags) : [],
        file_url: fileUrl,
        file_size_mb: r.file_size ? (r.file_size / (1024 * 1024)).toFixed(2) : null,
        file_type_display: getFileTypeDisplay(r.resource_type, r.file_type, r.file_name, r.link_url)
      };
    });
    
    res.json({ data: formatted });
  } catch (e) {
    console.error('asesor_resources listByEstudianteAsesor error:', e);
    res.status(500).json({ message: 'Error interno' });
  }
};

/**
 * Descargar recurso del asesor (para estudiantes)
 */
export const downloadByEstudiante = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'No autenticado' });
    
    const user = await Usuarios.getUsuarioPorid(userId).catch(() => null);
    if (!user || user.role !== 'estudiante' || !user.id_estudiante) {
      return res.status(403).json({ message: 'Solo estudiantes' });
    }
    
    const { id } = req.params;
    
    // Obtener el asesor del estudiante
    const AsesorNotifs = await import('../models/asesor_notifications.model.js');
    const asesorUserId = await AsesorNotifs.getAsesorUserIdByEstudianteId(user.id_estudiante);
    
    if (!asesorUserId) {
      return res.status(404).json({ message: 'No se encontró tu asesor' });
    }
    
    // Verificar que el recurso pertenece al asesor del estudiante
    const resource = await AsesorResources.getById(Number(id), asesorUserId);
    if (!resource) return res.status(404).json({ message: 'Recurso no encontrado' });
    
    // Si es un enlace, redirigir a la URL
    if (resource.resource_type === 'link' && resource.link_url) {
      return res.redirect(resource.link_url);
    }
    
    // Si es un archivo, descargarlo
    if (resource.resource_type === 'file' && resource.file_path) {
      const filePath = path.resolve(resource.file_path);
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: 'Archivo no encontrado' });
      }
      
      res.download(filePath, resource.file_name, (err) => {
        if (err) {
          console.error('Error descargando archivo:', err);
          if (!res.headersSent) {
            res.status(500).json({ message: 'Error al descargar archivo' });
          }
        }
      });
    } else {
      return res.status(400).json({ message: 'Recurso no es descargable' });
    }
  } catch (e) {
    console.error('asesor_resources downloadByEstudiante error:', e);
    res.status(500).json({ message: 'Error interno' });
  }
};

/**
 * Helper: Obtener tipo de archivo para display
 */
function getFileTypeDisplay(resourceType, mimeType, fileName, linkUrl) {
  // Si es un enlace
  if (resourceType === 'link' || linkUrl) {
    return 'LINK';
  }
  
  // Si es un archivo
  const ext = path.extname(fileName || '').toLowerCase();
  
  if (mimeType?.includes('pdf') || ext === '.pdf') return 'PDF';
  if (mimeType?.includes('video') || ['.mp4', '.mpeg', '.mov', '.avi', '.webm'].includes(ext)) return 'VIDEO';
  if (mimeType?.includes('zip') || mimeType?.includes('rar') || mimeType?.includes('7z') || 
      ['.zip', '.rar', '.7z'].includes(ext)) return 'ZIP';
  if (mimeType?.includes('image') || ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)) return 'IMAGE';
  if (mimeType?.includes('word') || ['.doc', '.docx'].includes(ext)) return 'DOC';
  if (mimeType?.includes('excel') || ['.xls', '.xlsx'].includes(ext)) return 'XLS';
  if (mimeType?.includes('powerpoint') || ['.ppt', '.pptx'].includes(ext)) return 'PPT';
  
  return 'FILE';
}

