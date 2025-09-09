-- Add hora (TIME), descripcion (VARCHAR), and calendar_event_id (INT) to ingresos
ALTER TABLE ingresos
  ADD COLUMN hora TIME NULL AFTER fecha,
  ADD COLUMN descripcion VARCHAR(500) NULL AFTER notas,
  ADD COLUMN calendar_event_id INT NULL AFTER descripcion;

-- Optional index to help lookups by calendar_event_id
CREATE INDEX IF NOT EXISTS idx_ingresos_calendar_event_id ON ingresos (calendar_event_id);
