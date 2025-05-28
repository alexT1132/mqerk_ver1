import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { createAccessToken } from "../libs/jwt.js";
import jwt from "jsonwebtoken";
import { TOKEN_SECRET } from "../config.js";

export const register = async (req, res) => {
    const { correo, contraseña, role } = req.body;

    try {
        const passwordHash = await bcrypt.hash(contraseña, 10);

        const newUser = new User({
            correo,
            contraseña: passwordHash,
            role
        });

        const userSaved = await newUser.save();

        res.json({
            id: userSaved._id,
            correo: userSaved.correo,
            role: userSaved.role
        });

    } catch (error) {
        console.log(error);
    }
}

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

        } else if (userFound.role === "Asesor") {

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

export const logout = async (req, res) => {
    res.cookie("token", "", {
        expires: new Date(0),
    });
    return res.sendStatus(200);
}

export const profile = async (req, res) => {

    const userFound = await User.findById(req.user.id);

    if (!userFound) return res.status(404).json({ message: "Usuario no encontrado" });

    return res.json({
        id: userFound._id,
        correo: userFound.correo,
        role: userFound.role
    });

}

export const verifyToken = async (req, res) => {
  const { token } = req.cookies;

  if (!token) return res.status(401).json({ message: "Unauthorized" });

  jwt.verify(token, TOKEN_SECRET, async (err, user) => {
    if (err) return res.status(401).json({ message: "Unauthorized" });

    const userFound = await User.findById(user.id);
    if (!userFound) res.status(401).json({ message: "Unauthorized" });

    return res.json({
      id: userFound._id,
      correo: userFound.correo,
      role: userFound.role,
    });
  });
};