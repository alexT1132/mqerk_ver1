import { useState } from "react";
import TopbarDash from "../../components/AdminGeneral/TopbarDash";
import { SidebarRail, SidebarDrawer } from "../../components/AdminGeneral/SidebarAdmin";
import FloatingSidebarButton  from "../../components/AdminGeneral/FloatingSidebarButton";

function Dashboard() {

    const [openSidebar, setOpenSidebar] = useState(false);

  return (
    <div>
        <TopbarDash
            title="Asesores Especializados en la Enseñanza de las Ciencias y Tecnología"
        />
        <div className="flex flex-1">
            <SidebarRail />

            {/* Drawer móvil */}
            <SidebarDrawer open={openSidebar} onClose={() => setOpenSidebar(false)} />

            {/* FAB flotante solo móvil */}
            <FloatingSidebarButton
                open={openSidebar}
                onToggle={() => setOpenSidebar((v) => !v)}
            />
        </div>
    </div>
  )
}

export default Dashboard