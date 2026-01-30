import db from '../db.js';

export const getQuizById = async (id) => {
  try {
    // Buscar primero en la tabla quizzes (nueva estructura)
    const [rows] = await db.query('SELECT * FROM quizzes WHERE id = ? LIMIT 1', [id]);
    if (rows[0]) return rows[0];

    // Fallback: buscar en actividades para quizzes antiguos (migración)
    const [legacyRows] = await db.query('SELECT * FROM actividades WHERE id = ? AND tipo = "quiz" LIMIT 1', [id]);
    return legacyRows[0] || null;
  } catch (e) {
    // Si la tabla quizzes no existe aún, usar solo actividades
    if (e?.code === 'ER_NO_SUCH_TABLE' || e?.errno === 1146) {
      try {
        const [rows] = await db.query('SELECT * FROM actividades WHERE id = ? AND tipo = "quiz" LIMIT 1', [id]);
        return rows[0] || null;
      } catch (e2) {
        // Fallback si la columna 'tipo' no existe
        if (e2?.code === 'ER_BAD_FIELD_ERROR' || e2?.errno === 1054) {
          const [rows] = await db.query('SELECT * FROM actividades WHERE id = ? LIMIT 1', [id]);
          return rows[0] || null;
        }
        throw e2;
      }
    }
    throw e;
  }
};

export const updateQuizMeta = async (id, fields = {}) => {
  const allowed = ['titulo', 'descripcion', 'materia', 'id_area', 'fecha_limite', 'max_intentos', 'publicado', 'shuffle_questions', 'time_limit_min', 'passing_score', 'activo'];
  const sets = [];
  const vals = [];
  for (const k of allowed) {
    if (k in fields) { sets.push(`${k} = ?`); vals.push(fields[k]); }
  }
  if (!sets.length) return { affectedRows: 0 };
  vals.push(id);

  try {
    // Intentar actualizar en la tabla quizzes primero
    const [res] = await db.query(`UPDATE quizzes SET ${sets.join(', ')} WHERE id = ?`, vals);
    if (res.affectedRows > 0) return res;

    // Fallback: actualizar en actividades para quizzes antiguos
    const [legacyRes] = await db.query(`UPDATE actividades SET ${sets.join(', ')} WHERE id = ? AND tipo = 'quiz'`, vals);
    return legacyRes;
  } catch (e) {
    // Si la tabla quizzes no existe, usar solo actividades
    if (e?.code === 'ER_NO_SUCH_TABLE' || e?.errno === 1146) {
      const [res] = await db.query(`UPDATE actividades SET ${sets.join(', ')} WHERE id = ? AND tipo = 'quiz'`, vals);
      return res;
    }
    throw e;
  }
};

