import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Index from './App';
import Login from './pages/Login';

import {PreRegAsesor} from './pages/Asesor/PreRegAsesor.jsx';
import {Bienvenida} from './pages/Asesor/Bienvenida.jsx';
import {Test} from './pages/Asesor/Test.jsx';
import {DashboardAsesor, PerfilAsesor} from './pages/Asesor/Asesor.jsx'

import { DashboardAdm, ListaAsesores, ListaColaboradores } from './pages/Admin/Panel.jsx';

import {RegistroEstudiante} from './pages/Alumnos/RegistroEstudiante.jsx';

import Componente from './components/DashboradComp.jsx';



ReactDOM.createRoot(document.getElementById('root')).render(

  <React.StrictMode>
      <BrowserRouter>
        <Routes>

          {/* Index */}
          <Route path='/' element={<Index/>}></Route>
          <Route path='/login' element={<Login/>}></Route>

          {/* Inicio administrador */}

          <Route path={`/admin/dashboard`} element={<DashboardAdm/>}></Route>

          <Route path={`/admin/lista-asesores`} element={<ListaAsesores/>}></Route>

          <Route path={`/admin/lista-colaboradores`} element={<ListaColaboradores/>}/>

          {/* Inicio asesor */}

          <Route path='/RegistroAsesor' element={<PreRegAsesor/>}></Route>

          <Route path='/bienvenida-asesor' element={<Bienvenida/>}></Route>

          <Route path='/test-asesor' element={<Test/>}></Route>

          {/* Final asesor */}

          {/* Inicio estudiantes */}

          <Route path='/RegEst' element={<RegistroEstudiante/>}></Route>

          {/* Test de componentes */}

          <Route path='/Componente' element={<Componente/>}></Route>

          <Route path='/Asesor' element={<DashboardAsesor/>}></Route>

          <Route path='/Componente' element={<Componente/>}></Route>

          <Route path='/PerfilAsesor' element={<PerfilAsesor/>}></Route>

          


        </Routes>
      </BrowserRouter>
  </React.StrictMode>

)