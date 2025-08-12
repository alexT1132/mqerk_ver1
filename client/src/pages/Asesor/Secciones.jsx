import { useEffect, useState } from "react";
import {
  // Componentes para seccion mi perfil
  DatosPersonales,
  DatosAcademicos,
  DatosProfesionales,
  TarjetaPerfil,
  BtnFuncion,
  Documentacion,
  Lineamientos,
  Contrato,

  // Componentes para el dashboard
  Container,
  // TarjetaPerfil,
  BtnCursoActivo,
  BtnCursoEEAU,
  Analiticas,
} from "../../components/DashboradComp.jsx";

import Persona from "../../assets/Persona.jpg";
import LogoEEAU from "../../assets/IconoEEAU.png";

import {
  BtnDesplegable,
  ActivityModal,
  ModalCursos,
  TablaAsignacionActividades,
  TablaAsignacionQuizt,
  TablaEstudiantes,
  TablaQuizt,
} from "../../components/CursosComp.jsx";

// Este archivo tiene como objetivo armar las secciones, sin incluir
// el topbar y/o el sidebar, la pagina completa se arma en el archivo
// Asesor.jsx

export function Dashboard({
  src,
  TituloAsesor,
  Nombre,
  Ingreso,
  cantidadCursos,
  cantidadEstudiantes,
  cantidadCertificados,
  cantidadGeneraciones,
}) {
  return (
    <div className="flex flex-col w-full items-center md:items-stretch gap-y-20 p-10">
      <div className="flex flex-col xl:flex-row flex-wrap gap-3 sm:flex-nowrap">
        <Container
          SeccionDashboard={"Cursos Activos"}
          ModalCursos={<ModalCursos />}
          Contenido={
            <div
              className={`flex gap-x-2 overflow-x-auto justify-center sm:justify-stretch flex-wrap gap-y-2 sm:flex-nowrap w-full`}
            >
              <BtnCursoActivo />
              <BtnCursoEEAU src={LogoEEAU} />
            </div>
          }
        />
        <TarjetaPerfil
          src={src}
          TituloAsesor={TituloAsesor}
          Nombre={Nombre}
          Ingreso={Ingreso}
          cantidadCursos={cantidadCursos}
          cantidadEstudiantes={cantidadEstudiantes}
          cantidadCertificados={cantidadCertificados}
          cantidadGeneraciones={cantidadGeneraciones}
        />
      </div>

      <Container
        SeccionDashboard={"Analíticas"}
        Contenido={
          <Analiticas
            TituloTabla1={"Rendimiento"}
            TituloTabla2={"Tareas entregadas"}
          />
        }
      />
    </div>
  );
}

export function MiPerfil() {
  return (
    <>
      <div className={`flex flex-wrap justify-center`}>
        <DatosPersonales
          Correo={"darianreyesromero@hotmail.com"}
          Direccion={"18 de marzo entre morelos y aldama"}
          Municipio={"San Juan Bautista Tuxtepec"}
          Numero={"2871324476"}
          Nacimiento={"21/02/2000"}
          Nacionalidad={"Mexico"}
          Genero={"Masculino"}
          EstadoCivil={"Union Libre"}
          RFC={"RERD000121QB7"}
        />
      </div>

      <div className="flex flex-col gap-x-4 lg:flex-row sm:w-full sm:justify-evenly pb-10 sm:pb-8">
        <div className="flex flex-col gap-x-4 gap-y-10 md:flex-row items-center md:items-baseline md:justify-evenly py-8 md:py-10 max-sm:gap-y-10">
          <DatosAcademicos
            NivelEstudios={"Universidad"}
            Titulo={"Ing. Sistemas Computacionales"}
            Institucion={"Instituto Tecnologico de Tuxtepec"}
            Graduacion={"2023"}
            Idiomas={"Español e inglés"}
            Disponibilidad={"Si"}
            Horario={"08:00-17:00"}
            Certificaciones={"Ninguna"}
          />

          <DatosProfesionales
            Experiencia={"No"}
            ExperienciaAsesorias={"no"}
            Funcion={"Administrador"}
            Plataformas={"Google Meet, Google Classroom"}
            Institucion={"MQerqAcademy"}
            Area={"Tecnologias TI"}
            Puesto={"Desarrollador web FrontEnd"}
          />
        </div>

        <aside className="flex flex-col items-center lg:items-end gap-y-2 md:gap-y-7">
          <TarjetaPerfil
            src={Persona}
            Ingreso={"2023"}
            cantidadCursos={"3"}
            cantidadCertificados={"3"}
            cantidadEstudiantes={"40"}
            cantidadGeneraciones={"2"}
          />

          <BtnFuncion funcion="Editar perfil" />
        </aside>
      </div>

      <div className="flex flex-col gap-4">
        <Documentacion />

        <Lineamientos />

        <Contrato />
      </div>
    </>
  );
}

