import db from '../db.js';

let __initialized = false;
async function ensureTable() {
	if (__initialized) return;
	const sql = `CREATE TABLE IF NOT EXISTS gastos_fijos_plantillas (
		id INT AUTO_INCREMENT PRIMARY KEY,
		categoria VARCHAR(120) NOT NULL,
		descripcion VARCHAR(255) NULL,
		proveedor VARCHAR(120) NULL,
		frecuencia ENUM('Diario','Semanal','Quincenal','Mensual','Bimestral','Semestral','Anual') NOT NULL DEFAULT 'Mensual',
		metodo ENUM('Efectivo','Transferencia','Tarjeta') NOT NULL DEFAULT 'Efectivo',
		monto_sugerido DECIMAL(12,2) NOT NULL DEFAULT 0,
		dia_pago TINYINT NULL,
		hora_preferida TIME NULL,
		recordar_minutos INT NOT NULL DEFAULT 30,
		auto_evento TINYINT(1) NOT NULL DEFAULT 1,
		auto_instanciar TINYINT(1) NOT NULL DEFAULT 1,
		fecha_inicio DATE NULL,
		cadencia_anchor DATE NULL,
		activo TINYINT(1) NOT NULL DEFAULT 1,
		last_used_at DATETIME NULL,
		created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
		updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
	) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`;
	await db.query(sql);
		// Ensure required columns exist (idempotent)
		try {
			const [cols] = await db.query(
				"SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'gastos_fijos_plantillas'"
			);
			const have = new Set(cols.map(c => c.COLUMN_NAME));
			const alters = [];
			if (!have.has('metodo')) {
				alters.push("ADD COLUMN metodo ENUM('Efectivo','Transferencia','Tarjeta') NOT NULL DEFAULT 'Efectivo'");
			}
			if (!have.has('frecuencia')) {
				alters.push("ADD COLUMN frecuencia ENUM('Diario','Semanal','Quincenal','Mensual','Bimestral','Semestral','Anual') NOT NULL DEFAULT 'Mensual'");
			} else {
				// Ensure enum includes Bimestral; rebuild column if needed
				try { await db.query("ALTER TABLE gastos_fijos_plantillas MODIFY COLUMN frecuencia ENUM('Diario','Semanal','Quincenal','Mensual','Bimestral','Semestral','Anual') NOT NULL DEFAULT 'Mensual'"); } catch (e) {}
			}
			if (!have.has('monto_sugerido')) {
				alters.push("ADD COLUMN monto_sugerido DECIMAL(12,2) NOT NULL DEFAULT 0");
			}
			if (!have.has('dia_pago')) {
				alters.push("ADD COLUMN dia_pago TINYINT NULL");
			}
			if (!have.has('hora_preferida')) {
				alters.push("ADD COLUMN hora_preferida TIME NULL");
			}
			if (!have.has('recordar_minutos')) {
				alters.push("ADD COLUMN recordar_minutos INT NOT NULL DEFAULT 30");
			}
			if (!have.has('auto_evento')) {
				alters.push("ADD COLUMN auto_evento TINYINT(1) NOT NULL DEFAULT 1");
			}
			if (!have.has('auto_instanciar')) {
				alters.push("ADD COLUMN auto_instanciar TINYINT(1) NOT NULL DEFAULT 1");
			}
			if (!have.has('fecha_inicio')) {
				alters.push("ADD COLUMN fecha_inicio DATE NULL");
			}
			if (!have.has('cadencia_anchor')) {
				alters.push("ADD COLUMN cadencia_anchor DATE NULL");
			}
			if (!have.has('activo')) {
				alters.push("ADD COLUMN activo TINYINT(1) NOT NULL DEFAULT 1");
			}
			if (!have.has('last_used_at')) {
				alters.push("ADD COLUMN last_used_at DATETIME NULL");
			}
			if (alters.length) {
				await db.query(`ALTER TABLE gastos_fijos_plantillas ${alters.join(', ')}`);
			}
		} catch (e) {
			console.warn('ensureTable (plantillas) columns check failed:', e?.message || e);
		}
	__initialized = true;
}

export async function list({ activo } = {}) {
	await ensureTable();
	const where = [];
	const params = [];
	if (activo !== undefined) { where.push('activo = ?'); params.push(activo ? 1 : 0); }
	const sql = `SELECT * FROM gastos_fijos_plantillas ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY categoria ASC, id DESC`;
	const [rows] = await db.query(sql, params);
	return rows;
}

