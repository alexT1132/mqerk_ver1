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
		<section className="px-2 xs:px-3 sm:px-6 lg:px-6 xl:px-8 pt-6 xs:pt-8 sm:pt-10 md:pt-12 pb-8 max-w-screen-2xl 2xl:max-w-none mx-auto w-full">
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

			{/* Tabla de egresos: hasta 1920px table-fixed para llenar ancho (monitores chicos) */}
			<div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden w-full">
				<div className="p-3 xs:p-4 sm:p-6 border-b border-gray-200 flex items-center justify-between">
					<div>
						<h2 className="text-base sm:text-lg font-semibold text-gray-900">Registro de egresos</h2>
					</div>
					<div className="flex items-center gap-3">
						<div className="sm:hidden text-xs text-gray-600">Total: <span className="font-semibold text-gray-900">{formatCurrency(totals.all)}</span></div>
						<button className="px-3 py-1.5 text-sm rounded-lg bg-rose-600 text-white hover:bg-rose-700">Nuevo egreso</button>
					</div>
				</div>

				<div className="w-full">
					<div className="overflow-x-auto max-h-[60vh] w-full -mx-2 xs:-mx-3 sm:mx-0 px-2 xs:px-3 sm:px-0">
						<table className="w-full min-w-[720px] min-[1920px]:min-w-[1260px] text-sm table-fixed min-[1920px]:table-auto">
							<thead className="bg-gray-50/80 backdrop-blur text-gray-600 sticky top-0 z-10">
								<tr>
									<th className="text-left font-semibold px-4 py-3 border-r border-gray-200 w-[5%] min-[1920px]:w-auto">#</th>
									<th className="text-left font-semibold px-4 py-3 border-r border-gray-200 w-[22%] min-[1920px]:w-auto">Concepto</th>
									<th className="text-left font-semibold px-4 py-3 border-r border-gray-200 w-[12%] min-[1920px]:w-auto">Fecha</th>
									<th className="text-left font-semibold px-4 py-3 border-r border-gray-200 w-[12%] min-[1920px]:w-auto">Método</th>
									<th className="text-right font-semibold px-4 py-3 border-r border-gray-200 w-[12%] min-[1920px]:w-auto">Importe</th>
									<th className="text-left font-semibold px-4 py-3 border-r border-gray-200 w-[12%] min-[1920px]:w-auto">Estatus</th>
									<th className="text-left font-semibold px-4 py-3 w-[25%] min-[1920px]:w-auto">Descripción</th>
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

			</div>
		</section>
	);
}
