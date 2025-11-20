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
  <div className="relative mx-auto w-max">
    <div className="flex items-center gap-3 rounded-2xl bg-white/80 px-5 py-2.5 shadow-lg ring-1 ring-slate-200">
      <div className="grid h-7 w-7 place-items-center rounded-xl bg-violet-600 text-white shadow">
        <Icon className="h-4 w-4" />
      </div>
      <h2 className="text-lg sm:text-xl font-black tracking-wide text-slate-900">
        {text.toUpperCase()}
      </h2>
    </div>
    <div className="absolute inset-x-0 -bottom-2 mx-auto h-2 w-24 rounded-full bg-gradient-to-r from-violet-500 via-indigo-500 to-sky-500 opacity-70" />
  </div>
);

const Pill = ({ icon: Icon, label, hint, status = "pending", documento, onUpload, onDownload, onView, esLineamiento = false, onShowModal }) => {
  const isDone = status === "done";
  const fileInputRef = useRef(null);
  const hasFile = documento?.archivo_path;

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
        "group relative flex w-full items-center justify-between gap-3 rounded-xl px-4 py-3",
        "text-left shadow-sm ring-1 transition",
        isDone
          ? "bg-white ring-emerald-200 hover:ring-emerald-300"
          : "bg-white ring-violet-200 hover:ring-violet-300",
      ].join(" ")}
    >
      <span className="flex min-w-0 items-center gap-3 flex-1">
        <span
          className={[
            "grid h-8 w-8 shrink-0 place-items-center rounded-lg text-white shadow",
            isDone ? "bg-emerald-500" : "bg-violet-600",
          ].join(" ")}
        >
          <Icon className="h-4 w-4" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold text-slate-800">
            {label}
          </span>
          {hint && (
            <span className="block truncate text-xs text-slate-500">
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
              className="p-1.5 rounded-lg hover:bg-gray-100 transition"
              title="Ver documento"
            >
              <Eye className="h-4 w-4 text-blue-600" />
            </button>
            <button
              onClick={handleDownload}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition"
              title="Descargar documento"
            >
              <Download className="h-4 w-4 text-green-600" />
            </button>
          </>
        )}
        {!esLineamiento && (
          <>
            <button
              onClick={handleUploadClick}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition"
              title={hasFile ? "Reemplazar archivo" : "Subir archivo"}
            >
              <Upload className="h-4 w-4 text-violet-600" />
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
            "ml-3 grid h-5 w-5 place-items-center rounded-full text-[10px] font-bold shrink-0",
            isDone
              ? "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200"
              : "bg-violet-100 text-violet-700 ring-1 ring-violet-200",
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
  <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 sm:p-5 shadow-sm">
    <div className="mb-3">
      <div className="inline-flex rounded-xl bg-violet-50 px-3 py-1 ring-1 ring-violet-200">
        <span className="text-[13px] font-black tracking-wide text-violet-700">
          {title.toUpperCase()}
        </span>
      </div>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
    success: 'text-green-600',
    error: 'text-red-600',
    loading: 'text-blue-600 animate-spin'
  }[type] || 'text-gray-600';

  const bgClass = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    loading: 'bg-blue-50 border-blue-200'
  }[type] || 'bg-gray-50 border-gray-200';

  const Icon = {
    success: CheckCircle,
    error: AlertCircle,
    loading: Loader
  }[type] || AlertCircle;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className={`relative w-full max-w-md rounded-2xl border-2 ${bgClass} p-6 shadow-2xl`}>
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition"
        >
          <X className="h-5 w-5" />
        </button>
        
        <div className="flex flex-col items-center text-center">
          <Icon className={`h-16 w-16 mb-4 ${iconClass}`} />
          <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
          <p className="text-sm text-gray-600 mb-6">{message}</p>
          
          {type !== 'loading' && (
            <button
              onClick={onClose}
              className={`px-6 py-2 rounded-lg font-semibold transition ${
                type === 'success'
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-red-600 text-white hover:bg-red-700'
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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando documentos...</p>
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
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <p className="text-lg font-medium text-gray-700 mb-2">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700"
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