export const listQuizzes = async ({ visible = true, id_area, materia } = {}) => {
  // Intentar primero con la tabla quizzes (nueva estructura)
  try {
    const baseClauses = ['q.activo = 1'];
    // Si es visible (para alumnos), solo mostrar quizzes publicados
    if (visible) {
      baseClauses.push('q.publicado = 1');
      baseClauses.push('(q.visible_desde IS NULL OR q.visible_desde <= NOW())');
      baseClauses.push('(q.visible_hasta IS NULL OR q.visible_hasta >= NOW())');
    }
    const params = [];
    if (id_area !== undefined) {
      baseClauses.push('q.id_area = ?');
      params.push(id_area);
    } else if (materia) {
      baseClauses.push('q.materia = ?');
      params.push(materia);
    }
    const order = 'ORDER BY q.fecha_limite ASC, q.id DESC';

    const selectWithJoinWide = `
      SELECT 
        q.*, 
        (SELECT COUNT(*) FROM quizzes_preguntas qp WHERE qp.id_quiz = q.id) AS total_preguntas,
        (SELECT COUNT(*) FROM quizzes_intentos qi WHERE qi.id_quiz = q.id) AS total_intentos_global,
        COALESCE(
          NULLIF(TRIM(CONCAT_WS(' ', pr.nombres, pr.apellidos)), ''),
          NULLIF(u.usuario, ''),
          CAST(q.creado_por AS CHAR)
        ) AS creado_por_nombre
      FROM quizzes q
      LEFT JOIN usuarios u ON u.id = q.creado_por
      LEFT JOIN asesor_perfiles ap ON ap.usuario_id = q.creado_por
      LEFT JOIN asesor_preregistros pr ON pr.id = ap.preregistro_id
    `;

    const where = baseClauses.length ? 'WHERE ' + baseClauses.join(' AND ') : '';
    const sql = `${selectWithJoinWide} ${where} ${order}`;

    try {
      const [rows] = await db.query(sql, params);
      return rows; // Retornar incluso si está vacío, para que funcione con la nueva tabla
    } catch (e) {
      // Si falla el JOIN, intentar sin JOIN
      if (e?.code === 'ER_BAD_FIELD_ERROR' || e?.errno === 1054 || e?.code === 'ER_NO_SUCH_TABLE' || e?.errno === 1146) {
        try {
          const selectSimple = `
            SELECT 
              q.*, 
              (SELECT COUNT(*) FROM quizzes_preguntas qp WHERE qp.id_quiz = q.id) AS total_preguntas,
              (SELECT COUNT(*) FROM quizzes_intentos qi WHERE qi.id_quiz = q.id) AS total_intentos_global
            FROM quizzes q
          `;
          const sqlSimple = `${selectSimple} ${where} ${order}`;
          const [rows] = await db.query(sqlSimple, params);
          return rows;
        } catch (e2) {
          // Si la tabla quizzes no existe, continuar con el código legacy
          if (e2?.code === 'ER_NO_SUCH_TABLE' || e2?.errno === 1146) {
            // Continuar con código legacy más abajo
          } else {
            throw e2;
          }
        }
      } else {
        throw e;
      }
    }
  } catch (e) {
    // Si la tabla quizzes no existe, continuar con el código legacy de actividades
    if (e?.code !== 'ER_NO_SUCH_TABLE' && e?.errno !== 1146) {
      // Si es otro error, continuar con legacy
    }
  }

  // Fallback: código legacy para quizzes en actividades (compatibilidad)
  const baseClauses = ['a.tipo = "quiz"', 'a.activo = 1'];
  // Si es visible (para alumnos), solo mostrar quizzes publicados
  if (visible) {
    baseClauses.push('a.publicado = 1');
  }
  const params = [];
  if (id_area !== undefined) {
    baseClauses.push('a.id_area = ?');
    params.push(id_area);
  } else if (materia) {
    baseClauses.push('a.materia = ?');
    params.push(materia);
  }
  const order = 'ORDER BY a.fecha_limite ASC, a.id DESC';

  // SELECT con métricas agregadas y nombre del creador (intenta varias fuentes)
  const selectWithJoinWide = `
    SELECT 
      a.*, 
      (SELECT COUNT(*) FROM quizzes_preguntas qp WHERE qp.id_quiz = a.id) AS total_preguntas,
      (SELECT COUNT(*) FROM quizzes_intentos qi WHERE qi.id_quiz = a.id) AS total_intentos_global,
      COALESCE(
        NULLIF(TRIM(CONCAT_WS(' ', pr.nombres, pr.apellidos)), ''),
        NULLIF(u.usuario, ''),
        CAST(a.creado_por AS CHAR)
      ) AS creado_por_nombre
    FROM actividades a
    LEFT JOIN usuarios u ON u.id = a.creado_por
    LEFT JOIN asesor_perfiles ap ON ap.usuario_id = a.creado_por
    LEFT JOIN asesor_preregistros pr ON pr.id = ap.preregistro_id
  `;
  const selectWithJoinUsersOnly = `
    SELECT 
      a.*, 
      (SELECT COUNT(*) FROM quizzes_preguntas qp WHERE qp.id_quiz = a.id) AS total_preguntas,
      (SELECT COUNT(*) FROM quizzes_intentos qi WHERE qi.id_quiz = a.id) AS total_intentos_global,
      COALESCE(NULLIF(u.usuario, ''), CAST(a.creado_por AS CHAR)) AS creado_por_nombre
    FROM actividades a
    LEFT JOIN usuarios u ON u.id = a.creado_por
  `;
  const selectWithoutJoin = `
    SELECT 
      a.*, 
      (SELECT COUNT(*) FROM quizzes_preguntas qp WHERE qp.id_quiz = a.id) AS total_preguntas,
      (SELECT COUNT(*) FROM quizzes_intentos qi WHERE qi.id_quiz = a.id) AS total_intentos_global
    FROM actividades a
  `;

  const buildWhere = (clauses) => (clauses.length ? 'WHERE ' + clauses.join(' AND ') : '');

  // Intentar con filtros de visibilidad si se solicitan
  if (visible) {
    const visClauses = baseClauses.concat([
      '(a.visible_desde IS NULL OR a.visible_desde <= NOW())',
      '(a.visible_hasta IS NULL OR a.visible_hasta >= NOW())'
    ]);
    const where = buildWhere(visClauses);
    // 1) Intentar con JOIN a usuarios (si existe la tabla/columna)
    // 1) Intentar con join amplio (asesor + usuarios)
    const sqlWithVisibleJoinWide = `${selectWithJoinWide} ${where} ${order}`;
    try {
      const [rows] = await db.query(sqlWithVisibleJoinWide, params);
      return rows;
    } catch (e) {
      if (e?.code === 'ER_BAD_FIELD_ERROR' || e?.errno === 1054 || e?.code === 'ER_NO_SUCH_TABLE' || e?.errno === 1146) {
        // 2) Intentar con solo usuarios (u.usuario)
        try {
          const sqlWithVisibleUsersOnly = `${selectWithJoinUsersOnly} ${where} ${order}`;
          const [rows] = await db.query(sqlWithVisibleUsersOnly, params);
          return rows;
        } catch (e1) {
          // 3) Intentar sin JOIN
          try {
            const sqlWithVisibleNoJoin = `${selectWithoutJoin} ${where} ${order}`;
            const [rows] = await db.query(sqlWithVisibleNoJoin, params);
            return rows;
          } catch (e2) {
            if (e2?.code === 'ER_BAD_FIELD_ERROR' || e2?.errno === 1054) {
              // Fallback total: sin columnas de visibilidad ni activo/tipo
              const fallbackClauses = [];
              if (id_area !== undefined) { fallbackClauses.push('a.id_area = ?'); }
              else if (materia) { fallbackClauses.push('a.materia = ?'); }
              const whereBase = buildWhere(fallbackClauses);
              const sqlFallback = `${selectWithoutJoin} ${whereBase} ${order}`;
              const [rows] = await db.query(sqlFallback, params);
              return rows;
            }
            throw e2;
          }
        }
      }
      throw e;
    }
  }
  // Sin filtros de visibilidad
  const whereBase = buildWhere(baseClauses);
  const sqlNoVisibleJoinWide = `${selectWithJoinWide} ${whereBase} ${order}`;
  try {
    const [rows] = await db.query(sqlNoVisibleJoinWide, params);
    return rows;
  } catch (e) {
    if (e?.code === 'ER_BAD_FIELD_ERROR' || e?.errno === 1054 || e?.code === 'ER_NO_SUCH_TABLE' || e?.errno === 1146) {
      // Intentar versión con solo usuarios
      try {
        const sqlNoVisibleUsersOnly = `${selectWithJoinUsersOnly} ${whereBase} ${order}`;
        const [rows] = await db.query(sqlNoVisibleUsersOnly, params);
        return rows;
      } catch (e1) {
        // Fallback total: fuera las columnas 'tipo' y 'activo'
        const fallbackClauses = [];
        if (id_area !== undefined) { fallbackClauses.push('a.id_area = ?'); }
        else if (materia) { fallbackClauses.push('a.materia = ?'); }
        const whereFallback = buildWhere(fallbackClauses);
        const sqlNoVisibleNoJoin = `${selectWithoutJoin} ${whereFallback} ${order}`;
        const [rows] = await db.query(sqlNoVisibleNoJoin, params);
        return rows;
      }
    }
    throw e;
  }
};

