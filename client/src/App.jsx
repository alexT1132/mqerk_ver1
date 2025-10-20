import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
// Componente para forzar el scroll al inicio en cada navegación
import ScrollToTop from './components/ScrollToTop';
import Index from './Index.jsx';
import Login from './pages/Login';
import Web from "./Web.jsx";
import Blog from "./pages/web/Blog.jsx";
import About from "./pages/web/About.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";
import { DashboardAdm, ListaAsesores, ListaColaboradores } from './pages/admin/Panel.jsx';
import Asesor from "./pages/Asesor/Asesor.jsx";
import DashboardAsesor from "./pages/Asesor/Dashboard.jsx";
import AsesorCursos from "./pages/Asesor/Cursos.jsx";
import AsesorConfig from "./pages/Asesor/Configuraciones.jsx";
import FeedbackAsesor from "./pages/Asesor/Feedback.jsx";
import FeedbackDetail from "./pages/Asesor/FeedbackDetail.jsx";
import NuevoSimulador from "./pages/Asesor/SeccionesSimGeneral.jsx";
import FormBuilderEspañol from "./pages/Asesor/FormBuilderEspañol.jsx";
import AsesorGrupos from "./pages/Asesor/Grupos.jsx";
import AsesorAlumnos from "./pages/Asesor/Alumnos.jsx";
import AsesorActSoli from "./pages/Asesor/ActSolicitudes.jsx";
import AsesorModEspTabla from "./pages/Asesor/ActModulEspecificoTabla.jsx";
import AsesorAsesorias from "./pages/Asesor/Asesorias.jsx";
import QuiztPageAsesor from "./pages/Asesor/QuiztAsesor.jsx";
import NewQuiztAsesor from "./pages/Asesor/NewQuiztAsesor.jsx";
// Asesor additional section components
import { PreRegAsesor } from "./pages/Asesor/PreRegAsesor.jsx";
import { Bienvenida } from "./pages/Asesor/Bienvenida.jsx";
import AsesorSimuladores from "./pages/Asesor/Simuladores.jsx";
import AsesorSimulacionesGen from "./pages/Asesor/SimulacionesGenerales.jsx";
import SimulacionesEspecificas from "./pages/Asesor/SimulacionesEspecificas.jsx";
import ModuloSeleccionado from "./pages/Asesor/ModuloSeleccionado.jsx";
import PerfilAsesor from "./pages/Asesor/PerfilAsesor.jsx";
import  Actividades  from "./pages/Asesor/Actividades.jsx";
import ActividadeEspecificosAsesor from "./pages/Asesor/ActividadesEspecificos.jsx";
import PagosAsesor from "./pages/Asesor/Pagos.jsx";
import AgendaAsesor from "./pages/Asesor/AgendaAsesor.jsx";
import QuizActAsesor from "./pages/Asesor/QuiztActSection.jsx";
import TablaActAsesor from "./pages/Asesor/TablaActAsesor.jsx";
import RecursosAsesores from "./pages/Asesor/Recursos.jsx";
// Mantener solo las exportaciones que se usan globalmente fuera del bundle
import { Test as TestAsesor } from "./pages/Asesor/Test.jsx";
import { Resultado as ResultadoAsesor } from "./pages/Asesor/Resultado.jsx";
import GraciasAsesor from "./pages/Asesor/Gracias.jsx";
// Eliminados módulos de tests (Test, Resultado) para flujo simplificado
import { AuthProvider } from "./context/AuthContext.jsx";
import { AsesorProvider } from "./context/AsesorContext.jsx";
import { EstudiantesProvider } from "./context/EstudiantesContext.jsx";
import { FormularioAsesor } from './pages/Asesor/FormRegistro.jsx';
import RegistroEstudiante from "./pages/alumnos/RegistroEstudiante.jsx";
import RegisterAlumno from "./pages/alumnos/Register.jsx";
import Eeau from "./pages/web/preview/Eeau.jsx";
import Eeap from "./pages/web/preview/Eeap.jsx";
import DigiStart from "./pages/web/preview/Digi-Start.jsx";
import Codelab from "./pages/web/preview/Codelab.jsx";
import LevelUp from "./pages/web/preview/English.jsx";
import BusinessEnglish from "./pages/web/preview/BussinesEnglish.jsx";
import Calculo from "./pages/web/preview/CalculoIntegrales.jsx";
import PiensaResuelve from "./pages/web/preview/PiensaResuelve.jsx";
import CienciasExperimentales from "./pages/web/preview/CienciasExperimentales.jsx";
import EstrategiasPsicoeducativas from "./pages/web/preview/EstrategiasPsicoeducativas.jsx";
import EstrategiasEducativas from "./pages/web/preview/EstrategiasPsicoeducativas.jsx";
import TecnologiaAplicada from "./pages/web/preview/TecnologiaenlaEnseñanza.jsx";
import AulaInteligente from "./pages/web/preview/AulaInteligente.jsx";
import { AlumnoDashboardBundle } from './components/student/AlumnoDashboardBundle.jsx'; 
import { StudentProvider } from './context/StudentContext.jsx'; 
import { ComprobanteProvider } from "./context/ComprobantesContext.jsx";
import Talleres from "./components/mqerk/eventos/Talleres.jsx";
import Bootcamps from "./components/mqerk/Bootcamps/Bootcamp.jsx";
import Exporientas from "./components/mqerk/exporientas/Exporienta.jsx";
import Online from "./components/mqerk/online/Online.jsx";
import VeranoTX from "./components/mqerk/Bootcamps/VeranoTX.jsx";
import Ecat from "./components/mqerk/Bootcamps/Ecat.jsx";
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
// import { AsesorDashboardBundle } from './components/asesor/AsesorDashboardBundle.jsx';
import SetupAdmin from './components/admin/SetupAdmin.jsx';
import Terminos from './pages/web/T&C.jsx'
import Politicas from './pages/web/Politicas.jsx'
import AdministradorGeneral from "./pages/AdminGeneral/PanelAdmin.jsx";
import DashboardAdminGeneral from "./pages/AdminGeneral/Dashboard.jsx";
import AdminGenCursos from "./pages/AdminGeneral/cursos/cursos.jsx";
import AsignacionAsesor from "./pages/AdminGeneral/cursos/AsignacionAsesores.jsx";
import ModulosAsesoresAdminGen from "./pages/AdminGeneral/asesores/PageAsesores.jsx";
import InformacionAsesoresAdminGen from "./pages/AdminGeneral/asesores/InfoAsesores.jsx";
import ConfiguracionAdminGen from "./pages/AdminGeneral/Config.jsx";
import ContabilidadAdminGen from "./pages/AdminGeneral/contabilidad/contabilidad.jsx";
import FinancierosAdminGen from "./pages/AdminGeneral/Financieros.jsx";
import AdministrativoAdminGen from "./pages/AdminGeneral/Administrativo.jsx";
import GestionAdminGen from "./pages/AdminGeneral/Gestion.jsx";
import EstrategicosAdminGen from "./pages/AdminGeneral/Estrategicos.jsx";
import CalendarioAdminGen from "./pages/AdminGeneral/Calendario.jsx";
import ProductividadAdminGeneral from "./pages/AdminGeneral/Productividad.jsx";

