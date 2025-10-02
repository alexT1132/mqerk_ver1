import { useState } from "react";
import Topbar from "../../components/Asesor/Topbar";
import SidebarIconOnly from "../../components/Asesor/Sidebar";
import MobileSidebar from "../../components/Asesor/MobileSidebar";
import BuilderEspañol from "../../components/Asesor/simGen/EspanolFormBuilder";

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
        <Topbar onOpenMobileMenu={() => setMobileOpen(true)} />
      {/* Drawer móvil */}
      <MobileSidebar
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        active="inicio"
        onLogout={() => console.log("logout")}
      />

      {/* Contenido */}
      <div className="mx-auto">
        <div className="flex">
          <SidebarIconOnly active="inicio" onLogout={() => console.log("logout")} />

          <main className="flex-1 p-3 sm:p-6">
            <BuilderEspañol />
          </main>
        </div>
      </div>
    </div>
  );
}