import { useState } from "react";
import Topbar from "../../components/Asesor/Topbar";
import SidebarIconOnly from "../../components/Asesor/Sidebar";
import MobileSidebar from "../../components/Asesor/MobileSidebar";
import Simuladores from "../../components/Asesor/AsesorSimuladores";

export default function Layout({ children }) {
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

      {/* Contenido: compensado para topbar y sidebar fijos */}
      <div className="w-full pt-14 md:pl-24">
        <div className="flex">
          <SidebarIconOnly active="inicio" onLogout={() => console.log("logout")} />

          <main className="flex-1 min-h-[calc(100vh-3.5rem)] px-3 sm:px-6 pb-6">
            <div>{children}</div>
            <Simuladores />
          </main>
        </div>
      </div>
    </div>
  );
}
