import User from "../models/user.models.js";
import bcrypt from "bcryptjs";
import { createAccessToken } from "../libs/jwt.js";
import jwt from "jsonwebtoken";
import { TOKEN_SECRET } from "../config.js";

export const register = async (req, res) => {
  const { correo, contraseña, role } = req.body;

  try {
    const userFound = await User.findOne({ correo });
    if (userFound) return res.status(400).json(["Este correo ya está registrado"]);

    const hash = await bcrypt.hash(contraseña, 10);

    const newUser = new User({
      correo,
      contraseña: hash,
      role,
    });

    const userSaved = await newUser.save();

    res.json({
      id: userSaved._id,
      nombre: userSaved.nombre,
      no_trabajador: userSaved.no_trabajador,
      role: userSaved.role,
    });
  } catch (error) {
    console.log(error);
  }
};

export const login = async (req, res) => {
  const { correo, contraseña } = req.body;

  try {
    const userFound = await User.findOne({ correo });
    if (!userFound)
      return res.status(400).json({ message: "Usuario no encontrado" });

    const isMatch = await bcrypt.compare(contraseña, userFound.contraseña);
    if (!isMatch)
      return res.status(400).json({ message: "Contraseña incorrecta" });

    if (userFound.role === "Administrador") {
      const token = await createAccessToken({ id: userFound._id });

      res.cookie("token", token);
      res.json({
        id: userFound._id,
        correo: userFound.correo,
        role: userFound.role,
      });
    } 
  } catch (error) {
    console.log(error);
  }
};