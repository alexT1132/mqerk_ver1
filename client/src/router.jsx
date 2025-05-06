import { createBrowserRouter } from 'react-router-dom'
import React from 'react'

import Index from './App';
import Login from './pages/Login';

import {PreRegAsesor} from './pages/Asesor/PreRegAsesor.jsx';
import {Bienvenida} from './pages/Asesor/Bienvenida.jsx';
import {Test} from './pages/Asesor/Test.jsx';
import {PerfilAsesor} from './pages/Asesor/Asesor.jsx'

import {RegistroEstudiante} from './pages/Alumnos/RegistroEstudiante.jsx';

import CursosContainer from './components/DashboradComp.jsx';

// import CardEstudiante from './components/EstudianteRegistroCard.jsx';

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
    element: <PreRegAsesor/>
  },

  {
    path: '/bienvenida-asesor',
    element: <Bienvenida/>
  },

  {
    path: '/test-asesor',
    element: <Test/>
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
    element: <CursosContainer/>
  },


  {
    path: '/PerfilAsesor',
    element: <PerfilAsesor/>
  },
])

export default router;