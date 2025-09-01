import { useState } from "react";
import TopbarDash from "../../components/AdminGeneral/TopbarDash";
import { SidebarRail, SidebarDrawer } from "../../components/AdminGeneral/SidebarAdmin";
import FloatingSidebarButton  from "../../components/AdminGeneral/FloatingSidebarButton";
import Subtopbar from "../../components/AdminGeneral/SubTopbar";
import DetalleSeleccion from "./cursos/DetalleSeleccion";
import Graficas1 from "../../components/AdminGeneral/Graficas1";
import {
  MiniCard,
  MiniCardWithChips,
  IconMoney,
  IconApps,
  IconShield,
  IconLayers,
  IconUser,
} from "../../components/AdminGeneral/Sections";

function Dashboard() {

    const [openSidebar, setOpenSidebar] = useState(false);
    const [seleccion, setSeleccion] = useState(null);

    const handleSelect = (data) => {
        setSeleccion(data);
    };

  return (
    <div>
        <TopbarDash
            title="Asesores Especializados en la Enseñanza de las Ciencias y Tecnología"
        />
        <Subtopbar />
        <section className="mx-auto px-20 py-4">
            {/* Grid responsive 1→2→3→4 */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                <MiniCardWithChips
                icon={<IconMoney className="h-4 w-4" />}
                title="Finanzas"
                titleColor="violet"
                subtitle="Semáforo: saludable"
                href="#"
                onSelect={handleSelect}
                />

                <MiniCard
                icon={<IconApps className="h-4 w-4" />}
                title="Contabilidad"
                titleColor="green"
                href="#"
                onSelect={handleSelect}
                />

                <MiniCard
                icon={<IconShield className="h-4 w-4" />}
                title="Administrativo"
                titleColor="violet"
                href="#"
                onSelect={handleSelect}
                />

                <MiniCard
                icon={<IconLayers className="h-4 w-4" />}
                title="Gestión"
                titleColor="blue"
                href="#"
                onSelect={handleSelect}
                />

                <MiniCard
                icon={<IconUser className="h-4 w-4" />}
                title="Estrategica"
                titleColor="pink"
                href="#"
                onSelect={handleSelect}
                />

                <MiniCard
                icon={<IconUser className="h-4 w-4" />}
                title="Perfil Asesor"
                titleColor="blue"
                href="#"
                onSelect={handleSelect}
                />
            </div>
        </section>
        <div className="flex justify-center items-center gap-4 py-6">
            {/* Positivo · Sobrante */}
            <span className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-medium text-emerald-700">
                Positivo · Sobrante
            </span>

            {/* Equilibrio */}
            <span className="rounded-full bg-amber-100 px-4 py-2 text-sm font-medium text-amber-700">
                Equilibrio
            </span>

            {/* Negativo · Pérdida */}
            <span className="rounded-full bg-rose-100 px-4 py-2 text-sm font-medium text-rose-700">
                Negativo · Pérdida
            </span>
        </div>
        <Graficas1 />
        <DetalleSeleccion data={seleccion} />
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