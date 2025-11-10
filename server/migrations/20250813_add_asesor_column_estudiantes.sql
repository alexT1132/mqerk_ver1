-- Agregar columna 'asesor' con valor por defecto
ALTER TABLE estudiantes ADD COLUMN asesor VARCHAR(100) NOT NULL DEFAULT 'Kélvil Valentín Gómez Ramírez';

-- Opcional: índice si se harán búsquedas por asesor
-- CREATE INDEX idx_estudiantes_asesor ON estudiantes(asesor);
