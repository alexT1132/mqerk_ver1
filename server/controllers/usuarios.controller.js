import * as Usuarios from "../models/usuarios.model.js";
import * as Estudiantes from "../models/estudiantes.model.js";
import bcrypt from "bcryptjs";
import { createAccessToken } from "../libs/jwt.js";
import jwt from "jsonwebtoken";
import { TOKEN_SECRET } from "../config.js";

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
  const { usuario, contraseña } = req.body;

  try {
    if (!usuario || !contraseña) {
      return res.status(400).json({ message: "Usuario y contraseña son obligatorios" });
    }

    const usuarioFound = await Usuarios.getUsuarioPorusername(usuario);

    if (!usuarioFound) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const isMatch = await bcrypt.compare(contraseña, usuarioFound.contraseña);

    if (!isMatch) {
      return res.status(401).json({ message: "Contraseña incorrecta" });
    }

    const token = await createAccessToken({ id: usuarioFound.id });
    res.cookie("token", token);

    if(usuarioFound.role === 'estudiante'){

      const estudiante = await Estudiantes.getEstudianteById(usuarioFound.id_estudiante);

        return res.json({
          usuario: usuarioFound,
          estudiante: estudiante
        });

    } else {

      return res.json({
      usuario: usuarioFound
    });

    }
    
  } catch (error) {
    console.error("Error en el controlador:", error);
    res.status(500).json({ message: "Error interno del servidor", error });
  }
};


// Logout
export const logout = async (req, res) => {

  const userId = req.user?.id;

  if (!userId) {
    return res.status(400).json({ message: "Usuario no autenticado" });
  }

  // Marcar al usuario como logueado
  Usuarios.marcarComoLogout(userId, (err) => {
    if (err) {
      console.error("Error al marcar como logueado:", err);
    }
  });

  res.cookie("token", "", {
    expires: new Date(0),
  });
  
  return res.sendStatus(200);
};

// VerifyToken
export const verifyToken = async (req, res) => {
  const { token } = req.cookies;

  if (!token) return res.status(401).json({ message: "Unauthorized" });

  jwt.verify(token, TOKEN_SECRET, async (err, user) => {
    if (err) return res.status(401).json({ message: "Unauthorized" });

    const userFound = await Usuarios.getUsuarioPorid(user.id);
    if (!userFound) res.status(401).json({ message: "Unauthorized" });

    if(userFound.role === 'estudiante'){

      const estudiante = await Estudiantes.getEstudianteById(userFound.id_estudiante);

        return res.json({
          usuario: userFound,
          estudiante: estudiante
        });

    } else {

      return res.json({
      usuario: userFound
    });

    }

  });
};

// Obtener un solo usuario
export const obtenerUno = async (req, res) => {
  const { id } = req.params;

  try {
    const usuario = await Usuarios.getUsuarioPorid(id);

    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.status(200).json({ data: usuario });
  } catch (error) {
    console.error("Error al obtener el usuario:", error);
    res.status(500).json({ message: "Error al obtener el usuario", error });
  }
};