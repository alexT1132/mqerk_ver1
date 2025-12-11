// DocumentCenter.jsx
import React, { useState, useEffect, useRef } from "react";
import {
  FileUp,
  FileText,
  IdCard,
  Image,
  GraduationCap,
  Medal,
  ClipboardCheck,
  ShieldCheck,
  BookOpen,
  ScrollText,
  Handshake,
  BadgeCheck,
  X,
  Download,
  Upload,
  Eye,
  CheckCircle,
  AlertCircle,
  Loader,
} from "lucide-react";
import { getDocumentos, uploadDocumento, downloadDocumento, deleteDocumento } from "../../api/documentos.js";

/* ---------- UI helpers ---------- */

const TitleBar = ({ icon: Icon, text }) => (
  <div className="relative mx-auto w-max mb-8">
    <div className="flex items-center gap-4 rounded-3xl bg-gradient-to-r from-violet-50/80 via-indigo-50/80 to-purple-50/80 px-6 py-4 shadow-xl ring-2 ring-slate-100/50 border-2 border-violet-200/60">
      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-600 text-white shadow-2xl ring-4 ring-white/50">
        <Icon className="h-6 w-6" />
      </div>
      <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600">
        {text.toUpperCase()}
      </h2>
    </div>
    <div className="absolute inset-x-0 -bottom-3 mx-auto h-2 w-32 rounded-full bg-gradient-to-r from-violet-500 via-indigo-500 to-purple-500 shadow-md" />
  </div>
);

const Pill = ({ icon: Icon, label, hint, status = "pending", documento, onUpload, onDownload, onView, esLineamiento = false, onShowModal }) => {
  const fileInputRef = useRef(null);
  const hasFile = documento?.archivo_path;
  // Si tiene archivo, se considera completado independientemente del estado del backend
  const isDone = status === "done" || !!hasFile;

  const handleUploadClick = (e) => {
    e.stopPropagation();
    if (esLineamiento) {
      onShowModal({
        type: 'error',
        title: 'Documento de la empresa',
        message: 'Los lineamientos son documentos de la empresa y no se pueden modificar'
      });
      return;
    }
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validar tamaño del archivo (10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      onShowModal({
        type: 'error',
        title: 'Archivo muy grande',
        message: 'El archivo no puede ser mayor a 10MB'
      });
      e.target.value = '';
      return;
    }
    
    // Validar tipo de archivo
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      onShowModal({
        type: 'error',
        title: 'Tipo de archivo no permitido',
        message: 'Solo se permiten archivos PDF, imágenes (JPG, PNG) o documentos (DOC, DOCX)'
      });
      e.target.value = '';
      return;
    }
    
    onShowModal({
      type: 'loading',
      title: 'Subiendo documento',
      message: `Subiendo ${file.name}...`
    });
    
    try {
      await onUpload(documento.id, file);
      onShowModal({
        type: 'success',
        title: 'Documento subido',
        message: 'El documento se ha subido correctamente'
      });
      // Recargar después de un breve delay para que el usuario vea el mensaje
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      onShowModal({
        type: 'error',
        title: 'Error al subir',
        message: error.message || 'Error al subir el documento. Intenta nuevamente.'
      });
    }
    e.target.value = ''; // Reset input
  };

  const handleDownload = async (e) => {
    e.stopPropagation();
    try {
      await onDownload(documento.id);
      onShowModal({
        type: 'success',
        title: 'Descarga iniciada',
        message: 'El documento se está descargando'
      });
    } catch (error) {
      onShowModal({
        type: 'error',
        title: 'Error al descargar',
        message: error.message || 'Error al descargar el documento'
      });
    }
  };

  const handleView = async (e) => {
    e.stopPropagation();
    if (hasFile) {
      const host = window.location.hostname;
      const apiUrl = import.meta.env.VITE_API_URL || `http://${host}:1002/api`;
      const fileUrl = `${apiUrl.replace('/api', '')}${documento.archivo_path}`;
      window.open(fileUrl, '_blank');
    }
  };

  return (
    <div
      className={[
        "group relative flex w-full items-center justify-between gap-4 rounded-2xl px-5 py-4",
        "text-left shadow-md ring-2 transition-all duration-200 hover:shadow-xl hover:-translate-y-1",
        isDone
          ? "bg-white ring-emerald-200 hover:ring-emerald-300 border-2 border-emerald-200"
          : "bg-white ring-violet-200 hover:ring-violet-300 border-2 border-violet-200",
      ].join(" ")}
    >
      <span className="flex min-w-0 items-center gap-4 flex-1">
        <span
          className={[
            "grid h-10 w-10 shrink-0 place-items-center rounded-xl text-white shadow-lg ring-2 transition-transform duration-200 group-hover:scale-110",
            isDone ? "bg-gradient-to-br from-emerald-500 to-teal-600 ring-emerald-300" : "bg-gradient-to-br from-violet-600 to-indigo-600 ring-violet-300",
          ].join(" ")}
        >
          <Icon className="h-5 w-5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-bold text-slate-900">
            {label}
          </span>
          {hint && (
            <span className="block truncate text-xs text-slate-600 font-medium mt-0.5">
              {hint}
            </span>
          )}
        </span>
      </span>

      <div className="flex items-center gap-2">
        {hasFile && (
          <>
            <button
              onClick={handleView}
              className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-110 active:scale-95"
              title="Ver documento"
            >
              <Eye className="h-4 w-4" />
            </button>
            <button
              onClick={handleDownload}
              className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-110 active:scale-95"
              title="Descargar documento"
            >
              <Download className="h-4 w-4" />
            </button>
          </>
        )}
        {!esLineamiento && (
          <>
            <button
              onClick={handleUploadClick}
              className="p-2 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 hover:from-violet-600 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-110 active:scale-95"
              title={hasFile ? "Reemplazar archivo" : "Subir archivo"}
            >
              <Upload className="h-4 w-4" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              onChange={handleFileChange}
              className="hidden"
            />
          </>
        )}
        <span
          className={[
            "ml-2 grid h-6 w-6 place-items-center rounded-full text-xs font-extrabold shrink-0 ring-2 shadow-md",
            isDone
              ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white ring-emerald-300"
              : "bg-gradient-to-r from-amber-500 to-orange-600 text-white ring-amber-300",
          ].join(" ")}
          title={isDone ? "Completado" : "Pendiente"}
        >
          {isDone ? "✓" : "!"}
        </span>
      </div>
    </div>
  );
};

