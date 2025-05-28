import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Index from './Index.jsx';
import Login from './pages/Login';
import Web from "./Web.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";
import { DashboardAdm, ListaAsesores, ListaColaboradores } from './pages/admin/Panel.jsx';
import { DashboardAsesor } from "./pages/Asesor/Asesor.jsx";
import { PreRegAsesor } from "./pages/Asesor/PreRegAsesor.jsx";
import { Bienvenida } from "./pages/Asesor/Bienvenida.jsx";

import { AuthProvider } from "./context/AuthContext.jsx";

export default function App(){
    return(

      <AuthProvider>
        <BrowserRouter future={{v7_startTransition: true, v7_relativeSplatPath: true}}>
          <Routes>

            {/* Index */}
            <Route path='/' element={<Web />} />
            <Route path='/index' element={<Index />} />
            <Route path='/login' element={<Login />} />

            {/* Asesor registro */}
            <Route path='/pre_registro' element={<PreRegAsesor />} />
            <Route path='/comunicado' element={<Bienvenida />} />

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

)
}