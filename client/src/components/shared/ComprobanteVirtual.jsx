import React, { useState, useRef } from 'react';
import { useStudent } from '../../context/StudentContext.jsx';
import { useStudentDataForRecibo } from '../../hooks/useReciboData.js';

/*
EJEMPLO DE USO CON BACKEND:

// Datos que vienen del backend
const paymentDataFromBackend = {
  id: 1234,
  date: "2025-07-15T10:30:00Z",
  amount: 5000.00,
  baseAmount: 5000.00,
  discount: 0,
  penalty: 0,
  method: "Efectivo",
  status: "paid",
  plan: "Plan Mensual - Pago 1",
  cashReceived: 5000.00,
  transactionId: "TXN-2025-07-15-001",
  verificationDate: "2025-07-15T10:35:00Z"
};

const studentDataFromBackend = {
  id: 567,
  name: "Juan Carlos Pérez López",
  address: "Av. Independencia #123, Col. Centro, Tuxtepec, Oaxaca",
  group: "Matutino",
  phone: "287-123-4567",
  email: "juan.perez@email.com",
  studentCode: "STU-2025-567"
};

// Uso del componente
<ComprobanteVirtual
  isOpen={showReceipt}
  onClose={() => setShowReceipt(false)}
  paymentData={paymentDataFromBackend}
  studentData={studentDataFromBackend}
/>

// ENDPOINTS RECOMENDADOS PARA EL BACKEND:
// GET /api/payments/{paymentId}/receipt-data
// GET /api/students/{studentId}/receipt-data
// POST /api/receipts/generate (para generar y guardar el comprobante)
*/

// Iconos SVG
const X = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const Download = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
  </svg>
);

const Printer = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.32 0H6.34m11.32 0l-.229-2.523M6.34 18l.229-2.523m0 0a48.78 48.78 0 00-1.716-.347M12 10.5h6m-6 3h6m-6 3h6" />
  </svg>
);