export function MisCursos() {
  const handleOpenModal = () => {
    if (selected === "Actividades") {
      setIsModalOpen(true);
    } else if (selected === "Quizt") {
      alert(
        "Solo puedes crear actividades cuando 'Actividades' está seleccionado."
      );
    } else {
      alert("Selecciona una opción válida.");
    }
  };

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [selected, setSelected] = useState("");

  return (
    <div className="flex flex-col justify-center items-center gap-y-15">
      <div
        className={`flex items-center justify-center gap-x-2 sm:justify-normal w-full`}
      >
        <BtnDesplegable selected={selected} setSelected={setSelected} />
        <ModalCursos onClick={handleOpenModal} />

        <ActivityModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </div>
      {selected === "Actividades" && (
        <div className="flex flex-col w-full gap-8 px-5 md:px-3">
          <TablaAsignacionActividades /> <TablaEstudiantes />
        </div>
      )}

      {selected === "Quizt" && (
        <div className="flex flex-col w-full gap-8 px-5 md:px-3">
          <TablaQuizt />
          <TablaAsignacionQuizt />
        </div>
      )}
    </div>
  );
}

export const ActividadesAsesor = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTable, setActiveTable] = useState("asignacion"); // "asignacion" o "estudiantes"

  return (
    <div className="w-full px-20 gap-y-3 flex flex-col">
      <div className="flex gap-x-1 items-center">
        <h2 className="bg-linear-to-r from-pink-500 to-violet-500 bg-clip-text w-fit text-transparent text-xl font-bold uppercase text-start">
          Actividades
        </h2>
        <ModalCursos onClick={() => setIsModalOpen(true)} />
        <ActivityModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </div>

      {/* Botones para alternar tablas */}
      <div className="flex gap-x-2 justify-center mb-6">
        <button
          onClick={() => setActiveTable("asignacion")}
          className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
            activeTable === "asignacion"
              ? "bg-purple-600 text-white shadow-lg"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Asignación de Actividades
        </button>
        <button
          onClick={() => setActiveTable("estudiantes")}
          className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
            activeTable === "estudiantes"
              ? "bg-purple-600 text-white shadow-lg"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Tabla de Estudiantes
        </button>
      </div>

      {/* Contenido de las tablas */}
      <div className="flex flex-col justify-center items-center">
        {activeTable === "asignacion" && <TablaAsignacionActividades />}
        {activeTable === "estudiantes" && <TablaEstudiantes />}
      </div>
    </div>
  );
};

export const QuiztAsesor = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTable, setActiveTable] = useState("quizt"); // "quizt" o "asignacion"

  return (
    <div className="w-full px-20 gap-y-3 flex flex-col">
      <div className="flex gap-x-1 items-center">
        <h2 className="bg-linear-to-r from-pink-500 to-violet-500 bg-clip-text w-fit text-transparent text-xl font-bold uppercase text-start">
          Quizt
        </h2>
        <ModalCursos onClick={() => setIsModalOpen(true)} />
        <ActivityModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </div>

      {/* Botones para alternar tablas */}
      <div className="flex gap-x-2 justify-center mb-6">
        <button
          onClick={() => setActiveTable("quizt")}
          className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
            activeTable === "quizt"
              ? "bg-purple-600 text-white shadow-lg"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Tabla de Quizt
        </button>
        <button
          onClick={() => setActiveTable("asignacion")}
          className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
            activeTable === "asignacion"
              ? "bg-purple-600 text-white shadow-lg"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Asignación de Quizt
        </button>
      </div>

      {/* Contenido de las tablas */}
      <div className="flex flex-col justify-center items-center">
        {activeTable === "quizt" && <TablaQuizt />}
        {activeTable === "asignacion" && <TablaAsignacionQuizt />}
      </div>
    </div>
  );
};

export const CrearQuiztAsesor = () => {
  return (
    <div className="w-full px-20 gap-y-3 flex flex-col">



    </div>
  );
};

export const SimuladoresAsesor = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTable, setActiveTable] = useState("asignacion"); // "asignacion" o "estudiantes"

  return (
    <div className="w-full px-20 gap-y-3 flex flex-col">
      <div className="flex gap-x-1 items-center">
        <h2 className="bg-linear-to-r from-pink-500 to-violet-500 bg-clip-text w-fit text-transparent text-xl font-bold uppercase text-start">
          Simuladores
        </h2>
        <ModalCursos onClick={() => setIsModalOpen(true)} />
        <ActivityModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </div>

      {/* Botones para alternar tablas */}
      <div className="flex gap-x-2 justify-center mb-6">
        <button
          onClick={() => setActiveTable("asignacion")}
          className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
            activeTable === "asignacion"
              ? "bg-purple-600 text-white shadow-lg"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Asignación de Simuladores
        </button>
        <button
          onClick={() => setActiveTable("estudiantes")}
          className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
            activeTable === "estudiantes"
              ? "bg-purple-600 text-white shadow-lg"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Tabla de Estudiantes
        </button>
      </div>

      {/* Contenido de las tablas */}
      <div className="flex flex-col justify-center items-center">
        {activeTable === "asignacion" && <TablaAsignacionQuizt />}
        {activeTable === "estudiantes" && <TablaEstudiantes />}
      </div>
    </div>
  );
};
