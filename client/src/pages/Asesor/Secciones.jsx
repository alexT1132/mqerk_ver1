
//  en este componente es donde se deberia mostrar los datos se asesor, datos personales, academicos, profesionales
// Tambien en esta seccion estan los apartados para que el suba la documentacion
import { useEffect, useState } from "react";
import { getPerfil } from "../../api/asesores.js";
import { useAuth } from "../../context/AuthContext.jsx";
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
} from "../../components/DashboardComp.jsx";
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
  const { user } = useAuth();
  // TODO: decidir origen de preregistroId (ej: user.preregistro_id). Placeholder fijo mientras.
  const preregistroId = user?.preregistro_id || user?.id_preregistro || 1; // ajustar cuando exista en auth
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!preregistroId) return;
    let cancel = false;
    (async () => {
      setLoading(true); setError("");
      try {
        const res = await getPerfil(preregistroId);
        if (cancel) return;
        setPerfil(res.data?.perfil || null);
      } catch (e) {
        if (cancel) return;
        setError(e?.response?.data?.message || 'No se pudo cargar el perfil');
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => { cancel = true; };
  }, [preregistroId]);

  const p = perfil || {};
  return (
    <>
      <div className="w-full max-w-6xl mx-auto mb-6">
        {loading && <div className="p-3 text-sm rounded bg-purple-50 border border-purple-200 text-purple-700">Cargando perfil...</div>}
        {error && <div className="p-3 text-sm rounded bg-red-50 border border-red-200 text-red-600">{error}</div>}
      </div>
      <div className={`flex flex-wrap justify-center`}>
        <DatosPersonales
          Correo={p.correo || user?.correo || '—'}
          Direccion={p.direccion || '—'}
          Municipio={p.municipio || '—'}
          Numero={p.telefono || p.numero || '—'}
          Nacimiento={p.nacimiento ? new Date(p.nacimiento).toLocaleDateString('es-MX') : '—'}
          Nacionalidad={p.nacionalidad || '—'}
          Genero={p.genero || '—'}
          EstadoCivil={p.estado_civil || '—'}
          RFC={p.rfc || '—'}
        />
      </div>

      <div className="flex flex-col gap-x-4 lg:flex-row sm:w-full sm:justify-evenly pb-10 sm:pb-8">
        <div className="flex flex-col gap-x-4 gap-y-10 md:flex-row items-center md:items-baseline md:justify-evenly py-8 md:py-10 max-sm:gap-y-10">
          <DatosAcademicos
            NivelEstudios={p.nivel_estudios || '—'}
            Titulo={p.titulo_academico ? (p.titulo_academico === 1 ? 'Sí' : 'No') : p.titulo || '—'}
            Institucion={p.institucion || '—'}
            Graduacion={p.anio_graduacion || '—'}
            Idiomas={p.idiomas || p.idioma || '—'}
            Disponibilidad={p.disponibilidad || '—'}
            Horario={p.horario || '—'}
            Certificaciones={p.certificaciones || '—'}
          />

          <DatosProfesionales
            Experiencia={p.experiencia_rango || p.experiencia || '—'}
            ExperienciaAsesorias={p.experiencia_asesorias || '—'}
            Funcion={p.funcion || '—'}
            Plataformas={p.plataformas || '—'}
            Institucion={p.empresa || p.institucion || '—'}
            Area={p.areas_especializacion || p.area || '—'}
            Puesto={p.ultimo_puesto || p.puesto || '—'}
          />
        </div>

        <aside className="flex flex-col items-center lg:items-end gap-y-2 md:gap-y-7">
          <TarjetaPerfil
            src={Persona}
            Ingreso={p.ingreso || '—'}
            cantidadCursos={p.cursos || '0'}
            cantidadCertificados={p.certificados || '0'}
            cantidadEstudiantes={p.estudiantes || '0'}
            cantidadGeneraciones={p.generaciones || '0'}
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
  const { user } = useAuth();
  // grupo del asesor podría venir en user (si ya se añade en auth) o del perfil; de momento placeholder
  const grupoAsesor = user?.grupo_asesor || user?.grupo || null;
  const [reloadFlag,setReloadFlag] = useState(0);

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
          grupoAsesor={grupoAsesor}
          onCreated={()=> { setReloadFlag(f=>f+1); }}
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
  {activeTable === "asignacion" && <TablaAsignacionActividades grupoAsesor={grupoAsesor} reloadFlag={reloadFlag} />}
  {activeTable === "estudiantes" && <TablaEstudiantes grupoAsesor={grupoAsesor} />}
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