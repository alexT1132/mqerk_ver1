// src/context/AdminContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from '../api/axios.js';

/**
 * Contexto principal para el manejo de datos administrativos
 * Centraliza la lógica de datos del backend para todos los componentes admin
 *
 * Estado: conectado a backend real para métricas del dashboard y reportes de pagos.
 * Otras secciones pueden seguir teniendo TODOs puntuales que iremos activando según necesidad.
 */
const AdminContext = createContext();

/**
 * Hook para consumir el contexto administrativo
 * @returns {Object} Estado y métodos del contexto administrativo
 */
export const useAdminContext = () => {
  const context = useContext(AdminContext);
  if (!context) {
    // Fallback seguro para evitar romper la UI si un componente se monta fuera del provider
    if (typeof window !== 'undefined') {
      console.warn('[AdminContext] useAdminContext usado fuera de AdminProvider. Devolviendo valores por defecto.');
    }
    return {
      // Estados mínimos
      isLoading: false,
      error: null,
      lastUpdated: null,
      systemStatus: 'online',
      dashboardData: null,
      adminProfile: null,
      adminData: null,
      studentsData: null,
      paymentsData: null,
      // No-op functions para evitar errores
      refreshDashboard: async () => {},
      loadDashboardMetrics: async () => {},
      loadAdminProfile: async () => {},
      loadStudentsData: async () => [],
      deleteStudent: async () => {},
      updateStudent: async () => {},
      loadPaymentsData: async () => [],
      approvePayment: async () => {},
      rejectPayment: async () => {},
      generateContract: async () => {},
      uploadContract: async () => {},
      loadFinancialReports: async () => ({}),
      exportToExcel: async () => {},
      exportToPDF: async () => {},
      uploadAdminAvatar: async () => {},
      updateAdminProfile: async () => {},
      removeAdminAvatar: async () => {},
    };
  }
  return context;
};

/**
 * Provider del contexto administrativo
 * Maneja todo el estado global de la aplicación administrativa
 */
