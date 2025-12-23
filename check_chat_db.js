
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../server/.env') });

async function checkDB() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT
        });

        console.log("Connected to DB");

        // Check table structure
        const [columns] = await connection.query("SHOW COLUMNS FROM chat_messages");
        console.log("\nTable `chat_messages` columns:");
        console.table(columns);

        // Check for users with id_estudiante
        const [users] = await connection.query("SELECT id, usuario, role, id_estudiante FROM users WHERE role='estudiante' LIMIT 5");
        console.log("\nSample Students (users table):");
        console.table(users);

        // Check recent messages
        const [msgs] = await connection.query("SELECT * FROM chat_messages ORDER BY created_at DESC LIMIT 5");
        console.log("\nRecent Messages:");
        console.table(msgs);

        await connection.end();
    } catch (e) {
        console.error("Error:", e);
    }
}

checkDB();
