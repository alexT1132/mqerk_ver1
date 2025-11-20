import { Router } from 'express';
import { crearPreRegistro, obtenerPreRegistro, listarPreRegistros, finalizarProcesoAsesor, guardarPerfilAsesor, obtenerPerfilAsesor, subirDocumentosPerfil, actualizarPreRegistroBasico, actualizarGrupoAsesor, listarAsesoresAdmin, listarGruposDisponibles, asignarAlumnosGrupoAsesor, actualizarStatusAsesor, listarEstudiantesAsesor, actualizarGruposAsesor, guardarResultadosTest, obtenerResultadosTest, generarFormularioTest, calificarFormularioTest, listarHistorialResultadosTest, listarPagosAsesor, obtenerMiPerfil, actualizarMiPerfil, actualizarMiFoto, listarMisGrupos } from '../controllers/asesores.controller.js';
import { authREquired } from '../middlewares/validateToken.js';
import { uploadPerfilDocs } from '../middlewares/asesorPerfilMulter.js';

const router = Router();

router.post('/asesores/preregistro', crearPreRegistro);
router.get('/asesores/preregistro/:id', obtenerPreRegistro);
router.put('/asesores/preregistro/:id', actualizarPreRegistroBasico);
router.get('/asesores/preregistros', listarPreRegistros);
// Resultados de pruebas (guardar/obtener)
router.post('/asesores/tests/:preregistroId', guardarResultadosTest);
router.get('/asesores/tests/:preregistroId', obtenerResultadosTest);
router.get('/asesores/tests/:preregistroId/history', listarHistorialResultadosTest);
// Formularios dinámicos
router.get('/asesores/tests/:preregistroId/form/:tipo', generarFormularioTest);
router.post('/asesores/tests/:preregistroId/form/:tipo/grade', calificarFormularioTest);
router.post('/asesores/finalizar/:preregistroId', finalizarProcesoAsesor);
router.post('/asesores/perfil/:preregistroId', guardarPerfilAsesor);
router.get('/asesores/perfil/:preregistroId', obtenerPerfilAsesor);
router.put('/asesores/perfil/:preregistroId/grupo', actualizarGrupoAsesor);
router.put('/asesores/perfil/:preregistroId/grupos', actualizarGruposAsesor);
router.put('/asesores/preregistro/:id/status', actualizarStatusAsesor);
router.get('/asesores/admin/list', listarAsesoresAdmin);
router.get('/asesores/admin/grupos', listarGruposDisponibles);
router.post('/asesores/perfil/:preregistroId/asignar-alumnos', asignarAlumnosGrupoAsesor);
router.post('/asesores/perfil/:preregistroId/upload', uploadPerfilDocs.fields([
	{ name: 'doc_identificacion', maxCount:1 },
	{ name: 'doc_comprobante_domicilio', maxCount:1 },
	{ name: 'doc_titulo_cedula', maxCount:1 },
	{ name: 'doc_certificaciones', maxCount:1 },
	{ name: 'doc_carta_recomendacion', maxCount:1 },
	{ name: 'doc_curriculum', maxCount:1 },
	{ name: 'doc_fotografia', maxCount:1 },
	{ name: 'titulo_archivo', maxCount:1 },
	{ name: 'certificaciones_archivo', maxCount:1 }
]), subirDocumentosPerfil);

// Estudiantes del asesor autenticado
router.get('/asesores/mis-estudiantes', authREquired, listarEstudiantesAsesor);
// Grupos del asesor autenticado con cantidad de estudiantes
router.get('/asesores/mis-grupos', authREquired, listarMisGrupos);

// Pagos del asesor autenticado
router.get('/asesores/mis-pagos', authREquired, listarPagosAsesor);

// Configuraciones del asesor autenticado
router.get('/asesores/mi-perfil', authREquired, obtenerMiPerfil);
router.put('/asesores/mi-perfil', authREquired, actualizarMiPerfil);
router.put('/asesores/mi-perfil/foto', authREquired, uploadPerfilDocs.single('foto'), actualizarMiFoto);

export default router;
