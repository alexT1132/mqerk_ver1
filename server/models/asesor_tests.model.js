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
    const sql = `UPDATE asesor_tests SET bigfive_total=?, dass21_total=?, zavic_total=?, baron_total=?, wais_total=?, academica_total=? WHERE id=?`;
    await db.query(sql, [...totalVals, id]);
    return { id, preregistro_id: preregistroId, ...data };
  } else {
    const sql = `INSERT INTO asesor_tests (preregistro_id, bigfive_total, dass21_total, zavic_total, baron_total, wais_total, academica_total)
      VALUES (?,?,?,?,?,?,?)`;
    const [result] = await db.query(sql, [preregistroId, ...totalVals]);
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
    preregistro_id, scenario_type, version, bigfive_total, dass21_total, zavic_total, baron_total, wais_total, academica_total,
    bigfive_respuestas, dass21_respuestas, zavic_respuestas, baron_respuestas, wais_respuestas, academica_respuestas,
    dass21_subescalas, bigfive_dimensiones
  ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
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
    jf(data.bigfive_respuestas),
    jf(data.dass21_respuestas),
    jf(data.zavic_respuestas),
    jf(data.baron_respuestas),
    jf(data.wais_respuestas),
    jf(data.academica_respuestas),
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
