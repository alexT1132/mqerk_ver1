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
  // conservar plan para vistas que dependen del tipo de plan (Start/Mensual/Premium)
  plan: est.plan || est.plan_type || '',
  // conservar created_at para utilidades que calculan la activación del plan
  created_at: est.created_at || null,
    nombres: est.nombre || '',
    apellidos: est.apellidos || '',
    fechaRegistro: est.created_at ? new Date(est.created_at).toISOString().split('T')[0] : '',
    // contacto
    correoElectronico: est.email || '',
  // Preferir campo abierto (comunidad2) y luego la selección fija
  municipioComunidad: est.comunidad2 || est.comunidad1 || est.municipio || est.localidad || '',
  // Exponer campos crudos para vistas avanzadas
  comunidad1: est.comunidad1 || '',
  comunidad2: est.comunidad2 || '',
    telefonoAlumno: est.telefono || '',
    nombreTutor: est.nombre_tutor || '',
    telefonoTutor: est.tel_tutor || '',
    // académico
  // Académico (con respaldos a claves alternativas)
  nivelAcademico: est.academico1 || est.nivelAcademico || est.estudios || '',
  bachillerato: est.academico2 || est.bachillerato || est.institucion || '',
    gradoSemestre: est.semestre || '',
  // Aspiraciones académicas: usar orientacion como licenciatura, y universidades1 como lista principal
  universidadesPostula: est.universidades1 || est.universidades2 || '',
  // Exponer listas crudas para poder combinarlas en el admin
  universidades1: est.universidades1 || '',
  universidades2: est.universidades2 || '',
  licenciaturaPostula: est.orientacion || est.universidades1 || '',
    // curso
  curso: est.curso || '',
  // Mantener turno y grupo como campos independientes
  turno: est.turno || '',
  // Exponer tanto 'group' como 'grupo' para compatibilidad en el Admin
  group: est.grupo || est.group || '',
  grupo: est.grupo || est.group || '',
  asesor: est.asesor || '',
    licenciaturaPostula: est.postulacion || est.carreraInteres || '',
  modalidad: est.modalidad || '',
  postulaciones: est.postulacion || '',
    // salud
    tipoAlergia: est.alergia || '',
    discapacidadTranstorno: est.discapacidad1 || '',
  // Detalles adicionales (alergia2 / discapacidad2) para perfil extendido
  alergia2: est.alergia2 || '',
  discapacidad2: est.discapacidad2 || '',
    orientacionVocacional: est.orientacion || '',
    // expectativas
    cambioQuiereLograr: est.comentario1 || '',
    comentarioEspera: est.comentario2 || '',
  // estatus: preferir columna explícita del backend (Activo|Suspendido), fallback por verificación
  estatus: est.estatus || (est.verificacion === 2 ? 'Activo' : 'Pendiente'),
    // foto
    foto: est.foto || null,
    fotoAbs,
  };
}

