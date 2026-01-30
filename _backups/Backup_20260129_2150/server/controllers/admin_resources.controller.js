import * as Usuarios from '../models/usuarios.model.js';
import * as AdminResources from '../models/admin_resources.model.js';
import path from 'path';
import fs from 'fs';
import { buildStaticUrl } from '../utils/url.js';

// Asegurar que la tabla exista al cargar el módulo
AdminResources.ensureTable().catch(err => {
  console.error('Error inicializando tabla admin_resources:', err?.code || err?.message || err);
  if (err?.code === 'ETIMEDOUT') {
    console.error('[DB] ⚠️  No se puede conectar a MySQL. Verifica que el servidor MySQL esté corriendo.');
  }
});

/**
 * Resolver ID de admin desde user ID
 */
async function resolveAdminUserId(userId) {
  const user = await Usuarios.getUsuarioPorid(userId).catch(() => null);
  if (!user || user.role !== 'admin') return null;
  return user.id;
}

/**
 * Listar todos los recursos del administrador (visibles para todos los asesores)
 */
export const list = async (req, res) => {
  try {
    const resources = await AdminResources.listAll();
    
    // Formatear respuesta con tags parseados y URLs
    const formatted = resources.map(r => {
      let fileUrl = null;
      if (r.file_path) {
        const normalized = r.file_path.replace(/\\/g, '/');
        const match = normalized.match(/uploads\/recursos-educativos\/([^\/]+)$/);
        if (match) {
          fileUrl = `/uploads/recursos-educativos/${match[1]}`;
        } else {
          fileUrl = buildStaticUrl(r.file_path);
        }
      }
      
      return {
        ...r,
        tags: r.tags ? (typeof r.tags === 'string' ? JSON.parse(r.tags) : r.tags) : [],
        file_url: fileUrl,
        file_size_mb: (r.file_size / (1024 * 1024)).toFixed(2),
        file_type_display: getFileTypeDisplay(r.file_type, r.file_name)
      };
    });
    
    res.json({ data: formatted });
  } catch (e) {
    console.error('admin_resources list error:', e);
    res.status(500).json({ message: 'Error interno' });
  }
};

/**
 * Obtener un recurso por ID
 */
export const getById = async (req, res) => {
  try {
    const { id } = req.params;
    const resource = await AdminResources.getById(Number(id));
    if (!resource) return res.status(404).json({ message: 'Recurso no encontrado' });
    
    let fileUrl = null;
    if (resource.file_path) {
      const normalized = resource.file_path.replace(/\\/g, '/');
      const match = normalized.match(/uploads\/recursos-educativos\/([^\/]+)$/);
      if (match) {
        fileUrl = `/uploads/recursos-educativos/${match[1]}`;
      } else {
        fileUrl = buildStaticUrl(resource.file_path);
      }
    }
    
    const formatted = {
      ...resource,
      tags: resource.tags ? (typeof resource.tags === 'string' ? JSON.parse(resource.tags) : resource.tags) : [],
      file_url: fileUrl,
      file_size_mb: (resource.file_size / (1024 * 1024)).toFixed(2),
      file_type_display: getFileTypeDisplay(resource.file_type, resource.file_name)
    };
    
    res.json({ data: formatted });
  } catch (e) {
    console.error('admin_resources getById error:', e);
    res.status(500).json({ message: 'Error interno' });
  }
};

/**
 * Crear nuevo recurso educativo (solo administradores)
 */
export const create = async (req, res) => {
  try {
    const adminUserId = await resolveAdminUserId(req.user.id);
    if (!adminUserId) return res.status(403).json({ message: 'Solo administradores' });
    
    const file = req.file;
    if (!file) return res.status(400).json({ message: 'Archivo requerido' });
    
    const { title, description, tags } = req.body || {};
    if (!title || !title.trim()) return res.status(400).json({ message: 'Título es obligatorio' });
    
    let tagsArray = [];
    if (tags) {
      try {
        tagsArray = typeof tags === 'string' ? JSON.parse(tags) : tags;
        if (!Array.isArray(tagsArray)) tagsArray = [];
      } catch {
        tagsArray = [];
      }
    }
    
    const filePath = file.path.replace(/\\/g, '/');
    const resource = await AdminResources.create(adminUserId, {
      title: title.trim(),
      description: description?.trim() || null,
      file_path: filePath,
      file_name: file.originalname,
      file_size: file.size,
      file_type: file.mimetype,
      tags: tagsArray
    });
    
    let fileUrl = null;
    if (filePath) {
      const normalized = filePath.replace(/\\/g, '/');
      const match = normalized.match(/uploads\/recursos-educativos\/([^\/]+)$/);
      if (match) {
        fileUrl = `/uploads/recursos-educativos/${match[1]}`;
      } else {
        fileUrl = buildStaticUrl(filePath);
      }
    }
    
    const formatted = {
      ...resource,
      tags: tagsArray,
      file_url: fileUrl,
      file_size_mb: (file.size / (1024 * 1024)).toFixed(2),
      file_type_display: getFileTypeDisplay(file.mimetype, file.originalname)
    };
    
    res.status(201).json({ data: formatted });
  } catch (e) {
    console.error('admin_resources create error:', e);
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch {}
    }
    res.status(500).json({ message: 'Error interno' });
  }
};

/**
 * Actualizar recurso educativo (solo administradores)
 */
export const update = async (req, res) => {
  try {
    const adminUserId = await resolveAdminUserId(req.user.id);
    if (!adminUserId) return res.status(403).json({ message: 'Solo administradores' });
    
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
    
    const ok = await AdminResources.update(Number(id), adminUserId, payload);
    if (!ok) return res.status(404).json({ message: 'Recurso no encontrado' });
    
    res.json({ ok: true });
  } catch (e) {
    console.error('admin_resources update error:', e);
    res.status(500).json({ message: 'Error interno' });
  }
};

/**
 * Eliminar recurso educativo (solo administradores)
 */
export const remove = async (req, res) => {
  try {
    const adminUserId = await resolveAdminUserId(req.user.id);
    if (!adminUserId) return res.status(403).json({ message: 'Solo administradores' });
    
    const { id } = req.params;
    
    const resource = await AdminResources.getById(Number(id));
    if (!resource || resource.admin_user_id !== adminUserId) {
      return res.status(404).json({ message: 'Recurso no encontrado' });
    }
    
    const ok = await AdminResources.remove(Number(id), adminUserId);
    if (!ok) return res.status(404).json({ message: 'Recurso no encontrado' });
    
    if (resource.file_path) {
      try {
        const fullPath = path.resolve(resource.file_path);
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      } catch (err) {
        console.error('Error eliminando archivo físico:', err);
      }
    }
    
    res.sendStatus(204);
  } catch (e) {
    console.error('admin_resources remove error:', e);
    res.status(500).json({ message: 'Error interno' });
  }
};

/**
 * Descargar recurso educativo
 */
export const download = async (req, res) => {
  try {
    const { id } = req.params;
    const resource = await AdminResources.getById(Number(id));
    if (!resource) return res.status(404).json({ message: 'Recurso no encontrado' });
    
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
  } catch (e) {
    console.error('admin_resources download error:', e);
    res.status(500).json({ message: 'Error interno' });
  }
};

/**
 * Helper: Obtener tipo de archivo para display
 */
function getFileTypeDisplay(mimeType, fileName) {
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

