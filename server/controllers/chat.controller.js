import { saveMessage, getHistory, markAsRead } from '../models/chat.model.js';
import { broadcastStudent, broadcastAdmins } from '../ws.js';

export const sendMessage = async (req, res) => {
    try {
        // Validate request body exists
        if (!req.body) {
            return res.status(400).json({ error: 'Request body is required' });
        }

        const { message, type, category } = req.body; // ADDED category
        // Identificar sender
        const user = req.user; // asumiendo middleware auth que popule req.user

        if (!user) return res.status(401).json({ error: 'Unauthorized' });

        let student_id;
        let sender_role;

        if (user.role === 'estudiante') {
            // Token only has user id, we need to fetch user to get id_estudiante
            // Optimización: si pudiéramos meter id_estudiante en el token sería mejor, pero por ahora query
            const { getUsuarioPorid } = await import('../models/usuarios.model.js');
            const userFull = await getUsuarioPorid(user.id);
            if (!userFull || !userFull.id_estudiante) return res.status(404).json({ error: 'Student record not found' });

            student_id = userFull.id_estudiante;
            sender_role = 'estudiante';
        } else if (user.role === 'admin' || user.role === 'asesor') {
            student_id = req.body.student_id; // Admin debe especificar a quién escribe
            sender_role = user.role === 'asesor' ? 'asesor' : 'admin';
            if (!student_id) return res.status(400).json({ error: 'student_id required for admin messages' });
        } else {
            return res.status(403).json({ error: 'Role not supported for chat' });
        }

        if (!message) return res.status(400).json({ error: 'Message content required' });

        // 1. Guardar en DB con category
        const savedMsg = await saveMessage({ student_id, sender_role, message, type, category });

        // 2. Emitir WebSocket
        const payload = {
            type: 'chat_message',
            data: savedMsg
        };

        if (sender_role === 'estudiante') {
            // El estudiante envía -> notificar a admins
            broadcastAdmins(payload);
            // Opcional: confirmar al estudiante por socket también si se quiere consistencia realtime
            broadcastStudent(student_id, payload);
        } else {
            // Admin envía -> notificar al estudiante
            broadcastStudent(student_id, payload);
            // Notificar a otros admins (para sincronizar entre soportes)
            broadcastAdmins(payload);
        }

        res.json({ success: true, message: savedMsg });

    } catch (error) {
        console.error('[Chat] Send error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const getChatHistory = async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            console.error('[Chat] getChatHistory: No user in request');
            return res.status(401).json({ error: 'Unauthorized' });
        }

        console.log('[Chat] getChatHistory called by user:', { id: user.id, role: user.role });

        let student_id;

        if (user.role === 'estudiante') {
            const { getUsuarioPorid } = await import('../models/usuarios.model.js');
            const userFull = await getUsuarioPorid(user.id);
            console.log('[Chat] Student user data:', { id: user.id, hasIdEstudiante: !!userFull?.id_estudiante });

            if (!userFull) {
                console.error('[Chat] User not found in database:', user.id);
                return res.status(404).json({ error: 'User not found' });
            }

            if (!userFull.id_estudiante) {
                console.error('[Chat] User has no id_estudiante:', user.id);
                return res.status(400).json({ error: 'Student record not linked to user' });
            }

            student_id = userFull.id_estudiante;
        } else {
            student_id = req.query.student_id;
            if (!student_id) {
                console.error('[Chat] Admin/Asesor request without student_id');
                return res.status(400).json({ error: 'student_id required' });
            }
        }

        const history = await getHistory(student_id);
        res.json({ data: history });
    } catch (error) {
        console.error('[Chat] History error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const markRead = async (req, res) => {
    try {
        const user = req.user;
        if (!user) return res.status(401).json({ error: 'Unauthorized' });

        let student_id;
        let reader_role = user.role === 'estudiante' ? 'estudiante' : 'admin';

        if (reader_role === 'estudiante') {
            const { getUsuarioPorid } = await import('../models/usuarios.model.js');
            const userFull = await getUsuarioPorid(user.id);
            if (!userFull) return res.status(404).json({ error: 'User not found' });
            student_id = userFull.id_estudiante;
        } else {
            // For admin/asesor, student_id should be in body
            if (!req.body || !req.body.student_id) {
                return res.status(400).json({ error: 'student_id required in request body' });
            }
            student_id = req.body.student_id;
        }

        await markAsRead(student_id, reader_role);
        res.json({ success: true });
    } catch (error) {
        console.error('[Chat] Mark read error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

export const getChatStatus = async (req, res) => {
    try {
        const user = req.user;
        if (!user || user.role !== 'estudiante') return res.json({ online: false, advisorName: 'Chat de Ayuda' });

        const { getUsuarioPorid, getUsuarioPorusername } = await import('../models/usuarios.model.js');
        const userFull = await getUsuarioPorid(user.id);

        if (!userFull || !userFull.id_estudiante) return res.json({ online: false, advisorName: 'Chat de Ayuda' });

        const { getEstudianteById } = await import('../models/estudiantes.model.js');
        const student = await getEstudianteById(userFull.id_estudiante);

        // Resolver nombre del asesor y ID
        let advisorName = 'Tu Asesor';
        let advisorId = null;

        // Prioridad 1: Buscar por grupo del estudiante (Asignación dinámica)
        if (student?.grupo) {
            const { findAdvisorForGroup } = await import('../models/asesor_perfiles.model.js');
            const groupAdvisor = await findAdvisorForGroup(student.grupo);
            if (groupAdvisor && groupAdvisor.usuario_id) {
                advisorId = groupAdvisor.usuario_id;
                try {
                    const advisorUser = await getUsuarioPorid(advisorId);
                    if (advisorUser) {
                        // Preferir nombre real si existe
                        if (advisorUser.nombre || advisorUser.apellidos) {
                            advisorName = `${advisorUser.nombre || ''} ${advisorUser.apellidos || ''}`.trim();
                        } else {
                            advisorName = advisorUser.usuario;
                        }
                    }
                } catch (e) { console.error('Error fetching advisor user:', e); }
            }
        }

        // Prioridad 2: campo 'asesor' de la tabla estudiantes (Fallback)
        const rawAsesor = student?.asesor;
        if (!advisorId && rawAsesor) {
            // Caso 1: ID numérico
            if (!isNaN(rawAsesor) && String(rawAsesor).trim() !== '') {
                advisorId = rawAsesor;
                try {
                    const advisorUser = await getUsuarioPorid(advisorId);
                    if (advisorUser && (advisorUser.nombre || advisorUser.apellidos)) {
                        advisorName = `${advisorUser.nombre || ''} ${advisorUser.apellidos || ''}`.trim();
                    } else if (advisorUser && advisorUser.usuario) {
                        advisorName = advisorUser.usuario;
                    }
                } catch (e) { }
            }
            // Caso 2: String (posible username o nombre legacy)
            else {
                advisorName = rawAsesor;
                try {
                    const advisorUser = await getUsuarioPorusername(rawAsesor);
                    if (advisorUser) {
                        advisorId = advisorUser.id;
                    }
                } catch (e) { }
            }
        }

        const { isRoleOnline } = await import('../ws.js');

        // Verificar status por separado
        const advisorOnline = advisorId ? (isRoleOnline('asesor', advisorId) || isRoleOnline('admin', advisorId)) : false;

        // Soporte: cualquier admin o asesor conectado (general fallback)
        const supportOnline = isRoleOnline('admin') || isRoleOnline('asesor');

        // Retrocompatibilidad 'online' (general)
        const online = advisorOnline || supportOnline;

        res.json({ online, advisorOnline, supportOnline, advisorName });
    } catch (error) {
        console.error('getChatStatus error', error);
        res.status(500).json({ error: 'Internal error' });
    }
};

// Obtener conteo de mensajes no leídos (general para advisor)
export const getUnreadCount = async (req, res) => {
    try {
        const user = req.user;
        if (!user) return res.status(401).json({ error: 'Unauthorized' });

        // Si es estudiante, cuenta mensajes no leidos de roles no-estudiante
        if (user.role === 'estudiante') {
            // Retornar 0 por ahora
            return res.json({ data: { total: 0, by_student: {} } });
        }

        // Si es Asesor: contar mensajes de sus estudiantes
        if (user.role === 'asesor' || user.role === 'admin') {
            const { getByUserId } = await import('../models/asesor_perfiles.model.js');
            const db = (await import('../db.js')).default;

            // 1. Obtener grupos del asesor
            let grupos = [];
            if (user.role === 'asesor') {
                const perfil = await getByUserId(user.id).catch(() => null);
                if (perfil) {
                    grupos = perfil.grupos_asesor || (perfil.grupo_asesor ? [perfil.grupo_asesor] : []);
                }
            } else {
                if (user.role === 'admin') return res.json({ data: { total: 0, by_student: {} } });
            }

            if (!grupos.length) return res.json({ data: { total: 0, by_student: {} } });

            // 2. Query contando mensajes no leídos de estudiantes en esos grupos
            const placeholders = grupos.map(() => '?').join(',');

            // Total count
            const sqlTotal = `
                SELECT COUNT(*) as total 
                FROM chat_messages cm
                JOIN estudiantes e ON cm.student_id = e.id
                WHERE cm.is_read = 0 
                  AND cm.sender_role = 'estudiante'
                  AND TRIM(e.grupo) IN (${placeholders})
            `;

            // Count per student
            const sqlByStudent = `
                SELECT cm.student_id, COUNT(*) as count
                FROM chat_messages cm
                JOIN estudiantes e ON cm.student_id = e.id
                WHERE cm.is_read = 0 
                  AND cm.sender_role = 'estudiante'
                  AND TRIM(e.grupo) IN (${placeholders})
                GROUP BY cm.student_id
            `;

            const [totalRows] = await db.query(sqlTotal, grupos);
            const [studentRows] = await db.query(sqlByStudent, grupos);

            // Convert to object { studentId: count }
            const byStudent = {};
            studentRows.forEach(row => {
                byStudent[row.student_id] = row.count;
            });

            return res.json({
                data: {
                    total: totalRows[0]?.total || 0,
                    by_student: byStudent
                }
            });
        }

        res.json({ data: { total: 0, by_student: {} } });
    } catch (error) {
        console.error('getUnreadCount error', error);
        res.status(500).json({ error: 'Internal error' });
    }
};

// ========== ENDPOINTS ESPECÍFICOS PARA SOPORTE (ADMIN) ==========

// Obtener lista de estudiantes que han enviado mensajes de soporte
export const getSupportStudents = async (req, res) => {
    try {
        const user = req.user;
        if (!user || user.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }

        const db = (await import('../db.js')).default;

        // Obtener TODOS los estudiantes Y asesores activos
        // Estudiantes: verificacion=2, sin soft-delete, estatus='Activo'
        // Asesores: status='completed' (aprobados)
        const sql = `
            SELECT 
                e.id, 
                e.nombre COLLATE utf8mb4_unicode_ci as nombre, 
                e.apellidos COLLATE utf8mb4_unicode_ci as apellidos, 
                e.foto COLLATE utf8mb4_unicode_ci as foto, 
                e.grupo COLLATE utf8mb4_unicode_ci as grupo, 
                'estudiante' as tipo
            FROM estudiantes e
            LEFT JOIN soft_deletes sd ON sd.id_estudiante = e.id
            WHERE e.verificacion = 2
              AND sd.id IS NULL
              AND (e.estatus = 'Activo' OR e.estatus IS NULL)
            
            UNION
            
            SELECT 
                ap.id, 
                ap.nombres COLLATE utf8mb4_unicode_ci as nombre, 
                ap.apellidos COLLATE utf8mb4_unicode_ci as apellidos, 
                COALESCE(perf.doc_fotografia, '/default-avatar.png') COLLATE utf8mb4_unicode_ci as foto,
                COALESCE(perf.grupo_asesor, '') COLLATE utf8mb4_unicode_ci as grupo,
                'asesor' as tipo
            FROM asesor_preregistros ap
            LEFT JOIN asesor_perfiles perf ON perf.preregistro_id = ap.id
            WHERE ap.status = 'completed'
            
            ORDER BY nombre, apellidos
        `;

        const [rows] = await db.query(sql);
        res.json({ data: rows });
    } catch (error) {
        console.error('getSupportStudents error', error);
        res.status(500).json({ error: 'Internal error' });
    }
};

// Obtener historial de mensajes de soporte de un estudiante
export const getSupportHistory = async (req, res) => {
    try {
        const user = req.user;
        if (!user || user.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }

        const student_id = req.query.student_id;
        if (!student_id) {
            return res.status(400).json({ error: 'student_id required' });
        }

        const db = (await import('../db.js')).default;

        const sql = `
            SELECT * FROM chat_messages 
            WHERE student_id = ? AND category = 'support'
            ORDER BY created_at ASC
        `;

        const [rows] = await db.query(sql, [student_id]);
        res.json({ data: rows });
    } catch (error) {
        console.error('getSupportHistory error', error);
        res.status(500).json({ error: 'Internal error' });
    }
};

// Enviar mensaje de soporte (admin)
export const sendSupportMessage = async (req, res) => {
    try {
        const user = req.user;
        if (!user || user.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }

        const { student_id, message, type = 'text' } = req.body;

        if (!student_id || !message) {
            return res.status(400).json({ error: 'student_id and message required' });
        }

        const db = (await import('../db.js')).default;

        const sql = `
            INSERT INTO chat_messages (student_id, sender_role, message, type, category, created_at)
            VALUES (?, 'admin', ?, ?, 'support', NOW())
        `;

        const [result] = await db.query(sql, [student_id, message, type]);

        // Obtener el mensaje guardado
        const [savedMsg] = await db.query('SELECT * FROM chat_messages WHERE id = ?', [result.insertId]);

        // Emitir WebSocket
        const payload = {
            type: 'chat_message',
            data: savedMsg[0]
        };

        broadcastStudent(student_id, payload);
        broadcastAdmins(payload);

        res.json({ success: true, message: savedMsg[0] });
    } catch (error) {
        console.error('sendSupportMessage error', error);
        res.status(500).json({ error: 'Internal error' });
    }
};

// Marcar mensajes de soporte como leídos
export const markSupportRead = async (req, res) => {
    try {
        const user = req.user;
        if (!user || user.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }

        const { student_id } = req.body;
        if (!student_id) {
            return res.status(400).json({ error: 'student_id required' });
        }

        const db = (await import('../db.js')).default;

        const sql = `
            UPDATE chat_messages 
            SET is_read = 1 
            WHERE student_id = ? 
              AND category = 'support' 
              AND sender_role = 'estudiante'
              AND is_read = 0
        `;

        await db.query(sql, [student_id]);
        res.json({ success: true });
    } catch (error) {
        console.error('markSupportRead error', error);
        res.status(500).json({ error: 'Internal error' });
    }
};

// Obtener conteo de mensajes de soporte sin leer
export const getSupportUnreadCount = async (req, res) => {
    try {
        const user = req.user;
        if (!user || user.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }

        const db = (await import('../db.js')).default;

        // Total count
        const sqlTotal = `
            SELECT COUNT(*) as total 
            FROM chat_messages 
            WHERE category = 'support' 
              AND sender_role = 'estudiante'
              AND is_read = 0
        `;

        // Count per student
        const sqlByStudent = `
            SELECT student_id, COUNT(*) as count
            FROM chat_messages 
            WHERE category = 'support' 
              AND sender_role = 'estudiante'
              AND is_read = 0
            GROUP BY student_id
        `;

        const [totalRows] = await db.query(sqlTotal);
        const [studentRows] = await db.query(sqlByStudent);

        const byStudent = {};
        studentRows.forEach(row => {
            byStudent[row.student_id] = row.count;
        });

        res.json({
            data: {
                total: totalRows[0]?.total || 0,
                by_student: byStudent
            }
        });
    } catch (error) {
        console.error('getSupportUnreadCount error', error);
        res.status(500).json({ error: 'Internal error' });
    }
};
