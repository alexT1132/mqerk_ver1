// Importar datos centralizados
import { getStudentByFolio, getAllStudents } from '../data/studentsData.js';

// Los datos mock ahora están centralizados en /data/studentsData.js
// Esto asegura consistencia entre todos los componentes

export const studentService = {
  async getStudent(folio) {
    try {
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Usar datos centralizados
      const student = getStudentByFolio(folio);
      
      if (student) {
        return {
          success: true,
          data: student,
          message: 'Estudiante encontrado',
          isSimulated: true
        };
      } else {
        return {
          success: false,
          data: null,
          message: 'Estudiante no encontrado',
          isSimulated: true
        };
      }
    } catch (error) {
      return {
        success: false,
        data: null,
        message: 'Error al obtener estudiante',
        error: error.message,
        isSimulated: true
      };
    }
  },

  async updateStudent(folio, updatedData) {
    try {
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const student = getStudentByFolio(folio);
      if (!student) {
        return {
          success: false,
          data: null,
          message: 'Estudiante no encontrado',
          isSimulated: true
        };
      }

      const updatedStudent = { ...student, ...updatedData };
      return {
        success: true,
        data: updatedStudent,
        message: 'Estudiante actualizado correctamente',
        isSimulated: true
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: 'Error al actualizar estudiante',
        error: error.message,
        isSimulated: true
      };
    }
  },

  async changeStatus(folio, newStatus) {
    const student = getStudentByFolio(folio);
    if (!student) {
      return {
        success: false,
        data: null,
        message: 'Estudiante no encontrado',
        isSimulated: true
      };
    }

    student.estatus = newStatus;
    return {
      success: true,
      data: student,
      message: `Estatus cambiado a ${newStatus}`,
      isSimulated: true
    };
  },

  async deleteStudent(folio) {
    return {
      success: true,
      data: null,
      message: 'Eliminación simulada',
      isSimulated: true
    };
  },

  async checkBackendStatus() {
    return { 
      available: false, 
      message: '',
      isSimulated: true
    };
  }
};

export default studentService;