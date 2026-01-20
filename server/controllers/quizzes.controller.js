import * as Quizzes from '../models/quizzes_intentos.model.js';
import * as Estudiantes from '../models/estudiantes.model.js';
import * as Actividades from '../models/actividades.model.js';
import * as QQ from '../models/quizzes_questions.model.js';
import * as Access from '../models/student_area_access.model.js';
import * as StudentNotifs from '../models/student_notifications.model.js';
import { broadcastStudent } from '../ws.js';
import db from '../db.js';

export const listQuizzes = async (req, res) => {
  try {
    const visible = req.query.visible !== 'false';
    const id_area = req.query.id_area ? Number(req.query.id_area) : undefined;
    const materia = req.query.materia ? String(req.query.materia) : undefined;
    let rows = await Quizzes.listQuizzes({ visible, id_area, materia });
    // Si el solicitante es un estudiante, filtrar por áreas permitidas
    const user = req.user || null;
    if (user && user.role === 'estudiante' && user.id_estudiante) {
      try {
        const allowed = await Access.getAllowedAreaIds(user.id_estudiante);
        if (Array.isArray(allowed) && allowed.length) {
          rows = rows.filter(r => !r.id_area || allowed.includes(Number(r.id_area)));
        } else {
          // Si no tiene permisos, mostrar sólo los quizzes sin área asociada
          rows = rows.filter(r => !r.id_area);
        }

        // Filtrar por grupos: solo mostrar quizzes asignados al grupo del estudiante
        const [studentData] = await db.query('SELECT grupo FROM estudiantes WHERE id = ? LIMIT 1', [user.id_estudiante]);
        const studentGrupo = studentData[0]?.grupo || null;

        if (studentGrupo) {
          rows = rows.filter(r => {
            // Si el quiz no tiene grupos asignados (NULL, undefined, o vacío), está disponible para todos
            if (!r.grupos || r.grupos === null || r.grupos === '') return true;

            // Parsear grupos (puede ser JSON string o array)
            let grupos = [];
            try {
              grupos = typeof r.grupos === 'string' ? JSON.parse(r.grupos) : r.grupos;
              // Si no es array después de parsear, mostrar por seguridad
              if (!Array.isArray(grupos)) return true;
            } catch (parseError) {
              // Error al parsear JSON, mostrar por seguridad (probablemente NULL o formato inválido)
              console.warn('[listQuizzes] Error parsing grupos for quiz', r.id, ':', parseError.message);
              return true;
            }

            // Si grupos está vacío, disponible para todos
            if (grupos.length === 0) return true;

            // Verificar si el grupo del estudiante está en la lista
            return grupos.includes(studentGrupo);
          });
        }
      } catch (_e) { console.error('listQuizzes filter error:', _e); }
    }
    res.json({ data: rows });
  }
  catch (e) { console.error('listQuizzes', e); res.status(500).json({ message: 'Error interno' }); }
};

export const getQuiz = async (req, res) => {
  try {
    const quiz = await Quizzes.getQuizById(req.params.id);
    if (!quiz) return res.status(404).json({ message: 'No encontrado' });
    const user = req.user || null;
    if (user && user.role === 'estudiante' && user.id_estudiante && quiz.id_area) {
      // Política más flexible: permitir leer meta del quiz aunque no tenga permiso del área,
      // de modo que la UI pueda mostrar info y permitir iniciar en modo práctica.
      // Mantener filtros en listQuizzes para no listar items no permitidos, pero si llega directo por link, mostrar meta.
      // const allowed = await Access.hasPermission(user.id_estudiante, Number(quiz.id_area));
      // if (!allowed) return res.status(403).json({ message:'Sin permiso para este módulo/área' });
    }
    res.json({ data: quiz });
  }
  catch (e) { console.error('getQuiz', { id: req.params?.id, err: e }); res.status(500).json({ message: 'Error interno' }); }
};

export const crearIntentoQuiz = async (req, res) => {
  try {
    const { id } = req.params; const { id_estudiante, puntaje, tiempo_segundos, total_preguntas, correctas } = req.body;
    if (!id_estudiante) return res.status(400).json({ message: 'id_estudiante requerido' });
    const quiz = await Quizzes.getQuizById(id);
    if (!quiz) return res.status(404).json({ message: 'Quiz no encontrado' });
    if (Object.prototype.hasOwnProperty.call(quiz, 'activo') && Number(quiz.activo) === 0) {
      return res.status(404).json({ message: 'Quiz no encontrado' });
    }
    // Seguridad: si el quiz pertenece a un área, verificar permiso del estudiante
    if (quiz.id_area) {
      try {
        const allowed = await Access.hasPermission(id_estudiante, Number(quiz.id_area));
        if (!allowed) return res.status(403).json({ message: 'Sin permiso para este módulo/área' });
      } catch (_e) { return res.status(403).json({ message: 'Sin permiso para este módulo/área' }); }
    }
    const est = await Estudiantes.getEstudianteById(id_estudiante); if (!est) return res.status(404).json({ message: 'Estudiante no encontrado' });
    // Regla actual: el alumno puede seguir intentando (práctica) después del primer intento oficial.
    // Ya no bloqueamos por max_intentos; el frontend mostrará "Práctica" para intentos > 1.
    const intento = await Quizzes.crearIntentoQuiz({ id_quiz: id, id_estudiante, puntaje: puntaje ?? 0, tiempo_segundos, total_preguntas, correctas });
    res.status(201).json({ data: intento });
  } catch (e) { console.error('crearIntentoQuiz', { id_quiz: req.params?.id, body: req.body, err: e }); res.status(500).json({ message: 'Error interno' }); }
};

