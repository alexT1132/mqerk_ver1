import React, { useState, useEffect, useRef, useMemo } from 'react';
import { formatCurrencyMXN, formatDateTimeMX } from '../../utils/formatters.js';
import { useStudent } from '../../context/StudentContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useComprobante } from '../../context/ComprobantesContext.jsx';
import { generatePaymentSchedule as genScheduleShared, resolvePlanType as resolvePlanTypeShared, getActivationDate as getActivationDateShared } from '../../utils/payments.js';
import { 
  useStudentNotifications, 
  NOTIFICATION_TYPES, 
  NOTIFICATION_PRIORITIES 
} from '../../context/StudentNotificationContext.jsx';
import ComprobanteVirtual from '../shared/ComprobanteVirtual.jsx';

// Iconos SVG para los componentes de la interfaz
const Upload = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
  </svg>
);

const Calendar = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25m3 8.25a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 13.5V6.75a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 6.75v6.75z" />
  </svg>
);

const CheckCircle = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const Clock = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const XCircle = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const Eye = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const Download = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
  </svg>
);

const X = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

// Componentes de iconos para los métodos de pago disponibles
const IconoTarjeta = () => (
  <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-2 sm:mb-3">
    <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
      <path d="M20 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>
    </svg>
  </div>
);

const IconoTransferencia = () => (
  <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-2 sm:mb-3">
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 sm:w-7 sm:h-7 text-white">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h18M16.5 3L21 7.5m0 0L16.5 12M21 7.5H3" />
    </svg>
  </div>
);

const IconoEfectivo = () => (
  <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-2 sm:mb-3">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 sm:w-8 sm:h-8 text-white">
      <path d="M21 6H3c-1.1 0-2 .9-2 2v8a2 2 0 002 2h18a2 2 0 002-2V8a2 2 0 00-2-2zm0 10H3V8h18v8zM7 10h2v2H7v-2zm0 3h2v2H7v-2z" />
    </svg>
  </div>
);

// --- Componente reutilizable de subida de archivos ---
function FileUpload({ onFileSelect, acceptedTypes = 'image/*,application/pdf', maxSize = 10 }) {
  const fileInputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFileSelect = (file) => {
    if (!file) return;
    const sizeMB = file.size / 1024 / 1024;
    if (sizeMB > maxSize) {
      alert(`El archivo excede el tamaño máximo de ${maxSize}MB`);
      return;
    }
    onFileSelect && onFileSelect(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files || []);
    if (files.length > 0) handleFileSelect(files[0]);
  };
  const handleDragEnter = (e) => { e.preventDefault(); e.stopPropagation(); setDragOver(true); };
  const handleDragLeave = (e) => { e.preventDefault(); e.stopPropagation(); setDragOver(false); };
  const handleDragOver = (e) => { e.preventDefault(); e.stopPropagation(); };

  return (
    <div
      className={`border-2 ${dragOver ? 'border-blue-400 bg-blue-50' : 'border-dashed border-gray-300'} rounded-xl p-6 text-center cursor-pointer`}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
    >
      <div className="w-12 h-12 mx-auto mb-4 text-gray-400">
        <Upload />
      </div>
      <p className="text-gray-600 text-sm mb-2">
        <span className="font-semibold text-blue-600">Haz clic para subir</span> o arrastra tu archivo aquí
      </p>
      <p className="text-xs text-gray-400">
        JPG, PNG, PDF (máx. {maxSize}MB)
      </p>
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes}
        onChange={(e) => e.target.files[0] && handleFileSelect(e.target.files[0])}
        className="hidden"
      />
    </div>
  );
}

// --- Modal simple reutilizable ---
function Modal({ isOpen, onClose, children, title }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-x-0 top-20 bottom-4 z-[9999] flex items-center justify-center px-4 overflow-y-auto">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-auto my-auto max-h-[calc(100vh-10rem)] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white rounded-t-2xl">
          <h2 className="text-xl font-bold text-gray-800">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

// --- Componente de Tarjeta de Método de Pago ---
function PaymentMethodCard({ method, onClick }) {
  const [showComingSoon, setShowComingSoon] = useState(false);
  const methodColors = {
    'card': 'from-violet-500 to-purple-600',
    'transfer': 'from-blue-500 to-cyan-600',
    'cash': 'from-emerald-500 to-green-600',
  };

  const handleClick = () => {
    if (method.id === 'card') {
      setShowComingSoon(true);
      setTimeout(() => setShowComingSoon(false), 2200);
    } else {
      onClick(method.id);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`relative cursor-pointer bg-gradient-to-br ${methodColors[method.id]} 
      rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 ease-in-out
      p-3.5 md:p-5 flex flex-col items-center justify-center text-center min-h-[130px] md:min-h-[160px] group border border-gray-100`}
    >
      <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-2xl"></div>
  {method.icon}
  <h3 className="text-white text-[11px] sm:text-sm md:text-base font-bold mt-1 leading-tight relative z-10 px-1">
        {method.title}
      </h3>
  <p className="hidden sm:block text-white/80 text-xs mt-2 relative z-10">
        Haz clic para ver detalles
      </p>
      {method.id === 'card' && showComingSoon && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-purple-700/95 to-violet-900/95 rounded-2xl z-30 border-2 sm:border-4 border-yellow-400 shadow-2xl p-3 sm:p-5 gap-1.5 sm:gap-2"
          role="status" aria-live="polite"
        >
          <span className="text-yellow-300 text-base sm:text-xl font-extrabold mb-1 sm:mb-2 drop-shadow-lg text-center leading-tight px-1">
            ¡Muy pronto disponible!
          </span>
          <span className="text-white text-xs sm:text-base font-semibold text-center max-w-[220px] sm:max-w-xs leading-snug px-1">
            Estamos trabajando para ofrecerte pagos con tarjeta de forma segura y rápida. ¡Gracias por tu paciencia!
          </span>
        </div>
      )}
    </div>
  );
}

