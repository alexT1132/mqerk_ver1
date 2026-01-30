// AdminDashboardBundle.jsx
// Este componente agrupa todas las rutas y componentes del dashboard administrativo
// Mantiene un layout consistente y maneja la navegación entre las diferentes secciones administrativas
// si asi no entiedes paar que sirve esto pues pideselo a chat gpt bro
import { Routes, Route } from 'react-router-dom';

// Layout principal para administrador
import { AdminLayout } from '../layouts/AdminLayout.jsx';

// Componentes de páginas administrativas - SOLO IMPORTACIONES
import Bienvenida_Admin1 from './BienvenidaAdmin.jsx';
import DashboardMetrics from './inicio-admin.jsx';
import { ComprobanteRecibo } from '../shared/ComprobanteRecibo.jsx';
import ListaAlumnos_Admin_comp from './ListaAlumnos_Admin_comp.jsx';
import ValidacionPagos_Admin_comp from './ValidacionPagos_Admin_comp.jsx';
import { ReportesPagos_Admin_comp } from './ReportesPagos_Admin_comp.jsx';
import { Calendario_Admin_comp } from './Calendario_Admin_comp.jsx';
import Email_Admin_comp from './Email_Admin_comp.jsx';
import { Configuracion_Admin_comp } from './Configuracion_Admin_comp.jsx';
import AdministrarAsesores from './AdministrarAsesores.jsx';
import StudentProfilePage from '../../pages/Admin/StudentProfilePage.jsx';
import StudentPaymentsPage from '../../pages/Admin/StudentPaymentsPage.jsx';
import FinanzasHome from './Finanzas.jsx';
import FinanzasIngresos from './FinanzasIngresos.jsx';
import FinanzasEgresos from './FinanzasEgresos.jsx';
import FinanzasEgresosFijos from './FinanzasEgresosFijos.jsx';
import FinanzasEgresosVariables from './FinanzasEgresosVariables.jsx';
import FinanzasEgresosPresupuesto from './FinanzasEgresosPresupuesto.jsx';
import FinanzasPagosAsesores from './FinanzasPagosAsesores.jsx';
import ChatAdmin from './ChatAdmin.jsx';


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
        {/* Perfil individual de estudiante (completo) */}
        <Route path="/student/:folio" element={<StudentProfilePage />} />
        {/* Perfil simplificado de diagnóstico */}
        {/* Vista de pagos del estudiante para administradores */}
        <Route path="/student/:folio/pagos" element={<StudentPaymentsPage />} />

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
        {/* Administración de asesores */}
        <Route path="/asesores" element={<AdministrarAsesores />} />
        {/* Chat de soporte */}
        <Route path="/chat" element={<ChatAdmin />} />
        {/* Finanzas */}
        <Route path="/finanzas" element={<FinanzasHome />} />
        <Route path="/finanzas/ingresos" element={<FinanzasIngresos />} />
        <Route path="/finanzas/egresos" element={<FinanzasEgresos />} />
        <Route path="/finanzas/egresos/fijos" element={<FinanzasEgresosFijos />} />
        <Route path="/finanzas/egresos/variables" element={<FinanzasEgresosVariables />} />
        <Route path="/finanzas/egresos/presupuesto" element={<FinanzasEgresosPresupuesto />} />
        <Route path="/finanzas/pagos-asesores" element={<FinanzasPagosAsesores />} />
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