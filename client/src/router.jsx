import { createBrowserRouter } from 'react-router-dom'
import React from 'react'

import Index from './App';
import Login from './pages/Login';

import Asesor from './pages/Asesor.jsx';
import Bienvenida from './pages/Asesor/Bienvenida.jsx';
import TestAsesor from './pages/Asesor/Tests.jsx';
import MiPerfilAsesor from './pages/Asesor/Asesor.jsx'

import RegistroEstudiante from './pages/Alumnos/RegistroEstudiante.jsx';

import BtnCursoActivo from './components/InicioComp.jsx';
import Componente2 from './components/EstudianteRegistroCard.jsx';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Index />,
    children: [
    ],
  },

  {
    path: '/login',
    element: <Login/>
  },

// Inicio Asesor
  {
    path: '/asesor',
    element: <Asesor/>
  },

  {
    path: '/bienvenida-asesor',
    element: <Bienvenida/>
  },

  {
    path: '/test-asesor',
    element: <TestAsesor/>
  },

  // Final asesor


  // Inicio estudiantes
  {
    path: '/RegEst',
    element: <RegistroEstudiante/>
  },




  // Test componentes
  {
    path: '/Componente',
    element: <BtnCursoActivo/>
  },

  {
    path: '/Componente2',
    element: <Componente2/>
  },

  {
    path: '/PerfilAsesor',
    element: <MiPerfilAsesor/>
  },

  {
    path: '/pers',
    element: <MiPerfilAsesor/>
  },
])

export default router;