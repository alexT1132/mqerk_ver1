import express from "express";
import morgan from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from 'path';

import EstudiantesRoutes from "./routes/estudiantes.routes.js";
import UsuariosRoutes from "./routes/usuarios.routes.js";
import ComprobantesRoutes from "./routes/comprobantes.routes.js";

const app = express();

app.use('/public', express.static('public'));
app.use('/comprobantes', express.static('comprobantes'));

app.use(cors({
    // origin: 'http://localhost:5173',
    origin: 'http://192.168.0.14:5173',
    credentials: true,
}));
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());

app.use("/api", EstudiantesRoutes);
app.use("/api", UsuariosRoutes);
app.use("/api", ComprobantesRoutes);

export default app;