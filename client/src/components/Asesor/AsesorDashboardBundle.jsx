// AsesorDashboardBundle.jsx
// Agrupa todas las rutas y layout del panel de Asesor con el nuevo set de componentes
import { Routes, Route, Navigate, useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

// Layout genérico y wrappers de Asesor
import { Layout } from '../layouts/Layout.jsx';
import Topbar from './Topbar.jsx';
import SidebarIconOnly from './Sidebar.jsx';
import MobileSidebar from './MobileSidebar.jsx';

// Páginas principales del asesor
import AsesorMaestro from './AsesorMaestro.jsx'; // Home con cursos
import CursoBienvenida from './Dashboard.jsx';   // Bienvenida del curso (usa state.curso)
import PerfilAsesor from './PerfilAsesor.jsx';
import Cursos from './Cursos.jsx';
import Asesorias from './Asesorias.jsx';
import AsesorSimuladores from './AsesorSimuladores.jsx';
import SimuladoresGen from './SimuladoresGen.jsx';
import SimuladoresEspecificos from './SimuladoresEspecificos.jsx';
import SimuladoresPorArea from './SimuladoresPorArea.jsx';
import SimuladoresAreaHome from './SimuladoresAreaHome.jsx';
import SimuladorBuilder from './SimuladorBuilder.jsx';
import Actividades from './Actividades.jsx';
import ActEspecificos from './ActEspecificos.jsx';
import Agenda from './Agenda.jsx';
import FeedbackReview from './FeedbackReview.jsx';
import Recursos from './Recursos.jsx';
import Pagos from './Pagos.jsx';
import Configuraciones from './Configuraciones.jsx';
import Quiz from './Quiz.jsx';
import QuiztNew from './simGen/QuiztNew.jsx';
import QuiztBuilder from './simGen/QuiztBuilder.jsx';
import ActividadesQuizzesPage from './Quizt&Act.jsx';
import TablaActividades from './TablaActividades.jsx';
import EntregasActividad from './EntregasActividad.jsx';

// Opcionales / adicionales (por si se usan en navegación interna)
import Grupos from './Grupos.jsx';
import ListaAlumnos from './ListaAlumnos.jsx';
import DocumentacionAsesor from './DocumentacionAsesor.jsx';
// Páginas completas para Feedback dentro del bundle
import FeedbackListPage from '../../pages/Asesor/Feedback.jsx';
import FeedbackDetailPage from '../../pages/Asesor/FeedbackDetail.jsx';

// Adaptador del sidebar móvil al contrato del Layout
function SideBarSmWrapper({ isMenuOpen, closeMenu }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isFeedback = location.pathname.startsWith('/asesor/feedback');
  const handleLogout = async () => { await logout(); navigate('/login', { replace: true }); };
  return <MobileSidebar open={isMenuOpen} onClose={closeMenu} onLogout={handleLogout} active={isFeedback ? 'feedback' : undefined} />;
}

function AsesorLayout({ children }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = async () => { await logout(); navigate('/login', { replace: true }); };
  const location = useLocation();
  const isFeedback = location.pathname.startsWith('/asesor/feedback');
  return (
    <Layout
      HeaderComponent={Topbar}
      SideBarDesktopComponent={(props) => <SidebarIconOnly {...props} onLogout={handleLogout} active={isFeedback ? 'feedback' : undefined} />}
      SideBarSmComponent={SideBarSmWrapper}
      backgroundClassName="bg-black"
      contentClassName="px-0"
    >
      {children}
    </Layout>
  );
}

function FeedbackRedirect() {
  const { studentId } = useParams();
  const to = studentId ? `/asesor_feedback/${studentId}` : '/asesor_feedback';
  return <Navigate to={to} replace />;
}

export function AsesorDashboardBundle() {
  function SimRouteToBuilder() {
    const { simId } = useParams();
    // Evitar capturar rutas como ")/simuladores/modulo" con el comodín :simId
    const isNumeric = /^\d+$/.test(String(simId || ''));
    if (!isNumeric) return <Navigate to="/asesor/simuladores" replace />;
    return <Navigate to={`/asesor/quizt/builder?simId=${simId}`} replace />;
  }
  return (
    <AsesorLayout>
      <Routes>
        {/* Redirección por defecto dentro de /asesor */}
        <Route path="/" element={<Navigate to="dashboard" replace />} />

        {/* Inicio y tablero maestro */}
        <Route path="inicio" element={<AsesorMaestro />} />
        <Route path="dashboard" element={<CursoBienvenida />} />

        {/* Perfil y cursos */}
        <Route path="perfil" element={<PerfilAsesor />} />
        <Route path="cursos" element={<Cursos />} />

  {/* Áreas funcionales */}
    <Route path="asesorias" element={<Asesorias />} />
  <Route path="actividades" element={<Actividades />} />
  {/* Al entrar a un módulo: pantalla con 2 opciones (Actividades y Quizzes) */}
  <Route path="actividades/modulo" element={<ActividadesQuizzesPage />} />
  {/* Selección de módulos específicos para actividades (12 áreas) */}
  <Route path="actividades/modulos_especificos" element={<ActEspecificos />} />
  {/* Tabla de actividades del módulo seleccionado */}
  <Route path="actividades/modulo/tabla_actividades" element={<TablaActividades />} />
  <Route path="actividades/:actividadId/entregas" element={<EntregasActividad />} />
  {/* Acceso a Quizzes desde la pantalla de módulo */}
  <Route path="actividades/quiz" element={<Quiz />} />
  <Route path="agenda" element={<Agenda />} />
  {/* Feedback dentro del bundle para mantener layout y sidebar activo, en modo embebido */}
  <Route path="feedback" element={<FeedbackListPage embedded />} />
  <Route path="feedback/:studentId" element={<FeedbackDetailPage embedded />} />
        <Route path="recursos_educativos" element={<Recursos />} />
        <Route path="mis-pagos" element={<Pagos />} />
        <Route path="configuraciones" element={<Configuraciones />} />

        {/* Correo/documentación (placeholder) */}
        <Route path="correo" element={<DocumentacionAsesor />} />

        {/* Simuladores */}
        <Route path="simuladores" element={<AsesorSimuladores />} />
        <Route path="simuladores/generales" element={<SimuladoresGen />} />
  <Route path="simuladores/especificos" element={<SimuladoresEspecificos />} />
  <Route path="simuladores/area" element={<SimuladoresAreaHome />} />
  <Route path="simuladores/modulo" element={<SimuladoresPorArea />} />
  <Route path="simuladores/:simId" element={<SimRouteToBuilder />} />

        {/* Quizt */}
        <Route path="quizt" element={<Quiz />} />
        <Route path="quizt/nuevo" element={<QuiztNew />} />
        <Route path="quizt/nuevo" element={<QuiztNew />} />
        <Route path="quizt/builder" element={<QuiztBuilder />} />

        {/* Utilidades adicionales */}
        <Route path="grupos" element={<Grupos />} />
        <Route path="lista-alumnos" element={<ListaAlumnos />} />

  {/* Rutas de compatibilidad / redirecciones */}
  {/* Fallback absoluto para evitar concatenaciones relativas */}
  <Route path="*" element={<Navigate to="/asesor/dashboard" replace />} />
      </Routes>
    </AsesorLayout>
  );
}
