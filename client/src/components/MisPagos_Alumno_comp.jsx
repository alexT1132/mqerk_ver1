import React, { useState, useEffect, useRef } from 'react';
import { useStudent } from '../context/StudentContext.jsx';

// Importa las imágenes locales
const tarjetaCreditoImg = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIGZpbGw9IiNmZmYiIHZpZXdCb3g9IjAgMCAyNCAyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMjAgNEg0Yy0xLjExIDAtMiAuODktMiAydj twelveYzAgMS4xMS44OSAyIDIgMmgxNmMxLjExIDAgMi0uODktMi0yVjZjMC0xLjExLS44OS0yLTItMnptMCAMTRINFY2aDE2djZ6bTAtMTBINFY2aDE2djJ6Ii8+PC9zdmc+';
const dineroImg = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIGZpbGw9IiNmZmYiIHZpZXdCb3g9IjAgMCAyNCAyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNNywxNUg5QzksxTYuMDggMTAuMzcsMTcgMTIsMTdDMTMuNjMsMTcgMTUsMTYuMDggMTUsMTVDMTUsMTM5IDEzLjk2LDEzLjUgMTEuNzYsMTIuOTdDOTkuNjQsMTIuNDQgNywxMS43OCA3LDlDNyw3LjIxIDguNDcsNS42OSAxMC41LDUuMThWM0gxMy41VjUuMThDMTUuNTMsNS42OSAxNyw3LjIxIDE3LDlDMTcsNy45MiAxNS42Myw3IDE0LDdDMTIuMzcsNyAxMSw3LjkyIDExLDlDMTEsMTAuMSAxMi4wNCwxMC41IDE0LjI0LDExLjAzQzE2LjM2LDExLjU2IDE5LDEyLjIyIDE5LDE1QzE5LDE2Ljc5IDE3LjUzLDE4LjMxIDE1LjUsMTguODJWMjFIMTIuNVYxOC44MkMxMC40NywxOC4zMSA5LDE2Ljc5IDksMTVaIi8+PC9zdmc+';

// --- Iconos SVG nativos ---
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

// --- Iconos para los métodos de pago ---
const IconoTarjeta = () => (
  <div className="w-12 h-12 md:w-14 md:h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-3">
    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
      <path d="M20 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>
    </svg>
  </div>
);

const IconoTransferencia = () => (
  <div className="w-12 h-12 md:w-14 md:h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-3">
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7 text-white">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h18M16.5 3L21 7.5m0 0L16.5 12M21 7.5H3" />
    </svg>
  </div>
);

const IconoEfectivo = () => (
  <div className="w-12 h-12 md:w-14 md:h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-3">
    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
      <path d="M7,15H9C9,16.08 10.37,17 12,17C13.63,17 15,16.08 15,15C15,13.9 13.96,13.5 11.76,12.97C9.64,12.44 7,11.78 7,9C7,7.21 8.47,5.69 10.5,5.18V3H13.5V5.18C15.53,5.69 17,7.21 17,9H15C15,7.92 13.63,7 12,7C10.37,7 9,7.92 9,9C9,10.1 10.04,10.5 12.24,11.03C14.36,11.56 17,12.22 17,15C17,16.79 15.53,18.31 13.5,18.82V21H10.5V18.82C8.47,18.31 7,16.79 7,15Z"/>
    </svg>
  </div>
);

