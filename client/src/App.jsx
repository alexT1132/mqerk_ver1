import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Index from './Index.jsx';
import Login from './pages/Login';

import {PreRegAsesor} from './pages/Asesor/PreRegAsesor.jsx';
import {Bienvenida} from './pages/Asesor/Bienvenida.jsx';
import {Test} from './pages/Asesor/Test.jsx';
import {DashboardAsesor, PerfilAsesor} from './pages/Asesor/Asesor.jsx'

import { DashboardAdm, ListaAsesores, ListaColaboradores } from './pages/Admin/Panel.jsx';

import {RegistroEstudiante} from './pages/Alumnos/RegistroEstudiante.jsx';

import Componente from './components/DashboradComp.jsx';



export default function App(){
    return(

      <BrowserRouter future={{v7_startTransition: true, v7_relativeSplatPath: true}}>
        <Routes>

          {/* Index */}
          <Route path='/' element={<Index/>}></Route>
          <Route path='/login' element={<Login/>}></Route>

          {/* Inicio administrador */}

          <Route path={`/admin/dashboard`} element={<DashboardAdm/>}></Route>

          <Route path={`/admin/lista-asesores`} element={<ListaAsesores/>}></Route>

          <Route path={`/admin/lista-colaboradores`} element={<ListaColaboradores/>}></Route>

          {/* Inicio asesor */}

          <Route path='/asesor/preregistro' element={<PreRegAsesor/>}></Route>

          <Route path='/asesor/bienvenida' element={<Bienvenida/>}></Route>

          <Route path='/asesor/inicio' element={<DashboardAsesor/>}></Route>

          <Route path='/asesor/test' element={<Test/>}></Route>

          <Route path='/asesor/perfil' element={<PerfilAsesor/>}></Route>

          {/* Final asesor */}

          {/* Inicio estudiantes */}

          <Route path='/estudiante/registro' element={<RegistroEstudiante/>}></Route>

          {/* Test de componentes */}          

          <Route path='/Componente' element={<Componente/>}></Route>

          

          


        </Routes>
      </BrowserRouter>

)
}