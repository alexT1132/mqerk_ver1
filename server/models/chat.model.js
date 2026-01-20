import db from '../db.js';

/**
 * Asegura que la tabla de chats exista con todas sus columnas.
 * Maneja tanto instalaciones nuevas como actualizaciones (migraciones).
 */
export const ensureChatTable = async () => {
    // 1. Definición COMPLETA (incluyendo file_path y category desde el inicio)
    const query = `
    CREATE TABLE IF NOT EXISTS chat_messages (
      id INT AUTO_INCREMENT PRIMARY KEY,
      student_id INT NOT NULL,
      sender_role ENUM('estudiante', 'admin', 'asesor', 'sistema') NOT NULL,
      message TEXT,
      type ENUM('text', 'image', 'file') DEFAULT 'text',
      category ENUM('general', 'support', 'academic', 'schedule_info') DEFAULT 'general',
      file_path VARCHAR(500) NULL,
      is_read BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_student (student_id),
      INDEX idx_created (created_at),
      INDEX idx_category (category)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;
    
    await db.query(query);

    // --- SECCIÓN DE MIGRACIONES (Para bases de datos ya existentes) ---
    
    // Función auxiliar para agregar columnas sin romper el código si ya existen
    const addColumnSafe = async (alterQuery) => {
        try {
            await db.query(alterQuery);
            console.log(`[DB] Migración ejecutada: ${alterQuery}`);
        } catch (e) {
            // Código 1060: Duplicate column name. Lo ignoramos.
            // Cualquier otro error sí lo mostramos.
            if (e.code !== 'ER_DUP_FIELDNAME') {
                console.error(`[DB Error] Falló migración:`, e);
            }
        }
    };

    // Intentamos agregar 'category' (incluyendo la nueva opción 'schedule_info')
    await addColumnSafe("ALTER TABLE chat_messages ADD COLUMN category ENUM('general', 'support', 'academic', 'schedule_info') DEFAULT 'general' AFTER type");
    
    // Intentamos agregar 'file_path'
    await addColumnSafe("ALTER TABLE chat_messages ADD COLUMN file_path VARCHAR(500) NULL AFTER message");

    console.log('[DB] Tabla chat_messages asegurada y actualizada.');
};

/**
 * Guarda un mensaje en la base de datos.
 */
export const saveMessage = async ({ student_id, sender_role, message, type = 'text', category = 'general', file_path = null }) => {
    // Validación de seguridad: Evitar guardar mensajes vacíos (a menos que sea solo un archivo)
    if (!message && !file_path) {
        throw new Error("No se puede guardar un mensaje vacío (se requiere texto o archivo).");
    }

    const [result] = await db.query(
        `INSERT INTO chat_messages (student_id, sender_role, message, type, category, file_path) VALUES (?, ?, ?, ?, ?, ?)`,
        [student_id, sender_role, message, type, category, file_path]
    );
    
    return { 
        id: result.insertId, 
        student_id, 
        sender_role, 
        message, 
        type, 
        category, 
        file_path, 
        created_at: new Date() 
    };
};

/**
 * Busca el último aviso de horario enviado por el sistema para evitar spam.
 * Ahora busca por texto O por categoría 'schedule_info' si decides usarla.
 */
export const getLastHoursNotice = async (student_id, category = 'general') => {
    // Mantenemos el filtro por texto para compatibilidad con tus datos actuales
    const likePattern = '%Lunes a Viernes 9:00 AM - 6:00 PM%';
    
    const [rows] = await db.query(
        `SELECT id, created_at, message 
         FROM chat_messages 
         WHERE student_id = ? 
           AND sender_role = 'sistema'
           AND (
               (category = ? AND message LIKE ?) 
               OR category = 'schedule_info'
           )
         ORDER BY created_at DESC
         LIMIT 1`,
        [student_id, category, likePattern]
    );
    return rows?.[0] || null;
};

/**
 * Obtiene el historial de chat.
 * MEJORA: Se agregó el parámetro 'offset' para poder cargar mensajes antiguos (paginación).
 */
export const getHistory = async (student_id, limit = 50, offset = 0) => {
    // Aseguramos que los números sean enteros para evitar inyecciones raras
    const safeLimit = parseInt(limit) || 50;
    const safeOffset = parseInt(offset) || 0;

    const [rows] = await db.query(
        `SELECT * FROM chat_messages 
         WHERE student_id = ? 
         ORDER BY created_at DESC 
         LIMIT ? OFFSET ?`,
        [student_id, safeLimit, safeOffset]
    );
    
    // Invertimos el array para que en el frontend se muestren cronológicamente (antiguos arriba, nuevos abajo)
    return rows.reverse();
};

/**
 * Marca los mensajes como leídos dependiendo de quién los lea.
 */
export const markAsRead = async (student_id, role_reader) => {
    // Lógica: Si lee el estudiante, se marcan los de admin/asesor/sistema.
    // Si lee un admin, se marcan los del estudiante.
    const targetRoles = role_reader === 'estudiante' 
        ? ['admin', 'asesor', 'sistema'] 
        : ['estudiante'];

    // Generamos los placeholders dinámicamente (?,?,?)
    const placeholders = targetRoles.map(() => '?').join(',');

    await db.query(
        `UPDATE chat_messages SET is_read = TRUE 
         WHERE student_id = ? 
           AND sender_role IN (${placeholders}) 
           AND is_read = FALSE`,
        [student_id, ...targetRoles]
    );
};