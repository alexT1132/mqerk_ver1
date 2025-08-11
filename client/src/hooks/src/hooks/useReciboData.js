import { useState, useEffect } from 'react';
import { useStudent } from '../context/StudentContext.jsx';

// Hook personalizado para manejar datos del estudiante para el recibo
export const useStudentDataForRecibo = () => {
  const { studentData, currentCourse } = useStudent();
  
  // Datos por defecto para el recibo
  const defaultStudentData = {
    name: "Estudiante MQerK",
    address: "Dirección no disponible",
    group: "Matutino",
    studentId: "EST001"
  };

  // Combinar datos reales con datos por defecto
  const studentForRecibo = {
    name: studentData?.name || studentData?.fullName || defaultStudentData.name,
    address: studentData?.address || defaultStudentData.address,
    group: studentData?.group || defaultStudentData.group,
    studentId: studentData?.id || studentData?.studentId || defaultStudentData.studentId
  };

  // Información del curso actual
  const courseInfo = {
    name: currentCourse?.name || "Curso de Inglés Elemental",
    level: currentCourse?.level || "Elemental",
    duration: currentCourse?.duration || "8 sesiones"
  };

  return {
    studentForRecibo,
    courseInfo,
    hasValidData: Boolean(studentData)
  };
};

// Hook para generar datos de pago simulados para pruebas
export const usePaymentDataGenerator = () => {
  const generatePaymentData = (paymentInfo) => {
    return {
      id: paymentInfo.id || 1,
      amount: paymentInfo.amount || 1500,
      baseAmount: paymentInfo.baseAmount || paymentInfo.amount || 1500,
      date: paymentInfo.date || new Date(),
      method: paymentInfo.method || 'Efectivo',
      status: paymentInfo.status || 'paid',
      plan: paymentInfo.plan || 'Plan Mensual',
      paymentNumber: paymentInfo.paymentNumber || 1,
      dueDate: paymentInfo.dueDate || new Date(),
      verificationDate: paymentInfo.verificationDate || new Date(),
      discount: paymentInfo.discount || null,
      penalty: paymentInfo.penalty || null,
      description: paymentInfo.description || 'Pago mensual curso de inglés'
    };
  };

  return { generatePaymentData };
};