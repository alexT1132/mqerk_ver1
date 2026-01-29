import React from 'react';
import { ClickableCard } from './ui.jsx';

const ProgressBar = ({ value = 0, colorClassName = 'bg-blue-600' }) => {
  const pct = Number.isFinite(Number(value)) ? Math.min(100, Math.max(0, Number(value))) : 0;
  return (
    <div className="w-full h-2 rounded-full bg-slate-100 border border-slate-200 overflow-hidden">
      <div className={`h-full ${colorClassName}`} style={{ width: `${pct}%` }} />
    </div>
  );
};

const MetricCard = ({ icon, label, value, sub, progress, progressColor, onClick, ariaLabel }) => {
  const card = (
    <div className="rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-4 sm:p-5 h-full">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-700 shrink-0">
            {icon}
          </div>
          <div className="min-w-0">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide truncate">{label}</div>
            <div className="text-2xl font-black text-slate-900 leading-tight">{value}</div>
          </div>
        </div>
      </div>

      {sub ? <div className="mt-2 text-sm text-slate-600">{sub}</div> : null}
      {progress != null ? (
        <div className="mt-3">
          <ProgressBar value={progress} colorClassName={progressColor} />
        </div>
      ) : null}
    </div>
  );

  if (typeof onClick === 'function') {
    return (
      <ClickableCard ariaLabel={ariaLabel || label} onClick={onClick}>
        {card}
      </ClickableCard>
    );
  }

  return card;
};

export const MonthlyStatusSection = ({ finalMetricsData, onOpenMonthlyAverage }) => {
  const attendance = finalMetricsData?.attendance ?? null;
  const attendanceData = finalMetricsData?.attendanceData;
  const totalDays = attendanceData?.total ?? null;
  const attendedDays = attendanceData?.asistidas ?? null;

  let attendanceSub = 'Sin datos';
  if (attendance != null) {
    if (totalDays != null && attendedDays != null) {
      attendanceSub = `${attendedDays} de ${totalDays} días`;
    } else {
      const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
      const displayDays = Math.round((attendance / 100) * daysInMonth);
      attendanceSub = `${displayDays} de ${daysInMonth} días`;
    }
  }

  const actCurrent = finalMetricsData?.activities?.current ?? 0;
  const actTotal = finalMetricsData?.activities?.total ?? 0;
  const actPct = actTotal > 0 ? Math.round((actCurrent / actTotal) * 100) : 0;

  const quizCurrent = finalMetricsData?.quiz?.current ?? 0;
  const quizTotal = finalMetricsData?.quiz?.total ?? 0;
  const quizPct = quizTotal > 0 ? Math.round((quizCurrent / quizTotal) * 100) : 0;

  const monthlyAverage = finalMetricsData?.monthlyAverage ?? 0;
  const hasMonthlyData = Array.isArray(finalMetricsData?.monthlyAverageData) &&
    finalMetricsData.monthlyAverageData.length > 0 &&
    finalMetricsData.monthlyAverageData.some(item => (item?.promedio || 0) > 0);

  const status = finalMetricsData?.academicStatus;
  const statusLabel = status?.description || '—';
  const statusPct = status?.score != null ? Math.round(status.score) : null;
  const statusTone =
    status?.level === 'R' ? { chip: 'bg-red-50 border-red-200 text-red-700', bar: 'bg-red-600' } :
      status?.level === 'A' ? { chip: 'bg-amber-50 border-amber-200 text-amber-800', bar: 'bg-amber-500' } :
        { chip: 'bg-emerald-50 border-emerald-200 text-emerald-800', bar: 'bg-emerald-600' };

  return (
    <section className="mt-8 mb-10">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-slate-900">Resumen del mes</h2>
          <p className="text-sm text-slate-600">Métricas principales del curso</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard
          label="Asistencia"
          value={attendance == null ? '—' : `${Math.round(attendance)}%`}
          sub={attendanceSub}
          progress={attendance == null ? null : attendance}
          progressColor="bg-blue-600"
          icon={(
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7 11h5v5H7v-5zm12-8h-1V1h-2v2H8V1H6v2H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zm0 16H5V8h14v11z" />
            </svg>
          )}
        />

        <MetricCard
          label="Actividades"
          value={actTotal > 0 ? `${actCurrent}/${actTotal}` : '0/0'}
          sub={actTotal > 0 ? `${actPct}% completadas` : 'Sin actividades'}
          progress={actTotal > 0 ? actPct : null}
          progressColor="bg-orange-500"
          icon={(
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          )}
        />

        <MetricCard
          label="Quizzes"
          value={quizTotal > 0 ? `${quizPct}%` : '—'}
          sub={quizTotal > 0 ? `${quizCurrent} de ${quizTotal} aprobados` : 'Sin quizzes'}
          progress={quizTotal > 0 ? quizPct : null}
          progressColor="bg-emerald-600"
          icon={(
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
          )}
        />

        <MetricCard
          label="Promedio"
          value={monthlyAverage > 0 ? `${Math.round(monthlyAverage)}%` : '—'}
          sub={hasMonthlyData ? 'Clic para ver detalle' : 'Sin historial'}
          progress={hasMonthlyData ? monthlyAverage : null}
          progressColor="bg-indigo-600"
          onClick={hasMonthlyData ? onOpenMonthlyAverage : undefined}
          ariaLabel="Abrir evolución del promedio mensual"
          icon={(
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16 6l2.3 2.3-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z" />
            </svg>
          )}
        />

        <div className="rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-4 sm:p-5 h-full">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Estado académico</div>
              <div className="mt-1 flex items-center gap-2">
                <span className={`px-2 py-1 rounded-full text-xs font-bold border ${statusTone.chip}`}>
                  {status?.level || '—'}
                </span>
                <span className="text-sm font-semibold text-slate-700 truncate">{statusLabel}</span>
              </div>
              <div className="mt-2 text-sm text-slate-600">
                {statusPct == null ? '—' : `Puntaje: ${statusPct}%`}
              </div>
            </div>
          </div>
          {statusPct != null ? (
            <div className="mt-3">
              <ProgressBar value={statusPct} colorClassName={statusTone.bar} />
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
};

