import { WebSocketServer } from 'ws';
import jwt from 'jsonwebtoken';
import cookie from 'cookie';
import { TOKEN_SECRET } from './config.js';
import * as Usuarios from './models/usuarios.model.js';

// Mapa: studentId -> Set<sockets>
const studentRooms = new Map();
// Conexiones de administradores (no necesitamos agrupar por id)
const adminSockets = new Set();

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

// Broadcast a todos los administradores conectados
export function broadcastAdmins(payload){
  if(!adminSockets.size) return;
  const data = JSON.stringify(payload);
  for(const sock of adminSockets){
    if(sock.readyState === 1){ try { sock.send(data); } catch(_){} }
  }
}

export function setupWebSocket(server){
  const wss = new WebSocketServer({ server, path: '/ws/notifications' });
  // Heartbeat para mantener conexiones y detectar cierres muertos
  wss.on('connection', (socket)=> { /* no-op here, real logic below */ });
  function heartbeat(){ this.isAlive = true; }
  const interval = setInterval(()=> {
    wss.clients.forEach(ws => {
      if(ws.isAlive === false){ try { ws.terminate(); } catch(_){} return; }
      ws.isAlive = false;
      try { ws.ping(); } catch(_){}
    });
  }, 30000);
  wss.on('close', ()=> clearInterval(interval));
  wss.on('connection', async (ws, req) => {
    ws.isAlive = true;
    ws.on('pong', heartbeat);
    try {
      const cookies = cookie.parse(req.headers.cookie || '');
      // Buscar token de acceso (multi-rol)
      const token = cookies.token_estudiante || cookies.token || cookies.token_asesor || cookies.token_admin;
      if(!token){ ws.close(4001, 'No token'); return; }
      jwt.verify(token, TOKEN_SECRET, async (err, user) => {
        if(err){ ws.close(4002, 'Invalid token'); return; }
        const userRow = await Usuarios.getUsuarioPorid(user.id).catch(()=>null);
        const rlower = (userRow?.role || '').toLowerCase();
        if(!userRow){ ws.close(4003, 'No user'); return; }
        if(rlower === 'estudiante' && userRow.id_estudiante){
          addToRoom(userRow.id_estudiante, ws);
          ws.send(JSON.stringify({ type:'welcome', role: 'estudiante', student_id: userRow.id_estudiante }));
        } else if (rlower === 'admin') {
          adminSockets.add(ws);
          ws._isAdmin = true;
          ws.send(JSON.stringify({ type:'welcome', role:'admin' }));
        } else {
          ws.close(4004, 'Role not allowed');
        }
      });
    } catch(e){ ws.close(1011, 'Error'); }

    ws.on('close', () => {
      try {
        if(ws._isAdmin){ adminSockets.delete(ws); }
        else { removeFromRoom(ws); }
      } catch(_){ removeFromRoom(ws); }
    });
  });
  return wss;
}
