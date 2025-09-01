import { useState } from "react";
import TopbarDash from "../../../components/AdminGeneral/TopbarDash";
import { SidebarRail, SidebarDrawer } from "../../../components/AdminGeneral/SidebarAdmin";
import FloatingSidebarButton  from "../../../components/AdminGeneral/FloatingSidebarButton";
import CreateButton from "./Btn";
import CursosTable from "./TablaCursos";
import CourseWizardModal from "./CourseWizardModal";

function Dashboard() {

    const [openSidebar, setOpenSidebar] = useState(false);
    const [open, setOpen] = useState(false);

    const cursos = [
        { id: 1, nombre: "DIGI-START", subtitulo: "desbloquea tu potencial tecnológico", modalidad: "PRESENCIAL", turno: "VESPERTINO", horario: "4PM-6PM", grupos: "MG1, MG2" },
        { id: 2, nombre: "TECH-START", subtitulo: "inicia tu viaje digital", modalidad: "ONLINE", turno: "MATUTINO", horario: "10AM-12PM", grupos: "MG1" },
        { id: 3, nombre: "CODE-BOOST", subtitulo: "acelera tu creatividad digital", modalidad: "PRESENCIAL", turno: "NOCTURNO", horario: "6PM-8PM", grupos: "MG2" },
        { id: 4, nombre: "INNO-MASTERY", subtitulo: "domina la innovación tecnológica", modalidad: "PRESENCIAL", turno: "MATUTINO", horario: "8AM-10AM", grupos: "MG1" },
        { id: 5, nombre: "INNO-MASTERY", subtitulo: "domina la innovación tecnológica", modalidad: "PRESENCIAL", turno: "MATUTINO", horario: "8AM-10AM", grupos: "MG1" },
        { id: 6, nombre: "INNO-MASTERY", subtitulo: "domina la innovación tecnológica", modalidad: "PRESENCIAL", turno: "MATUTINO", horario: "8AM-10AM", grupos: "MG1" },
        { id: 7, nombre: "INNO-MASTERY", subtitulo: "domina la innovación tecnológica", modalidad: "PRESENCIAL", turno: "MATUTINO", horario: "8AM-10AM", grupos: "MG1" },
    ];

    const handleSubmit = async (values) => {
    // Aquí harías el POST a tu backend
    console.log("Crear curso ->", values);
    setOpen(false);
  };

    const onEdit = (c) => console.log("editar", c);
    const onDelete = (c) => console.log("eliminar", c);
    const onView = (c) => console.log("ver", c);

  return (
    <div>
        <TopbarDash
            title="Asesores Especializados en la Enseñanza de las Ciencias y Tecnología"
        />
        <CreateButton className="fixed top-25 md:left-25 sm:left-8 z-[20] drop-shadow-lg" onClick={() => setOpen(true)} />
        <CourseWizardModal open={open} onClose={() => setOpen(false)} onSubmit={handleSubmit} />
        <div className="fixed top-45 inset-x-0 sm:left-10 z-[20]">
            <div className="mx-auto w-[90%] max-h-[35vh] overflow-y-auto overflow-x-auto rounded-xl">
                <CursosTable data={cursos} onEdit={onEdit} onDelete={onDelete} onView={onView} />
            </div>
        </div>
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