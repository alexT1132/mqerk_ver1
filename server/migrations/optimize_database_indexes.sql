-- ============================================================================
-- MQERK ACADEMY - CRITICAL DATABASE INDEXES ONLY
-- ============================================================================
-- Purpose: Add only the most critical indexes that definitely exist
-- Version: 3.0 - Minimal safe version
-- ============================================================================

SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;

-- ============================================================================
-- CRITICAL INDEXES - Verified to exist
-- ============================================================================

-- usuarios table
CREATE INDEX IF NOT EXISTS idx_usuarios_role ON usuarios(role);
CREATE INDEX IF NOT EXISTS idx_usuarios_usuario ON usuarios(usuario);
CREATE INDEX IF NOT EXISTS idx_usuarios_estudiante ON usuarios(id_estudiante);

-- estudiantes table
CREATE INDEX IF NOT EXISTS idx_estudiantes_estatus ON estudiantes(estatus);
CREATE INDEX IF NOT EXISTS idx_estudiantes_grupo ON estudiantes(grupo);
CREATE INDEX IF NOT EXISTS idx_estudiantes_asesor ON estudiantes(asesor);

-- chat_messages table (MOST CRITICAL)
CREATE INDEX IF NOT EXISTS idx_chat_student_created ON chat_messages(student_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_category ON chat_messages(category);
CREATE INDEX IF NOT EXISTS idx_chat_unread ON chat_messages(is_read, sender_role);

-- actividades table
CREATE INDEX IF NOT EXISTS idx_actividades_activo ON actividades(activo);
CREATE INDEX IF NOT EXISTS idx_actividades_publicado ON actividades(publicado);

-- actividades_entregas table
CREATE INDEX IF NOT EXISTS idx_entregas_actividad ON actividades_entregas(id_actividad);
CREATE INDEX IF NOT EXISTS idx_entregas_estudiante ON actividades_entregas(id_estudiante);
CREATE INDEX IF NOT EXISTS idx_entregas_estado ON actividades_entregas(estado);

-- quizzes_sesiones table
CREATE INDEX IF NOT EXISTS idx_quiz_sesiones_estudiante ON quizzes_sesiones(id_estudiante);
CREATE INDEX IF NOT EXISTS idx_quiz_sesiones_quiz ON quizzes_sesiones(id_quiz);
CREATE INDEX IF NOT EXISTS idx_quiz_sesiones_estado ON quizzes_sesiones(estado);

-- quizzes_preguntas table
CREATE INDEX IF NOT EXISTS idx_quiz_preguntas_quiz ON quizzes_preguntas(id_quiz);

-- simulaciones_intentos table
CREATE INDEX IF NOT EXISTS idx_sim_intentos_estudiante ON simulaciones_intentos(id_estudiante);
CREATE INDEX IF NOT EXISTS idx_sim_intentos_simulacion ON simulaciones_intentos(id_simulacion);
-- CREATE INDEX IF NOT EXISTS idx_sim_intentos_estado ON simulaciones_intentos(estado); -- Column doesn't exist

-- simulaciones_preguntas table
CREATE INDEX IF NOT EXISTS idx_sim_preguntas_simulacion ON simulaciones_preguntas(id_simulacion);

-- calendar_events table
CREATE INDEX IF NOT EXISTS idx_calendar_user ON calendar_events(user_id);
CREATE INDEX IF NOT EXISTS idx_calendar_fecha ON calendar_events(fecha);
CREATE INDEX IF NOT EXISTS idx_calendar_completado ON calendar_events(completado);

-- asistencias table
CREATE INDEX IF NOT EXISTS idx_asistencias_estudiante ON asistencias(id_estudiante);
CREATE INDEX IF NOT EXISTS idx_asistencias_asesor ON asistencias(id_asesor);
CREATE INDEX IF NOT EXISTS idx_asistencias_fecha ON asistencias(fecha);

-- comprobantes table
CREATE INDEX IF NOT EXISTS idx_comprobantes_estudiante ON comprobantes(id_estudiante);

-- contratos table
CREATE INDEX IF NOT EXISTS idx_contratos_estudiante ON contratos(id_estudiante);

-- ingresos table
CREATE INDEX IF NOT EXISTS idx_ingresos_estudiante ON ingresos(id_estudiante);
CREATE INDEX IF NOT EXISTS idx_ingresos_fecha ON ingresos(fecha);

-- gastos_fijos table
CREATE INDEX IF NOT EXISTS idx_gastos_fijos_fecha ON gastos_fijos(fecha_pago);

-- gastos_variables table
-- CREATE INDEX IF NOT EXISTS idx_gastos_variables_fecha ON gastos_variables(fecha_gasto); -- Column doesn't exist

-- asesor_perfiles table
CREATE INDEX IF NOT EXISTS idx_asesor_perfiles_usuario ON asesor_perfiles(usuario_id);
CREATE INDEX IF NOT EXISTS idx_asesor_perfiles_preregistro ON asesor_perfiles(preregistro_id);

-- asesor_notifications table
CREATE INDEX IF NOT EXISTS idx_asesor_notif_user ON asesor_notifications(asesor_user_id);
CREATE INDEX IF NOT EXISTS idx_asesor_notif_read ON asesor_notifications(is_read);

-- feedback_submissions table
CREATE INDEX IF NOT EXISTS idx_feedback_estudiante ON feedback_submissions(id_estudiante);
CREATE INDEX IF NOT EXISTS idx_feedback_task ON feedback_submissions(id_task);

-- ai_usage_log table
CREATE INDEX IF NOT EXISTS idx_ai_log_usuario ON ai_usage_log(id_usuario);
CREATE INDEX IF NOT EXISTS idx_ai_log_timestamp ON ai_usage_log(timestamp);

-- admin_profiles table
CREATE INDEX IF NOT EXISTS idx_admin_profiles_user ON admin_profiles(user_id);

SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;

-- Analyze critical tables
ANALYZE TABLE usuarios, estudiantes, chat_messages;
ANALYZE TABLE actividades_entregas, quizzes_sesiones, simulaciones_intentos;

SELECT 'Critical indexes created successfully!' AS Status,
       'Performance should improve significantly' AS Result;
