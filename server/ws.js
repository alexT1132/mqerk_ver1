import { WebSocketServer } from 'ws';
import jwt from 'jsonwebtoken';
import cookie from 'cookie';
import { TOKEN_SECRET } from './config.js';
import * as Usuarios from './models/usuarios.model.js';

// Mapa: studentId -> Set<sockets>
const studentRooms = new Map();

function addToRoom(studentId, ws){
  if(!studentRooms.has(studentId)) studentRooms.set(studentId, new Set());
  studentRooms.get(studentId).add(ws);
  ws._studentId = studentId;
}
function removeFromRoom(ws){
  const sid = ws._studentId;
  if(!sid) return; const set = studentRooms.get(sid); if(!set) return; set.delete(ws); if(!set.size) studentRooms.delete(sid);
}

export function broadcastStudent(studentId, payload){
  const set = studentRooms.get(studentId); if(!set) return;
  const data = JSON.stringify(payload);
  for(const sock of set){
    if(sock.readyState === 1){ try { sock.send(data); } catch(_){} }
  }
}

export function setupWebSocket(server){
  const wss = new WebSocketServer({ server, path: '/ws/notifications' });
  wss.on('connection', async (ws, req) => {
    try {
      const cookies = cookie.parse(req.headers.cookie || '');
      // Buscar token de acceso (multi-rol)
      const token = cookies.token_estudiante || cookies.token || cookies.token_asesor || cookies.token_admin;
      if(!token){ ws.close(4001, 'No token'); return; }
      jwt.verify(token, TOKEN_SECRET, async (err, user) => {
        if(err){ ws.close(4002, 'Invalid token'); return; }
        const userRow = await Usuarios.getUsuarioPorid(user.id).catch(()=>null);
  const rlower = (userRow?.role || '').toLowerCase();
  if(!userRow || rlower !== 'estudiante' || !userRow.id_estudiante){ ws.close(4003, 'Not student'); return; }
        addToRoom(userRow.id_estudiante, ws);
        ws.send(JSON.stringify({ type:'welcome', student_id: userRow.id_estudiante }));
      });
    } catch(e){ ws.close(1011, 'Error'); }

    ws.on('close', () => removeFromRoom(ws));
  });
  return wss;
}
