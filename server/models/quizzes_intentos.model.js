import db from '../db.js';

export const getQuizById = async (id) => {
  try {
    const [rows] = await db.query('SELECT * FROM actividades WHERE id = ? AND tipo = "quiz" LIMIT 1', [id]);
    const row = rows[0] || null;
    return row || null;
  } catch (e) {
    // Fallback si la columna 'tipo' no existe en algunas instalaciones
    if (e?.code === 'ER_BAD_FIELD_ERROR' || e?.errno === 1054) {
      const [rows] = await db.query('SELECT * FROM actividades WHERE id = ? LIMIT 1', [id]);
      const row = rows[0] || null;
      return row || null;
    }
    throw e;
  }
};

export const updateQuizMeta = async (id, fields = {}) => {
  const allowed = ['titulo','descripcion','materia','id_area','fecha_limite','max_intentos','publicado','shuffle_questions','time_limit_min','passing_score','activo'];
  const sets = [];
  const vals = [];
  for (const k of allowed) {
    if (k in fields) { sets.push(`${k} = ?`); vals.push(fields[k]); }
  }
  if (!sets.length) return { affectedRows: 0 };
  vals.push(id);
  const [res] = await db.query(`UPDATE actividades SET ${sets.join(', ')} WHERE id = ? AND tipo = 'quiz'`, vals);
  return res;
};

export const listQuizzes = async ({ visible = true, id_area, materia } = {}) => {
  const baseClauses = ['a.tipo = "quiz"', 'a.activo = 1'];
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
        NULLIF(TRIM(CONCAT_WS(' ', u.nombre, u.apellidos)), ''),
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
  const [res] = await db.query(sql, [id_quiz, id_estudiante, puntaje, intent_number, tiempo_segundos || null, total_preguntas || null, correctas || null]);
  const [rows] = await db.query('SELECT * FROM quizzes_intentos WHERE id = ?', [res.insertId]);
  return rows[0];
};

export const resumenQuizzesEstudiante = async (id_estudiante) => {
  // Para cada quiz visible, mostrar último intento (puntaje), mejor puntaje y total intentos
  const [rows] = await db.query(`
    SELECT q.*, 
      (SELECT qi.puntaje FROM quizzes_intentos qi WHERE qi.id_quiz = q.id AND qi.id_estudiante = ? ORDER BY qi.id DESC LIMIT 1) AS ultimo_puntaje,
      (SELECT MAX(qi.puntaje) FROM quizzes_intentos qi WHERE qi.id_quiz = q.id AND qi.id_estudiante = ?) AS mejor_puntaje,
      (SELECT COUNT(*) FROM quizzes_intentos qi WHERE qi.id_quiz = q.id AND qi.id_estudiante = ?) AS total_intentos,
      (SELECT qi.puntaje FROM quizzes_intentos qi WHERE qi.id_quiz = q.id AND qi.id_estudiante = ? ORDER BY qi.id ASC LIMIT 1) AS oficial_puntaje
    FROM actividades q
    WHERE q.tipo = 'quiz' AND q.activo = 1
    ORDER BY q.fecha_limite ASC, q.id DESC
  `, [id_estudiante, id_estudiante, id_estudiante, id_estudiante]);
  return rows;
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
      -- Primer intento (puntaje oficial)
      (SELECT qi2.puntaje FROM quizzes_intentos qi2 
         WHERE qi2.id_quiz = qi.id_quiz AND qi2.id_estudiante = qi.id_estudiante 
         ORDER BY qi2.id ASC LIMIT 1) AS oficial_puntaje
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