export const listIntentosQuizEstudiante = async (id_quiz, id_estudiante) => {
  const [rows] = await db.query('SELECT * FROM quizzes_intentos WHERE id_quiz = ? AND id_estudiante = ? ORDER BY id DESC', [id_quiz, id_estudiante]);
  return rows;
};

export const contarIntentosQuizEstudiante = async (id_quiz, id_estudiante) => {
  const [rows] = await db.query('SELECT COUNT(*) as total FROM quizzes_intentos WHERE id_quiz = ? AND id_estudiante = ?', [id_quiz, id_estudiante]);
  return rows[0]?.total || 0;
};

export const crearIntentoQuiz = async ({ id_quiz, id_estudiante, puntaje, tiempo_segundos, total_preguntas, correctas }) => {
  // Obtener siguiente número de intento
  const totalPrevios = await contarIntentosQuizEstudiante(id_quiz, id_estudiante);
  const intent_number = totalPrevios + 1;
  const sql = `INSERT INTO quizzes_intentos (id_quiz, id_estudiante, puntaje, intent_number, tiempo_segundos, total_preguntas, correctas) VALUES (?,?,?,?,?,?,?)`;
  try {
    const [res] = await db.query(sql, [Number(id_quiz), Number(id_estudiante), Number(puntaje), Number(intent_number), tiempo_segundos ? Number(tiempo_segundos) : null, total_preguntas ? Number(total_preguntas) : null, correctas ? Number(correctas) : null]);
    const [rows] = await db.query('SELECT * FROM quizzes_intentos WHERE id = ?', [res.insertId]);
    return rows[0];
  } catch (e) {
    if (e.code === 'ER_NO_REFERENCED_ROW_2' || e.errno === 1452) {
      console.error('[crearIntentoQuiz] Error de foreign key al insertar intento');
      console.error('[crearIntentoQuiz] id_quiz:', id_quiz, 'id_estudiante:', id_estudiante);
      console.error('[crearIntentoQuiz] SQL:', e.sql);
      console.error('[crearIntentoQuiz] Mensaje:', e.sqlMessage);

      // Verificar si el quiz existe
      const [quizCheck] = await db.query('SELECT id FROM quizzes WHERE id = ?', [id_quiz]);
      if (quizCheck.length === 0) {
        throw new Error(`El quiz con id ${id_quiz} no existe en la tabla quizzes. Asegúrate de que el quiz haya sido migrado correctamente.`);
      }
      // Verificar si el estudiante existe
      const [studentCheck] = await db.query('SELECT id FROM estudiantes WHERE id = ?', [id_estudiante]);
      if (studentCheck.length === 0) {
        throw new Error(`El estudiante con id ${id_estudiante} no existe en la tabla estudiantes.`);
      }
      throw new Error(`Error de foreign key: ${e.sqlMessage}. El quiz y el estudiante existen, pero hay un problema con las constraints de quizzes_intentos. Verifica la migración de foreign keys (ejecuta: ALTER TABLE quizzes_intentos DROP FOREIGN KEY fk_quiz_intento_quiz;).`);
    }
    throw e;
  }
};

