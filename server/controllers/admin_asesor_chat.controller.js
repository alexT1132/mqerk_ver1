import * as Usuarios from '../models/usuarios.model.js';
import { broadcastRole, broadcastUser } from '../ws.js';
import { getAdminAsesorHistory, saveAdminAsesorMessage } from '../models/admin_asesor_chat.model.js';

function roleLower(r) { return String(r || '').toLowerCase(); }

export const getAdminAsesorChatHistory = async (req, res) => {
  try {
    const user = req.user;
    if (!user?.id) return res.status(401).json({ error: 'Unauthorized' });

    const userRow = await Usuarios.getUsuarioPorid(user.id).catch(() => null);
    const role = roleLower(userRow?.role || user?.role);
    if (role !== 'admin' && role !== 'asesor') return res.status(403).json({ error: 'Forbidden' });

    const asesor_user_id = role === 'asesor'
      ? Number(userRow?.id || user.id)
      : Number(req.query?.asesor_user_id);

    if (!asesor_user_id) return res.status(400).json({ error: 'asesor_user_id required' });

    const limit = req.query?.limit ?? 100;
    const offset = req.query?.offset ?? 0;
    const history = await getAdminAsesorHistory({ asesor_user_id, limit, offset });
    return res.json({ data: history });
  } catch (error) {
    console.error('[AdminAsesorChat] history error', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const sendAdminAsesorChatMessage = async (req, res) => {
  try {
    const user = req.user;
    if (!user?.id) return res.status(401).json({ error: 'Unauthorized' });

    const userRow = await Usuarios.getUsuarioPorid(user.id).catch(() => null);
    const role = roleLower(userRow?.role || user?.role);
    if (role !== 'admin' && role !== 'asesor') return res.status(403).json({ error: 'Forbidden' });

    const message = req.body?.message;
    if (!message || !String(message).trim()) return res.status(400).json({ error: 'message is required' });

    const asesor_user_id = role === 'asesor'
      ? Number(userRow?.id || user.id)
      : Number(req.body?.asesor_user_id);

    if (!asesor_user_id) return res.status(400).json({ error: 'asesor_user_id required' });

    // Si admin: validar que el target sea asesor
    if (role === 'admin') {
      const target = await Usuarios.getUsuarioPorid(asesor_user_id).catch(() => null);
      const targetRole = roleLower(target?.role);
      if (targetRole !== 'asesor') return res.status(400).json({ error: 'Target user is not asesor' });
    }

    const saved = await saveAdminAsesorMessage({
      asesor_user_id,
      sender_user_id: Number(userRow?.id || user.id),
      sender_role: role,
      message
    });

    const payload = { type: 'admin_asesor_message', data: saved };

    // Entregar a TODOS los admins + SOLO al asesor target
    broadcastRole('admin', payload);
    broadcastUser(asesor_user_id, payload, 'asesor');

    // Echo seguro: si el sender es asesor, ya le llega por broadcastUser; si es admin, también le llega por broadcastRole
    return res.json({ success: true, message: saved });
  } catch (error) {
    console.error('[AdminAsesorChat] send error', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

