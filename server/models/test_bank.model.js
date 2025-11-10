import db from '../db.js';

export const createQuestion = async ({ test_type, prompt, points = 10, options }) => {
  const [r] = await db.query('INSERT INTO test_questions (test_type, prompt, points) VALUES (?,?,?)', [test_type, prompt, points]);
  const qid = r.insertId;
  if (Array.isArray(options) && options.length) {
    for (const opt of options) {
      await db.query('INSERT INTO test_options (question_id, text, is_correct) VALUES (?,?,?)', [qid, opt.text, opt.is_correct ? 1 : 0]);
    }
  }
  return qid;
};

export const getActiveQuestions = async (test_type) => {
  const [rows] = await db.query('SELECT * FROM test_questions WHERE active=1 AND test_type=?', [test_type]);
  return rows;
};

export const getOptionsForQuestions = async (ids) => {
  if (!ids.length) return [];
  const [rows] = await db.query(`SELECT * FROM test_options WHERE question_id IN (${ids.map(()=>'?').join(',')})`, ids);
  return rows;
};

export const createFormInstance = async ({ preregistro_id, test_type, question_ids }) => {
  const [r] = await db.query('INSERT INTO asesor_test_forms (preregistro_id, test_type, question_ids) VALUES (?,?,?)', [preregistro_id, test_type, JSON.stringify(question_ids)]);
  return { id: r.insertId, preregistro_id, test_type, question_ids };
};

export const getLastFormInstance = async ({ preregistro_id, test_type }) => {
  const [rows] = await db.query('SELECT * FROM asesor_test_forms WHERE preregistro_id=? AND test_type=? ORDER BY id DESC LIMIT 1', [preregistro_id, test_type]);
  return rows[0] || null;
};

export const gradeAnswers = async ({ entries }) => {
  // entries: [{question_id, selected_option_id}]
  if (!Array.isArray(entries) || !entries.length) return { score: 0 };
  const qids = [...new Set(entries.map(e=> e.question_id))];
  const [qrows] = await db.query(`SELECT id, points FROM test_questions WHERE id IN (${qids.map(()=>'?').join(',')})`, qids);
  const pointsMap = Object.fromEntries(qrows.map(r=> [r.id, r.points]));
  const oids = entries.map(e=> e.selected_option_id).filter(Boolean);
  if (!oids.length) return { score: 0 };
  const [orows] = await db.query(`SELECT id, question_id, is_correct FROM test_options WHERE id IN (${oids.map(()=>'?').join(',')})`, oids);
  const correctSet = new Set(orows.filter(r=> r.is_correct).map(r=> r.id));
  let score = 0;
  for (const e of entries) {
    if (correctSet.has(e.selected_option_id)) {
      score += (pointsMap[e.question_id] || 0);
    }
  }
  return { score };
};
