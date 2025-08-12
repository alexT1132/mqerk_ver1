import { useState, useEffect } from "react";
import { X, BookOpen, Calendar, Clock, Users, Upload, Image, ChevronDown, Plus, Check } from 'lucide-react';


const TestComp = () => {
    
    

    

    return (
        <div className="bg-[#1f1f1f] h-dvh flex items-center justify-center">
            <BtnDesplegable selected={selected} setSelected={setSelected} />
            <ModalCursos onClick={handleOpenModal} />
            <ActivityModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </div>
    )
}

export const BtnDesplegable = ({selected, setSelected}) => {
    const Opciones = [`Actividades`, `Quizt`];

    

    useEffect(() => {
        const saved = sessionStorage.getItem("opcionSeleccionada");
        if (saved && Opciones.includes(saved)) {
            setSelected(saved);
        } else {
            setSelected(Opciones[0]);
        }
    }, [setSelected]);

    const handleChange = (e) => {
        setSelected(e.target.value);
        sessionStorage.setItem("opcionSeleccionada", e.target.value);
    };

    return (
        <select
            className="flex bg-white uppercase w-30 max-sm:border-2 sm:w-50 font-semibold sm:font-bold rounded-xl p-1 cursor-pointer text-xs sm:text-xl md:text-2xl text-[#53289f] select-none"
            value={selected}
            onChange={handleChange}
        >
            {Opciones.map((opcion, index) =>
                <option
                    className="font-semibold hover:bg-amber-600 cursor-pointer sm:font-bold"
                    key={index}
                    value={opcion}
                    disabled={opcion === selected}
                    hidden={opcion === selected}
                >
                    {opcion}
                </option>
            )}
        </select>
    );
};

export const ModalCursos=({onClick})=>{
    return(
        <button onClick={onClick} className={`relative flex group rounded-full w-fit hover:bg-gray-300 cursor-pointer`}>
            <svg className={`flex sm:hidden`} xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#53289f"><path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z"/></svg>
            <svg className={`hidden sm:flex`} xmlns="http://www.w3.org/2000/svg" height="30px" viewBox="0 -960 960 960" width="30px" fill="#53289f"><path d="M446.67-446.67H200v-66.66h246.67V-760h66.66v246.67H760v66.66H513.33V-200h-66.66v-246.67Z"/></svg>
            <span className={`absolute opacity-0 hover:opacity-0 cursor-default group-hover:opacity-100 font-semibold transition-opacity duration-300 bg-violet-600 border-1 border-gray-400 text-white rounded-full pointer-events-none px-2 -top-6.5 -right-7 select-none z-3`}>Crear</span>
        </button>
    )
}


