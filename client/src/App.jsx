import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'; // Importamos Navigate

import Index from './Index.jsx';
import Login from './pages/auth/Login.jsx';

// Importaciones de Asesor - REMOVIDAS (no se usan)
// Importaciones de administrador VIEJAS - REMOVIDAS (se usa AdminDashboardBundle)

// ✅ IMPORTACIÓN DEL BUNDLE DEL DASHBOARD DE ADMINISTRADOR
import { AdminDashboardBundle } from './components/admin/AdminDashboardBundle.jsx';

import { Error404 } from './pages/Error/ErrorPages.jsx';

// ✅ IMPORTACIÓN DEL BUNDLE DEL DASHBOARD DE ALUMNOS
import { AlumnoDashboardBundle } from './components/student/AlumnoDashboardBundle.jsx'; 


export default function App(){
    return(
      <BrowserRouter future={{v7_startTransition: true, v7_relativeSplatPath: true}}>
        <Routes>

          {/* Ruta principal - Ahora muestra el Dashboard de Alumno directamente */}
          <Route path='/' element={<Navigate to="/alumno/dashboard" replace />} /> {/* Redirige automáticamente */}
          
          <Route path='/login' element={<Login/>}></Route>

          {/* RUTAS VIEJAS DE ADMIN REMOVIDAS - Se usa AdminDashboardBundle en /admin1/* */}
          
          {/* ✅ RUTA DEL BUNDLE DEL DASHBOARD DE ADMINISTRADOR */}
          {/* Esta ruta manejará todas las sub-rutas dentro de /admin1/ */}
          <Route path="/admin1/*" element={<AdminDashboardBundle />} />

          {/* RUTAS DE ASESOR REMOVIDAS - No se usan */}

          {/* Rutas de Estudiantes - REGISTRO REMOVIDO - no se usa por ahora */}

          {/* ✅ RUTA DEL BUNDLE DEL DASHBOARD DE ALUMNOS */}
          {/* Esta ruta manejará todas las sub-rutas dentro de /alumno/ */}
          <Route path="/alumno/*" element={<AlumnoDashboardBundle />} />

          {/* Ruta 404 para páginas no encontradas */}
          <Route path='*' element={<Error404/>}></Route>

        </Routes>
      </BrowserRouter>
    )
}
