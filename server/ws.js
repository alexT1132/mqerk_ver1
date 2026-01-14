import { WebSocketServer } from 'ws';
import jwt from 'jsonwebtoken';
import cookie from 'cookie';
import { TOKEN_SECRET } from './config.js';
import * as Usuarios from './models/usuarios.model.js';

// Mapa: studentId -> Set<sockets>
const studentRooms = new Map();
// Conexiones de administradores (no necesitamos agrupar por id)
const adminSockets = new Set();

function addToRoom(studentId, ws) {
  if (!studentRooms.has(studentId)) studentRooms.set(studentId, new Set());
  studentRooms.get(studentId).add(ws);
  ws._studentId = studentId;
}
function removeFromRoom(ws) {
  const sid = ws._studentId;
  if (!sid) return; const set = studentRooms.get(sid); if (!set) return; set.delete(ws); if (!set.size) studentRooms.delete(sid);
}

export function broadcastStudent(studentId, payload) {
  const set = studentRooms.get(studentId);
  console.log('[broadcastStudent] Intentando enviar a estudiante:', {
    studentId,
    hasRoom: !!set,
    roomSize: set?.size || 0,
    payloadType: payload?.type,
    senderRole: payload?.data?.sender_role,
    category: payload?.data?.category
  });
  if (!set) {
    console.log('[broadcastStudent] No hay sala para estudiante:', studentId);
    return;
  }
  const data = JSON.stringify(payload);
  let sentCount = 0;
  for (const sock of set) {
    if (sock.readyState === 1) {
      try {
        sock.send(data);
        sentCount++;
      } catch (err) {
        console.error('[broadcastStudent] Error enviando:', err);
      }
    }
  }
  console.log('[broadcastStudent] Mensajes enviados:', sentCount, 'de', set.size);
}

// Broadcast a todos los administradores conectados
export function broadcastAdmins(payload) {
  if (!adminSockets.size) return;
  const data = JSON.stringify(payload);
  for (const sock of adminSockets) {
    if (sock.readyState === 1) { try { sock.send(data); } catch (_) { } }
  }
}

export function isRoleOnline(role, specificUserId = null) {
  if (role === 'admin' || role === 'asesor') {
    // Limpiar sockets muertos antes de verificar
    const deadSockets = [];
    for (const s of adminSockets) {
      // Verificar que el socket esté realmente abierto (readyState === 1 = OPEN)
      // 0 = CONNECTING, 1 = OPEN, 2 = CLOSING, 3 = CLOSED
      if (s.readyState !== 1) {
        deadSockets.push(s);
      }
    }
    // Eliminar sockets muertos
    if (deadSockets.length > 0) {
      deadSockets.forEach(s => {
        adminSockets.delete(s);
        console.log(`[ws.js] Socket muerto eliminado: role=${s._role}, userId=${s._userId}`);
      });
    }
    
    if (specificUserId) {
      // Check if any socket in adminSockets belongs to this user AND has the correct role
      for (const s of adminSockets) {
        if (s._userId == specificUserId && s.readyState === 1 && s._role === role) {
          return true;
        }
      }
      return false;
    }
    // Si no se especifica userId, verificar si hay algún socket con ese role
    if (role === 'admin' || role === 'asesor') {
      let foundOnline = false;
      for (const s of adminSockets) {
        if (s.readyState === 1 && s._role === role) {
          foundOnline = true;
          break;
        }
      }
      // Debug log
      if (role === 'admin') {
        console.log(`[ws.js] isRoleOnline('admin'): ${foundOnline}, total adminSockets: ${adminSockets.size}`);
      }
      return foundOnline;
    }
    return false;
  }
  return false;
}

// Verificar si un estudiante específico está online
export function isStudentOnline(studentId) {
  const sockets = studentRooms.get(studentId);
  if (!sockets) return false;
  // Verificar si hay al menos un socket activo para este estudiante
  for (const sock of sockets) {
    if (sock.readyState === 1) return true;
  }
  return false;
}

// Obtener lista de estudiantes online (para asesores/admins)
export function getOnlineStudents() {
  const online = [];
  for (const [studentId, sockets] of studentRooms.entries()) {
    for (const sock of sockets) {
      if (sock.readyState === 1) {
        online.push(Number(studentId));
        break; // Solo necesitamos saber que está online, no cuántos sockets
      }
    }
  }
  return online;
}

