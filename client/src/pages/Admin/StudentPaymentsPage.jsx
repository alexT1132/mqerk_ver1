import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ComprobanteVirtual from '../../components/shared/ComprobanteVirtual.jsx';
import studentService from '../../service/studentService.js';
import { resolvePlanType as resolvePlanTypeShared, getActivationDate as getActivationDateShared, generatePaymentSchedule as genScheduleShared, computeOverdueState } from '../../utils/payments.js';

// Admin view: Student payments table + upcoming payments + virtual receipt
export default function StudentPaymentsPage() {
  const { folio } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showRecibo, setShowRecibo] = useState(false);
  const [paymentForRecibo, setPaymentForRecibo] = useState(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true); setError(null);
      try {
        const res = await studentService.getStudent(folio);
        if (!active) return;
        if (res?.success && res?.data) {
          setStudent(res.data);
        } else {
          setError(res?.message || 'No se pudo cargar el estudiante');
        }
      } catch (e) {
        setError('Error de conexión');
      } finally {
        if (active) setLoading(false);
      }
    };
    if (folio) load();
    return () => { active = false; };
  }, [folio]);

  // Resolver plan con múltiples fuentes (igual que MisPagos pero más tolerante)
  const planType = useMemo(() => {
    const raw = student?.plan || student?.plan_type || student?.rawExtras?.plan || student?.selectedPlan;
    return resolvePlanTypeShared(raw);
  }, [student?.plan, student?.plan_type, student?.rawExtras?.plan, student?.selectedPlan]);
  const activationDate = useMemo(() => getActivationDateShared(student), [student?.folio, student?.id, student?.created_at]);

  // Config del plan para chips y totales
  const planConfig = useMemo(() => {
    const type = (planType || 'mensual').toString().toLowerCase();
    const totalPayments = type === 'premium' ? 1 : (type === 'start' ? 2 : 8);
    const paymentAmount = type === 'premium' ? 10500 : (type === 'start' ? 5500 : 1500);
    const totalAmount = type === 'premium' ? 10500 : (type === 'start' ? 11000 : 1500 * 8);
    const name = type === 'premium' ? 'Plan Premium' : (type === 'start' ? 'Plan Start' : 'Plan Mensual');
    const frequency = type === 'premium' ? 'pago único' : (type === 'start' ? 'por exhibición' : 'mensual');
    return { type, totalPayments, paymentAmount, totalAmount, name, frequency };
  }, [planType]);

  // Build schedule using shared generator, adding display fields
  const schedule = useMemo(() => {
    if (!activationDate) return [];
    const { type, totalPayments, paymentAmount } = planConfig;
    const shared = genScheduleShared({ startDate: activationDate, planType: type, now: new Date() }).slice(0, totalPayments);
    return shared.map((p, idx) => {
      const paymentDate = new Date(activationDate);
      if (type === 'start') {
        paymentDate.setMonth(paymentDate.getMonth() + (idx === 0 ? 0 : 4));
      } else {
        paymentDate.setMonth(paymentDate.getMonth() + idx);
      }
      const status = p.status;
      const verificationDate = status === 'paid' ? paymentDate : null;
      return {
        id: idx + 1,
        paymentNumber: idx + 1,
        amount: p.amount ?? paymentAmount,
        paymentDate,
        dueDate: p.dueDate,
        status,
        isOverdue: p.isOverdue,
        verificationDate,
        month: paymentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
      };
    });
  }, [activationDate, planConfig]);

  const nextPayment = useMemo(() => schedule.find(p => p.status !== 'paid') || null, [schedule]);

  // Estado de bloqueo por vencimiento (usa util compartida)
  const overdueState = useMemo(() => computeOverdueState({ alumno: student, now: new Date() }), [student]);
  const isLocked = overdueState?.isOverdueLocked;
  const daysLocked = overdueState?.overdueDays || 0;

  // Detección de ventana de tolerancia (vencido pero aún dentro de 3 días)
  const now = new Date();
  const toleranceDays = (planConfig.type === 'mensual' || planConfig.type === 'start') ? 3 : 0;
  const withinTolerancePayment = useMemo(() => {
    if (!toleranceDays) return null;
    // Buscar el primer pago que esté pasado de su dueDate pero aún no marcado como overdue
    const candidate = schedule.find(p => p.status === 'pending' && now > p.dueDate);
    if (!candidate) return null;
    const dueWithTolerance = new Date(candidate.dueDate);
    dueWithTolerance.setDate(dueWithTolerance.getDate() + toleranceDays);
    if (now <= dueWithTolerance) return candidate;
    return null;
  }, [schedule, toleranceDays]);
  const daysPastDue = withinTolerancePayment ? Math.max(0, Math.ceil((now.getTime() - withinTolerancePayment.dueDate.getTime()) / (1000 * 60 * 60 * 24))) : 0;
  const daysToBlock = withinTolerancePayment ? Math.max(0, toleranceDays - daysPastDue) : 0;

  const handleViewReceipt = (payment) => {
    if (!payment) return;
    const baseAmount = payment.amount;
    const penalty = payment.isOverdue ? Math.round(baseAmount * 0.05) : 0;
    const total = baseAmount + penalty;
    const paymentData = {
      id: payment.paymentNumber,
      paymentNumber: payment.paymentNumber,
      date: payment.paymentDate?.toISOString?.() || new Date().toISOString(),
      amount: total,
      baseAmount,
      discount: 0,
      penalty,
      method: payment.status === 'paid' ? 'Efectivo' : '—',
      status: payment.status,
      plan: `${(planType || 'mensual').toString().toUpperCase()} - Pago ${payment.paymentNumber}`,
      planType: planType || 'mensual',
      cashReceived: total,
      transactionId: `TXN-${student?.folio || 'MQ'}`,
      verificationDate: payment.verificationDate ? payment.verificationDate.toISOString() : null,
    };
    setPaymentForRecibo(paymentData);
    setShowRecibo(true);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-6 sm:p-8 border-2 border-slate-200 text-center">
          <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-slate-600 mx-auto mb-4"></div>
          <p className="text-slate-700 font-semibold text-sm sm:text-base">Cargando pagos del estudiante…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-6 sm:p-8 border-2 border-red-300 text-center">
          <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-4 border-2 border-red-300">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-red-700 font-extrabold text-sm sm:text-base">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-6 sm:pt-8 pb-4 sm:pb-6 px-3 sm:px-4 md:px-6">
      <div className="max-w-6xl xl:max-w-screen-2xl 2xl:max-w-[1700px] mx-auto space-y-5 sm:space-y-6">
        {/* Header mejorado con fondo destacado */}
        <div className="bg-gradient-to-r from-slate-50 via-gray-50 to-slate-50 rounded-xl sm:rounded-2xl border-2 border-slate-200 shadow-lg p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
              <button
                onClick={() => {
                  const canGoBack = window.history.length > 2;
                  if (canGoBack) navigate(-1); else navigate('/administrativo/lista-alumnos');
                }}
                className="flex items-center px-3 py-2 text-slate-700 hover:text-slate-900 hover:bg-white rounded-lg transition-all duration-200 self-start border border-slate-200 hover:border-slate-300 shadow-sm font-medium"
                title="Regresar a la lista de alumnos"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Regresar
              </button>
              <div className="hidden sm:block h-8 w-px bg-slate-300"></div>
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 mb-2">
                  Pagos del Estudiante
                </h1>
                <p className="text-sm sm:text-base font-semibold text-slate-600">
                  {student?.nombres} {student?.apellidos} • Folio: {student?.folio_formateado || student?.folio}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate(`/administrativo/student/${student?.folio}`)}
                className="inline-flex items-center px-4 py-2 text-sm font-semibold rounded-lg bg-slate-600 text-white hover:bg-slate-700 shadow-sm border border-slate-700 transition-all duration-200"
                title="Ver perfil del estudiante"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Ver Perfil
              </button>
            </div>
          </div>
        </div>

        {/* Alertas de estado */}
        {(isLocked || withinTolerancePayment) && (
          <div className={`rounded-xl sm:rounded-2xl p-4 sm:p-5 border-2 shadow-lg ${isLocked
              ? 'bg-red-50 border-red-300'
              : 'bg-amber-50 border-amber-300'
            }`}>
            {isLocked ? (
              <div className="flex items-center gap-3 text-red-800 text-sm sm:text-base">
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center border-2 border-red-300">
                  <svg className="w-5 h-5 text-red-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M12 5a7 7 0 100 14 7 7 0 000-14z" />
                  </svg>
                </div>
                <div>
                  <span className="font-extrabold">Bloqueado:</span>
                  <span className="ml-1">tiene pago(s) vencido(s) desde hace {daysLocked} día(s).</span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 text-amber-900 text-sm sm:text-base">
                <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center border-2 border-amber-300">
                  <svg className="w-5 h-5 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <span className="font-extrabold">En tolerancia:</span>
                  <span className="ml-1">faltan {daysToBlock} día(s) para bloqueo si no se paga.</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Próximo pago */}
        <div className="bg-gradient-to-r from-slate-600 via-slate-700 to-slate-600 rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-8 text-white shadow-2xl border-2 border-slate-500">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h3 className="text-xl sm:text-2xl font-extrabold mb-2">Próximo Pago</h3>
              <p className="text-slate-200 text-sm sm:text-base mb-3 font-semibold">{nextPayment ? `Mes de ${nextPayment.month}` : 'Sin pagos próximos'}</p>
              <p className="text-3xl sm:text-4xl font-extrabold">{formatCurrencyMXN(nextPayment?.amount || 0)}</p>
            </div>
            <div className="mt-4 md:mt-0">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 border-2 border-white/30 shadow-lg">
                <p className="text-xs sm:text-sm text-slate-200 mb-2 font-semibold">Fecha límite de pago</p>
                <p className="text-lg sm:text-xl font-extrabold">{nextPayment ? nextPayment.dueDate.toLocaleDateString('es-ES') : '--/--/----'}</p>
                {isLocked && (
                  <div className="mt-3 inline-flex items-center px-3 py-1.5 rounded-lg bg-red-600/90 text-xs font-bold border-2 border-red-500 shadow-sm">Bloqueado • {daysLocked} d</div>
                )}
                {!isLocked && withinTolerancePayment && (
                  <div className="mt-3 inline-flex items-center px-3 py-1.5 rounded-lg bg-yellow-400/90 text-xs font-bold text-black border-2 border-yellow-500 shadow-sm">En tolerancia • bloquea en {daysToBlock} d</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Plan info + tabla */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-5 sm:p-6 md:p-8 border-2 border-slate-200">
          <div className="flex flex-col gap-4 mb-5 sm:mb-6">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <span className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-extrabold text-white bg-gradient-to-r from-slate-600 to-slate-700 shadow-md border-2 border-slate-500">✨ {planConfig.name}</span>
              <span className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold bg-green-50 text-green-800 border-2 border-green-300 shadow-sm">💰 {formatCurrencyMXN(planConfig.paymentAmount)} {planConfig.frequency}</span>
              <span className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold bg-blue-50 text-blue-800 border-2 border-blue-300 shadow-sm">📅 Inicio: {activationDate?.toLocaleDateString('es-ES')}</span>
              <span className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold bg-slate-100 text-slate-800 border-2 border-slate-300 shadow-sm">🎯 Total: {formatCurrencyMXN(planConfig.totalAmount)}</span>
              {student?.curso && (
                <span className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold bg-gray-50 text-gray-800 border-2 border-gray-300 shadow-sm">📘 Curso: {student.curso}</span>
              )}
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900">Plan de Pagos</h3>
          </div>
          <div className="overflow-x-auto rounded-lg border-2 border-slate-200">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-slate-100 to-gray-100">
                <tr className="border-b-2 border-slate-300">
                  <th className="text-left py-3 sm:py-4 px-3 sm:px-4 font-extrabold text-slate-900 text-sm sm:text-base">Pago</th>
                  <th className="text-left py-3 sm:py-4 px-3 sm:px-4 font-extrabold text-slate-900 text-sm sm:text-base">Periodo</th>
                  <th className="text-left py-3 sm:py-4 px-3 sm:px-4 font-extrabold text-slate-900 text-sm sm:text-base">Monto</th>
                  <th className="text-left py-3 sm:py-4 px-3 sm:px-4 font-extrabold text-slate-900 text-sm sm:text-base">Fecha Límite</th>
                  <th className="text-left py-3 sm:py-4 px-3 sm:px-4 font-extrabold text-slate-900 text-sm sm:text-base">Estado</th>
                  <th className="text-left py-3 sm:py-4 px-3 sm:px-4 font-extrabold text-slate-900 text-sm sm:text-base">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {schedule.map((payment) => {
                  const isWithinTol = (payment.status === 'pending' && now > payment.dueDate && now <= new Date(new Date(payment.dueDate).setDate(payment.dueDate.getDate() + toleranceDays)));
                  return (
                    <tr key={payment.id} className={`border-b border-slate-200 hover:bg-slate-50 transition-colors ${payment.isOverdue ? 'bg-red-50/50' : isWithinTol ? 'bg-yellow-50/50' : ''
                      }`}>
                      <td className="py-3 sm:py-4 px-3 sm:px-4 font-extrabold text-slate-900 text-sm sm:text-base">#{payment.paymentNumber}</td>
                      <td className="py-3 sm:py-4 px-3 sm:px-4 text-slate-700 font-medium text-sm sm:text-base">{payment.month}</td>
                      <td className="py-3 sm:py-4 px-3 sm:px-4 font-extrabold text-slate-900 text-sm sm:text-base">{formatCurrencyMXN(payment.amount)}</td>
                      <td className="py-3 sm:py-4 px-3 sm:px-4 text-slate-700 font-medium text-sm sm:text-base">{payment.dueDate.toLocaleDateString('es-ES')}</td>
                      <td className="py-3 sm:py-4 px-3 sm:px-4">
                        <span className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-extrabold border-2 shadow-sm ${getStatusPill(payment.status, payment.isOverdue)}`}>
                          {getStatusLabel(payment.status, payment.isOverdue)}
                        </span>
                      </td>
                      <td className="py-3 sm:py-4 px-3 sm:px-4">
                        {payment.status === 'paid' ? (
                          <button
                            className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm rounded-lg bg-slate-600 text-white hover:bg-slate-700 shadow-sm border border-slate-700 font-semibold transition-all duration-200"
                            onClick={() => handleViewReceipt(payment)}
                            title="Ver comprobante del pago"
                          >
                            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Ver comprobante
                          </button>
                        ) : (
                          <span className="text-xs sm:text-sm text-slate-500 font-medium">Próximamente</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Próximos pagos list */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-5 sm:p-6 md:p-8 border-2 border-slate-200">
          <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 mb-4 sm:mb-5">Próximos pagos</h3>
          <ul className="space-y-3">
            {schedule.filter(p => p.status === 'upcoming' || p.status === 'pending').slice(0, 3).map(p => (
              <li key={p.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 p-3 sm:p-4 bg-slate-50 rounded-lg border-2 border-slate-200 hover:bg-slate-100 transition-colors">
                <span className="inline-flex items-center font-semibold text-slate-800 text-sm sm:text-base">
                  <div className="w-8 h-8 bg-slate-200 rounded-lg flex items-center justify-center mr-2 sm:mr-3 border-2 border-slate-300">
                    <svg className="w-4 h-4 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  {p.month}
                </span>
                <div className="flex items-center gap-3 sm:gap-4">
                  <span className="font-extrabold text-slate-900 text-sm sm:text-base">{formatCurrencyMXN(p.amount)}</span>
                  <span className="text-slate-600 font-medium text-sm sm:text-base">{p.dueDate.toLocaleDateString('es-ES')}</span>
                </div>
              </li>
            ))}
            {schedule.every(p => p.status === 'paid') && (
              <li className="text-sm sm:text-base text-slate-600 font-medium p-3 bg-slate-50 rounded-lg border-2 border-slate-200">Todos los pagos fueron completados.</li>
            )}
          </ul>
        </div>

        {/* Recibo virtual modal */}
        <ComprobanteVirtual
          isOpen={showRecibo}
          onClose={() => { setShowRecibo(false); setPaymentForRecibo(null); }}
          paymentData={paymentForRecibo}
          studentData={{
            id: student?.id,
            name: `${student?.nombres || ''} ${student?.apellidos || ''}`.trim(),
            group: student?.grupo || student?.turno,
            email: student?.correoElectronico || student?.email,
            studentCode: student?.folio,
            address: [student?.municipioComunidad || student?.comunidad1, student?.comunidad2].filter(Boolean).join(' '),
            courseName: student?.curso || '',
          }}
        />
      </div>
    </div>
  );
}

function formatCurrencyMXN(value) {
  const num = Number(value ?? 0);
  return num.toLocaleString('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function getStatusPill(status, isOverdue) {
  if (status === 'paid') return 'bg-green-50 text-green-800 border-green-400';
  if (status === 'overdue' || isOverdue) return 'bg-red-50 text-red-800 border-red-400';
  if (status === 'pending') return 'bg-yellow-50 text-yellow-800 border-yellow-400';
  return 'bg-slate-50 text-slate-700 border-slate-400';
}

function getStatusLabel(status, isOverdue) {
  if (status === 'paid') return 'Pagado';
  if (status === 'overdue' || isOverdue) return 'Vencido';
  if (status === 'pending') return 'Pendiente';
  return 'Próximo';
}
