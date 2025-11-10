-- Create tables for student area access requests and permissions (idempotent)

CREATE TABLE IF NOT EXISTS student_area_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_estudiante INT NOT NULL,
  area_id INT NOT NULL,
  area_type VARCHAR(16) NOT NULL DEFAULT 'actividad', -- 'actividad' | 'simulacion'
  status ENUM('pending','approved','denied','revoked') NOT NULL DEFAULT 'pending',
  notes TEXT NULL,
  decided_by INT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  decided_at TIMESTAMP NULL DEFAULT NULL,
  INDEX idx_sar_student (id_estudiante),
  INDEX idx_sar_status (status),
  INDEX idx_sar_area (area_id, area_type),
  INDEX idx_sar_created (created_at),
  CONSTRAINT fk_sar_student FOREIGN KEY (id_estudiante) REFERENCES estudiantes(id) ON DELETE CASCADE,
  CONSTRAINT fk_sar_decider FOREIGN KEY (decided_by) REFERENCES usuarios(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS student_area_permissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_estudiante INT NOT NULL,
  area_id INT NOT NULL,
  area_type VARCHAR(16) NOT NULL DEFAULT 'actividad',
  granted_by INT NULL,
  granted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_perm (id_estudiante, area_id, area_type),
  INDEX idx_sap_student (id_estudiante),
  INDEX idx_sap_area (area_id, area_type),
  CONSTRAINT fk_sap_student FOREIGN KEY (id_estudiante) REFERENCES estudiantes(id) ON DELETE CASCADE,
  CONSTRAINT fk_sap_granted_by FOREIGN KEY (granted_by) REFERENCES usuarios(id) ON DELETE SET NULL
);
