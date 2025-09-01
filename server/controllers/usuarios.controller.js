import * as Usuarios from "../models/usuarios.model.js";
import * as AdminProfiles from "../models/admin_profiles.model.js";
import * as AsesorPerfiles from "../models/asesor_perfiles.model.js";
import * as Estudiantes from "../models/estudiantes.model.js";
import bcrypt from "bcryptjs";
import { createAccessToken, createRefreshToken } from "../libs/jwt.js";
import { findAccessToken, findRefreshToken, issueTokenCookies, maybeSlideAccess } from '../libs/authTokens.js';
import { isRevoked } from '../libs/tokenStore.js';
import jwt from "jsonwebtoken";
import { TOKEN_SECRET } from "../config.js";
import * as SoftDeletes from "../models/soft_deletes.model.js";
import * as AdminConfig from "../models/admin_config.model.js";
import db from "../db.js";

// Obtener todos los usuarios
export const obtener = async (req, res) => {
  try {
    Usuarios.ObtenerUsuarios((error, results) => {
      if (error) {
        return res.status(500).json({ message: "Error al obtener los usuarios", error });
      }

      res.status(200).json({ data: results });
    });
  } catch (error) {
    res.status(500).json({ message: "Error interno del servidor", error });
  }
};

// Crear un nuevo usuario
export const crear = async (req, res) => {
  try {
    const { 
      usuario,
      contraseña,
      role,
      id_estudiante
    } = req.body;

    // Validación básica
    if (!usuario || !contraseña) {
      return res.status(400).json({ message: "Todos los campos son obligatorios" });
    } 

    const hash = await bcrypt.hash(contraseña, 10);

    const usuarioGenerado = { usuario, contraseña: hash, role, id_estudiante };

    const result = await Usuarios.createUsuario(usuarioGenerado);

    const idInsertado = result?.insertId || null;

    return res.status(201).json({
      id: idInsertado,
      ...usuarioGenerado,
    });

  } catch (error) {
    console.error("Error en el controlador:", error);
    res.status(500).json({ message: "Error interno del servidor", error });
  }
};

// Login
export const login = async (req, res) => {
  const { usuario, contraseña, rememberMe } = req.body;

  try {
    if (!usuario || !contraseña) {
      return res.status(400).json({ message: "Usuario y contraseña son obligatorios" });
    }

  const usuarioFound = await Usuarios.getUsuarioPorusername(usuario);

    if (!usuarioFound) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

  // Bloquear si fue soft-deleted
  const soft = await SoftDeletes.getByUsuarioId(usuarioFound.id);
  if (soft) return res.status(403).json({ message: "Cuenta desactivada" });

    // Security: check lockout before verifying password
    const cfg = await AdminConfig.getConfig().catch(() => null);
    const maxAttempts = Number(cfg?.intentos_login ?? 3) || 3;
    const lockMinutesBase = 15; // base lock time
    if (usuarioFound.locked_until && new Date(usuarioFound.locked_until) > new Date()) {
      const until = new Date(usuarioFound.locked_until).toISOString();
      return res.status(429).json({ message: 'Cuenta bloqueada temporalmente', locked_until: until });
    }

    const isMatch = await bcrypt.compare(contraseña, usuarioFound.contraseña);

    if (!isMatch) {
      // Increment failed attempts and maybe lock
      await Usuarios.registerFailedAttempt(usuarioFound.id).catch(()=>{});
      const refreshed = await Usuarios.getUsuarioPorid(usuarioFound.id).catch(()=>null);
      const attempts = Number(refreshed?.failed_attempts ?? (usuarioFound.failed_attempts ?? 0));
      if (attempts >= maxAttempts) {
        await Usuarios.lockUserUntil(usuarioFound.id, lockMinutesBase).catch(()=>{});
        return res.status(429).json({ message: 'Cuenta bloqueada por múltiples intentos fallidos. Intenta más tarde.' });
      }
      return res.status(401).json({ message: "Contraseña incorrecta" });
    }

    // Token expiry según configuración
    let exp = "1d";
    try {
      const minutos = cfg?.sesion_maxima || 1440;
      // jwt exp format: s or string like "60m"; usamos minutos
      exp = `${Math.max(5, Math.min(7*24*60, minutos))}m`;
    } catch {}
  const role = (usuarioFound.role || '').toLowerCase();
  const expMinutes = parseInt(exp.replace(/m$/,''),10) || 60;
  const { accessName, refreshName } = await issueTokenCookies(res, usuarioFound.id, role, { accessMins: expMinutes, refreshDays: 30, remember: rememberMe });
  if(process.env.NODE_ENV !== 'production') console.log(`[LOGIN] role=${usuarioFound.role} accessCookie=${accessName} refreshCookie=${refreshName} remember=${rememberMe?'yes':'no'}`);

  // Reset security counters after successful login
  await Usuarios.resetLoginSecurity(usuarioFound.id).catch(()=>{});

  const userRoleLower = (usuarioFound.role || '').toLowerCase();
  if(userRoleLower === 'estudiante'){

      const estudiante = await Estudiantes.getEstudianteById(usuarioFound.id_estudiante);
      // Bloquear login si el estudiante está suspendido
      if (estudiante && estudiante.estatus === 'Suspendido') {
        return res.status(403).json({ message: 'Cuenta suspendida', reason: 'suspended' });
      }
      const softByEst = await SoftDeletes.getByEstudianteId(estudiante?.id);
      if (softByEst) return res.status(403).json({ message: "Cuenta desactivada" });

        return res.json({
          usuario: usuarioFound,
          estudiante: estudiante
        });

  } else if (userRoleLower === 'asesor') {
        let perfilAsesor = await AsesorPerfiles.getByUserId(usuarioFound.id).catch(()=>null);
        // Fallback: si no está vinculado y existe exactamente un perfil sin usuario, vincularlo (migración suave)
        if(!perfilAsesor){
          try {
            const [candidatos] = await db.query('SELECT preregistro_id FROM asesor_perfiles WHERE usuario_id IS NULL LIMIT 2');
            if(candidatos.length === 1){
              await db.query('UPDATE asesor_perfiles SET usuario_id=? WHERE preregistro_id=?',[usuarioFound.id, candidatos[0].preregistro_id]);
              perfilAsesor = await AsesorPerfiles.getByUserId(usuarioFound.id).catch(()=>null);
            }
          } catch(_e) {}
        }
      return res.json({ usuario: usuarioFound, asesor_profile: perfilAsesor || null });
    } else {
      const perfil = await AdminProfiles.getByUserId(usuarioFound.id).catch(() => null);
      return res.json({ usuario: usuarioFound, admin_profile: perfil || null });
    }
    
  } catch (error) {
    console.error("Error en el controlador:", error);
    res.status(500).json({ message: "Error interno del servidor", error });
  }
};

