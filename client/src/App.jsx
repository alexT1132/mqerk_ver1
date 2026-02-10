import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
// Componente para forzar el scroll al inicio en cada navegación
import ScrollToTop from './components/common/ScrollToTop';
import Index from './Index.jsx';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword2.jsx';
import ResetPassword from './pages/ResetPassword.jsx';
import Web from "./Web.jsx";
import Cursos from "./components/mqerk/Cursos.jsx"; // <--- 1. IMPORTACIÓN AGREGADA
import Blog from "./pages/web/Blog.jsx";
import About from "./pages/web/About.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";
import { DashboardAdm, ListaAsesores, ListaColaboradores } from './pages/Admin/Panel.jsx';
// Páginas del panel de Asesor ahora están agrupadas en AsesorDashboardBundle
// Mantener solo las exportaciones que se usan globalmente fuera del bundle
import { PreRegAsesor } from "./pages/Asesor/PreRegAsesor.jsx";
import { Test as TestAsesor } from "./pages/Asesor/Test.jsx";
import { Resultado as ResultadoAsesor } from "./pages/Asesor/Resultado.jsx";
import GraciasAsesor from "./pages/Asesor/Gracias.jsx";
import { Bienvenida } from "./pages/Asesor/Bienvenida.jsx";
import Feedback from "./pages/Asesor/Feedback.jsx";
import FeedbackDetail from "./pages/Asesor/FeedbackDetail.jsx";
import DashboardCurso from "./pages/Asesor/Cursos.jsx";
// Contextos de aplicación (autenticación, asesor, estudiantes, comprobantes, alumno)
import { AuthProvider } from "./context/AuthContext.jsx";
import { AsesorProvider } from "./context/AsesorContext.jsx";
import { EstudiantesProvider } from "./context/EstudiantesContext.jsx";
import { FormularioAsesor } from './pages/Asesor/FormRegistro.jsx';
import RegistroEstudiante from "./pages/alumnos/RegistroEstudiante.jsx";
import RegisterAlumno from "./pages/alumnos/Register.jsx";
import Eeau from "./pages/web/preview/Eeau.jsx";
import Eeap from "./pages/web/preview/Eeap.jsx";
import Politicas from "./pages/web/Politicas.jsx";
import Terminos from "./pages/web/T&C.jsx";
import { AlumnoDashboardBundle } from './components/student/AlumnoDashboardBundle.jsx';
import { StudentProvider } from './context/StudentContext.jsx';
import { ComprobanteProvider } from "./context/ComprobantesContext.jsx";
import Talleres from "./components/mqerk/eventos/Talleres.jsx";
import Bootcamps from "./components/mqerk/Bootcamps/Bootcamp.jsx";
import Exporientas from "./components/mqerk/exporientas/Exporienta.jsx";
import Online from "./components/mqerk/online/Online.jsx";
import VeranoTX from "./components/mqerk/Bootcamps/VeranoTX.jsx";
import Ecat from "./components/mqerk/Bootcamps/Ecat.jsx";
import { CursosProvider } from "./context/CursosContext.jsx";
import { PreviewProvider } from "./context/PreviewContext.jsx";
import IaParaLaEnseñanza from "./components/mqerk/eventos/IaParaLaEnseñanza.jsx";
import IaEnLaSalud from "./components/mqerk/eventos/IaEnLaSalud.jsx";
import IaEnLaGestionEmp from "./components/mqerk/eventos/IaEnLaGestionEmp.jsx";
import Tecnomate from "./components/mqerk/eventos/Tecnomate.jsx";
import OrientacionVocacional from "./components/mqerk/eventos/OrientacionVocacional.jsx";
import OrientacionVocacionalDos from "./components/mqerk/eventos/OrientacionVocaionalDos.jsx";
import ApoyoCienciayTecno from "./components/mqerk/eventos/ApoyoCienciaTecnologia.jsx";
import TransformarLaEducacion from "./components/mqerk/eventos/TransformarLaEducacion.jsx";
import EducacionDisruptiva from "./components/mqerk/eventos/EducacionDisruptiva.jsx";
import TecnologiaArtificial from "./components/mqerk/eventos/TecnologiaArtificial.jsx";
import GuardianesDisruptivos from "./components/mqerk/online/GuardianesDisruptivos.jsx";
import Eeau23 from "./components/mqerk/online/EEAU23.jsx";
import TodasyTodos from "./components/mqerk/online/TodasyTodos.jsx";
import Foro from "./components/mqerk/online/Foro.jsx";
import IndustriaCiencia from "./components/mqerk/online/Industria_Ciencia.jsx";
import Matematicas from "./components/mqerk/online/Matematicas.jsx";
import Ciencia_en_alimentos from "./components/mqerk/online/CienciaAlimentos.jsx";
import Ingles2021 from "./components/mqerk/online/Ingles_21.jsx";
import Profesiografica from "./components/mqerk/exporientas/Profesiografica.jsx";
import ExporientaEducativa from "./components/mqerk/exporientas/ExporientaEducativa.jsx";
import { AdminDashboardBundle } from './components/admin/AdminDashboardBundle.jsx';
import { AsesorDashboardBundle } from './components/Asesor/AsesorDashboardBundle.jsx';
import SetupAdmin from './components/admin/SetupAdmin.jsx';
import ErrorBoundary from './components/common/ErrorBoundary.jsx';
import { Error404, Error500 } from './pages/Error/ErrorPages.jsx';
import QuizResultadosPage from './pages/alumnos/QuizResultadosPage.jsx';
import SimulacionResultadosPage from './pages/alumnos/SimulacionResultadosPage.jsx';
import { InactivityHandler } from './components/common/InactivityHandler.jsx';

