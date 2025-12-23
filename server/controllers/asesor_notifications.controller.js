import * as Usuarios from '../models/usuarios.model.js';
import * as AsesorPerfiles from '../models/asesor_perfiles.model.js';
import * as AsesorNotifs from '../models/asesor_notifications.model.js';

/**
 * Resolver el ID de usuario del asesor autenticado
 */
async function resolveAsesorUserId(userId) {
  const user = await Usuarios.getUsuarioPorid(userId).catch(() => null);
  if (!user || user.role !== 'asesor') return null;
  return user.id;
}

/**
 * Listar notificaciones del asesor autenticado
 */
export const listNotifications = async (req, res) => {
  try {
    const asesorUserId = await resolveAsesorUserId(req.user.id);
    if (!asesorUserId) return res.status(403).json({ message: 'Solo asesores' });
    
    const { limit = 50, offset = 0 } = req.query;
    const rows = await AsesorNotifs.listNotifications(asesorUserId, { limit: Number(limit), offset: Number(offset) });
    const unreadCount = await AsesorNotifs.countUnread(asesorUserId);
    
    res.json({ 
      data: rows,
      unread_count: unreadCount
    });
  } catch (e) {
    console.error('listNotifications (asesor)', e);
    res.status(500).json({ message: 'Error interno' });
  }
};

/**
 * Contar notificaciones no leídas del asesor autenticado
 */
export const countUnread = async (req, res) => {
  try {
    const asesorUserId = await resolveAsesorUserId(req.user.id);
    if (!asesorUserId) return res.status(403).json({ message: 'Solo asesores' });
    
    const count = await AsesorNotifs.countUnread(asesorUserId);
    res.json({ unread_count: count });
  } catch (e) {
    console.error('countUnread (asesor)', e);
    res.status(500).json({ message: 'Error interno' });
  }
};

/**
 * Marcar notificación como leída
 */
export const markRead = async (req, res) => {
  try {
    const asesorUserId = await resolveAsesorUserId(req.user.id);
    if (!asesorUserId) return res.status(403).json({ message: 'Solo asesores' });
    
    const affected = await AsesorNotifs.markRead(req.params.id, asesorUserId, true);
    if (!affected) return res.status(404).json({ message: 'Notificación no encontrada' });
    
    res.json({ ok: true });
  } catch (e) {
    console.error('markRead (asesor)', e);
    res.status(500).json({ message: 'Error interno' });
  }
};

/**
 * Marcar notificación como no leída
 */
export const markUnread = async (req, res) => {
  try {
    const asesorUserId = await resolveAsesorUserId(req.user.id);
    if (!asesorUserId) return res.status(403).json({ message: 'Solo asesores' });
    
    const affected = await AsesorNotifs.markRead(req.params.id, asesorUserId, false);
    if (!affected) return res.status(404).json({ message: 'Notificación no encontrada' });
    
    res.json({ ok: true });
  } catch (e) {
    console.error('markUnread (asesor)', e);
    res.status(500).json({ message: 'Error interno' });
  }
};

/**
 * Marcar todas las notificaciones como leídas
 */
export const markAllRead = async (req, res) => {
  try {
    const asesorUserId = await resolveAsesorUserId(req.user.id);
    if (!asesorUserId) return res.status(403).json({ message: 'Solo asesores' });
    
    await AsesorNotifs.markAllRead(asesorUserId);
    res.json({ ok: true });
  } catch (e) {
    console.error('markAllRead (asesor)', e);
    res.status(500).json({ message: 'Error interno' });
  }
};

/**
 * Eliminar una notificación
 */
export const deleteNotification = async (req, res) => {
  try {
    const asesorUserId = await resolveAsesorUserId(req.user.id);
    if (!asesorUserId) return res.status(403).json({ message: 'Solo asesores' });
    
    const affected = await AsesorNotifs.deleteNotification(req.params.id, asesorUserId);
    if (!affected) return res.status(404).json({ message: 'Notificación no encontrada' });
    
    res.json({ ok: true });
  } catch (e) {
    console.error('deleteNotification (asesor)', e);
    res.status(500).json({ message: 'Error interno' });
  }
};

/**
 * Eliminar todas las notificaciones leídas
 */
export const deleteRead = async (req, res) => {
  try {
    const asesorUserId = await resolveAsesorUserId(req.user.id);
    if (!asesorUserId) return res.status(403).json({ message: 'Solo asesores' });
    
    await AsesorNotifs.deleteRead(asesorUserId);
    res.json({ ok: true });
  } catch (e) {
    console.error('deleteRead (asesor)', e);
    res.status(500).json({ message: 'Error interno' });
  }
};