export const ActivityModal = ({isOpen, onClose}) => {
  const [activityData, setActivityData] = useState({
    nombreMateria: '',
    fechaEntrega: '',
    descripcion: '',
    horaLimite: '',
    gruposAsignados: [],
    recursos: null,
    imagen: null,
    materiaAsignacion: ''
  });

  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const availableGroups = [
    { id: 'grupo-a', name: 'Grupo A - Matutino' },
    { id: 'grupo-b', name: 'Grupo B - Vespertino' },
    { id: 'grupo-c', name: 'Grupo C - Sabatino' },
    { id: 'grupo-d', name: 'Grupo D - Nocturno' },
    { id: 'grupo-e', name: 'Grupo E - Virtual' },
    { id: 'grupo-f', name: 'Grupo F - Presencial' },
  ];

  const availableCourses = [
    { id: 'mat-calc', name: 'Cálculo Diferencial', icon: '∫' },
    { id: 'mat-prog', name: 'Programación Orientada a Objetos', icon: '</>' },
    { id: 'mat-hist', name: 'Historia Universal', icon: '📚' },
    { id: 'mat-bio', name: 'Biología Celular', icon: '🧬' },
    { id: 'mat-fis', name: 'Física Clásica', icon: '⚛️' },
  ];

  const steps = [
    { title: 'Detalles', icon: BookOpen },
    { title: 'Archivos', icon: Upload },
    { title: 'Grupos', icon: Users }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setActivityData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleMateriaSelect = (courseId) => {
    setActivityData(prev => ({ ...prev, materiaAsignacion: courseId }));
    setIsDropdownOpen(false);
  };

  const getSelectedCourse = () => {
    return availableCourses.find(course => course.id === activityData.materiaAsignacion);
  };

  const handleGroupChange = (groupId) => {
    setActivityData((prevData) => {
      const updatedGroups = prevData.gruposAsignados.includes(groupId)
        ? prevData.gruposAsignados.filter((id) => id !== groupId)
        : [...prevData.gruposAsignados, groupId];
      return {
        ...prevData,
        gruposAsignados: updatedGroups,
      };
    });
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setActivityData((prevData) => ({
      ...prevData,
      [name]: files.length > 0 ? files[0] : null,
    }));
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
        setIsAnimating(false);
      }, 200);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(currentStep - 1);
        setIsAnimating(false);
      }, 200);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Datos de la actividad a guardar:', activityData);
    onClose();
  };


  const [value, setValue] = useState('');

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4 sm:space-y-6">


            {/* Título */}
            <div className="group">
              <label className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                <BookOpen className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600" />
                Título de la Actividad
              </label>
              
              <input
                type="text"
                name="nombreMateria"
                value={activityData.nombreMateria}
                onChange={handleChange}
                className="w-full p-2 sm:p-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-xs sm:text-sm"
                placeholder="Ej. Tarea 1: Sumas Algebraicas"
                required
              />
            </div>

            {/* Materia Dropdown Personalizado */}
            <div className="group">
              <label className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                <div className="w-3 h-3 sm:w-4 sm:h-4 rounded bg-purple-600"></div>
                Materia Asociada
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full p-2 sm:p-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-xs sm:text-sm flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    {getSelectedCourse() ? (
                      <>
                        <span>{getSelectedCourse().icon}</span>
                        <span>{getSelectedCourse().name}</span>
                      </>
                    ) : (
                      <span className="text-gray-500">Selecciona una materia</span>
                    )}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                    isDropdownOpen ? 'rotate-180' : ''
                  }`} />
                </button>

                

                
                {isDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-48 overflow-y-auto">
                    {availableCourses.map((course) => (
                      <button
                        key={course.id}
                        type="button"
                        onClick={() => handleMateriaSelect(course.id)}
                        className="w-full p-3 text-left hover:bg-purple-50 transition-colors duration-200 flex items-center gap-2 text-xs sm:text-sm border-b border-gray-100 last:border-b-0"
                      >
                        <span className="text-base">{course.icon}</span>
                        <span className="text-gray-800">{course.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Fecha y Hora */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600" />
                  Fecha
                </label>
                <input
                  type="date"
                  name="fechaEntrega"
                  value={activityData.fechaEntrega}
                  onChange={handleChange}
                  className="w-full p-2 sm:p-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300 text-xs sm:text-sm"
                  required
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                  <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600" />
                  Hora
                </label>


                <input
                  type="time"
                  name="horaLimite"
                  value={activityData.horaLimite}
                  onChange={handleChange}
                  className="w-full p-2 sm:p-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300 text-xs sm:text-sm"
                  required
                />
              </div>
            </div>

            {/* Descripción */}
            <div>
              <label className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                <div className="w-3 h-3 sm:w-4 sm:h-4 rounded bg-blue-600"></div>
                Descripción
              </label>
              <textarea
                name="descripcion"
                value={activityData.descripcion}
                onChange={handleChange}
                className="w-full p-2 sm:p-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300 min-h-[60px] sm:min-h-[80px] resize-none text-xs sm:text-sm"
                placeholder="Describe la actividad..."
                rows="3"
              />
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-4 sm:space-y-6">
            {/* Recursos */}
            <div className="group">
              <label className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-700 mb-3">
                <Upload className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600" />
                Recursos Adicionales
              </label>
              <div className="relative">
                <input
                  type="file"
                  name="recursos"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  multiple
                />
                <div className="p-4 sm:p-6 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl text-center hover:bg-gray-100 hover:border-purple-400 transition-all duration-300">
                  <Upload className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-xs sm:text-sm text-gray-600 font-medium">
                    {activityData.recursos ? activityData.recursos.name : 'Arrastra archivos o haz clic'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">PDF, Videos, Documentos</p>
                </div>
              </div>
            </div>

            {/* Imagen */}
            <div className="group">
              <label className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-700 mb-3">
                <Image className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600" />
                Imagen de Portada
              </label>
              <div className="relative">
                <input
                  type="file"
                  name="imagen"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="p-4 sm:p-6 bg-purple-50 border-2 border-dashed border-purple-300 rounded-xl text-center hover:bg-purple-100 hover:border-purple-400 transition-all duration-300">
                  <Image className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 text-purple-500" />
                  <p className="text-xs sm:text-sm text-gray-700 font-medium">
                    {activityData.imagen ? activityData.imagen.name : 'Selecciona una imagen'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">JPG, PNG, SVG</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
              <h3 className="text-sm sm:text-base font-semibold text-gray-800">Seleccionar Grupos</h3>
              <span className="ml-auto bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs">
                {activityData.gruposAsignados.length} seleccionados
              </span>
            </div>
            
            <div className="flex flex-col p- gap-2 sm:gap-3 max-h-[200px] sm:max-h-[300px]">
              {availableGroups.map((group) => {
                const isSelected = activityData.gruposAsignados.includes(group.id);
                return (
                  <div
                    key={group.id}
                    onClick={() => handleGroupChange(group.id)}
                    className={`p-3 sm:p-4 rounded-xl cursor-pointer transition-all duration-300 border ${
                      isSelected
                        ? 'bg-purple-100 border-purple-400 shadow-md scale-105'
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-gray-800 truncate">{group.name}</p>
                        <p className="text-xs text-gray-500">Turno académico</p>
                      </div>
                      <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                        isSelected ? 'border-purple-600 bg-purple-600' : 'border-gray-300'
                      }`}>
                        {isSelected && <Check className="w-3 h-3 sm:w-4 sm:h-4 text-white" />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4"
         style={{ fontFamily: '"Lato", "Helvetica Neue", Helvetica, Arial, sans-serif' }}>
      <div className="w-full max-w-sm sm:max-w-lg md:max-w-2xl lg:max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden">
        {/* Modal Container */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col h-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden">
          
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-purple-600 to-indigo-600">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div>
                <h1 className="text-base sm:text-xl lg:text-2xl font-bold text-white">Nueva Actividad</h1>
                <p className="text-xs sm:text-sm text-white/80">MQerK Academy</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all duration-300"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </button>
          </div>

          {/* Progress Steps */}
          <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isActive = index === currentStep;
                const isCompleted = index < currentStep;
                
                return (
                  <div key={index} className="flex items-center flex-1">
                    <div className={`flex items-center gap-2 sm:gap-3 ${index < steps.length - 1 ? 'flex-1' : ''}`}>
                      <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                        isActive ? 'bg-purple-600 scale-110' :
                        isCompleted ? 'bg-green-500' : 'bg-gray-300'
                      }`}>
                        {isCompleted ? (
                          <Check className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                        ) : (
                          <Icon className={`w-3 h-3 sm:w-4 sm:h-4 ${isActive ? 'text-white' : 'text-gray-600'}`} />
                        )}
                      </div>
                      <span className={`text-xs sm:text-sm font-medium hidden sm:block ${
                        isActive ? 'text-purple-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                      }`}>
                        {step.title}
                      </span>
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`flex-1 h-0.5 mx-2 sm:mx-4 transition-all duration-300 ${
                        isCompleted ? 'bg-green-500' : 'bg-gray-300'
                      }`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            <div className={`transition-all duration-300 ${isAnimating ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}`}>
              {renderStepContent()}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-4 sm:p-6 border-t border-gray-200 bg-gradient-to-r from-purple-600 to-indigo-600">
            <div className="flex gap-2 sm:gap-4">
              {currentStep > 0 && (
                <button
                  onClick={prevStep}
                  className="flex-1 py-2 sm:py-3 px-4 bg-white/20 hover:bg-white/30 text-white font-semibold rounded-xl transition-all duration-300 text-xs sm:text-sm"
                >
                  Anterior
                </button>
              )}
              
              {currentStep < steps.length - 1 ? (
                <button
                  onClick={nextStep}
                  className="flex-1 py-2 sm:py-3 px-4 bg-white text-purple-600 hover:bg-gray-100 font-semibold rounded-xl transition-all duration-300 shadow-lg text-xs sm:text-sm"
                >
                  Siguiente
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  className="flex-1 py-2 sm:py-3 px-4 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg text-xs sm:text-sm"
                >
                  Crear Actividad
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};




// Grupos disponibles
const ALL_GROUPS = ["M1", "M2", "M3", "V1", "V2", "V3"];

// Datos de ejemplo
const actividadesEjemplo = [
  {
    id: 1,
    nombre: "Tarea de Álgebra",
    fechaEntrega: "2025-07-15",
    fechaLimite: "2025-07-16 18:00",
    gruposAsignados: ["M1", "V2"],
  },
  {
    id: 2,
    nombre: "Proyecto de Física",
    fechaEntrega: "2025-07-20",
    fechaLimite: "2025-07-21 20:00",
    gruposAsignados: ["M2", "M3", "V1"],
  },
  {
    id: 3,
    nombre: "Ensayo de Historia",
    fechaEntrega: "2025-07-22",
    fechaLimite: "2025-07-23 17:00",
    gruposAsignados: [],
  },
];


export const TablaAsignacionActividades = () => {
  const [actividades, setActividades] = useState(actividadesEjemplo);

  // Asignar grupo a actividad (una sola confirmación)
  const asignarGrupo = (actividadId, grupo) => {
    const confirmar = window.confirm(`¿Desea asignar la actividad al grupo ${grupo}?`);
    if (!confirmar) return;

    setActividades((prev) =>
      prev.map((act) =>
        act.id === actividadId
          ? {
              ...act,
              gruposAsignados: [...act.gruposAsignados, grupo],
            }
          : act
      )
    );
  };

  // Quitar grupo de actividad (doble confirmación)
  const quitarGrupo = (actividadId, grupo) => {
    const confirmar = window.confirm(`¿Desea quitar la actividad del grupo ${grupo}?`);
    if (!confirmar) return;
    const confirmar2 = window.confirm(`¿Está seguro que desea quitar la actividad del grupo ${grupo}?`);
    if (!confirmar2) return;

    setActividades((prev) =>
      prev.map((act) =>
        act.id === actividadId
          ? {
              ...act,
              gruposAsignados: act.gruposAsignados.filter((g) => g !== grupo),
            }
          : act
      )
    );
  };

  return (
    <div className="overflow-x-auto w-full">
      <table className="min-w-[800px] w-full border-collapse rounded-xl overflow-hidden shadow">
        <thead className="bg-purple-600 text-white">
          <tr>
            <th className="py-2 px-4 text-center">Numero de actividad</th>
            <th className="py-2 px-4 text-center">Nombre de la actividad</th>
            <th className="py-2 px-4 text-center">Fecha límite (hora)</th>
            <th className="py-2 px-4 text-center">Grupos asignados</th>
            <th className="py-2 px-4 text-center">Por asignar</th>
          </tr>
        </thead>
        <tbody className="text-center">
          {actividades.map((act, idx) => {
            // Grupos aún no asignados
            const gruposPorAsignar = ALL_GROUPS.filter(
              (g) => !act.gruposAsignados.includes(g)
            );
            return (
              <tr
                key={act.id}
                className={`transition hover:bg-purple-50 ${
                  idx % 2 === 0 ? "bg-gray-100" : "bg-white"
                }`}
              >
                <td className="py-2 px-4">{act.id}</td>
                <td className="py-2 px-4">{act.nombre}</td>
                <td className="py-2 px-4">{act.fechaLimite}</td>
                <td className="py-2 px-4">
                  {act.gruposAsignados.length > 0 ? (
                    <div className="flex flex-wrap gap-1 justify-center">
                      {act.gruposAsignados.map((g) => (
                        <span
                          key={g}
                          className="bg-green-200 text-green-800 px-2 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1"
                        >
                          {g}
                          <button
                            className="ml-1 text-red-600 hover:text-red-900 font-bold cursor-pointer"
                            title={`Quitar grupo ${g}`}
                            onClick={() => quitarGrupo(act.id, g)}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-400 text-xs">Ninguno</span>
                  )}
                </td>
                <td className="py-2 px-4">
                  <div className="flex flex-wrap gap-1 justify-center">
                    {gruposPorAsignar.length > 0 ? (
                      gruposPorAsignar.map((g) => (
                        <button
                          key={g}
                          className="bg-purple-200 hover:bg-purple-400 text-purple-900 px-2 py-0.5 rounded-full text-xs font-semibold transition cursor-pointer"
                          onClick={() => asignarGrupo(act.id, g)}
                        >
                          {g}
                        </button>
                      ))
                    ) : (
                      <span className="text-gray-400 text-xs">Todos asignados</span>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

  const estudiantesQuiztEjemplo = [
  {
    folio: "A001",
    nombre: "Juan Pérez",
    entregado: true,
    Contestado: true,
    fechaLimite: "2025-07-15T18:00:00",
    archivoUrl: "#",
    calificacion: 100,
  },
  {
    folio: "A002",
    nombre: "María García",
    entregado: false,
    Contestado: false,
    fechaLimite: "2025-07-15T18:00:00",
    archivoUrl: "#",
    calificacion: 82.5,
  },
  {
    folio: "A003",
    nombre: "Carlos Díaz",
    entregado: true,
    Contestado: true,
    fechaLimite: "2025-07-10T18:00:00",
    archivoUrl: "#",
    calificacion: 70,
  },
];


export const TablaAsignacionQuizt = () => {
  const [quizt, setQuizt] = useState(estudiantesQuiztEjemplo);

  return (
    <div className="overflow-x-auto w-full">
      <table className="min-w-[800px] w-full border-collapse rounded-xl overflow-hidden shadow">
        <thead className="bg-purple-600 text-white">
          <tr>
            <th className="py-2 px-4 text-center">Numero de folio</th>
            <th className="py-2 px-4 text-center">Nombre del alumno</th>
            <th className="py-2 px-4 text-center">Realizado</th>
            <th className="py-2 px-4 text-center">Calificación</th>
          </tr>
        </thead>
        <tbody className="text-center">
          {quizt.map((q, idx) => (
            <tr
              key={q.folio}
              className={`transition hover:bg-purple-50 ${
                idx % 2 === 0 ? "bg-gray-100" : "bg-white"
              }`}
            >
              <td className="py-2 px-4">{q.folio}</td>
              <td className="py-2 px-4">{q.nombre}</td>
              <td className="py-2 px-4">
                {q.Contestado ? (
                  <span className="text-green-600 font-semibold">Sí</span>
                ) : (
                  <span className="text-red-600 font-semibold">No</span>
                )}
              </td>
              <td className={`py-2 px-4 ${q.calificacion > 70 ? "text-green-500":"text-yellow-500"}`}>
              {q.calificacion}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};


const estudiantesEjemplo = [
  {
    folio: "A001",
    nombre: "Juan Pérez",
    entregado: true,
    fechaLimite: "2025-07-15T18:00:00",
    archivoUrl: "#",
    calificacion: null,
  },
  {
    folio: "A002",
    nombre: "María García",
    entregado: false,
    fechaLimite: "2025-07-15T18:00:00",
    archivoUrl: "#",
    calificacion: null,
  },
  {
    folio: "A003",
    nombre: "Carlos Díaz",
    entregado: true,
    fechaLimite: "2025-07-10T18:00:00",
    archivoUrl: "#",
    calificacion: null,
  },
];

// Función para determinar el estado de entrega
function getEstadoEntrega(estudiante) {
  if (estudiante.entregado) {
    return { texto: "Sí", color: "text-green-600 bg-green-100" };
  }
  const ahora = new Date();
  const fechaLimite = new Date(estudiante.fechaLimite);
  if (ahora <= fechaLimite) {
    return { texto: "Pendiente", color: "text-gray-600 bg-gray-100" };
  }
  return { texto: "No", color: "text-red-600 bg-red-100" };
}

// Función para determinar el color de la calificación
function getColorCalificacion(calificacion) {
  if (calificacion >= 8) return "bg-green-200 text-green-800";
  if (calificacion >= 6) return "bg-yellow-200 text-yellow-800";
  return "bg-red-200 text-red-800";
}

const ModalCalificacion = ({ open, onClose, onConfirm, calificacionInicial }) => {
  const [calificacion, setCalificacion] = useState("");

  // Resetear calificacion cada vez que el modal se abre
  useEffect(() => {
    if (open) {
      setCalificacion("");
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-lg p-6 min-w-[300px] flex flex-col gap-4">
        <h2 className="text-lg font-bold text-purple-700 mb-2">
          {calificacionInicial !== null && calificacionInicial !== undefined
            ? "Editar calificación"
            : "Asignar calificación"}
        </h2>
        <select
          className="border rounded p-2 text-lg"
          value={calificacion}
          onChange={(e) => setCalificacion(Number(e.target.value))}
        >
          <option disabled value="">Selecciona una calificación</option>
          {[...Array(11).keys()].map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
        <div className="flex gap-2 justify-end">
          <button
            className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-gray-700"
            onClick={onClose}
          >
            Cancelar
          </button>
          <button
            className="px-3 py-1 rounded bg-green-500 hover:bg-green-600 text-white font-semibold"
            onClick={() => {
              if (calificacion === "" || isNaN(calificacion)) return;
              onConfirm(calificacion);
            }}
            disabled={calificacion === "" || isNaN(calificacion)}
          >
            {calificacionInicial !== null && calificacionInicial !== undefined
              ? "Actualizar"
              : "Confirmar"}
          </button>
        </div>
      </div>
    </div>
  );
};

export const TablaEstudiantes = () => {
  const [estudiantes, setEstudiantes] = useState(estudiantesEjemplo);
  const [modal, setModal] = useState({
    open: false,
    folio: null,
    calificacionInicial: null,
  });

  const handleAsignar = (folio) => {
    setModal({ open: true, folio, calificacionInicial: null });
  };

  const handleEditar = (folio, calificacion) => {
    setModal({ open: true, folio, calificacionInicial });
  };

  const handleConfirm = (calificacion) => {
    setEstudiantes((prev) =>
      prev.map((est) =>
        est.folio === modal.folio
          ? { ...est, calificacion }
          : est
      )
    );
    setModal({ open: false, folio: null, calificacionInicial: null });
  };

  const handleClose = () => {
    setModal({ open: false, folio: null, calificacionInicial: null });
  };

  return (
    <div className="overflow-x-auto w-full">
      <ModalCalificacion
        open={modal.open}
        onClose={handleClose}
        onConfirm={handleConfirm}
        calificacionInicial={modal.calificacionInicial}
      />
      <table className="min-w-[700px] w-full border-collapse rounded-xl overflow-hidden shadow">
        <thead className="bg-purple-600 text-white">
          <tr>
            <th className="py-2 px-4 text-center">Numero de folio</th>
            <th className="py-2 px-4 text-center">Nombre del estudiante</th>
            <th className="py-2 px-4 text-center">Entregado</th>
            <th className="py-2 px-4 text-center">Asignar calificación</th>
            <th className="py-2 px-4 text-center">Visualizar tarea</th>
          </tr>
        </thead>
        <tbody className="text-center">
          {estudiantes.map((est, idx) => {
            const estado = getEstadoEntrega(est);
            return (
              <tr
                key={est.folio}
                className={`transition hover:bg-purple-50 ${
                  idx % 2 === 0 ? "bg-gray-100" : "bg-white"
                }`}
              >
                <td className="py-2 px-4">{est.folio}</td>
                <td className="py-2 px-4">{est.nombre}</td>
                <td className="py-2 px-4">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${estado.color}`}>
                    {estado.texto}
                  </span>
                </td>
                <td className="py-2 px-4">
                  {est.calificacion === null ? (
                    <button
                      className="bg-blue-500 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs font-semibold transition"
                      disabled={!est.entregado}
                      onClick={() => handleAsignar(est.folio)}
                    >
                      Asignar calificación
                    </button>
                  ) : (
                    <div className="relative group inline-block">
                      <span
                        className={`px-3 py-1 rounded text-xs font-semibold cursor-default select-none ${getColorCalificacion(est.calificacion)}`}
                      >
                        {est.calificacion}
                      </span>
                      <button
                        className="absolute top-1/2 -translate-y-1/2 right-0 translate-x-full opacity-0 group-hover:opacity-100 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 px-2 py-1 rounded text-xs font-semibold ml-2 transition"
                        style={{ pointerEvents: "auto" }}
                        onClick={() => handleEditar(est.folio, est.calificacion)}
                      >
                        Editar
                      </button>
                    </div>
                  )}
                </td>
                <td className="flex py-2 px-4 justify-center gap-x-3">
                  <a href=""
                  title="Descargar tarea"
                  className="bg-blue-500 flex items-center hover:bg-blue-700 px-3 py-1 rounded">
                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="M480-320 280-520l56-58 104 104v-326h80v326l104-104 56 58-200 200ZM240-160q-33 0-56.5-23.5T160-240v-120h80v120h480v-120h80v120q0 33-23.5 56.5T720-160H240Z"/></svg>
                  </a>
                  <a
                    title="Visualizar tarea"
                    href={est.archivoUrl}
                    className={`bg-green-500 hover:bg-green-700 text-white px-3 py-1 rounded text-xs font-semibold transition ${!est.entregado ? "opacity-50 pointer-events-none" : ""}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="M480-320q75 0 127.5-52.5T660-500q0-75-52.5-127.5T480-680q-75 0-127.5 52.5T300-500q0 75 52.5 127.5T480-320Zm0-72q-45 0-76.5-31.5T372-500q0-45 31.5-76.5T480-608q45 0 76.5 31.5T588-500q0 45-31.5 76.5T480-392Zm0 192q-146 0-266-81.5T40-500q54-137 174-218.5T480-800q146 0 266 81.5T920-500q-54 137-174 218.5T480-200Zm0-300Zm0 220q113 0 207.5-59.5T832-500q-50-101-144.5-160.5T480-720q-113 0-207.5 59.5T128-500q50 101 144.5 160.5T480-280Z"/></svg>
                  </a>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};


const quiztEjemplo = [
  {
    id: 1,
    nombre: "Quizt de Álgebra",
    fechaLimite: "2025-07-15",
    horaLimite: "18:00",
    gruposAsignados: ["M1", "V2"],
  },
  {
    id: 2,
    nombre: "Quizt de Física",
    fechaLimite: "2025-07-20",
    horaLimite: "20:00",
    gruposAsignados: ["M2", "M3", "V1"],
  },
  {
    id: 3,
    nombre: "Quizt de Historia",
    fechaLimite: "2025-07-22",
    horaLimite: "17:00",
    gruposAsignados: [],
  },
];

export const TablaQuizt = () => {

  
  const [quizts, setQuizts] = useState(quiztEjemplo);

  // Asignar grupo a quizt
  const asignarGrupo = (quiztId, grupo) => {
    const confirmar = window.confirm(`¿Desea asignar el quizt al grupo ${grupo}?`);
    if (!confirmar) return;
    setQuizts((prev) =>
      prev.map((q) =>
        q.id === quiztId
          ? { ...q, gruposAsignados: [...q.gruposAsignados, grupo] }
          : q
      )
    );
  };

  // Quitar grupo de quizt
  const quitarGrupo = (quiztId, grupo) => {
    const confirmar = window.confirm(`¿Desea quitar el quizt del grupo ${grupo}?`);
    if (!confirmar) return;
    const confirmar2 = window.confirm(`¿Está seguro que desea quitar el quizt del grupo ${grupo}?`);
    if (!confirmar2) return;
    setQuizts((prev) =>
      prev.map((q) =>
        q.id === quiztId
          ? { ...q, gruposAsignados: q.gruposAsignados.filter((g) => g !== grupo) }
          : q
      )
    );
  };

  // Editar quizt (solo ejemplo)
  const editarQuizt = (quiztId) => {
    alert(`Editar quizt con ID: ${quiztId}`);
  };

  // Eliminar quizt (solo ejemplo)
  const eliminarQuizt = (quiztId) => {
    const confirmar = window.confirm("¿Desea eliminar este quizt?");
    if (!confirmar) return;
    setQuizts((prev) => prev.filter((q) => q.id !== quiztId));
  };

  return (
    <div className="overflow-x-auto w-full">
      <table className="min-w-[900px] w-full border-collapse rounded-xl overflow-hidden shadow">
        <thead className="bg-purple-600 text-white">
          <tr>
            <th className="py-2 px-4 text-center">Numero de quizt</th>
            <th className="py-2 px-4 text-center">Nombre de quizt</th>
            <th className="py-2 px-4 text-center">Fecha límite</th>
            <th className="py-2 px-4 text-center">Hora límite de entrega</th>
            <th className="py-2 px-4 text-center">Grupo(s) asignado(s)</th>
            <th className="py-2 px-4 text-center">Por asignar</th>
            <th className="py-2 px-4 text-center">Acciones</th>
          </tr>
        </thead>
        <tbody className="text-center">
          {quizts.map((q, idx) => {
            const gruposPorAsignar = ALL_GROUPS.filter(
              (g) => !q.gruposAsignados.includes(g)
            );
            return (
              <tr
                key={q.id}
                className={`transition hover:bg-purple-50 ${
                  idx % 2 === 0 ? "bg-gray-100" : "bg-white"
                }`}
              >
                <td className="py-2 px-4">{q.id}</td>
                <td className="py-2 px-4">{q.nombre}</td>
                <td className="py-2 px-4">{q.fechaLimite}</td>
                <td className="py-2 px-4">{q.horaLimite}</td>
                <td className="py-2 px-4">
                  {q.gruposAsignados.length > 0 ? (
                    <div className="flex flex-wrap gap-1 justify-center">
                      {q.gruposAsignados.map((g) => (
                        <span
                          key={g}
                          className="bg-green-200 text-green-800 px-2 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1"
                        >
                          {g}
                          <button
                            className="ml-1 text-red-600 hover:text-red-900 font-bold cursor-pointer"
                            title={`Quitar grupo ${g}`}
                            onClick={() => quitarGrupo(q.id, g)}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-400 text-xs">Ninguno</span>
                  )}
                </td>
                <td className="py-2 px-4">
                  <div className="flex flex-wrap gap-1 justify-center">
                    {gruposPorAsignar.length > 0 ? (
                      gruposPorAsignar.map((g) => (
                        <button
                          key={g}
                          className="bg-purple-200 hover:bg-purple-400 text-purple-900 px-2 py-0.5 rounded-full text-xs font-semibold transition cursor-pointer"
                          onClick={() => asignarGrupo(q.id, g)}
                        >
                          {g}
                        </button>
                      ))
                    ) : (
                      <span className="text-gray-400 text-xs">Todos asignados</span>
                    )}
                  </div>
                </td>
                <td className="py-2 px-4">
                  <div className="flex gap-2 justify-center">
                    <button
                      className="bg-yellow-400 hover:bg-yellow-500 text-yellow-900 px-3 py-1 rounded text-xs font-semibold transition"
                      onClick={() => editarQuizt(q.id)}
                    >
                      Editar
                    </button>
                    <button
                      className="bg-red-500 hover:bg-red-700 text-white px-3 py-1 rounded text-xs font-semibold transition"
                      onClick={() => eliminarQuizt(q.id)}
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};



export default TestComp;