// --- Componente Modal ---
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
    // Outer container: fixed, full horizontal width, with top and bottom margins, centered vertically, and allows scrolling
    <div className="fixed inset-x-0 top-20 bottom-4 z-[9999] flex items-center justify-center px-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content: relative, white background, rounded, shadow, max-width, full width, auto horizontal margins, and its height determined by content */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-auto my-auto max-h-[calc(100vh-10rem)] overflow-y-auto">
        {/* Header: sticky to top for scrolling content, with padding and border */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white rounded-t-2xl">
          <h2 className="text-xl font-bold text-gray-800">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Body: content area with padding */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

// --- Componente para subir archivos ---
function FileUpload({ onFileSelect, acceptedTypes = "image/*,application/pdf", maxSize = 5 }) {
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = (file) => {
    if (file.size > maxSize * 1024 * 1024) {
      // Reemplazado alert() con un mensaje en consola (o podrías usar un modal personalizado)
      console.error(`El archivo debe ser menor a ${maxSize}MB`); 
      return;
    }
    onFileSelect(file);
  };

  return (
    <div
      className={`border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200 cursor-pointer
        ${dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}
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
      rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 ease-in-out
      p-4 md:p-5 flex flex-col items-center justify-center text-center min-h-[160px] group`}
    >
      <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-2xl"></div>
      {method.icon}
      <h3 className="text-white text-sm md:text-base font-bold mt-1 leading-tight relative z-10">
        {method.title}
      </h3>
      <p className="text-white/80 text-xs mt-2 relative z-10">
        Haz clic para ver detalles
      </p>
      {method.id === 'card' && showComingSoon && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-purple-700/95 to-violet-900/95 rounded-2xl z-30 border-4 border-yellow-400 shadow-2xl">
          <span className="text-yellow-300 text-xl font-extrabold mb-2 drop-shadow-lg text-center">¡Muy pronto disponible!</span>
          <span className="text-white text-base font-semibold text-center max-w-xs">Estamos trabajando para ofrecerte pagos con tarjeta de forma segura y rápida. ¡Gracias por tu paciencia!</span>
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
            💳 Pagar con Tarjeta - $5,000 MXN
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
    bank: 'BANCOMER',
    beneficiary: 'MQERK S.A. DE C.V.',
    account: '1234567890',
    clabe: '002180033600000000'
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
          <h4 className="font-bold text-gray-800 mb-4">📝 Instrucciones</h4>
          <ol className="space-y-3 text-gray-700">
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">1</span>
              <span>Realiza una transferencia SPEI o depósito al número de cuenta/CLABE indicado</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">2</span>
              <span>Asegúrate de incluir tu nombre completo en la referencia o concepto de pago</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">3</span>
              <span>Sube tu comprobante de transferencia para validación rápida</span>
            </li>
          </ol>
        </div>

        <div>
          <h4 className="font-bold text-gray-800 mb-3">📄 Subir Comprobante</h4>
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
    address: 'Calle Falsa 123, Colonia Inventada, Ciudad Ejemplo',
    hours: 'Lunes a Viernes, 9:00 AM - 5:00 PM',
    contact: 'Tel: 55-1234-5678'
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
              <p className="font-semibold">{locationInfo.address}</p>
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
          <div className="bg-white rounded-lg p-4 border border-green-200">
            <h5 className="font-bold text-gray-800 mb-2">💰 Monto a Pagar</h5>
            <p className="text-2xl font-bold text-green-600">$5,000.00 MXN</p>
            <p className="text-sm text-gray-600 mt-1">Mes de {new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-50 rounded-xl p-6">
          <h4 className="font-bold text-gray-800 mb-4">📋 Instrucciones</h4>
          <ol className="space-y-3 text-gray-700">
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">1</span>
              <span>Acude a nuestra dirección en los horarios establecidos</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">2</span>
              <span>Presenta tu ID o folio de estudiante para registrar el pago</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">3</span>
              <span>Sube tu recibo físico para mantener el registro actualizado</span>
            </li>
          </ol>
        </div>

        <div>
          <h4 className="font-bold text-gray-800 mb-3">📄 Subir Comprobante</h4>
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

// --- Componente para el historial de pagos ---
function PaymentHistory({ payments, onFilterChange }) {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedStatus, setSelectedStatus] = useState('all');

  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const statusColors = {
    'paid': 'bg-green-100 text-green-800 border-green-200',
    'pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'rejected': 'bg-red-100 text-red-800 border-red-200'
  };

  const statusIcons = {
    'paid': <CheckCircle className="w-4 h-4" />,
    'pending': <Clock className="w-4 h-4" />,
    'rejected': <XCircle className="w-4 h-4" />
  };

  const statusLabels = {
    'paid': 'Pagado',
    'pending': 'Pendiente',
    'rejected': 'Rechazado'
  };

  const filteredPayments = payments.filter(payment => {
    const paymentYear = new Date(payment.date).getFullYear();
    const matchesYear = paymentYear === selectedYear;
    const matchesStatus = selectedStatus === 'all' || payment.status === selectedStatus;
    return matchesYear && matchesStatus;
  });

  const getPaymentForMonth = (monthIndex) => {
    return filteredPayments.find(payment => 
      new Date(payment.date).getMonth() === monthIndex
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4 md:mb-0">
          Historial de Pagos
        </h3>
        
        <div className="flex gap-4">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          >
            {[2023, 2024, 2025].map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          >
            <option value="all">Todos los estados</option>
            <option value="paid">Pagados</option>
            <option value="pending">Pendientes</option>
            <option value="rejected">Rechazados</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {months.map((month, index) => {
          const payment = getPaymentForMonth(index);
          const isPaid = payment?.status === 'paid';
          const isPending = payment?.status === 'pending';
          const isRejected = payment?.status === 'rejected';

          return (
            <div
              key={index}
              className={`p-3 rounded-xl border-2 transition-all duration-200 ${
                isPaid ? 'bg-green-50 border-green-200' :
                isPending ? 'bg-yellow-50 border-yellow-200' :
                isRejected ? 'bg-red-50 border-red-200' :
                'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-800 text-sm">{month}</h4>
                {payment && (
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs border ${statusColors[payment.status]}`}>
                    {statusIcons[payment.status]}
                    {statusLabels[payment.status]}
                  </div>
                )}
              </div>
              
              {payment ? (
                <div className="space-y-1">
                  <p className="text-xs text-gray-600">
                    <strong>Método:</strong> {payment.method}
                  </p>
                  <p className="text-xs text-gray-600">
                    <strong>Monto:</strong> ${payment.amount.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-600">
                    <strong>Fecha:</strong> {new Date(payment.date).toLocaleDateString()}
                  </p>
                  
                  {payment.receipt && (
                    <div className="flex gap-2 mt-2">
                      <button className="flex-1 text-sm bg-blue-100 text-blue-700 py-2 rounded-lg hover:bg-blue-200 transition flex items-center justify-center gap-2">
                        <Eye className="w-4 h-4" />
                        Ver archivo
                      </button>
                      <button className="flex-1 text-sm bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition flex items-center justify-center gap-2">
                        <Download className="w-4 h-4" />
                        Descargar
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-gray-500">Sin pago registrado</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Componente principal para la página "Mis Pagos" del alumno.
 */
export default function MisPagos_Alumno_comp({ isLoading: propIsLoading, error: propError }) {
  const { studentData, hasPaid, currentCourse } = useStudent();
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [isLoading, setIsLoading] = useState(propIsLoading);
  const [error, setError] = useState(propError);
  const [activeTab, setActiveTab] = useState('payment');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [paymentHistory, setPaymentHistory] = useState([
    {
      id: 1,
      month: 0,
      year: 2025,
      date: '2025-01-15',
      method: 'Tarjeta de Crédito',
      amount: 5000,
      status: 'paid',
      receipt: 'receipt_enero_2025.pdf'
    },
    {
      id: 2,
      month: 1,
      year: 2025,
      date: '2025-02-15',
      method: 'Transferencia SPEI',
      amount: 5000,
      status: 'paid',
      receipt: 'comprobante_febrero_2025.jpg'
    },
    {
      id: 3,
      month: 2,
      year: 2025,
      date: '2025-03-10',
      method: 'Efectivo',
      amount: 5000,
      status: 'pending',
      receipt: 'recibo_marzo_2025.pdf'
    },
    {
      id: 4,
      month: 3,
      year: 2025,
      date: '2025-04-08',
      method: 'Transferencia SPEI',
      amount: 5000,
      status: 'rejected',
      receipt: 'comprobante_abril_2025.jpg'
    }
  ]);

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

  const handleReceiptUpload = (methodId, file) => {
    console.log(`Archivo subido para método ${methodId}:`, file);
    
    const newPayment = {
      id: paymentHistory.length + 1,
      month: new Date().getMonth(),
      year: new Date().getFullYear(),
      date: new Date().toISOString().split('T')[0],
      method: methodId === 'card' ? 'Tarjeta de Crédito' : 
              methodId === 'transfer' ? 'Transferencia SPEI' : 'Efectivo',
      amount: 5000,
      status: 'pending',
      receipt: file.name
    };
    
    setPaymentHistory(prev => [...prev, newPayment]);
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-3"></div>
          <p className="text-gray-600">Cargando métodos de pago...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-50 to-red-50">
        <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
          <div className="text-4xl mb-4">💳</div>
          <p className="text-red-600">Error al cargar los métodos de pago: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 p-3 md:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Título principal y navegación por tabs */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <h2 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4 md:mb-0">
            MIS PAGOS
          </h2>
          
          {/* Tabs de navegación */}
          <div className="flex bg-white rounded-xl p-1 shadow-md border border-gray-200">
            <button
              onClick={() => setActiveTab('payment')}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 text-sm ${
                activeTab === 'payment'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              Realizar Pago
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 text-sm ${
                activeTab === 'history'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              <Calendar className="w-4 h-4 inline mr-1" />
              Historial
            </button>
          </div>
        </div>

        {/* Contenido condicional basado en el tab activo */}
        {activeTab === 'payment' ? (
          <div className="space-y-6">
            {/* Resumen de estado de pagos mejorado */}
            <div className="flex justify-center">
              {/* Changed from flex-col to grid for 2 columns on mobile */}
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3 sm:gap-4 w-full max-w-2xl">
                {/* Pagos Realizados */}
                {/* Removed flex-1 min-w-0 as grid handles sizing */}
                <div className="bg-white rounded-xl shadow-md border border-gray-200 p-2 sm:p-4">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm text-gray-600 mb-1 truncate">Pagos Realizados</p>
                      <p className="text-base sm:text-xl font-bold text-green-600">
                        {paymentHistory.filter(p => p.status === 'paid').length}
                      </p>
                    </div>
                    <div className="w-6 h-6 sm:w-10 sm:h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 ml-2">
                      <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                    </div>
                  </div>
                </div>
                
                {/* Pagos Pendientes */}
                <div className="bg-white rounded-xl shadow-md border border-gray-200 p-2 sm:p-4">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm text-gray-600 mb-1 truncate">Pagos Pendientes</p>
                      <p className="text-base sm:text-xl font-bold text-yellow-600">
                        {paymentHistory.filter(p => p.status === 'pending').length}
                      </p>
                    </div>
                    <div className="w-6 h-6 sm:w-10 sm:h-10 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0 ml-2">
                      <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600" />
                    </div>
                  </div>
                </div>
                
                {/* Pagos Rechazados */}
                <div className="bg-white rounded-xl shadow-md border border-gray-200 p-2 sm:p-4">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm text-gray-600 mb-1 truncate">Pagos Rechazados</p>
                      <p className="text-base sm:text-xl font-bold text-red-600">
                        {paymentHistory.filter(p => p.status === 'rejected').length}
                      </p>
                    </div>
                    <div className="w-6 h-6 sm:w-10 sm:h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0 ml-2">
                      <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Información del próximo pago */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-4 md:p-6 text-white shadow-lg">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="text-lg font-bold mb-1">Próximo Pago</h3>
                  <p className="text-blue-100 text-sm mb-2">Mes de {new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}</p>
                  <p className="text-2xl font-bold">$5,000.00 MXN</p>
                </div>
                <div className="mt-4 md:mt-0">
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
                    <p className="text-xs text-blue-100 mb-1">Fecha límite de pago</p>
                    <p className="font-semibold">
                      {new Date(new Date().setDate(new Date().getDate() + 15)).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Opciones de métodos de pago */}
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-4">Selecciona tu método de pago</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {paymentMethods.map(method => (
                  <PaymentMethodCard
                    key={method.id}
                    method={method}
                    onClick={handleMethodClick}
                  />
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Tab de Historial */
          <PaymentHistory 
            payments={paymentHistory}
            onFilterChange={(filters) => console.log('Filtros aplicados:', filters)}
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
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-md p-4 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-bold text-gray-800 mb-2">¿Necesitas ayuda?</h4>
              <div className="space-y-1 text-sm text-gray-600">
                <p>📧 Email: pagos@mqerk.com</p>
                <p>📞 Teléfono: 55-1234-5678</p>
                <p>💬 Chat en vivo: Lunes a Viernes 9:00 AM - 6:00 PM</p>
              </div>
            </div>
            <div>
              <h4 className="font-bold text-gray-800 mb-2">Información importante</h4>
              <div className="space-y-1 text-sm text-gray-600">
                <p>• Los pagos con tarjeta se procesan inmediatamente</p>
                <p>• Las transferencias SPEI pueden tardar hasta 24 horas en validarse</p>
                <p>• Los pagos en efectivo deben validarse presencial</p>
                <p>• Conserva siempre tu comprobante de pago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}