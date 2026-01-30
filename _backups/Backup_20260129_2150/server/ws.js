import { WebSocketServer } from 'ws';
import jwt from 'jsonwebtoken';
import cookie from 'cookie';
import { TOKEN_SECRET } from './config.js';
import * as Usuarios from './models/usuarios.model.js';
import { findAccessToken } from './libs/authTokens.js';

// Mapa: studentId -> Set<sockets>
const studentRooms = new Map();
// Set de conexiones de administradores y asesores
const adminSockets = new Set();

// --- GESTIÓN DE SALAS DE ESTUDIANTES ---

function addToRoom(studentId, ws) {
  if (!studentRooms.has(studentId)) studentRooms.set(studentId, new Set());
  studentRooms.get(studentId).add(ws);
  ws._studentId = studentId;
}

function removeFromRoom(ws) {
  const sid = ws._studentId;
  if (!sid) return;
  const set = studentRooms.get(sid);
  if (!set) return;
  
  set.delete(ws);
  if (set.size === 0) {
    studentRooms.delete(sid);
  }
}

// --- FUNCIONES DE BROADCAST ---

export function broadcastStudent(studentId, payload) {
  const set = studentRooms.get(studentId);
  // Logs de depuración reducidos para no saturar consola en producción
  if (!set) {
    // console.log('[broadcastStudent] Estudiante no conectado:', studentId);
    return;
  }
  
  const data = JSON.stringify(payload);
  for (const sock of set) {
    if (sock.readyState === 1) { // 1 = OPEN
      try { sock.send(data); } catch (err) { console.error('[WS Error]', err); }
    }
  }
}

export function broadcastAdmins(payload) {
  if (!adminSockets.size) return;
  const data = JSON.stringify(payload);
  for (const sock of adminSockets) {
    if (sock.readyState === 1) {
      try { sock.send(data); } catch (_) { }
    }
  }
}

// Enviar solo a sockets de un rol (admin o asesor)
export function broadcastRole(role, payload) {
  if (!adminSockets.size) return;
  const targetRole = String(role || '').toLowerCase();
  const data = JSON.stringify(payload);
  for (const sock of adminSockets) {
    if (sock.readyState === 1 && sock._role === targetRole) {
      try { sock.send(data); } catch (_) { }
    }
  }
}

// Enviar a un usuario específico (admin/asesor) por usuario_id
export function broadcastUser(userId, payload, role = null) {
  if (!adminSockets.size) return;
  const uid = Number(userId);
  if (!uid) return;
  const roleFilter = role ? String(role).toLowerCase() : null;
  const data = JSON.stringify(payload);
  for (const sock of adminSockets) {
    if (sock.readyState !== 1) continue;
    if (Number(sock._userId) !== uid) continue;
    if (roleFilter && sock._role !== roleFilter) continue;
    try { sock.send(data); } catch (_) { }
  }
}

// Helper para notificar a TODOS los estudiantes (útil para cambios de estado global)
function broadcastToAllStudents(payload) {
  const data = JSON.stringify(payload);
  for (const [, sockets] of studentRooms.entries()) {
    for (const sock of sockets) {
      if (sock.readyState === 1) {
        try { sock.send(data); } catch (_) { }
      }
    }
  }
}

// --- VERIFICACIÓN DE ESTADO ---

/**
 * Verifica si hay AL MENOS UN socket conectado con el rol específico.
 * Se usa para saber si hay alguien atendiendo soporte o tutoría.
 */
export function isRoleOnline(role, specificUserId = null) {
  // Limpieza proactiva de sockets cerrados no detectados
  for (const s of adminSockets) {
    if (s.readyState !== 1) adminSockets.delete(s);
  }

  // Caso 1: Verificar si un usuario específico (ej: Juan el Admin) está online
  if (specificUserId) {
    for (const s of adminSockets) {
      if (s._userId == specificUserId && s._role === role) return true;
    }
    return false;
  }

  // Caso 2: Verificar si CUALQUIER usuario con ese rol está online (Semaforo general)
  for (const s of adminSockets) {
    if (s._role === role) return true;
  }
  
  return false;
}