export const resumenQuizzesEstudiante = async (id_estudiante) => {
  // Para cada quiz visible, mostrar último intento (puntaje), mejor puntaje y total intentos
  // Buscar primero en la tabla quizzes (nueva estructura), luego en actividades como fallback
  try {
    console.log('[DEBUG resumenQuizzesEstudiante MODEL] Buscando resumen para estudiante:', id_estudiante);
    const [rows] = await db.query(`
      SELECT q.*, 
        (SELECT qi.puntaje FROM quizzes_intentos qi WHERE qi.id_quiz = q.id AND qi.id_estudiante = ? ORDER BY qi.id DESC LIMIT 1) AS ultimo_puntaje,
        (SELECT qi.created_at FROM quizzes_intentos qi WHERE qi.id_quiz = q.id AND qi.id_estudiante = ? ORDER BY qi.id DESC LIMIT 1) AS fecha_ultimo_intento,
        (SELECT MAX(qi.puntaje) FROM quizzes_intentos qi WHERE qi.id_quiz = q.id AND qi.id_estudiante = ?) AS mejor_puntaje,
        (SELECT COUNT(*) FROM quizzes_intentos qi WHERE qi.id_quiz = q.id AND qi.id_estudiante = ?) AS total_intentos,
        (SELECT qi.puntaje FROM quizzes_intentos qi WHERE qi.id_quiz = q.id AND qi.id_estudiante = ? AND qi.intent_number = 1 LIMIT 1) AS oficial_puntaje,
        (SELECT qi.created_at FROM quizzes_intentos qi WHERE qi.id_quiz = q.id AND qi.id_estudiante = ? AND qi.intent_number = 1 LIMIT 1) AS fecha_oficial_intento
      FROM quizzes q
      WHERE q.activo = 1
        AND q.publicado = 1
        AND (q.visible_desde IS NULL OR q.visible_desde <= NOW())
        AND (q.visible_hasta IS NULL OR q.visible_hasta >= NOW())
      ORDER BY q.fecha_limite ASC, q.id DESC
    `, [id_estudiante, id_estudiante, id_estudiante, id_estudiante, id_estudiante, id_estudiante]);
    console.log('[DEBUG resumenQuizzesEstudiante MODEL] Filas encontradas:', rows.length, 'Datos:', rows.map(r => ({
      id: r.id,
      titulo: r.titulo,
      id_area: r.id_area,
      total_intentos: r.total_intentos,
      mejor_puntaje: r.mejor_puntaje
    })));
    return rows;
  } catch (e) {
    // Si la tabla quizzes no existe, usar actividades como fallback
    if (e?.code === 'ER_NO_SUCH_TABLE' || e?.errno === 1146) {
      const [rows] = await db.query(`
        SELECT q.*, 
          (SELECT qi.puntaje FROM quizzes_intentos qi WHERE qi.id_quiz = q.id AND qi.id_estudiante = ? ORDER BY qi.id DESC LIMIT 1) AS ultimo_puntaje,
          (SELECT qi.created_at FROM quizzes_intentos qi WHERE qi.id_quiz = q.id AND qi.id_estudiante = ? ORDER BY qi.id DESC LIMIT 1) AS fecha_ultimo_intento,
          (SELECT MAX(qi.puntaje) FROM quizzes_intentos qi WHERE qi.id_quiz = q.id AND qi.id_estudiante = ?) AS mejor_puntaje,
          (SELECT COUNT(*) FROM quizzes_intentos qi WHERE qi.id_quiz = q.id AND qi.id_estudiante = ?) AS total_intentos,
          (SELECT qi.puntaje FROM quizzes_intentos qi WHERE qi.id_quiz = q.id AND qi.id_estudiante = ? AND qi.intent_number = 1 LIMIT 1) AS oficial_puntaje,
          (SELECT qi.created_at FROM quizzes_intentos qi WHERE qi.id_quiz = q.id AND qi.id_estudiante = ? AND qi.intent_number = 1 LIMIT 1) AS fecha_oficial_intento
        FROM actividades q
        WHERE q.tipo = 'quiz'
          AND q.activo = 1
          AND q.publicado = 1
          AND (q.visible_desde IS NULL OR q.visible_desde <= NOW())
          AND (q.visible_hasta IS NULL OR q.visible_hasta >= NOW())
        ORDER BY q.fecha_limite ASC, q.id DESC
      `, [id_estudiante, id_estudiante, id_estudiante, id_estudiante, id_estudiante, id_estudiante]);
      return rows;
    }
    throw e;
  }
};