export const AdminProvider = ({ children }) => {
  // Estados principales
  const [dashboardData, setDashboardData] = useState(null);
  const [adminProfile, setAdminProfile] = useState(null);
  // Alias de compatibilidad para componentes que esperan adminData
  const [adminData, setAdminData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Estados específicos para diferentes secciones
  const [studentsData, setStudentsData] = useState(null);
  const [paymentsData, setPaymentsData] = useState(null);
  const [systemStatus, setSystemStatus] = useState('online');

  /**
   * Función para cargar métricas del dashboard principal
   */
  const loadDashboardMetrics = async () => {
    try {
      setIsLoading(true);
      setError(null);
      // Llamada real al backend
      const { data } = await axios.get('/admin/dashboard/metrics');
      setDashboardData({
        ingresos: Number(data?.ingresos || 0),
        pagosPendientes: Number(data?.pagosPendientes || 0),
        nuevosAlumnos: Number(data?.nuevosAlumnos || 0),
        cursosActivos: Number(data?.cursosActivos || 0),
        accesosActivados: Number(data?.accesosActivados || 0),
        notificationsCount: Number(data?.notificationsCount || 0)
      });
      setLastUpdated(data?.updatedAt || new Date().toISOString());
      
    } catch (err) {
      setError(err.message);
      console.error('Dashboard metrics error:', err);
    } finally {
  setIsLoading(false);
    }
  };

  /**
   * Función para cargar perfil del administrador
   */
  const loadAdminProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const { data } = await axios.get('/admin/profile');
      // data: { usuario: { id, usuario, role }, admin_profile: { nombre, email, telefono, foto } }
      const perfil = data?.admin_profile || null;
      const usuario = data?.usuario || null;
      // Construir URL absoluta para la foto si viene como ruta relativa (/public/..)
      const apiBase = axios?.defaults?.baseURL || '';
      const publicOrigin = apiBase.replace(/\/api\/?$/, '');
      const avatarAbs = perfil?.foto ? `${publicOrigin}${perfil.foto}` : null;

      // Exponer adminProfile con la forma esperada por componentes existentes
      const normalizedProfile = perfil ? {
        id: usuario?.id,
        name: perfil.nombre || '',
        email: perfil.email || '',
        phone: perfil.telefono || '',
        avatar: avatarAbs,
        role: usuario?.role || 'admin',
        // Guarda crudo por si se necesita
        _raw: perfil
      } : null;
      setAdminProfile(normalizedProfile);

      // Compat: exponer adminData con las claves que usa BienvenidaAdmin.jsx
  const fullName = perfil?.nombre || 'Administrador';
      const firstName = String(fullName).trim().split(/\s+/)[0] || 'Administrador';
      const roleLabel = (usuario?.role === 'admin') ? 'Administrador' : (usuario?.role || 'Administrador');
  const avatarUrl = avatarAbs;
      setAdminData({
        name: firstName,
        fullName: fullName,
        email: perfil?.email || null,
        role: roleLabel,
        avatarUrl
      });

    } catch (err) {
      console.error('Admin profile error:', err);
      setError('No se pudo cargar el perfil del administrador');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Función para refrescar todos los datos del dashboard
   */
  const refreshDashboard = async () => {
    await loadDashboardMetrics();
  };

  /**
   * Función para cargar datos de estudiantes (para ListaAlumnos)
   */
  const loadStudentsData = async (curso, turno) => {
    try {
      // Real backend for approved/activated students
      const params = {};
      if (curso) params.curso = curso;
      if (turno) params.grupo = turno;
      const { data } = await axios.get('/admin/estudiantes/aprobados', { params });
      const list = Array.isArray(data?.data) ? data.data : [];
      setStudentsData(list);
      return list;
    } catch (err) {
      console.error('Students data error:', err);
      setStudentsData([]);
      throw err;
    }
  };

  /**
   * Función para cargar datos de pagos (para ValidacionPagos)
   */
  const loadPaymentsData = async (curso, turno) => {
    try {
      // TODO: BACKEND - Reemplazar con endpoint real cuando esté disponible
      // const response = await fetch(`/api/admin/payments/validation?curso=${curso}&turno=${turno}`, {
      //   headers: {
      //     'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
      //     'Content-Type': 'application/json'
      //   }
      // });
      
      // if (!response.ok) {
      //   throw new Error('Error loading payments data');
      // }
      
      // const payments = await response.json();
      
      // MOCK DATA - Pagos temporales
      await new Promise(resolve => setTimeout(resolve, 700)); // Simular latencia
      
      const mockPayments = [
        {
          id: 'PAY001',
          folio: 'PAY-2024-001',
          alumno: 'Juan Carlos Pérez García',
          correoElectronico: 'juan@email.com',
          fechaEntrada: '2024-12-15',
          planCurso: `Plan ${curso}`,
          pagoCurso: '$2,500.00',
          metodoPago: 'Transferencia',
          categoria: curso,
          turno: turno,
          contratoGenerado: false,
          contratoSubido: false,
          estatus: 'Pendiente'
        },
        {
          id: 'PAY002',
          folio: 'PAY-2024-002',
          alumno: 'María Elena López Martínez',
          correoElectronico: 'maria@email.com',
          fechaEntrada: '2024-12-16',
          planCurso: `Plan ${curso}`,
          pagoCurso: '$2,500.00',
          metodoPago: 'Efectivo',
          categoria: curso,
          turno: turno,
          contratoGenerado: true,
          contratoSubido: false,
          estatus: 'En Proceso'
        }
      ];
      
      setPaymentsData(mockPayments);
      return mockPayments;
      
    } catch (err) {
      console.error('Payments data error:', err);
      throw err;
    }
  };

  /**
   * Función para aprobar un pago
   */
  const approvePayment = async (paymentId) => {
    try {
      // TODO: BACKEND - Reemplazar con endpoint real cuando esté disponible
      // const response = await fetch(`/api/admin/payments/${paymentId}/approve`, {
      //   method: 'PUT',
      //   headers: {
      //     'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
      //     'Content-Type': 'application/json'
      //   }
      // });
      
      // if (!response.ok) {
      //   throw new Error('Error approving payment');
      // }
      
      // return await response.json();
      
      // MOCK - Simular aprobación de pago
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log(`✅ Pago ${paymentId} aprobado exitosamente (MOCK)`);
      
      return {
        success: true,
        message: 'Pago aprobado exitosamente',
        paymentId: paymentId,
        status: 'Aprobado',
        timestamp: new Date().toISOString()
      };
    } catch (err) {
      console.error('Error approving payment:', err);
      throw err;
    }
  };

  /**
   * Función para rechazar un pago
   */
  const rejectPayment = async (paymentId, reason) => {
    try {
      // TODO: BACKEND - Reemplazar con endpoint real cuando esté disponible
      // const response = await fetch(`/api/admin/payments/${paymentId}/reject`, {
      //   method: 'PUT',
      //   headers: {
      //     'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify({ reason })
      // });
      
      // if (!response.ok) {
      //   throw new Error('Error rejecting payment');
      // }
      
      // return await response.json();
      
      // MOCK - Simular rechazo de pago
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log(`❌ Pago ${paymentId} rechazado. Razón: ${reason} (MOCK)`);
      
      return {
        success: true,
        message: 'Pago rechazado exitosamente',
        paymentId: paymentId,
        status: 'Rechazado',
        reason: reason,
        timestamp: new Date().toISOString()
      };
    } catch (err) {
      console.error('Error rejecting payment:', err);
      throw err;
    }
  };

  // Cargar datos iniciales
  useEffect(() => {
    loadDashboardMetrics();
    loadAdminProfile();
    
    // Auto-refresh cada 5 minutos solo para métricas del dashboard
    const interval = setInterval(loadDashboardMetrics, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  /**
   * Generate contract for a payment
   */
  const generateContract = async (paymentId, contractData) => {
    try {
      // TODO: BACKEND - Reemplazar con endpoint real cuando esté disponible
      // const response = await fetch(`/api/admin/payments/${paymentId}/generate-contract`, {
      //   method: 'PUT',
      //   headers: {
      //     'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify(contractData)
      // });
      
      // if (!response.ok) {
      //   throw new Error('Error generating contract');
      // }
      
      // return await response.json();
      
      // MOCK - Simular generación de contrato
      await new Promise(resolve => setTimeout(resolve, 800));
      
      console.log(`📄 Contrato generado para pago ${paymentId} (MOCK)`);
      
      return {
        success: true,
        message: 'Contrato generado exitosamente',
        paymentId: paymentId,
        contractUrl: `/contracts/${paymentId}-contract.pdf`,
        timestamp: new Date().toISOString()
      };
    } catch (err) {
      console.error('Error generating contract:', err);
      throw err;
    }
  };

  /**
   * Upload signed contract for a payment
   */
  const uploadContract = async (paymentId, contractFile) => {
    try {
      // TODO: BACKEND - Reemplazar con endpoint real cuando esté disponible
      // const formData = new FormData();
      // formData.append('contract', contractFile);
      // formData.append('paymentId', paymentId);
      
      // const response = await fetch(`/api/admin/payments/${paymentId}/upload-contract`, {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
      //   },
      //   body: formData
      // });
      
      // if (!response.ok) {
      //   throw new Error('Error uploading contract');
      // }
      
      // return await response.json();
      
      // MOCK - Simular subida de contrato
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log(`📤 Contrato subido para pago ${paymentId} (MOCK)`);
      
      return {
        success: true,
        message: 'Contrato subido exitosamente',
        paymentId: paymentId,
        uploadedUrl: `/contracts/${paymentId}-signed.pdf`,
        timestamp: new Date().toISOString()
      };
    } catch (err) {
      console.error('Error uploading contract:', err);
      throw err;
    }
  };

  /**
   * Delete/Remove a student
   */
  const deleteStudent = async (studentId) => {
    try {
      // TODO: BACKEND - Reemplazar con endpoint real cuando esté disponible
      // const response = await fetch(`/api/admin/students/${studentId}`, {
      //   method: 'DELETE',
      //   headers: {
      //     'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
      //     'Content-Type': 'application/json'
      //   }
      // });
      
      // if (!response.ok) {
      //   throw new Error('Error deleting student');
      // }
      
      // return await response.json();
      
      // MOCK - Simular eliminación de estudiante
      await new Promise(resolve => setTimeout(resolve, 300));
      
      console.log(`🗑️ Estudiante ${studentId} eliminado (MOCK)`);
      
      return {
        success: true,
        message: 'Estudiante eliminado exitosamente',
        studentId: studentId,
        timestamp: new Date().toISOString()
      };
    } catch (err) {
      console.error('Error deleting student:', err);
      throw err;
    }
  };

  /**
   * Update student information
   */
  const updateStudent = async (studentId, studentData) => {
    try {
      // TODO: BACKEND - Reemplazar con endpoint real cuando esté disponible
      // const response = await fetch(`/api/admin/students/${studentId}`, {
      //   method: 'PUT',
      //   headers: {
      //     'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify(studentData)
      // });
      
      // if (!response.ok) {
      //   throw new Error('Error updating student');
      // }
      
      // return await response.json();
      
      // MOCK - Simular actualización de estudiante
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log(`✏️ Estudiante ${studentId} actualizado (MOCK)`);
      
      return {
        success: true,
        message: 'Estudiante actualizado exitosamente',
        studentId: studentId,
        updatedData: studentData,
        timestamp: new Date().toISOString()
      };
    } catch (err) {
      console.error('Error updating student:', err);
      throw err;
    }
  };

  /**
   * Load financial reports data
   */
  const loadFinancialReports = async (startDate, endDate) => {
    try {
      const { data } = await axios.get('/admin/reports/payments', {
        params: { startDate, endDate }
      });
      return data;
    } catch (err) {
      console.error('Error loading financial reports:', err);
      throw err;
    }
  };

  const exportToExcel = async (startDate, endDate) => {
    try {
      const response = await axios.get('/admin/reports/export/excel', {
        params: { startDate, endDate },
        responseType: 'blob' // si en un futuro devolvemos archivo
      });
      const contentType = response.headers['content-type'] || '';
      if (contentType.includes('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') || contentType.includes('application/octet-stream')) {
        return { blob: response.data };
      }
      // Si devuelve JSON
      try {
        const text = await response.data.text?.();
        if (text) {
          const json = JSON.parse(text);
          return json;
        }
      } catch {}
      return null;
    } catch (err) {
      console.error('Export Excel error:', err);
      throw err;
    }
  };

  const exportToPDF = async (startDate, endDate) => {
    try {
      const response = await axios.get('/admin/reports/export/pdf', {
        params: { startDate, endDate },
        responseType: 'blob'
      });
      const contentType = response.headers['content-type'] || '';
      if (contentType.includes('application/pdf')) {
        return { blob: response.data };
      }
      try {
        const text = await response.data.text?.();
        if (text) {
          const json = JSON.parse(text);
          return json;
        }
      } catch {}
      return null;
    } catch (err) {
      console.error('Export PDF error:', err);
      throw err;
    }
  };

  /**
   * Function to upload admin avatar photo
   * TODO: BACKEND - Replace with real endpoint when available
   */
  const uploadAdminAvatar = async (file) => {
    try {
      setIsLoading(true);
      setError(null);
      const form = new FormData();
      form.append('foto', file);
      const { data } = await axios.put('/admin/profile/foto', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      const perfil = data?.admin_profile || null;
      const apiBase = axios?.defaults?.baseURL || '';
      const publicOrigin = apiBase.replace(/\/api\/?$/, '');
      const avatarAbs = perfil?.foto ? `${publicOrigin}${perfil.foto}` : null;
      // Update profile and alias
      const nextProfile = (prev => prev ? { ...prev, avatar: avatarAbs } : { name: perfil?.nombre || '', email: perfil?.email || '', phone: perfil?.telefono || '', avatar: avatarAbs })(adminProfile);
      setAdminProfile(nextProfile);
      if (nextProfile) {
        const firstName = String(nextProfile.name || '').trim().split(/\s+/)[0] || 'Administrador';
        setAdminData(prev => ({
          ...(prev || {}),
          name: firstName,
          fullName: nextProfile.name || prev?.fullName,
          email: nextProfile.email || prev?.email,
          avatarUrl: nextProfile.avatar || null
        }));
      }
      return { success: true, avatarUrl: avatarAbs };
      
    } catch (err) {
      setError(err.message);
      console.error('Upload avatar error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Function to update admin profile information
   * TODO: BACKEND - Replace with real endpoint when available
   */
  const updateAdminProfile = async (profileData) => {
    try {
      setIsLoading(true);
      setError(null);
      // Map incoming name to backend field nombre
      const payload = {
        nombre: profileData.name || adminProfile?.name || undefined,
        email: profileData.email || adminProfile?.email || undefined,
        telefono: profileData.phone || profileData.telefono || adminProfile?.phone || undefined,
      };
      const { data } = await axios.put('/admin/profile', payload);
      const perfil = data?.admin_profile || null;
      const apiBase = axios?.defaults?.baseURL || '';
      const publicOrigin = apiBase.replace(/\/api\/?$/, '');
      const avatarAbs = perfil?.foto ? `${publicOrigin}${perfil.foto}` : adminProfile?.avatar || null;
      const updatedProfile = {
        id: data?.usuario?.id,
        name: perfil?.nombre || adminProfile?.name || '',
        email: perfil?.email || adminProfile?.email || '',
        phone: perfil?.telefono || adminProfile?.phone || '',
        avatar: avatarAbs,
        role: data?.usuario?.role || adminProfile?.role || 'admin'
      };
      setAdminProfile(updatedProfile);
      const firstName = String(updatedProfile.name || '').trim().split(/\s+/)[0] || 'Administrador';
      setAdminData(prev => ({
        ...(prev || {}),
        name: firstName,
        fullName: updatedProfile.name || prev?.fullName,
        email: updatedProfile.email || prev?.email,
        avatarUrl: updatedProfile.avatar || prev?.avatarUrl
      }));
      return { success: true, profile: updatedProfile };
      
    } catch (err) {
      setError(err.message);
      console.error('Update profile error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Function to remove admin avatar
   * TODO: BACKEND - Replace with real endpoint when available
   */
  const removeAdminAvatar = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // TODO: BACKEND - Replace with real endpoint when available
      // const response = await fetch('/api/admin/profile/avatar', {
      //   method: 'DELETE',
      //   headers: {
      //     'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
      //   }
      // });
      // 
      // if (!response.ok) {
      //   throw new Error('Error removing avatar');
      // }
      
      // MOCK DATA - Simulate avatar removal
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setAdminProfile(prev => ({
        ...prev,
        avatar: null
      }));
      
      return { success: true };
      
    } catch (err) {
      setError(err.message);
      console.error('Remove avatar error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize admin profile on component mount
  useEffect(() => {
    loadAdminProfile();
  }, []);

  // Context value with all admin functions and state
  const value = {
    // Estados principales
    dashboardData,
    adminProfile,
  adminData,
    isLoading,
    error,
    lastUpdated,
    systemStatus,
    
    // Estados específicos
    studentsData,
    paymentsData,
    
    // Funciones del dashboard
    refreshDashboard,
    loadDashboardMetrics,
    
    // Funciones de estudiantes
    loadStudentsData,
    deleteStudent,
    updateStudent,
    
    // Funciones de pagos
    loadPaymentsData,
    approvePayment,
    rejectPayment,
    generateContract,
    uploadContract,
    
    // Funciones de reportes
  loadFinancialReports,
  exportToExcel,
  exportToPDF,
    
    // Profile functions
    loadAdminProfile,
    uploadAdminAvatar,
    updateAdminProfile,
    removeAdminAvatar
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};