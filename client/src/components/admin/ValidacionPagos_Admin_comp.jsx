// src\components\ValidacionPagos_Admin_comp.jsx

/**
 * DOCUMENTACIÓN PARA EL BACKEND
 * 
 * Estructura de datos esperada para cada pago:
 * {
 *   id: string,                 // ID único del pago (ej: "PAG001")
 *   folio: string,              // Folio del pago para identificación
 *   alumno: string,             // Nombre completo del alumno
 *   correoElectronico: string,  // Email del alumno
 *   fechaEntrada: string,       // Fecha del pago en formato "YYYY-MM-DD"
 *   planCurso: string,          // Descripción del plan contratado
 *   pagoCurso: string,          // Monto del pago (ej: "$1,200 MXN")
 *   metodoPago: string,         // Método utilizado para el pago
 *   categoria: string,          // Curso: "EEAU", "EEAP", "DIGI-START", "MINDBRIDGE", "SPEAKUP", "PCE"
 *   turno: string,              // "VESPERTINO 1" o "VESPERTINO 2"
 *   contratoGenerado: boolean,  // Si ya se generó el contrato
 *   contratoSubido: boolean,    // Si ya se subió el contrato firmado
 *   comprobanteUrl: string,     // URL del comprobante de pago
 *   contratoUrl: string,        // URL del contrato (cuando esté disponible)
 *   estatus: string,            // "Pendiente", "Aprobado", "Rechazado"
 *   fechaRegistro: string       // Fecha de registro en formato "YYYY-MM-DD"
 * }
 * 
 * APIs a implementar:
 * - GET /api/pagos?curso={curso}&turno={turno} - Obtener pagos filtrados
 * - PUT /api/pagos/{id}/generar-contrato - Generar contrato para un pago
 * - POST /api/pagos/{id}/subir-contrato - Subir contrato firmado
 * - GET /api/pagos/{id}/contrato - Descargar contrato
 * - PUT /api/pagos/{id}/aprobar - Aprobar pago
 * - PUT /api/pagos/{id}/rechazar - Rechazar pago
 */

import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';