// --- Contenido del Modal para Pago con Tarjeta ---
function CardPaymentModal({ onReceiptUpload }) {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (file) => {
    setIsUploading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setUploadedFile({
        name: file.name,
        size: file.size,
        type: file.type,
        uploadDate: new Date()
      });
      onReceiptUpload('card', file);
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-violet-50 rounded-xl p-6">
        <h4 className="font-bold text-gray-800 mb-4 text-lg">¿Cómo funciona?</h4>
        <p className="text-gray-700 mb-4">
          Serás redirigido a una pasarela de pago segura donde podrás completar tu transacción con total seguridad.
        </p>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-violet-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">1</div>
            <p className="text-gray-700">Haz clic en el botón "Pagar con Tarjeta"</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-violet-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">2</div>
            <p className="text-gray-700">Ingresa los datos de tu tarjeta en la plataforma segura</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-violet-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">3</div>
            <p className="text-gray-700">Confirma el pago</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-violet-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">4</div>
            <p className="text-gray-700">Sube tu comprobante de pago para validación</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <a 
            href="#" 
            className="block w-full text-center py-4 bg-gradient-to-r from-violet-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-200 text-lg"
          >
            💳 Pagar con Tarjeta - $XXX MXN
          </a>
          <p className="text-xs text-gray-500 text-center mt-2">
            Procesamiento inmediato • 100% Seguro
          </p>
        </div>

        <div>
          <h4 className="font-bold text-gray-800 mb-3">📄 Subir Comprobante</h4>
          {!uploadedFile ? (
            <div>
              <FileUpload onFileSelect={handleFileUpload} />
              {isUploading && (
                <div className="mt-3 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-violet-600 mr-2"></div>
                  <span className="text-gray-600 text-sm">Subiendo...</span>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-gray-800 truncate">{uploadedFile.name}</p>
                    <p className="text-sm text-gray-600">
                      {(uploadedFile.size / 1024 / 1024).toFixed(1)} MB • Subido correctamente
                    </p>
                  </div>
                  <button
                    onClick={() => setUploadedFile(null)}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button className="flex-1 text-sm bg-blue-100 text-blue-700 py-2 rounded-lg hover:bg-blue-200 transition flex items-center justify-center gap-2">
                  <Eye className="w-4 h-4" />
                  Ver archivo
                </button>
                <button className="flex-1 text-sm bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition flex items-center justify-center gap-2">
                  <Download className="w-4 h-4" />
                  Descargar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// --- Contenido del Modal para Transferencia ---
function TransferPaymentModal({ onReceiptUpload }) {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState({ visible: false, target: '' });

  const bankInfo = {
    bank: 'BANCO: BANCOPPEL', // TODO: Reemplazar con banco real
    beneficiary: 'KELVIN VALENTIN GOMEZ RAMIREZ', // TODO: Verificar razón social correcta
    account: '4169 1608 5392 8977', // TODO: Reemplazar con número de cuenta real
    clabe: '137628103732170052'
    
  };

  const handleCopy = (text, fieldName) => {
    // Usar document.execCommand para compatibilidad en iframes
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    
    setCopiedMessage({ visible: true, target: fieldName });
    setTimeout(() => {
      setCopiedMessage({ visible: false, target: '' });
    }, 2000);
  };

  const handleFileUpload = async (file) => {
    setIsUploading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setUploadedFile({
        name: file.name,
        size: file.size,
        type: file.type,
        uploadDate: new Date()
      });
      onReceiptUpload('transfer', file);
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">

      <div className="bg-blue-50 rounded-xl p-6">
        <h4 className="font-bold text-blue-800 mb-4 text-lg">Datos Bancarios</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="text-xs text-blue-600 font-medium uppercase tracking-wide">Banco</label>
              <p className="font-bold text-lg">{bankInfo.bank}</p>
            </div>
            <div>
              <label className="text-xs text-blue-600 font-medium uppercase tracking-wide">Beneficiario</label>
              <p className="font-bold">{bankInfo.beneficiary}</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-blue-600 font-medium uppercase tracking-wide">Número de Cuenta</label>
              <div className="flex items-center gap-3">
                <span className="font-mono font-bold text-lg">{bankInfo.account}</span>
                <div className="relative">
                  <button 
                    onClick={() => handleCopy(bankInfo.account, 'account')} 
                    className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition"
                  >
                    📋 Copiar
                  </button>
                  {copiedMessage.visible && copiedMessage.target === 'account' && (
                    <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-green-600 text-white px-3 py-1 rounded-md shadow-lg text-xs animate-bounce border border-green-700 whitespace-nowrap font-bold z-10">
                      ¡Copiado!
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div>
              <label className="text-xs text-blue-600 font-medium uppercase tracking-wide">CLABE</label>
              <div className="flex items-center gap-3">
                <span className="font-mono font-bold text-lg">{bankInfo.clabe}</span>
                <div className="relative">
                  <button 
                    onClick={() => handleCopy(bankInfo.clabe, 'clabe')} 
                    className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition"
                  >
                    📋 Copiar
                  </button>
                  {copiedMessage.visible && copiedMessage.target === 'clabe' && (
                    <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-green-600 text-white px-3 py-1 rounded-md shadow-lg text-xs animate-bounce border border-green-700 whitespace-nowrap font-bold z-10">
                      ¡Copiado!
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-50 rounded-xl p-6">
          <h4 className="font-bold text-gray-800 mb-4">📋 Instrucciones</h4>
          <ol className="space-y-3 text-gray-700">
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">1</span>
              <span>Realiza una transferencia SPEI o depósito al número de cuenta/CLABE indicado.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">2</span>
              <span>Asegúrate de incluir tu nombre completo en la referencia o concepto de pago.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">3</span>
              <span>Sube tu comprobante de transferencia para validación rápida.</span>
            </li>
          </ol>
        </div>

        <div>
          <h4 className="font-bold text-gray-800 mb-3">📄 Subir Comprobante.</h4>
          {!uploadedFile ? (
            <div>
              <FileUpload onFileSelect={handleFileUpload} />
              {isUploading && (
                <div className="mt-3 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                  <span className="text-gray-600 text-sm">Subiendo...</span>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-gray-800 truncate">{uploadedFile.name}</p>
                    <p className="text-sm text-gray-600">
                      {(uploadedFile.size / 1024 / 1024).toFixed(1)} MB • Subido correctamente
                    </p>
                  </div>
                  <button
                    onClick={() => setUploadedFile(null)}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button className="flex-1 text-sm bg-blue-100 text-blue-700 py-2 rounded-lg hover:bg-blue-200 transition flex items-center justify-center gap-2">
                  <Eye className="w-4 h-4" />
                  Ver archivo
                </button>
                <button className="flex-1 text-sm bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition flex items-center justify-center gap-2">
                  <Download className="w-4 h-4" />
                  Descargar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// --- Contenido del Modal para Efectivo ---
function CashPaymentModal({ onReceiptUpload }) {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const locationInfo = {
    address: 'Calle Juárez entre Av. Independencia y 5 de Mayo, C.P. 68300. En altos de COMPUMAX, Tuxtepec, Oaxaca',
  hours: 'Horario: Lunes a Viernes, 9:00 a 17:00 h',
    contact: 'Tel: 287-151-5760'
  };

  // Link de Google Maps para la dirección
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locationInfo.address)}`;

  const handleFileUpload = async (file) => {
    setIsUploading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setUploadedFile({
        name: file.name,
        size: file.size,
        type: file.type,
        uploadDate: new Date()
      });
      onReceiptUpload('cash', file);
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-green-50 rounded-xl p-6">
        <h4 className="font-bold text-green-800 mb-4 text-lg">📍 Punto de Pago</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="text-xs text-green-600 font-medium uppercase tracking-wide">Dirección</label>
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-blue-600 hover:underline flex items-start gap-1"
                title="Abrir en Google Maps"
              >
                <span className="mt-0.5">📍</span>
                <span className="break-words">{locationInfo.address}</span>
              </a>
            </div>
            <div>
              <label className="text-xs text-green-600 font-medium uppercase tracking-wide">Horario de Atención</label>
              <p className="font-semibold">{locationInfo.hours}</p>
            </div>
            <div>
              <label className="text-xs text-green-600 font-medium uppercase tracking-wide">Contacto</label>
              <p className="font-semibold">{locationInfo.contact}</p>
            </div>
          </div>
          
          {/* Tarjeta decorativa con consejos */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-green-200 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-green-500/10 rounded-full flex items-center justify-center">
                <span className="text-green-600 text-xl">💡</span>
              </div>
              <h5 className="font-bold text-green-800">Consejos Útiles</h5>
            </div>
            <div className="space-y-2 text-sm text-green-700">
              <p className="flex items-start gap-2">
                <span className="text-green-500 mt-1">•</span>
                <span>Lleva identificación oficial.</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-green-500 mt-1">•</span>
                <span>Solicita tu recibo de pago.</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-green-500 mt-1">•</span>
                <span>Pregunta por descuentos disponibles.</span>
              </p>
        
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-50 rounded-xl p-6">
          <h4 className="font-bold text-gray-800 mb-4">📋 Instrucciones</h4>
          <ol className="space-y-3 text-gray-700">
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">1</span>
              <span>Acude a nuestra dirección en los horarios establecidos.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">2</span>
              <span>Presenta tu ID o folio de estudiante para registrar el pago.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">3</span>
              <span>Sube tu recibo físico para mantener el registro actualizado.</span>
            </li>
          </ol>
        </div>

        <div>
          <h4 className="font-bold text-gray-800 mb-3">📄 Subir Comprobante.</h4>
          {!uploadedFile ? (
            <div>
              <FileUpload onFileSelect={handleFileUpload} />
              {isUploading && (
                <div className="mt-3 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600 mr-2"></div>
                  <span className="text-gray-600 text-sm">Subiendo...</span>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-gray-800 truncate">{uploadedFile.name}</p>
                    <p className="text-sm text-gray-600">
                      {(uploadedFile.size / 1024 / 1024).toFixed(1)} MB • Subido correctamente
                    </p>
                  </div>
                  <button
                    onClick={() => setUploadedFile(null)}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button className="flex-1 text-sm bg-blue-100 text-blue-700 py-2 rounded-lg hover:bg-blue-200 transition flex items-center justify-center gap-2">
                  <Eye className="w-4 h-4" />
                  Ver archivo
                </button>
                <button className="flex-1 text-sm bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition flex items-center justify-center gap-2">
                  <Download className="w-4 h-4" />
                  Descargar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// --- Componente de Bloqueo de Contenido ---
function ContentBlockedAlert({ overduePayments, overdueDays, onGoToPayments }) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-red-200">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center">
            <XCircle className="w-10 h-10 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-red-800">Acceso Restringido</h3>
            <p className="text-red-600 text-sm">Pagos pendientes detectados</p>
          </div>
        </div>

        {/* Información del bloqueo */}
        <div className="bg-red-50 rounded-lg p-4 mb-6 border border-red-200">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-red-700 font-medium">Pagos vencidos:</span>
              <span className="text-red-800 font-bold">{overduePayments}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-red-700 font-medium">Días de retraso:</span>
              <span className="text-red-800 font-bold">{overdueDays} días</span>
            </div>
          </div>
        </div>

        {/* Mensaje explicativo */}
        <div className="mb-6">
          <p className="text-gray-700 text-sm mb-3">
            Tu acceso al contenido ha sido temporalmente restringido debido a pagos vencidos.
          </p>
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
            <h4 className="font-bold text-blue-800 mb-2">Para recuperar el acceso:</h4>
            <ul className="text-blue-700 text-xs space-y-1">
              <li>• Regulariza tus pagos pendientes</li>
              <li>• Sube los comprobantes de pago</li>
              <li>• Espera la verificación del administrador</li>
            </ul>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex flex-col gap-3">
          <button
            onClick={onGoToPayments}
            className="w-full bg-red-600 text-white py-3 rounded-lg font-bold hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
          >
            💳 Ir a Mis Pagos
          </button>
          <button
            onClick={() => window.location.href = 'mailto:mqerkacademycienytec@gmail.com'}
            className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors text-sm"
          >
            📧 Contactar Soporte
          </button>
        </div>

        {/* Footer informativo */}
        <div className="mt-4 text-center">
          <p className="text-gray-500 text-xs">
            El acceso se restablecerá automáticamente tras la verificación de pagos
          </p>
        </div>
      </div>
    </div>
  );
}

// --- Componente para el historial inteligente de pagos ---
/**
 * HISTORIAL INTELIGENTE - Funcionalidades:
 * 1. Agrupa pagos por planes históricos
 * 2. Muestra solo información de consulta (sin acciones de pago)
 * 3. Filtros por fecha, plan, estado
 * 4. Búsqueda de comprobantes
 * 5. Exportación de datos
 */
function PaymentHistoryIntelligent({ allPaymentsHistory = [], onFilterChange, onViewReceipt, uploadedReceipts = [], onOpenComprobante }) {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedPlan, setSelectedPlan] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Datos deben venir de la API. Quitamos mocks y usamos el prop allPaymentsHistory.
  // Estructura esperada (referencia): Array<{ id, planType, planName, startDate, endDate, totalAmount, status, payments: Array }>

  const statusColors = {
    'paid': 'bg-green-100 text-green-800 border-green-200',
    'pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'overdue': 'bg-red-100 text-red-800 border-red-200',
    'cancelled': 'bg-gray-100 text-gray-800 border-gray-200'
  };

  const statusIcons = {
    'paid': <CheckCircle className="w-4 h-4" />,
    'pending': <Clock className="w-4 h-4" />,
    'overdue': <XCircle className="w-4 h-4" />,
    'cancelled': <XCircle className="w-4 h-4" />
  };

  const statusLabels = {
    'paid': 'Pagado',
    'pending': 'Pendiente',
    'overdue': 'Vencido',
    'cancelled': 'Cancelado'
  };

  const planColors = {
    'mensual': 'bg-blue-500',
    'start': 'bg-purple-500',
    'premium': 'bg-orange-500'
  };

  // Filtrar y buscar en el historial
  const filteredHistory = (allPaymentsHistory || []).filter(plan => {
    const matchesPlan = selectedPlan === 'all' || plan.planType === selectedPlan;
    const matchesSearch = searchTerm === '' || 
      plan.planName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.payments.some(payment => 
        payment.method.toLowerCase().includes(searchTerm.toLowerCase())
      );
    
    return matchesPlan && matchesSearch;
  });

  // TODO BACKEND: Función para descargar comprobante
  const handleDownloadReceipt = (receiptUrl, paymentId) => {
    // Llamar al manejador provisto por el padre si existe; sin mocks
    if (onViewReceipt) onViewReceipt(paymentId, receiptUrl);
  };

  // TODO BACKEND: Función para exportar historial de pagos
  const handleExportHistory = () => {
    // TODO: Implementar exportación a PDF/Excel
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6 border border-gray-200">
      {/* Comprobantes enviados del curso actual */}
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-800 mb-3">Comprobantes enviados</h3>
        {uploadedReceipts.length === 0 ? (
          <div className="text-sm text-gray-500">Aún no has enviado comprobantes.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-2 px-3">Fecha</th>
                  <th className="text-left py-2 px-3">Importe</th>
                  <th className="text-left py-2 px-3">Método</th>
                  <th className="text-left py-2 px-3">Archivo</th>
                  <th className="text-left py-2 px-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {uploadedReceipts.map((row, idx) => (
                  <tr key={idx} className="border-b border-gray-100">
                    <td className="py-2 px-3 text-gray-700">{row?.created_at ? formatDateTimeMX(row.created_at) : '-'}</td>
                    <td className="py-2 px-3 font-semibold text-gray-800">{row?.importe ? formatCurrencyMXN(row.importe) : '-'}</td>
                    <td className="py-2 px-3 text-gray-700">{row?.metodo || '-'}</td>
                    <td className="py-2 px-3">
                      {row?.absoluteUrl ? (
                        <button onClick={() => onViewReceipt && onViewReceipt(idx, row.absoluteUrl)} className="text-blue-600 hover:text-blue-800 flex items-center gap-1">
                          <Eye className="w-4 h-4" /> Ver comprobante
                        </button>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="py-2 px-3">
                      <button onClick={() => onOpenComprobante && onOpenComprobante(row)} className="text-xs bg-purple-600 text-white px-3 py-1 rounded-md hover:bg-purple-700">
                        Comprobante
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {/* Header con controles */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
        <div className="mb-4 lg:mb-0">
          <h3 className="text-xl font-bold text-gray-800 mb-2">📚 Historial Completo de Pagos</h3>
          <p className="text-gray-600 text-sm">
            Consulta todos tus planes y pagos históricos. Solo lectura.
          </p>
        </div>
        
        {/* Controles de filtro */}
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Buscar por plan o método..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
          
          <select
            value={selectedPlan}
            onChange={(e) => setSelectedPlan(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          >
            <option value="all">Todos los planes</option>
            <option value="mensual">Plan Mensual</option>
            <option value="start">Plan Start</option>
            <option value="premium">Plan Premium</option>
          </select>

          <button
            onClick={handleExportHistory}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Exportar
          </button>
        </div>
      </div>

  {/* Lista de planes históricos */}
      <div className="max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400 pr-2">
        <div className="space-y-6">
          {filteredHistory.length > 0 ? (
          filteredHistory.map((plan) => (
            <div key={plan.id} className="border border-gray-200 rounded-xl overflow-hidden">
              {/* Header del plan */}
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3 mb-2 sm:mb-0">
                    <div className={`w-3 h-3 rounded-full ${planColors[plan.planType]}`}></div>
                    <h4 className="font-bold text-gray-800">{plan.planName}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      plan.status === 'completed' ? 'bg-green-100 text-green-800' :
                      plan.status === 'active' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {plan.status === 'completed' ? 'Completado' :
                       plan.status === 'active' ? 'Activo' : 'Cancelado'}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Período:</span> {new Date(plan.startDate).toLocaleDateString('es-MX')} 
                    {plan.endDate && ` - ${new Date(plan.endDate).toLocaleDateString('es-MX')}`}
                  </div>
                </div>
              </div>

              {/* Tabla de pagos del plan */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left py-2 px-4 font-medium text-gray-700 text-sm">Pago</th>
                      <th className="text-left py-2 px-4 font-medium text-gray-700 text-sm">Monto</th>
                      <th className="text-left py-2 px-4 font-medium text-gray-700 text-sm">Fecha Límite</th>
                      <th className="text-left py-2 px-4 font-medium text-gray-700 text-sm">Fecha Pago</th>
                      <th className="text-left py-2 px-4 font-medium text-gray-700 text-sm">Método</th>
                      <th className="text-left py-2 px-4 font-medium text-gray-700 text-sm">Estado</th>
                      <th className="text-left py-2 px-4 font-medium text-gray-700 text-sm">Comprobante</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(plan.payments || []).map((payment) => (
                      <tr key={payment.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <span className="font-medium text-gray-800">#{payment.paymentNumber}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-bold text-gray-800">{formatCurrencyMXN(payment.amount)}</span>
                        </td>
                        <td className="py-3 px-4 text-gray-600 text-sm">
                          {new Date(payment.dueDate).toLocaleDateString('es-MX')}
                        </td>
                        <td className="py-3 px-4 text-gray-600 text-sm">
                          {payment.paidDate ? new Date(payment.paidDate).toLocaleDateString('es-MX') : '-'}
                        </td>
                        <td className="py-3 px-4 text-gray-600 text-sm">
                          {payment.method}
                        </td>
                        <td className="py-3 px-4">
                          <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs border ${statusColors[payment.status]}`}>
                            {statusIcons[payment.status]}
                            {statusLabels[payment.status]}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {payment.receiptUrl ? (
                            <button
                              onClick={() => handleDownloadReceipt(payment.receiptUrl, payment.id)}
                              className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                            >
                              <Eye className="w-4 h-4" />
                              Ver comprobante
                            </button>
                          ) : (
                            <span className="text-gray-400 text-sm">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Footer del plan con resumen */}
              <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm">
                  <div className="text-gray-600 mb-2 sm:mb-0">
                    <span className="font-medium">Total del plan:</span> {formatCurrencyMXN(plan.totalAmount)}
                  </div>
                  <div className="text-gray-600">
                    <span className="font-medium">Pagos realizados:</span> {(plan.payments || []).filter(p => p.status === 'paid').length} de {(plan.payments || []).length}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 text-4xl mb-4">📊</div>
            <h4 className="text-lg font-medium text-gray-600 mb-2">No se encontraron registros</h4>
            <p className="text-gray-500 text-sm">
              {searchTerm ? 'Intenta con otros términos de búsqueda' : 'No tienes historial de pagos aún'}
            </p>
          </div>
        )}
        </div>
      </div>

      {/* Footer informativo */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-3">
          <div className="text-blue-500 mt-1">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-3 4a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h5 className="font-medium text-blue-800 mb-1">Información del Historial</h5>
            <ul className="text-blue-700 text-sm space-y-1">
              <li>• Esta es una vista de solo consulta de todos tus planes anteriores</li>
              <li>• Los pagos del plan actual se gestionan en la pestaña "Plan Actual"</li>
              <li>• Puedes descargar comprobantes de pagos antiguos</li>
              <li>• El historial se conserva por tiempo indefinido para efectos fiscales</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Componente para la tabla del plan de pagos ---
// Generador compartido de calendario de pagos con reglas por plan y tolerancia
function generatePaymentSchedule({ startDate, totalPayments = 8, paymentAmount = 1500, planType = 'mensual', now = new Date() }) {
  if (!startDate) return [];
  const type = (planType || 'mensual').toString().toLowerCase();
  const shared = genScheduleShared({ startDate, planType: type, now });
  return shared.slice(0, totalPayments).map((p, idx) => {
    // Mantener la fecha "paymentDate" usada por la tabla
    const paymentDate = new Date(startDate);
    if (type === 'start') {
      paymentDate.setMonth(paymentDate.getMonth() + (idx === 0 ? 0 : 4));
    } else {
      paymentDate.setMonth(paymentDate.getMonth() + idx);
    }
    // La verificación depende del plan: premium todos pagados; otros solo el primero
    const verificationDate = idx < (type === 'premium' ? totalPayments : 1) ? paymentDate : null;
    return {
      id: idx + 1,
      paymentNumber: idx + 1,
      amount: p.amount ?? paymentAmount,
      paymentDate,
      dueDate: p.dueDate,
      status: p.status,
      isOverdue: p.isOverdue,
      verificationDate,
      month: paymentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
    };
  });
}

function PaymentPlanTable({ onViewScheduleReceipt, activationDate, planType = 'mensual' }) {
  const { currentCourse } = useStudent();

  // Configuración del plan actual: mensual con 8 pagos
  const selectedPlan = (planType || 'mensual').toString().toLowerCase();
  // Pagos y totales por plan
  const totalPayments = selectedPlan === 'premium' ? 1 : (selectedPlan === 'start' ? 2 : 8);
  const baseTotalAmount = (
    selectedPlan === 'premium' ? 10500 :
    selectedPlan === 'start' ? 11000 :
    1500 * 8 // mensual
  );
  const perPaymentAmount = (
    selectedPlan === 'premium' ? 10500 :
    selectedPlan === 'start' ? 5500 :
    1500
  );
  const currentPlan = {
    name: selectedPlan === 'premium' ? 'Plan Premium' : (selectedPlan === 'start' ? 'Plan Start' : 'Plan Mensual'),
    totalPayments,
    paymentAmount: perPaymentAmount,
    frequency: selectedPlan === 'premium' ? 'pago único' : (selectedPlan === 'start' ? 'por exhibición' : 'mensual'),
    // Usamos la fecha de activación si viene por props; si no, caemos al enrollmentDate o hoy
    startDate: (() => {
      const anchor = activationDate
        ? new Date(activationDate)
        : (currentCourse?.enrollmentDate ? new Date(currentCourse.enrollmentDate) : new Date());
      return isNaN(anchor.getTime()) ? new Date() : anchor;
    })(),
    totalAmount: baseTotalAmount,
  };

  // Generar calendario de pagos del curso actual. El primer pago SIEMPRE está pagado.
  const paymentSchedule = generatePaymentSchedule({
    startDate: currentPlan.startDate,
    totalPayments: currentPlan.totalPayments,
    paymentAmount: currentPlan.paymentAmount,
    planType: selectedPlan,
    now: new Date()
  }).map(p => ({ ...p, receiptUrl: null }));

  const allPaymentsPaid = paymentSchedule.length > 0 && paymentSchedule.every(payment => payment.status === 'paid');
  const planCompletionDate = allPaymentsPaid ? paymentSchedule[paymentSchedule.length - 1].verificationDate : null;

  const calculatePlanExpirationDate = () => {
    if (!allPaymentsPaid) return null;
    if (!planCompletionDate) return null;
    const lastPaymentDate = new Date(planCompletionDate);
  // Premium: acceso durante el curso (8 meses), no de por vida.
    if (selectedPlan === 'premium') {
      const courseEnd = new Date(currentPlan.startDate);
      courseEnd.setMonth(courseEnd.getMonth() + 8);
      return courseEnd;
  }
    if (selectedPlan === 'mensual') { lastPaymentDate.setMonth(lastPaymentDate.getMonth() + 8); return lastPaymentDate; }
    if (selectedPlan === 'start') { lastPaymentDate.setMonth(lastPaymentDate.getMonth() + 12); return lastPaymentDate; }
    return null;
  };

  const planExpirationDate = calculatePlanExpirationDate();
  const isPlanActive = !planExpirationDate || new Date() < planExpirationDate;
  const isPlanExpired = planExpirationDate && new Date() > planExpirationDate;
  const amountPaid = paymentSchedule.filter(p => p.status === 'paid').length * currentPlan.paymentAmount;
  const upgradeDifference = Math.max(0, 10500 - amountPaid);
  
  // TODO BACKEND: Función para procesar el pago de un elemento específico
  const handlePayment = async (paymentId) => {
    try {
      // TODO: Integrar con el modal de métodos de pago y pasar el paymentId
      
      // TODO BACKEND: POST /api/payments/initiate
      // const response = await fetch('/api/payments/initiate', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ paymentId, amount: currentPlan.paymentAmount })
      // });
      
    } catch (error) {
      console.error('Error al iniciar pago:', error);
      // TODO: Mostrar toast de error
    }
  };


  
  // Función auxiliar para obtener el nombre del método de pago
  const getPaymentMethodName = (status) => {
    // TODO BACKEND: Obtener el método real del pago desde la API
    // Por ahora retornamos un método por defecto basado en el estado
    if (status === 'paid') {
      return 'Efectivo'; // Simular método usado
    }
    return 'Pendiente';
  };
  
  const getStatusColor = (status, isOverdue) => {
    if (status === 'paid') return 'bg-green-100 text-green-800';
    if (status === 'overdue' || isOverdue) return 'bg-red-100 text-red-800';
    if (status === 'pending') return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-600';
  };

  const getStatusIcon = (status, isOverdue) => {
    if (status === 'paid') return <CheckCircle className="w-4 h-4" />;
    if (status === 'overdue' || isOverdue) return <XCircle className="w-4 h-4" />;
    if (status === 'pending') return <Clock className="w-4 h-4" />;
    return <Calendar className="w-4 h-4" />;
  };

  const getStatusLabel = (status, isOverdue) => {
    if (status === 'paid') return 'Pagado';
    if (status === 'overdue' || isOverdue) return 'Vencido';
    if (status === 'pending') return 'Pendiente';
    return 'Próximo';
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6 border border-gray-200">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 md:mb-6">
        <div>
          <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">📋 Plan Elegido</h3>
          <div className="flex flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
            <span className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-full font-bold shadow-md">
              ✨ {currentPlan.name}
            </span>
            <span className="bg-green-100 text-green-800 px-2.5 py-1 rounded-full font-medium">
              💰 {formatCurrencyMXN(currentPlan.paymentAmount)} {currentPlan.frequency}
            </span>
            <span className="bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full font-medium">
              📅 Inicio: {currentPlan.startDate.toLocaleDateString('es-ES')}
            </span>
            <span className="bg-purple-100 text-purple-800 px-2.5 py-1 rounded-full font-medium">
              🎯 Total: {formatCurrencyMXN(currentPlan.totalAmount)}
            </span>
          </div>
        </div>
      </div>

      {/* Tabla de pagos responsive */}
      <div className="overflow-x-auto">
        {/* Header especial cuando el plan está completado */}
        {allPaymentsPaid && (
          <div className="mb-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white p-3 rounded-lg text-center">
            <div className="flex items-center justify-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span className="font-bold">🎊 TODOS LOS PAGOS COMPLETADOS 🎊</span>
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
        )}

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-xs sm:text-sm">
              <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-700">Pago</th>
              <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-700">Periodo</th>
              <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-700">Monto</th>
              <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-700">Fecha Límite</th>
              <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-700">Estado</th>
              <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-700">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {paymentSchedule.map((payment) => (
              <tr 
                key={payment.id} 
                className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                  payment.isOverdue ? 'bg-red-50' : ''
                } ${allPaymentsPaid ? 'bg-green-50/30' : ''}`}
              >
                <td className="py-3 sm:py-4 px-2 sm:px-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      payment.status === 'paid' ? 'bg-green-500 text-white' :
                      payment.isOverdue ? 'bg-red-500 text-white' :
                      payment.status === 'pending' ? 'bg-yellow-500 text-white' :
                      'bg-gray-300 text-gray-600'
                    }`}>
                      {payment.status === 'paid' && allPaymentsPaid ? '✓' : payment.paymentNumber}
                    </div>
                    <span className="font-medium text-gray-800">
                      Pago #{payment.paymentNumber}
                      {payment.status === 'paid' && allPaymentsPaid && (
                        <span className="ml-2 text-green-600 text-xs font-bold">✓ COMPLETADO</span>
                      )}
                    </span>
                  </div>
                </td>
                <td className="py-3 sm:py-4 px-2 sm:px-4 text-gray-700">

                  {payment.month}
                </td>
                <td className="py-3 sm:py-4 px-2 sm:px-4">
                  <span className="font-bold text-base sm:text-lg text-gray-800">
                    {formatCurrencyMXN(payment.amount)}
                  </span>
                </td>
                <td className="py-3 sm:py-4 px-2 sm:px-4 text-gray-700">
                  <div className="space-y-1">
                    <div>📅 {payment.paymentDate.toLocaleDateString('es-MX')}</div>
                    <div className={`text-xs ${payment.isOverdue ? 'text-red-600 font-bold' : 'text-gray-500'}`}>
                      ⚠️ Límite: {payment.dueDate.toLocaleDateString('es-MX')}
                    </div>
                  </div>
                </td>
                <td className="py-3 sm:py-4 px-2 sm:px-4">
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm border ${
                    getStatusColor(payment.status, payment.isOverdue)
                  }`}>
                    {getStatusIcon(payment.status, payment.isOverdue)}
                    {getStatusLabel(payment.status, payment.isOverdue)}
                  </div>
                </td>
                <td className="py-3 sm:py-4 px-2 sm:px-4">
      {payment.status === 'paid' ? (
                    <div className="flex gap-2">
                      <button 
        onClick={() => onViewScheduleReceipt && onViewScheduleReceipt(payment)}
                        className="text-xs sm:text-sm bg-blue-100 text-blue-700 px-2.5 py-1 rounded-lg hover:bg-blue-200 transition flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        Ver comprobante
                      </button>
                    </div>
                  ) : payment.status === 'pending' || payment.isOverdue ? (
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handlePayment(payment.id)}
                        className={`text-xs sm:text-sm px-2.5 py-1 rounded-lg transition flex items-center gap-1 ${
                          payment.isOverdue 
                            ? 'bg-red-500 text-white hover:bg-red-600' 
                            : 'bg-green-500 text-white hover:bg-green-600'
                        }`}
                      >
                        💳 {payment.isOverdue ? 'Pagar Ahora' : 'Pagar'}
                      </button>
                    </div>
                  ) : (
                    <span className="text-gray-400 text-sm">Próximamente</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Resumen del plan - MEJORADO */}
  <div className={`mt-5 sm:mt-6 p-3.5 sm:p-4 rounded-xl border-2 ${
        allPaymentsPaid 
          ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-300' 
          : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200'
      }`}>
        {/* Header del resumen */}
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h4 className={`font-bold text-base sm:text-lg ${allPaymentsPaid ? 'text-green-800' : 'text-blue-800'}`}>
            {allPaymentsPaid ? '🎉 Resumen Final' : '📊 Progreso del Plan'}
          </h4>
          {allPaymentsPaid && (
            <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">
              ✓ COMPLETADO
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 text-center">
          <div className={`${allPaymentsPaid ? 'bg-green-100' : 'bg-white'} rounded-lg p-2.5 sm:p-3 border`}>
            <div className={`text-sm font-medium mb-1 ${allPaymentsPaid ? 'text-green-600' : 'text-blue-600'}`}>
              Pagos Realizados
            </div>
            <div className={`text-xl font-bold ${allPaymentsPaid ? 'text-green-800' : 'text-blue-800'}`}>
              {paymentSchedule.filter(p => p.status === 'paid').length} / {currentPlan.totalPayments}
            </div>
            {allPaymentsPaid && (
              <div className="text-xs text-green-600 mt-1">¡Todos completados!</div>
            )}
          </div>

          <div className={`${allPaymentsPaid ? 'bg-green-100' : 'bg-white'} rounded-lg p-2.5 sm:p-3 border`}>
            <div className={`text-sm font-medium mb-1 ${allPaymentsPaid ? 'text-green-600' : 'text-green-600'}`}>
              Monto Pagado
            </div>
            <div className={`text-xl font-bold ${allPaymentsPaid ? 'text-green-800' : 'text-green-800'}`}>
              {formatCurrencyMXN(amountPaid)}
            </div>
            {allPaymentsPaid && (
              <div className="text-xs text-green-600 mt-1">Inversión total</div>
            )}
          </div>

          <div className={`${allPaymentsPaid ? 'bg-green-100' : 'bg-white'} rounded-lg p-2.5 sm:p-3 border`}>
            <div className={`text-sm font-medium mb-1 ${allPaymentsPaid ? 'text-green-600' : 'text-yellow-600'}`}>
              {allPaymentsPaid ? 'Total Invertido' : 'Pendiente'}
            </div>
            <div className={`text-xl font-bold ${allPaymentsPaid ? 'text-green-800' : 'text-yellow-800'}`}>
              {allPaymentsPaid 
                ? formatCurrencyMXN(currentPlan.totalAmount)
                : formatCurrencyMXN((currentPlan.totalPayments - paymentSchedule.filter(p => p.status === 'paid').length) * currentPlan.paymentAmount)
              }
            </div>
            {allPaymentsPaid && (
              <div className="text-xs text-green-600 mt-1">100% pagado</div>
            )}
          </div>

          <div className={`${allPaymentsPaid ? 'bg-green-100' : 'bg-white'} rounded-lg p-2.5 sm:p-3 border`}>
            <div className={`text-sm font-medium mb-1 ${allPaymentsPaid ? 'text-green-600' : 'text-purple-600'}`}>
              Progreso
            </div>
            <div className={`text-xl font-bold ${allPaymentsPaid ? 'text-green-800' : 'text-purple-800'}`}>
              {Math.round((paymentSchedule.filter(p => p.status === 'paid').length / currentPlan.totalPayments) * 100)}%
            </div>
            {allPaymentsPaid && (
              <div className="text-xs text-green-600 mt-1">¡Completado!</div>
            )}
          </div>
        </div>
        
        {/* Barra de progreso mejorada */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
            <span>Progreso del plan</span>
            <span className={`font-bold ${allPaymentsPaid ? 'text-green-600' : 'text-blue-600'}`}>
              {Math.round((paymentSchedule.filter(p => p.status === 'paid').length / currentPlan.totalPayments) * 100)}%
            </span>
          </div>
          <div className="bg-white rounded-full h-3 overflow-hidden shadow-inner">
            <div 
              className={`h-full transition-all duration-1000 ease-out ${
                allPaymentsPaid 
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600' 
                  : 'bg-gradient-to-r from-blue-500 to-purple-600'
              }`}
              style={{ 
                width: `${(paymentSchedule.filter(p => p.status === 'paid').length / currentPlan.totalPayments) * 100}%` 
              }}
            >
              {allPaymentsPaid && (
                <div className="h-full bg-white/20 animate-pulse"></div>
              )}
            </div>
          </div>
          {allPaymentsPaid && (
            <div className="text-center mt-2">
              <span className="text-green-600 font-bold text-sm">🎊 ¡Plan 100% Completado! 🎊</span>
            </div>
          )}
        </div>
      </div>

      {/* Alerta si hay pagos vencidos */}
      {paymentSchedule.some(p => p.isOverdue) && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="text-red-500">
              <XCircle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-red-800">⚠️ Pagos Vencidos Detectados</h4>
              <p className="text-red-700 text-sm">
                Tienes {paymentSchedule.filter(p => p.isOverdue).length} pago(s) vencido(s). 
                Tu acceso a la plataforma podría verse limitado hasta que regularices tus pagos.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Estado del Plan Completado - MEJORADO */}
      {allPaymentsPaid && (
        <div className="mt-6 relative overflow-hidden">
          {/* Fondo animado */}
          <div className="absolute inset-0 bg-gradient-to-r from-green-400 via-emerald-500 to-teal-600 opacity-10 animate-pulse"></div>
          
          <div className="relative bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-2xl p-6 shadow-xl">
            {/* Header del plan completado */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
              <div className="flex items-center gap-4 mb-4 md:mb-0">
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                    <CheckCircle className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                    <span className="text-xs">🎉</span>
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-green-800 text-2xl mb-1">¡Plan Completado!</h4>
                  <p className="text-green-700 font-medium text-lg">
                    Has finalizado exitosamente tu <span className="font-bold">{currentPlan.name}</span>
                  </p>
                  <p className="text-green-600 text-sm">
                    Total pagado: <span className="font-bold">{formatCurrencyMXN(currentPlan.totalAmount)}</span>
                  </p>
                </div>
              </div>
              
              {/* Badge de logro */}
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-full shadow-lg">
                <div className="text-center">
                  <div className="text-lg font-bold">🏆</div>
                  <div className="text-xs font-medium">COMPLETADO</div>
                </div>
              </div>
            </div>

            {/* Estadísticas de finalización */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white/80 rounded-xl p-4 text-center shadow-sm">
                <div className="text-2xl font-bold text-green-600">{currentPlan.totalPayments}</div>
                <div className="text-xs text-green-700 font-medium">Pagos Realizados</div>
              </div>
              <div className="bg-white/80 rounded-xl p-4 text-center shadow-sm">
                <div className="text-2xl font-bold text-blue-600">{formatCurrencyMXN(currentPlan.totalAmount)}</div>
                <div className="text-xs text-blue-700 font-medium">Total Invertido</div>
              </div>
              <div className="bg-white/80 rounded-xl p-4 text-center shadow-sm">
                <div className="text-2xl font-bold text-purple-600">100%</div>
                <div className="text-xs text-purple-700 font-medium">Progreso</div>
              </div>
              <div className="bg-white/80 rounded-xl p-4 text-center shadow-sm">
                <div className="text-lg font-bold text-orange-600">
                  {Math.ceil((new Date() - currentPlan.startDate) / (1000 * 60 * 60 * 24))}
                </div>
                <div className="text-xs text-orange-700 font-medium">Días Transcurridos</div>
              </div>
            </div>

            {/* Información detallada según el plan */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-white/90 rounded-xl p-5 shadow-sm border border-green-200">
                <div className="text-sm text-green-600 font-medium mb-2">📅 Fecha de Finalización</div>
                <div className="text-lg font-bold text-green-800">
                  {planCompletionDate?.toLocaleDateString('es-ES', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </div>
                <div className="text-xs text-green-600 mt-1">
                  Último pago verificado
                </div>
              </div>
              
              <div className="bg-white/90 rounded-xl p-5 shadow-sm border border-green-200">
                <div className="text-sm text-green-600 font-medium mb-2">🔐 Estado de Acceso</div>
                <div className="text-lg font-bold text-green-800">
                  {selectedPlan === 'premium' ? (
                    <div>
                      <span className="text-purple-700">🔓 Acceso durante el curso</span>
                      <div className="text-xs text-purple-600 mt-1">
                        Hasta {planExpirationDate?.toLocaleDateString('es-MX')} (8 meses)
                      </div>
                    </div>
                  ) : isPlanActive ? (
                    <div>
                      <span className="text-blue-700">✅ Activo hasta {planExpirationDate?.toLocaleDateString('es-MX')}</span>
                      <div className="text-xs text-blue-600 mt-1">
                        {Math.ceil((planExpirationDate - new Date()) / (1000 * 60 * 60 * 24))} días restantes
                      </div>
                    </div>
                  ) : (
                    <div>
                      <span className="text-orange-700">⚠️ Plan expirado</span>
                      <div className="text-xs text-orange-600 mt-1">Renovación requerida</div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Mensajes y acciones específicas por plan */}
            {selectedPlan === 'premium' ? (
              <div className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white p-6 rounded-xl shadow-lg">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">🌟</span>
                  <h5 className="font-bold text-xl">Plan Premium - Pago único</h5>
                </div>
                <p className="text-purple-100 mb-4">
                  Acceso completo durante el curso (8 meses) sin pagos mensuales y con beneficios incluidos:
                </p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-purple-100 list-disc pl-5">
                  <li>Acceso a nuestra plataforma educativa</li>
                  <li>Guías digitales con ejercicios tipo examen</li>
                  <li>Libros electrónicos en PDF por materia</li>
                  <li>Simuladores en línea</li>
                </ul>
                <div className="mt-4 text-sm text-purple-200">
                  Precio preferencial: <span className="font-bold text-white">$10,500 MXN</span>
                </div>
              </div>
            ) : isPlanActive ? (
              <div className="bg-gradient-to-r from-blue-600 to-cyan-700 text-white p-6 rounded-xl shadow-lg">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">⏰</span>
                  <h5 className="font-bold text-xl">Tu Acceso Está Activo</h5>
                </div>
                <p className="text-blue-100 mb-4">
                  Tu acceso a la plataforma estará disponible hasta el{' '}
                  <strong className="text-white">{planExpirationDate?.toLocaleDateString('es-ES')}</strong>.
                  {selectedPlan === 'mensual' && " Tienes 8 meses de acceso desde tu último pago."}
                  {selectedPlan === 'start' && " Tienes 12 meses de acceso desde tu último pago."}
                </p>
                <div className="bg-white/20 rounded-lg p-3">
                  <div className="text-xs text-blue-200 mb-1">Tiempo restante de acceso</div>
                  <div className="text-lg font-bold">
                    {Math.ceil((planExpirationDate - new Date()) / (1000 * 60 * 60 * 24))} días
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-r from-orange-600 to-red-700 text-white p-6 rounded-xl shadow-lg">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">⚠️</span>
                  <h5 className="font-bold text-xl">Plan Expirado</h5>
                </div>
                <p className="text-orange-100 mb-4">
                  Tu acceso expiró el <strong className="text-white">{planExpirationDate?.toLocaleDateString('es-MX')}</strong>. 
                  Para continuar disfrutando del contenido, necesitas renovar tu plan.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button className="bg-white text-orange-600 px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transition-all flex items-center justify-center gap-2 flex-1">
                    🔄 Renovar Plan Actual
                  </button>
                  <button className="bg-purple-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-purple-700 transition-all flex items-center justify-center gap-2 flex-1">
                    ⭐ Actualizar a Premium
                  </button>
                </div>
              </div>
            )}

            {/* Opción de upgrade para planes no premium que están activos */}
            {selectedPlan !== 'premium' && isPlanActive && (
              <div className="mt-6 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="mb-4 md:mb-0">
                    <h5 className="font-bold text-blue-800 text-lg mb-2 flex items-center gap-2">
                      💎 ¿Quieres acceso permanente?
                    </h5>
                    <p className="text-blue-700 text-sm">
                      Actualiza a Plan Premium y olvídate de pagos mensuales: pago único con acceso completo durante el curso y beneficios extra.
                      Solo paga la diferencia: <strong>{formatCurrencyMXN(upgradeDifference)}</strong>
                    </p>
                    <ul className="text-xs text-blue-600 mt-2 space-y-1">
                      <li>• Sin pagos mensuales</li>
                      <li>• Acceso durante el curso (8 meses)</li>
                      <li>• Beneficios incluidos: plataforma, guías, libros PDF y simuladores</li>
                    </ul>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all flex items-center gap-2">
                      ⭐ Actualizar a Premium (Pago único)
                      <span className="text-xs bg-white/20 px-2 py-1 rounded">
                        -{Math.round(((currentPlan.totalAmount / 10500) * 100))}%
                      </span>
                    </button>
                    <div className="text-center text-xs text-blue-600">
                      Ahorra {formatCurrencyMXN(currentPlan.totalAmount)} ya pagados
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Mensaje de agradecimiento */}
            <div className="mt-6 bg-white/60 rounded-xl p-4 text-center border border-green-200">
              <p className="text-green-700 font-medium">
                🙏 <strong>¡Gracias por confiar en nosotros!</strong> Tu dedicación al completar el plan es admirable.
              </p>
              <p className="text-green-600 text-sm mt-1">
                ¿Tienes dudas? Contáctanos en <strong>mqerkacademycienytec@gmail.com</strong>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Componente principal de Mis Pagos
 * Maneja el historial y opciones de pago del estudiante
 * 
 * TODO BACKEND - ENDPOINTS NECESARIOS:
 * - GET /api/students/{id}/plan - Obtener plan seleccionado del estudiante
 * - GET /api/students/{id}/payments - Obtener historial de pagos
 * - POST /api/payments/upload-receipt - Subir comprobante de pago
 * - PUT /api/payments/{id}/verify - Verificar pago (solo admins)
 * - GET /api/payments/{id}/receipt - Obtener comprobante específico
 * - POST /api/payments/initiate - Iniciar proceso de pago
 * 
 * TODO BACKEND - ESTADOS NECESARIOS:
 * - Student.selectedPlan: 'mensual' | 'start' | 'premium'
 * - Student.registrationDate: Date
 * - Payment.status: 'paid' | 'pending' | 'overdue' | 'upcoming'
 * - Payment.receiptUrl: string
 * - Payment.verificationDate: Date
 * - Payment.method: 'transfer' | 'cash' | 'card'
 * 
 * TODO BACKEND - LÓGICA DE BLOQUEO:
 * - Si hay pagos 'overdue' → bloquear acceso al contenido
 * - Tolerancia de 1 mes después de fecha de vencimiento
 * - Notificar al admin cuando hay pagos pendientes
 */
export function MisPagos_Alumno_comp({ isLoading: propIsLoading, error: propError }) {
  // TODO BACKEND: Obtener datos del estudiante desde el contexto
  const { studentData, hasPaid, currentCourse, updatePaymentStatus, hasContentAccess, overdueDays, checkPaymentStatus } = useStudent();
  const { alumno, user } = useAuth();
  const { comprobantes, getComprobantes, crearComprobante } = useComprobante();
  
  // Datos del estudiante desde el contexto (se usarán para el recibo si el backend los provee)
  // Nota: ya no usamos hooks de mocks
  
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [isLoading, setIsLoading] = useState(propIsLoading);
  const [error, setError] = useState(propError);
  const [activeTab, setActiveTab] = useState('current'); // 'current' | 'history'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFetchingComprobantes, setIsFetchingComprobantes] = useState(false);
  const [comprobantesError, setComprobantesError] = useState(null);
  
  // Estados para el recibo virtual
  const [showRecibo, setShowRecibo] = useState(false);
  const [selectedPaymentForRecibo, setSelectedPaymentForRecibo] = useState(null);
  
  // TODO BACKEND: Reemplazar con datos reales de la API
  // const [paymentHistory, setPaymentHistory] = useState([]);
  // useEffect(() => {
  //   const fetchPaymentHistory = async () => {
  //     try {
  //       const response = await fetch(`/api/students/${studentData.id}/payments`);
  //       const data = await response.json();
  //       setPaymentHistory(data);
  //     } catch (error) {
  //       console.error('Error fetching payment history:', error);
  // TODO BACKEND: Hook para obtener historial de pagos
  // useEffect(() => {
  //   const fetchPaymentHistory = async () => {
  //     try {
  //       const response = await fetch(`/api/students/${studentData.id}/payment-history`);
  //       const data = await response.json();
  //       setPaymentHistory(data);
  //     } catch (error) {
  //       console.error('Error fetching payment history:', error);
  //     }
  //   };
  //   fetchPaymentHistory();
  // }, [studentData.id]);

  const paymentMethods = [
    { id: 'card', title: 'PAGO CON TARJETA DE CRÉDITO O DÉBITO', icon: <IconoTarjeta /> },
    { id: 'transfer', title: 'TRANSFERENCIA SPEI O DEPÓSITO', icon: <IconoTransferencia /> },
    { id: 'cash', title: 'EFECTIVO', icon: <IconoEfectivo /> },
  ];

  const paymentMethodTitles = {
    'card': 'Pago con Tarjeta de Crédito o Débito',
    'transfer': 'Transferencia SPEI o Depósito',
    'cash': 'Pago en Efectivo'
  };

  useEffect(() => {
    if (propIsLoading !== undefined) {
      setIsLoading(propIsLoading);
      setError(propError);
    }
    if (!propIsLoading && !propError) {
      const timer = setTimeout(() => setIsLoading(false), 500);
      return () => clearTimeout(timer);
    }
  }, [propIsLoading, propError]);

  const handleMethodClick = (methodId) => {
    setSelectedMethod(methodId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedMethod(null);
  };

  // Subir comprobante real al backend usando el contexto
  const handleReceiptUpload = async (methodId, file) => {
    try {
      if (!alumno?.id) throw new Error('Falta id del estudiante');
      const formData = new FormData();
      formData.append('comprobante', file);
      formData.append('id_estudiante', alumno.id);
      await crearComprobante(formData);
      // Refrescar lista
      if (alumno?.grupo && alumno?.curso) await getComprobantes(alumno.grupo, alumno.curso);
      // Cerrar modal
      setIsModalOpen(false);
      setSelectedMethod(null);
    } catch (error) {
      console.error('Error uploading receipt:', error);
      setComprobantesError('No se pudo subir el comprobante');
    }
  };

  const renderModalContent = () => {
    switch (selectedMethod) {
      case 'card':
        return <CardPaymentModal onReceiptUpload={handleReceiptUpload} />;
      case 'transfer':
        return <TransferPaymentModal onReceiptUpload={handleReceiptUpload} />;
      case 'cash':
        return <CashPaymentModal onReceiptUpload={handleReceiptUpload} />;
      default:
        return null;
    }
  };

  // Función para ver comprobante: evitar datos mock; solo abrir si tenemos data real del hook/generador
  const handleViewReceipt = async (paymentId, receiptUrl) => {
    try {
      // Abrir directamente el URL del comprobante si existe (sin mocks)
      if (receiptUrl) {
        window.open(receiptUrl, '_blank');
      }
    } catch (error) {
      console.error('Error al ver comprobante:', error);
    }
  };

  // Abrir comprobante del pago marcado como pagado en la tabla del plan
  const handleViewScheduleReceipt = (payment) => {
    if (!payment) return;
    const paymentData = {
      id: payment.id,
      amount: payment.amount,
      baseAmount: payment.amount,
      date: payment.paymentDate?.toISOString?.() || new Date().toISOString(),
      method: 'Efectivo',
      status: 'paid',
  plan: `Plan ${planType === 'premium' ? 'Premium' : (planType === 'start' ? 'Start' : 'Mensual')} - Pago ${payment.paymentNumber}`,
  planType, // pasar el tipo de plan real
      paymentNumber: payment.paymentNumber,
      dueDate: payment.dueDate?.toISOString?.() || new Date().toISOString(),
      verificationDate: payment.verificationDate?.toISOString?.() || payment.paymentDate?.toISOString?.() || new Date().toISOString(),
  description: `Pago ${payment.paymentNumber} del plan ${planType}`
    };
    setSelectedPaymentForRecibo(paymentData);
    setShowRecibo(true);
  };

  // Cargar comprobantes del backend del grupo/curso del alumno y filtrar los propios por folio
  useEffect(() => {
    const load = async () => {
      if (!alumno?.grupo || !alumno?.curso) return;
      try {
        setIsFetchingComprobantes(true);
        setComprobantesError(null);
        await getComprobantes(alumno.grupo, alumno.curso);
      } catch (e) {
        setComprobantesError('No se pudieron cargar los comprobantes');
      } finally {
        setIsFetchingComprobantes(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alumno?.grupo, alumno?.curso]);

  // Normalizar lista y filtrar por folio propio
  const myComprobantes = useMemo(() => {
    const list = Array.isArray(comprobantes) ? comprobantes : (comprobantes ? [comprobantes] : []);
    if (!alumno?.folio) return list;
    return list.filter(item => String(item.folio) === String(alumno.folio));
  }, [comprobantes, alumno?.folio]);

  // Construir URL absoluta del archivo desde VITE_API_URL
  const buildReceiptUrl = (relativePath) => {
    if (!relativePath) return null;
    const apiBase = (import.meta?.env?.VITE_API_URL) || 'http://localhost:1002/api';
    const host = apiBase.replace(/\/?api\/?$/, '');
    return `${host}${relativePath}`;
  };

  // Abrir Comprobante Virtual con datos reales del comprobante
  const handleOpenVirtualReceipt = (row) => {
    const amount = Number(row?.importe || 0);
    const method = row?.metodo || 'Transferencia';
    const status = (Number(alumno?.verificacion ?? 0) >= 2 || amount > 0) ? 'paid' : 'pending';
    const paymentData = {
      id: alumno?.id || Date.now(),
      date: row?.created_at || new Date().toISOString(),
      amount: amount,
      baseAmount: amount,
      discount: 0,
      penalty: 0,
      method,
      status,
  plan: alumno?.plan || 'Plan actual',
  planType: alumno?.plan || alumno?.plan_type || 'mensual',
      cashReceived: amount || 0,
      transactionId: `TXN-${alumno?.folio || 'MQ'}`,
      verificationDate: status === 'paid' ? (row?.created_at || new Date().toISOString()) : null,
    };
    const stdData = {
      id: alumno?.id,
      name: `${alumno?.nombre || ''} ${alumno?.apellidos || ''}`.trim(),
      group: alumno?.grupo,
      email: alumno?.email,
      studentCode: alumno?.folio,
    };
    setSelectedPaymentForRecibo(paymentData);
    // Pasaremos studentData via prop del ComprobanteVirtual
    setShowRecibo(true);
  };

  // Preparar comprobantes enviados para pasarlos al Historial
  const uploadedReceipts = useMemo(() => {
    return myComprobantes.map((row) => ({
      ...row,
      absoluteUrl: buildReceiptUrl(row?.comprobante)
    }));
  }, [myComprobantes]);

  // Determinar fecha de activación desde util compartido
  const activationDate = useMemo(() => getActivationDateShared(alumno), [alumno?.folio, alumno?.id, alumno?.created_at]);

  // Configuración del plan y cálculo del próximo pago (alineado con la tabla)
  const planType = useMemo(() => resolvePlanTypeShared(alumno?.plan || alumno?.plan_type), [alumno?.plan, alumno?.plan_type]);

  const planConfig = useMemo(() => {
    const name = planType === 'premium' ? 'Plan Premium' : (planType === 'start' ? 'Plan Start' : 'Plan Mensual');
    const totalPayments = planType === 'premium' ? 1 : (planType === 'start' ? 2 : 8);
    const paymentAmount = planType === 'premium' ? 10500 : (planType === 'start' ? 5500 : 1500);
    const totalAmount = planType === 'premium' ? 10500 : (planType === 'start' ? 11000 : 1500 * 8);
    const frequency = planType === 'premium' ? 'pago único' : (planType === 'start' ? 'por exhibición' : 'mensual');
    return { name, paymentAmount, totalPayments, frequency, startDate: activationDate, planType };
  }, [activationDate, planType]);

  const schedule = useMemo(() => generatePaymentSchedule({
    startDate: planConfig.startDate,
    totalPayments: planConfig.totalPayments,
    paymentAmount: planConfig.paymentAmount,
    planType: planConfig.planType,
    now: new Date(),
  }), [planConfig]);

  const nextPayment = useMemo(() => {
    return schedule.find(p => p.status !== 'paid') || null;
  }, [schedule]);

  // Notificación: 3 días antes del próximo pago
  const { addNotification } = useStudentNotifications();
  useEffect(() => {
    if (!nextPayment) return;
    try {
      const now = new Date();
      const dueDate = new Date(nextPayment.dueDate);
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const due = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
      const diffDays = Math.round((due - today) / (1000 * 60 * 60 * 24));

      const key = `notif_payment_3d_${due.toISOString().slice(0, 10)}`;
      const alreadyNotified = sessionStorage.getItem(key) === '1';

      if (diffDays === 3 && !alreadyNotified) {
        addNotification({
          type: NOTIFICATION_TYPES.PAYMENT,
          priority: NOTIFICATION_PRIORITIES.HIGH,
          title: 'Tu pago vence en 3 días',
          message: `Tu próximo pago de ${formatCurrencyMXN(nextPayment.amount)} vence el ${due.toLocaleDateString('es-MX')}. Realízalo a tiempo para evitar recargos.`,
          actionUrl: '/alumno/mis-pagos',
          metadata: {
            amount: nextPayment.amount,
            dueDate: due.toISOString(),
            tag: 'payment-3days',
          },
        });
        sessionStorage.setItem(key, '1');
      }
    } catch (e) {
      // No romper la vista si algo falla
      console.error('Error al preparar notificación de pago:', e);
    }
  }, [nextPayment, addNotification]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // TODO BACKEND: Verificar estado de pagos y acceso
        // const response = await fetch(`/api/students/${studentData.id}/payment-status`);
        // const data = await response.json();
        // 
        // hasPaid = data.hasPaid;
        // overdueDays = data.overdueDays;
        // 
        // if (!data.hasPaid) {
        //   // Si no ha pagado, redirigir a la página de pagos
  //   window.location.href = '/alumno/mis-pagos';
        // }
        
        // MOCK - Remover cuando conectes el backend
        // hasPaid = true;
        // overdueDays = 0;
        
        // Actualizar estado de la aplicación
        // checkPaymentStatus();
      } catch (error) {
        console.error('Error fetching payment status:', error);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-white">
        <div className="bg-white rounded-2xl shadow-xl p-6 text-center border border-gray-100">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-3"></div>
          <p className="text-gray-600">Cargando métodos de pago...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-white">
        <div className="bg-white rounded-2xl shadow-xl p-6 text-center border border-gray-100">
          <div className="text-4xl mb-4">💳</div>
          <p className="text-red-600">Error al cargar los métodos de pago: {error}</p>
        </div>
      </div>
    );
  }

  return (
  <div className="min-h-screen bg-white p-2.5 sm:p-3 md:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Título principal y navegación por tabs */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <h1 className="text-2xl xs:text-3xl sm:text-5xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-3 md:mb-0">
            MIS PAGOS
          </h1>
          
          {/* Tabs de navegación mejorados */}
      <div className="flex bg-white rounded-xl p-1 shadow-lg border border-gray-200">
            <button
              onClick={() => setActiveTab('current')}
        className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg font-medium transition-all duration-200 text-sm ${
                activeTab === 'current'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              📋 Plan Actual
            </button>
            <button
              onClick={() => setActiveTab('history')}
        className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg font-medium transition-all duration-200 text-sm ${
                activeTab === 'history'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              📚 Historial de pagos
            </button>
          </div>
        </div>

        {/* Contenido condicional basado en el tab activo */}
        {activeTab === 'current' ? (
          <div className="space-y-6">
            {/* Información del próximo pago (dinámica) */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-3 sm:p-4 md:p-6 text-white shadow-xl border border-gray-100">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <div>
                  <h3 className="text-base sm:text-lg font-bold mb-0.5">Próximo Pago</h3>
                  <p className="text-blue-100 text-xs sm:text-sm mb-1 sm:mb-2">
                    {nextPayment ? `Mes de ${nextPayment.month}` : 'Sin pagos próximos'}
                  </p>
                  <p className="text-xl sm:text-2xl font-bold">
                    {nextPayment ? formatCurrencyMXN(nextPayment.amount) : formatCurrencyMXN(0, { minDecimals: 2, maxDecimals: 2 })}
                  </p>
                </div>
                <div className="mt-4 md:mt-0">
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2.5 sm:p-3">
                    <p className="text-[11px] sm:text-xs text-blue-200 mb-0.5 sm:mb-1">Fecha límite de pago</p>
                    <p className="font-semibold">
                      {nextPayment ? nextPayment.dueDate.toLocaleDateString('es-ES') : '--/--/----'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Opciones de métodos de pago */}
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-4">Métodos de pago</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                {paymentMethods.map(method => (
                  <PaymentMethodCard
                    key={method.id}
                    method={method}
                    onClick={handleMethodClick}
                  />
                ))}
              </div>
            </div>

            {/* Comprobantes enviados se movió al Historial */}

            {/* Tabla de Plan de Pagos del curso actual */}
            <PaymentPlanTable onViewScheduleReceipt={handleViewScheduleReceipt} activationDate={activationDate} planType={planType} />
          </div>
        ) : (
          /* Tab de historial completo */
          <PaymentHistoryIntelligent
            allPaymentsHistory={studentData?.allPaymentsHistory || []}
            onViewReceipt={handleViewReceipt}
            uploadedReceipts={uploadedReceipts}
            onOpenComprobante={handleOpenVirtualReceipt}
          />
        )}

        {/* Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title={selectedMethod ? paymentMethodTitles[selectedMethod] : ''}
        >
          {renderModalContent()}
        </Modal>

        {/* Footer con información adicional */}
        {/* TODO BACKEND: Datos de contacto desde configuración del sistema */}
        <div className="bg-white rounded-2xl shadow-lg p-4 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-bold text-gray-800 mb-2">¿Necesitas ayuda?</h4>
              <div className="space-y-1 text-sm text-gray-600">
                {/* TODO BACKEND: Obtener desde /api/config/support */}
                <p>📧 Email: mqerkacademycienytec@gmail.com{/* config.supportEmail */}</p>
                <p>📞 Teléfono: 287-151-5760 {/* config.supportPhone */}</p>
                <p>💬 Chat en vivo: Lunes a Viernes 9:00 AM - 6:00 PM {/* config.chatHours */}</p>
              </div>
            </div>
            <div>
              <h4 className="font-bold text-gray-800 mb-2">Información importante</h4>
              <div className="space-y-1 text-sm text-gray-600">
                {/* TODO BACKEND: Políticas de pago desde /api/config/payment-policies */}
                <p>• Las transferencias SPEI pueden tardar hasta 24 horas en validarse</p>
                <p>• Los pagos en efectivo deben validarse presencial</p>
                <p>• Conserva siempre tu comprobante de pago</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TODO BACKEND: Componente de bloqueo si hay pagos vencidos */}
      {/* El bloqueo se manejará desde el StudentContext cuando se conecte con el backend */}
      {/* {!hasContentAccess && (
        <ContentBlockedAlert 
          overduePayments={overdueDays > 0 ? 1 : 0} 
          overdueDays={overdueDays} 
          onGoToPayments={() => setActiveTab('current')}
        />
      )} */}

      {/* Componente del recibo virtual */}
      <ComprobanteVirtual
        isOpen={showRecibo}
        onClose={() => {
          setShowRecibo(false);
          setSelectedPaymentForRecibo(null);
        }}
        paymentData={selectedPaymentForRecibo}
        studentData={{
          // Preferir datos reales del alumno si existen
          id: alumno?.id || studentData?.id,
          name: `${alumno?.nombre || ''} ${alumno?.apellidos || ''}`.trim() || studentData?.name,
          group: alumno?.grupo || studentData?.group,
          email: alumno?.email || studentData?.email,
          studentCode: alumno?.folio || studentData?.studentCode,
          // Dirección: usar comunidad1 / comunidad2 del alumno
          address: `${alumno?.comunidad1 || ''} ${alumno?.comunidad2 || ''}`.trim() || studentData?.address,
        }}
      />
    </div>
  );
}

export default MisPagos_Alumno_comp;