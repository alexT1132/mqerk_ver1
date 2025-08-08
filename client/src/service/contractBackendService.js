/**
 * Ejemplo de integración con Backend API para contratos PDF
 * Este archivo muestra cómo conectar el frontend con el backend
 */

// Configuración base de la API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

/**
 * Servicio para manejar contratos con el backend
 */
export class ContractBackendService {
  
  /**
   * Genera un contrato usando el backend
   */
  static async generarContratoEnBackend(alumnoData) {
    try {
      const response = await fetch(`${API_BASE_URL}/contratos/generar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          alumnoId: alumnoData.id,
          datosPersonales: {
            nombre: alumnoData.nombre,
            apellidos: alumnoData.apellidos,
            correoElectronico: alumnoData.correoElectronico,
            telefono: alumnoData.telefono,
            nivelAcademico: alumnoData.nivelAcademico
          },
          datosTutor: {
            nombreTutor: alumnoData.nombreTutor,
            telefonoTutor: alumnoData.telefonoTutor
          },
          datosMedicos: {
            alergias: alumnoData.alergias,
            seguimientoPsicologico: alumnoData.seguimientoPsicologico
          },
          datosCurso: {
            categoria: alumnoData.categoria,
            planCurso: alumnoData.planCurso,
            turno: alumnoData.turno,
            pagoCurso: alumnoData.pagoCurso
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Error del servidor: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error al generar contrato en backend:', error);
      throw error;
    }
  }

  /**
   * Descarga un contrato desde el backend
   */
  static async descargarContrato(contratoId) {
    try {
      const response = await fetch(`${API_BASE_URL}/contratos/${contratoId}/download`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error(`Error al descargar: ${response.status}`);
      }

      // Obtener el blob del PDF
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      // Obtener nombre del archivo desde headers
      const contentDisposition = response.headers.get('Content-Disposition');
      const filename = contentDisposition 
        ? contentDisposition.split('filename=')[1].replace(/"/g, '')
        : `contrato_${contratoId}.pdf`;

      // Descargar automáticamente
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      return { success: true, filename };
    } catch (error) {
      console.error('Error al descargar contrato:', error);
      throw error;
    }
  }

  /**
   * Sube un contrato firmado
   */
  static async subirContratoFirmado(contratoId, file) {
    try {
      const formData = new FormData();
      formData.append('contrato', file);

      const response = await fetch(`${API_BASE_URL}/contratos/${contratoId}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Error al subir archivo: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error al subir contrato:', error);
      throw error;
    }
  }

  /**
   * Obtiene el historial de contratos
   */
  static async obtenerHistorialContratos(alumnoId) {
    try {
      const response = await fetch(`${API_BASE_URL}/contratos/historial/${alumnoId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error(`Error al obtener historial: ${response.status}`);
      }

      const contratos = await response.json();
      return contratos;
    } catch (error) {
      console.error('Error al obtener historial:', error);
      throw error;
    }
  }

  /**
   * Actualiza el estado de un contrato
   */
  static async actualizarEstadoContrato(contratoId, nuevoEstado) {
    try {
      const response = await fetch(`${API_BASE_URL}/contratos/${contratoId}/estado`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          estado: nuevoEstado // 'generado', 'firmado', 'completado', 'cancelado'
        })
      });

      if (!response.ok) {
        throw new Error(`Error al actualizar estado: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error al actualizar estado:', error);
      throw error;
    }
  }
}

/**
 * Hook personalizado para manejar contratos
 */
export const useContratos = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generarContrato = async (alumnoData) => {
    setLoading(true);
    setError(null);
    
    try {
      const resultado = await ContractBackendService.generarContratoEnBackend(alumnoData);
      return resultado;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const descargarContrato = async (contratoId) => {
    setLoading(true);
    setError(null);
    
    try {
      const resultado = await ContractBackendService.descargarContrato(contratoId);
      return resultado;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const subirContrato = async (contratoId, file) => {
    setLoading(true);
    setError(null);
    
    try {
      const resultado = await ContractBackendService.subirContratoFirmado(contratoId, file);
      return resultado;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    generarContrato,
    descargarContrato,
    subirContrato,
    loading,
    error
  };
};

/**
 * Ejemplo de uso en el componente principal
 */
/*
// En ValidacionPagos_Admin_comp.jsx

import { ContractBackendService } from '../../services/contractBackendService';

// Función actualizada para usar el backend
const generarContratoConBackend = async (alumno) => {
  try {
    // Opción 1: Generar en el backend
    const resultado = await ContractBackendService.generarContratoEnBackend(alumno);
    
    // Descargar el PDF generado
    await ContractBackendService.descargarContrato(resultado.contratoId);
    
    // Actualizar estado local
    setPagos(pagos.map(pago => 
      pago.id === alumno.id ? { 
        ...pago, 
        contratoGenerado: true,
        contratoId: resultado.contratoId,
        contratoUrl: resultado.url 
      } : pago
    ));
    
  } catch (error) {
    console.error('Error con backend:', error);
    
    // Fallback: usar generación local
    const resultadoLocal = await generarContratoDesdePlantilla(alumno);
    return resultadoLocal;
  }
};
*/

/**
 * Estructura esperada del backend API
 */
/*
POST /api/contratos/generar
{
  "alumnoId": "123",
  "datosPersonales": {
    "nombre": "Juan",
    "apellidos": "Pérez López",
    "correoElectronico": "juan@email.com",
    "telefono": "(999) 123-4567",
    "nivelAcademico": "PREPARATORIA"
  },
  "datosTutor": {
    "nombreTutor": "María Pérez",
    "telefonoTutor": "(999) 987-6543"
  },
  "datosMedicos": {
    "alergias": "NINGUNA",
    "seguimientoPsicologico": false
  },
  "datosCurso": {
    "categoria": "Matemáticas",
    "planCurso": "Plan Básico - 6 meses",
    "turno": "Matutino",
    "pagoCurso": "$1,500.00"
  }
}

Response:
{
  "success": true,
  "contratoId": "CONTRATO_001",
  "folio": "MQEEAU-2025-0731-0001",
  "url": "/api/contratos/CONTRATO_001/view",
  "downloadUrl": "/api/contratos/CONTRATO_001/download",
  "fechaGeneracion": "2025-07-31T10:30:00Z",
  "estado": "generado"
}
*/

export default ContractBackendService;