-- Crear tablas para Feedback (tareas y entregas de alumnos)
CREATE TABLE IF NOT EXISTS feedback_tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  descripcion TEXT NULL,
  puntos INT NOT NULL DEFAULT 10,
  due_date DATETIME NOT NULL,
  activo TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_feedback_tasks_due_date (due_date),
  INDEX idx_feedback_tasks_activo (activo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS feedback_submissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_task INT NOT NULL,
  id_estudiante INT NOT NULL,
  archivo VARCHAR(255) NOT NULL,
  original_nombre VARCHAR(255) NULL,
  mime_type VARCHAR(100) NULL,
  tamano INT NULL,
  puntos INT NOT NULL DEFAULT 10,
  version INT NOT NULL DEFAULT 1,
  replaced_by INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_feedback_submissions_task_student (id_task, id_estudiante),
  INDEX idx_feedback_submissions_student (id_estudiante),
  CONSTRAINT fk_feedback_submissions_task FOREIGN KEY (id_task) REFERENCES feedback_tasks(id) ON DELETE CASCADE,
  CONSTRAINT fk_feedback_submissions_estudiante FOREIGN KEY (id_estudiante) REFERENCES estudiantes(id) ON DELETE CASCADE,
  CONSTRAINT fk_feedback_submissions_replaced FOREIGN KEY (replaced_by) REFERENCES feedback_submissions(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
