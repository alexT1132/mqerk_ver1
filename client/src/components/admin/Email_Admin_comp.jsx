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
import React, { useState, useEffect, useRef } from 'react';
import { useAdminContext } from '../../context/AdminContext.jsx';
import { getAdminEmails, sendAdminEmail, markEmailRead } from '../../api/emails';
import { getGmailAuthUrl, listGmailInbox, sendGmail, getGmailStatus, getGmailEnvCheck } from '../../api/gmail';

function Email_Admin_comp() {
  const [emails, setEmails] = useState([]);
  const [emailSeleccionado, setEmailSeleccionado] = useState(null);
  const [vistaActual, setVistaActual] = useState('bandeja'); // 'bandeja', 'redactar', 'enviados'
  const [loadingEmails, setLoadingEmails] = useState(false);
  const [isGmailFetching, setIsGmailFetching] = useState(false);
  const [nuevoEmail, setNuevoEmail] = useState({
    para: '',
    asunto: '',
    mensaje: '',
    tipo: 'individual' // 'individual', 'group', 'all'
  });
  const [query, setQuery] = useState('');

  const { 
    isLoading,
    error,
    lastUpdated
  } = useAdminContext();

  // Estado de vinculación de Gmail
  const [gmailLinked, setGmailLinked] = useState(false);
  const [gmailEmail, setGmailEmail] = useState(null);
  const [isLinking, setIsLinking] = useState(false);
  const linkPollRef = useRef(null);

  // Toast muy ligero en-local
  const [toast, setToast] = useState(null); // { msg, type: 'info'|'success'|'error' }
  const notify = (msg, type = 'info') => {
    setToast({ msg, type });
    window.clearTimeout(notify._t);
    notify._t = window.setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const check = async () => {
      try {
        const st = await getGmailStatus();
        setGmailLinked(!!st?.linked);
        setGmailEmail(st?.email || null);
      } catch {}
    };
    check();
  }, []);

  const handleLinkGmail = async () => {
    try {
      setIsLinking(true);
      // Pre-chequeo de configuración del servidor para evitar errores invalid_client
      const env = await getGmailEnvCheck();
      if (!env?.ok || !env?.hasId || !env?.hasSecret) {
        alert(
          'Gmail no está configurado en el servidor. Falta GOOGLE_CLIENT_ID o GOOGLE_CLIENT_SECRET.\n' +
          'Pídele al administrador que configure el .env del servidor y lo reinicie.'
        );
        return;
      }
      const url = await getGmailAuthUrl();
      if (url) {
        notify('Abriendo ventana de Google para vincular tu cuenta…', 'info');
        // Abrir y comenzar un polling corto para reflejar estado
        window.open(url, '_blank');
        if (linkPollRef.current) window.clearInterval(linkPollRef.current);
        let attempts = 0;
        linkPollRef.current = window.setInterval(async () => {
          attempts += 1;
          try {
            const st = await getGmailStatus();
            if (st?.linked) {
              setGmailLinked(true);
              setGmailEmail(st?.email || null);
              notify('Gmail vinculado correctamente.', 'success');
              window.clearInterval(linkPollRef.current);
              linkPollRef.current = null;
            }
          } catch {}
          if (attempts > 40) { // ~2 minutos si 3s
            window.clearInterval(linkPollRef.current);
            linkPollRef.current = null;
          }
        }, 3000);
      }
    } catch (e) { console.error(e); notify('No se pudo iniciar la vinculación', 'error'); }
    finally { setIsLinking(false); }
  };

  // Transformar del backend a la forma de UI
  const mapEmail = (e) => ({
    id: e.id,
    de: e.de,
    para: e.para,
    asunto: e.asunto,
    mensaje: e.mensaje,
    fecha: e.fecha,
    leido: !!e.leido,
    tipo: e.tipo === 'sent' ? 'enviado' : (e.tipo === 'inbox' ? 'recibido' : e.tipo),
    etiqueta: e.etiqueta || 'general'
  });

  // Cargar emails desde backend según vista
  useEffect(() => {
    const load = async () => {
      if (vistaActual !== 'bandeja' && vistaActual !== 'enviados') return;
      setLoadingEmails(true);
      try {
        const folder = vistaActual === 'bandeja' ? 'inbox' : 'sent';
        const data = await getAdminEmails(folder);
        setEmails((data || []).map(mapEmail));
      } catch (e) {
        console.error('Error cargando emails', e);
      } finally {
        setLoadingEmails(false);
      }
    };
    load();
  }, [vistaActual]);

  const matches = (e) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      (e.de || '').toLowerCase().includes(q) ||
      (e.para || '').toLowerCase().includes(q) ||
      (e.asunto || '').toLowerCase().includes(q) ||
      (e.mensaje || '').toLowerCase().includes(q)
    );
  };
  const emailsRecibidos = emails.filter(email => email.tipo === 'recibido').filter(matches);
  const emailsEnviados = emails.filter(email => email.tipo === 'enviado').filter(matches);
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

  const handleMarcarComoLeido = async (id) => {
    try {
      await markEmailRead(id);
      setEmails((prev) => prev.map(email => email.id === id ? { ...email, leido: true } : email));
    } catch (e) {
      console.error('No se pudo marcar como leído', e);
    }
  };

  const handleEnviarEmail = async () => {
    if (nuevoEmail.tipo !== 'individual') {
      alert('Por ahora el envío soportado es individual.');
      return;
    }
    if (!nuevoEmail.para || !nuevoEmail.asunto || !nuevoEmail.mensaje) return;
    try {
      const saved = await sendAdminEmail({
        recipient: nuevoEmail.para,
        subject: nuevoEmail.asunto,
        body: nuevoEmail.mensaje,
        etiqueta: 'general'
      });
      if (saved) {
        // Ir a enviados y recargar
        setNuevoEmail({ para: '', asunto: '', mensaje: '', tipo: 'individual' });
        setVistaActual('enviados');
      }
    } catch (e) {
      console.error('No se pudo enviar el email', e);
    }
  };

  const Spinner = ({size='h-5 w-5'}) => (
    <span className={`inline-block animate-spin rounded-full border-2 border-b-transparent border-current ${size}`} />
  );

  return (
    <div className="px-6 pt-6 xs:pt-8 sm:pt-10 md:pt-12 pb-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Toast */}
        {toast && (
          <div className={`mb-4 rounded-md p-3 text-sm transition-all ${toast.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : toast.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-blue-50 text-blue-700 border border-blue-200'}`}>
            {toast.msg}
          </div>
        )}
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gestión de Email</h1>
              <p className="mt-1 text-sm text-gray-500">
                Administra la comunicación con estudiantes y personal
              </p>
            </div>
            <div className="mt-4 sm:mt-0 flex items-center gap-3">
              {!gmailLinked ? (
                <button
                  type="button"
                  onClick={handleLinkGmail}
                  disabled={isLinking}
                  className={`inline-flex items-center gap-2 px-3 py-2 border text-sm rounded-md transition-colors ${isLinking ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' : 'text-gray-700 bg-white border-gray-300 hover:bg-gray-50'}`}
                >
                  {isLinking && <Spinner size="h-4 w-4" />} Vincular Gmail
                </button>
              ) : (
                <span className="text-sm text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded">Gmail vinculado{gmailEmail ? ` (${gmailEmail})` : ''}</span>
              )}
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
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">
                    Bandeja de Entrada ({emailsRecibidos.length})
                  </h3>
                  <div className="flex items-center gap-3">
                    <div className="hidden sm:block">
                      <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Buscar…"
                        className="text-sm px-3 py-1.5 rounded border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    {!gmailLinked && (
                      <button
                        onClick={handleLinkGmail}
                        className="text-sm text-gray-700 border border-gray-300 rounded px-2 py-1 hover:bg-gray-50"
                      >
                        Vincular Gmail
                      </button>
                    )}
                    <button
                      onClick={async () => {
                        try {
                          setIsGmailFetching(true);
                          const list = await listGmailInbox();
                          setEmails(list.map(e => ({ ...e })));
                          notify('Correos cargados desde Gmail', 'success');
                        } catch (e) {
                          const status = e?.response?.status;
                          const msg = e?.response?.data?.message || e?.message || 'No se pudo cargar Gmail';
                          console.error('Gmail inbox error', status, msg);
                          if (status === 401 || status === 403) notify('Sesión o vinculación de Gmail no autorizada o expirada. Vuelve a vincular.', 'error');
                          else if (status === 400) notify(msg, 'error');
                          else notify('No se pudo cargar Gmail', 'error');
                        } finally { setIsGmailFetching(false); }
                      }}
                      disabled={!gmailLinked || isGmailFetching}
                      className={`inline-flex items-center gap-2 text-sm ${!gmailLinked || isGmailFetching ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:text-blue-700'}`}
                    >
                      {isGmailFetching && <Spinner size="h-4 w-4" />} Cargar desde Gmail
                    </button>
                  </div>
                </div>
                {emailsRecibidos.length === 0 && (
                  <div className="px-6 py-8 text-sm text-gray-500 flex flex-col items-center gap-2">
                    <div className="text-4xl">📭</div>
                    {query ? (
                      <span>No hay resultados para “{query}”.</span>
                    ) : (
                      <span>No hay correos para mostrar{!gmailLinked ? ' · Vincula Gmail y luego pulsa “Cargar desde Gmail”.' : ''}</span>
                    )}
                  </div>
                )}
                
                <div className="divide-y divide-gray-200">
      {emailsRecibidos.map((email) => (
                    <div 
                      key={email.id}
                      onClick={() => {
                        setEmailSeleccionado(email);
        // Evitar marcar en DB cuando es un correo cargado desde Gmail
        if (!email.leido && email.etiqueta !== 'gmail') handleMarcarComoLeido(email.id);
                      }}
                      className="p-6 bg-white cursor-pointer border-l-4 border-transparent hover:border-blue-200 transition-all hover:shadow-sm"
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
                      onClick={async () => { await handleEnviarEmail(); notify('Email enviado', 'success'); }}
                      className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-60"
                    >
                      Enviar Email
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        if (!nuevoEmail.para || !nuevoEmail.asunto || !nuevoEmail.mensaje) return;
                        try {
                          await sendGmail({ to: nuevoEmail.para, subject: nuevoEmail.asunto, text: nuevoEmail.mensaje });
                          setNuevoEmail({ para: '', asunto: '', mensaje: '', tipo: 'individual' });
                          setVistaActual('enviados');
                          notify('Enviado con Gmail', 'success');
                        } catch (e) { console.error(e); }
                      }}
                      disabled={!gmailLinked}
                      title={!gmailLinked ? 'Vincula tu Gmail para usar este botón' : ''}
                      className={`px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2 ${gmailLinked ? 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500' : 'bg-emerald-400 cursor-not-allowed'}`}
                    >
                      Enviar con Gmail
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