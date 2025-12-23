
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import db from './db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

async function migrate() {
    try {
        console.log("Updating chat_messages schema...");

        // Update sender_role enum
        await db.query(`
            ALTER TABLE chat_messages 
            MODIFY COLUMN sender_role ENUM('estudiante', 'admin', 'asesor', 'sistema') NOT NULL
        `);
        console.log("Updated sender_role ENUM");

        process.exit(0);
    } catch (e) {
        console.error("Migration failed:", e);
        process.exit(1);
    }
}

migrate();
