-- Ajusta columna generada para usar año + 1 en la parte central
ALTER TABLE estudiantes 
  DROP COLUMN folio_formateado;
ALTER TABLE estudiantes 
  ADD COLUMN folio_formateado VARCHAR(25) 
  GENERATED ALWAYS AS (CONCAT('M', LEFT(curso,4), LPAD((anio + 1) % 100,2,'0'), '-', LPAD(folio,4,'0'))) STORED;
CREATE INDEX idx_estudiantes_folio_formateado ON estudiantes(folio_formateado);