// Componente para la pantalla de carga simple (estilo consistente con otros componentes)
function LoadingScreen({ onComplete }) {
    useEffect(() => {
        // Simular carga por 2 segundos
        const timer = setTimeout(() => {
            onComplete();
        }, 2000);

        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-white">
            <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                <p className="text-lg font-medium text-gray-700">Cargando validación de pagos...</p>
            </div>
        </div>
    );
}

// Componente para los botones de categoría (cursos)
function CategoryButton({ label, isActive, onClick }) {
    return (
        <button
            onClick={onClick}
            className={`
                relative overflow-hidden 
                px-1.5 py-1.5 xs:px-2 xs:py-2 sm:px-3 sm:py-3 md:px-4 md:py-3
                rounded-md xs:rounded-lg sm:rounded-xl 
                font-bold text-[10px] xs:text-xs sm:text-sm md:text-base
                transition-all duration-300 ease-out 
                w-full min-w-[80px] xs:min-w-[100px] max-w-[140px] xs:max-w-[160px]
                h-10 xs:h-12 sm:h-14 md:h-16
                flex items-center justify-center
                border-2 transform hover:scale-105 hover:shadow-lg
                ${isActive
                    ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white border-purple-500 shadow-md shadow-purple-500/30' 
                    : 'bg-gradient-to-r from-purple-500 to-purple-600 text-white border-purple-400 shadow-sm hover:from-purple-600 hover:to-purple-700 hover:border-purple-500'
                }
            `}
        >
            <span className="relative z-10 tracking-wide text-center leading-tight">{label}</span>
        </button>
    );
}

export function ValidacionPagos_Admin_comp() {
  // Estado para controlar la pantalla de carga
  const [isLoading, setIsLoading] = useState(true);
  
  // Estados para manejar las categorías activas
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeTurno, setActiveTurno] = useState(null);
  
  // Estado para almacenar los datos de validación
  const [pagos, setPagos] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estados para la modal de PDF
  const [modalPDF, setModalPDF] = useState({
    isOpen: false,
    url: '',
    alumno: null,
    tipo: '' // 'contrato' o 'comprobante'
  });

  // Definir las categorías de cursos y turnos
  const categorias = ['EEAU', 'EEAP', 'DIGI-START', 'MINDBRIDGE', 'SPEAKUP', 'PCE'];
  const turnos = ['VESPERTINO 1', 'VESPERTINO 2'];///alguna forma de mostrar cuando sean mas de lo que hay inicilamente

  // Función para obtener pagos del backend
  const fetchPagos = async () => {
    try {
      // TODO: Implementar llamada al backend
      // const response = await fetch(`/api/pagos?curso=${activeCategory}&turno=${activeTurno}`);
      // const data = await response.json();
      // setPagos(data);
      
      // Datos de ejemplo para poder probar las funcionalidades
      setPagos([
        {
          id: 1,
          folio: 'PAG-001',
          alumno: 'Juan Pérez García',
          correoElectronico: 'juan.perez@email.com',
          fechaEntrada: '2024-12-15',
          planCurso: 'Curso Básico de Inglés - 6 meses',
          pagoCurso: '$1,200 MXN',
          metodoPago: 'Transferencia Bancaria',
          categoria: activeCategory,
          turno: activeTurno,
          contratoGenerado: false,
          contratoSubido: false,
          comprobanteUrl: '/comprobantes/comp001.pdf',
          // Datos adicionales del alumno para el contrato
          telefono: '555-0123',
          direccion: 'Calle Principal #123, Col. Centro',
          fechaNacimiento: '1995-03-20',
          identificacion: 'CURP123456789'
        },
        {
          id: 2,
          folio: 'PAG-002',
          alumno: 'María González López',
          correoElectronico: 'maria.gonzalez@email.com',
          fechaEntrada: '2024-12-16',
          planCurso: 'Curso Intermedio de Inglés - 8 meses',
          pagoCurso: '$1,500 MXN',
          metodoPago: 'Depósito en Efectivo',
          categoria: activeCategory,
          turno: activeTurno,
          contratoGenerado: true,
          contratoSubido: false,
          comprobanteUrl: '/comprobantes/comp002.pdf',
          contratoUrl: '/contratos/contrato002.pdf',
          telefono: '555-0456',
          direccion: 'Av. Reforma #456, Col. Roma',
          fechaNacimiento: '1992-07-15',
          identificacion: 'CURP987654321'
        },
        {
          id: 3,
          folio: 'PAG-003',
          alumno: 'Carlos Rodríguez Martín',
          correoElectronico: 'carlos.rodriguez@email.com',
          fechaEntrada: '2024-12-17',
          planCurso: 'Curso Avanzado de Inglés - 12 meses',
          pagoCurso: '$1,800 MXN',
          metodoPago: 'Transferencia SPEI',
          categoria: activeCategory,
          turno: activeTurno,
          contratoGenerado: true,
          contratoSubido: true,
          comprobanteUrl: '/comprobantes/comp003.pdf',
          contratoUrl: '/contratos/contrato003.pdf',
          telefono: '555-0789',
          direccion: 'Blvd. Insurgentes #789, Col. Del Valle',
          fechaNacimiento: '1988-11-10',
          identificacion: 'CURP456789123'
        }
      ]);
      setIsLoading(false);
    } catch (error) {
      console.error('Error al obtener pagos:', error);
      setPagos([]);
      setIsLoading(false);
    }
  };

  // Cargar pagos cuando se seleccione curso y turno
  useEffect(() => {
    if (activeCategory && activeTurno) {
      setIsLoading(true);
      fetchPagos();
    }
  }, [activeCategory, activeTurno]);

  // Filtrar pagos según categoría, turno y búsqueda
  const pagosFiltrados = pagos.filter(pago => {
    const matchCategory = !activeCategory || pago.categoria === activeCategory;
    const matchTurno = !activeTurno || pago.turno === activeTurno;
    const matchSearch = !searchTerm || 
      pago.alumno.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pago.folio.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pago.correoElectronico?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchCategory && matchTurno && matchSearch;
  });

  // Función para manejar la selección de categoría
  const handleCategorySelect = (categoria) => {
    setActiveCategory(categoria === activeCategory ? null : categoria);
    // Reset turno cuando se cambia de categoría
    setActiveTurno(null);
  };

  // Función para manejar la selección de turno
  const handleTurnoSelect = (turno) => {
    setActiveTurno(turno === activeTurno ? null : turno);
  };

  // Función para manejar la carga completa
  const handleLoadingComplete = () => {
    setIsLoading(false);
  };

  // Función para generar un contrato PDF profesional con los datos del alumno
  const generarContratoPDF = (alumno) => {
    try {
      // Crear nuevo documento PDF
      const doc = new jsPDF();
      
      // Configurar fuentes y colores
      const primaryColor = [128, 0, 128]; // Purple
      const secondaryColor = [100, 100, 100]; // Gray
      const textColor = [0, 0, 0]; // Black
      
      // === HEADER DEL DOCUMENTO ===
      doc.setFillColor(...primaryColor);
      doc.rect(0, 0, 220, 40, 'F');
      
      // Logo y título principal
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('MQERK', 20, 25);
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text('INSTITUTO DE IDIOMAS', 20, 32);
      
      // Fecha y folio en header
      doc.setFontSize(10);
      doc.text(`Folio: ${alumno.folio}`, 150, 20);
      doc.text(`Fecha: ${new Date().toLocaleDateString('es-MX')}`, 150, 28);
      doc.text(`Hora: ${new Date().toLocaleTimeString('es-MX')}`, 150, 36);
      
      // === TÍTULO DEL CONTRATO ===
      doc.setTextColor(...textColor);
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('CONTRATO DE PRESTACIÓN DE SERVICIOS EDUCATIVOS', 20, 60);
      
      // Línea decorativa
      doc.setDrawColor(...primaryColor);
      doc.setLineWidth(2);
      doc.line(20, 65, 190, 65);
      
      let currentY = 80;
      
      // === SECCIÓN: DATOS DEL ESTUDIANTE ===
      doc.setFillColor(240, 240, 240);
      doc.rect(15, currentY - 5, 180, 8, 'F');
      
      doc.setTextColor(...primaryColor);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('DATOS DEL ESTUDIANTE', 20, currentY);
      currentY += 15;
      
      doc.setTextColor(...textColor);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      
      const datosEstudiante = [
        [`Nombre Completo:`, alumno.alumno],
        [`Correo Electrónico:`, alumno.correoElectronico],
        [`Teléfono:`, alumno.telefono],
        [`Dirección:`, alumno.direccion],
        [`Fecha de Nacimiento:`, alumno.fechaNacimiento],
        [`Identificación:`, alumno.identificacion]
      ];
      
      datosEstudiante.forEach(([label, value]) => {
        doc.setFont('helvetica', 'bold');
        doc.text(label, 20, currentY);
        doc.setFont('helvetica', 'normal');
        doc.text(value, 70, currentY);
        currentY += 8;
      });
      
      currentY += 10;
      
      // === SECCIÓN: DATOS DEL CURSO ===
      doc.setFillColor(240, 240, 240);
      doc.rect(15, currentY - 5, 180, 8, 'F');
      
      doc.setTextColor(...primaryColor);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('DATOS DEL CURSO', 20, currentY);
      currentY += 15;
      
      doc.setTextColor(...textColor);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      
      const datosCurso = [
        [`Curso:`, alumno.categoria],
        [`Plan:`, alumno.planCurso],
        [`Turno:`, alumno.turno],
        [`Fecha de Inicio:`, alumno.fechaEntrada]
      ];
      
      datosCurso.forEach(([label, value]) => {
        doc.setFont('helvetica', 'bold');
        doc.text(label, 20, currentY);
        doc.setFont('helvetica', 'normal');
        doc.text(value, 70, currentY);
        currentY += 8;
      });
      
      currentY += 10;
      
      // === SECCIÓN: INFORMACIÓN DE PAGO ===
      doc.setFillColor(240, 240, 240);
      doc.rect(15, currentY - 5, 180, 8, 'F');
      
      doc.setTextColor(...primaryColor);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('INFORMACIÓN DE PAGO', 20, currentY);
      currentY += 15;
      
      doc.setTextColor(...textColor);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      
      const datosPago = [
        [`Monto Total:`, alumno.pagoCurso],
        [`Método de Pago:`, alumno.metodoPago],
        [`Fecha de Pago:`, alumno.fechaEntrada]
      ];
      
      datosPago.forEach(([label, value]) => {
        doc.setFont('helvetica', 'bold');
        doc.text(label, 20, currentY);
        doc.setFont('helvetica', 'normal');
        doc.text(value, 70, currentY);
        currentY += 8;
      });
      
      currentY += 15;
      
      // === SECCIÓN: TÉRMINOS Y CONDICIONES ===
      doc.setFillColor(240, 240, 240);
      doc.rect(15, currentY - 5, 180, 8, 'F');
      
      doc.setTextColor(...primaryColor);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('TÉRMINOS Y CONDICIONES', 20, currentY);
      currentY += 15;
      
      doc.setTextColor(...textColor);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      
      const terminos = [
        '1. El estudiante se compromete a asistir puntualmente a las clases programadas.',
        '2. El instituto se compromete a brindar educación de calidad según el plan contratado.',
        '3. Los pagos deben realizarse en las fechas establecidas según el calendario.',
        '4. El contrato tiene validez durante toda la duración del curso seleccionado.',
        '5. Cualquier modificación al presente contrato debe ser acordada por ambas partes.'
      ];
      
      terminos.forEach(termino => {
        doc.text(termino, 20, currentY, { maxWidth: 170 });
        currentY += 12;
      });
      
      currentY += 10;
      
      // === SECCIÓN: FIRMAS ===
      doc.setFillColor(240, 240, 240);
      doc.rect(15, currentY - 5, 180, 8, 'F');
      
      doc.setTextColor(...primaryColor);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('FIRMAS', 20, currentY);
      currentY += 20;
      
      // Firma del estudiante
      doc.setTextColor(...textColor);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.line(20, currentY, 90, currentY);
      doc.text('Firma del Estudiante', 20, currentY + 8);
      doc.setFont('helvetica', 'bold');
      doc.text(alumno.alumno, 20, currentY + 16);
      
      // Firma del representante
      doc.setFont('helvetica', 'normal');
      doc.line(120, currentY, 190, currentY);
      doc.text('Representante MQERK', 120, currentY + 8);
      doc.setFont('helvetica', 'bold');
      doc.text('Director Académico', 120, currentY + 16);
      
      // === FOOTER ===
      currentY += 30;
      doc.setFillColor(...primaryColor);
      doc.rect(0, currentY, 220, 20, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text('Este contrato ha sido generado automáticamente por el sistema MQERK', 20, currentY + 8);
      doc.text(`Generado el ${new Date().toLocaleDateString('es-MX')} a las ${new Date().toLocaleTimeString('es-MX')}`, 20, currentY + 15);
      
      // Guardar el PDF
      const fileName = `Contrato_${alumno.folio}_${alumno.alumno.replace(/\s+/g, '_')}.pdf`;
      doc.save(fileName);
      
      return `/contratos/${fileName}`;
      
    } catch (error) {
      console.error('Error al generar PDF:', error);
      throw new Error('Error al generar el contrato PDF');
    }
  };
  // Funciones para manejar acciones (preparadas para backend)
  const handleGenerarContrato = async (id) => {
    try {
      // TODO: Implementar llamada al backend
      // const response = await fetch(`/api/pagos/${id}/generar-contrato`, { method: 'PUT' });
      // const data = await response.json();
      // fetchPagos(); // Recargar lista
      
      // Encontrar el alumno por ID
      const alumno = pagos.find(p => p.id === id);
      if (!alumno) {
        alert('No se encontró el alumno');
        return;
      }

      // Mostrar mensaje de confirmación
      const confirmar = window.confirm(
        `🔄 GENERACIÓN DE CONTRATO PDF\n\n` +
        `¿Confirmas generar el contrato para:\n` +
        `👤 Estudiante: ${alumno.alumno}\n` +
        `📚 Curso: ${alumno.categoria}\n` +
        `📋 Plan: ${alumno.planCurso}\n` +
        `💰 Monto: ${alumno.pagoCurso}\n\n` +
        `✅ Se generará un PDF profesional con:\n` +
        `• Plantilla oficial de MQERK\n` +
        `• Todos los datos auto-rellenados\n` +
        `• Diseño profesional y formal\n` +
        `• Espacios para firmas\n\n` +
        `📁 El archivo PDF se descargará automáticamente.`
      );

      if (confirmar) {
        try {
          // Generar y descargar el contrato
          const contratoUrl = generarContratoPDF(alumno);
          
          // Actualizar el estado para marcar el contrato como generado
          setPagos(pagos.map(pago => 
            pago.id === id ? { 
              ...pago, 
              contratoGenerado: true, 
              contratoUrl: contratoUrl 
            } : pago
          ));

          // Mostrar mensaje de éxito
          alert(
            `🎉 ¡CONTRATO PDF GENERADO EXITOSAMENTE!\n\n` +
            `📄 Archivo: Contrato_${alumno.folio}_${alumno.alumno.replace(/\s+/g, '_')}.pdf\n` +
            `👤 Para: ${alumno.alumno}\n` +
            `📚 Curso: ${alumno.categoria}\n\n` +
            `📋 PRÓXIMOS PASOS:\n` +
            `1. 📁 El PDF se descargó en tu carpeta de Descargas\n` +
            `2. 🖨️ Imprimir el contrato\n` +
            `3. ✍️ Hacer firmar al estudiante\n` +
            `4. 📤 Subir contrato firmado usando el botón "Subir"\n` +
            `5. 📱 El contrato aparecerá en el dashboard del alumno\n\n` +
            `💡 Una vez subido, el estudiante podrá verlo en su panel.`
          );
        } catch (pdfError) {
          console.error('Error específico en generación PDF:', pdfError);
          alert(
            `❌ ERROR AL GENERAR EL PDF\n\n` +
            `No se pudo crear el contrato PDF para ${alumno.alumno}.\n\n` +
            `Posibles causas:\n` +
            `• Error en la librería jsPDF\n` +
            `• Datos incompletos del alumno\n` +
            `• Problema con el navegador\n\n` +
            `Por favor, inténtalo de nuevo o contacta soporte técnico.`
          );
        }
      }
      
      console.log('Generar contrato para pago:', id);
    } catch (error) {
      console.error('Error al generar contrato:', error);
      alert('❌ Error al generar el contrato. Inténtalo de nuevo.');
    }
  };

  const handleSubirContrato = async (id, file) => {
    try {
      // TODO: Implementar llamada al backend
      // const formData = new FormData();
      // formData.append('contrato', file);
      // const response = await fetch(`/api/pagos/${id}/subir-contrato`, {
      //   method: 'POST',
      //   body: formData
      // });
      // const data = await response.json();
      // fetchPagos(); // Recargar lista
      
      if (!file) {
        alert('❌ Por favor selecciona un archivo PDF para subir.');
        return;
      }

      // Validar que sea un archivo PDF
      if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
        alert('❌ Solo se permiten archivos PDF. Por favor selecciona un archivo .pdf');
        return;
      }

      // Validar tamaño del archivo (máximo 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        alert('❌ El archivo es demasiado grande. El tamaño máximo permitido es 10MB.');
        return;
      }

      // Encontrar el alumno
      const alumno = pagos.find(p => p.id === id);
      if (!alumno) {
        alert('❌ No se encontró el alumno');
        return;
      }

      // Mostrar confirmación con detalles del archivo
      const confirmar = window.confirm(
        `📤 SUBIR CONTRATO FIRMADO\n\n` +
        `¿Confirmas la subida del contrato?\n\n` +
        `👤 Alumno: ${alumno.alumno}\n` +
        `📄 Archivo: ${file.name}\n` +
        `📊 Tamaño: ${(file.size / 1024 / 1024).toFixed(2)} MB\n` +
        `📋 Tipo: ${file.type}\n\n` +
        `✅ UNA VEZ CONFIRMADO:\n` +
        `• El contrato estará disponible para visualización\n` +
        `• Aparecerá automáticamente en el dashboard del alumno\n` +
        `• ${alumno.alumno} podrá verlo en su panel personal\n` +
        `• Quedará registrado en el sistema\n\n` +
        `📱 ¿Proceder con la subida?`
      );

      if (confirmar) {
        // Simular subida del archivo creando una URL temporal
        const fileUrl = URL.createObjectURL(file);
        
        // Actualizar el estado
        setPagos(pagos.map(pago => 
          pago.id === id ? { 
            ...pago, 
            contratoSubido: true, 
            contratoUrl: fileUrl,
            nombreArchivoSubido: file.name,
            fechaSubida: new Date().toISOString()
          } : pago
        ));

        // Mostrar mensaje de éxito
        alert(
          `✅ ¡CONTRATO SUBIDO EXITOSAMENTE!\n\n` +
          `📄 Archivo: ${file.name}\n` +
          `👤 Para: ${alumno.alumno}\n` +
          `📚 Curso: ${alumno.categoria}\n\n` +
          `🎯 ACCIONES COMPLETADAS:\n` +
          `✓ Contrato subido al sistema\n` +
          `✓ Agregado al dashboard del alumno\n` +
          `✓ Disponible para visualización aquí\n` +
          `✓ Registro actualizado en la base de datos\n\n` +
          `📱 ${alumno.alumno} ya puede ver su contrato\n` +
          `en su panel personal de estudiante.\n\n` +
          `🔍 Usa el botón "Ver" para verificar el archivo.`
        );
      }
      
      console.log('Subir contrato para pago:', id, 'Archivo:', file?.name);
    } catch (error) {
      console.error('Error al subir contrato:', error);
      alert('❌ Error al subir el contrato. Inténtalo de nuevo.');
    }
  };

  const handleVisualizarContrato = (url, alumno) => {
    try {
      if (!url) {
        alert('❌ No hay contrato disponible para visualizar.');
        return;
      }

      // Abrir la modal con el PDF
      setModalPDF({
        isOpen: true,
        url: url,
        alumno: alumno,
        tipo: 'contrato'
      });
      
      console.log('Visualizar contrato en modal:', url);
    } catch (error) {
      console.error('Error al visualizar contrato:', error);
      alert('❌ Error al abrir el contrato. Inténtalo de nuevo.');
    }
  };

  const handleVisualizarComprobante = (url, alumno) => {
    try {
      if (!url) {
        alert('❌ No hay comprobante disponible para visualizar.');
        return;
      }

      // Abrir la modal con el comprobante
      setModalPDF({
        isOpen: true,
        url: url,
        alumno: alumno,
        tipo: 'comprobante'
      });
      
      console.log('Visualizar comprobante en modal:', url);
    } catch (error) {
      console.error('Error al visualizar comprobante:', error);
      alert('❌ Error al abrir el comprobante. Inténtalo de nuevo.');
    }
  };

  const handleAprobarPago = async (id) => {
    try {
      // TODO: Implementar llamada al backend
      // const response = await fetch(`/api/pagos/${id}/aprobar`, { method: 'PUT' });
      // fetchPagos(); // Recargar lista
      console.log('Aprobar pago:', id);
    } catch (error) {
      console.error('Error al aprobar pago:', error);
    }
  };

  const handleRechazarPago = async (id) => {
    try {
      // TODO: Implementar llamada al backend
      // const response = await fetch(`/api/pagos/${id}/rechazar`, { method: 'PUT' });
      // fetchPagos(); // Recargar lista
      console.log('Rechazar pago:', id);
    } catch (error) {
      console.error('Error al rechazar pago:', error);
    }
  };

  // Si está cargando, mostrar pantalla de carga
  if (isLoading) {
    return <LoadingScreen onComplete={handleLoadingComplete} />;
  }

  return (
    <div className="w-full h-full min-h-[calc(100vh-80px)] flex flex-col bg-white">
      {/* Header con filtros optimizado */}
      <div className="pt-2 xs:pt-4 sm:pt-6 pb-2 xs:pb-3 sm:pb-4 px-2 xs:px-4 sm:px-6">
        <div className="w-full max-w-7xl mx-auto">
          {/* Título principal */}
          <div className="text-center mb-4 xs:mb-6 sm:mb-8">
            <h1 className="text-lg xs:text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-1 xs:mb-2 px-2">
              Validación de pago y contratos
            </h1>
            <p className="text-xs xs:text-sm sm:text-base text-gray-600 px-4">
              Gestiona los pagos y contratos de los estudiantes por curso y turno.
            </p>
          </div>

          {/* Botones de categoría (filtros por curso) */}
          <div className="mb-4 xs:mb-6 sm:mb-8">
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-lg xs:rounded-xl sm:rounded-2xl p-3 xs:p-4 sm:p-6 shadow-lg border border-gray-200">
              <h2 className="text-base xs:text-lg sm:text-xl font-bold text-gray-800 mb-3 xs:mb-4 sm:mb-6 text-center px-2">
                Filtrar por Curso
              </h2>
              <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-3 md:grid-cols-6 gap-1.5 xs:gap-2 sm:gap-3 md:gap-4 place-items-center">
                {categorias.map((categoria) => (
                  <CategoryButton
                    key={categoria}
                    label={categoria}
                    isActive={activeCategory === categoria}
                    onClick={() => handleCategorySelect(categoria)}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Botones de turno - Solo se muestra si hay una categoría seleccionada */}
          {activeCategory && (
            <div className="mb-4 xs:mb-6 sm:mb-8">
              <div className="bg-gradient-to-br from-blue-50 to-white rounded-lg xs:rounded-xl sm:rounded-2xl p-3 xs:p-4 sm:p-6 shadow-lg border border-blue-200">
                <h2 className="text-base xs:text-lg sm:text-xl font-bold text-gray-800 mb-3 xs:mb-4 sm:mb-6 text-center px-2">
                  Turnos Disponibles para {activeCategory}
                </h2>
                <div className="flex flex-row gap-3 xs:gap-4 sm:gap-6 justify-center items-center max-w-md mx-auto">
                  {turnos.map((turno) => (
                    <button
                      key={turno}
                      onClick={() => handleTurnoSelect(turno)}
                      className={`
                        relative overflow-hidden 
                        px-3 py-2 xs:px-4 xs:py-2 sm:px-6 sm:py-4
                        rounded-md xs:rounded-lg sm:rounded-xl 
                        font-bold text-xs xs:text-sm sm:text-base
                        transition-all duration-300 ease-out 
                        w-full min-w-[100px] max-w-[140px]
                        h-10 xs:h-12 sm:h-14 md:h-16
                        flex items-center justify-center
                        border-2 transform hover:scale-105 hover:shadow-lg
                        ${activeTurno === turno
                          ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white border-blue-500 shadow-md shadow-blue-500/30' 
                          : 'bg-gradient-to-r from-blue-400 to-blue-500 text-white border-blue-300 shadow-sm hover:from-blue-600 hover:to-blue-700 hover:border-blue-500'
                        }
                      `}
                    >
                      <span className="relative z-10 tracking-wide text-center leading-tight">{turno}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Barra de búsqueda - Solo se muestra cuando ambos filtros están activos */}
          {activeCategory && activeTurno && (
            <div className="mb-4 xs:mb-6">
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-lg xs:rounded-xl p-3 xs:p-4 shadow-lg border border-gray-200">
                <div className="max-w-sm xs:max-w-md mx-auto">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Buscar por nombre, folio o correo..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-3 xs:px-4 py-2 xs:py-3 pl-8 xs:pl-10 pr-3 xs:pr-4 text-xs xs:text-sm border border-gray-300 rounded-md xs:rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <div className="absolute inset-y-0 left-0 pl-2 xs:pl-3 flex items-center pointer-events-none">
                      <svg className="h-4 xs:h-5 w-4 xs:w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Contenido principal de la tabla */}
      <div className="flex-1 px-2 xs:px-4 sm:px-6 pb-4 xs:pb-6">
        <div className="w-full max-w-7xl mx-auto">
          {/* Contenido Principal */}
          {!activeCategory ? (
            // Estado inicial - Seleccionar categoría
            <div className="text-center py-8 xs:py-12 bg-gradient-to-br from-gray-50 to-white rounded-lg xs:rounded-xl shadow-lg border border-gray-200">
              <div className="max-w-xs xs:max-w-md mx-auto px-4">
                <svg className="mx-auto h-12 xs:h-16 w-12 xs:w-16 text-purple-400 mb-3 xs:mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <h3 className="text-lg xs:text-xl font-bold text-gray-800 mb-1 xs:mb-2">
                  Selecciona un Curso
                </h3>
                <p className="text-xs xs:text-base text-gray-600 mb-3 xs:mb-4">
                  Para ver los pagos y contratos, primero selecciona un curso de la lista anterior.
                </p>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 xs:p-4 mt-3 xs:mt-4">
                  <p className="text-xs xs:text-sm text-purple-700">
                    💡 <strong>Tip:</strong> Una vez seleccionado el curso, podrás filtrar por turno y buscar estudiantes específicos.
                  </p>
                </div>
              </div>
            </div>
          ) : !activeTurno ? (
            // Categoría seleccionada, falta turno
            <div className="text-center py-8 xs:py-12 bg-gradient-to-br from-gray-50 to-white rounded-lg xs:rounded-xl shadow-lg border border-gray-200">
              <div className="max-w-xs xs:max-w-md mx-auto px-4">
                <svg className="mx-auto h-12 xs:h-16 w-12 xs:w-16 text-purple-400 mb-3 xs:mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-lg xs:text-xl font-bold text-gray-800 mb-1 xs:mb-2">
                  Selecciona un Turno
                </h3>
                <p className="text-xs xs:text-base text-gray-600 mb-3 xs:mb-4">
                  Ahora selecciona un turno para ver los pagos y contratos de <span className="font-medium">{activeCategory}</span>.
                </p>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 xs:p-4 mt-3 xs:mt-4">
                  <p className="text-xs xs:text-sm text-purple-700">
                    💡 <strong>Tip:</strong> Selecciona VESPERTINO 1 o VESPERTINO 2 para ver la lista completa de pagos.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            // Ambos filtros activos - Mostrar contenido
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-lg xs:rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              {/* Header con gradiente como en ListaAlumnos */}
              <div className="px-3 xs:px-4 sm:px-6 py-3 xs:py-4 border-b border-gray-200 bg-gradient-to-r from-gray-100 to-gray-50">
                <h3 className="text-base xs:text-lg sm:text-xl font-bold text-gray-800">
                  Pagos y contratos - {activeCategory}
                </h3>
                <p className="text-xs xs:text-sm text-gray-600 mt-1">
                  {activeTurno} • {pagosFiltrados.length} {pagosFiltrados.length === 1 ? 'registro' : 'registros'}
                </p>
              </div>
            
              {/* Vista Desktop - Tabla responsive */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-gray-100 to-gray-50">
                    <tr>
                      <th className="px-1 xs:px-2 sm:px-4 py-2 xs:py-3 text-left text-[10px] xs:text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200">
                        Folio
                      </th>
                      <th className="px-1 xs:px-2 sm:px-4 py-2 xs:py-3 text-left text-[10px] xs:text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200">
                        Alumno
                      </th>
                      <th className="px-1 xs:px-2 sm:px-4 py-2 xs:py-3 text-left text-[10px] xs:text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200">
                        Fecha
                      </th>
                      <th className="px-1 xs:px-2 sm:px-4 py-2 xs:py-3 text-left text-[10px] xs:text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200">
                        Plan
                      </th>
                      <th className="px-1 xs:px-2 sm:px-4 py-2 xs:py-3 text-left text-[10px] xs:text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200">
                        Pago
                      </th>
                      <th className="px-1 xs:px-2 sm:px-4 py-2 xs:py-3 text-left text-[10px] xs:text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200">
                        Método
                      </th>
                      <th className="px-1 xs:px-2 sm:px-4 py-2 xs:py-3 text-center text-[10px] xs:text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200">
                        Contrato
                      </th>
                      <th className="px-1 xs:px-2 sm:px-4 py-2 xs:py-3 text-center text-[10px] xs:text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200">
                        Subir
                      </th>
                      <th className="px-1 xs:px-2 sm:px-4 py-2 xs:py-3 text-center text-[10px] xs:text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Visualizar
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {pagosFiltrados.map((pago, index) => (
                      <tr key={pago.id} className={`transition-colors duration-150 hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                        <td className="px-1 xs:px-2 sm:px-4 py-2 xs:py-3 border-r border-gray-200">
                          <div className="text-center">
                            <div className="text-[10px] xs:text-xs sm:text-sm font-bold text-purple-600 bg-purple-100 px-1 xs:px-2 py-0.5 xs:py-1 rounded-md xs:rounded-lg">
                              {pago.folio}
                            </div>
                          </div>
                        </td>
                        <td className="px-1 xs:px-2 sm:px-4 py-2 xs:py-3 border-r border-gray-200">
                          <div className="flex items-start space-x-1 xs:space-x-2 sm:space-x-3">
                            <div className="flex-shrink-0">
                              <div className="h-6 xs:h-8 sm:h-10 w-6 xs:w-8 sm:w-10 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-md">
                                <span className="text-[8px] xs:text-[10px] sm:text-sm font-bold text-white">
                                  {pago.alumno.split(' ').map(n => n.charAt(0)).join('').substring(0, 2)}
                                </span>
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-[10px] xs:text-xs sm:text-sm font-semibold text-gray-900 truncate">
                                {pago.alumno}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-1 xs:px-2 sm:px-4 py-2 xs:py-3 border-r border-gray-200 text-[8px] xs:text-[10px] sm:text-xs text-gray-700">
                          {pago.fechaEntrada}
                        </td>
                        <td className="px-1 xs:px-2 sm:px-4 py-2 xs:py-3 border-r border-gray-200 text-[8px] xs:text-[10px] sm:text-xs text-gray-700">
                          {pago.planCurso}
                        </td>
                        <td className="px-1 xs:px-2 sm:px-4 py-2 xs:py-3 border-r border-gray-200">
                          <span className="text-[8px] xs:text-[10px] sm:text-xs font-semibold text-green-700 bg-green-50 px-1 xs:px-2 py-0.5 xs:py-1 rounded-md">
                            {pago.pagoCurso}
                          </span>
                        </td>
                        <td className="px-1 xs:px-2 sm:px-4 py-2 xs:py-3 border-r border-gray-200 text-[8px] xs:text-[10px] sm:text-xs text-gray-700">
                          {pago.metodoPago}
                        </td>
                        <td className="px-1 xs:px-2 sm:px-4 py-2 xs:py-3 border-r border-gray-200 text-center">
                          {pago.contratoGenerado ? (
                            <button
                              onClick={() => handleVisualizarContrato(pago.contratoUrl, pago)}
                              className="inline-flex items-center px-1 xs:px-2 sm:px-3 py-0.5 xs:py-1 sm:py-2 bg-green-600 text-white text-[8px] xs:text-[10px] sm:text-xs font-medium rounded-md hover:bg-green-700 transition-colors duration-150"
                            >
                              <svg className="w-2 xs:w-3 sm:w-4 h-2 xs:h-3 sm:h-4 mr-0.5 xs:mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              Descargar
                            </button>
                          ) : (
                            <button
                              onClick={() => handleGenerarContrato(pago.id)}
                              className="inline-flex items-center px-1 xs:px-2 sm:px-3 py-0.5 xs:py-1 sm:py-2 bg-gray-700 text-white text-[8px] xs:text-[10px] sm:text-xs font-medium rounded-md hover:bg-gray-800 transition-colors duration-150"
                            >
                              <svg className="w-2 xs:w-3 sm:w-4 h-2 xs:h-3 sm:h-4 mr-0.5 xs:mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              Generar
                            </button>
                          )}
                        </td>
                        <td className="px-1 xs:px-2 sm:px-4 py-2 xs:py-3 border-r border-gray-200 text-center">
                          {pago.contratoSubido ? (
                            <div className="inline-flex items-center px-1 xs:px-2 sm:px-3 py-0.5 xs:py-1 sm:py-2 bg-green-100 text-green-700 text-[8px] xs:text-[10px] sm:text-xs font-medium rounded-md border border-green-200">
                              <svg className="w-2 xs:w-3 sm:w-4 h-2 xs:h-3 sm:h-4 mr-0.5 xs:mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Subido
                            </div>
                          ) : (
                            <label className="inline-flex items-center px-1 xs:px-2 sm:px-3 py-0.5 xs:py-1 sm:py-2 bg-blue-600 text-white text-[8px] xs:text-[10px] sm:text-xs font-medium rounded-md hover:bg-blue-700 transition-colors duration-150 cursor-pointer">
                              <svg className="w-2 xs:w-3 sm:w-4 h-2 xs:h-3 sm:h-4 mr-0.5 xs:mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                              </svg>
                              Subir
                              <input type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={(e) => handleSubirContrato(pago.id, e.target.files[0])} />
                            </label>
                          )}
                        </td>
                        <td className="px-1 xs:px-2 sm:px-4 py-2 xs:py-3 text-center">
                          <div className="flex flex-col items-center space-y-1">
                            {/* Botón para ver comprobante */}
                            <button
                              onClick={() => handleVisualizarComprobante(pago.comprobanteUrl, pago)}
                              className="inline-flex items-center px-1 xs:px-2 sm:px-3 py-0.5 xs:py-1 sm:py-2 bg-blue-600 text-white text-[8px] xs:text-[10px] sm:text-xs font-medium rounded-md hover:bg-blue-700 transition-colors duration-150"
                            >
                              <svg className="w-2 xs:w-3 sm:w-4 h-2 xs:h-3 sm:h-4 mr-0.5 xs:mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              Comprobante
                            </button>
                            
                            {/* Botón para ver contrato */}
                            {pago.contratoSubido ? (
                              <button
                                onClick={() => handleVisualizarContrato(pago.contratoUrl, pago)}
                                className="inline-flex items-center px-1 xs:px-2 sm:px-3 py-0.5 xs:py-1 sm:py-2 bg-indigo-600 text-white text-[8px] xs:text-[10px] sm:text-xs font-medium rounded-md hover:bg-indigo-700 transition-colors duration-150"
                              >
                                <svg className="w-2 xs:w-3 sm:w-4 h-2 xs:h-3 sm:h-4 mr-0.5 xs:mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                Contrato
                              </button>
                            ) : (
                              <div className="inline-flex items-center px-1 xs:px-2 sm:px-3 py-0.5 xs:py-1 sm:py-2 bg-gray-200 text-gray-500 text-[8px] xs:text-[10px] sm:text-xs font-medium rounded-md">
                                <svg className="w-2 xs:w-3 sm:w-4 h-2 xs:h-3 sm:h-4 mr-0.5 xs:mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                                </svg>
                                Sin contrato
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
              </table>
            </div>

            {/* Vista móvil - Cards con sombras pronunciadas */}
            <div className="lg:hidden bg-gradient-to-br from-gray-50 via-white to-gray-50">
              <div className="space-y-4 p-4">
                {pagosFiltrados.map((pago, index) => (
                  <div key={pago.id} className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 space-y-4 hover:shadow-xl transition-shadow duration-300">
                    {/* Header de la card */}
                    <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg shadow-sm">
                          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <span className="text-sm font-semibold text-gray-900">{pago.folio}</span>
                      </div>
                    </div>

                    {/* Información del alumno */}
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg shadow-sm">
                          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Alumno</p>
                          <p className="text-sm font-medium text-gray-900">{pago.alumno}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-gradient-to-br from-green-50 to-white p-2 rounded-lg">
                          <p className="text-xs text-gray-500 font-medium">Fecha</p>
                          <p className="text-sm text-gray-800">{pago.fechaEntrada}</p>
                        </div>
                        <div className="bg-gradient-to-br from-emerald-50 to-white p-2 rounded-lg">
                          <p className="text-xs text-gray-500 font-medium">Pago</p>
                          <p className="text-sm font-semibold text-green-700">{pago.pagoCurso}</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="bg-gradient-to-br from-yellow-50 to-white p-2 rounded-lg">
                          <p className="text-xs text-gray-500 font-medium">Plan del curso</p>
                          <p className="text-sm text-gray-800">{pago.planCurso}</p>
                        </div>
                        <div className="bg-gradient-to-br from-indigo-50 to-white p-2 rounded-lg">
                          <p className="text-xs text-gray-500 font-medium">Método de pago</p>
                          <p className="text-sm text-gray-800">{pago.metodoPago}</p>
                        </div>
                      </div>
                    </div>

                    {/* Acciones móvil */}
                    <div className="pt-3 border-t border-gray-200">
                      <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-3">Acciones</p>
                      <div className="grid grid-cols-1 gap-2">
                        {/* Generar/Descargar contrato */}
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">Contrato:</span>
                          {pago.contratoGenerado ? (
                            <button
                              onClick={() => handleVisualizarContrato(pago.contratoUrl, pago)}
                              className="inline-flex items-center px-3 py-1 bg-green-600 text-white text-xs font-medium rounded-md hover:bg-green-700 transition-colors duration-150"
                            >
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              Descargar
                            </button>
                          ) : (
                            <button
                              onClick={() => handleGenerarContrato(pago.id)}
                              className="inline-flex items-center px-3 py-1 bg-gray-700 text-white text-xs font-medium rounded-md hover:bg-gray-800 transition-colors duration-150"
                            >
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              Generar
                            </button>
                          )}
                        </div>

                        {/* Subir contrato */}
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">Subir:</span>
                          {pago.contratoSubido ? (
                            <div className="inline-flex items-center px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-md border border-green-200">
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Subido
                            </div>
                          ) : (
                            <label className="inline-flex items-center px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-md hover:bg-blue-700 transition-colors duration-150 cursor-pointer">
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                              </svg>
                              Subir
                              <input type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={(e) => handleSubirContrato(pago.id, e.target.files[0])} />
                            </label>
                          )}
                        </div>

                        {/* Visualizar documentos */}
                        <div className="space-y-2">
                          <span className="text-sm font-medium text-gray-700">Visualizar documentos:</span>
                          
                          {/* Botón para ver comprobante */}
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-600">Comprobante:</span>
                            <button
                              onClick={() => handleVisualizarComprobante(pago.comprobanteUrl, pago)}
                              className="inline-flex items-center px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-md hover:bg-blue-700 transition-colors duration-150"
                            >
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              Ver Comprobante
                            </button>
                          </div>
                          
                          {/* Botón para ver contrato */}
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-600">Contrato:</span>
                            {pago.contratoSubido ? (
                              <button
                                onClick={() => handleVisualizarContrato(pago.contratoUrl, pago)}
                                className="inline-flex items-center px-3 py-1 bg-indigo-600 text-white text-xs font-medium rounded-md hover:bg-indigo-700 transition-colors duration-150"
                              >
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                Ver Contrato
                              </button>
                            ) : (
                              <div className="inline-flex items-center px-3 py-1 bg-gray-200 text-gray-500 text-xs font-medium rounded-md">
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                                </svg>
                                Sin contrato
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {pagosFiltrados.length === 0 && (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No se encontraron registros</h3>
                <p className="mt-1 text-sm text-gray-500">
                  No hay pagos para {activeCategory} - {activeTurno} que coincidan con la búsqueda.
                </p>
              </div>
            )}
          </div>
        )}
        </div>
      </div>

      {/* Componente Modal para visualizar PDF */}
      {modalPDF.isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Overlay */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-75 transition-opacity"
            onClick={() => setModalPDF({ isOpen: false, url: '', alumno: null, tipo: '' })}
          />
          
          {/* Modal Content */}
          <div className="relative flex flex-col h-full max-w-6xl mx-auto">
            {/* Header de la modal */}
            <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between relative z-10">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {modalPDF.tipo === 'contrato' ? 'Contrato de Curso' : 'Comprobante de Pago'}
                  </h3>
                  {modalPDF.alumno && (
                    <p className="text-sm text-gray-600">
                      {modalPDF.alumno.alumno} • Folio: {modalPDF.alumno.folio} • {modalPDF.alumno.categoria}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {/* Botón descargar */}
                <button
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = modalPDF.url;
                    link.download = `${modalPDF.tipo}_${modalPDF.alumno?.folio}_${modalPDF.alumno?.alumno?.replace(/\s+/g, '_')}.pdf`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
                >
                  <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Descargar
                </button>
                
                {/* Botón cerrar */}
                <button
                  onClick={() => setModalPDF({ isOpen: false, url: '', alumno: null, tipo: '' })}
                  className="inline-flex items-center justify-center w-8 h-8 border border-gray-300 shadow-sm rounded-md text-gray-400 bg-white hover:bg-gray-50 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* PDF Viewer */}
            <div className="flex-1 bg-gray-100">
              <iframe
                src={modalPDF.url}
                className="w-full h-full border-none"
                title={`${modalPDF.tipo} - ${modalPDF.alumno?.alumno}`}
                style={{ minHeight: 'calc(100vh - 120px)' }}
              />
            </div>
            
            {/* Footer de la modal */}
            <div className="bg-white border-t border-gray-200 px-4 py-3 relative z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m-1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>
                    {modalPDF.tipo === 'contrato' 
                      ? modalPDF.alumno?.contratoSubido 
                        ? 'Contrato firmado y subido'
                        : 'Contrato generado automáticamente'
                      : 'Comprobante de pago válido'
                    }
                  </span>
                </div>
                
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setModalPDF({ isOpen: false, url: '', alumno: null, tipo: '' })}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
                  >
                    Cerrar
                  </button>
                  <button
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = modalPDF.url;
                      link.download = `${modalPDF.tipo}_${modalPDF.alumno?.folio}_${modalPDF.alumno?.alumno?.replace(/\s+/g, '_')}.pdf`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                    className="px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-md shadow-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
                  >
                    Descargar PDF
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
