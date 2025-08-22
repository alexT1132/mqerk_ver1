import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop'; // Ajusta la ruta según tu estructura
import Index from './Index.jsx';
import Login from './pages/Login';
import Web from "./Web.jsx";
import Blog from "./pages/web/Blog.jsx";
import About from "./pages/web/About.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";
import { DashboardAdm, ListaAsesores, ListaColaboradores } from './pages/admin/Panel.jsx';
import { DashboardAsesor } from "./pages/Asesor/Asesor.jsx";
// Asesor additional section components
import { PerfilAsesor, Actividades, Quizt, Simuladores, DashboardCurso, Asesorias } from "./pages/Asesor/Asesor.jsx";
import { PreRegAsesor } from "./pages/Asesor/PreRegAsesor.jsx";
import { Bienvenida } from "./pages/Asesor/Bienvenida.jsx";
// Eliminados módulos de tests (Test, Resultado) para flujo simplificado
import { AuthProvider } from "./context/AuthContext.jsx";
import { AsesorProvider } from "./context/AsesorContext.jsx";
import { EstudiantesProvider } from "./context/EstudiantesContext.jsx";
import { FormularioAsesor } from './pages/Asesor/FormRegistro.jsx';
import RegistroEstudiante from "./pages/alumnos/RegistroEstudiante.jsx";
import RegisterAlumno from "./pages/alumnos/Register.jsx";
import Eeau from "./pages/web/preview/Eeau.jsx";
import Eeap from "./pages/web/preview/Eeap.jsx";
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
import SetupAdmin from './components/admin/SetupAdmin.jsx';
import Terminos from './pages/web/T&C.jsx'
import Politicas from './pages/web/Politicas.jsx'
import AdministradorGeneral from "./pages/AdminGeneral/PanelAdmin.jsx";
import DashboardAdminGeneral from "./pages/AdminGeneral/Dashboard.jsx";

export default function App(){
    return(

      <AsesorProvider>
        <AuthProvider>
          <EstudiantesProvider>
            <ComprobanteProvider>
              <StudentProvider>
                <BrowserRouter future={{v7_startTransition: true, v7_relativeSplatPath: true}}>
                  <ScrollToTop />
                  <Routes>

                    {/* Index */}
                    <Route path='/' element={<Web />} />
                    <Route path='/index' element={<Index />} />
                    <Route path='/blog' element={<Blog />} />
                    <Route path='/acerca_de' element={<About />} />
                    <Route path='/terminos_y_condiciones' element={<Terminos />} />
                    <Route path='/politicas_de_privacidad' element={<Politicas />} />
                    <Route path='/entrenamiento_examen_admision_universidad' element={<Eeau />} />
                    <Route path='/entrenamiento_examen_admision_preparatoria' element={<Eeap />} />

                    {/* MQERK Eventos */}
                    <Route path="/talleres" element={<Talleres />} />
                    <Route path="/bootcamps" element={<Bootcamps />} />
                    <Route path="/exporientas" element={<Exporientas />} />
                    <Route path="/online" element={<Online />} />

                    {/* Bootcamps */}
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

                    {/* MQERK Exporientas */}
                    <Route path="/mqerk/exporientas/feria_profesiografica" element={<Profesiografica />} />
                    <Route path="/mqerk/exporientas/exporienta_educativa" element={<ExporientaEducativa />} />

                    {/* MQERK ONLINE */}
                    <Route path="/mqerk/online/guardianes_disruptivos" element={<GuardianesDisruptivos />} />
                    <Route path="/mqerk/online/eeau23" element={<Eeau23 />} />
                    <Route path="/mqerk/online/todas_y_todos" element={<TodasyTodos />} />
                    <Route path="/mqerk/online/foro" element={<Foro />} />
                    <Route path="/mqerk/online/industria_ciencia" element={<IndustriaCiencia />} />
                    <Route path="/mqerk/online/matematicas_para_un_mundo_mejor" element={<Matematicas />} />
                    <Route path="/mqerk/online/ciencia_en_alimentos_fermentados" element={<Ciencia_en_alimentos />} />
                    <Route path="/mqerk/online/ingles_2021" element={<Ingles2021 />} />

                    {/* Login */}
                    <Route path='/login' element={<Login />} />

                    {/* Configuración inicial (bootstrap) */}
                    <Route path='/setup' element={<SetupAdmin />} />

                    {/* Asesor Registro Simplificado (sin tests) */}
                    <Route path='/pre_registro' element={<PreRegAsesor />} />
                    <Route path='/comunicado' element={<Bienvenida />} />

                    {/* Asesor Registro */}
                    <Route path='/registro_asesor' element={<FormularioAsesor />} />
                    <Route path='/asesor/registro_asesor' element={<Navigate to='/registro_asesor' replace />} />
                    {/* Debug direct access to formulario (omit approval gating) */}
                    <Route path='/debug/registro_asesor' element={<FormularioAsesor debugBypass={true} />} />

                    {/* Registro alumno */}
                    <Route path='/registro_alumno' element={<RegistroEstudiante />} />
                    <Route path='/usuario_alumno' element={<RegisterAlumno />} />

                    <Route element={<ProtectedRoute />}>

                      {/* Inicio administrador */}
                      <Route path='/admin/dashboard' element={<DashboardAdm />} />
                      <Route path='/admin/asesores' element={<ListaAsesores />} />
                      <Route path='/admin/colaboradores' element={<ListaColaboradores />} />

                      {/* Dashboard Asesores */}
                      <Route path='/asesor/dashboard' element={<DashboardAsesor/>} />
                      <Route path='/asesor/perfil' element={<PerfilAsesor />} />
                      <Route path='/asesor/actividades' element={<Actividades />} />
                      <Route path='/asesorias-asesor' element={<Asesorias />} />
                      <Route path='/asesor/quizt' element={<Quizt />} />
                      <Route path='/asesor/simuladores' element={<Simuladores />} />
                      <Route path='/cursos-asesor' element={<DashboardCurso />} />
                      {/* Fallback redirect if accessed within protected group */}
                      <Route path='/asesor/registro_asesor' element={<Navigate to='/registro_asesor' replace />} />

                      {/* Dashboard Alumno */}
                      <Route path="/alumno/*" element={<AlumnoDashboardBundle />} />

                      <Route path="/administrativo/*" element={<AdminDashboardBundle />} />

                      {/* Administrador general */}
                      <Route path="/administrador" element={<AdministradorGeneral />} />
                      <Route path="/administrador_dashboard" element={<DashboardAdminGeneral />} />
                    </Route>

                    {/* 404 Not Found */}
                    <Route path='*' element={<div style={{padding:'4rem', textAlign:'center'}}><h2>404 - Página no encontrada</h2><p>La ruta solicitada no existe.</p></div>} />

                  </Routes>
                </BrowserRouter>
              </StudentProvider>
            </ComprobanteProvider>
          </EstudiantesProvider>
        </AuthProvider>
      </AsesorProvider>

)
}