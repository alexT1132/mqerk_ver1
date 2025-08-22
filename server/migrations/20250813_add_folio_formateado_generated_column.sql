-- Agrega columna generada para folio completo con prefijo M
-- Reversible quitando la columna
ALTER TABLE estudiantes 
  ADD COLUMN folio_formateado VARCHAR(25) 
  GENERATED ALWAYS AS (CONCAT('M', LEFT(curso,4), LPAD(anio,2,'0'), '-', LPAD(folio,4,'0'))) STORED;

-- Index opcional para búsquedas por folio formateado
CREATE INDEX idx_estudiantes_folio_formateado ON estudiantes(folio_formateado);