export function isStudentOnline(studentId) {
  const sockets = studentRooms.get(studentId);
  if (!sockets) return false;
  for (const sock of sockets) {
    if (sock.readyState === 1) return true;
  }
  return false;
}

export function getOnlineStudents() {
  const online = [];
  for (const [studentId, sockets] of studentRooms.entries()) {
    // Basta con que uno de sus sockets esté abierto
    for (const sock of sockets) {
      if (sock.readyState === 1) {
        online.push(Number(studentId));
        break; 
      }
    }
  }
  return online;
}

export function getOnlineUsers() {
  const studentIds = getOnlineStudents();
  const advisorUserIds = new Set();
  
  for (const sock of adminSockets) {
    if (sock.readyState === 1 && sock._userId) {
      advisorUserIds.add(Number(sock._userId));
    }
  }
  
  return { studentIds, advisorUserIds: Array.from(advisorUserIds) };
}

// --- CONFIGURACIÓN DEL SERVIDOR ---

export function setupWebSocket(server) {
  const wss = new WebSocketServer({ server, path: '/ws/notifications' });

  // HEARTBEAT: Detectar conexiones muertas (cierre de navegador forzado, pérdida de red)
  function heartbeat() { this.isAlive = true; }
  
  const interval = setInterval(() => {
    wss.clients.forEach(ws => {
      if (ws.isAlive === false) {
        // Forzar terminación si no respondió al ping anterior
        return ws.terminate();
      }
      ws.isAlive = false;
      ws.ping();
    });
  }, 30000);

  wss.on('close', () => clearInterval(interval));

  wss.on('connection', async (ws, req) => {
    ws.isAlive = true;
    ws.on('pong', heartbeat);

    try {
      // 1. Autenticación
      const cookies = cookie.parse(req.headers.cookie || '');
      const { value: token } = findAccessToken(cookies);

      if (!token) { ws.close(4001, 'No token'); return; }

      jwt.verify(token, TOKEN_SECRET, async (err, user) => {
        if (err) { ws.close(4002, 'Invalid token'); return; }

        // 2. Obtener datos frescos de la BD para asegurar rol actual
        const userRow = await Usuarios.getUsuarioPorid(user.id).catch(() => null);
        if (!userRow) { ws.close(4003, 'No user'); return; }

        const role = (userRow.role || '').toLowerCase();
        ws._userId = userRow.id;
        ws._role = role;

        // 3. Asignación a Salas
        if (role === 'estudiante' && userRow.id_estudiante) {
          addToRoom(userRow.id_estudiante, ws);
          ws.send(JSON.stringify({ type: 'welcome', role: 'estudiante', student_id: userRow.id_estudiante }));
        } 
        else if (role === 'admin' || role === 'asesor') {
          adminSockets.add(ws);
          ws._isAdmin = true; // Flag rápido para lógica de desconexión
          ws.send(JSON.stringify({ type: 'welcome', role: role }));

          // Notificar conexión SOLO si es el primer socket de este tipo (opcional, o siempre)
          // Aquí notificamos siempre para asegurar consistencia en UI
          broadcastToAllStudents({
            type: 'advisor-status-change',
            online: true,
            role: role,
            user_id: ws._userId,
            event: 'connect'
          });
        } 
        else {
          ws.close(4004, 'Role not allowed');
        }
      });
    } catch (e) {
      console.error('[WS Connection Error]', e);
      ws.close(1011, 'Internal Error');
    }

    // 4. Manejo de Desconexión
    ws.on('close', () => {
      if (ws._isAdmin) {
        // Eliminar este socket específico
        adminSockets.delete(ws);
        const role = ws._role;
        const stillOnline = isRoleOnline(role);

        // IMPORTANTE:
        // Para el chat del alumno necesitamos enterarnos cuando SU asesor se desconecta,
        // aunque existan otros asesores conectados. Por eso emitimos SIEMPRE el evento,
        // y el frontend re-consulta /chat/status para resolver el asesor asignado.
        broadcastToAllStudents({
          type: 'advisor-status-change',
          online: stillOnline,
          role: role,
          user_id: ws._userId,
          event: 'disconnect'
        });
      } else {
        removeFromRoom(ws);
      }
    });
  });

  return wss;
}