// src/components/Layout.jsx
import Topbar from "../../components/Asesor/Topbar";
import Maestro from "../../components/Asesor/AsesorMaestro";

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