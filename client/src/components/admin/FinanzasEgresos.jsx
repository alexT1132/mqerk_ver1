import React, { useMemo, useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { Link } from 'react-router-dom';
import { listAllEgresos } from '../../service/finanzasEgresos.js';

export default function FinanzasEgresos() {
	const [rows, setRows] = useState([]);
	const [loading, setLoading] = useState(true);

	const formatCurrency = (n) => Number(n || 0).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });

	// Cargar datos al montar el componente
	useEffect(() => {
		const fetchEgresos = async () => {
			try {
				setLoading(true);
				const data = await listAllEgresos();
				setRows(data);
			} catch (error) {
				console.error('Error al cargar egresos:', error);
			} finally {
				setLoading(false);
			}
		};

		fetchEgresos();
	}, []);

	const totals = useMemo(() => {
		const now = dayjs();
		const todayStart = now.startOf('day');
		const todayEnd = now.endOf('day');
		const weekStart = todayStart.subtract(6, 'day');

		let all = 0, today = 0, week = 0, month = 0, year = 0;
		for (const r of rows) {
			if (String(r.estatus) !== 'Pagado') continue;
			const amt = Number(r.importe) || 0;
			const d = dayjs(r.fecha);
			all += amt;
			if (d.isSame(now, 'day')) today += amt;
			if ((d.isAfter(weekStart) || d.isSame(weekStart, 'day')) && (d.isBefore(todayEnd) || d.isSame(todayEnd, 'day'))) week += amt;
			if (d.isSame(now, 'month')) month += amt;
			if (d.isSame(now, 'year')) year += amt;
		}
		return { all, today, week, month, year };
	}, [rows]);

	return (
		<section className="px-4 sm:px-6 lg:px-10 pt-6 xs:pt-8 sm:pt-10 md:pt-12 pb-8 max-w-screen-2xl mx-auto">
			<header className="flex items-center justify-between gap-4 mb-6 flex-wrap">
				<div>
					<h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900">Egresos</h1>
					<p className="text-sm text-gray-500">Registra y controla los gastos operativos.</p>
				</div>
				<Link to="/administrativo/finanzas" className="inline-flex items-center text-indigo-600 hover:text-indigo-800 text-sm font-medium">Volver a Finanzas</Link>
			</header>

			{/* Accesos a sub-secciones removidos por redundancia: ya se elige desde la tarjeta principal */}

			{/* Tarjetas rápidas (sin mocks, toman totales reales) */}
			<div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
				<div className="bg-white/90 backdrop-blur rounded-3xl shadow-sm ring-1 ring-gray-100 p-4 sm:p-5">
					<p className="text-xs text-gray-500">Hoy</p>
					<p className="text-2xl font-semibold text-rose-600">{formatCurrency(totals.today)}</p>
				</div>
				<div className="bg-white/90 backdrop-blur rounded-3xl shadow-sm ring-1 ring-gray-100 p-4 sm:p-5">
					<p className="text-xs text-gray-500">Últimos 7 días</p>
					<p className="text-2xl font-semibold text-rose-600">{formatCurrency(totals.week)}</p>
				</div>
				<div className="bg-white/90 backdrop-blur rounded-3xl shadow-sm ring-1 ring-gray-100 p-4 sm:p-5">
					<p className="text-xs text-gray-500">Mes</p>
					<p className="text-2xl font-semibold text-rose-600">{formatCurrency(totals.month)}</p>
				</div>
				<div className="bg-white/90 backdrop-blur rounded-3xl shadow-sm ring-1 ring-gray-100 p-4 sm:p-5">
					<p className="text-xs text-gray-500">Año</p>
					<p className="text-2xl font-semibold text-rose-600">{formatCurrency(totals.year)}</p>
				</div>
			</div>

			{/* Tabla de egresos con el mismo estilo que Ingresos */}
			<div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
				<div className="p-6 border-b border-gray-200 flex items-center justify-between">
					<div>
						<h2 className="text-base sm:text-lg font-semibold text-gray-900">Registro de egresos</h2>
					</div>
					<div className="flex items-center gap-3">
						<div className="sm:hidden text-xs text-gray-600">Total: <span className="font-semibold text-gray-900">{formatCurrency(totals.all)}</span></div>
						<button className="px-3 py-1.5 text-sm rounded-lg bg-rose-600 text-white hover:bg-rose-700">Nuevo egreso</button>
					</div>
				</div>

				<div className="hidden sm:block">
					<div className="overflow-x-auto max-h-[60vh]">
						<table className="min-w-[980px] md:min-w-[1060px] xl:min-w-[1260px] w-full text-sm">
							<thead className="bg-gray-50/80 backdrop-blur text-gray-600 sticky top-0 z-10">
								<tr>
									<th className="text-left font-semibold px-4 py-3 border-r border-gray-200">#</th>
									<th className="text-left font-semibold px-4 py-3 border-r border-gray-200">Concepto</th>
									<th className="text-left font-semibold px-4 py-3 border-r border-gray-200">Fecha</th>
									<th className="text-left font-semibold px-4 py-3 border-r border-gray-200">Método</th>
									<th className="text-right font-semibold px-4 py-3 border-r border-gray-200">Importe</th>
									<th className="text-left font-semibold px-4 py-3 border-r border-gray-200">Estatus</th>
									<th className="text-left font-semibold px-4 py-3">Descripción</th>
								</tr>
							</thead>
							<tbody>
								{loading ? (
									<tr className="border-b border-gray-200">
										<td colSpan={7} className="px-4 py-6 text-center text-gray-500">Cargando egresos...</td>
									</tr>
								) : rows.length === 0 ? (
									<tr className="border-b border-gray-200">
										<td colSpan={7} className="px-4 py-6 text-center text-gray-500">No hay egresos.</td>
									</tr>
								) : (
									rows.map((r, idx) => (
										<tr key={idx} className="border-b border-gray-200 hover:bg-gray-50/50 cursor-pointer">
											<td className="px-4 py-3 text-gray-500 border-r border-gray-100">{idx + 1}</td>
											<td className="px-4 py-3 text-gray-900 font-medium max-w-[260px] truncate border-r border-gray-100">{r.concepto}</td>
											<td className="px-4 py-3 text-gray-700 border-r border-gray-100">{r.fecha}</td>
											<td className="px-4 py-3 text-gray-700 border-r border-gray-100">{String(r.metodo || '').toLowerCase()}</td>
											<td className="px-4 py-3 text-right border-r border-gray-100">
												<span className="inline-flex items-center px-2 py-0.5 rounded-md bg-rose-50 text-rose-600 font-semibold">{formatCurrency(r.importe)}</span>
											</td>
											<td className="px-4 py-3 text-gray-700 border-r border-gray-100">{r.estatus || '-'}</td>
											<td className="px-4 py-3 text-gray-700 max-w-[320px] truncate" title={r.descripcion}>{r.descripcion || '-'}</td>
										</tr>
									))
								)}
							</tbody>
						</table>
					</div>
				</div>

				{/* Vista móvil con cards */}
				<div className="sm:hidden p-4 space-y-3">
					{loading ? (
						<div className="text-sm text-gray-500">Cargando egresos...</div>
					) : rows.length === 0 ? (
						<div className="text-sm text-gray-500">No hay egresos.</div>
					) : (
						rows.map((r, idx) => (
							<div key={idx} className="rounded-xl border border-gray-200 bg-white shadow-sm p-4">
								<div className="flex items-start justify-between mb-2">
									<div className="text-sm font-semibold text-gray-900 truncate pr-2">{idx + 1}. {r.concepto}</div>
									<span className="text-xs text-gray-500">{r.fecha}</span>
								</div>
								<div className="grid grid-cols-2 gap-2 text-[11px] text-gray-600 mb-2">
									<div className="flex items-center gap-1"><span className="text-gray-500">Método:</span><span className="font-medium text-gray-800">{String(r.metodo || '').toLowerCase()}</span></div>
									<div className="flex items-center justify-end gap-1 col-span-2">
										<span className="text-gray-500">Importe</span>
										<span className="text-sm font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">{formatCurrency(r.importe)}</span>
									</div>
								</div>
								{r.descripcion ? (
									<div className="text-[11px] text-gray-600 truncate"><span className="text-gray-500">Descripción:</span> <span className="text-gray-800" title={r.descripcion}>{r.descripcion}</span></div>
								) : null}
							</div>
						))
					)}
				</div>
			</div>
		</section>
	);
}