export const studentService = {
  async getStudent(folio) {
    try {
      // Normalizar folio: si viene en formato compuesto (EJ: MEEAU26-0001) extraer la parte numérica final
      let folioParam = folio;
      if (typeof folio === 'string' && folio.includes('-')) {
        const parts = folio.split('-');
        const last = parts[parts.length - 1];
        // Remover ceros a la izquierda para coincidir con INT almacenado (folio = finalFolioNumber)
        const numeric = parseInt(last, 10);
        if (!Number.isNaN(numeric)) {
          folioParam = numeric.toString();
        }
      }
      // Intento 1: usar folioParam (numérico si se pudo parsear)
      let dataResp = null;
      try {
        const { data } = await api.get(`/admin/estudiantes/folio/${encodeURIComponent(folioParam)}`);
        dataResp = data;
      } catch (e1) {
        // Intento 2: si el primero falló y el folio original es distinto del param, reintentar con original
        if (folioParam !== folio) {
          try {
            const { data } = await api.get(`/admin/estudiantes/folio/${encodeURIComponent(folio)}`);
            dataResp = data;
          } catch (e2) {
            throw e2;
          }
        } else {
          throw e1;
        }
      }
      const est = dataResp?.data || null;
      if (process.env.NODE_ENV !== 'production') {
        console.debug('[GET STUDENT] folioOriginal=', folio, 'folioParamUsado=', folioParam, 'encontrado?', !!est);
      }
      if (process.env.NODE_ENV !== 'production') {
        // Debug temporal para verificar campos académicos crudos
        console.debug('RAW estudiante (getStudent):', {
          academico1: est?.academico1,
          academico2: est?.academico2,
          semestre: est?.semestre,
          estudios: est?.estudios,
          institucion: est?.institucion,
          universidades1: est?.universidades1,
          universidades2: est?.universidades2,
          orientacion: est?.orientacion,
          postulacion: est?.postulacion,
          curso: est?.curso,
          grupo: est?.grupo,
        });
        const normalizedPreview = est ? normalizeStudent(est) : null;
        console.debug('NORMALIZED estudiante (preview):', {
          nivelAcademico: normalizedPreview?.nivelAcademico,
          gradoSemestre: normalizedPreview?.gradoSemestre,
          bachillerato: normalizedPreview?.bachillerato,
          licenciaturaPostula: normalizedPreview?.licenciaturaPostula,
          universidadesPostula: normalizedPreview?.universidadesPostula,
          curso: normalizedPreview?.curso,
          turno: normalizedPreview?.turno,
          modalidad: normalizedPreview?.modalidad,
        });
      }
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
  // Básicos
  if (updatedData?.nombres) payload.nombre = updatedData.nombres;
  if (updatedData?.apellidos) payload.apellidos = updatedData.apellidos;
      if (updatedData?.correoElectronico) payload.email = updatedData.correoElectronico;
      if (updatedData?.telefonoAlumno) payload.telefono = updatedData.telefonoAlumno;
      if (updatedData?.municipioComunidad) payload.comunidad1 = updatedData.municipioComunidad;
      if (updatedData?.nombreTutor) payload.nombre_tutor = updatedData.nombreTutor;
      if (updatedData?.telefonoTutor) payload.tel_tutor = updatedData.telefonoTutor;
      if (updatedData?.nivelAcademico) payload.academico1 = updatedData.nivelAcademico;
      if (updatedData?.gradoSemestre) payload.semestre = updatedData.gradoSemestre;
      if (updatedData?.bachillerato) payload.academico2 = updatedData.bachillerato;
      // Corrección de mapeo: licenciatura (aspiración) se guarda en orientacion; universidades postuladas en universidades1
      if (updatedData?.licenciaturaPostula) payload.orientacion = updatedData.licenciaturaPostula;
      if (updatedData?.universidadesPostula) payload.universidades1 = updatedData.universidadesPostula;
  if (updatedData?.postulaciones) payload.postulacion = updatedData.postulaciones;
      // Asegurar que siempre enviamos semestre/universidades2 si existen en updatedData aunque estén vacíos explícitamente
      if (Object.prototype.hasOwnProperty.call(updatedData, 'gradoSemestre') && !payload.semestre)
        payload.semestre = updatedData.gradoSemestre || '';
      if (Object.prototype.hasOwnProperty.call(updatedData, 'universidadesPostula') && !payload.universidades1)
        payload.universidades1 = updatedData.universidadesPostula || '';
      if (updatedData?.orientacionVocacional) payload.orientacion = updatedData.orientacionVocacional;
  if (updatedData?.postulaciones) payload.postulacion = updatedData.postulaciones; // campo independiente de modalidad
  if (updatedData?.curso) payload.curso = updatedData.curso;
  // Unificar turno/grupo: si viene turno y no se proporcionó grupo explícito, usarlo como grupo
  if (updatedData?.grupo) {
        payload.grupo = updatedData.grupo;
      }
  if (updatedData?.turno) payload.turno = updatedData.turno;
  // Modalidad ahora tiene columna propia
  if (updatedData?.modalidad) payload.modalidad = updatedData.modalidad;
  if (updatedData?.asesor) payload.asesor = updatedData.asesor;
  if (updatedData?.academia) payload.academia = updatedData.academia;
  // Salud
  if (updatedData?.tipoAlergia) payload.alergia = updatedData.tipoAlergia;
  if (Object.prototype.hasOwnProperty.call(updatedData, 'alergiaDetalle')) payload.alergia2 = updatedData.alergiaDetalle || '';
  if (updatedData?.discapacidadTranstorno) payload.discapacidad1 = updatedData.discapacidadTranstorno;
  if (Object.prototype.hasOwnProperty.call(updatedData, 'discapacidadDetalle')) payload.discapacidad2 = updatedData.discapacidadDetalle || '';
  // Expectativas / comentarios
  if (updatedData?.cambioQuiereLograr) payload.comentario1 = updatedData.cambioQuiereLograr;
  if (updatedData?.comentarioEspera) payload.comentario2 = updatedData.comentarioEspera;
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
    try {
      const res = await api.get(`/admin/estudiantes/folio/${encodeURIComponent(_folio)}`);
      const est = res?.data?.data;
      if (!est?.id) throw new Error('Estudiante no encontrado');
      const { data } = await api.put(`/estudiantes/${est.id}`, { estatus: _newStatus });
      return { success: true, data: normalizeStudent(data?.data || est) };
    } catch (e) {
      return { success: false, message: e?.response?.data?.message || e?.message || 'No se pudo cambiar el estatus' };
    }
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