-- Crea tabla para almacenar perfil completo del asesor luego de aprobar y completar registro
CREATE TABLE IF NOT EXISTS asesor_perfiles (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  preregistro_id BIGINT UNSIGNED NOT NULL,
  -- usuarios.id actualmente es INT (signed), por eso aquí usamos INT para que el FK sea válido
  usuario_id INT NULL,
  -- Datos personales
  direccion VARCHAR(255) NOT NULL,
  municipio VARCHAR(120) NOT NULL,
  nacimiento DATE NOT NULL,
  nacionalidad VARCHAR(120) NOT NULL,
  genero VARCHAR(40) NOT NULL,
  rfc VARCHAR(30) NOT NULL,
  -- Datos académicos
  nivel_estudios VARCHAR(60) NOT NULL,
  institucion VARCHAR(255) NOT NULL,
  titulo_academico TINYINT(1) NOT NULL DEFAULT 0,
  anio_graduacion SMALLINT NOT NULL,
  titulo_archivo VARCHAR(255) NULL,
  certificaciones_archivo VARCHAR(255) NULL,
  -- Experiencia
  experiencia_rango VARCHAR(40) NOT NULL,
  areas_especializacion JSON NULL,
  empresa VARCHAR(255) NOT NULL,
  ultimo_puesto VARCHAR(255) NOT NULL,
  funciones TEXT NOT NULL,
  plataformas JSON NULL,
  -- Documentos
  doc_identificacion VARCHAR(255) NULL,
  doc_comprobante_domicilio VARCHAR(255) NULL,
  doc_titulo_cedula VARCHAR(255) NULL,
  doc_certificaciones VARCHAR(255) NULL,
  doc_carta_recomendacion VARCHAR(255) NULL,
  doc_curriculum VARCHAR(255) NULL,
  doc_fotografia VARCHAR(255) NULL,
  -- Info adicional
  fuente_conociste JSON NULL,
  motivaciones JSON NULL,
  dispuesto_capacitacion TINYINT(1) NOT NULL DEFAULT 1,
  consentimiento_datos TINYINT(1) NOT NULL DEFAULT 1,
  firma_texto VARCHAR(255) NULL,
  -- Auditoría
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_asesor_perfiles_preregistro (preregistro_id),
  KEY idx_ap_preregistro (preregistro_id),
  KEY idx_ap_usuario (usuario_id),
  CONSTRAINT fk_ap_preregistro FOREIGN KEY (preregistro_id) REFERENCES asesor_preregistros(id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_ap_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
