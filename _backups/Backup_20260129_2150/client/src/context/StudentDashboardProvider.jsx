import { StudentProvider } from './StudentContext';
import { StudentNotificationProvider } from './StudentNotificationContext';

/**
 * PROVEEDOR COMBINADO PARA EL ESTUDIANTE
 * 
 * Este componente combina tanto el contexto del estudiante como el de notificaciones
 * para proporcionar una experiencia completa del dashboard del estudiante.
 * 
 * Uso:
 * <StudentDashboardProvider>
 *   <AlumnoLayout>
 *     <DashboardContent />
 *   </AlumnoLayout>
 * </StudentDashboardProvider>
 * 
 * Características:
 * - Datos del estudiante centralizados
 * - Notificaciones en tiempo real
 * - Control de acceso basado en pagos
 * - Estado de verificación del estudiante
 * - Progreso de cursos matriculados
 */
export function StudentDashboardProvider({ children }) {
  return (
    <StudentProvider>
      <StudentNotificationProvider>
        {children}
      </StudentNotificationProvider>
    </StudentProvider>
  );
}

/**
 * Hook combinado para facilitar el uso de ambos contextos
 * 
 * Uso:
 * const { student, notifications } = useStudentDashboard();
 */
export function useStudentDashboard() {
  return {
    // Re-exportar hooks individuales para conveniencia
    student: require('./StudentContext').useStudent,
    notifications: require('./StudentNotificationContext').useStudentNotifications
  };
}

// También exportar contextos individuales para uso específico
export { StudentProvider, useStudent } from './StudentContext';
export { 
  StudentNotificationProvider, 
  useStudentNotifications,
  NOTIFICATION_TYPES,
  NOTIFICATION_PRIORITIES 
} from './StudentNotificationContext';