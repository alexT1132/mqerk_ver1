import express from "express";
import morgan from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from 'path';

import EstudiantesRoutes from "./routes/estudiantes.routes.js";
import UsuariosRoutes from "./routes/usuarios.routes.js";

const app = express();

app.use('/public', express.static('public'));

app.use(cors({
    origin: 'http://192.168.0.21:5000',
    credentials: true,
}));
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());

app.use("/api", EstudiantesRoutes);
app.use("/api", UsuariosRoutes);

export default app;