// Logout
export const logout = async (req, res) => {
  // Permitir logout aunque no haya req.user (token vencido) para limpiar cookies client-side
  const userId = req.user?.id;
  if (userId) {
    Usuarios.marcarComoLogout(userId, (err) => {
      if (err) console.error("Error al marcar logout:", err);
    });
  }

  // Revocar JTIs actuales (best effort)
  try {
    const cookies = req.cookies || {};
    const names = Object.keys(cookies).filter(n => /^(token_|rtoken_|access_token|refresh_token|token$|rtoken$)/.test(n));
    for (const name of names) {
      try {
        const decoded = jwt.decode(cookies[name]);
        if (decoded?.jti) {
          const { revokeJti } = await import('../libs/tokenStore.js');
          revokeJti(decoded.jti);
        }
      } catch { /* noop */ }
    }
  } catch { /* noop */ }

  const expire = { expires: new Date(0), httpOnly: true, sameSite: 'lax', path: '/' };
  ['token','rtoken','token_admin','rtoken_admin','token_asesor','rtoken_asesor','token_estudiante','rtoken_estudiante','access_token','refresh_token']
    .forEach(c=> { try { res.cookie(c,'',expire); } catch {} });
  return res.sendStatus(200);
};

// VerifyToken
export const verifyToken = async (req, res) => {
  try { res.set('Cache-Control','no-store'); res.set('Pragma','no-cache'); } catch {}
  const { value: candidate } = findAccessToken(req.cookies);
  if (!candidate) {
    const { value: rtoken, role: rrole } = findRefreshToken(req.cookies);
    if (rtoken) {
      try {
        const decoded = jwt.verify(rtoken, TOKEN_SECRET);
        const userId = decoded?.id;
        if (userId) {
          const newAccess = await createAccessToken({ id: userId, role: rrole }, '60m');
          const accessName = rrole ? `token_${rrole}` : 'token';
          const isProd = process.env.NODE_ENV === 'production';
          res.cookie(accessName, newAccess, { httpOnly: true, sameSite: 'lax', secure: isProd, path: '/' });
          if (process.env.NODE_ENV !== 'production') console.log('[VERIFY] minted access from refresh role=%s', rrole);
          return verifyToken(req, res);
        }
      } catch(e) {
        if (process.env.NODE_ENV !== 'production') console.log('[VERIFY] refresh fallback failed: %s', e.name);
      }
    }
    if (process.env.NODE_ENV !== 'production') console.log('[VERIFY] no-token cookies=%o', Object.keys(req.cookies||{}));
    return res.status(401).json({ message: 'Unauthorized', reason: 'no-token' });
  }
  jwt.verify(candidate, TOKEN_SECRET, async (err, user) => {
    if (err) {
      if (process.env.NODE_ENV !== 'production') console.log('[VERIFY] jwt error %s', err.name);
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ message: "Unauthorized", reason: 'expired' });
      }
      return res.status(401).json({ message: "Unauthorized", reason: 'invalid-token' });
    }
    if (isRevoked(user.jti)) {
      return res.status(401).json({ message: 'Unauthorized', reason: 'revoked' });
    }

  const userFound = await Usuarios.getUsuarioPorid(user.id);
  const soft = await SoftDeletes.getByUsuarioId(userFound?.id);
  if (soft) return res.status(401).json({ message: "Unauthorized", reason: 'soft-deleted' });

    if (!userFound) return res.status(401).json({ message: "Unauthorized", reason: 'user-not-found' });

  console.log(userFound);

  // Sliding expiration: renovar si queda <20%% del tiempo
  await maybeSlideAccess(res, user, candidate, { thresholdPct: 20, accessMins: 60 });

  const roleLower = (userFound.role || '').toLowerCase();
  if(roleLower === 'estudiante'){

      const estudiante = await Estudiantes.getEstudianteById(userFound.id_estudiante);
      // Bloquear acceso si el estudiante está suspendido
      if (estudiante && estudiante.estatus === 'Suspendido') {
        return res.status(401).json({ message: 'Unauthorized', reason: 'suspended' });
      }

        return res.json({
          usuario: userFound,
          estudiante: estudiante
        });

  } else if (roleLower === 'asesor') {
        let perfilAsesor = await AsesorPerfiles.getByUserId(userFound.id).catch(()=>null);
        if(!perfilAsesor){
          try {
            const [candidatos] = await db.query('SELECT preregistro_id FROM asesor_perfiles WHERE usuario_id IS NULL LIMIT 2');
            if(candidatos.length === 1){
              await db.query('UPDATE asesor_perfiles SET usuario_id=? WHERE preregistro_id=?',[userFound.id, candidatos[0].preregistro_id]);
              perfilAsesor = await AsesorPerfiles.getByUserId(userFound.id).catch(()=>null);
            }
          } catch(_e) {}
        }
      return res.json({ usuario: userFound, asesor_profile: perfilAsesor || null });
    } else {
      const perfil = await AdminProfiles.getByUserId(userFound.id).catch(() => null);
      return res.json({ usuario: userFound, admin_profile: perfil || null });
    }

  });
};

