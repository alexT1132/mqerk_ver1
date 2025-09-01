// src/components/Layout.jsx
import Topbar from "../../components/Asesores/Topbar";
import Maestro from "../../components/Asesores/AsesorMaestro";

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <Topbar onOpenMobileMenu={() => setMobileOpen(true)} />

      {/* Contenido */}
      <div className="mx-auto">
        <Maestro />
      </div>
    </div>
  );
}
