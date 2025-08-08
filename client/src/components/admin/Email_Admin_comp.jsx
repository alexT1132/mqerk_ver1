/**
 * Componente Admin de Email
 * 
 * Interfaz de gestión de emails para administradores para comunicación con estudiantes y personal.
 * APIs de Backend a implementar:
 * - GET /api/admin/emails?folder={inbox|sent|drafts} - Obtener emails por carpeta
 * - POST /api/admin/emails/send - Enviar nuevo email
 * - PUT /api/admin/emails/{id}/read - Marcar email como leído
 * - DELETE /api/admin/emails/{id} - Eliminar email
 */
import React, { useState, useEffect } from 'react';
import { useAdminContext } from '../../context/AdminContext.jsx';

function Email_Admin_comp() {
  const [emails, setEmails] = useState([]);
  const [emailSeleccionado, setEmailSeleccionado] = useState(null);
  const [vistaActual, setVistaActual] = useState('bandeja'); // 'bandeja', 'redactar', 'enviados'
  const [nuevoEmail, setNuevoEmail] = useState({
    para: '',
    asunto: '',
    mensaje: '',
    tipo: 'individual' // 'individual', 'group', 'all'
  });

  const { 
    isLoading,
    error,
    lastUpdated
  } = useAdminContext();

  // Datos de ejemplo (esto vendrá del backend)
  useEffect(() => {
    setTimeout(() => {
      setEmails([
        {
          id: 1,
          de: 'juan.perez@email.com',
          para: 'admin@mqerk.com',
          asunto: 'Schedule inquiry',
          mensaje: 'Hello, I would like to know if it is possible to change my Tuesday morning class schedule.',
          fecha: '2024-12-21 10:30',
          leido: false,
          tipo: 'recibido',
          etiqueta: 'consulta'
        },
        {
          id: 2,
          de: 'maria.gonzalez@email.com',
          para: 'admin@mqerk.com',
          asunto: 'Payment issue',
          mensaje: 'Good morning, I made my payment but it is not reflected in my account. Could you help me?',
          fecha: '2024-12-20 15:45',
          leido: true,
          tipo: 'recibido',
          etiqueta: 'pago'
        },
        {
          id: 3,
          de: 'admin@mqerk.com',
          para: 'carlos.rodriguez@email.com',
          asunto: 'Registration confirmation',
          mensaje: 'Hello Carlos, we confirm your enrollment in the Advanced English course. Classes start next Monday.',
          fecha: '2024-12-20 09:15',
          leido: true,
          tipo: 'enviado',
          etiqueta: 'confirmacion'
        },
        {
          id: 4,
          de: 'ana.hernandez@email.com',
          para: 'admin@mqerk.com',
          asunto: 'Certificado de finalización',
          mensaje: 'Hola, he completado mi curso de Inglés Intermedio. ¿Cuándo podré obtener mi certificado?',
          fecha: '2024-12-19 14:20',
          leido: false,
          tipo: 'recibido',
          etiqueta: 'certificado'
        },
        {
          id: 5,
          de: 'admin@mqerk.com',
          para: 'todos@mqerk.com',
          asunto: 'Horarios de vacaciones diciembre',
          mensaje: 'Estimados estudiantes, les informamos los horarios especiales para el período vacacional de diciembre.',
          fecha: '2024-12-18 11:00',
          leido: true,
          tipo: 'enviado',
          etiqueta: 'general'
        }
      ]);
      // Los datos se cargan desde el contexto AdminContext
    }, 1000);
  }, []);

  const emailsRecibidos = emails.filter(email => email.tipo === 'recibido');
  const emailsEnviados = emails.filter(email => email.tipo === 'enviado');
  const emailsNoLeidos = emailsRecibidos.filter(email => !email.leido);

  const getEtiquetaColor = (etiqueta) => {
    switch(etiqueta) {
      case 'consulta': return 'bg-blue-100 text-blue-800';
      case 'pago': return 'bg-yellow-100 text-yellow-800';
      case 'confirmacion': return 'bg-green-100 text-green-800';
      case 'certificado': return 'bg-purple-100 text-purple-800';
      case 'general': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleMarcarComoLeido = (id) => {
    setEmails(emails.map(email => 
      email.id === id ? { ...email, leido: true } : email
    ));
  };

  const handleEnviarEmail = () => {
    const nuevoEmailObj = {
      id: Date.now(),
      de: 'admin@mqerk.com',
      para: nuevoEmail.para,
      asunto: nuevoEmail.asunto,
      mensaje: nuevoEmail.mensaje,
      fecha: new Date().toISOString().replace('T', ' ').slice(0, 16),
      leido: true,
      tipo: 'enviado',
      etiqueta: 'general'
    };

    setEmails([...emails, nuevoEmailObj]);
    setNuevoEmail({ para: '', asunto: '', mensaje: '', tipo: 'individual' });
    setVistaActual('bandeja');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gestión de Email</h1>
              <p className="mt-1 text-sm text-gray-500">
                Administra la comunicación con estudiantes y personal
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <button 
                onClick={() => setVistaActual('redactar')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                + Redactar Email
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="space-y-2">
                <button 
                  onClick={() => setVistaActual('bandeja')}
                  className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                    vistaActual === 'bandeja' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>Bandeja de Entrada</span>
                    {emailsNoLeidos.length > 0 && (
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        {emailsNoLeidos.length}
                      </span>
                    )}
                  </div>
                </button>
                
                <button 
                  onClick={() => setVistaActual('enviados')}
                  className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                    vistaActual === 'enviados' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Emails Enviados
                </button>
                
                <button 
                  onClick={() => setVistaActual('redactar')}
                  className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                    vistaActual === 'redactar' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Redactar Email
                </button>
              </div>

              {/* Estadísticas rápidas */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Estadísticas</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">No leídos</span>
                    <span className="font-medium text-red-600">{emailsNoLeidos.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Recibidos hoy</span>
                    <span className="font-medium text-gray-900">2</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Enviados hoy</span>
                    <span className="font-medium text-gray-900">1</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contenido principal */}
          <div className="lg:col-span-3">
            {/* Vista de Bandeja de Entrada */}
            {vistaActual === 'bandeja' && (
              <div className="bg-white rounded-lg shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">
                    Bandeja de Entrada ({emailsRecibidos.length})
                  </h3>
                </div>
                
                <div className="divide-y divide-gray-200">
                  {emailsRecibidos.map((email) => (
                    <div 
                      key={email.id}
                      onClick={() => {
                        setEmailSeleccionado(email);
                        if (!email.leido) handleMarcarComoLeido(email.id);
                      }}
                      className="p-6 bg-white hover:bg-white cursor-pointer border-l-4 border-transparent hover:border-blue-200 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-2">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {email.de}
                            </p>
                            {!email.leido && (
                              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                            )}
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEtiquetaColor(email.etiqueta)}`}>
                              {email.etiqueta}
                            </span>
                          </div>
                          <p className="text-sm font-medium text-gray-900 mb-1">
                            {email.asunto}
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            {email.mensaje}
                          </p>
                        </div>
                        <div className="ml-4 flex-shrink-0">
                          <p className="text-xs text-gray-500">
                            {email.fecha}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Vista de Emails Enviados */}
            {vistaActual === 'enviados' && (
              <div className="bg-white rounded-lg shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">
                    Emails Enviados ({emailsEnviados.length})
                  </h3>
                </div>
                
                <div className="divide-y divide-gray-200">
                  {emailsEnviados.map((email) => (
                    <div 
                      key={email.id}
                      onClick={() => setEmailSeleccionado(email)}
                      className="p-6 bg-white hover:bg-white cursor-pointer border-l-4 border-transparent hover:border-blue-200 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-2">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              Para: {email.para}
                            </p>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEtiquetaColor(email.etiqueta)}`}>
                              {email.etiqueta}
                            </span>
                          </div>
                          <p className="text-sm font-medium text-gray-900 mb-1">
                            {email.asunto}
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            {email.mensaje}
                          </p>
                        </div>
                        <div className="ml-4 flex-shrink-0">
                          <p className="text-xs text-gray-500">
                            {email.fecha}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Vista de Redactar Email */}
            {vistaActual === 'redactar' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-6">Redactar Nuevo Email</h3>
                
                <form className="space-y-4">
                  <div>
                    <label htmlFor="tipo" className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo de envío
                    </label>
                    <select
                      id="tipo"
                      value={nuevoEmail.tipo}
                      onChange={(e) => setNuevoEmail({...nuevoEmail, tipo: e.target.value})}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="individual">Individual</option>
                      <option value="grupo">Grupo de estudiantes</option>
                      <option value="todos">Todos los estudiantes</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="para" className="block text-sm font-medium text-gray-700 mb-2">
                      Para
                    </label>
                    <input
                      type="email"
                      id="para"
                      value={nuevoEmail.para}
                      onChange={(e) => setNuevoEmail({...nuevoEmail, para: e.target.value})}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="ejemplo@email.com"
                      disabled={nuevoEmail.tipo !== 'individual'}
                    />
                    {nuevoEmail.tipo === 'todos' && (
                      <p className="mt-1 text-sm text-gray-500">
                        Se enviará a todos los estudiantes registrados
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="asunto" className="block text-sm font-medium text-gray-700 mb-2">
                      Asunto
                    </label>
                    <input
                      type="text"
                      id="asunto"
                      value={nuevoEmail.asunto}
                      onChange={(e) => setNuevoEmail({...nuevoEmail, asunto: e.target.value})}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Asunto del mensaje"
                    />
                  </div>

                  <div>
                    <label htmlFor="mensaje" className="block text-sm font-medium text-gray-700 mb-2">
                      Mensaje
                    </label>
                    <textarea
                      id="mensaje"
                      rows={8}
                      value={nuevoEmail.mensaje}
                      onChange={(e) => setNuevoEmail({...nuevoEmail, mensaje: e.target.value})}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Escribe tu mensaje aquí..."
                    />
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setVistaActual('bandeja')}
                      className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleEnviarEmail}
                      className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Enviar Email
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>

        {/* Modal de detalle de email */}
        {emailSeleccionado && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-2/3 max-w-4xl shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {emailSeleccionado.asunto}
                  </h3>
                  <button 
                    onClick={() => setEmailSeleccionado(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                </div>
                
                <div className="border-b border-gray-200 pb-4 mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {emailSeleccionado.tipo === 'recibido' ? 'De:' : 'Para:'} {emailSeleccionado.tipo === 'recibido' ? emailSeleccionado.de : emailSeleccionado.para}
                      </p>
                      <p className="text-sm text-gray-500">
                        {emailSeleccionado.fecha}
                      </p>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEtiquetaColor(emailSeleccionado.etiqueta)}`}>
                      {emailSeleccionado.etiqueta}
                    </span>
                  </div>
                </div>
                
                <div className="mb-6">
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {emailSeleccionado.mensaje}
                  </p>
                </div>
                
                <div className="flex justify-end space-x-2">
                  <button 
                    onClick={() => setEmailSeleccionado(null)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    Cerrar
                  </button>
                  {emailSeleccionado.tipo === 'recibido' && (
                    <button 
                      onClick={() => {
                        setNuevoEmail({
                          ...nuevoEmail,
                          para: emailSeleccionado.de,
                          asunto: `Re: ${emailSeleccionado.asunto}`
                        });
                        setVistaActual('redactar');
                        setEmailSeleccionado(null);
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Responder
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
export default Email_Admin_comp;