// temporalmente importamos el componente de conversión de WebP a PNG

import WebPConverter from './components/tools/WebPConverter';

export default function App() {
  return (

    // Árbol de proveedores de contexto y enrutador principal
    <AuthProvider>
      <AsesorProvider>
        <InactivityHandler />
        <EstudiantesProvider>
          <ComprobanteProvider>
            <StudentProvider>
              <CursosProvider>
                <PreviewProvider>
                  <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                    <ScrollToTop />
                    <ErrorBoundary fallback={<Error500 />}>
                      <Routes>

                        {/*
                      Páginas públicas (sitio web)
                      - Portada, blog, acerca de, páginas de campañas/previas y contenidos online
                    */}
                        <Route path='/' element={<Web />} />
                        <Route path='/index' element={<Index />} />
                        <Route path='/blog' element={<Blog />} />
                        <Route path='/acerca_de' element={<About />} />
                        <Route path='/cursos' element={<Cursos fullPage={true} />} />
                        <Route path='/curso/entrenamiento-para-el-examen-de-admision-a-la-universidad' element={<Eeau />} />
                        <Route path='/entrenamiento_examen_admision_preparatoria' element={<Eeap />} />
                        <Route path="/politicas_de_privacidad" element={<Politicas />} />
                        <Route path="/terminos_y_condiciones" element={<Terminos />} />
                        <Route path="/herramientas/convertidor" element={<WebPConverter />} />

                        {/* Catálogo de eventos y modalidades */}
                        <Route path="/talleres" element={<Talleres />} />
                        <Route path="/bootcamps" element={<Bootcamps />} />
                        <Route path="/exporientas" element={<Exporientas />} />
                        <Route path="/online" element={<Online />} />

                        {/* Subrutas de Bootcamps */}
                        <Route path="/bootcamps/veranoTX" element={<VeranoTX />} />
                        <Route path="/bootcamps/ecat" element={<Ecat />} />

                        {/* Subrutas de Talleres */}
                        <Route path="/mqerk/talleres/ia_para_la_enseñanza" element={<IaParaLaEnseñanza />} />
                        <Route path="/mqerk/talleres/ia_en_la_salud" element={<IaEnLaSalud />} />
                        <Route path="/mqerk/talleres/ia_en_la_gestion_emp" element={<IaEnLaGestionEmp />} />
                        <Route path="/mqerk/talleres/tecnomate" element={<Tecnomate />} />
                        <Route path="/mqerk/talleres/orientacion_vocacional_y_psicoeducativa" element={<OrientacionVocacional />} />
                        <Route path="/mqerk/talleres/orientacion_vocacional" element={<OrientacionVocacionalDos />} />
                        <Route path="/mqerk/talleres/apoyo_a_la_ciencia_y_la_tecnologia" element={<ApoyoCienciayTecno />} />
                        <Route path="/mqerk/talleres/transformar_la_educacion" element={<TransformarLaEducacion />} />
                        <Route path="/mqerk/talleres/educacion_disruptiva" element={<EducacionDisruptiva />} />
                        <Route path="/mqerk/talleres/tecnologia_artificial" element={<TecnologiaArtificial />} />

                        {/* Subrutas de Exporientas */}
                        <Route path="/mqerk/exporientas/feria_profesiografica" element={<Profesiografica />} />
                        <Route path="/mqerk/exporientas/exporienta_educativa" element={<ExporientaEducativa />} />

                        {/* Subrutas de contenidos online */}
                        <Route path="/mqerk/online/guardianes_disruptivos" element={<GuardianesDisruptivos />} />
                        <Route path="/mqerk/online/eeau23" element={<Eeau23 />} />
                        <Route path="/mqerk/online/todas_y_todos" element={<TodasyTodos />} />
                        <Route path="/mqerk/online/foro" element={<Foro />} />
                        <Route path="/mqerk/online/industria_ciencia" element={<IndustriaCiencia />} />
                        <Route path="/mqerk/online/matematicas_para_un_mundo_mejor" element={<Matematicas />} />
                        <Route path="/mqerk/online/ciencia_en_alimentos_fermentados" element={<Ciencia_en_alimentos />} />
                        <Route path="/mqerk/online/ingles_2021" element={<Ingles2021 />} />

                        {/* Autenticación */}
                        <Route path='/login' element={<Login />} />
                        <Route path='/recuperar' element={<ForgotPassword />} />
                        <Route path='/resetear' element={<ResetPassword />} />

                        {/* Configuración inicial del administrador (asistente de arranque) */}
                        <Route path='/setup' element={<SetupAdmin />} />

                        {/* Registro simplificado de asesor */}
                        <Route path='/pre_registro' element={<PreRegAsesor />} />
                        <Route path='/comunicado' element={<Bienvenida />} />

                        {/* Flujo de pruebas del asesor */}
                        <Route path='/test' element={<TestAsesor />} />
                        {/* Rutas dinámicas eliminadas: WAIS y Matemática ahora integradas en /test */}
                        <Route path='/resultados' element={<ResultadoAsesor />} />
                        {/* Acceso directo a resultados por ID */}
                        <Route path='/resultados/:id' element={<ResultadoAsesor />} />
                        <Route path='/gracias' element={<GraciasAsesor />} />

                        {/* Registro formal de asesor */}
                        <Route path='/registro_asesor' element={<FormularioAsesor />} />
                        <Route path='/asesor/registro_asesor' element={<Navigate to='/registro_asesor' replace />} />
                        {/* Acceso directo de depuración al formulario (omite validaciones previas) */}
                        <Route path='/debug/registro_asesor' element={<FormularioAsesor debugBypass={true} />} />

                        {/* Registro de alumno */}
                        <Route path='/registro_alumno' element={<RegistroEstudiante />} />
                        <Route path='/usuario_alumno' element={<RegisterAlumno />} />

                        {/* Rutas protegidas (requieren autenticación) */}
                        <Route element={<ProtectedRoute />}>

                          {/* Panel administrativo */}
                          <Route path='/admin/dashboard' element={<DashboardAdm />} />
                          <Route path='/admin/asesores' element={<ListaAsesores />} />
                          <Route path='/admin/colaboradores' element={<ListaColaboradores />} />

                          {/* Panel de Asesor (bundle) */}
                          <Route path="/asesor/*" element={<AsesorDashboardBundle />} />
                          {/* Compatibilidad con rutas antiguas de simuladores y quizt */}
                          <Route path='/asesor_simuladores' element={<Navigate to='/asesor/simuladores' replace />} />
                          <Route path='/asesor_simuladores/generales' element={<Navigate to='/asesor/simuladores/generales' replace />} />
                          <Route path='/asesor_simuladores/especificos' element={<Navigate to='/asesor/simuladores/especificos' replace />} />
                          <Route path='/asesor_simuladores/*' element={<Navigate to='/asesor/simuladores' replace />} />
                          <Route path='/quizt' element={<Navigate to='/asesor/quizt' replace />} />
                          {/* Feedback del asesor */}
                          <Route path='/asesor_feedback' element={<Feedback />} />
                          <Route path='/asesor_feedback/:studentId' element={<FeedbackDetail />} />
                          {/* Compatibilidad con ruta antigua */}
                          <Route path='/feedback-asesor' element={<Navigate to='/asesor_feedback' replace />} />
                          <Route path='/cursos-asesor' element={<DashboardCurso />} />
                          {/* Redirección de respaldo para rutas antiguas dentro de la zona protegida */}
                          <Route path='/asesor/registro_asesor' element={<Navigate to='/registro_asesor' replace />} />

                          {/* Página completa de resultados de quiz (alumno) */}
                          <Route path='/alumno/actividades/quiz/:quizId/resultados' element={<QuizResultadosPage />} />

                          {/* Página completa de resultados de simulación (alumno) */}
                          <Route path='/alumno/simulaciones/tomar/:simId/resultados' element={<SimulacionResultadosPage />} />

                          {/* Panel de Alumno (bundle de rutas internas) */}
                          <Route path="/alumno/*" element={<AlumnoDashboardBundle />} />

                          {/* Panel Administrativo moderno (bundle) */}
                          <Route path="/administrativo/*" element={<AdminDashboardBundle />} />




                        </Route>

                        {/* Página 404 por defecto */}
                        <Route path='*' element={<Error404 />} />

                      </Routes>
                    </ErrorBoundary>
                  </BrowserRouter>
                </PreviewProvider>
              </CursosProvider>
            </StudentProvider>
          </ComprobanteProvider>
        </EstudiantesProvider>
      </AsesorProvider>
    </AuthProvider>

  )
}