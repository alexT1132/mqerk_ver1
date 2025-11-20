import { useState } from "react";
import Topbar from "../../components/Asesor/Topbar";
import SidebarIconOnly from "../../components/Asesor/Sidebar";
import MobileSidebar from "../../components/Asesor/MobileSidebar";

export default function AsesoriasPage() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      <Topbar onOpenMobileMenu={() => setMobileOpen(true)} />
      <MobileSidebar
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        active="asesorias"
        onLogout={() => console.log("logout")}
      />
      {/* Contenido: compensado para topbar y sidebar fijos */}
      <div className="w-full pt-14 md:pl-24">
        <div className="flex">
          <SidebarIconOnly active="asesorias" onLogout={() => console.log("logout")} />
          <main className="flex-1 min-h-[calc(100vh-3.5rem)] p-3 sm:p-6">
            <div className="bg-white rounded-xl shadow p-6">
              <h1 className="text-xl font-semibold">Asesorías</h1>
              <p className="text-slate-600 mt-2">Sección en construcción.</p>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