export const listIntentosQuizEstudiante = async (req, res) => {
  try { const rows = await Quizzes.listIntentosQuizEstudiante(req.params.id, req.params.id_estudiante); res.json({ data: rows }); }
  catch (e) { console.error('listIntentosQuizEstudiante', { id_quiz: req.params?.id, id_estudiante: req.params?.id_estudiante, err: e }); res.status(500).json({ message: 'Error interno' }); }
};

export const resumenQuizzesEstudiante = async (req, res) => {
  try {
    const id_estudiante = Number(req.params.id_estudiante);
    if (!id_estudiante || Number.isNaN(id_estudiante)) {
      return res.status(400).json({ message: 'id_estudiante inválido' });
    }

    const user = req.user || null;
    // Si es estudiante, solo permitir acceder a su propio resumen
    if (user?.role === 'estudiante' && user.id_estudiante && Number(user.id_estudiante) !== id_estudiante) {
      return res.status(403).json({ message: 'Sin permiso' });
    }

    let rows = await Quizzes.resumenQuizzesEstudiante(id_estudiante);

    // Enforce seguridad adicional: filtrar por áreas permitidas + grupos (mismo criterio que listQuizzes)
    try {
      const allowed = await Access.getAllowedAreaIds(id_estudiante);
      if (Array.isArray(allowed) && allowed.length) {
        rows = rows.filter(r => !r.id_area || allowed.includes(Number(r.id_area)));
      } else {
        rows = rows.filter(r => !r.id_area);
      }

      const [studentData] = await db.query('SELECT grupo FROM estudiantes WHERE id = ? LIMIT 1', [id_estudiante]);
      const studentGrupo = studentData[0]?.grupo || null;
      if (studentGrupo) {
        rows = rows.filter(r => {
          if (!r.grupos || r.grupos === null || r.grupos === '') return true;
          let grupos = [];
          try {
            grupos = typeof r.grupos === 'string' ? JSON.parse(r.grupos) : r.grupos;
            if (!Array.isArray(grupos)) return true;
          } catch (parseError) {
            console.warn('[resumenQuizzesEstudiante] Error parsing grupos for quiz', r.id, ':', parseError.message);
            return true;
          }
          if (grupos.length === 0) return true;
          return grupos.includes(studentGrupo);
        });
      }
    } catch (_e) {
      // si falla el filtro, devolvemos rows ya filtrados por publicado/ventana desde el modelo
    }

    res.json({ data: rows });
  } catch (e) {
    console.error('resumenQuizzesEstudiante', { id_estudiante: req.params?.id_estudiante, err: e });
    res.status(500).json({ message: 'Error interno' });
  }
};

// Listar, para un quiz, los estudiantes que ya tienen intentos y su puntaje oficial (primer intento)
export const estudiantesEstadoQuiz = async (req, res) => {
  try {
    const { id } = req.params; // id quiz
    const quiz = await Quizzes.getQuizById(id);
    if (!quiz) return res.status(404).json({ message: 'Quiz no encontrado' });
    const rows = await Quizzes.listEstudiantesEstadoQuiz(id);
    res.json({ data: rows });
  } catch (e) {
    console.error('estudiantesEstadoQuiz', { id: req.params?.id, err: e });
    res.status(500).json({ message: 'Error interno' });
  }
};

