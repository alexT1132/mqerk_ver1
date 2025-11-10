import db from '../db.js';

// Upsert principal (mantiene última versión en asesor_tests)
export const createOrUpdateByPreRegistro = async (preregistroId, data) => {
  // Tabla principal: solo totales (ligera). El detalle completo queda en history.
  const [rows] = await db.query('SELECT id FROM asesor_tests WHERE preregistro_id = ? LIMIT 1', [preregistroId]);
  const totalVals = [
    data.bigfive_total,
    data.dass21_total,
    data.zavic_total,
    data.baron_total,
    data.wais_total,
    data.academica_total
  ];
  if (rows.length) {
    const id = rows[0].id;
    // Permitir actualización incremental de campos; si vienen undefined, mantener valor existente
    const [curRows] = await db.query('SELECT * FROM asesor_tests WHERE id=? LIMIT 1', [id]);
    const cur = curRows[0] || {};
    const vals = {
      bigfive_total: data.bigfive_total ?? cur.bigfive_total ?? null,
      dass21_total: data.dass21_total ?? cur.dass21_total ?? null,
      zavic_total: data.zavic_total ?? cur.zavic_total ?? null,
      baron_total: data.baron_total ?? cur.baron_total ?? null,
      wais_total: data.wais_total ?? cur.wais_total ?? null,
      academica_total: data.academica_total ?? cur.academica_total ?? null,
      matematica_total: data.matematica_total ?? cur.matematica_total ?? null
    };
    const sql = `UPDATE asesor_tests SET bigfive_total=?, dass21_total=?, zavic_total=?, baron_total=?, wais_total=?, academica_total=?, matematica_total=? WHERE id=?`;
    await db.query(sql, [vals.bigfive_total, vals.dass21_total, vals.zavic_total, vals.baron_total, vals.wais_total, vals.academica_total, vals.matematica_total, id]);
    return { id, preregistro_id: preregistroId, ...data };
  } else {
    const sql = `INSERT INTO asesor_tests (preregistro_id, bigfive_total, dass21_total, zavic_total, baron_total, wais_total, academica_total, matematica_total)
      VALUES (?,?,?,?,?,?,?,?)`;
    const [result] = await db.query(sql, [preregistroId, data.bigfive_total ?? null, data.dass21_total ?? null, data.zavic_total ?? null, data.baron_total ?? null, data.wais_total ?? null, data.academica_total ?? null, data.matematica_total ?? null]);
    return { id: result.insertId, preregistro_id: preregistroId, ...data };
  }
};

export const getByPreRegistro = async (preregistroId) => {
  const [rows] = await db.query('SELECT * FROM asesor_tests WHERE preregistro_id = ? LIMIT 1', [preregistroId]);
  return rows[0] || null;
};

// Historial: insertar fila en asesor_tests_history con número de versión incremental
export const addHistoryEntry = async (preregistroId, data) => {
  const [vrows] = await db.query('SELECT MAX(version) as maxv FROM asesor_tests_history WHERE preregistro_id = ?', [preregistroId]);
  const nextVersion = (vrows[0]?.maxv || 0) + 1;
  const jf = (v)=> v == null ? null : JSON.stringify(v);
  const sql = `INSERT INTO asesor_tests_history (
    preregistro_id, scenario_type, version, bigfive_total, dass21_total, zavic_total, baron_total, wais_total, academica_total, matematica_total,
    bigfive_respuestas, dass21_respuestas, zavic_respuestas, baron_respuestas, wais_respuestas, academica_respuestas, matematica_respuestas,
    dass21_subescalas, bigfive_dimensiones
  ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
  const vals = [
    preregistroId,
    data.scenario_type || null,
    nextVersion,
    data.bigfive_total,
    data.dass21_total,
    data.zavic_total,
    data.baron_total,
    data.wais_total,
    data.academica_total,
    data.matematica_total,
    jf(data.bigfive_respuestas),
    jf(data.dass21_respuestas),
    jf(data.zavic_respuestas),
    jf(data.baron_respuestas),
    jf(data.wais_respuestas),
    jf(data.academica_respuestas),
    jf(data.matematica_respuestas),
    jf(data.dass21_subescalas),
    jf(data.bigfive_dimensiones)
  ];
  const [result] = await db.query(sql, vals);
  return { id: result.insertId, preregistro_id: preregistroId, version: nextVersion, ...data };
};

export const listHistoryByPreRegistro = async (preregistroId) => {
  const [rows] = await db.query('SELECT * FROM asesor_tests_history WHERE preregistro_id = ? ORDER BY version ASC', [preregistroId]);
  return rows;
};
