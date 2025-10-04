import { useState } from "react";
import Topbar from "../../components/Asesores/Topbar";
import SidebarIconOnly from "../../components/Asesores/Sidebar";
import MobileSidebar from "../../components/Asesores/MobileSidebar";
import NewQuizt from "../../components/Asesores/simGen/QuiztNew";

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

      {/* Contenido */}
      <div className="mx-auto">
        <div className="flex">
          <SidebarIconOnly active="inicio" onLogout={() => console.log("logout")} />

          <main className="flex-1 p-3 sm:p-6">
            <NewQuizt />
          </main>
        </div>
      </div>
    </div>
  );
}
