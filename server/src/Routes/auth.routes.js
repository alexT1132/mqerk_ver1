import { Router } from "express";
import { register, login } from "../Controllers/Auth.controller.js";

const router = Router();

router.post("/register", register);

router.post("/login", login);

export default router;