const Card = ({ title, items, onUpload, onDownload, esLineamientos = false, onShowModal }) => (
  <div className="rounded-3xl border-2 border-slate-200 bg-white p-5 sm:p-6 shadow-xl ring-2 ring-slate-100/50">
    <div className="mb-5">
      <div className="inline-flex rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2 ring-2 ring-violet-300 shadow-md">
        <span className="text-sm font-extrabold tracking-widest text-white">
          {title.toUpperCase()}
        </span>
      </div>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {items.map((it) => (
        <Pill 
          key={it.id || it.label} 
          {...it} 
          onUpload={onUpload}
          onDownload={onDownload}
          esLineamiento={esLineamientos}
          onShowModal={onShowModal}
        />
      ))}
    </div>
  </div>
);

/* ---------- Mapeo de iconos por nombre de documento ---------- */
const iconMap = {
  'INE ambos lados': IdCard,
  'Comprobante de domicilio': FileText,
  'CIF SAT': BadgeCheck,
  'Título académico': GraduationCap,
  'Cédula Profesional': Medal,
  'Certificaciones': ClipboardCheck,
  'CV actualizado': FileUp,
  'Fotografía profesional': Image,
  'Carta de recomendación': FileText,
  'Contrato de prestación de servicios': Handshake,
  'Reglamento interno': ShieldCheck,
  'Políticas de privacidad': ScrollText,
  'Normativa': BookOpen,
  'Términos y condiciones': ScrollText,
  'Modelo educativo': GraduationCap,
};