// Lista, para un quiz, los estudiantes que ya hicieron al menos 1 intento,
// con su puntaje oficial (primer intento) y el total de intentos.
export const listEstudiantesEstadoQuiz = async (id_quiz) => {
  const sql = `
    SELECT 
      qi.id_estudiante,
      e.nombre,
      e.apellidos,
      e.grupo,
      e.folio,
      COUNT(*) AS total_intentos,
      -- Primer intento (puntaje oficial) - siempre intent_number = 1
      (SELECT qi2.puntaje FROM quizzes_intentos qi2 
         WHERE qi2.id_quiz = qi.id_quiz AND qi2.id_estudiante = qi.id_estudiante 
         AND qi2.intent_number = 1
         LIMIT 1) AS oficial_puntaje
    FROM quizzes_intentos qi
    LEFT JOIN estudiantes e ON e.id = qi.id_estudiante
    WHERE qi.id_quiz = ?
    GROUP BY qi.id_estudiante
    ORDER BY e.apellidos ASC, e.nombre ASC, qi.id_estudiante ASC
  `;
  const [rows] = await db.query(sql, [id_quiz]);
  return rows.map(r => ({
    id_estudiante: r.id_estudiante,
    nombre: r.nombre,
    apellidos: r.apellidos,
    grupo: r.grupo,
    folio: r.folio,
    total_intentos: Number(r.total_intentos || 0),
    oficial_puntaje: r.oficial_puntaje != null ? Number(r.oficial_puntaje) : null,
  }));
};
