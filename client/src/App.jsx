import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Index from "./pages/Index.jsx";
import Login from "./pages/Login.jsx";
import Asesor from "./pages/Asesor.jsx";
import WelcomeAsesor from "./pages/Asesor/Bienvenida.jsx";
import TestAsesor from "./pages/Asesor/Tests.jsx";
import Componente from './components/NavBar.jsx';

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
        {/* Final Asesore */}



        {/* Test de componente */}
        <Route path='/Componente' element={<Componente/>}/>



      </Routes>
    </BrowserRouter>
  )
}

export default App