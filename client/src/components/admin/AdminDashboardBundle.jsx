import { Routes, Route } from 'react-router-dom';

// Layout principal para administrador
import { AdminLayout } from '../layouts/AdminLayout.jsx';

// Componentes de páginas administrativas - SOLO IMPORTACIONES
import Bienvenida_Admin1  from './BienvenidaAdmin.jsx';
import DashboardMetrics from './inicio-admin.jsx';
import { ComprobanteRecibo } from '../shared/ComprobanteRecibo.jsx';
import ListaAlumnos_Admin_comp from './ListaAlumnos_Admin_comp.jsx';
import ValidacionPagos_Admin_comp from './ValidacionPagos_Admin_comp.jsx';
import { ReportesPagos_Admin_comp } from './ReportesPagos_Admin_comp.jsx';
import { Calendario_Admin_comp } from './Calendario_Admin_comp.jsx';
import  Email_Admin_comp  from './Email_Admin_comp.jsx';
import { Configuracion_Admin_comp } from './Configuracion_Admin_comp.jsx';
import StudentProfilePage from '../../pages/Admin/StudentProfilePage.jsx';


export function AdminDashboardBundle() {
  return (
    <AdminLayout>
      <Routes>
        {/* Ruta raíz del dashboard administrativo: bienvenida */}
        <Route path="/" element={<DashboardAdmin />} />
        {/* Ruta de bienvenida */}
        <Route path="/bienvenida" element={<DashboardAdmin />} />
        {/* Ruta de dashboard (mantener por compatibilidad) */}
        <Route path="/dashboard" element={<DashboardAdmin />} />
        {/* Ruta de dashboard con métricas */}
        <Route path="/dashboard-metricas" element={<InicioAdmin />} />
        {/* Ruta de inicio con métricas (mantener por compatibilidad) */}
        <Route path="/inicio-admin" element={<InicioAdmin />} />
        {/* Gestión de comprobantes de pago */}
        <Route path="/comprobantes-recibo" element={<ComprobantesAdmin />} />
        {/* Gestión de estudiantes */}
        <Route path="/lista-alumnos" element={<ListaAlumnosAdmin />} />
        {/* Perfil individual de estudiante */}
        <Route path="/student/:folio" element={<StudentProfilePage />} />
        {/* Generar contrato */}
        <Route path="/generar-contrato" element={<GenerarContratoAdmin />} />
        {/* Reportes financieros */}
        <Route path="/reportes-pagos" element={<ReportesPagosAdmin />} />
        {/* Calendario académico */}
        <Route path="/calendario" element={<CalendarioAdmin />} />
        {/* Sistema de email */}
        <Route path="/email" element={<EmailAdmin />} />
        {/* Configuración del sistema */}
        <Route path="/configuracion" element={<ConfiguracionAdmin />} />
      </Routes>
    </AdminLayout>
  );
}

// ✅ COMPONENTES DE PÁGINA INDIVIDUAL - Cada uno maneja su propio estado y datos

/**
 * Página de Bienvenida del administrador
 * Rutas: /administrativo/bienvenida y /administrativo/dashboard (compatibilidad)
 */
function DashboardAdmin() {
  return <Bienvenida_Admin1 />;
}

/**
 * Dashboard principal con métricas y estadísticas
 * Rutas: /administrativo/dashboard-metricas y /administrativo/inicio-admin (compatibilidad)
 */
function InicioAdmin() {
  return <DashboardMetrics />;
}

/**
 * Panel de gestión de comprobantes de pago
 * Ruta: /administrativo/comprobantes-recibo
 */
function ComprobantesAdmin() {
  return <ComprobanteRecibo />;
}

/**
 * Lista y gestión de estudiantes
 * Ruta: /administrativo/lista-alumnos
 */
function ListaAlumnosAdmin() {
  return <ListaAlumnos_Admin_comp />;
}

/**
 * Generación de contratos
 * Ruta: /administrativo/generar-contrato
 */
function GenerarContratoAdmin() {
  return <ValidacionPagos_Admin_comp />;
}

/**
 * Reportes financieros y estadísticas
 * Ruta: /administrativo/reportes-pagos
 */
function ReportesPagosAdmin() {
  return <ReportesPagos_Admin_comp />;
}

/**
 * Calendario académico y gestión de eventos
 * Ruta: /administrativo/calendario
 */
function CalendarioAdmin() {
  return <Calendario_Admin_comp />;
}

/**
 * Sistema de comunicación por email
 * Ruta: /administrativo/email
 */
function EmailAdmin() {
  return <Email_Admin_comp />;
}

/**
 * Configuración del sistema
 * Ruta: /administrativo/configuracion
 */
function ConfiguracionAdmin() {
  return <Configuracion_Admin_comp />;
}