/* ---------- Modal personalizado ---------- */
const CustomModal = ({ isOpen, onClose, type, title, message }) => {
  if (!isOpen) return null;

  const iconClass = {
    success: 'text-white',
    error: 'text-white',
    loading: 'text-white animate-spin'
  }[type] || 'text-gray-600';

  const bgClass = {
    success: 'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-300',
    error: 'bg-gradient-to-br from-rose-50 to-red-50 border-rose-300',
    loading: 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-300'
  }[type] || 'bg-gray-50 border-gray-200';

  const iconBgClass = {
    success: 'bg-gradient-to-br from-emerald-500 to-teal-600',
    error: 'bg-gradient-to-br from-rose-500 to-red-600',
    loading: 'bg-gradient-to-br from-blue-500 to-indigo-600'
  }[type] || 'bg-gray-500';

  const Icon = {
    success: CheckCircle,
    error: AlertCircle,
    loading: Loader
  }[type] || AlertCircle;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className={`relative w-full max-w-md rounded-3xl border-2 ${bgClass} p-8 shadow-2xl ring-2 ring-slate-100/50`}>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-all p-1.5 rounded-lg hover:bg-white/50"
        >
          <X className="h-5 w-5" />
        </button>
        
        <div className="flex flex-col items-center text-center">
          <div className={`inline-flex items-center justify-center h-20 w-20 rounded-full ${iconBgClass} mb-5 shadow-xl ring-4 ring-white/50`}>
            <Icon className={`h-10 w-10 ${iconClass}`} />
          </div>
          <h3 className="text-2xl font-extrabold text-slate-800 mb-3">{title}</h3>
          <p className="text-sm text-slate-600 font-medium mb-8">{message}</p>
          
          {type !== 'loading' && (
            <button
              onClick={onClose}
              className={`px-6 py-3 rounded-xl font-bold transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl ${
                type === 'success'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white'
                  : 'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white'
              }`}
            >
              Cerrar
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

/* ---------- Página principal ---------- */

export default function DocumentCenter() {
  const [documentos, setDocumentos] = useState({ documento: [], contrato: [], lineamiento: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modal, setModal] = useState({ isOpen: false, type: 'success', title: '', message: '' });

  // Cargar documentos desde la API
  useEffect(() => {
    const loadDocumentos = async () => {
      try {
        setLoading(true);
        const response = await getDocumentos();
        if (response.success) {
          // Mapear documentos a formato esperado por el componente
          const mapDocumentos = (docs) => docs.map(doc => ({
            id: doc.id,
            label: doc.nombre,
            hint: doc.descripcion || null,
            status: doc.estado === 'done' ? 'done' : 'pending',
            icon: iconMap[doc.nombre] || FileText,
            documento: doc,
          }));

          setDocumentos({
            documento: mapDocumentos(response.data.documento || []),
            contrato: mapDocumentos(response.data.contrato || []),
            lineamiento: mapDocumentos(response.data.lineamiento || []),
          });
        }
      } catch (err) {
        console.error('Error cargando documentos:', err);
        setError(err.message || 'Error al cargar documentos');
      } finally {
        setLoading(false);
      }
    };

    loadDocumentos();
  }, []);

  const handleUpload = async (id, file) => {
    await uploadDocumento(id, file);
  };

  const handleDownload = async (id) => {
    await downloadDocumento(id);
  };

  const showModal = ({ type, title, message }) => {
    setModal({ isOpen: true, type, title, message });
  };

  const closeModal = () => {
    setModal({ isOpen: false, type: 'success', title: '', message: '' });
  };

  if (loading) {
    return (
      <div className="w-full mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 mb-5 shadow-xl ring-4 ring-violet-200">
              <Loader className="h-8 w-8 text-white animate-spin" />
            </div>
            <p className="text-lg font-bold text-slate-700">Cargando documentos...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-gradient-to-br from-rose-500 to-red-600 mb-5 shadow-xl ring-4 ring-rose-200">
              <AlertCircle className="h-10 w-10 text-white" />
            </div>
            <p className="text-xl font-bold text-slate-700 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 active:scale-95"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="w-full mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* Encabezado general */}
        <TitleBar icon={FileUp} text="Documentación" />

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sección Documentación */}
          <Card 
            title="Documentos" 
            items={documentos.documento} 
            onUpload={handleUpload}
            onDownload={handleDownload}
            onShowModal={showModal}
          />

          {/* Sección Contrato Laboral (a la derecha en desktop) */}
          <Card 
            title="Contrato laboral" 
            items={documentos.contrato}
            onUpload={handleUpload}
            onDownload={handleDownload}
            onShowModal={showModal}
          />
        </div>

        {/* Sección Lineamientos (full width) */}
        <div className="mt-6">
          <Card 
            title="Lineamientos" 
            items={documentos.lineamiento}
            onUpload={handleUpload}
            onDownload={handleDownload}
            esLineamientos={true}
            onShowModal={showModal}
          />
        </div>
      </div>

      {/* Modal personalizado */}
      <CustomModal
        isOpen={modal.isOpen}
        onClose={closeModal}
        type={modal.type}
        title={modal.title}
        message={modal.message}
      />
    </>
  );
}