// Obtener un solo usuario
export const obtenerUno = async (req, res) => {
  const { id } = req.params;

  try {
    const usuario = await Usuarios.getUsuarioPorid(id);

    console.log("Usuario encontrado:", usuario);

    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const estudiante = await Estudiantes.getEstudianteById(usuario.id_estudiante);

    res.status(200).json({ data: usuario, estudiante });
  } catch (error) {
    console.error("Error al obtener el usuario:", error);
    res.status(500).json({ message: "Error al obtener el usuario", error });
  }
};

// Crear administrador con foto (multipart/form-data)
// Crear administrador (solo admins autenticados)
export const registrarAdmin = async (req, res) => {
  try {
    // Debe estar autenticado y ser admin
    const requesterId = req.user?.id;
    const requester = requesterId ? await Usuarios.getUsuarioPorid(requesterId) : null;
    if (!requester || requester.role !== 'admin') {
      return res.status(403).json({ message: 'Solo administradores pueden crear nuevos administradores' });
    }
  const { usuario, nombre, email, telefono } = req.body;
  const contraseña = req.body?.['contraseña'] ?? req.body?.['contrasena'] ?? req.body?.['password'];
  if (!usuario || !contraseña || !nombre || !email) {
      return res.status(400).json({ message: 'usuario, contraseña, nombre y email son obligatorios' });
    }

    // Validaciones básicas de unicidad
    const yaExisteUser = await Usuarios.getUsuarioPorusername(usuario);
    if (yaExisteUser) return res.status(409).json({ message: 'Usuario ya existe' });
  // Email único en admin_profiles
  const yaExisteEmail = email ? await AdminProfiles.getByEmail(email) : null;
  if (yaExisteEmail) return res.status(409).json({ message: 'Email ya está registrado' });

    // Foto opcional
    let fotoPath = null;
    if (req.file) {
      fotoPath = `/public/${req.file.filename}`; // expuesto por express.static('/public')
    }

    const hash = await bcrypt.hash(contraseña, 10);
  // 1) Crear usuario (auth mínimo)
  const userResult = await Usuarios.createUsuario({ usuario, contraseña: hash, role: 'admin', id_estudiante: null });
  const userId = userResult?.insertId;
  // 2) Crear perfil admin
  await AdminProfiles.createProfile({ user_id: userId, nombre, email, telefono: telefono || null, foto: fotoPath });
  const perfil = await AdminProfiles.getByUserId(userId);
  return res.status(201).json({ usuario: { id: userId, usuario, role: 'admin' }, perfil });
  } catch (error) {
    console.error('Error registrando admin:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Bootstrap del primer admin (sin sesión): requiere x-bootstrap-token y que no existan admins
export const registrarAdminBootstrap = async (req, res) => {
  try {
    const totalAdmins = await Usuarios.countAdmins();
    if (totalAdmins > 0) return res.status(403).json({ message: 'Bootstrap no permitido: ya existe al menos un admin' });

  const { usuario, nombre, email, telefono } = req.body;
  const contraseña = req.body?.['contraseña'] ?? req.body?.['contrasena'] ?? req.body?.['password'];
  if (!usuario || !contraseña || !nombre || !email) {
      return res.status(400).json({ message: 'usuario, contraseña, nombre y email son obligatorios' });
    }

    const yaExisteUser = await Usuarios.getUsuarioPorusername(usuario);
    if (yaExisteUser) return res.status(409).json({ message: 'Usuario ya existe' });
    const yaExisteEmail = email ? await AdminProfiles.getByEmail(email) : null;
    if (yaExisteEmail) return res.status(409).json({ message: 'Email ya está registrado' });

    let fotoPath = null;
    if (req.file) fotoPath = `/public/${req.file.filename}`;

    const hash = await bcrypt.hash(contraseña, 10);
    const userResult = await Usuarios.createUsuario({ usuario, contraseña: hash, role: 'admin', id_estudiante: null });
    const userId = userResult?.insertId;
    await AdminProfiles.createProfile({ user_id: userId, nombre, email, telefono: telefono || null, foto: fotoPath });
    const perfil = await AdminProfiles.getByUserId(userId);

    // Auto-login: emitir cookie como en /login
    let exp = "1d";
    try {
      const cfg = await (await import('../models/admin_config.model.js')).getConfig();
      const minutos = cfg?.sesion_maxima || 1440;
      exp = `${Math.max(5, Math.min(7*24*60, minutos))}m`;
    } catch {}
  const token = await createAccessToken({ id: userId }, exp);
  const rtoken = await createRefreshToken({ id: userId }, "30d");
    const isProd = process.env.NODE_ENV === 'production';
    const cookieOptions = {
      httpOnly: true,
      sameSite: 'lax',
      secure: isProd,
      path: '/',
    };
  res.cookie('token', token, cookieOptions);
  res.cookie('rtoken', rtoken, { ...cookieOptions, maxAge: 30 * 24 * 60 * 60 * 1000 });

    return res.status(201).json({ usuario: { id: userId, usuario, role: 'admin' }, admin_profile: perfil });
  } catch (error) {
    console.error('Error en bootstrap admin:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Perfil del admin autenticado
export const getAdminProfile = async (req, res) => {
  try {
    const userId = req.user?.id;
  if (!userId) return res.status(401).json({ message: 'Unauthorized', reason:'no-token-user' });
  const user = await Usuarios.getUsuarioPorid(userId);
  if (!user) return res.status(401).json({ message:'Unauthorized', reason:'user-not-found' });
  if (user.role !== 'admin') return res.status(403).json({ message: 'Forbidden', reason:'not-admin' });
    const perfil = await AdminProfiles.getByUserId(userId);
    return res.status(200).json({ usuario: { id: user.id, usuario: user.usuario, role: user.role }, admin_profile: perfil });
  } catch (e) {
  return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Estado de bootstrap: indica si hace falta crear el primer admin
export const getBootstrapStatus = async (req, res) => {
  try {
    const totalAdmins = await Usuarios.countAdmins();
    return res.status(200).json({ needsBootstrap: totalAdmins === 0 });
  } catch (e) {
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Actualizar perfil del admin autenticado (nombre, email, telefono)
export const updateAdminProfile = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    const user = await Usuarios.getUsuarioPorid(userId);
    if (!user || user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });

    const { nombre, email, telefono } = req.body || {};
    const updates = {};
    if (typeof nombre === 'string' && nombre.trim()) updates.nombre = nombre.trim();
    if (typeof email === 'string' && email.trim()) updates.email = email.trim();
    if (typeof telefono === 'string' && telefono.trim()) updates.telefono = telefono.trim();

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'No hay datos para actualizar' });
    }

    // Validar unicidad de email si se cambia
    if (updates.email) {
      const existing = await AdminProfiles.getByEmail(updates.email);
      if (existing && existing.user_id !== userId) {
        return res.status(409).json({ message: 'Email ya está registrado' });
      }
    }

    await AdminProfiles.updateProfile(userId, updates);
    const perfil = await AdminProfiles.getByUserId(userId);
    return res.status(200).json({ usuario: { id: user.id, usuario: user.usuario, role: user.role }, admin_profile: perfil });
  } catch (e) {
    console.error('updateAdminProfile error:', e);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Actualizar foto del admin (multipart: field 'foto')
export const updateAdminPhoto = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    const user = await Usuarios.getUsuarioPorid(userId);
    if (!user || user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });

    if (!req.file) {
      return res.status(400).json({ message: 'Archivo de foto es requerido' });
    }

    const fotoPath = `/public/${req.file.filename}`;
    await AdminProfiles.updateProfile(userId, { foto: fotoPath });
    const perfil = await AdminProfiles.getByUserId(userId);
    return res.status(200).json({ usuario: { id: user.id, usuario: user.usuario, role: user.role }, admin_profile: perfil });
  } catch (e) {
    console.error('updateAdminPhoto error:', e);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Cambiar contraseña del usuario autenticado (admin o estudiante)
export const changePassword = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const { currentPassword, newPassword } = req.body || {};
    if (!currentPassword || !newPassword) return res.status(400).json({ message: 'currentPassword y newPassword son obligatorios' });

    const user = await Usuarios.getUsuarioPorid(userId);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    const ok = await bcrypt.compare(currentPassword, user.contraseña);
    if (!ok) return res.status(401).json({ message: 'Contraseña actual incorrecta' });

    if (newPassword.length < 6) return res.status(400).json({ message: 'La nueva contraseña debe tener al menos 6 caracteres' });

    const hash = await bcrypt.hash(newPassword, 10);
    await Usuarios.updatePassword(userId, hash);
    return res.status(200).json({ message: 'Contraseña actualizada' });
  } catch (e) {
    console.error('changePassword error:', e);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Desactivar (soft-delete) la propia cuenta de admin: crea registro en soft_deletes
export const softDeleteSelf = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    const user = await Usuarios.getUsuarioPorid(userId);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    const reason = req.body?.motivo || 'Desactivación por el usuario';
    await SoftDeletes.createForUsuario(userId, reason);
    // Cerrar sesión
    res.cookie('token', '', { expires: new Date(0) });
    return res.status(200).json({ message: 'Cuenta desactivada' });
  } catch (e) {
    console.error('softDeleteSelf error:', e);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Configuración del sistema (seguridad) - obtener
export const getAdminConfig = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    const user = await Usuarios.getUsuarioPorid(userId);
    if (!user || user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    const cfg = await AdminConfig.getConfig();
    return res.status(200).json({ config: {
      sesionMaxima: cfg?.sesion_maxima ?? 480,
      intentosLogin: cfg?.intentos_login ?? 3,
      cambioPasswordObligatorio: cfg?.cambio_password_obligatorio ?? 90,
      autenticacionDosFactor: (cfg?.autenticacion_dos_factor ?? 0) === 1,
      // Campos generales
      nombreInstitucion: cfg?.nombre_institucion || null,
      emailAdministrativo: cfg?.email_administrativo || null,
      telefonoContacto: cfg?.telefono_contacto || null,
      direccion: cfg?.direccion || null,
      sitioWeb: cfg?.sitio_web || null,
      horarioAtencion: cfg?.horario_atencion || null
    }});
  } catch (e) {
    console.error('getAdminConfig error:', e);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Configuración del sistema (seguridad) - actualizar
export const updateAdminConfig = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    const user = await Usuarios.getUsuarioPorid(userId);
    if (!user || user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });

    const body = req.body || {};
    const payload = {
      sesion_maxima: Number.isInteger(body.sesionMaxima) ? body.sesionMaxima : undefined,
      intentos_login: Number.isInteger(body.intentosLogin) ? body.intentosLogin : undefined,
      cambio_password_obligatorio: Number.isInteger(body.cambioPasswordObligatorio) ? body.cambioPasswordObligatorio : undefined,
      autenticacion_dos_factor: typeof body.autenticacionDosFactor === 'boolean' ? (body.autenticacionDosFactor ? 1 : 0) : undefined,
      // Generales (strings opcionales)
      nombre_institucion: typeof body.nombreInstitucion === 'string' ? body.nombreInstitucion : undefined,
      email_administrativo: typeof body.emailAdministrativo === 'string' ? body.emailAdministrativo : undefined,
      telefono_contacto: typeof body.telefonoContacto === 'string' ? body.telefonoContacto : undefined,
      direccion: typeof body.direccion === 'string' ? body.direccion : undefined,
      sitio_web: typeof body.sitioWeb === 'string' ? body.sitioWeb : undefined,
      horario_atencion: typeof body.horarioAtencion === 'string' ? body.horarioAtencion : undefined
    };
    await AdminConfig.updateConfig(payload);
    const cfg = await AdminConfig.getConfig();
    return res.status(200).json({ config: cfg });
  } catch (e) {
    console.error('updateAdminConfig error:', e);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Métricas del Dashboard Administrativo (requiere admin)
export const getDashboardMetrics = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    const user = await Usuarios.getUsuarioPorid(userId);
    if (!user || user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });

    // Consultas paralelas (todas salvo ingresos, que requiere una pequeña lógica de fallback)
    const [
      pagosPendRows,
      nuevosAluRows,
      cursosActRows,
      accesosHoyRows,
      ingresosMesActualRows,
      ultimoMesConIngresosRows
    ] = await Promise.all([
      // Pagos pendientes: estudiantes con verificacion = 1 (enviado esperando validación)
      db.query(`SELECT COUNT(*) AS total FROM estudiantes WHERE verificacion = 1`).then(r => r[0]),

      // Nuevos alumnos del mes actual (por created_at)
      db.query(
        `SELECT COUNT(*) AS total
         FROM estudiantes
         WHERE YEAR(created_at) = YEAR(CURDATE())
           AND MONTH(created_at) = MONTH(CURDATE())`
      ).then(r => r[0]),

      // Cursos activos: cantidad de cursos con al menos un estudiante con acceso verificado (verificacion = 2)
      db.query(
        `SELECT COUNT(DISTINCT curso) AS total
         FROM estudiantes
         WHERE verificacion = 2`
      ).then(r => r[0]),

      // Accesos activados hoy: comprobantes creados hoy con importe (aprobados previamente)
      db.query(
        `SELECT COUNT(*) AS total
         FROM comprobantes c
         INNER JOIN estudiantes e ON e.id = c.id_estudiante
         LEFT JOIN soft_deletes sd ON sd.id_estudiante = e.id
         WHERE c.importe IS NOT NULL
           AND e.verificacion = 2
           AND DATE(c.created_at) = CURDATE()
           AND sd.id IS NULL`
      ).then(r => r[0]),

      // Ingresos del mes actual: solo aprobados (verificacion=2) y excluyendo soft-deletes
      db.query(
        `SELECT COALESCE(SUM(c.importe), 0) AS total
         FROM comprobantes c
         INNER JOIN estudiantes e ON e.id = c.id_estudiante
         LEFT JOIN soft_deletes sd ON sd.id_estudiante = e.id
         WHERE e.verificacion = 2
           AND c.importe IS NOT NULL
           AND YEAR(c.created_at) = YEAR(CURDATE())
           AND MONTH(c.created_at) = MONTH(CURDATE())
           AND sd.id IS NULL`
      ).then(r => r[0]),

      // Último mes (más reciente) con ingresos aprobados > 0 para usar como fallback visual
      db.query(
        `SELECT YEAR(c.created_at) AS anio,
                MONTH(c.created_at) AS mes,
                COALESCE(SUM(c.importe),0) AS total
         FROM comprobantes c
         INNER JOIN estudiantes e ON e.id = c.id_estudiante
         LEFT JOIN soft_deletes sd ON sd.id_estudiante = e.id
         WHERE e.verificacion = 2
           AND c.importe IS NOT NULL
           AND sd.id IS NULL
         GROUP BY anio, mes
         HAVING total > 0
         ORDER BY anio DESC, mes DESC
         LIMIT 1`
      ).then(r => r[0])
    ]);

    // Resolver ingresos y etiqueta del período
    const mesesES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
    const totalMesActual = Number(ingresosMesActualRows[0]?.total || 0);
    let ingresos = totalMesActual;
    let ingresosPeriodo = null;
    if (totalMesActual > 0) {
      const hoy = new Date();
      ingresosPeriodo = {
        anio: hoy.getFullYear(),
        mes: hoy.getMonth() + 1,
        etiqueta: `${mesesES[hoy.getMonth()]} ${hoy.getFullYear()}`,
        isFallback: false
      };
    } else {
      const row = ultimoMesConIngresosRows?.[0];
      const anio = Number(row?.anio || 0);
      const mes = Number(row?.mes || 0);
      const total = Number(row?.total || 0);
      ingresos = total;
      if (anio && mes) {
        ingresosPeriodo = {
          anio,
          mes,
          etiqueta: `${mesesES[mes - 1]} ${anio}`,
          isFallback: true
        };
      }
    }

    const data = {
      ingresos,
      ingresosPeriodo, // Información del periodo usado para calcular "ingresos"
      pagosPendientes: Number(pagosPendRows[0]?.total || 0),
      nuevosAlumnos: Number(nuevosAluRows[0]?.total || 0),
      cursosActivos: Number(cursosActRows[0]?.total || 0),
      accesosActivados: Number(accesosHoyRows[0]?.total || 0),
      notificationsCount: 0,
      updatedAt: new Date().toISOString(),
    };

    return res.status(200).json(data);
  } catch (error) {
    console.error('getDashboardMetrics error:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Reportes de pagos (por rango de fechas)
export const getPaymentReports = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    const user = await Usuarios.getUsuarioPorid(userId);
    if (!user || user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });

  const startDate = req.query.startDate;
  const endDate = req.query.endDate;
  // Filtros opcionales para alinear vistas por curso/grupo
  const cursoFilter = req.query.curso || null;
  const grupoFilter = req.query.grupo || null;
    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'startDate y endDate son obligatorios (YYYY-MM-DD)' });
    }

    // Normalizar límites de fecha
    const from = `${startDate} 00:00:00`;
    const to = `${endDate} 23:59:59`;

    // =============================
    // NUEVA LÓGICA DE ESTADOS:
    // verificacion: 1=pendiente, 2=aprobado, 3=rechazado
    // Solo ingresos y métricas de curso/método consideran aprobados (verificacion=2)
    // =============================

    // 1) Conteos por estado (usando verificacion en estudiantes)
    //    - Evitar sobreconteo por múltiples comprobantes del mismo alumno: contar DISTINCT e.id
    //    - Excluir soft-deletes
    //    - Para aprobados: asegurar que el comprobante tiene importe (aprobado real)
    let whereBase = `c.created_at BETWEEN ? AND ?`;
    const paramsBase = [from, to];
    if (cursoFilter) { whereBase += ` AND e.curso = ?`; paramsBase.push(cursoFilter); }
    if (grupoFilter) { whereBase += ` AND e.grupo = ?`; paramsBase.push(grupoFilter); }

    const [estadoRows] = await db.query(
      `SELECT 
          COUNT(DISTINCT CASE WHEN e.verificacion = 1 THEN e.id END) AS pendientes,
          COUNT(DISTINCT CASE WHEN e.verificacion = 2 AND c.importe IS NOT NULL THEN e.id END) AS aprobados,
          COUNT(DISTINCT CASE WHEN e.verificacion = 3 THEN e.id END) AS rechazados
       FROM comprobantes c
       INNER JOIN estudiantes e ON e.id = c.id_estudiante
       LEFT JOIN soft_deletes sd ON sd.id_estudiante = e.id
       WHERE ${whereBase}
         AND sd.id IS NULL`, paramsBase
    );

    const pagosPendientes = Number(estadoRows?.[0]?.pendientes || 0);
    const pagosAprobados = Number(estadoRows?.[0]?.aprobados || 0);
    const pagosRechazados = Number(estadoRows?.[0]?.rechazados || 0);
    const totalPagos = pagosAprobados + pagosRechazados; // procesados (no pendientes)

    // 2) Ingresos totales (solo aprobados con importe no nulo)
    const [ingRows] = await db.query(
      `SELECT COALESCE(SUM(c.importe), 0) AS totalIngresos
       FROM comprobantes c
       INNER JOIN estudiantes e ON e.id = c.id_estudiante
       LEFT JOIN soft_deletes sd ON sd.id_estudiante = e.id
       WHERE e.verificacion = 2
         AND c.importe IS NOT NULL
         AND ${whereBase}
         AND sd.id IS NULL`, paramsBase
    );
    const totalIngresos = Number(ingRows?.[0]?.totalIngresos || 0);

    // 3) Pagos aprobados por curso
    const [cursoRows] = await db.query(
      `SELECT e.curso AS curso, COUNT(DISTINCT e.id) AS pagos, COALESCE(SUM(c.importe), 0) AS ingresos
       FROM comprobantes c
       INNER JOIN estudiantes e ON e.id = c.id_estudiante
       LEFT JOIN soft_deletes sd ON sd.id_estudiante = e.id
       WHERE e.verificacion = 2
         AND c.importe IS NOT NULL
         AND ${whereBase}
         AND sd.id IS NULL
       GROUP BY e.curso
       ORDER BY ingresos DESC`, paramsBase
    );

    // 4) Ingresos por mes (solo aprobados)
    const [mesRows] = await db.query(
      `SELECT YEAR(c.created_at) AS anio,
              MONTH(c.created_at) AS mes_num,
              COALESCE(SUM(c.importe), 0) AS ingresos,
              COUNT(*) AS pagos
       FROM comprobantes c
       INNER JOIN estudiantes e ON e.id = c.id_estudiante
       LEFT JOIN soft_deletes sd ON sd.id_estudiante = e.id
       WHERE e.verificacion = 2
         AND c.importe IS NOT NULL
         AND ${whereBase}
         AND sd.id IS NULL
       GROUP BY anio, mes_num
       ORDER BY anio ASC, mes_num ASC`, paramsBase
    );

    // 5) Métodos de pago (solo aprobados)
    const [metRows] = await db.query(
      `SELECT c.metodo, COUNT(*) AS cantidad
       FROM comprobantes c
       INNER JOIN estudiantes e ON e.id = c.id_estudiante
       LEFT JOIN soft_deletes sd ON sd.id_estudiante = e.id
       WHERE e.verificacion = 2
         AND c.importe IS NOT NULL
         AND ${whereBase}
         AND sd.id IS NULL
       GROUP BY c.metodo
       ORDER BY cantidad DESC`, paramsBase
    );

    // 6) Pagos detallados (incluye aprobados, pendientes y rechazados)
    const [detalleRows] = await db.query(
      `SELECT c.id,
              e.folio,
              e.nombre,
              e.apellidos,
              e.curso,
              e.grupo,
              e.verificacion,
              c.importe,
              c.metodo,
              c.motivo_rechazo,
              c.created_at,
              c.updated_at
       FROM comprobantes c
       INNER JOIN estudiantes e ON e.id = c.id_estudiante
       LEFT JOIN soft_deletes sd ON sd.id_estudiante = e.id
       WHERE ${whereBase}
         AND sd.id IS NULL
       ORDER BY c.created_at DESC`, paramsBase
    );

    // 7) Ingresos por semana (solo aprobados). YEARWEEK con modo 1 (semana ISO)
    const [semanaRows] = await db.query(
      `SELECT YEAR(c.created_at) AS anio,
              WEEK(c.created_at, 1) AS semana,
              MIN(DATE(c.created_at)) AS fecha_inicio_semana,
              MAX(DATE(c.created_at)) AS fecha_fin_semana,
              COALESCE(SUM(c.importe),0) AS ingresos,
              COUNT(*) AS pagos
       FROM comprobantes c
       INNER JOIN estudiantes e ON e.id = c.id_estudiante
       LEFT JOIN soft_deletes sd ON sd.id_estudiante = e.id
       WHERE e.verificacion = 2
         AND c.importe IS NOT NULL
         AND ${whereBase}
         AND sd.id IS NULL
       GROUP BY anio, semana
       ORDER BY anio DESC, semana DESC`, paramsBase
    );

    // 8) Ingresos por año (solo aprobados) - útil para visión macro.
    const [anioRows] = await db.query(
      `SELECT YEAR(c.created_at) AS anio,
              COALESCE(SUM(c.importe),0) AS ingresos,
              COUNT(*) AS pagos
       FROM comprobantes c
       INNER JOIN estudiantes e ON e.id = c.id_estudiante
       LEFT JOIN soft_deletes sd ON sd.id_estudiante = e.id
       WHERE e.verificacion = 2
         AND c.importe IS NOT NULL
         AND sd.id IS NULL
       GROUP BY anio
       ORDER BY anio DESC`
    );

    const mesesES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
    const ingresosPorMes = (mesRows || []).map(r => ({
      mes: mesesES[(Number(r.mes_num) || 1) - 1],
      ingresos: Number(r.ingresos || 0),
      pagos: Number(r.pagos || 0),
      anio: Number(r.anio || 0),
      mes_num: Number(r.mes_num || 0)
    }));

    const pagosPorCurso = (cursoRows || []).map(r => ({
      curso: r.curso || 'SIN CURSO',
      pagos: Number(r.pagos || 0),
      ingresos: Number(r.ingresos || 0)
    }));

    const totalMetodos = (metRows || []).reduce((acc, r) => acc + Number(r.cantidad || 0), 0);
    const metodosDepago = (metRows || []).map(r => ({
      metodo: r.metodo || 'N/A',
      cantidad: Number(r.cantidad || 0),
      porcentaje: totalMetodos ? Math.round((Number(r.cantidad || 0) / totalMetodos) * 100) : 0
    }));

    const pagosDetallados = (detalleRows || []).map(r => ({
      id: r.id,
      folio: r.folio,
      alumno: `${r.nombre || ''} ${r.apellidos || ''}`.trim(),
      nombre: r.nombre,
      apellidos: r.apellidos,
      curso: r.curso,
      grupo: r.grupo,
      estado: r.verificacion, // 1 pendiente, 2 aprobado, 3 rechazado
      importe: r.importe != null ? Number(r.importe) : null,
      metodo: r.metodo,
      motivoRechazo: r.motivo_rechazo,
      created_at: r.created_at,
      updated_at: r.updated_at
    }));

    const ingresosPorSemana = (semanaRows || []).map(r => ({
      anio: Number(r.anio || 0),
      semana: Number(r.semana || 0),
      fechaInicio: r.fecha_inicio_semana,
      fechaFin: r.fecha_fin_semana,
      ingresos: Number(r.ingresos || 0),
      pagos: Number(r.pagos || 0)
    }));

    const ingresosPorAnio = (anioRows || []).map(r => ({
      anio: Number(r.anio || 0),
      ingresos: Number(r.ingresos || 0),
      pagos: Number(r.pagos || 0)
    }));

    // Promedio mensual simple: promedio de ingresosPorMes
    const promedioMensual = ingresosPorMes.length
      ? Math.round(ingresosPorMes.reduce((a, b) => a + b.ingresos, 0) / ingresosPorMes.length)
      : 0;

    const data = {
      resumenGeneral: {
        totalIngresos,
        totalPagos,
        pagosPendientes,
        pagosAprobados,
        pagosRechazados,
        promedioMensual
      },
      ingresosPorMes,
      pagosPorCurso,
      metodosDepago,
  pagosDetallados,
  ingresosPorSemana,
  ingresosPorAnio,
      range: { startDate, endDate },
      updatedAt: new Date().toISOString()
    };

    return res.status(200).json(data);
  } catch (error) {
    console.error('getPaymentReports error:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Exportaciones de reportes (stubs con fallback a JSON para exportación local en frontend)
export const exportPaymentReportsExcel = async (req, res) => {
  try {
    // En esta versión simple devolvemos los mismos datos para que el front genere CSV/Excel localmente
    req.query = req.query || {};
    // Reutilizar lógica (idealmente refactorizar para compartir)
    req.user = req.user; // mantener auth
    const fakeRes = { status: () => fakeRes, json: (d) => d };
    const data = await getPaymentReports(req, fakeRes);
    // Si getPaymentReports respondió ya, data será undefined; por sencillez repetimos consulta directamente aquí
    // Para no duplicar: retornamos 501 si se quiere un blob real
    return res.status(200).json({ data: (data || null), filename: 'reportes_pagos.xlsx' });
  } catch (e) {
    return res.status(500).json({ message: 'No se pudo exportar Excel' });
  }
};

export const exportPaymentReportsPDF = async (req, res) => {
  try {
    return res.status(200).json({ data: null, filename: 'reportes_pagos.pdf' });
  } catch (e) {
    return res.status(500).json({ message: 'No se pudo exportar PDF' });
  }
};