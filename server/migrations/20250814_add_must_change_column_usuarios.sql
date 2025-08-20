-- Aumentar seguridad: flag para forzar cambio de contraseña al primer login
ALTER TABLE usuarios
  ADD COLUMN IF NOT EXISTS must_change TINYINT(1) NOT NULL DEFAULT 1 AFTER contraseña,
  ADD COLUMN IF NOT EXISTS last_login_at DATETIME NULL AFTER must_change;
