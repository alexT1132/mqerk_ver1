import React, { useState, useEffect } from 'react';
import { Upload, Eye, CheckCircle, XCircle, Sparkles, Star, ChevronDown } from 'lucide-react';

const Feedback_Alumno_Comp = () => {
  // Estado para gestionar la lista de tareas
  const [tasks, setTasks] = useState([
    {
      id: 1,
      name: 'Operaciones fundamentales',
      dueDate: '2025-12-02T23:59:59', // Fecha actualizada al futuro
      submittedPdf: null,
      isSubmitted: false,
      score: null,
    },
    {
      id: 2,
      name: 'Expresiones Algebraicas',
      dueDate: '2025-12-02T23:59:59', // Fecha actualizada al futuro
      submittedPdf: null,
      isSubmitted: false,
      score: null,
    },
    {
      id: 3,
      name: 'Geometría Básica',
      dueDate: '2025-07-15T23:59:59', // Fecha actualizada al futuro (cercana para probar)
      submittedPdf: null,
      isSubmitted: false,
      score: null,
    },
    {
      id: 4,
      name: 'Cálculo Diferencial',
      dueDate: '2025-08-01T23:59:59', // Fecha actualizada al futuro
      submittedPdf: null,
      isSubmitted: false,
      score: null,
    },
  ]);

  // Estados
  const [showModal, setShowModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiScore, setConfettiScore] = useState(0);
  // showMotivationalMessage state is not directly used for visual display in the confetti effect anymore
  const [showMotivationalMessage, setShowMotivationalMessage] = useState(false); 
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [showViewTaskModal, setShowViewTaskModal] = useState(false);
  const [viewingTaskName, setViewingTaskName] = useState('');
  const [viewingTaskPdf, setViewingTaskPdf] = useState('');
  const [totalPoints, setTotalPoints] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Palabras motivacionales
  const motivationalWords = [
    "¡Genial, sigue así!",
    "¡Excelente trabajo!",
    "¡Imparable, lo lograste!",
    "¡Muy bien hecho!",
    "¡Orgulloso de ti!",
    "¡Brillante desempeño!",
    "¡Increíble esfuerzo!",
    "¡Vas por buen camino!",
    "¡Sigue brillando!",
    "¡Tu dedicación inspira!",
    "¡Aprender es crecer!",
    "¡Nunca te rindas!",
    "¡Eres un ejemplo!",
    "¡Cada día mejoras más!",
    "¡Tu constancia da frutos!"
  ];
  const [motivationalWord, setMotivationalWord] = useState("");

  // Efecto para calcular los puntos totales
  useEffect(() => {
    const calculatedTotalPoints = tasks.reduce((sum, task) => sum + (task.score || 0), 0);
    setTotalPoints(calculatedTotalPoints);
  }, [tasks]);

  // Función para manejar la subida de archivos
  const handleFileUpload = (taskId, file) => {
    // TODO: Backend - Aquí tu compañero debe enviar el archivo al backend y guardar la URL recibida
    // Simulación: usamos un objeto URL temporal para mostrar el PDF subido
    const fileUrl = file ? URL.createObjectURL(file) : null;
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId
          ? { ...task, submittedPdf: fileUrl, isSubmitted: true, score: 10 }
          : task
      )
    );
    setShowModal(false);
    setSelectedTask(null);

    // Activar confeti y mensaje motivacional
    setConfettiScore(10);
    // Elegir palabra motivacional aleatoria
    const randomWord = motivationalWords[Math.floor(Math.random() * motivationalWords.length)];
    setMotivationalWord(randomWord);
    setShowConfetti(true);
    // Aumenta el tiempo del setTimeout para que coincida o supere la duración máxima de la animación del confeti (5s + 4s = 9s máximo)
    setTimeout(() => setShowConfetti(false), 9500); // 9.5 segundos para asegurar que todas las partículas terminen
  };

  // Función para cancelar entrega
  const handleCancelSubmission = (taskId) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId
          ? { ...task, submittedPdf: null, isSubmitted: false, score: null }
          : task
      )
    );
    setShowModal(false);
    setSelectedTask(null);
  };

  // Funciones de modal
  const openModal = (task) => {
    setSelectedTask(task);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedTask(null);
  };

  const openViewTaskModal = (task) => {
    setViewingTaskName(task.name);
    setViewingTaskPdf(task.submittedPdf);
    setShowViewTaskModal(true);
  };

  const closeViewTaskModal = () => {
    setShowViewTaskModal(false);
    setViewingTaskName('');
    setViewingTaskPdf('');
  };

  // Efecto para mensaje motivacional (ahora solo para el contador de tareas, no visual)
  useEffect(() => {
    const submittedCount = tasks.filter(task => task.isSubmitted).length;
    // Puedes usar esto para otra lógica si quieres, pero el mensaje visual se movió al confeti
    if (submittedCount >= 3) {
      // Por ejemplo, podrías activar otra animación o un log aquí
      // console.log("¡Más de 3 tareas entregadas!");
    }
  }, [tasks]);

  // Filtrado de tareas
  const filteredTasks = tasks.filter(task => {
    if (selectedMonth === 'all') {
      return true;
    }
    const taskMonth = new Date(task.dueDate).getMonth();
    return taskMonth === parseInt(selectedMonth);
  });

  // Verificar fecha límite
  const isWithinDeadline = (dueDate) => {
    const now = new Date();
    const due = new Date(dueDate);
    return now < due;
  };

  const months = [
    'Primero', 'Segundo', 'Tercero', 'Cuarto', 'Quinto', 'Sexto', 'Séptimo', 'Octavo', 'Noveno', 'Décimo'
  ];

  const handleMonthSelect = (monthValue, monthName) => {
    setSelectedMonth(monthValue);
    setIsDropdownOpen(false);
  };

  const getSelectedMonthName = () => {
    if (selectedMonth === 'all') return 'Todos los meses';
    return months[parseInt(selectedMonth)];
  };

  // Función para abrir el PDF en una nueva pestaña
  const handleOpenPdfInNewTab = () => {
    // TODO: Backend - Aquí tu compañero debe usar la URL real del PDF desde el backend
    if (viewingTaskPdf) {
      window.open(viewingTaskPdf, '_blank');
    } else {
      window.open('https://www.africau.edu/images/default/sample.pdf', '_blank');
    }
  };

  // Hook para detectar si es móvil
  const isMobile = window.innerWidth < 768;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-3 sm:p-6 font-sans text-gray-800 flex flex-col items-center relative overflow-hidden">
      {/* Título responsivo */}
      <h1 className="text-3xl sm:text-5xl font-extrabold mb-4 sm:mb-8 text-purple-700 drop-shadow-lg text-center">
        FEEDBACK
      </h1>

      {/* Sección de Puntos Totales - Responsive */}
      <div className="bg-gradient-to-r from-purple-100 to-indigo-100 border-2 border-purple-200 rounded-xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-8 flex items-center justify-center space-x-3 w-full max-w-sm">
        <Star className="w-8 h-8 sm:w-12 sm:h-12 text-yellow-500 drop-shadow-lg" fill="currentColor" />
        <div className="text-center">
          <p className="text-base sm:text-xl font-semibold text-purple-700">Puntos Totales:</p>
          <p className="text-2xl sm:text-4xl font-bold text-purple-800 drop-shadow-lg">{totalPoints} pts</p>
        </div>
      </div>

      {/* Animación de confeti y felicitaciones */}
      {showConfetti && (
        <>
          {/* Overlay sutil */}
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm pointer-events-none z-40"></div>
          <div className="fixed inset-0 pointer-events-none overflow-hidden z-40">
            {/* Confeti: menos cantidad y sin sombra en móvil */}
            {Array.from({ length: isMobile ? 80 : 400 }).map((_, i) => {
              const size = 6 + Math.random() * 18;
              const left = Math.random() * 100;
              const delay = Math.random() * 2.5;
              const duration = 5 + Math.random() * 4;
              const rotate = Math.random() * 360;
              const skew = Math.random() * 40 - 20;
              const borderRadius = Math.random() > 0.5 ? '50%' : '20%';
              const colors = [
                'bg-red-400', 'bg-blue-400', 'bg-green-400',
                'bg-yellow-400', 'bg-purple-400', 'bg-pink-400',
                'bg-orange-400', 'bg-cyan-400', 'bg-lime-400'
              ];
              return (
                <div
                  key={i}
                  className={`absolute ${!isMobile ? 'shadow-md' : ''} ${colors[i % colors.length]} opacity-80`}
                  style={{
                    width: `${size}px`,
                    height: `${size * (0.7 + Math.random() * 0.6)}px`,
                    left: `${left}%`,
                    top: 0,
                    zIndex: 41,
                    borderRadius,
                    transform: `rotate(${rotate}deg) skew(${skew}deg)`,
                    animation: `fallConfetti ${duration}s linear ${delay}s forwards`
                  }}
                />
              );
            })}
            {/* Keyframes para caída de confeti */}
            <style>
              {`
                @keyframes fallConfetti {
                  0% { top: 0; opacity: 1; }
                  80% { opacity: 1; }
                  100% { top: 100vh; opacity: 0; }
                }
              `}
            </style>
            {/* Mensaje motivacional y felicitación */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 flex flex-col items-center text-center">
              <div className="relative flex items-center justify-center">
                <Sparkles className="w-28 h-28 sm:w-44 sm:h-44 text-yellow-300 animate-pulse drop-shadow-xl" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-2xl sm:text-5xl px-7 py-4 sm:px-12 sm:py-6 rounded-2xl shadow-2xl border-4 border-yellow-200 animate-bounce">
                    +{confettiScore} puntos
                  </div>
                </div>
              </div>
              <p className="mt-4 text-2xl sm:text-4xl font-extrabold text-purple-700 drop-shadow-2xl">
                {motivationalWord}
              </p>
              <p className="mt-2 text-xl sm:text-3xl font-extrabold text-white drop-shadow-2xl">
                ¡Felicidades, trabajo excelente!
              </p>
            </div>
          </div>
          {/* Sonido de celebración (opcional, descomenta si quieres usarlo y tienes un archivo .mp3 en public/) */}
          {/* <audio autoPlay src="/celebration.mp3" /> */}
        </>
      )}

      {/* Dropdown personalizado para filtro de mes */}
      <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full max-w-md">
        <label className="text-sm sm:text-lg font-medium text-purple-700 drop-shadow-sm text-center sm:text-left">
          Feedback del mes:
        </label>
        <div className="relative w-full sm:w-auto">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full sm:min-w-[200px] p-3 pr-10 rounded-lg bg-white border-2 border-purple-200 text-purple-700 shadow-lg focus:ring-2 focus:ring-purple-400 focus:outline-none focus:border-purple-400 flex items-center justify-between"
          >
            <span className="truncate">{getSelectedMonthName()}</span>
            <ChevronDown className={`w-5 h-5 text-purple-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {isDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border-2 border-purple-200 rounded-lg shadow-xl z-30 max-h-48 overflow-y-auto">
              <div
                onClick={() => handleMonthSelect('all', 'Todos los meses')}
                className="px-4 py-3 hover:bg-purple-50 cursor-pointer text-purple-700 border-b border-purple-100"
              >
                Todos los meses
              </div>
              {months.map((month, index) => (
                <div
                  key={index}
                  onClick={() => handleMonthSelect(index.toString(), month)}
                  className="px-4 py-3 hover:bg-purple-50 cursor-pointer text-purple-700 border-b border-purple-100 last:border-b-0"
                >
                  {month}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Vista de escritorio - Tabla */}
      <div className="hidden lg:block bg-purple-100 bg-opacity-70 backdrop-blur-sm border-2 border-purple-300 rounded-2xl shadow-xl overflow-hidden w-full max-w-6xl">
        <table className="min-w-full">
          <thead className="bg-gradient-to-r from-purple-500 to-indigo-600">
            <tr>
              <th scope="col" className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">No.</th>
              <th scope="col" className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">Nombre de la tarea</th>
              <th scope="col" className="px-6 py-4 text-center text-sm font-bold text-white uppercase tracking-wider">Cargar mi actividad</th>
              <th scope="col" className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">Fecha de entrega</th>
              <th scope="col" className="px-6 py-4 text-center text-sm font-bold text-white uppercase tracking-wider">Visualizar</th>
              <th scope="col" className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">Entregado</th>
              <th scope="col" className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">Puntaje</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-purple-300 bg-purple-100 bg-opacity-50">
            {filteredTasks.length > 0 ? (
              filteredTasks.map((task, index) => (
                <tr key={task.id} className="hover:bg-purple-200 hover:bg-opacity-70 transition-all duration-200">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-purple-700">{index + 1}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 font-medium">{task.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm flex justify-center items-center">
                    {task.isSubmitted && isWithinDeadline(task.dueDate) ? (
                      <button
                        onClick={() => openModal(task)}
                        className="flex items-center px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-300"
                      >
                        <Upload className="w-5 h-5 mr-2" />
                        Gestionar Entrega
                      </button>
                    ) : (
                      <button
                        onClick={() => openModal(task)}
                        disabled={task.isSubmitted && !isWithinDeadline(task.dueDate)}
                        className={`flex items-center px-4 py-2 rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 ${
                          task.isSubmitted && !isWithinDeadline(task.dueDate)
                            ? 'bg-gray-400 cursor-not-allowed text-white'
                            : 'bg-blue-500 hover:bg-blue-600 text-white focus:ring-blue-300'
                        }`}
                      >
                        <Upload className="w-5 h-5 mr-2" />
                        Subir Tarea
                      </button>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                    {new Date(task.dueDate).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm flex justify-center items-center">
                    <button
                      onClick={() => openViewTaskModal(task)}
                      disabled={!task.submittedPdf}
                      className={`p-3 rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 ${
                        task.submittedPdf
                          ? 'bg-green-500 hover:bg-green-600 text-white focus:ring-green-300'
                          : 'bg-gray-400 cursor-not-allowed text-white'
                      }`}
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex justify-center">
                      {task.isSubmitted ? (
                        <CheckCircle className="w-7 h-7 text-green-500 drop-shadow-lg" />
                      ) : (
                        <XCircle className="w-7 h-7 text-red-500 drop-shadow-lg" />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-700 font-semibold">
                    {task.score !== null ? `${task.score} pts` : '-'}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="px-6 py-8 text-center text-gray-600 text-lg font-medium">
                  No hay tareas para el mes seleccionado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Vista móvil - Cards en 2 columnas */}
      <div className="lg:hidden w-full max-w-4xl">
        {filteredTasks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredTasks.map((task, index) => (
              <div
                key={task.id}
                className="relative bg-gradient-to-br from-purple-100 via-indigo-100 to-white border-2 border-purple-200 rounded-3xl shadow-2xl p-6 flex flex-col gap-3 transition-transform duration-200 hover:scale-[1.03] hover:shadow-purple-300/60"
              >
                {/* Badge de estado */}
                <span className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold shadow-md z-10 ${task.isSubmitted ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-red-100 text-red-600 border border-red-300'}`}>
                  {task.isSubmitted ? 'Entregado' : 'Pendiente'}
                </span>
                {/* Header */}
                <div className="flex items-center gap-3 mb-1">
                  <span className="bg-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">#{index + 1}</span>
                  <h3 className="font-extrabold text-purple-800 text-lg flex-1 leading-tight">{task.name}</h3>
                </div>
                {/* Puntaje */}
                <div className="flex items-center gap-2 mb-1">
                  <Star className="w-5 h-5 text-yellow-400 drop-shadow" fill="currentColor" />
                  <span className="text-lg font-bold text-purple-700">{task.score !== null ? `${task.score} pts` : '-'}</span>
                </div>
                {/* Fecha de entrega */}
                <div className="flex items-center gap-2 text-xs text-gray-600 font-medium mb-2">
                  <span className="bg-purple-200 text-purple-700 px-2 py-1 rounded-lg">Entrega:</span>
                  <span className="text-gray-700">{new Date(task.dueDate).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}</span>
                </div>
                {/* Estado visual */}
                <div className="flex items-center gap-2 mb-2">
                  {task.isSubmitted ? (
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-500" />
                  )}
                  <span className={`font-semibold text-sm ${task.isSubmitted ? 'text-green-600' : 'text-red-500'}`}>{task.isSubmitted ? '¡Entregado!' : 'Sin entregar'}</span>
                </div>
                {/* Botones de acción */}
                <div className="flex gap-2 mt-auto">
                  {task.isSubmitted && isWithinDeadline(task.dueDate) ? (
                    <button
                      onClick={() => openModal(task)}
                      className="flex-1 flex items-center justify-center px-3 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg shadow-md transition-all duration-200 text-xs font-semibold gap-1"
                    >
                      <Upload className="w-4 h-4" />
                      Gestionar
                    </button>
                  ) : (
                    <button
                      onClick={() => openModal(task)}
                      disabled={task.isSubmitted && !isWithinDeadline(task.dueDate)}
                      className={`flex-1 flex items-center justify-center px-3 py-2 rounded-lg shadow-md transition-all duration-200 text-xs font-semibold gap-1 ${
                        task.isSubmitted && !isWithinDeadline(task.dueDate)
                          ? 'bg-gray-400 cursor-not-allowed text-white'
                          : 'bg-blue-500 hover:bg-blue-600 text-white'
                      }`}
                    >
                      <Upload className="w-4 h-4" />
                      Subir
                    </button>
                  )}
                  <button
                    onClick={() => openViewTaskModal(task)}
                    disabled={!task.submittedPdf}
                    className={`flex items-center justify-center px-3 py-2 rounded-lg shadow-md transition-all duration-200 text-xs font-semibold ${
                      task.submittedPdf
                        ? 'bg-green-500 hover:bg-green-600 text-white'
                        : 'bg-gray-400 cursor-not-allowed text-white'
                    }`}
                  >
                    <Eye className="w-4 h-4" />
                    Ver
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white border-2 border-purple-200 rounded-xl shadow-lg p-8 text-center">
            <p className="text-gray-600 text-base font-medium">
              No hay tareas para el mes seleccionado.
            </p>
          </div>
        )}
      </div>

      {/* Modal para Subir/Cancelar */}
      {showModal && selectedTask && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-2xl max-w-md w-full transform transition-all duration-300 scale-100 border-2 border-purple-200">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 text-purple-700">
              {selectedTask.isSubmitted ? 'Gestionar Entrega' : 'Subir Tarea'}
            </h2>
            <p className="mb-6 text-gray-700 text-sm sm:text-base">
              Tarea: <span className="font-semibold text-purple-600">{selectedTask.name}</span>
            </p>

            {selectedTask.isSubmitted ? (
              <>
                <p className="mb-4 text-gray-700 text-sm sm:text-base">Ya has subido un archivo. ¿Deseas cancelarlo o subir uno nuevo?</p>
                <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4">
                  <button
                    onClick={() => handleCancelSubmission(selectedTask.id)}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-300 text-sm"
                  >
                    Cancelar Entrega
                  </button>
                  <label className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm cursor-pointer">
                    Subir Nuevo PDF
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleFileUpload(selectedTask.id, e.target.files[0]);
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                </div>
              </>
            ) : (
              <>
                <p className="mb-4 text-gray-700 text-sm sm:text-base">Por favor, sube tu tarea en formato PDF.</p>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileUpload(selectedTask.id, e.target.files[0]);
                    }
                  }}
                  className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-100 file:text-purple-700 hover:file:bg-purple-200 file:shadow-md mb-4"
                />
                <div className="flex justify-end">
                  <button
                    onClick={closeModal}
                    className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-300 text-sm"
                  >
                    Cerrar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Modal de visualización de tarea */}
      {showViewTaskModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-2xl max-w-md w-full transform transition-all duration-300 scale-100 border-2 border-purple-200 flex flex-col"
               style={{ maxHeight: '70vh' }}>
            <h2 className="text-xl sm:text-2xl font-bold mb-4 text-purple-700">Visualizar Tarea</h2>
            <p className="mb-4 text-gray-700 text-sm sm:text-base">
              Tarea: <span className="font-semibold text-purple-600">{viewingTaskName}</span>
            </p>
            {viewingTaskPdf ? (
              <>
                {isMobile ? (
                  <>
                    <div className="flex-grow w-full h-40 bg-gray-100 rounded-lg overflow-hidden mb-4 border border-gray-300 flex items-center justify-center">
                      <span className="text-gray-500 text-center text-xs px-2">Vista previa no soportada en móvil. Usa el botón para abrir el PDF en una nueva pestaña.</span>
                    </div>
                  </>
                ) : (
                  <div className="flex-grow w-full h-64 sm:h-96 bg-gray-100 rounded-lg overflow-hidden mb-4 border border-gray-300">
                    <iframe
                      src={viewingTaskPdf}
                      title="Visor de PDF"
                      className="w-full h-full border-none"
                      style={{ minHeight: '100%' }}
                    >
                      Este navegador no soporta la visualización de PDFs. Puedes descargarlo aquí.
                    </iframe>
                  </div>
                )}
                <p className="text-xs sm:text-sm text-gray-600 text-center mb-4">
                  (Simulación: En una aplicación real, aquí se cargaría el PDF subido por el alumno desde el backend.)
                </p>
              </>
            ) : (
              <p className="mb-6 text-gray-700 text-sm sm:text-base text-center">
                No hay archivo subido para visualizar.
              </p>
            )}
            <div className="flex flex-col sm:flex-row justify-end gap-2 mt-auto">
              {viewingTaskPdf && (
                <button
                  onClick={handleOpenPdfInNewTab}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm"
                >
                  Ver en nueva pestaña
                </button>
              )}
              <button
                onClick={closeViewTaskModal}
                className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-300 text-sm"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Overlay para cerrar dropdown */}
      {isDropdownOpen && (
        <div
          className="fixed inset-0 z-20"
          onClick={() => setIsDropdownOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default Feedback_Alumno_Comp;