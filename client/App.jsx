import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'; // Importamos Navigate

import Index from './Index.jsx';
import Login from './pages/Login';

// Importaciones de Asesor
import {PreRegAsesor} from './pages/Asesor/PreRegAsesor.jsx';
import {Bienvenida} from './pages/Asesor/Bienvenida.jsx';
import {Test} from './pages/Asesor/Test.jsx';
import {DashboardAsesor, PerfilAsesor} from './pages/Asesor/Asesor.jsx'
import { ResultadoAsesor } from './pages/Asesor/Resultado.jsx';
import { FormularioAsesor } from './pages/Asesor/FormRegistro.jsx';

// Importaciones de Admin (activadas de nuevo)
import { DashboardAdm, ListaAsesores, ListaColaboradores } from './pages/Admin/Panel.jsx';
import { 
  DashboardAdmin1, 
  InicioAdmin, 
  Panel_pago_admin1, 
  ListaAsesores1, 
  ListaColaboradores1 
} from './pages/Admin/Panel_admin1.jsx';

import {RegistroEstudiante} from './pages/Alumnos/RegistroEstudiante.jsx';



import { Error404 } from './pages/Error/ErrorPages.jsx';

// ✅ IMPORTACIÓN DEL BUNDLE DEL DASHBOARD DE ALUMNOS
import { AlumnoDashboardBundle } from './components/AlumnoDashboardBundle.jsx'; 


export default function App(){
    return(
      <BrowserRouter future={{v7_startTransition: true, v7_relativeSplatPath: true}}>
        <Routes>

          {/* Ruta principal - Ahora muestra el Dashboard de Alumno directamente */}
          <Route path='/' element={<Navigate to="/alumno/dashboard" replace />} /> {/* Redirige automáticamente */}
          
          <Route path='/login' element={<Login/>}></Route>

          {/* Rutas de administrador - Activas de nuevo */}
          <Route path={`/admin/dashboard`} element={<DashboardAdm/>}></Route>
          <Route path={`/admin/lista-asesores`} element={<ListaAsesores/>}></Route>
          <Route path={`/admin/lista-colaboradores`} element={<ListaColaboradores/>}></Route>
          <Route path="/admin1/dashboard" element={<DashboardAdmin1/>}></Route>
          <Route path="/admin1/inicio-admin" element={<InicioAdmin/>}></Route>
          <Route path="/admin1/comprobantes-recibo" element={<Panel_pago_admin1/>}></Route>
          <Route path="/admin1/lista-alumnos" element={<ListaAsesores1/>}></Route>
          <Route path="/admin1/validacion-pagos" element={<ListaColaboradores1/>}></Route>
          <Route path="/admin1/reportes-pagos" element={<ListaAsesores1/>}></Route>
          <Route path="/admin1/calendario" element={<ListaColaboradores1/>}></Route>
          <Route path="/admin1/email" element={<ListaAsesores1/>}></Route>
          <Route path="/admin1/configuracion" element={<ListaColaboradores1/>}></Route>

          {/* Rutas de Asesor */}
          <Route path='/asesor/preregistro' element={<PreRegAsesor/>}></Route>
          <Route path='/asesor/bienvenida' element={<Bienvenida/>}></Route>
          <Route path='/asesor/inicio' element={<DashboardAsesor/>}></Route>
          <Route path='/asesor/test' element={<Test/>}></Route>
          <Route path='/asesor/perfil' element={<PerfilAsesor/>}></Route>
          <Route path='/test/asesor/resultado' element={<ResultadoAsesor/>}/>
          <Route path='/Componente' element={<FormularioAsesor/>}></Route>


          {/* Rutas de Estudiantes - REGISTRO */}
          <Route path='/estudiante/registro' element={<RegistroEstudiante/>}></Route>

          {/* ✅ RUTA DEL BUNDLE DEL DASHBOARD DE ALUMNOS */}
          {/* Esta ruta manejará todas las sub-rutas dentro de /alumno/ */}
          <Route path="/alumno/*" element={<AlumnoDashboardBundle />} />

          {/* Ruta 404 para páginas no encontradas */}
          <Route path='*' element={<Error404/>}></Route>

        </Routes>
      </BrowserRouter>
    )
}
