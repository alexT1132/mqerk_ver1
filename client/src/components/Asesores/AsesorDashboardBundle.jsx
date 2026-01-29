import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Importar páginas del asesor
import DashboardAsesor from '../../pages/Asesor/Dashboard.jsx';
import PerfilAsesor from '../../pages/Asesor/PerfilAsesor.jsx';
import Actividades from '../../pages/Asesor/Actividades.jsx';
import Quizt from '../../pages/Asesor/Quizt.jsx';
import Asesorias from '../../pages/Asesor/Asesorias.jsx';
import Simuladores from '../../pages/Asesor/Simuladores.jsx';
import SimulacionesGenerales from '../../pages/Asesor/SimulacionesGenerales.jsx';
import SimulacionesEspecificas from '../../pages/Asesor/SimulacionesEspecificas.jsx';
import ModuloSeleccionado from '../../pages/Asesor/ModuloSeleccionado.jsx';
import Feedback from '../../pages/Asesor/Feedback.jsx';
import FeedbackDetail from '../../pages/Asesor/FeedbackDetail.jsx';
import { Bienvenida } from '../../pages/Asesor/Bienvenida.jsx';

/**
 * Contenedor de rutas del dashboard del asesor.
 * Monta las rutas internas en /asesor/*
 */
export function AsesorDashboardBundle() {
  return (
    <Routes>
        <Route path="/" element={<DashboardAsesor />} />
        <Route path="/dashboard" element={<DashboardAsesor />} />
        <Route path="/perfil" element={<PerfilAsesor />} />
        <Route path="/actividades" element={<Actividades />} />
        <Route path="/quizt" element={<Quizt />} />
        <Route path="/simuladores" element={<Simuladores />} />
  <Route path="/simuladores/generales" element={<SimulacionesGenerales />} />
  <Route path="/simuladores/especificos" element={<SimulacionesEspecificas />} />
  <Route path="/simuladores/modulo" element={<ModuloSeleccionado />} />
        <Route path="/asesorias" element={<Asesorias />} />
        <Route path="/feedback" element={<Feedback />} />
        <Route path="/feedback/:studentId" element={<FeedbackDetail />} />
        <Route path="/bienvenida" element={<Bienvenida />} />
  </Routes>
  );
}
