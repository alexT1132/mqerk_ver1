import { useState } from "react";
import TopbarDash from "../../components/AdminGeneral/TopbarDash";
import { SidebarRail, SidebarDrawer } from "../../components/AdminGeneral/SidebarAdmin";
import FloatingSidebarButton from "../../components/AdminGeneral/FloatingSidebarButton";
import Estrategicos from "../../components/AdminGeneral/Estrategicos";

function Dashboard() {
  const [openSidebar, setOpenSidebar] = useState(false);

  return (
    // App de pantalla completa
    <div className="fixed inset-0 flex">
      {/* Rail desktop */}
      <SidebarRail />

      {/* Columna principal */}
      <div className="flex min-w-0 grow flex-col">
        {/* Topbar (quiere ir arriba; si lo quieres pegajoso añade sticky) */}
        <div className="shrink-0 sticky top-0 z-40 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60">
          <TopbarDash title="Asesores Especializados en la Enseñanza de las Ciencias y Tecnología" />
        </div>

        {/* CONTENIDO SCROLLABLE */}
        <main className="grow overflow-y-auto overflow-x-hidden">
          <div className="mx-auto w-full px-4 sm:px-6 lg:px-20 py-6
                          pb-[calc(96px+env(safe-area-inset-bottom))]">
            <Estrategicos />
          </div>
        </main>
      </div>

      {/* Drawer móvil */}
      <SidebarDrawer open={openSidebar} onClose={() => setOpenSidebar(false)} />

      {/* FAB móvil */}
      <FloatingSidebarButton
        open={openSidebar}
        onToggle={() => setOpenSidebar(v => !v)}
      />
    </div>
  );
}

export default Dashboard;
