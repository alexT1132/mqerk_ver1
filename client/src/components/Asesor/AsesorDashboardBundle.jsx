// AsesorDashboardBundle.jsx
// Agrupa todas las rutas y layout del panel de Asesor con el nuevo set de componentes
import { Routes, Route, Navigate, useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useState, useEffect } from 'react';

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
import ChatAsesor from './ChatAsesor.jsx';
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
import Reportes from './Reportes.jsx';
import Quiz from './Quiz.jsx';
import QuiztNew from './simGen/QuiztNew.jsx';
import QuiztBuilder from './simGen/QuiztBuilder.jsx';
import ActividadesQuizzesPage from './Quizt&Act.jsx';
import TablaActividades from './TablaActividades.jsx';
import EntregasActividad from './EntregasActividad.jsx';

// Opcionales / adicionales (por si se usan en navegación interna)
import Grupos from './Grupos.jsx';
import ListaAlumnos from './ListaAlumnos.jsx';
import PerfilEstudiante from './PerfilEstudiante.jsx';
import DocumentacionAsesor from './DocumentacionAsesor.jsx';
import RegistroAsistencia from './RegistroAsistencia.jsx';
// Páginas completas para Feedback dentro del bundle
import FeedbackListPage from '../../pages/Asesor/Feedback.jsx';
import FeedbackDetailPage from '../../pages/Asesor/FeedbackDetail.jsx';

// Adaptador del sidebar móvil al contrato del Layout
function SideBarSmWrapper({ isMenuOpen, closeMenu, counts }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isFeedback = location.pathname.startsWith('/asesor/feedback');
  const handleLogout = async () => { await logout(); navigate('/login', { replace: true }); };
  return <MobileSidebar open={isMenuOpen} onClose={closeMenu} onLogout={handleLogout} active={isFeedback ? 'feedback' : undefined} counts={counts} />;
}

function AsesorLayout({ children }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = async () => { await logout(); navigate('/login', { replace: true }); };
  const location = useLocation();
  const isFeedback = location.pathname.startsWith('/asesor/feedback');

  // Verificar si estamos en la página de selección de curso (inicio)
  const isInicioPage = location.pathname === '/asesor/inicio' || location.pathname === '/asesor/inicio/';

  // Estado reactivo para verificar si hay un curso seleccionado
  const [cursoSeleccionado, setCursoSeleccionado] = useState(() => {
    try {
      return localStorage.getItem("cursoSeleccionado");
    } catch {
      return null;
    }
  });

  // Actualizar estado cuando cambia el localStorage o la ruta
  useEffect(() => {
    // Verificar el state de la navegación (si viene desde un click en curso)
    if (location.state?.curso) {
      setCursoSeleccionado(location.state.curso);
      return;
    }

    // Verificar localStorage al cambiar de ruta
    try {
      const current = localStorage.getItem("cursoSeleccionado");
      if (current !== cursoSeleccionado) {
        setCursoSeleccionado(current);
      }
    } catch { }
  }, [location.pathname, location.state?.curso]);

  // Solo mostrar sidebar si NO estamos en la página de inicio Y hay un curso seleccionado
  const mostrarSidebar = !isInicioPage && cursoSeleccionado;

  // Estado para contadores de badge (ej. mensajes no leídos)
  const [counts, setCounts] = useState({ chat: 0 });

  useEffect(() => {
    let interval;
    const fetchCounts = async () => {
      try {
        const { default: axios } = await import('../../api/axios.js');
        const res = await axios.get('/chat/unread/count');
        // Nuevo formato: { data: { total: N, by_student: {...} } }
        setCounts(prev => ({ ...prev, chat: res.data?.data?.total || 0 }));
      } catch (e) {
        // Silent error
      }
    };

    fetchCounts();
    interval = setInterval(fetchCounts, 15000); // Polling cada 15s

    // Listener para actualizar si se envía/recibe mensaje (optimización)
    const handleUpdate = () => fetchCounts();
    window.addEventListener('advisor-chat-update', handleUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener('advisor-chat-update', handleUpdate);
    };
  }, []);

  return (
    <Layout
      HeaderComponent={Topbar}
      SideBarDesktopComponent={mostrarSidebar ? (props) => <SidebarIconOnly {...props} onLogout={handleLogout} active={isFeedback ? 'feedback' : undefined} counts={counts} /> : undefined}
      SideBarSmComponent={mostrarSidebar ? (props) => <SideBarSmWrapper {...props} counts={counts} /> : undefined}
      backgroundClassName="bg-transparent"
      contentClassName="!px-0 !pb-0"
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
        {/* Redirección por defecto dentro de /asesor - siempre a inicio para seleccionar curso */}
        <Route path="/" element={<Navigate to="inicio" replace />} />

        {/* Inicio y tablero maestro */}
        <Route path="inicio" element={<AsesorMaestro />} />
        <Route path="dashboard" element={<CursoBienvenida />} />

        {/* Perfil y cursos */}
        <Route path="perfil" element={<PerfilAsesor />} />
        <Route path="cursos" element={<Cursos />} />

        {/* Áreas funcionales */}
        <Route path="asesorias" element={<Asesorias />} />
        <Route path="chat" element={<ChatAsesor />} />
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
        <Route path="reportes" element={<Reportes />} />
        <Route path="configuraciones" element={<Configuraciones />} />

        {/* Documentación */}
        <Route path="documentacion" element={<DocumentacionAsesor />} />

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
        <Route path="registro-asistencia" element={<RegistroAsistencia />} />
        <Route path="estudiante/:id" element={<PerfilEstudiante />} />

        {/* Rutas de compatibilidad / redirecciones */}
        {/* Fallback absoluto para evitar concatenaciones relativas - redirigir a inicio para seleccionar curso */}
        <Route path="*" element={<Navigate to="/asesor/inicio" replace />} />
      </Routes>
    </AsesorLayout>
  );
}
