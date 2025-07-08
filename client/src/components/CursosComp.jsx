import {useState, useEffect} from "react";
import { X, BookOpen, Calendar, Clock, Users, Upload, Image, ChevronDown, Plus, Check } from 'lucide-react';


const TestComp = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selected, setSelected] = useState("");

    const handleOpenModal = () => {
        if (selected === "Actividades") {
            setIsModalOpen(true);
        } else {
            alert("Solo puedes crear actividades cuando 'Actividades' está seleccionado.");
        }
    };

    return (
        <div className="bg-[#1f1f1f] h-dvh flex items-center justify-center">
            <BtnDesplegable selected={selected} setSelected={setSelected} />
            <ModalCursos onClick={handleOpenModal} />
            <ActivityModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </div>
    )
}

export const BtnDesplegable = ({ selected, setSelected }) => {
    const Opciones = [`Actividades`, `Quizt`, `Simuladores`];

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
            className="flex bg-white uppercase font-semibold sm:font-bold rounded-xl p-1 cursor-pointer text-xs sm:text-xl md:text-2xl text-[#53289f] select-none"
            value={selected}
            onChange={handleChange}
        >
            {Opciones.map((opcion, index) =>
                <option
                    className="font-semibold relative sm:font-bold"
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
        <button onClick={onClick} className={`flex group rounded-full hover:bg-white relative cursor-pointer`}>
            <svg className={`flex sm:hidden`} xmlns="http://www.w3.org/2000/svg" height="25px" viewBox="0 -960 960 960" width="25px" fill="#53289f"><path d="M446.67-446.67H200v-66.66h246.67V-760h66.66v246.67H760v66.66H513.33V-200h-66.66v-246.67Z"/></svg>
            <svg className={`hidden sm:flex`} xmlns="http://www.w3.org/2000/svg" height="40px" viewBox="http://www.w3.org/2000/svg" width="40px" fill="#53289f"><path d="M446.67-446.67H200v-66.66h246.67V-760h66.66v246.67H760v66.66H513.33V-200h-66.66v-246.67Z"/></svg>
            <span className={`absolute opacity-0 hover:opacity-0 hover:bg- cursor-default group-hover:opacity-100 font-semibold transition-opacity duration-300 bg-amber-200 rounded-full pointer-events-none px-1 -top-6 -right-7 select-none`}>Crear</span>
        </button>
    )
}


export const ActivityModal = ({ isOpen, onClose }) => {
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
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 max-h-[200px] sm:max-h-[300px] overflow-y-auto pr-2">
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




export default TestComp;