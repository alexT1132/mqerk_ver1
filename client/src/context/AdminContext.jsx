// src/context/AdminContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

/**
 * Contexto principal para el manejo de datos administrativos
 * Centraliza la lógica de datos del backend para todos los componentes admin
 * 
 * ESTADO ACTUAL: FUNCIONANDO CON DATOS MOCK
 * - Todas las funciones tienen datos mock temporales
 * - Los endpoints reales están comentados y listos para activar
 * - Solo necesitas descomentar y conectar el backend real
 * 
 * TODO BACKEND:
 * 1. Crear endpoints en el backend
 * 2. Descomentar las llamadas fetch reales
 * 3. Comentar/eliminar los datos mock
 */
const AdminContext = createContext();

/**
 * Hook para consumir el contexto administrativo
 * @returns {Object} Estado y métodos del contexto administrativo
 */
export const useAdminContext = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdminContext debe usarse dentro de AdminProvider');
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
      
      // TODO: BACKEND - Reemplazar con endpoint real cuando esté disponible
      // const response = await fetch('/api/admin/dashboard/metrics', {
      //   headers: {
      //     'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
      //     'Content-Type': 'application/json'
      //   }
      // });
      
      // if (!response.ok) {
      //   throw new Error(`HTTP error! status: ${response.status}`);
      // }
      
      // const data = await response.json();
      
      // MOCK DATA - Simular datos temporales hasta que el backend esté listo
      await new Promise(resolve => setTimeout(resolve, 800)); // Simular latencia
      
      const mockData = {
        ingresos: 125000 + Math.floor(Math.random() * 50000),
        pagosPendientes: 23 + Math.floor(Math.random() * 10),
        nuevosAlumnos: 15 + Math.floor(Math.random() * 5),
        cursosActivos: 8 + Math.floor(Math.random() * 3),
        accesosActivados: 42 + Math.floor(Math.random() * 20)
      };
      
      setDashboardData(mockData);
      setLastUpdated(new Date().toISOString());
      
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
      // TODO: BACKEND - Reemplazar con endpoint real cuando esté disponible
      // const response = await fetch('/api/admin/profile', {
      //   headers: {
      //     'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
      //     'Content-Type': 'application/json'
      //   }
      // });
      
      // if (!response.ok) {
      //   throw new Error('Error loading admin profile');
      // }
      
      // const profile = await response.json();
      
      // MOCK DATA - Perfil temporal del administrador
      const mockProfile = {
        id: 'admin_001',
        name: 'Administrador Principal',
        email: 'admin@mqerk.academy',
        role: 'Super Admin',
        avatar: null,
        lastLogin: new Date().toISOString(),
        permissions: ['read', 'write', 'delete', 'manage_users', 'manage_payments']
      };
      
      setAdminProfile(mockProfile);
      
    } catch (err) {
      console.error('Admin profile error:', err);
      // No lanzar error para el perfil, solo log
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
      // TODO: BACKEND - Reemplazar con endpoint real cuando esté disponible
      // const response = await fetch(`/api/admin/students?curso=${curso}&turno=${turno}`, {
      //   headers: {
      //     'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
      //     'Content-Type': 'application/json'
      //   }
      // });
      
      // if (!response.ok) {
      //   throw new Error('Error loading students data');
      // }
      
      // const students = await response.json();
      
      // MOCK DATA - Estudiantes temporales
      await new Promise(resolve => setTimeout(resolve, 600)); // Simular latencia
      
      const mockStudents = [
        {
          folio: 'ALU001',
          correoElectronico: 'estudiante1@email.com',
          nombres: 'Juan Carlos',
          apellidos: 'Pérez García',
          curso: curso,
          turno: turno,
          estatus: 'Activo',
          fechaRegistro: '2024-12-15'
        },
        {
          folio: 'ALU002',
          correoElectronico: 'estudiante2@email.com',
          nombres: 'María Elena',
          apellidos: 'López Martínez',
          curso: curso,
          turno: turno,
          estatus: 'Activo',
          fechaRegistro: '2024-12-16'
        }
      ];
      
      setStudentsData(mockStudents);
      return mockStudents;
      
    } catch (err) {
      console.error('Students data error:', err);
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
  const loadFinancialReports = async (dateRange) => {
    try {
      // TODO: BACKEND - Reemplazar con endpoint real cuando esté disponible
      // const response = await fetch(`/api/admin/reports/financial?from=${dateRange.from}&to=${dateRange.to}`, {
      //   headers: {
      //     'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
      //     'Content-Type': 'application/json'
      //   }
      // });
      
      // if (!response.ok) {
      //   throw new Error('Error loading financial reports');
      // }
      
      // return await response.json();
      
      // MOCK - Datos de reportes financieros
      await new Promise(resolve => setTimeout(resolve, 600));
      
      const mockReports = {
        totalIngresos: 385000,
        pagosCompletados: 156,
        pagosPendientes: 23,
        pagosRechazados: 8,
        ingresosPorMes: [
          { mes: 'Enero', ingresos: 45000 },
          { mes: 'Febrero', ingresos: 52000 },
          { mes: 'Marzo', ingresos: 48000 },
          { mes: 'Abril', ingresos: 58000 },
          { mes: 'Mayo', ingresos: 62000 },
          { mes: 'Junio', ingresos: 55000 },
          { mes: 'Julio', ingresos: 65000 }
        ],
        pagosPorCurso: [
          { curso: 'EEAU', pagos: 45, ingresos: 112500 },
          { curso: 'EEAP', pagos: 38, ingresos: 95000 },
          { curso: 'DIGI-START', pagos: 32, ingresos: 80000 },
          { curso: 'MINDBRIDGE', pagos: 25, ingresos: 62500 },
          { curso: 'SPEAKUP', pagos: 16, ingresos: 40000 }
        ]
      };
      
      return mockReports;
    } catch (err) {
      console.error('Error loading financial reports:', err);
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
      
      // TODO: BACKEND - Replace with real endpoint when available
      // const formData = new FormData();
      // formData.append('avatar', file);
      // 
      // const response = await fetch('/api/admin/profile/avatar', {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
      //   },
      //   body: formData
      // });
      // 
      // if (!response.ok) {
      //   throw new Error('Error uploading avatar');
      // }
      // 
      // const result = await response.json();
      
      // MOCK DATA - Simulate file upload
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate upload time
      
      const mockAvatarUrl = URL.createObjectURL(file); // Create temporary URL for preview
      
      // Update admin profile with new avatar
      setAdminProfile(prev => ({
        ...prev,
        avatar: mockAvatarUrl
      }));
      
      return { success: true, avatarUrl: mockAvatarUrl };
      
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
      
      // TODO: BACKEND - Replace with real endpoint when available
      // const response = await fetch('/api/admin/profile', {
      //   method: 'PUT',
      //   headers: {
      //     'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify(profileData)
      // });
      // 
      // if (!response.ok) {
      //   throw new Error('Error updating profile');
      // }
      // 
      // const updatedProfile = await response.json();
      
      // MOCK DATA - Simulate profile update
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const updatedProfile = {
        ...adminProfile,
        ...profileData,
        lastUpdated: new Date().toISOString()
      };
      
      setAdminProfile(updatedProfile);
      
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