// Crear quiz en tabla quizzes dedicada + preguntas/opciones
export const createQuiz = async (req, res) => {
  const conn = await db.getConnection();
  let actId = null;

  try {
    await conn.beginTransaction();

    const { titulo, materia, descripcion, preguntas, fecha_limite, max_intentos, publico, shuffle_questions, time_limit_min, passing_score, id_area } = req.body || {};
    
    // Validar que el título esté presente y no esté vacío
    if (!titulo || typeof titulo !== 'string' || titulo.trim().length === 0) {
      await conn.rollback();
      conn.release();
      return res.status(400).json({ message: 'El título del quiz es requerido y no puede estar vacío' });
    }
    
    // Validar que el id_area esté presente (es necesario para que el quiz aparezca en la tabla del alumno)
    if (id_area === null || id_area === undefined) {
      await conn.rollback();
      conn.release();
      return res.status(400).json({ message: 'El área (id_area) del quiz es requerida. Asegúrate de crear el quiz desde una área válida.' });
    }

    // Validar que se hayan enviado preguntas
    if (!Array.isArray(preguntas) || preguntas.length === 0) {
      await conn.rollback();
      conn.release();
      return res.status(400).json({ message: 'Un quiz debe tener al menos una pregunta. No se puede crear un quiz sin preguntas.' });
    }

    // Parsear grupos si llegaron como string
    if (req.body.grupos) {
      try { if (typeof req.body.grupos === 'string') req.body.grupos = JSON.parse(req.body.grupos); } catch { req.body.grupos = null; }
      if (req.body.grupos && !Array.isArray(req.body.grupos)) req.body.grupos = null;
    }

    // Crear quiz en la tabla quizzes dedicada (las preguntas van en quizzes_preguntas)
    const gruposJson = req.body.grupos ? JSON.stringify(req.body.grupos) : null;
    const sqlQuiz = `INSERT INTO quizzes
      (titulo, descripcion, id_area, materia, puntos_max, peso_calificacion, fecha_limite, grupos, max_intentos, requiere_revision, activo, publicado, creado_por, time_limit_min, passing_score, shuffle_questions)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
    const valuesQuiz = [
      titulo,
      descripcion || null,
      id_area || null,
      materia || null,
      100, // puntos_max
      0.00, // peso_calificacion
      fecha_limite || null,
      gruposJson,
      max_intentos || null,
      0, // requiere_revision
      1, // activo
      0, // publicado - IMPORTANTE: Siempre crear como borrador hasta que se guarden las preguntas
      req.user?.id || null,
      time_limit_min || null,
      passing_score || null,
      shuffle_questions ? 1 : 0
    ];
    const [resQuiz] = await conn.query(sqlQuiz, valuesQuiz);
    actId = resQuiz.insertId;

    if (Array.isArray(preguntas) && preguntas.length) {
      try {
        let orden = 1;
        let preguntasGuardadas = 0;
        for (const q of preguntas) {
          // Validar y mapear el tipo de pregunta
          let tipoDB = 'opcion_multiple'; // default
          if (q.type === 'tf' || q.type === 'verdadero_falso') {
            tipoDB = 'verdadero_falso';
          } else if (q.type === 'short' || q.type === 'respuesta_corta') {
            // Intentar usar respuesta_corta, pero si falla por enum, usar opcion_multiple como fallback
            tipoDB = 'respuesta_corta';
          } else if (q.type === 'multiple' || q.type === 'opcion_multiple' || !q.type || q.type === '') {
            tipoDB = 'opcion_multiple';
          }

          let row;
          try {
            // Usar la conexión de transacción directamente
            const sqlPregunta = 'INSERT INTO quizzes_preguntas (id_quiz, orden, enunciado, tipo, puntos, activa) VALUES (?,?,?,?,?,?)';
            const [resPregunta] = await conn.query(sqlPregunta, [
              actId,
              q.orden ?? orden,
              q.text || q.enunciado || '',
              tipoDB,
              q.points || 1,
              1 // activa
            ]);
            const [preguntaRow] = await conn.query('SELECT * FROM quizzes_preguntas WHERE id = ?', [resPregunta.insertId]);
            row = preguntaRow[0];
          } catch (enumError) {
            // Si el error es porque respuesta_corta no existe en el enum, usar opcion_multiple como fallback
            if (enumError?.code === 'ER_WRONG_VALUE_FOR_TYPE' || enumError?.code === 'WARN_DATA_TRUNCATED' ||
              (enumError?.message && enumError.message.includes('respuesta_corta')) ||
              (enumError?.message && enumError.message.includes('ENUM'))) {
              tipoDB = 'opcion_multiple';
              const sqlPregunta = 'INSERT INTO quizzes_preguntas (id_quiz, orden, enunciado, tipo, puntos, activa) VALUES (?,?,?,?,?,?)';
              const [resPregunta] = await conn.query(sqlPregunta, [
                actId,
                q.orden ?? orden,
                q.text || q.enunciado || '',
                tipoDB,
                q.points || 1,
                1 // activa
              ]);
              const [preguntaRow] = await conn.query('SELECT * FROM quizzes_preguntas WHERE id = ?', [resPregunta.insertId]);
              row = preguntaRow[0];
            } else {
              throw enumError; // Re-lanzar si es otro tipo de error
            }
          }

          // opciones - usar la conexión de transacción directamente
          if (Array.isArray(q.options) && q.options.length) {
            let o = 1;
            const sqlOpcion = 'INSERT INTO quizzes_preguntas_opciones (id_pregunta, texto, es_correcta, orden) VALUES (?,?,?,?)';
            for (const opt of q.options) {
              await conn.query(sqlOpcion, [row.id, opt.text || '', opt.correct ? 1 : 0, o++]);
            }
          } else if (q.type === 'tf' || q.type === 'verdadero_falso') {
            const sqlOpcion = 'INSERT INTO quizzes_preguntas_opciones (id_pregunta, texto, es_correcta, orden) VALUES (?,?,?,?)';
            await conn.query(sqlOpcion, [row.id, 'Verdadero', q.answer === 'true' ? 1 : 0, 1]);
            await conn.query(sqlOpcion, [row.id, 'Falso', q.answer === 'false' ? 1 : 0, 2]);
          } else if (q.type === 'short' || q.type === 'respuesta_corta') {
            // Para respuesta corta, opcionalmente se puede guardar como opción textual de referencia
            if (q.answer) {
              const sqlOpcion = 'INSERT INTO quizzes_preguntas_opciones (id_pregunta, texto, es_correcta, orden) VALUES (?,?,?,?)';
              await conn.query(sqlOpcion, [row.id, q.answer, 1, 1]);
            }
          }
          orden++;
          preguntasGuardadas++;
        }
      } catch (e) {
        if (e?.code === 'ER_NO_SUCH_TABLE' || e?.errno === 1146) {
          // Tablas de preguntas/opciones no existen; se creó solo la actividad base
        } else if (e?.code === 'ER_WRONG_VALUE_FOR_TYPE' || e?.code === 'WARN_DATA_TRUNCATED' ||
          (e?.message && e.message.includes('ENUM'))) {
          // Re-lanzar para hacer rollback
          throw e;
        } else {
          // Para otros errores, re-lanzar
          throw e;
        }
      }
    } else {
      await conn.rollback();
      // Eliminar el quiz creado si no se pudieron guardar las preguntas
      try {
        await conn.query('DELETE FROM quizzes WHERE id = ?', [actId]);
      } catch (delErr) {
        // Error al eliminar quiz huérfano
      } finally {
        conn.release();
      }
      return res.status(400).json({ message: 'No se pudieron guardar las preguntas del quiz. El quiz no se creó.' });
    }

    // Verificar que se guardaron preguntas correctamente
    const [preguntasVerificadas] = await conn.query('SELECT COUNT(*) as total FROM quizzes_preguntas WHERE id_quiz = ?', [actId]);
    const totalPreguntas = preguntasVerificadas[0]?.total || 0;

    if (totalPreguntas === 0) {
      await conn.rollback();
      // Intentar eliminar el quiz creado
      try {
        await conn.query('DELETE FROM quizzes WHERE id = ?', [actId]);
      } catch (delErr) {
        // Error al eliminar quiz huérfano
      } finally {
        conn.release();
      }
      return res.status(500).json({ message: 'No se pudieron guardar las preguntas del quiz. El quiz no se creó.' });
    }

    // Si se solicita publicar y se guardaron preguntas, actualizar publicado
    if (publico && totalPreguntas > 0) {
      await conn.query('UPDATE quizzes SET publicado = 1 WHERE id = ?', [actId]);
    }

    // IMPORTANTE: Hacer commit y verificar que fue exitoso
    try {
      await conn.commit();
    } catch (commitErr) {
      // Si falla el commit, intentar rollback
      try {
        await conn.rollback();
      } catch (rollbackErr) {
        // Error en rollback
      } finally {
        conn.release();
      }
      return res.status(500).json({ message: 'Error al guardar el quiz en la base de datos. El quiz no se creó.' });
    }

    // Liberar la conexión DESPUÉS del commit exitoso
    conn.release();

    // Obtener el quiz creado (después del commit, puede usar db normal)
    let created;
    try {
      const [quizRows] = await db.query('SELECT * FROM quizzes WHERE id = ?', [actId]);
      created = quizRows[0];
      if (!created) {
        // Si no se puede obtener, crear objeto básico con los datos que tenemos
        created = {
          id: actId,
          titulo,
          descripcion: descripcion || null,
          id_area: id_area || null,
          materia: materia || null,
          publicado: publico ? 1 : 0,
          activo: 1
        };
      }
    } catch (getErr) {
      // Crear objeto básico con los datos que tenemos
      created = {
        id: actId,
        titulo,
        descripcion: descripcion || null,
        id_area: id_area || null,
        materia: materia || null,
        publicado: publico ? 1 : 0,
        activo: 1
      };
    }

    // Notificar a estudiantes si el quiz se creó como publicado (publico=true) O si tiene grupos/área
    try {
      // Parsear grupos si vienen como JSON string desde la base de datos
      let grupos = req.body.grupos;
      if (!grupos && created?.grupos) {
        try {
          grupos = typeof created.grupos === 'string' ? JSON.parse(created.grupos) : created.grupos;
        } catch {
          grupos = null;
        }
      }

      // ✅ SOLO notificar si el quiz está PUBLICADO (publicado = 1)
      // No enviar notificaciones si está en borrador
      const isPublished = created?.publicado === 1 || publico === 1 || publico === true;
      if (isPublished) {
        let rows = [];

        // Si hay grupos, notificar solo a esos grupos
        if (Array.isArray(grupos) && grupos.length) {
          // ✅ IMPORTANTE: Normalizar grupos para comparación (el grupo en BD puede estar en mayúsculas)
          const gruposNormalizados = grupos.map(g => String(g).trim());
          const placeholders = gruposNormalizados.map(() => 'UPPER(TRIM(?))').join(',');
          // ✅ IMPORTANTE: Solo estudiantes activos y sin soft delete
          const [gruposRows] = await db.query(`
            SELECT e.id 
            FROM estudiantes e
            LEFT JOIN soft_deletes sd ON sd.id_estudiante = e.id
            WHERE UPPER(TRIM(e.grupo)) IN (${placeholders})
              AND e.estatus = 'Activo'
              AND sd.id IS NULL
          `, gruposNormalizados);
          rows = gruposRows;
          console.log(`[createQuiz] Notificando a ${rows.length} estudiantes activos de grupos ${JSON.stringify(grupos)}`);
        }
        // Si no hay grupos pero hay área, notificar a todos los estudiantes con acceso a esa área
        else if (created?.id_area) {
          try {
            const [areaRows] = await db.query(`
              SELECT DISTINCT e.id 
              FROM estudiantes e
              INNER JOIN student_area_access saa ON saa.id_estudiante = e.id
              LEFT JOIN soft_deletes sd ON sd.id_estudiante = e.id
              WHERE saa.area_id = ? 
                AND saa.status = 'approved'
                AND e.estatus = 'Activo'
                AND sd.id IS NULL
            `, [created.id_area]);
            rows = areaRows;
            console.log(`[createQuiz] Notificando a ${rows.length} estudiantes activos con acceso al área ${created.id_area}`);
          } catch (areaErr) {
            console.error('[createQuiz] Error al obtener estudiantes por área:', areaErr);
            // Fallback: intentar obtener estudiantes activos sin soft delete
            const [fallbackRows] = await db.query(`
              SELECT e.id 
              FROM estudiantes e
              LEFT JOIN soft_deletes sd ON sd.id_estudiante = e.id
              WHERE e.estatus = 'Activo'
                AND sd.id IS NULL
              LIMIT 100
            `);
            rows = fallbackRows;
          }
        }

        if (rows.length) {
          const list = rows.map(r => ({
            student_id: r.id,
            type: 'assignment',
            title: 'Nuevo quiz publicado',
            message: created.titulo ? `Se publicó un nuevo quiz: ${created.titulo}` : 'Hay un nuevo quiz disponible',
            action_url: `/alumno/actividades?type=quiz&quizId=${actId}`,
            metadata: { actividad_id: actId, kind: 'quiz' }
          }));
          const bulkRes = await StudentNotifs.bulkCreateNotifications(list).catch(() => null);
          let idMap = [];
          if (bulkRes && bulkRes.affectedRows) {
            const { firstInsertId, affectedRows } = bulkRes;
            if (firstInsertId && affectedRows === rows.length) {
              idMap = Array.from({ length: affectedRows }, (_, i) => firstInsertId + i);
            }
          }
          rows.forEach((r, idx) => {
            broadcastStudent(r.id, { 
              type: 'notification', 
              payload: { 
                kind: 'assignment', 
                actividad_id: actId, 
                title: 'Nuevo quiz publicado', 
                message: created.titulo, 
                notif_id: idMap[idx],
                metadata: { actividad_id: actId, kind: 'quiz' } // Incluir metadata para que el frontend pueda detectar que es un quiz
              } 
            });
          });
          console.log(`[createQuiz] Notificaciones enviadas a ${rows.length} estudiantes (quiz publicado)`);
        } else {
          console.log('[createQuiz] Quiz publicado pero no se encontraron estudiantes para notificar (sin grupos ni área)');
        }
      }
    } catch (e) {
      console.error('[createQuiz] Error en notificaciones:', e);
      // Error al enviar notificaciones (no crítico)
    }

    // IMPORTANTE: Responder solo después de confirmar que el commit fue exitoso
    res.status(201).json({ data: created });
  } catch (e) {
    // IMPORTANTE: Solo hacer rollback si la conexión aún está activa y NO se hizo commit
    // Si ya se hizo commit y se liberó la conexión, no intentar rollback
    let rollbackExitoso = false;
    if (conn) {
      try {
        // Intentar rollback solo si no se hizo commit
        await conn.rollback();
        rollbackExitoso = true;
      } catch (rollbackErr) {
        // Si falla el rollback, puede ser porque ya se hizo commit o la conexión está cerrada
        rollbackExitoso = false;
      } finally {
        // Intentar eliminar actividad huérfana solo si el rollback fue exitoso (es decir, si el error ocurrió ANTES del commit)
        // Si el rollback falló, significa que probablemente ya se hizo commit, así que NO eliminar la actividad
        if (actId && rollbackExitoso) {
          try {
            // Usar db normal (pool) en lugar de conn porque la conexión de transacción ya está en rollback
            await db.query('DELETE FROM quizzes WHERE id = ?', [actId]);
          } catch (delErr) {
            // Error al eliminar actividad huérfana
          }
        }
        // Liberar la conexión
        try {
          conn.release();
        } catch (releaseErr) {
          // Error al liberar conexión
        }
      }
    }

    res.status(500).json({ message: e?.message || 'Error interno al crear el quiz. El quiz no se creó.' });
  }
};

// Eliminar quiz de la tabla quizzes y sus dependencias
export const deleteQuiz = async (req, res) => {
  const { id } = req.params;
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // Verificar existencia
    const [existsRows] = await conn.query('SELECT id FROM quizzes WHERE id = ? LIMIT 1', [id]);
    if (!existsRows.length) {
      await conn.rollback();
      return res.status(404).json({ message: 'Quiz no encontrado' });
    }

    // Borrar sesiones y respuestas
    const [ses] = await conn.query('SELECT id FROM quizzes_sesiones WHERE id_quiz = ?', [id]);
    const sesIds = ses.map((r) => r.id);
    if (sesIds.length) {
      await conn.query('DELETE FROM quizzes_sesiones_respuestas WHERE id_sesion IN (?)', [sesIds]);
      await conn.query('DELETE FROM quizzes_sesiones WHERE id IN (?)', [sesIds]);
    } else {
      await conn.query('DELETE FROM quizzes_sesiones WHERE id_quiz = ?', [id]);
    }

    // Borrar intentos
    await conn.query('DELETE FROM quizzes_intentos WHERE id_quiz = ?', [id]);

    // Borrar preguntas y opciones
    const [pregs] = await conn.query('SELECT id FROM quizzes_preguntas WHERE id_quiz = ?', [id]);
    const qIds = pregs.map((r) => r.id);
    if (qIds.length) {
      await conn.query('DELETE FROM quizzes_preguntas_opciones WHERE id_pregunta IN (?)', [qIds]);
      await conn.query('DELETE FROM quizzes_preguntas WHERE id IN (?)', [qIds]);
    } else {
      await conn.query('DELETE FROM quizzes_preguntas WHERE id_quiz = ?', [id]);
    }

    // Finalmente borrar el quiz
    const [del] = await conn.query('DELETE FROM quizzes WHERE id = ?', [id]);

    await conn.commit();
    res.json({ ok: true, deleted: del.affectedRows });
  } catch (e) {
    try { await conn.rollback(); } catch { }
    console.error('deleteQuiz', e);
    res.status(500).json({ message: 'Error interno' });
  } finally {
    conn.release();
  }
};

// Actualizar quiz existente: meta + reemplazo completo de preguntas/opciones
export const updateQuiz = async (req, res) => {
  const { id } = req.params;
  const { titulo, materia, descripcion, preguntas, fecha_limite, max_intentos, publico, shuffle_questions, time_limit_min, passing_score, id_area, activo } = req.body || {};
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // Verificar existencia y obtener meta relevante (publicado, grupos)
    const [existsRows] = await conn.query('SELECT id, titulo, publicado, grupos FROM quizzes WHERE id = ? LIMIT 1', [id]);
    if (!existsRows.length) {
      await conn.rollback();
      return res.status(404).json({ message: 'Quiz no encontrado' });
    }
    const existing = existsRows[0];
    const prevPublicado = !!(existing.publicado);

    // Actualizar metadatos
    // IMPORTANTE: Si id_area no se envía en el body, no lo actualizamos (mantener el valor existente)
    // Solo actualizar campos que estén explícitamente presentes en el body
    const updateFields = {};
    if (titulo !== undefined) updateFields.titulo = titulo;
    if (descripcion !== undefined) updateFields.descripcion = descripcion;
    if (materia !== undefined) updateFields.materia = materia;
    if (id_area !== undefined) updateFields.id_area = id_area; // Solo actualizar si se envía explícitamente
    if (fecha_limite !== undefined) updateFields.fecha_limite = fecha_limite;
    if (max_intentos !== undefined) updateFields.max_intentos = max_intentos;
    if (publico !== undefined) updateFields.publicado = publico ? 1 : 0;
    if (shuffle_questions !== undefined) updateFields.shuffle_questions = !!shuffle_questions;
    if (time_limit_min !== undefined) updateFields.time_limit_min = time_limit_min;
    if (passing_score !== undefined) updateFields.passing_score = passing_score;
    if (activo !== undefined) updateFields.activo = activo;
    
    if (Object.keys(updateFields).length > 0) {
      await Quizzes.updateQuizMeta(id, updateFields);
    }

    // Si se envían grupos, actualizarlos directamente en quizzes (maneja JSON)
    if (req.body.grupos !== undefined) {
      let gruposVal = req.body.grupos;
      try { if (typeof gruposVal === 'string') gruposVal = JSON.parse(gruposVal); } catch { gruposVal = null; }
      if (gruposVal && !Array.isArray(gruposVal)) gruposVal = null;
      const gruposJson = gruposVal ? JSON.stringify(gruposVal) : null;
      try {
        await conn.query('UPDATE quizzes SET grupos = ? WHERE id = ?', [gruposJson, id]);
      } catch (e) {
        console.error('updateQuiz:set grupos', e);
      }
    }

    // Reemplazar preguntas/opciones si llegan (usar SIEMPRE la misma conexión de la transacción)
    if (Array.isArray(preguntas)) {
      // Borrar existentes
      const [pregs] = await conn.query('SELECT id FROM quizzes_preguntas WHERE id_quiz = ?', [id]);
      const qIds = pregs.map((r) => r.id);
      if (qIds.length) {
        await conn.query('DELETE FROM quizzes_preguntas_opciones WHERE id_pregunta IN (?)', [qIds]);
        await conn.query('DELETE FROM quizzes_preguntas WHERE id IN (?)', [qIds]);
      } else {
        await conn.query('DELETE FROM quizzes_preguntas WHERE id_quiz = ?', [id]);
      }
      // Insertar nuevas (con fallback de columnas)
      let orden = 1;
      for (const q of preguntas) {
        const enunciado = q.text || q.enunciado || '';
        const tipo = q.type === 'tf' ? 'verdadero_falso' : (q.type === 'short' ? 'respuesta_corta' : 'opcion_multiple');
        const puntos = q.points || 1;
        const ord = q.orden ?? orden;
        let preguntaId = null;
        try {
          const [resIns] = await conn.query(
            'INSERT INTO quizzes_preguntas (id_quiz, orden, enunciado, tipo, puntos, activa) VALUES (?,?,?,?,?,?)',
            [id, ord, enunciado, tipo, puntos, 1]
          );
          preguntaId = resIns.insertId;
        } catch (e) {
          if (e?.code === 'ER_BAD_FIELD_ERROR' || e?.errno === 1054) {
            const [resIns2] = await conn.query(
              'INSERT INTO quizzes_preguntas (id_quiz, enunciado, tipo, puntos) VALUES (?,?,?,?)',
              [id, enunciado, tipo, puntos]
            );
            preguntaId = resIns2.insertId;
          } else {
            throw e;
          }
        }

        // Opciones
        const insertOpcion = async ({ texto, es_correcta, orden }) => {
          try {
            await conn.query(
              'INSERT INTO quizzes_preguntas_opciones (id_pregunta, texto, es_correcta, orden) VALUES (?,?,?,?)',
              [preguntaId, texto, es_correcta ? 1 : 0, orden ?? null]
            );
          } catch (e) {
            if (e?.code === 'ER_BAD_FIELD_ERROR' || e?.errno === 1054) {
              await conn.query(
                'INSERT INTO quizzes_preguntas_opciones (id_pregunta, texto, es_correcta) VALUES (?,?,?)',
                [preguntaId, texto, es_correcta ? 1 : 0]
              );
            } else {
              throw e;
            }
          }
        };

        if (Array.isArray(q.options) && q.options.length) {
          let o = 1;
          for (const opt of q.options) {
            await insertOpcion({ texto: opt.text || '', es_correcta: !!opt.correct, orden: o++ });
          }
        } else if (q.type === 'tf') {
          await insertOpcion({ texto: 'Verdadero', es_correcta: q.answer === 'true', orden: 1 });
          await insertOpcion({ texto: 'Falso', es_correcta: q.answer === 'false', orden: 2 });
        } else if (q.type === 'short') {
          if (q.answer) await insertOpcion({ texto: q.answer, es_correcta: 1, orden: 1 });
        }
        orden++;
      }
    }

    await conn.commit();
    const updated = await Quizzes.getQuizById(id);

    // Si se publicó (transición 0 -> 1), notificar a grupos o área
    try {
      const publishTransition = (publico !== undefined) && !prevPublicado && !!publico;
      if (publishTransition) {
        // Determinar grupos destinatarios: request.grupos si viene; de lo contrario, los almacenados en la actividad
        let grupos = req.body.grupos;
        try { if (!grupos && existing.grupos) grupos = typeof existing.grupos === 'string' ? JSON.parse(existing.grupos) : existing.grupos; } catch { grupos = null; }

        let rows = [];
        // Si hay grupos, notificar solo a esos grupos
        if (Array.isArray(grupos) && grupos.length) {
          // ✅ IMPORTANTE: Normalizar grupos para comparación (el grupo en BD puede estar en mayúsculas)
          const gruposNormalizados = grupos.map(g => String(g).trim());
          const placeholders = gruposNormalizados.map(() => 'UPPER(TRIM(?))').join(',');
          // ✅ IMPORTANTE: Solo estudiantes activos y sin soft delete
          const [gruposRows] = await db.query(`
            SELECT e.id 
            FROM estudiantes e
            LEFT JOIN soft_deletes sd ON sd.id_estudiante = e.id
            WHERE UPPER(TRIM(e.grupo)) IN (${placeholders})
              AND e.estatus = 'Activo'
              AND sd.id IS NULL
          `, gruposNormalizados);
          rows = gruposRows;
          console.log(`[updateQuiz] Notificando a ${rows.length} estudiantes activos de grupos ${JSON.stringify(grupos)}`);
        }
        // Si no hay grupos pero hay área, notificar a todos los estudiantes con acceso a esa área
        else if (updated?.id_area) {
          try {
            const [areaRows] = await db.query(`
              SELECT DISTINCT e.id 
              FROM estudiantes e
              INNER JOIN student_area_access saa ON saa.id_estudiante = e.id
              LEFT JOIN soft_deletes sd ON sd.id_estudiante = e.id
              WHERE saa.area_id = ? 
                AND saa.status = 'approved'
                AND e.estatus = 'Activo'
                AND sd.id IS NULL
            `, [updated.id_area]);
            rows = areaRows;
            console.log(`[updateQuiz] Notificando a ${rows.length} estudiantes activos con acceso al área ${updated.id_area}`);
          } catch (areaErr) {
            console.error('Error al obtener estudiantes por área:', areaErr);
            // Fallback: intentar obtener estudiantes activos sin soft delete
            const [fallbackRows] = await db.query(`
              SELECT e.id 
              FROM estudiantes e
              LEFT JOIN soft_deletes sd ON sd.id_estudiante = e.id
              WHERE e.estatus = 'Activo'
                AND sd.id IS NULL
              LIMIT 100
            `);
            rows = fallbackRows;
          }
        }

        if (rows.length) {
          const list = rows.map(r => ({
            student_id: r.id,
            type: 'assignment',
            title: 'Nuevo quiz publicado',
            message: (titulo || existing.titulo) ? `Se publicó un nuevo quiz: ${titulo || existing.titulo}` : 'Hay un nuevo quiz disponible',
            action_url: `/alumno/actividades?type=quiz&quizId=${id}`,
            metadata: { actividad_id: Number(id), kind: 'quiz' }
          }));
          const bulkRes = await StudentNotifs.bulkCreateNotifications(list).catch(() => null);
          let idMap = [];
          if (bulkRes && bulkRes.affectedRows) {
            const { firstInsertId, affectedRows } = bulkRes;
            if (firstInsertId && affectedRows === rows.length) {
              idMap = Array.from({ length: affectedRows }, (_, i) => firstInsertId + i);
            }
          }
          rows.forEach((r, idx) => {
            broadcastStudent(r.id, { 
              type: 'notification', 
              payload: { 
                kind: 'assignment', 
                actividad_id: Number(id), 
                title: 'Nuevo quiz publicado', 
                message: titulo || existing.titulo, 
                notif_id: idMap[idx],
                metadata: { actividad_id: Number(id), kind: 'quiz' } // Incluir metadata para que el frontend pueda detectar que es un quiz
              } 
            });
          });
          console.log(`[updateQuiz] Notificaciones enviadas a ${rows.length} estudiantes`);
        } else {
          console.log('[updateQuiz] No se encontraron estudiantes para notificar (sin grupos ni área)');
        }
      }
    } catch (e) { console.error('notif updateQuiz', e); }

    res.json({ data: updated });
  } catch (e) {
    try { await conn.rollback(); } catch { }
    console.error('updateQuiz', e);
    // Si las tablas de preguntas no existen, actualizar solo meta
    if (e?.code === 'ER_NO_SUCH_TABLE' || e?.errno === 1146) {
      try {
        await Quizzes.updateQuizMeta(id, { titulo, descripcion, materia, id_area, fecha_limite, max_intentos, publicado: publico ? 1 : 0, shuffle_questions, time_limit_min, passing_score, activo });
        const updated = await Quizzes.getQuizById(id);
        return res.json({ data: updated, warning: 'No se pudieron actualizar preguntas (tablas no existen)' });
      } catch (e2) {
        console.error('updateQuiz fallback', e2);
      }
    }
    res.status(500).json({ message: 'Error interno' });
  } finally {
    conn.release();
  }
};
