// BACKEND: Componente Bundle para el Dashboard de Administrador
// Este archivo maneja SOLO las rutas y layout del dashboard admin, no contiene datos
// Cada componente individual es responsable de obtener sus propios datos del backend
import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Layout principal para administrador
import { AdminLayout } from '../layouts/AdminLayout.jsx';

// Componentes de páginas administrativas - SOLO IMPORTACIONES
import { Bienvenida_pago_Admin1 } from './BienvenidaAdmin.jsx';
import { DashboardMetrics } from './inicio-admin.jsx';
import { ComprobanteRecibo } from '../shared/ComprobanteRecibo.jsx';
import { ListaAlumnos_Admin_comp } from './ListaAlumnos_Admin_comp.jsx';
import { ValidacionPagos_Admin_comp } from './ValidacionPagos_Admin_comp.jsx';
import { ReportesPagos_Admin_comp } from './ReportesPagos_Admin_comp.jsx';
import { Calendario_Admin_comp } from './Calendario_Admin_comp.jsx';
import { Email_Admin_comp } from './Email_Admin_comp.jsx';
import { Configuracion_Admin_comp } from './Configuracion_Admin_comp.jsx';

/**
 * BACKEND: Componente Bundle para el Dashboard de Administrador
 * 
 * RESPONSABILIDAD: 
 * - SOLO manejo de rutas y estructura de layout administrativo
 * - NO maneja datos - cada componente individual obtiene sus propios datos del backend
 * - NO contiene lógica de componentes - solo importa y renderiza
 * 
 * ARQUITECTURA:
 * - Utiliza AdminLayout como envoltorio para todas las páginas administrativas
 * - Proporciona estructura de navegación con sidebar administrativo
 * - Todas las rutas están bajo el prefijo /admin1/
 * - Cada componente hijo es responsable de sus propias llamadas API
 * 
 * INTEGRACIÓN BACKEND:
 * Cada componente individual debe tener sus propias llamadas API:
 * - BienvenidaAdmin.jsx: datos del administrador y resumen general
 * - inicio-admin.jsx: métricas principales y estadísticas del dashboard
 * - ComprobanteRecibo.jsx: gestión de comprobantes de pago
 * - ListaAlumnos_Admin_comp.jsx: lista y gestión de estudiantes
 * - ValidacionPagos_Admin_comp.jsx: validación y aprobación de pagos
 * - ReportesPagos_Admin_comp.jsx: reportes financieros y analytics
 * - Calendario_Admin_comp.jsx: calendario académico y eventos
 * - Email_Admin_comp.jsx: sistema de comunicación y mensajería
 * - Configuracion_Admin_comp.jsx: configuración del sistema
 * 
 * RUTAS ADMINISTRATIVAS:
 * /admin1/dashboard - Dashboard principal con bienvenida
 * /admin1/inicio-admin - Métricas y estadísticas generales
 * /admin1/comprobantes-recibo - Gestión de comprobantes de pago
 * /admin1/lista-alumnos - Lista y gestión de estudiantes
 * /admin1/validacion-pagos - Validación de comprobantes de pago
 * /admin1/reportes-pagos - Reportes financieros y estadísticas
 * /admin1/calendario - Calendario académico y eventos
 * /admin1/email - Sistema de comunicación
 * /admin1/configuracion - Configuración del sistema
 */
export function AdminDashboardBundle() {
  return (
    <AdminLayout>
      <Routes>
        {/* Ruta principal del dashboard administrativo */}
        <Route path="/dashboard" element={<DashboardAdmin />} />
        
        {/* Ruta de inicio con métricas */}
        <Route path="/inicio-admin" element={<InicioAdmin />} />
        
        {/* Gestión de comprobantes de pago */}
        <Route path="/comprobantes-recibo" element={<ComprobantesAdmin />} />
        
        {/* Gestión de estudiantes */}
        <Route path="/lista-alumnos" element={<ListaAlumnosAdmin />} />
        
        {/* Validación de pagos */}
        <Route path="/validacion-pagos" element={<ValidacionPagosAdmin />} />
        
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
 * Dashboard principal del administrador - Página de bienvenida
 * Ruta: /admin1/dashboard
 */
function DashboardAdmin() {
  return <Bienvenida_pago_Admin1 />;
}

/**
 * Página de inicio con métricas del dashboard
 * Ruta: /admin1/inicio-admin
 */
function InicioAdmin() {
  return <DashboardMetrics />;
}

/**
 * Panel de gestión de comprobantes de pago
 * Ruta: /admin1/comprobantes-recibo
 */
function ComprobantesAdmin() {
  return <ComprobanteRecibo />;
}

/**
 * Lista y gestión de estudiantes
 * Ruta: /admin1/lista-alumnos
 */
function ListaAlumnosAdmin() {
  return <ListaAlumnos_Admin_comp />;
}

/**
 * Validación de comprobantes de pago
 * Ruta: /admin1/validacion-pagos
 */
function ValidacionPagosAdmin() {
  return <ValidacionPagos_Admin_comp />;
}

/**
 * Reportes financieros y estadísticas
 * Ruta: /admin1/reportes-pagos
 */
function ReportesPagosAdmin() {
  return <ReportesPagos_Admin_comp />;
}

/**
 * Calendario académico y gestión de eventos
 * Ruta: /admin1/calendario
 */
function CalendarioAdmin() {
  return <Calendario_Admin_comp />;
}

/**
 * Sistema de comunicación por email
 * Ruta: /admin1/email
 */
function EmailAdmin() {
  return <Email_Admin_comp />;
}

/**
 * Configuración del sistema
 * Ruta: /admin1/configuracion
 */
function ConfiguracionAdmin() {
  return <Configuracion_Admin_comp />;
}