// Obtener lista de usuarios online (estudiantes y asesores) por sus IDs de usuario
// Retorna un objeto: { studentIds: [...], advisorUserIds: [...] }
export function getOnlineUsers() {
  const studentIds = [];
  const advisorUserIds = [];
  
  // Estudiantes online
  for (const [studentId, sockets] of studentRooms.entries()) {
    for (const sock of sockets) {
      if (sock.readyState === 1) {
        studentIds.push(Number(studentId));
        break;
      }
    }
  }
  
  // Asesores/Admins online (por usuario_id)
  for (const sock of adminSockets) {
    if (sock.readyState === 1 && sock._userId) {
      advisorUserIds.push(Number(sock._userId));
    }
  }
  
  return { studentIds, advisorUserIds };
}

export function setupWebSocket(server) {
  const wss = new WebSocketServer({ server, path: '/ws/notifications' });
  // Heartbeat para mantener conexiones y detectar cierres muertos
  wss.on('connection', (socket) => { /* no-op here, real logic below */ });
  function heartbeat() { this.isAlive = true; }
  const interval = setInterval(() => {
    wss.clients.forEach(ws => {
      if (ws.isAlive === false) { 
        try { 
          // Si es un admin, eliminarlo del Set antes de terminar
          if (ws._isAdmin) {
            adminSockets.delete(ws);
            // Notificar a estudiantes que el admin se desconectó
            if (ws._role === 'admin') {
              broadcastToAllStudents({
                type: 'advisor-status-change',
                online: false,
                role: 'admin'
              });
            }
          }
          ws.terminate(); 
        } catch (_) { } 
        return; 
      }
      ws.isAlive = false;
      try { ws.ping(); } catch (_) { }
    });
  }, 30000);
  wss.on('close', () => clearInterval(interval));
  wss.on('connection', async (ws, req) => {
    ws.isAlive = true;
    ws.on('pong', heartbeat);
    try {
      const cookies = cookie.parse(req.headers.cookie || '');
      // Buscar token de acceso (multi-rol)
      const token = cookies.token_estudiante || cookies.token || cookies.token_asesor || cookies.token_admin;
      if (!token) { ws.close(4001, 'No token'); return; }
      jwt.verify(token, TOKEN_SECRET, async (err, user) => {
        if (err) { ws.close(4002, 'Invalid token'); return; }
        const userRow = await Usuarios.getUsuarioPorid(user.id).catch(() => null);
        const rlower = (userRow?.role || '').toLowerCase();
        if (!userRow) { ws.close(4003, 'No user'); return; }

        ws._userId = userRow.id; // Store user ID regarding of role

        if (rlower === 'estudiante' && userRow.id_estudiante) {
          addToRoom(userRow.id_estudiante, ws);
          ws.send(JSON.stringify({ type: 'welcome', role: 'estudiante', student_id: userRow.id_estudiante }));
        } else if (rlower === 'admin' || rlower === 'asesor') {
          adminSockets.add(ws);
          ws._isAdmin = true;
          ws._role = rlower;
          ws.send(JSON.stringify({ type: 'welcome', role: rlower }));

          // Broadcast to all students that admin/advisor is now online
          broadcastToAllStudents({
            type: 'advisor-status-change',
            online: true,
            role: rlower
          });
        } else {
          ws.close(4004, 'Role not allowed');
        }
      });
    } catch (e) { ws.close(1011, 'Error'); }

    ws.on('close', () => {
      try {
        if (ws._isAdmin) {
          const wasRole = ws._role;
          adminSockets.delete(ws);

          // Broadcast to all students that admin/advisor went offline
          // Solo notificar si realmente era admin (no asesor)
          if (wasRole === 'admin') {
            broadcastToAllStudents({
              type: 'advisor-status-change',
              online: false,
              role: 'admin'
            });
          } else if (wasRole === 'asesor') {
            broadcastToAllStudents({
              type: 'advisor-status-change',
              online: false,
              role: 'asesor'
            });
          }
        }
        else { removeFromRoom(ws); }
      } catch (_) { 
        // Asegurar limpieza incluso si hay error
        if (ws._isAdmin) adminSockets.delete(ws);
        removeFromRoom(ws); 
      }
    });
  });
  return wss;
}

// Helper function to broadcast to all connected students
function broadcastToAllStudents(payload) {
  const data = JSON.stringify(payload);
  for (const [studentId, sockets] of studentRooms.entries()) {
    for (const sock of sockets) {
      if (sock.readyState === 1) {
        try { sock.send(data); } catch (_) { }
      }
    }
  }
}

