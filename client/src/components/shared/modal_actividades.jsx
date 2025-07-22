import React, { useState } from 'react';
import { X, BookOpen, Calendar, Clock, Users, Upload, Image, ChevronDown, Plus, Check } from 'lucide-react';

const ActivityModal = ({ isOpen, onClose }) => {
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

export default ActivityModal;



// /////////////////////////////////////////////////////////////////////////

// import React, { useState } from 'react';

// // Componente principal del Modal de Actividad
// const ActivityModal = ({ isOpen, onClose }) => {
//   // Estado para almacenar los datos de la actividad
//   const [activityData, setActivityData] = useState({
//     nombreMateria: '',
//     fechaEntrega: '',
//     descripcion: '',
//     horaLimite: '',
//     gruposAsignados: [],
//     recursos: null,
//     imagen: null,
//     materiaAsignacion: ''
//   });

//   const [isDropdownOpen, setIsDropdownOpen] = useState(false);

//   // Datos de ejemplo para los grupos disponibles
//   const availableGroups = [
//     { id: 'grupo-a', name: 'Grupo A - Matutino' },
//     { id: 'grupo-b', name: 'Grupo B - Vespertino' },
//     { id: 'grupo-c', name: 'Grupo C - Sabatino' },
//     { id: 'grupo-d', name: 'Grupo D - Nocturno' },
//     { id: 'grupo-e', name: 'Grupo E - Virtual' },
//     { id: 'grupo-f', name: 'Grupo F - Presencial' },
//   ];

//   // Datos de ejemplo para las materias disponibles
//   const availableCourses = [
//     { id: 'mat-calc', name: 'Cálculo Diferencial' },
//     { id: 'mat-prog', name: 'Programación O.O.' },
//     { id: 'mat-hist', name: 'Historia Universal' },
//     { id: 'mat-bio', name: 'Biología Celular' },
//     { id: 'mat-fis', name: 'Física Clásica' },
//   ];

//   // Manejador de cambios para inputs de texto
//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setActivityData((prevData) => ({
//       ...prevData,
//       [name]: value,
//     }));
//   };

//   // Manejador para selección de materia
//   const handleMateriaSelect = (courseId) => {
//     setActivityData(prev => ({ ...prev, materiaAsignacion: courseId }));
//     setIsDropdownOpen(false);
//   };

//   // Obtener materia seleccionada
//   const getSelectedCourse = () => {
//     return availableCourses.find(course => course.id === activityData.materiaAsignacion);
//   };

//   // Manejador de cambios para los checkboxes de grupos
//   const handleGroupChange = (groupId) => {
//     setActivityData((prevData) => {
//       const updatedGroups = prevData.gruposAsignados.includes(groupId)
//         ? prevData.gruposAsignados.filter((id) => id !== groupId)
//         : [...prevData.gruposAsignados, groupId];
//       return {
//         ...prevData,
//         gruposAsignados: updatedGroups,
//       };
//     });
//   };

//   // Manejador de cambios para inputs de tipo 'file'
//   const handleFileChange = (e) => {
//     const { name, files } = e.target;
//     setActivityData((prevData) => ({
//       ...prevData,
//       [name]: files.length > 0 ? files[0] : null,
//     }));
//   };

//   // Manejador para el envío del formulario
//   const handleSubmit = (e) => {
//     e.preventDefault();
//     console.log('Datos de la actividad a guardar:', activityData);
//     onClose();
//   };

//   // Si el modal no está abierto, no renderiza nada
//   if (!isOpen) return null;

//   return (
//     // Contenedor principal del modal: más compacto
//     <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999] p-2">
//       {/* Modal más compacto */}
//       <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
//            style={{ fontFamily: '"Avenir Next", "Nunito Sans", "Century Gothic", "Franklin Gothic Medium", sans-serif' }}>
        
//         {/* Header compacto */}
//         <div className="bg-gradient-to-r from-purple-700 via-purple-600 to-indigo-600 text-white p-4 relative">
//           <div className="flex items-center justify-between">
//             <div className="min-w-0 pr-2">
//               <h2 className="text-lg sm:text-xl font-bold tracking-tight truncate">
//                 Nueva Actividad
//               </h2>
//               <p className="text-purple-100 text-sm opacity-90">
//                 Asigna tareas a grupos
//               </p>
//             </div>
//             <button
//               onClick={onClose}
//               className="text-white/80 hover:text-white hover:bg-white/20 rounded-full p-2 transition-all duration-200 flex-shrink-0"
//               aria-label="Cerrar modal"
//             >
//               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//               </svg>
//             </button>
//           </div>
//         </div>

//         {/* Contenido compacto */}
//         <div className="flex-1 overflow-y-auto p-4 space-y-4">
          
//           {/* Información Básica - más compacta */}
//           <section className="space-y-3">
//             <h3 className="text-base font-semibold text-gray-800 border-b border-purple-200 pb-1">
//               📝 Información Básica
//             </h3>
            
//             {/* Grid compacto */}
//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//               {/* Título */}
//               <div className="sm:col-span-2">
//                 <label className="text-sm font-medium text-gray-700 block mb-1">
//                   Título de la Actividad *
//                 </label>
//                 <input
//                   type="text"
//                   name="nombreMateria"
//                   value={activityData.nombreMateria}
//                   onChange={handleChange}
//                   className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors text-gray-800 text-sm"
//                   placeholder="Ej. Tarea 1: Sumas Algebraicas"
//                   required
//                 />
//               </div>

//               {/* Dropdown personalizado para Materia */}
//               <div className="sm:col-span-2">
//                 <label className="text-sm font-medium text-gray-700 block mb-1">
//                   Materia Asociada *
//                 </label>
//                 <div className="relative">
//                   <button
//                     type="button"
//                     onClick={() => setIsDropdownOpen(!isDropdownOpen)}
//                     className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors text-gray-800 text-sm flex items-center justify-between bg-white"
//                   >
//                     <span>
//                       {getSelectedCourse() ? getSelectedCourse().name : 'Selecciona una materia'}
//                     </span>
//                     <svg className={`w-4 h-4 text-gray-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
//                     </svg>
//                   </button>
                  
//                   {isDropdownOpen && (
//                     <div className="absolute top-full left-0 right-0 mt-1 bg-white border-2 border-gray-200 rounded-lg shadow-lg z-50 max-h-32 overflow-y-auto">
//                       {availableCourses.map((course) => (
//                         <button
//                           key={course.id}
//                           type="button"
//                           onClick={() => handleMateriaSelect(course.id)}
//                           className="w-full p-2 text-left hover:bg-purple-50 transition-colors text-sm border-b border-gray-100 last:border-b-0"
//                         >
//                           {course.name}
//                         </button>
//                       ))}
//                     </div>
//                   )}
//                 </div>
//               </div>

//               {/* Fecha */}
//               <div>
//                 <label className="text-sm font-medium text-gray-700 block mb-1">
//                   Fecha *
//                 </label>
//                 <input
//                   type="date"
//                   name="fechaEntrega"
//                   value={activityData.fechaEntrega}
//                   onChange={handleChange}
//                   className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors text-gray-800 text-sm"
//                   required
//                 />
//               </div>

//               {/* Hora */}
//               <div>
//                 <label className="text-sm font-medium text-gray-700 block mb-1">
//                   Hora *
//                 </label>
//                 <input
//                   type="time"
//                   name="horaLimite"
//                   value={activityData.horaLimite}
//                   onChange={handleChange}
//                   className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors text-gray-800 text-sm"
//                   required
//                 />
//               </div>
//             </div>

//             {/* Descripción */}
//             <div>
//               <label className="text-sm font-medium text-gray-700 block mb-1">
//                 Descripción
//               </label>
//               <textarea
//                 name="descripcion"
//                 value={activityData.descripcion}
//                 onChange={handleChange}
//                 rows="2"
//                 className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors text-gray-800 resize-none text-sm"
//                 placeholder="Describe la actividad..."
//               />
//             </div>
//           </section>

//           {/* Recursos - compacto */}
//           <section className="space-y-3">
//             <h3 className="text-base font-semibold text-gray-800 border-b border-purple-200 pb-1">
//               📎 Recursos
//             </h3>
            
//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//               {/* Archivos */}
//               <div>
//                 <label className="text-sm font-medium text-gray-700 block mb-1">
//                   Archivos
//                 </label>
//                 <div className="relative">
//                   <input
//                     type="file"
//                     name="recursos"
//                     onChange={handleFileChange}
//                     className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
//                   />
//                   <div className="w-full px-3 py-2 rounded-lg border-2 border-dashed border-purple-300 bg-purple-50 text-center hover:bg-purple-100 transition-colors cursor-pointer min-h-[60px] flex flex-col items-center justify-center">
//                     <svg className="w-5 h-5 text-purple-500 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
//                     </svg>
//                     <p className="text-xs text-purple-700">
//                       {activityData.recursos ? activityData.recursos.name : 'Subir archivo'}
//                     </p>
//                   </div>
//                 </div>
//               </div>

//               {/* Imagen */}
//               <div>
//                 <label className="text-sm font-medium text-gray-700 block mb-1">
//                   Imagen
//                 </label>
//                 <div className="relative">
//                   <input
//                     type="file"
//                     name="imagen"
//                     accept="image/*"
//                     onChange={handleFileChange}
//                     className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
//                   />
//                   <div className="w-full px-3 py-2 rounded-lg border-2 border-dashed border-indigo-300 bg-indigo-50 text-center hover:bg-indigo-100 transition-colors cursor-pointer min-h-[60px] flex flex-col items-center justify-center">
//                     <svg className="w-5 h-5 text-indigo-500 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
//                     </svg>
//                     <p className="text-xs text-indigo-700">
//                       {activityData.imagen ? activityData.imagen.name : 'Subir imagen'}
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </section>

//           {/* Grupos - compacto */}
//           <section className="space-y-3">
//             <h3 className="text-base font-semibold text-gray-800 border-b border-purple-200 pb-1">
//               👥 Grupos ({activityData.gruposAsignados.length})
//             </h3>
            
//             <div className="bg-gray-50 rounded-lg p-3 max-h-32 overflow-y-auto">
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
//                 {availableGroups.map((group) => (
//                   <label key={group.id} className="flex items-center space-x-2 cursor-pointer hover:bg-white rounded p-1 transition-colors">
//                     <input
//                       type="checkbox"
//                       checked={activityData.gruposAsignados.includes(group.id)}
//                       onChange={() => handleGroupChange(group.id)}
//                       className="w-3 h-3 text-purple-600 rounded border border-gray-300"
//                     />
//                     <span className="text-sm text-gray-700">{group.name}</span>
//                   </label>
//                 ))}
//               </div>
//             </div>
//           </section>
//         </div>

//         {/* Footer compacto */}
//         <div className="border-t border-gray-200 p-4 bg-gray-50 flex gap-2">
//           <button
//             type="button"
//             onClick={onClose}
//             className="flex-1 px-4 py-2 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all duration-200 text-sm"
//           >
//             Cancelar
//           </button>
//           <button
//             type="submit"
//             onClick={handleSubmit}
//             className="flex-1 px-4 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-all duration-200 text-sm"
//           >
//             💾 Guardar
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ActivityModal;