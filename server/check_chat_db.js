
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

import db from './db.js';

async function checkDB() {
    try {
        console.log("Connected to DB via db.js");

        // Check columns
        const [columns] = await db.query("SHOW COLUMNS FROM chat_messages");
        console.log("\nTable `chat_messages` columns:");
        console.table(columns);

        // Check for users with id_estudiante (using correct table 'usuarios')
        const [users] = await db.query("SELECT id, usuario, role, id_estudiante FROM usuarios WHERE role='estudiante' LIMIT 5");
        console.log("\nSample Students (usuarios table):");
        console.table(users);

        // Check recent messages
        const [msgs] = await db.query("SELECT * FROM chat_messages ORDER BY created_at DESC LIMIT 5");
        console.log("\nRecent Messages:");
        console.table(msgs);

        process.exit(0);
    } catch (e) {
        console.error("Error:", e);
        process.exit(1);
    }
}

checkDB();
