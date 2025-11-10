-- Tabla específica para el programa EEAU
-- Futuro: migrar a un esquema general de cursos.

CREATE TABLE IF NOT EXISTS eeau (
  id INT AUTO_INCREMENT PRIMARY KEY,
  codigo VARCHAR(20) NOT NULL UNIQUE DEFAULT 'EEAU',
  titulo VARCHAR(180) NOT NULL DEFAULT 'Programa EEAU',
  asesor VARCHAR(180) NOT NULL DEFAULT 'Kelvin Valentin Ramirez',
  duracion_meses INT NOT NULL DEFAULT 8,
  imagen_portada VARCHAR(255) NULL, -- Ruta relativa (ej: /public/eeau_portada.png)
  activo TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_eeau_activo (activo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Seed inicial si no existe registro
INSERT INTO eeau (codigo, titulo, asesor, duracion_meses, imagen_portada)
SELECT 'EEAU', 'Programa EEAU', 'Kelvin Valentin Ramirez', 8, '/public/eeau_portada.png'
WHERE NOT EXISTS (SELECT 1 FROM eeau WHERE codigo = 'EEAU');
