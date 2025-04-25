import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Index from "./pages/Index.jsx";
import Login from "./pages/Login.jsx";
import Asesor from "./pages/Asesor.jsx";
import WelcomeAsesor from "./pages/Asesor/Bienvenida.jsx";
import TestAsesor from "./pages/Asesor/Tests.jsx";
import { DashboardAsesor } from './pages/Asesor/Dashboard.jsx';

import { DatosAcademicos, DatosPersonales, DatosProfesionales, TarjetaPerfil, CardDescripcion } from './components/DashboardComp.jsx';

import RegistroEstudiante from './pages/Alumnos/RegistroEstudiante.jsx'


//Componentes
import Componente from './components/NavBar.jsx';
import Componente2 from './components/EstudianteRegistroCard.jsx'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />

        {/*Inicio Asesores */}
        <Route path="/asesor" element={<Asesor />} />
        <Route path="/bienvenido" element={<WelcomeAsesor />} />
        <Route path="/test" element={<TestAsesor />} />
        {/* Final Asesores */}

        {/* Inicio Estudiantes */}
        <Route path='/RegEst' element={<RegistroEstudiante/>}/>



        {/* Test de componente */}
        <Route path='/Componente' element={<Componente/>}/>
        <Route path='/Componente2' element={<Componente2/>}/>
        <Route path='/Dashboard' element={<DashboardAsesor/>}/>
        <Route path='/Pers' element={<TarjetaPerfil/>}/>




      </Routes>
    </BrowserRouter>
  )
}

export default App