export async function create(data = {}) {
	await ensureTable();
	const { categoria, descripcion=null, proveedor=null, frecuencia='Mensual', metodo='Efectivo', monto_sugerido=0, dia_pago=null, hora_preferida=null, recordar_minutos=30, auto_evento=1, auto_instanciar=1, fecha_inicio=null, cadencia_anchor=null, activo=1 } = data;
	const sql = `INSERT INTO gastos_fijos_plantillas (categoria, descripcion, proveedor, frecuencia, metodo, monto_sugerido, dia_pago, hora_preferida, recordar_minutos, auto_evento, auto_instanciar, fecha_inicio, cadencia_anchor, activo)
						 VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
	const params = [categoria, descripcion, proveedor, frecuencia, metodo, Number(monto_sugerido||0), dia_pago ?? null, hora_preferida || null, Number.isInteger(recordar_minutos)?recordar_minutos:30, auto_evento?1:0, auto_instanciar?1:0, fecha_inicio || null, cadencia_anchor || null, activo?1:0];
	const [res] = await db.query(sql, params);
	const [rows] = await db.query('SELECT * FROM gastos_fijos_plantillas WHERE id=? LIMIT 1', [res.insertId]);
	return rows[0];
}

export async function getById(id) {
	await ensureTable();
	const [rows] = await db.query('SELECT * FROM gastos_fijos_plantillas WHERE id = ? LIMIT 1', [id]);
	return rows[0] || null;
}

export async function update(id, updates = {}) {
	await ensureTable();
	const allowed = ['categoria','descripcion','proveedor','frecuencia','metodo','monto_sugerido','dia_pago','hora_preferida','recordar_minutos','auto_evento','auto_instanciar','fecha_inicio','cadencia_anchor','activo','last_used_at'];
	const fields = [];
	const values = [];
	for (const k of allowed) {
		if (Object.prototype.hasOwnProperty.call(updates, k)) { fields.push(`${k} = ?`); values.push(updates[k]); }
	}
	if (!fields.length) return null;
	values.push(id);
	await db.query(`UPDATE gastos_fijos_plantillas SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id=?`, values);
	const [rows] = await db.query('SELECT * FROM gastos_fijos_plantillas WHERE id = ? LIMIT 1', [id]);
	return rows[0] || null;
}

export async function remove(id) {
	await ensureTable();
	const [res] = await db.query('DELETE FROM gastos_fijos_plantillas WHERE id = ?', [id]);
	return res.affectedRows > 0;
}

// Helper: crear un gasto_fijo tomando datos de una plantilla (sin automatizar su pago)
export async function instantiateToGastoFijo(plantillaId, { fecha, hora=null, estatus='Pendiente' } = {}) {
	await ensureTable();
	const [rows] = await db.query('SELECT * FROM gastos_fijos_plantillas WHERE id=? LIMIT 1', [plantillaId]);
	const tpl = rows[0];
	if (!tpl) return null;

	// Si no viene fecha y la plantilla tiene dia_pago, calcular próxima fecha según frecuencia
	if (!fecha && tpl.dia_pago) {
		const todayBase = new Date();
		// Respetar fecha_inicio: si existe y es posterior a hoy, empezar a calcular desde esa fecha
		const startDate = tpl.fecha_inicio ? new Date(tpl.fecha_inicio) : null;
		const today = startDate && startDate > todayBase ? startDate : todayBase;
		const anchor = tpl.cadencia_anchor ? new Date(tpl.cadencia_anchor) : (tpl.created_at ? new Date(tpl.created_at) : new Date(today.getFullYear(), today.getMonth(), 1));
		const desiredDay = Number(tpl.dia_pago);
		const freq = String(tpl.frecuencia || 'Mensual');
		let candidate = new Date(today.getFullYear(), today.getMonth(), Math.min(desiredDay, daysInMonth(today.getFullYear(), today.getMonth())));
		if (candidate < new Date(today.getFullYear(), today.getMonth(), today.getDate())) {
			candidate = addMonthsClamped(today.getFullYear(), today.getMonth(), 1, desiredDay);
		}
		const stepBy = (f) => (f==='Bimestral'?2: f==='Semestral'?6: f==='Anual'?12: 1);
		const step = stepBy(freq);
		// Ajustar al siguiente mes que respete la cadencia desde el anchor
		let tries = 0;
		while (tries < 24) { // máximo 2 años de búsqueda preventivamente
			const monthsDiff = (candidate.getFullYear() - anchor.getFullYear())*12 + (candidate.getMonth() - anchor.getMonth());
			if (monthsDiff % step === 0) break;
			candidate = addMonthsClamped(candidate.getFullYear(), candidate.getMonth(), 1, desiredDay);
			tries++;
		}
		fecha = candidate.toISOString().slice(0,10);
	}

	// Si aún no hay fecha (plantilla sin dia_pago y no vino en request), usar hoy
	if (!fecha) {
		const d = new Date();
		const iso = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())).toISOString();
		fecha = iso.slice(0,10);
	}

	// Si no hay hora, usar la hora_preferida de la plantilla
	if (!hora && tpl.hora_preferida) {
		hora = tpl.hora_preferida;
	}
	const payload = {
		fecha,
		hora,
		categoria: tpl.categoria,
		descripcion: tpl.descripcion,
		proveedor: tpl.proveedor,
		frecuencia: tpl.frecuencia,
		metodo: tpl.metodo,
		importe: Number(tpl.monto_sugerido||0),
		estatus,
		plantilla_id: tpl.id,
	};
	await db.query('UPDATE gastos_fijos_plantillas SET last_used_at = CURRENT_TIMESTAMP WHERE id = ?', [plantillaId]);
	return payload;
}

// Helpers internos
function daysInMonth(year, monthIndex0) {
    return new Date(year, monthIndex0 + 1, 0).getDate();
}
function addMonthsClamped(year, monthIndex0, add, day) {
    const y = year + Math.floor((monthIndex0 + add) / 12);
    const m = (monthIndex0 + add) % 12;
    const d = Math.min(day, daysInMonth(y, m));
    return new Date(y, m, d);
}

