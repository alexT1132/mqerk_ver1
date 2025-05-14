import Express from "express";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import AuthRoutes from "./Routes/auth.routes.js";

const app = Express();

app.use(morgan("dev"));
app.use(Express.json());
app.use(cookieParser());

app.use("/api", AuthRoutes);

export default app;