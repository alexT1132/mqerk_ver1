import { pool } from "../db.js";

export async function ensureCursosTables() {
    console.log('[DB] Verificando tablas de cursos y previews...');

    try {
        // 1. Tabla cursos
        await pool.execute(`
      CREATE TABLE IF NOT EXISTS cursos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        codigo VARCHAR(50) DEFAULT '',
        subtitulo VARCHAR(255) DEFAULT '',
        modalidad VARCHAR(50) DEFAULT 'PRESENCIAL',
        imagenUrl VARCHAR(512) DEFAULT '',
        tags TEXT,
        alumnos INT DEFAULT 0,
        likes INT DEFAULT 0,
        vistas INT DEFAULT 0,
        section VARCHAR(50) DEFAULT 'alumnos',
        nivel VARCHAR(50) DEFAULT 'INTERMEDIO',
        duration INT DEFAULT 0,
        durationUnit VARCHAR(50) DEFAULT 'semanas',
        rating DECIMAL(3, 1) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

        // 2. Tabla previews
        await pool.execute(`
      CREATE TABLE IF NOT EXISTS previews (
        id INT AUTO_INCREMENT PRIMARY KEY,
        course_id INT NOT NULL,
        video_url VARCHAR(512),
        descripcion TEXT,
        aprenderas JSON,
        areas_ensenanza JSON,
        tagline VARCHAR(255),
        total_classes INT,
        hours_per_day VARCHAR(50),
        plan_lateral JSON,
        planes JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (course_id) REFERENCES cursos(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

        console.log('[DB] Tablas de cursos y previews verificadas correctamente.');
    } catch (error) {
        console.error('[DB] Error asegurando tablas de cursos/previews:', error);
        // No lanzamos el error para no detener el servidor, pero logueamos fuerte
    }
}
