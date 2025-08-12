// Load environment variables from .env and override existing ones (helps when OS vars are misquoted)
import dotenv from 'dotenv';
dotenv.config({ override: true });
import app from "./app.js";
import db from './db.js';

app.listen(1002);
console.log("Conectado en el puerto", 1002);