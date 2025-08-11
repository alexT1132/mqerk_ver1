// Importar datos centralizados
import api from '../api/axios.js';

function normalizeStudent(est) {
  if (!est) return null;
  const apiBase = api?.defaults?.baseURL || '';
  const publicOrigin = apiBase.replace(/\/api\/?$/, '');
  const fotoAbs = est.foto ? `${publicOrigin}${est.foto}` : null;
  return {
    // básicos y compat
    id: est.id,
    folio: est.folio,
    nombres: est.nombre || '',
    apellidos: est.apellidos || '',
    fechaRegistro: est.created_at ? new Date(est.created_at).toISOString().split('T')[0] : '',
    // contacto
    correoElectronico: est.email || '',
    municipioComunidad: est.comunidad1 || '',
    telefonoAlumno: est.telefono || '',
    nombreTutor: est.nombre_tutor || '',
    telefonoTutor: est.tel_tutor || '',
    // académico
    nivelAcademico: est.academico1 || '',
    bachillerato: est.academico2 || '',
    gradoSemestre: est.semestre || '',
    universidadesPostula: est.universidades2 || '',
    licenciaturaPostula: est.universidades1 || '',
    // curso
    curso: est.curso || '',
    turno: est.grupo || '',
    asesor: est.orientacion || '',
    grupo: est.grupo || '',
    modalidad: est.postulacion || '',
    // salud
    tipoAlergia: est.alergia || '',
    discapacidadTranstorno: est.discapacidad1 || '',
    orientacionVocacional: est.orientacion || '',
    // expectativas
    cambioQuiereLograr: est.comentario1 || '',
    comentarioEspera: est.comentario2 || '',
    // estatus (no existe explícito; asumimos Activo si verificacion=2)
    estatus: (est.verificacion === 2 ? 'Activo' : 'Pendiente'),
    // foto
    foto: est.foto || null,
    fotoAbs,
  };
}

export const studentService = {
  async getStudent(folio) {
    try {
      const { data } = await api.get(`/admin/estudiantes/folio/${encodeURIComponent(folio)}`);
      const est = data?.data || null;
      return { success: !!est, data: normalizeStudent(est) };
    } catch (error) {
      return { success: false, data: null, message: 'No se pudo obtener el estudiante' };
    }
  },

  async updateStudent(folio, updatedData) {
    try {
      // resolve id
      const res = await api.get(`/admin/estudiantes/folio/${encodeURIComponent(folio)}`);
      const est = res?.data?.data;
      if (!est?.id) throw new Error('Estudiante no encontrado');

      const payload = {};
      if (updatedData?.correoElectronico) payload.email = updatedData.correoElectronico;
      if (updatedData?.telefonoAlumno) payload.telefono = updatedData.telefonoAlumno;
      if (updatedData?.municipioComunidad) payload.comunidad1 = updatedData.municipioComunidad;
      if (updatedData?.nombreTutor) payload.nombre_tutor = updatedData.nombreTutor;
      if (updatedData?.telefonoTutor) payload.tel_tutor = updatedData.telefonoTutor;
      if (updatedData?.nivelAcademico) payload.academico1 = updatedData.nivelAcademico;
      if (updatedData?.gradoSemestre) payload.semestre = updatedData.gradoSemestre;
      if (updatedData?.bachillerato) payload.academico2 = updatedData.bachillerato;
      if (updatedData?.licenciaturaPostula) payload.universidades1 = updatedData.licenciaturaPostula;
      if (updatedData?.universidadesPostula) payload.universidades2 = updatedData.universidadesPostula;
      if (updatedData?.orientacionVocacional) payload.orientacion = updatedData.orientacionVocacional;
      if (updatedData?.cambioQuiereLograr) payload.comentario1 = updatedData.cambioQuiereLograr;
      if (updatedData?.comentarioEspera) payload.comentario2 = updatedData.comentarioEspera;
      if (updatedData?.fecha_nacimiento) payload.fecha_nacimiento = updatedData.fecha_nacimiento;

      const { data } = await api.put(`/estudiantes/${est.id}`, payload);
      return { success: true, data: normalizeStudent(data?.data || est) };
    } catch (error) {
      return { success: false, data: null, message: 'No se pudo actualizar el estudiante' };
    }
  },

  async updateStatus(_folio, _newStatus) {
    // No endpoint específico; dejamos como éxito ficticio por ahora
    return { success: true };
  },

  async deleteStudent(folio) {
    try {
      const res = await api.get(`/admin/estudiantes/folio/${encodeURIComponent(folio)}`);
      const est = res?.data?.data;
      if (!est?.id) throw new Error('Estudiante no encontrado');
      await api.post(`/estudiantes/${est.id}/soft-delete`, { reason: 'Eliminado por admin' });
      return { success: true };
    } catch (e) {
      return { success: false, message: 'No se pudo eliminar (soft delete)' };
    }
  },

  async checkBackendStatus() {
    try {
      await api.get('/admin/profile');
      return { available: true, message: '' };
    } catch (e) {
      return { available: false, message: '' };
    }
  }
};

export default studentService;