export default function App(){
    return(

      // Árbol de proveedores de contexto y enrutador principal
      <AsesorProvider>
        <AuthProvider>
          <EstudiantesProvider>
            <ComprobanteProvider>
              <StudentProvider>
                <BrowserRouter future={{v7_startTransition: true, v7_relativeSplatPath: true}}>
                  <ScrollToTop />
                  {/* <ErrorBoundary fallback={<Error500 />}>  */}
                  <Routes>

                    {/*
                      Páginas públicas (sitio web)
                      - Portada, blog, acerca de, páginas de campañas/previas y contenidos online
                    */}
                    <Route path='/' element={<Web />} />
                    <Route path='/index' element={<Index />} />
                    <Route path='/blog' element={<Blog />} />
                    <Route path='/acerca_de' element={<About />} />
                    <Route path='/terminos_y_condiciones' element={<Terminos />} />
                    <Route path='/politicas_de_privacidad' element={<Politicas />} />
                    <Route path='/entrenamiento_examen_admision_universidad' element={<Eeau />} />
                    <Route path='/entrenamiento_examen_admision_preparatoria' element={<Eeap />} />
                    <Route path='/digi-start' element={<DigiStart />} />
                    <Route path='/codelab' element={<Codelab />} />
                    <Route path='/level-up-english' element={<LevelUp />} />
                    <Route path='/business-english-pro' element={<BusinessEnglish />} />
                    <Route path='/calculo-diferencial-e-integral' element={<Calculo />} />
                    <Route path='/piensa-resuelve' element={<PiensaResuelve />} />
                    <Route path='/ciencias-experimentales' element={<CienciasExperimentales />} />
                    <Route path='/estrategias-psicoeducativas' element={<EstrategiasPsicoeducativas />} />
                    <Route path='/estrategias-educativas-para-maestros' element={<EstrategiasEducativas />} />
                    <Route path='/tecnologia-aplicada-en-la-ensenanza' element={<TecnologiaAplicada />} />
                    <Route path='/aula-inteligente' element={<AulaInteligente />} />

                    {/* Catálogo de eventos y modalidades */}
                    <Route path="/talleres" element={<Talleres />} />
                    <Route path="/bootcamps" element={<Bootcamps />} />
                    <Route path="/exporientas" element={<Exporientas />} />
                    <Route path="/online" element={<Online />} />

                    {/* Subrutas de Bootcamps */}
                    <Route path="/bootcamps/veranoTX" element={<VeranoTX />} />
                    <Route path="/bootcamps/ecat" element={<Ecat />} />

                    {/* MQERK Talleres */}
                    <Route path="/talleres/ia_para_la_enseñanza" element={<IaParaLaEnseñanza />} />
                    <Route path="/talleres/ia_en_la_salud" element={<IaEnLaSalud />} />
                    <Route path="/talleres/ia_en_la_gestion_emp" element={<IaEnLaGestionEmp />} />
                    <Route path="/talleres/tecnomate" element={<Tecnomate />} />
                    <Route path="/talleres/orientacion_vocacional_y_psicoeducativa" element={<OrientacionVocacional />} />
                    <Route path="/talleres/orientacion_vocacional" element={<OrientacionVocacionalDos />} />
                    <Route path="/talleres/apoyo_a_la_ciencia_y_la_tecnologia" element={<ApoyoCienciayTecno />} />
                    <Route path="/talleres/transformar_la_educacion" element={<TransformarLaEducacion />} />
                    <Route path="/talleres/educacion_disruptiva" element={<EducacionDisruptiva />} />
                    <Route path="/talleres/tecnologia_artificial" element={<TecnologiaArtificial />} />

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

                      {/* Dashboard Asesores */}
                      <Route path='/asesor' element={<Asesor/>} />
                      <Route path='/asesor/dashboard' element={<DashboardAsesor />} />
                      <Route path='/asesor/simuladores' element={<AsesorSimuladores />} />
                      <Route path='/asesor/simuladores/generales' element={<AsesorSimulacionesGen />} />
                      <Route path='/asesor/simuladores/especificos' element={<SimulacionesEspecificas />} />
                      <Route path='/asesor/simuladores/modulo' element={<ModuloSeleccionado />} />
                      <Route path='/asesor/perfil' element={<PerfilAsesor />} />
                      <Route path='/asesor/cursos' element={<AsesorCursos />} />
                      <Route path='/asesor/configuraciones' element={<AsesorConfig />} />
                      <Route path='/asesor/feedback' element={<FeedbackAsesor />} />
                      <Route path='/asesor/feedback/:studentId' element={<FeedbackDetail />} />
                      <Route path='/asesor/nuevo_simulador' element={<NuevoSimulador />} />
                      <Route path='/asesor/nuevo_simulador/modulo' element={<FormBuilderEspañol />} />
                      <Route path='/asesor/actividades' element={<Actividades />} />
                      <Route path='/asesor/actividades/modulo' element={<QuizActAsesor />} />
                      <Route path='/asesor/actividades/modulo/tabla_actividades' element={<TablaActAsesor />} />
                      <Route path='/asesor/actividades/modulos_especificos' element={<ActividadeEspecificosAsesor />} />
                      <Route path='/asesor/actividades/modulos_especificos/solicitudes' element={<AsesorActSoli />} />
                      <Route path='/asesor/actividades/modulos_especificos/modulo' element={<AsesorModEspTabla />} />
                      <Route path='/asesor/actividades/quiz' element={<QuiztPageAsesor />} />
                      <Route path='/asesor/actividades/nuevo_quizt' element={<NewQuiztAsesor />} />
                      <Route path='/asesor/agenda' element={<AgendaAsesor />} />
                      <Route path='/asesor/mis-pagos' element={<PagosAsesor />} />
                      <Route path='/asesor/grupos' element={<AsesorGrupos />} />
                      <Route path='/asesor/alumnos' element={<AsesorAlumnos />} />
                      <Route path='/asesor/recursos_educativos' element={<RecursosAsesores />} />
                      <Route path='/asesor/asesorias' element={<AsesorAsesorias />} />

                      {/* Fallback redirect if accessed within protected group */}
                      <Route path='/asesor/registro_asesor' element={<Navigate to='/registro_asesor' replace />} />

                      {/* Panel de Alumno (bundle de rutas internas) */}
                      <Route path="/alumno/*" element={<AlumnoDashboardBundle />} />

                      {/* Panel Administrativo moderno (bundle) */}
                      <Route path="/administrativo/*" element={<AdminDashboardBundle />} />

                      {/* Administrador general */}
                      <Route path="/administrador" element={<AdministradorGeneral />} />
                      <Route path="/administrador_dashboard" element={<DashboardAdminGeneral />} />
                      <Route path="/administrador_cursos" element={<AdminGenCursos />} />
                      <Route path="/administrador_asesores" element={<ModulosAsesoresAdminGen />} />
                      <Route path="/administrador_asesores/infotmacion" element={<InformacionAsesoresAdminGen />} />
                      <Route path="/administrador_asesores/asignaciones" element={<AsignacionAsesor />} />
                      <Route path="/administrador_configuraciones" element={<ConfiguracionAdminGen />} />
                      <Route path="/administrador_contabilidad" element={<ContabilidadAdminGen />} />
                      <Route path="/administrador_financieros" element={<FinancierosAdminGen />} />
                      <Route path="/administrador_administrativo" element={<AdministrativoAdminGen />} />
                      <Route path="/administrador_gestion" element={<GestionAdminGen />} />
                      <Route path="/administrador_estrategicos" element={<EstrategicosAdminGen />} />
                      <Route path="/administrador_calendario" element={<CalendarioAdminGen />} />
                      <Route path="/administrador_productividad" element={<ProductividadAdminGeneral />} />
                    </Route>

                    {/* Página 404 por defecto */}
                    {/* <Route path='*' element={<Error404 />} /> */}

                  </Routes>
                  {/* </ErrorBoundary> */}
                </BrowserRouter>
              </StudentProvider>
            </ComprobanteProvider>
          </EstudiantesProvider>
        </AuthProvider>
      </AsesorProvider>

)
}