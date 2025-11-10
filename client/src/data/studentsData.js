// ============================================================================
// DATOS MOCK CENTRALIZADOS - ELIMINAR EN PRODUCCIÓN
// ============================================================================
// Este archivo contiene todos los datos mock de estudiantes para que sean
// consistentes entre los componentes ListaAlumnos_Admin_comp y StudentProfilePage
// ============================================================================

// Función para generar folio con formato del sistema (igual que ComprobanteRecibo)
const generateStudentFolio = (curso, index) => {
  const year = new Date().getFullYear();
  const courseCode = curso.includes('EEAU') ? 'EEAU' : 
                    curso.includes('EEAP') ? 'EEAP' :
                    curso.includes('DIGI-START') ? 'DIGI' :
                    curso.includes('MINDBRIDGE') ? 'MIND' :
                    curso.includes('SPEAKUP') ? 'SPEAK' :
                    curso.includes('PCE') ? 'PCE' : 'GEN';
  
  const paddedNumber = index.toString().padStart(4, '0');
  return `MQ${courseCode}-${year}-${paddedNumber}`;
};

export const studentsDataMock = {
  // EEAU - V1
  'MQEEAU-2025-0001': {
    folio: "MQEEAU-2025-0001",
    nombres: "María José",
    apellidos: "González López",
    correoElectronico: "maria.gonzalez@email.com",
    municipioComunidad: "Guadalajara",
    nombreTutor: "Carmen López García",
    telefonoTutor: "33-1234-5678",
    telefonoAlumno: "33-8765-4321",
    curso: "EEAU",
    turno: "V1",
    estatus: "Activo",
    fechaRegistro: "2024-07-15",
    // Datos adicionales para el perfil
    nivelAcademico: "Preparatoria",
    gradoSemestre: "5",
    bachillerato: "CBTIS No. 107",
    licenciaturaPostula: "Ingeniería en Sistemas",
    universidadesPostula: "UDG, ITESO",
    asesor: "Prof. García López",
    grupo: "V1",
    modalidad: "Presencial",
    tipoAlergia: "Ninguna",
    discapacidadTranstorno: "Ninguna",
    orientacionVocacional: "Sí",
    cambioQuiereLograr: "Mejorar mis habilidades para el examen de admisión",
    comentarioEspera: "Espero obtener una buena preparación para ingresar a la universidad"
  },
  'MQEEAU-2025-0002': {
    folio: "MQEEAU-2025-0002",
    nombres: "Carlos Eduardo",
    apellidos: "Hernández Ruiz",
    correoElectronico: "carlos.hernandez@email.com",
    municipioComunidad: "Zapopan",
    nombreTutor: "Roberto Hernández Silva",
    telefonoTutor: "33-2345-6789",
    telefonoAlumno: "33-9876-5432",
    curso: "EEAU",
    turno: "V1",
    estatus: "Activo",
    fechaRegistro: "2024-07-20",
    // Datos adicionales para el perfil
    nivelAcademico: "Preparatoria",
    gradoSemestre: "6",
    bachillerato: "CBTis No. 45",
    licenciaturaPostula: "Ingeniería Industrial",
    universidadesPostula: "UDG, ITESO, TEC",
    asesor: "Prof. García López",
    grupo: "V1",
    modalidad: "Presencial",
    tipoAlergia: "Polen",
    discapacidadTranstorno: "Ninguna",
    orientacionVocacional: "Sí",
    cambioQuiereLograr: "Obtener el puntaje necesario para ingeniería",
    comentarioEspera: "Necesito apoyo especial en matemáticas"
  },
  'MQEEAU-2025-0003': {
    folio: "MQEEAU-2025-0003",
    nombres: "Ana Patricia",
    apellidos: "Morales Jiménez",
    correoElectronico: "ana.morales@email.com",
    municipioComunidad: "Tlaquepaque",
    nombreTutor: "Patricia Jiménez Vega",
    telefonoTutor: "33-3456-7890",
    telefonoAlumno: "33-6543-2109",
    curso: "EEAU",
    turno: "V1",
    estatus: "Activo",
    fechaRegistro: "2024-07-25",
    // Datos adicionales para el perfil
    nivelAcademico: "Preparatoria",
    gradoSemestre: "5",
    bachillerato: "CECYT No. 9",
    licenciaturaPostula: "Psicología",
    universidadesPostula: "UDG, UNIVA",
    asesor: "Prof. García López",
    grupo: "V1",
    modalidad: "Presencial",
    tipoAlergia: "Ninguna",
    discapacidadTranstorno: "Ninguna",
    orientacionVocacional: "Sí",
    cambioQuiereLograr: "Fortalecer mis conocimientos en humanidades",
    comentarioEspera: "Quiero estar bien preparada para el examen"
  },
  // EEAU - V2
  'MQEEAU-2025-0004': {
    folio: "MQEEAU-2025-0004",
    nombres: "Roberto",
    apellidos: "Martínez Silva",
    correoElectronico: "roberto.martinez@email.com",
    municipioComunidad: "Tonalá",
    nombreTutor: "Silvia Martínez López",
    telefonoTutor: "33-4567-8901",
    telefonoAlumno: "33-2109-8765",
    curso: "EEAU",
    turno: "V2",
    estatus: "Activo",
    fechaRegistro: "2024-08-01",
    // Datos adicionales para el perfil
    nivelAcademico: "Preparatoria",
    gradoSemestre: "6",
    bachillerato: "Preparatoria Federal",
    licenciaturaPostula: "Ingeniería Civil",
    universidadesPostula: "UDG, ITESO",
    asesor: "Prof. Martínez Silva",
    grupo: "V2",
    modalidad: "Presencial",
    tipoAlergia: "Ninguna",
    discapacidadTranstorno: "Ninguna",
    orientacionVocacional: "Sí",
    cambioQuiereLograr: "Prepararme para carreras de ingeniería",
    comentarioEspera: "Busco una preparación integral"
  },
  'MQEEAU-2025-0005': {
    folio: "MQEEAU-2025-0005",
    nombres: "Lucía",
    apellidos: "Fernández Castro",
    correoElectronico: "lucia.fernandez@email.com",
    municipioComunidad: "Guadalajara",
    nombreTutor: "José Fernández Ruiz",
    telefonoTutor: "33-5678-9012",
    telefonoAlumno: "33-3210-9876",
    curso: "EEAU",
    turno: "V2",
    estatus: "Activo",
    fechaRegistro: "2024-08-05",
    // Datos adicionales para el perfil
    nivelAcademico: "Preparatoria",
    gradoSemestre: "5",
    bachillerato: "COBAEJ",
    licenciaturaPostula: "Medicina",
    universidadesPostula: "UDG, UNAM",
    asesor: "Prof. Martínez Silva",
    grupo: "V2",
    modalidad: "Presencial",
    tipoAlergia: "Ninguna",
    discapacidadTranstorno: "Ninguna",
    orientacionVocacional: "Sí",
    cambioQuiereLograr: "Obtener el puntaje necesario para medicina",
    comentarioEspera: "Necesito apoyo especial en ciencias naturales"
  },
  // EEAU - M1
  'MQEEAU-2025-0006': {
    folio: "MQEEAU-2025-0006",
    nombres: "Diego",
    apellidos: "Ramírez Vega",
    correoElectronico: "diego.ramirez@email.com",
    municipioComunidad: "Zapopan",
    nombreTutor: "Carmen Ramírez Torres",
    telefonoTutor: "33-6789-0123",
    telefonoAlumno: "33-4321-0987",
    curso: "EEAU",
    turno: "M1",
    estatus: "Activo",
    fechaRegistro: "2024-08-10",
    // Datos adicionales para el perfil
    nivelAcademico: "Preparatoria",
    gradoSemestre: "6",
    bachillerato: "CECYT No. 2",
    licenciaturaPostula: "Ingeniería en Computación",
    universidadesPostula: "UDG, ITESO, TEC",
    asesor: "Prof. Pérez García",
    grupo: "M1",
    modalidad: "Presencial",
    tipoAlergia: "Ninguna",
    discapacidadTranstorno: "Ninguna",
    orientacionVocacional: "Sí",
    cambioQuiereLograr: "Perfeccionar mis habilidades lógico-matemáticas",
    comentarioEspera: "Busco una preparación sólida en áreas técnicas"
  },
  // EEAP - V1
  'MQSPEAK-2025-0001': {
    folio: "MQSPEAK-2025-0001",
    nombres: "Sofía",
    apellidos: "Torres Mendoza",
    correoElectronico: "sofia.torres@email.com",
    municipioComunidad: "Tlajomulco",
    nombreTutor: "Miguel Torres García",
    telefonoTutor: "33-7890-1234",
    telefonoAlumno: "33-5432-1098",
    curso: "EEAP",
    turno: "V1",
    estatus: "Activo",
    fechaRegistro: "2024-08-15",
    // Datos adicionales para el perfil
    nivelAcademico: "Preparatoria",
    gradoSemestre: "5",
    bachillerato: "CBTIS No. 226",
    licenciaturaPostula: "Arquitectura",
    universidadesPostula: "UDG, ITESO",
    asesor: "Prof. Fernández Ruiz",
    grupo: "V1",
    modalidad: "Presencial",
    tipoAlergia: "Ninguna",
    discapacidadTranstorno: "Ninguna",
    orientacionVocacional: "Sí",
    cambioQuiereLograr: "Desarrollar habilidades espaciales y matemáticas",
    comentarioEspera: "Necesito preparación en geometría y dibujo técnico"
  },
  'MQSPEAK-2025-0002': {
    folio: "MQSPEAK-2025-0002",
    nombres: "Alejandro",
    apellidos: "Jiménez Flores",
    correoElectronico: "alejandro.jimenez@email.com",
    municipioComunidad: "Guadalajara",
    nombreTutor: "Rosa Jiménez Morales",
    telefonoTutor: "33-8901-2345",
    telefonoAlumno: "33-6543-2109",
    curso: "EEAP",
    turno: "V1",
    estatus: "Inactivo",
    fechaRegistro: "2024-08-20",
    // Datos adicionales para el perfil
    nivelAcademico: "Preparatoria",
    gradoSemestre: "6",
    bachillerato: "COBAEJ",
    licenciaturaPostula: "Derecho",
    universidadesPostula: "UDG, UNIVA",
    asesor: "Prof. Fernández Ruiz",
    grupo: "V1",
    modalidad: "Presencial",
    tipoAlergia: "Ninguna",
    discapacidadTranstorno: "Ninguna",
    orientacionVocacional: "Sí",
    cambioQuiereLograr: "Mejorar comprensión lectora y redacción",
    comentarioEspera: "Busco apoyo en materias humanísticas"
  },
  // EEAP - S1
  'MQSPEAK-2025-0003': {
    folio: "MQSPEAK-2025-0003",
    nombres: "Valeria",
    apellidos: "Castro Herrera",
    correoElectronico: "valeria.castro@email.com",
    municipioComunidad: "El Salto",
    nombreTutor: "Fernando Castro López",
    telefonoTutor: "33-9012-3456",
    telefonoAlumno: "33-7654-3210",
    curso: "EEAP",
    turno: "S1",
    estatus: "Activo",
    fechaRegistro: "2024-08-25",
    // Datos adicionales para el perfil
    nivelAcademico: "Preparatoria",
    gradoSemestre: "5",
    bachillerato: "CETIS No. 109",
    licenciaturaPostula: "Comunicación",
    universidadesPostula: "UDG, ITESO",
    asesor: "Prof. López Herrera",
    grupo: "S1",
    modalidad: "Presencial",
    tipoAlergia: "Ninguna",
    discapacidadTranstorno: "Ninguna",
    orientacionVocacional: "Sí",
    cambioQuiereLograr: "Fortalecer habilidades de comunicación",
    comentarioEspera: "Quiero mejorar en redacción y expresión oral"
  },
  // DIGI-START - V1
  'MQSPEAK-2025-0004': {
    folio: "MQSPEAK-2025-0004",
    nombres: "Mateo",
    apellidos: "Sánchez Rivera",
    correoElectronico: "mateo.sanchez@email.com",
    municipioComunidad: "Zapopan",
    nombreTutor: "Laura Sánchez Díaz",
    telefonoTutor: "33-0123-4567",
    telefonoAlumno: "33-8765-4321",
    curso: "DIGI-START",
    turno: "V1",
    estatus: "Activo",
    fechaRegistro: "2024-09-01",
    // Datos adicionales para el perfil
    nivelAcademico: "Preparatoria",
    gradoSemestre: "6",
    bachillerato: "CBTIS No. 226",
    licenciaturaPostula: "Ingeniería en Sistemas",
    universidadesPostula: "UDG, ITESO, TEC",
    asesor: "Prof. Rodríguez Tech",
    grupo: "V1",
    modalidad: "Presencial",
    tipoAlergia: "Ninguna",
    discapacidadTranstorno: "Ninguna",
    orientacionVocacional: "Sí",
    cambioQuiereLograr: "Desarrollar habilidades tecnológicas",
    comentarioEspera: "Busco una base sólida en programación y lógica"
  },
  // DIGI-START - M1
  'MQSPEAK-2025-0005': {
    folio: "MQSPEAK-2025-0005",
    nombres: "Isabella",
    apellidos: "Moreno Gutiérrez",
    correoElectronico: "isabella.moreno@email.com",
    municipioComunidad: "Tlaquepaque",
    nombreTutor: "Antonio Moreno Silva",
    telefonoTutor: "33-1234-5678",
    telefonoAlumno: "33-9876-5432",
    curso: "DIGI-START",
    turno: "M1",
    estatus: "Activo",
    fechaRegistro: "2024-09-05",
    // Datos adicionales para el perfil
    nivelAcademico: "Preparatoria",
    gradoSemestre: "5",
    bachillerato: "COBAEJ",
    licenciaturaPostula: "Ingeniería en Computación",
    universidadesPostula: "UDG, ITESO",
    asesor: "Prof. González Code",
    grupo: "M1",
    modalidad: "Presencial",
    tipoAlergia: "Ninguna",
    discapacidadTranstorno: "Ninguna",
    orientacionVocacional: "Sí",
    cambioQuiereLograr: "Aprender fundamentos de programación",
    comentarioEspera: "Quiero una base sólida para estudiar informática"
  },
  // MINDBRIDGE - V1
  'MQEEAP-2025-0001': {
    folio: "MQEEAP-2025-0001",
    nombres: "Sebastián",
    apellidos: "Vargas Peña",
    correoElectronico: "sebastian.vargas@email.com",
    municipioComunidad: "Guadalajara",
    nombreTutor: "Elena Vargas Ruiz",
    telefonoTutor: "33-2345-6789",
    telefonoAlumno: "33-0987-6543",
    curso: "MINDBRIDGE",
    turno: "V1",
    estatus: "Suspendido",
    fechaRegistro: "2024-09-10",
    // Datos adicionales para el perfil
    nivelAcademico: "Preparatoria",
    gradoSemestre: "6",
    bachillerato: "CECYT No. 9",
    licenciaturaPostula: "Psicología",
    universidadesPostula: "UDG, UNIVA",
    asesor: "Prof. Morales Mind",
    grupo: "V1",
    modalidad: "Presencial",
    tipoAlergia: "Ninguna",
    discapacidadTranstorno: "TDAH",
    orientacionVocacional: "Sí",
    cambioQuiereLograr: "Mejorar técnicas de estudio y concentración",
    comentarioEspera: "Necesito apoyo para desarrollar mejores hábitos de estudio"
  },
  // SPEAKUP - V1
  'MQEEAP-2025-0002': {
    folio: "MQEEAP-2025-0002",
    nombres: "Camila",
    apellidos: "Ortega Domínguez",
    correoElectronico: "camila.ortega@email.com",
    municipioComunidad: "Tonalá",
    nombreTutor: "Ricardo Ortega Vega",
    telefonoTutor: "33-3456-7890",
    telefonoAlumno: "33-1098-7654",
    curso: "SPEAKUP",
    turno: "V1",
    estatus: "Activo",
    fechaRegistro: "2024-09-15",
    // Datos adicionales para el perfil
    nivelAcademico: "Preparatoria",
    gradoSemestre: "5",
    bachillerato: "CBTIS No. 107",
    licenciaturaPostula: "Relaciones Internacionales",
    universidadesPostula: "UDG, ITESO",
    asesor: "Prof. Jiménez Speak",
    grupo: "V1",
    modalidad: "Presencial",
    tipoAlergia: "Ninguna",
    discapacidadTranstorno: "Ninguna",
    orientacionVocacional: "Sí",
    cambioQuiereLograr: "Mejorar mi inglés conversacional",
    comentarioEspera: "Busco fluidez para estudios internacionales"
  },
  // SPEAKUP - V2
  'MQEEAP-2025-0003': {
    folio: "MQEEAP-2025-0003",
    nombres: "Emilio",
    apellidos: "Aguilar Ramos",
    correoElectronico: "emilio.aguilar@email.com",
    municipioComunidad: "Zapopan",
    nombreTutor: "Beatriz Aguilar Torres",
    telefonoTutor: "33-4567-8901",
    telefonoAlumno: "33-2109-8765",
    curso: "SPEAKUP",
    turno: "V2",
    estatus: "Activo",
    fechaRegistro: "2024-09-20",
    // Datos adicionales para el perfil
    nivelAcademico: "Preparatoria",
    gradoSemestre: "6",
    bachillerato: "CBTis No. 45",
    licenciaturaPostula: "Ingeniería Industrial",
    universidadesPostula: "UDG, TEC",
    asesor: "Prof. Castro Talk",
    grupo: "V2",
    modalidad: "Presencial",
    tipoAlergia: "Ninguna",
    discapacidadTranstorno: "Ninguna",
    orientacionVocacional: "Sí",
    cambioQuiereLograr: "Certificarme en inglés técnico",
    comentarioEspera: "Necesito inglés para mi carrera profesional"
  },
  // PCE - M1
  'MQEEAP-2025-0004': {
    folio: "MQEEAP-2025-0004",
    nombres: "Natalia",
    apellidos: "Herrera Campos",
    correoElectronico: "natalia.herrera@email.com",
    municipioComunidad: "Guadalajara",
    nombreTutor: "Javier Herrera Morales",
    telefonoTutor: "33-5678-9012",
    telefonoAlumno: "33-3210-9876",
    curso: "PCE",
    turno: "M1",
    estatus: "Activo",
    fechaRegistro: "2024-09-25",
    // Datos adicionales para el perfil
    nivelAcademico: "Preparatoria",
    gradoSemestre: "6",
    bachillerato: "COBAEJ",
    licenciaturaPostula: "Medicina",
    universidadesPostula: "UDG, UNAM",
    asesor: "Prof. Vargas Prep",
    grupo: "M1",
    modalidad: "Presencial",
    tipoAlergia: "Ninguna",
    discapacidadTranstorno: "Ninguna",
    orientacionVocacional: "Sí",
    cambioQuiereLograr: "Prepararme intensivamente para el examen",
    comentarioEspera: "Busco una preparación completa y rigurosa"
  },
  // PCE - S1
  'MQEEAP-2025-0005': {
    folio: "MQEEAP-2025-0005",
    nombres: "Gabriel",
    apellidos: "Medina Castillo",
    correoElectronico: "gabriel.medina@email.com",
    municipioComunidad: "Tlajomulco",
    nombreTutor: "Patricia Medina López",
    telefonoTutor: "33-6789-0123",
    telefonoAlumno: "33-4321-0987",
    curso: "PCE",
    turno: "S1",
    estatus: "Activo",
    fechaRegistro: "2024-09-30",
    // Datos adicionales para el perfil
    nivelAcademico: "Preparatoria",
    gradoSemestre: "5",
    bachillerato: "CETIS No. 109",
    licenciaturaPostula: "Ingeniería Civil",
    universidadesPostula: "UDG, ITESO",
    asesor: "Prof. Medina Exam",
    grupo: "S1",
    modalidad: "Presencial",
    tipoAlergia: "Ninguna",
    discapacidadTranstorno: "Ninguna",
    orientacionVocacional: "Sí",
    cambioQuiereLograr: "Reforzar matemáticas y física",
    comentarioEspera: "Necesito apoyo intensivo en ciencias exactas"
  }
};

// Función para obtener estudiantes por curso y turno
export const getStudentsByCourseAndTurn = (course, turn) => {
  return Object.values(studentsDataMock).filter(student => 
    student.curso === course && student.turno === turn
  );
};

// Función para obtener un estudiante por folio
export const getStudentByFolio = (folio) => {
  return studentsDataMock[folio] || null;
};

// Función para obtener todos los estudiantes
export const getAllStudents = () => {
  return Object.values(studentsDataMock);
};

// Función para agrupar estudiantes por curso y turno
export const getStudentsGroupedByCourseAndTurn = () => {
  const grouped = {};
  Object.values(studentsDataMock).forEach(student => {
    const key = `${student.curso}-${student.turno}`;
    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push(student);
  });
  return grouped;
};



