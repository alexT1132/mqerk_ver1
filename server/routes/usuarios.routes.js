import { Router } from "express";
import { obtener, crear, login, verifyToken } from "../controllers/usuarios.controller.js";
import { authREquired } from "../middlewares/validateToken.js";

const router = Router();

router.get("/usuario", obtener);

router.post("/register", crear);

router.post("/login", login);

router.get("/verify", verifyToken);

export default router;