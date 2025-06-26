import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Index from './Index.jsx';
import Login from './pages/Login';
import Web from "./Web.jsx";
import Blog from "./pages/web/Blog.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";
import { DashboardAdm, ListaAsesores, ListaColaboradores } from './pages/admin/Panel.jsx';
import { DashboardAsesor } from "./pages/Asesor/Asesor.jsx";
import { PreRegAsesor } from "./pages/Asesor/PreRegAsesor.jsx";
import { Bienvenida } from "./pages/Asesor/Bienvenida.jsx";
import { Test } from "./pages/Asesor/Test.jsx";
import { Resultado } from "./pages/Asesor/Resultado.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { AsesorProvider } from "./context/AsesorContext.jsx";
import { FormularioAsesor } from './pages/Asesor/FormRegistro.jsx';
import Eeau from "./pages/web/preview/Eeau.jsx";
import Eeap from "./pages/web/preview/Eeap.jsx";

export default function App(){
    return(

      <AsesorProvider>
        <AuthProvider>
          <BrowserRouter future={{v7_startTransition: true, v7_relativeSplatPath: true}}>
            <Routes>

              {/* Index */}
              <Route path='/' element={<Web />} />
              <Route path='/index' element={<Index />} />
              <Route path='/blog' element={<Blog />} />
              <Route path='/entrenamiento_examen_admision_universidad' element={<Eeau />} />
              <Route path='/entrenamiento_examen_admision_preparatoria' element={<Eeap />} />

              {/* Login */}
              <Route path='/login' element={<Login />} />

              {/* Asesor Tests */}
              <Route path='/pre_registro' element={<PreRegAsesor />} />
              <Route path='/comunicado' element={<Bienvenida />} />
              <Route path='/test' element={<Test />} />
              <Route path='/resultados' element={<Resultado />} />

              {/* Asesor Registro */}
              <Route path='/registro_asesor' element={<FormularioAsesor />} />

              <Route element={<ProtectedRoute />}>

                {/* Inicio administrador */}
                <Route path='/admin/dashboard' element={<DashboardAdm />} />
                <Route path='/admin/asesores' element={<ListaAsesores />} />
                <Route path='/admin/colaboradores' element={<ListaColaboradores />} />


                {/* Dashboard Asesores */}
                <Route path='/asesor/dashboard' element={<DashboardAsesor/>} />

              </Route>

            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </AsesorProvider>

)
}