// Componente Modal para el recibo
function ReciboModal({ isOpen, onClose, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm pt-16 sm:pt-20">
      <div className="relative bg-white rounded-lg shadow-2xl max-w-sm w-full max-h-[80vh] overflow-y-auto mt-4 sm:mt-8">
        {/* Header del modal */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-3 rounded-t-lg">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800 text-center flex-1">📄 Comprobante de Pago</h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded transition-colors ml-2"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Contenido del modal */}
        <div className="p-3">
          {children}
        </div>
      </div>
    </div>
  );
}

// Componente principal del recibo virtual
export default function ComprobanteVirtual({ 
  isOpen, 
  onClose, 
  paymentData, // Datos del pago desde el backend
  studentData: propStudentData // Datos del estudiante desde el backend
}) {
  const reciboRef = useRef(null);
  const { currentCourse } = useStudent();
  const { studentForRecibo, courseInfo } = useStudentDataForRecibo();
  
  // Usar datos de la prop (backend) o del hook (mock/local)
  const finalStudentData = propStudentData || studentForRecibo;

  // BACKEND INTEGRATION: Estructura esperada para paymentData
  /*
  paymentData = {
    id: number,                    // ID único del pago
    date: string,                  // Fecha del pago (ISO format)
    amount: number,                // Monto total a pagar
    baseAmount: number,            // Monto base (opcional)
    discount: number,              // Descuento aplicado (opcional)
    penalty: number,               // Recargo por mora (opcional)
    method: string,                // Método de pago (ej: "Efectivo", "Tarjeta", "Transferencia")
    status: string,                // Estado del pago ("paid", "pending", "failed")
    plan: string,                  // Plan de pago (ej: "Mensual", "Semanal")
    verificationDate: string,      // Fecha de verificación (opcional)
    cashReceived: number,          // Efectivo recibido (opcional, por defecto 700.00)
    transactionId: string,         // ID de transacción (opcional)
    paymentReference: string,      // Referencia de pago (opcional)
  }
  */

  // BACKEND INTEGRATION: Estructura esperada para studentData
  /*
  studentData = {
    id: number,                    // ID único del estudiante
    name: string,                  // Nombre completo del estudiante
    address: string,               // Dirección completa
    phone: string,                 // Teléfono (opcional)
    email: string,                 // Email (opcional)
    group: string,                 // Grupo asignado (ej: "Matutino", "Vespertino")
    enrollmentDate: string,        // Fecha de inscripción (opcional)
    studentCode: string,           // Código de estudiante (opcional)
  }
  */

  // BACKEND INTEGRATION: Estructura esperada para courseInfo
  /*
  courseInfo = {
    id: number,                    // ID único del curso
    name: string,                  // Nombre del curso
    duration: string,              // Duración (ej: "10 horas", "3 meses")
    level: string,                 // Nivel (ej: "Elemental", "Intermedio")
    price: number,                 // Precio del curso
    startDate: string,             // Fecha de inicio (opcional)
    endDate: string,               // Fecha de fin (opcional)
    instructor: string,            // Instructor asignado (opcional)
  }
  */

  // Función para generar el folio único
  const generateFolio = (paymentId, date) => {
    const dateStr = new Date(date).toISOString().slice(0, 10).replace(/-/g, '');
    return `MQ-${dateStr}-${String(paymentId).padStart(4, '0')}`;
  };

  // Función alternativa para descargar usando DOM-to-image como fallback
  const handleDownloadFallback = async () => {
    try {
      // Generar un HTML simple del recibo para descarga
      const reciboHTML = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Comprobante de Pago - ${generateFolio(paymentData.id, paymentData.date)}</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @page {
              size: A4;
              margin: 0.5in;
            }
            @media print {
              html, body { 
                font-family: 'Courier New', monospace; 
                margin: 0; 
                padding: 0;
                height: auto;
                overflow: visible;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              .recibo-container { 
                max-width: 300px; 
                margin: 0 auto; 
                page-break-inside: avoid;
                page-break-after: avoid;
                height: auto;
              }
              * {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              /* Evitar páginas vacías */
              .space-y-3 { page-break-inside: avoid; }
              .bg-gray-50 { background-color: #f9fafb !important; }
              .bg-blue-50 { background-color: #eff6ff !important; }
              .bg-yellow-50 { background-color: #fefce8 !important; }
              .border-dashed { border-style: dashed !important; }
              .text-blue-600 { color: #2563eb !important; }
              .text-green-600 { color: #16a34a !important; }
              .text-red-600 { color: #dc2626 !important; }
              .text-purple-600 { color: #9333ea !important; }
              .text-gray-600 { color: #4b5563 !important; }
              .text-gray-700 { color: #374151 !important; }
              .text-gray-800 { color: #1f2937 !important; }
            }
            body { 
              font-family: 'Courier New', monospace; 
              margin: 10px;
              height: auto;
            }
            /* Estilos adicionales para Tailwind */
            .text-xs { font-size: 12px; }
            .text-sm { font-size: 14px; }
            .text-lg { font-size: 18px; }
            .mb-2 { margin-bottom: 8px; }
            .mt-1 { margin-top: 4px; }
            .py-2 { padding: 8px 0; }
            .p-2 { padding: 8px; }
            .space-y-1 > * + * { margin-top: 4px; }
            .space-y-2 > * + * { margin-top: 8px; }
            .space-y-3 > * + * { margin-top: 12px; }
            .rounded { border-radius: 6px; }
            .border-dashed { border-style: dashed; }
            .flex { display: flex; }
            .justify-between { justify-content: space-between; }
            .items-center { align-items: center; }
            .flex-1 { flex: 1; }
            .pr-2 { padding-right: 8px; }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            .text-left { text-align: left; }
            .font-bold { font-weight: bold; }
            .font-medium { font-weight: 500; }
            .font-semibold { font-weight: 600; }
            .max-w-xs { max-width: 300px; }
            .mx-auto { margin: 0 auto; }
            .border { border: 1px solid; }
            .border-t { border-top: 1px solid; }
            .border-b { border-bottom: 1px solid; }
            .border-t-2 { border-top: 2px solid; }
            .border-b-2 { border-bottom: 2px solid; }
            .border-gray-300 { border-color: #d1d5db; }
            .border-gray-600 { border-color: #4b5563; }
            .bg-white { background-color: white; }
            .shadow-sm { box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05); }
            .leading-tight { line-height: 1.25; }
            .tracking-wide { letter-spacing: 0.025em; }
            .pb-2 { padding-bottom: 8px; }
            .pt-2 { padding-top: 8px; }
            .gap-2 { gap: 8px; }
            .mb-1 { margin-bottom: 4px; }
            .mt-2 { margin-top: 8px; }
          </style>
        </head>
        <body>
          <div class="recibo-container">
            ${reciboRef.current.innerHTML}
          </div>
          <script>
            // Auto-imprimir al cargar si se desea
            window.onload = function() {
              const params = new URLSearchParams(window.location.search);
              if (params.get('print') === 'true') {
                setTimeout(() => {
                  window.print();
                }, 500);
              }
            };
          </script>
        </body>
        </html>
      `;
      
      const blob = new Blob([reciboHTML], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `comprobante-pago-${generateFolio(paymentData.id, paymentData.date)}.html`;
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      console.log('Recibo descargado como HTML');
    } catch (error) {
      console.error('Error en descarga alternativa:', error);
      alert('No se pudo descargar el comprobante. Intente con la opción de imprimir.');
    }
  };

  // Función para generar PDF usando jsPDF
  const handleDownloadPDF = async () => {
    try {
      // Importar jsPDF dinámicamente
      const jsPDF = (await import('jspdf')).default;
      
      // Crear una nueva instancia de jsPDF con formato de ticket más grande
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [80, 400] // Formato de ticket térmico mucho más alto
      });
      
      // Configurar fuente
      doc.setFont('courier');
      doc.setFontSize(10);
      
      // Variables para posición
      let yPosition = 15;
      const leftMargin = 5;
      const rightMargin = 75;
      const lineHeight = 6; // Más espacio entre líneas
      
      // Función helper para agregar texto centrado
      const addCenteredText = (text, size = 10, bold = false) => {
        doc.setFontSize(size);
        if (bold) doc.setFont('courier', 'bold');
        else doc.setFont('courier', 'normal');
        
        const textWidth = doc.getTextWidth(text);
        const xPosition = (80 - textWidth) / 2;
        doc.text(text, xPosition, yPosition);
        yPosition += lineHeight + 2; // Aún más espacio entre líneas
      };
      
      // Función helper para agregar línea
      const addLine = () => {
        doc.line(leftMargin, yPosition, rightMargin, yPosition);
        yPosition += lineHeight + 2; // Más espacio después de líneas
      };
      
      // Header
      addCenteredText('MQerK Academy', 12, true);
      addCenteredText('Asesores Especializados en la');
      addCenteredText('Enseñanza de las Cien y Tec');
      addCenteredText('C. Benito Juárez #25 Col. Centro', 9, true);
      addCenteredText('Tuxtepec, Oaxaca C.P. 68300');
      addCenteredText('Tel. 287-181-1231', 9, true);
      addCenteredText('RFC: GQRK980906K61');
      
      yPosition += 2;
      addLine();
      
      // Fecha y folio
      const fechaActual = new Date().toLocaleDateString('es-ES');
      const horaActual = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false });
      
      addCenteredText(`${fechaActual} ${horaActual} a. m.`, 10, true);
      addCenteredText('Horas', 8);
      addCenteredText(`Folio: ${generateFolio(paymentData.id, paymentData.date)}`, 10, true);
      
      yPosition += 2;
      addLine();
      
      // Datos del cliente
      doc.setFontSize(8);
      doc.setFont('courier', 'bold');
      doc.text('Cliente:', leftMargin, yPosition);
      yPosition += lineHeight;
      
      doc.setFont('courier', 'normal');
      doc.text(safeStudentData.name, leftMargin, yPosition);
      yPosition += lineHeight;
      
      doc.text('Dirección:', leftMargin, yPosition);
      yPosition += lineHeight;
      doc.text(safeStudentData.address, leftMargin, yPosition);
      yPosition += lineHeight;
      
      doc.text(`Servicio: ${safeCourseInfo.name}`, leftMargin, yPosition);
      yPosition += lineHeight;
      doc.text(`Sesiones: ${safePaymentData.plan}`, leftMargin, yPosition);
      yPosition += lineHeight;
      doc.text(`Grupo: ${safeStudentData.group}`, leftMargin, yPosition);
      yPosition += lineHeight;
      
      yPosition += 2;
      addLine();
      
      // Conceptos
      addCenteredText('CONCEPTO ――――――― IMPORTE', 9, true);
      yPosition += 2;
      
      doc.setFontSize(8);
      doc.setFont('courier', 'normal');
      doc.text(`Curso ${safeCourseInfo.name}`, leftMargin, yPosition);
      doc.text(`$${safePaymentData.baseAmount.toFixed(2)}`, rightMargin - 20, yPosition);
      yPosition += lineHeight;
      
      doc.text(`${safeCourseInfo.level}`, leftMargin, yPosition);
      yPosition += lineHeight;
      
      doc.text('IVA (0%)', leftMargin, yPosition);
      doc.text('$0.00', rightMargin - 20, yPosition);
      yPosition += lineHeight;
      
      if (safePaymentData.discount > 0) {
        doc.text('Descuento', leftMargin, yPosition);
        doc.text(`-$${safePaymentData.discount.toFixed(2)}`, rightMargin - 20, yPosition);
        yPosition += lineHeight;
      }
      
      if (safePaymentData.penalty > 0) {
        doc.text('Recargo', leftMargin, yPosition);
        doc.text(`+$${safePaymentData.penalty.toFixed(2)}`, rightMargin - 20, yPosition);
        yPosition += lineHeight;
      }
      
      yPosition += 2;
      addLine();
      
      // Total
      doc.setFontSize(10);
      doc.setFont('courier', 'bold');
      doc.text('TOTAL A PAGAR:', leftMargin, yPosition);
      doc.text(`$${safePaymentData.amount.toFixed(2)}`, rightMargin - 20, yPosition);
      yPosition += lineHeight;
      
      doc.setFontSize(8);
      doc.setFont('courier', 'normal');
      doc.text('Efectivo recibido:', leftMargin, yPosition);
      doc.text(`$${safePaymentData.cashReceived.toFixed(2)}`, rightMargin - 20, yPosition);
      yPosition += lineHeight;
      
      yPosition += 2;
      addLine();
      
      // Forma de pago
      addCenteredText(`Forma de pago: ${safePaymentData.method}`, 9, true);
      
      yPosition += 2;
      addLine();
      
      // Información adicional - Sin emojis para mejor compatibilidad
      addCenteredText('CONSERVE ESTE COMPROBANTE', 9, true);
      addCenteredText('PAGO REALIZADO CON EXITO', 9, true);
      yPosition += 3;
      addCenteredText('NO HAY DEVOLUCION DEL PAGO POR', 8);
      addCenteredText('CUALQUIER SERVICIO PRESTADO', 8);
      addCenteredText('EN NUESTRA INSTITUCION', 8);
      yPosition += 3;
      addCenteredText('Dudas o quejas al: 287-181-1231', 8, true);
      yPosition += 2;
      addCenteredText('GRACIAS POR LA CONFIANZA!', 9, true);
      
      yPosition += 3;
      addLine();
      
      // Información del sistema - Mejor formato
      addCenteredText('Información del Sistema', 9, true);
      yPosition += 1;
      addCenteredText('Procesado por: Sistema MQerK', 8);
      addCenteredText(`Fecha: ${new Date().toLocaleDateString('es-ES')}`, 8);
      addCenteredText(`Hora: ${new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false })}`, 8);
      
      const statusText = safePaymentData.status === 'paid' ? 'PAGADO' : 
                        safePaymentData.status === 'pending' ? 'PENDIENTE' : 'FALLIDO';
      addCenteredText(`Estado: ${statusText}`, 8, true);
      
      if (safePaymentData.verificationDate) {
        addCenteredText(`Verificado: ${new Date(safePaymentData.verificationDate).toLocaleDateString('es-ES')}`, 8);
      }
      
      if (safePaymentData.transactionId) {
        addCenteredText(`ID: ${safePaymentData.transactionId}`, 8);
      }
      
      yPosition += 3;
      addLine();
      
      // Información del comprobante - Mejor formato
      const folio = generateFolio(paymentData.id, paymentData.date);
      addCenteredText(`Folio: ${folio}`, 9, true);
      yPosition += 1;
      addCenteredText('Comprobante válido para efectos fiscales', 8);
      addCenteredText('Conserve este documento como respaldo', 8);
      
      // Descargar PDF
      const fileName = `comprobante-pago-${generateFolio(paymentData.id, paymentData.date)}.pdf`;
      doc.save(fileName);
      
      console.log('PDF generado exitosamente');
      
    } catch (error) {
      console.error('Error al generar PDF:', error);
      
      // Fallback a imagen si falla PDF
      const shouldTryImage = confirm(
        'No se pudo generar el PDF. ¿Desea intentar descargar como imagen?'
      );
      
      if (shouldTryImage) {
        handleDownload();
      } else {
        handleDownloadFallback();
      }
    }
  };

  // Función para descargar el recibo como imagen con múltiples estrategias
  const handleDownload = async () => {
    try {
      // Verificar si html2canvas está disponible
      if (typeof window !== 'undefined') {
        const html2canvas = (await import('html2canvas')).default;
        
        // Obtener el elemento del recibo
        const element = reciboRef.current;
        if (!element) {
          throw new Error('Elemento del recibo no encontrado');
        }

        // Crear un contenedor temporal completamente independiente
        const tempContainer = document.createElement('div');
        tempContainer.style.position = 'absolute';
        tempContainer.style.left = '-9999px';
        tempContainer.style.top = '0px';
        tempContainer.style.width = '320px';
        tempContainer.style.minHeight = '1600px'; // Asegurar altura mínima
        tempContainer.style.backgroundColor = '#ffffff';
        tempContainer.style.zIndex = '-1';
        tempContainer.style.visibility = 'visible';
        tempContainer.style.opacity = '1';
        tempContainer.style.padding = '20px';
        tempContainer.style.boxSizing = 'border-box';
        
        // Clonar el contenido del recibo
        const clonedContent = element.cloneNode(true);
        
        // Aplicar estilos inline críticos para asegurar que se capturen
        const applyInlineStyles = (elem) => {
          if (!elem || !elem.style) return;
          
          // Obtener estilos computados del elemento original
          const originalElement = element.querySelector(`.${elem.className}`);
          if (originalElement) {
            const computedStyles = window.getComputedStyle(originalElement);
            
            // Aplicar estilos críticos inline
            elem.style.color = computedStyles.color || '#000000';
            elem.style.fontSize = computedStyles.fontSize || '12px';
            elem.style.fontFamily = computedStyles.fontFamily || 'monospace';
            elem.style.fontWeight = computedStyles.fontWeight || 'normal';
            elem.style.textAlign = computedStyles.textAlign || 'left';
            elem.style.backgroundColor = computedStyles.backgroundColor || 'transparent';
            elem.style.padding = computedStyles.padding || '0';
            elem.style.margin = computedStyles.margin || '0';
            elem.style.border = computedStyles.border || 'none';
            elem.style.borderRadius = computedStyles.borderRadius || '0';
            elem.style.display = computedStyles.display || 'block';
            elem.style.lineHeight = computedStyles.lineHeight || '1.25';
          }
          
          // Aplicar estilos específicos por clase
          if (elem.classList.contains('font-bold')) {
            elem.style.fontWeight = 'bold';
          }
          if (elem.classList.contains('text-center')) {
            elem.style.textAlign = 'center';
          }
          if (elem.classList.contains('text-right')) {
            elem.style.textAlign = 'right';
          }
          if (elem.classList.contains('text-blue-600')) {
            elem.style.color = '#2563eb';
          }
          if (elem.classList.contains('text-green-600')) {
            elem.style.color = '#16a34a';
          }
          if (elem.classList.contains('text-red-600')) {
            elem.style.color = '#dc2626';
          }
          if (elem.classList.contains('text-purple-600')) {
            elem.style.color = '#9333ea';
          }
          if (elem.classList.contains('text-gray-600')) {
            elem.style.color = '#4b5563';
          }
          if (elem.classList.contains('text-gray-700')) {
            elem.style.color = '#374151';
          }
          if (elem.classList.contains('text-gray-800')) {
            elem.style.color = '#1f2937';
          }
          if (elem.classList.contains('bg-gray-50')) {
            elem.style.backgroundColor = '#f9fafb';
          }
          if (elem.classList.contains('bg-blue-50')) {
            elem.style.backgroundColor = '#eff6ff';
          }
          if (elem.classList.contains('bg-yellow-50')) {
            elem.style.backgroundColor = '#fefce8';
          }
          if (elem.classList.contains('border-dashed')) {
            elem.style.borderStyle = 'dashed';
          }
          if (elem.classList.contains('border-gray-300')) {
            elem.style.borderColor = '#d1d5db';
          }
          if (elem.classList.contains('border-gray-600')) {
            elem.style.borderColor = '#4b5563';
          }
          if (elem.classList.contains('border-t')) {
            elem.style.borderTop = '1px solid';
          }
          if (elem.classList.contains('border-b')) {
            elem.style.borderBottom = '1px solid';
          }
          if (elem.classList.contains('border-t-2')) {
            elem.style.borderTop = '2px solid';
          }
          if (elem.classList.contains('border-b-2')) {
            elem.style.borderBottom = '2px solid';
          }
          if (elem.classList.contains('p-2')) {
            elem.style.padding = '8px';
          }
          if (elem.classList.contains('py-2')) {
            elem.style.paddingTop = '8px';
            elem.style.paddingBottom = '8px';
          }
          if (elem.classList.contains('pt-2')) {
            elem.style.paddingTop = '8px';
          }
          if (elem.classList.contains('pb-2')) {
            elem.style.paddingBottom = '8px';
          }
          if (elem.classList.contains('mt-1')) {
            elem.style.marginTop = '4px';
          }
          if (elem.classList.contains('mt-2')) {
            elem.style.marginTop = '8px';
          }
          if (elem.classList.contains('mb-1')) {
            elem.style.marginBottom = '4px';
          }
          if (elem.classList.contains('mb-2')) {
            elem.style.marginBottom = '8px';
          }
          if (elem.classList.contains('flex')) {
            elem.style.display = 'flex';
          }
          if (elem.classList.contains('justify-between')) {
            elem.style.justifyContent = 'space-between';
          }
          if (elem.classList.contains('items-center')) {
            elem.style.alignItems = 'center';
          }
          if (elem.classList.contains('flex-1')) {
            elem.style.flex = '1';
          }
          if (elem.classList.contains('pr-2')) {
            elem.style.paddingRight = '8px';
          }
          if (elem.classList.contains('rounded')) {
            elem.style.borderRadius = '6px';
          }
          
          // Aplicar a todos los hijos
          Array.from(elem.children).forEach(child => {
            applyInlineStyles(child);
          });
        };
        
        // Aplicar estilos al contenido clonado
        applyInlineStyles(clonedContent);
        
        // Asegurar que el contenedor principal tenga estilos correctos
        clonedContent.style.maxWidth = '300px';
        clonedContent.style.margin = '0 auto';
        clonedContent.style.backgroundColor = '#ffffff';
        clonedContent.style.fontFamily = 'monospace';
        clonedContent.style.fontSize = '12px';
        clonedContent.style.lineHeight = '1.25';
        clonedContent.style.padding = '16px';
        clonedContent.style.border = '1px solid #d1d5db';
        clonedContent.style.borderRadius = '8px';
        clonedContent.style.color = '#000000';
        clonedContent.style.boxSizing = 'border-box';
        
        // Agregar el contenido clonado al contenedor temporal
        tempContainer.appendChild(clonedContent);
        document.body.appendChild(tempContainer);
        
        // Esperar un momento para que se renderice completamente
        await new Promise(resolve => setTimeout(resolve, 500)); // Más tiempo para renderizado
        
        // Obtener la altura real del contenido
        const actualHeight = Math.max(tempContainer.scrollHeight, tempContainer.offsetHeight, 1600);
        
        // Configuración optimizada para captura
        const canvas = await html2canvas(tempContainer, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
          logging: false,
          allowTaint: true,
          foreignObjectRendering: false,
          width: 320,
          height: actualHeight,
          x: 0,
          y: 0,
          scrollX: 0,
          scrollY: 0,
          windowWidth: 320,
          windowHeight: actualHeight,
          ignoreElements: (element) => {
            return element.tagName === 'SCRIPT' || element.tagName === 'STYLE' || element.tagName === 'LINK';
          },
          onclone: (clonedDoc) => {
            // Asegurar que el documento clonado tenga los estilos correctos
            const clonedElement = clonedDoc.querySelector('.recibo-container');
            if (clonedElement) {
              clonedElement.style.backgroundColor = '#ffffff';
              clonedElement.style.color = '#000000';
              clonedElement.style.fontFamily = 'monospace';
              clonedElement.style.fontSize = '12px';
              clonedElement.style.lineHeight = '1.25';
            }
          }
        });
        
        // Limpiar el elemento temporal
        document.body.removeChild(tempContainer);
        
        // Verificar que el canvas tenga contenido
        if (canvas.width === 0 || canvas.height === 0) {
          throw new Error('El canvas generado está vacío');
        }
        
        // Verificar que el canvas tenga contenido real (no solo fondo blanco)
        const ctx = canvas.getContext('2d');
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        let hasContent = false;
        
        // Verificar si hay píxeles que no sean completamente blancos
        for (let i = 0; i < imageData.data.length; i += 4) {
          const r = imageData.data[i];
          const g = imageData.data[i + 1];
          const b = imageData.data[i + 2];
          
          if (r !== 255 || g !== 255 || b !== 255) {
            hasContent = true;
            break;
          }
        }
        
        if (!hasContent) {
          throw new Error('El canvas generado no contiene contenido visible');
        }
        
        // Crear y descargar la imagen
        canvas.toBlob((blob) => {
          if (blob && blob.size > 0) {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.download = `comprobante-pago-${generateFolio(paymentData.id, paymentData.date)}.png`;
            link.href = url;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            console.log('Recibo descargado exitosamente como imagen');
          } else {
            throw new Error('No se pudo generar la imagen - blob vacío');
          }
        }, 'image/png', 1.0);
        
      } else {
        throw new Error('html2canvas no disponible');
      }
    } catch (error) {
      console.error('Error al descargar el recibo como imagen:', error);
      
      // Fallback: Crear imagen usando Canvas API directamente
      try {
        await handleDownloadWithCanvas();
      } catch (canvasError) {
        console.error('Error con Canvas API:', canvasError);
        
        // Fallback final: Ofrecer descarga como HTML
        const shouldTryHTML = confirm(
          'No se pudo descargar como imagen. ¿Desea descargar como archivo HTML para imprimir después?'
        );
        
        if (shouldTryHTML) {
          handleDownloadFallback();
        } else {
          const shouldTryPrint = confirm('¿Desea intentar imprimir directamente?');
          if (shouldTryPrint) {
            handlePrint();
          }
        }
      }
    }
  };

  // Función alternativa para crear imagen usando Canvas API directamente
  const handleDownloadWithCanvas = async () => {
    try {
      // Crear un canvas manualmente
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Configurar el canvas (tamaño ticket más grande)
      canvas.width = 640;  // Más ancho
      canvas.height = 1800; // Más alto para contenido completo
      
      // Fondo blanco
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Configurar fuente
      ctx.fillStyle = '#000000';
      ctx.font = '16px monospace';
      ctx.textAlign = 'center';
      
      let yPos = 40;
      const centerX = canvas.width / 2;
      const leftMargin = 50;
      const lineHeight = 30; // Más espacio entre líneas
      
      // Función helper para agregar texto
      const addText = (text, fontSize = 16, align = 'center', isBold = false, color = '#000000') => {
        ctx.font = `${isBold ? 'bold ' : ''}${fontSize}px monospace`;
        ctx.textAlign = align;
        ctx.fillStyle = color;
        
        const xPos = align === 'center' ? centerX : 
                     align === 'right' ? canvas.width - leftMargin : 
                     leftMargin;
        
        ctx.fillText(text, xPos, yPos);
        yPos += lineHeight + 5; // Más espacio entre líneas
      };
      
      // Función helper para agregar línea
      const addLine = (style = 'solid') => {
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        
        if (style === 'dashed') {
          ctx.setLineDash([5, 5]);
        } else {
          ctx.setLineDash([]);
        }
        
        ctx.beginPath();
        ctx.moveTo(leftMargin, yPos);
        ctx.lineTo(canvas.width - leftMargin, yPos);
        ctx.stroke();
        yPos += lineHeight + 5; // Más espacio después de líneas
      };
      
      // Función helper para texto en dos columnas
      const addTwoColumnText = (leftText, rightText, fontSize = 14) => {
        ctx.font = `${fontSize}px monospace`;
        ctx.fillStyle = '#000000';
        ctx.textAlign = 'left';
        ctx.fillText(leftText, leftMargin, yPos);
        ctx.textAlign = 'right';
        ctx.fillText(rightText, canvas.width - leftMargin, yPos);
        yPos += lineHeight + 5; // Más espacio entre líneas
      };
      
      // Header
      addText('MQerK Academy', 22, 'center', true);
      addText('Asesores Especializados en la', 16);
      addText('Enseñanza de las Cien y Tec', 16);
      addText('C. Benito Juárez #25 Col. Centro', 16, 'center', true);
      addText('Tuxtepec, Oaxaca C.P. 68300', 16);
      addText('Tel. 287-181-1231', 16, 'center', true);
      addText('RFC: GQRK980906K61', 16);
      
      yPos += 10;
      addLine();
      
      // Fecha y folio
      const fechaActual = new Date().toLocaleDateString('es-ES');
      const horaActual = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false });
      const folio = generateFolio(paymentData.id, paymentData.date);
      
      addText(`${fechaActual} ${horaActual} a. m.`, 18, 'center', true);
      addText('Horas', 14);
      addText(`Folio: ${folio}`, 18, 'center', true);
      
      yPos += 10;
      addLine();
      
      // Datos del cliente
      addText('Cliente:', 16, 'left', true);
      addText(safeStudentData.name, 16, 'left');
      addText('Dirección:', 16, 'left', true);
      addText(safeStudentData.address, 14, 'left');
      addText(`Servicio: ${safeCourseInfo.name}`, 14, 'left');
      addText(`Sesiones: ${safePaymentData.plan}`, 14, 'left');
      addText(`Grupo: ${safeStudentData.group}`, 14, 'left');
      
      yPos += 10;
      addLine();
      
      // Conceptos
      addText('CONCEPTO ――――――― IMPORTE', 16, 'center', true);
      yPos += 10;
      
      addTwoColumnText(`Curso ${safeCourseInfo.name}`, `$${safePaymentData.baseAmount.toFixed(2)}`, 14);
      addTwoColumnText(safeCourseInfo.level, '', 14);
      addTwoColumnText('IVA (0%)', '$0.00', 14);
      
      if (safePaymentData.discount > 0) {
        addTwoColumnText('Descuento', `-$${safePaymentData.discount.toFixed(2)}`, 14);
      }
      
      if (safePaymentData.penalty > 0) {
        addTwoColumnText('Recargo', `+$${safePaymentData.penalty.toFixed(2)}`, 14);
      }
      
      yPos += 10;
      addLine();
      
      // Total
      addTwoColumnText('TOTAL A PAGAR:', `$${safePaymentData.amount.toFixed(2)}`, 16);
      addTwoColumnText('Efectivo recibido:', `$${safePaymentData.cashReceived.toFixed(2)}`, 14);
      
      yPos += 10;
      addLine();
      
      // Forma de pago
      addText(`Forma de pago: ${safePaymentData.method}`, 16, 'center', true);
      
      yPos += 10;
      addLine('dashed');
      
      // Información adicional
      addText('⚠️ CONSERVE ESTE COMPROBANTE ⚠️', 16, 'center', true);
      addText('✅ PAGO REALIZADO CON ÉXITO', 16, 'center', true, '#16a34a');
      
      yPos += 10;
      addText('NO HAY DEVOLUCIÓN DEL PAGO POR', 12, 'center');
      addText('CUALQUIER SERVICIO PRESTADO', 12, 'center');
      addText('EN NUESTRA INSTITUCIÓN', 12, 'center');
      
      yPos += 10;
      addText('Dudas o quejas al: 287-181-1231', 14, 'center', true);
      
      yPos += 10;
      addText('¡GRACIAS POR LA CONFIANZA!', 18, 'center', true, '#2563eb');
      
      yPos += 15;
      addLine('dashed');
      
      // Información del sistema
      addText('📋 Información del Sistema', 16, 'center', true);
      addText('Procesado por: Sistema MQerK', 12, 'center');
      addText(`Fecha: ${new Date().toLocaleDateString('es-ES')}`, 12, 'center');
      addText(`Hora: ${new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false })}`, 12, 'center');
      
      const statusText = safePaymentData.status === 'paid' ? '✅ PAGADO' : 
                        safePaymentData.status === 'pending' ? '⏳ PENDIENTE' : '❌ FALLIDO';
      addText(`Estado: ${statusText}`, 14, 'center', true, '#16a34a');
      
      if (safePaymentData.verificationDate) {
        addText(`✅ Verificado: ${new Date(safePaymentData.verificationDate).toLocaleDateString('es-ES')}`, 12, 'center');
      }
      
      if (safePaymentData.transactionId) {
        addText(`ID: ${safePaymentData.transactionId}`, 12, 'center');
      }
      
      yPos += 15;
      addLine('dashed');
      
      // Información del comprobante
      addText(`📄 Folio: ${folio}`, 16, 'center', true, '#2563eb');
      addText('✅ Comprobante válido para efectos fiscales', 12, 'center');
      addText('📁 Conserve este documento como respaldo', 12, 'center');
      
      // Agregar bordes al ticket
      ctx.strokeStyle = '#d1d5db';
      ctx.lineWidth = 2;
      ctx.setLineDash([]);
      ctx.strokeRect(20, 20, canvas.width - 40, yPos - 20);
      
      // Crear y descargar la imagen
      canvas.toBlob((blob) => {
        if (blob && blob.size > 0) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.download = `comprobante-pago-${folio}.png`;
          link.href = url;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          console.log('Recibo descargado exitosamente usando Canvas API');
        } else {
          throw new Error('No se pudo generar la imagen con Canvas API');
        }
      }, 'image/png', 1.0);
      
    } catch (error) {
      console.error('Error al generar imagen con Canvas API:', error);
      throw error;
    }
  };

  // Función para imprimir el recibo
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    const reciboContent = reciboRef.current.innerHTML;
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Comprobante de Pago - ${generateFolio(paymentData.id, paymentData.date)}</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @page {
              size: A4;
              margin: 0.5in;
            }
            @media print {
              html, body { 
                font-family: 'Courier New', monospace; 
                margin: 0; 
                padding: 0;
                height: auto;
                overflow: visible;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              .recibo-container { 
                max-width: 300px; 
                margin: 0 auto; 
                page-break-inside: avoid;
                page-break-after: avoid;
                height: auto;
              }
              * {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              /* Evitar páginas vacías */
              .space-y-3 { page-break-inside: avoid; }
              .bg-gray-50 { background-color: #f9fafb !important; }
              .bg-blue-50 { background-color: #eff6ff !important; }
              .bg-yellow-50 { background-color: #fefce8 !important; }
              .border-dashed { border-style: dashed !important; }
              .text-blue-600 { color: #2563eb !important; }
              .text-green-600 { color: #16a34a !important; }
              .text-red-600 { color: #dc2626 !important; }
              .text-purple-600 { color: #9333ea !important; }
              .text-gray-600 { color: #4b5563 !important; }
              .text-gray-700 { color: #374151 !important; }
              .text-gray-800 { color: #1f2937 !important; }
            }
            body { 
              font-family: 'Courier New', monospace; 
              margin: 10px;
              height: auto;
            }
          </style>
        </head>
        <body>
          <div class="recibo-container">
            ${reciboContent}
          </div>
          <script>
            window.onload = function() {
              window.print();
              window.close();
            };
          </script>
        </body>
      </html>
    `);
    
    printWindow.document.close();
  };

  // Validación y valores por defecto para datos del backend
  if (!paymentData || !finalStudentData) {
    console.warn('ComprobanteVirtual: Faltan datos requeridos del backend');
    return null;
  }

  // Generar folio único basado en ID de pago y fecha
  const folio = generateFolio(paymentData.id, paymentData.date);
  
  // Formatear fecha y hora actuales para el comprobante
  const fechaActual = new Date().toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
  const horaActual = new Date().toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });

  // Valores por defecto para datos opcionales del backend
  const safePaymentData = {
    ...paymentData,
    baseAmount: paymentData.baseAmount || paymentData.amount,
    discount: paymentData.discount || 0,
    penalty: paymentData.penalty || 0,
    method: paymentData.method || 'Efectivo',
    status: paymentData.status || 'paid',
    plan: paymentData.plan || 'Plan no especificado',
    cashReceived: paymentData.cashReceived || 700.00,
    transactionId: paymentData.transactionId || folio,
  };

  const safeCourseInfo = {
    ...courseInfo,
    name: courseInfo?.name || 'Curso no especificado',
    duration: courseInfo?.duration || 'Duración no especificada',
    level: courseInfo?.level || 'Elemental',
  };

  const safeStudentData = {
    ...finalStudentData,
    name: finalStudentData?.name || 'Nombre no disponible',
    address: finalStudentData?.address || 'Dirección no disponible',
    group: finalStudentData?.group || 'Grupo no asignado',
  };

  return (
    <ReciboModal isOpen={isOpen} onClose={onClose}>
      <div className="space-y-3">
        {/* Botones de acción */}
        <div className="flex justify-end gap-2 mb-2">
          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-xs"
          >
            <Download className="w-3 h-3" />
            PDF
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-xs"
          >
            <Download className="w-3 h-3" />
            Imagen
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-xs"
          >
            <Printer className="w-3 h-3" />
            Imprimir
          </button>
        </div>

        {/* Recibo virtual */}
        <div 
          ref={reciboRef} 
          className="bg-white border border-gray-300 rounded-lg shadow-sm p-4 font-mono text-xs leading-tight"
        >
          <div className="recibo-container max-w-xs mx-auto space-y-3">
            
            {/* Header de la empresa */}
            <div className="text-center space-y-1 pb-2">
              <div className="font-bold text-lg tracking-wide">MQerK Academy</div>
              <div className="text-xs space-y-0.5 text-gray-700">
                <div>Asesores Especializados en la</div>
                <div>Enseñanza de las Cien y Tec</div>
                <div className="font-semibold">C. Benito Juárez #25 Col. Centro</div>
                <div>Tuxtepec, Oaxaca C.P. 68300</div>
                <div className="font-semibold">Tel. 287-181-1231</div>
                <div>RFC: GQRK980906K61</div>
              </div>
            </div>

            {/* Fecha y hora */}
            <div className="text-center text-xs py-2 border-t-2 border-b border-dashed border-gray-600">
              <div className="font-bold">{fechaActual} {horaActual} a. m.</div>
              <div className="text-gray-600">Horas</div>
              <div className="font-bold text-blue-600">Folio: {folio}</div>
            </div>

            {/* Datos del cliente */}
            <div className="space-y-1 text-left bg-gray-50 p-2 rounded">
              <div className="font-bold text-xs text-gray-800">Cliente: {safeStudentData.name}</div>
              <div className="text-xs text-gray-700 space-y-0.5">
                <div>Dirección: {safeStudentData.address}</div>
                <div>Servicio educativo: {safeCourseInfo.name}</div>
                <div>Sesiones: {safePaymentData.plan}</div>
                <div>Grupo: {safeStudentData.group}</div>
              </div>
            </div>

            {/* Detalles del pago */}
            <div className="space-y-2">
              <div className="text-center font-bold text-sm py-2 border-t-2 border-b-2 border-dashed border-gray-600">
                CONCEPTO ――――――― IMPORTE
              </div>
              
              <div className="space-y-1 text-left bg-gray-50 p-2 rounded">
                <div className="flex justify-between items-center">
                  <div className="text-xs flex-1 pr-2 font-medium">Curso {safeCourseInfo.name}</div>
                  <div className="text-xs text-right font-bold">${safePaymentData.baseAmount.toFixed(2)}</div>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="text-xs flex-1 pr-2 text-gray-600">{safeCourseInfo.level}</div>
                  <div className="text-xs text-right text-gray-600">――――――</div>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="text-xs flex-1 pr-2">IVA (0%)</div>
                  <div className="text-xs text-right">$0.00</div>
                </div>
                
                {safePaymentData.discount > 0 && (
                  <div className="flex justify-between items-center text-green-600">
                    <div className="text-xs flex-1 pr-2">Descuento</div>
                    <div className="text-xs text-right">-${safePaymentData.discount.toFixed(2)}</div>
                  </div>
                )}
                
                {safePaymentData.penalty > 0 && (
                  <div className="flex justify-between items-center text-red-600">
                    <div className="text-xs flex-1 pr-2">Recargo</div>
                    <div className="text-xs text-right">+${safePaymentData.penalty.toFixed(2)}</div>
                  </div>
                )}
              </div>

              <div className="pt-2 bg-blue-50 p-2 rounded border-t-2 border-dashed border-gray-600">
                <div className="flex justify-between items-center font-bold text-sm">
                  <div className="flex-1 pr-2">TOTAL A PAGAR:</div>
                  <div className="text-right text-blue-600">${safePaymentData.amount.toFixed(2)}</div>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <div className="text-xs flex-1 pr-2">Efectivo recibido:</div>
                  <div className="text-xs text-right font-semibold">${safePaymentData.cashReceived.toFixed(2)}</div>
                </div>
              </div>
            </div>

            {/* Método de pago */}
            <div className="text-center pt-2 border-t border-dashed border-gray-600">
              <div className="text-xs bg-yellow-50 p-2 rounded">
                <span className="font-bold">Forma de pago:</span> {safePaymentData.method}
              </div>
            </div>

            {/* Información adicional */}
            <div className="text-xs space-y-1 pt-2 text-left border-t-2 border-dashed border-gray-600">
              <div className="font-bold text-red-600 text-center">⚠️ CONSERVE ESTE COMPROBANTE ⚠️</div>
              <div className="text-center font-bold text-green-600">✅ PAGO REALIZADO CON ÉXITO</div>
              <div className="text-center text-gray-600 text-xs mt-2">
                <div>NO HAY DEVOLUCIÓN DEL PAGO POR</div>
                <div>CUALQUIER SERVICIO PRESTADO</div>
                <div>EN NUESTRA INSTITUCIÓN</div>
              </div>
              <div className="text-center font-semibold text-blue-600 mt-2">
                <div>📞 Dudas o quejas al: 287-181-1231</div>
              </div>
              <div className="text-center font-bold text-purple-600 mt-2">
                <div>¡GRACIAS POR LA CONFIANZA!</div>
              </div>
            </div>

            {/* Información del procesamiento */}
            <div className="text-xs text-center space-y-0.5 pt-2 bg-gray-50 p-2 rounded border-t border-dashed border-gray-600">
              <div className="font-medium text-xs">📋 Información del Sistema</div>
              <div className="text-xs">Procesado por: Sistema MQerK</div>
              <div className="text-xs">Fecha: {fechaActual} - Hora: {horaActual}</div>
              <div className="font-medium text-green-600 text-xs">
                Estado: {safePaymentData.status === 'paid' ? '✅ PAGADO' : 
                        safePaymentData.status === 'pending' ? '⏳ PENDIENTE' : '❌ FALLIDO'}
              </div>
              {safePaymentData.verificationDate && (
                <div className="text-xs">✅ Verificado: {new Date(safePaymentData.verificationDate).toLocaleDateString('es-ES')}</div>
              )}
              {safePaymentData.transactionId && (
                <div className="text-xs">ID Transacción: {safePaymentData.transactionId}</div>
              )}
            </div>

            {/* Información del comprobante */}
            <div className="text-center pt-2 border-t-2 border-dashed border-gray-600">
              <div className="text-sm font-bold text-blue-600 mb-1">📄 Folio: {folio}</div>
              <div className="text-xs text-gray-600 space-y-0.5">
                <div>✅ Comprobante válido para efectos fiscales</div>
                <div>📁 Conserve este documento como respaldo</div>
              </div>
            </div>
          </div>
        </div>

        {/* Información adicional del recibo */}
        <div className="bg-blue-50 rounded-md p-2 text-xs">
          <h4 className="font-bold text-blue-800 mb-1">💡 Información del Comprobante</h4>
          <div className="text-blue-700 space-y-0.5">
            <p>• Este comprobante es válido para efectos fiscales</p>
            <p>• Guarda este documento como respaldo de tu pago</p>
            <p>• En caso de dudas, presenta este folio: <strong>{folio}</strong></p>
            <p>• El recibo incluye todos los detalles de tu transacción</p>
          </div>
        </div>
      </div>
    </ReciboModal>
  );
}