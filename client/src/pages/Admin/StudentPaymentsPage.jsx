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
  const daysPastDue = withinTolerancePayment ? Math.max(0, Math.ceil((now.getTime() - withinTolerancePayment.dueDate.getTime()) / (1000*60*60*24))) : 0;
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
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="bg-white rounded-xl shadow p-6 border border-gray-100 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
          <p className="text-gray-600">Cargando pagos del estudiante…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="bg-white rounded-xl shadow p-6 border border-red-100 text-center">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-8 sm:pt-12 pb-3 md:pb-6 px-3 md:px-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header con regreso y acciones */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const canGoBack = window.history.length > 2;
                  if (canGoBack) navigate(-1); else navigate('/administrativo/lista-alumnos');
                }}
                className="inline-flex items-center px-3 py-1.5 text-xs rounded-md border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                title="Regresar a la lista de alumnos"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Regresar
              </button>
              <h1 className="text-xl md:text-2xl font-extrabold text-gray-900">Pagos del Estudiante</h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate(`/administrativo/student/${student?.folio}`)}
                className="inline-flex items-center px-3 py-1.5 text-xs rounded-md bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
                title="Ver perfil del estudiante"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Ver Perfil
              </button>
            </div>
          </div>
          <p className="text-sm text-gray-600">{student?.nombres} {student?.apellidos} • Folio: {student?.folio_formateado || student?.folio}</p>
        </div>

        {/* Alertas de estado */}
        {(isLocked || withinTolerancePayment) && (
          <div className={`rounded-xl p-4 border ${isLocked ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'}`}>
            {isLocked ? (
              <div className="flex items-center gap-2 text-red-700 text-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M12 5a7 7 0 100 14 7 7 0 000-14z"/></svg>
                <span className="font-semibold">Bloqueado:</span>
                <span>tiene pago(s) vencido(s) desde hace {daysLocked} día(s).</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-amber-800 text-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                <span className="font-semibold">En tolerancia:</span>
                <span>faltan {daysToBlock} día(s) para bloqueo si no se paga.</span>
              </div>
            )}
          </div>
        )}

        {/* Próximo pago */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-4 md:p-6 text-white shadow-xl border border-purple-500/20">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-lg font-bold mb-1">Próximo Pago</h3>
              <p className="text-blue-100 text-sm mb-2">{nextPayment ? `Mes de ${nextPayment.month}` : 'Sin pagos próximos'}</p>
              <p className="text-2xl font-bold">{formatCurrencyMXN(nextPayment?.amount || 0)}</p>
            </div>
            <div className="mt-4 md:mt-0">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 border border-white/10">
                <p className="text-xs text-purple-100 mb-1">Fecha límite de pago</p>
                <p className="font-semibold">{nextPayment ? nextPayment.dueDate.toLocaleDateString('es-ES') : '--/--/----'}</p>
                {isLocked && (
                  <div className="mt-2 inline-flex items-center px-2 py-0.5 rounded bg-red-600/80 text-[10px]">Bloqueado • {daysLocked} d</div>
                )}
                {!isLocked && withinTolerancePayment && (
                  <div className="mt-2 inline-flex items-center px-2 py-0.5 rounded bg-yellow-400/80 text-[10px] text-black">En tolerancia • bloquea en {daysToBlock} d</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Plan info + tabla */}
        <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6 border border-gray-200">
          <div className="flex flex-col gap-3 mb-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 shadow-sm">✨ {planConfig.name}</span>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">💰 {formatCurrencyMXN(planConfig.paymentAmount)} {planConfig.frequency}</span>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">📅 Inicio: {activationDate?.toLocaleDateString('es-ES')}</span>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">🎯 Total: {formatCurrencyMXN(planConfig.totalAmount)}</span>
              {student?.curso && (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">📘 Curso: {student.curso}</span>
              )}
            </div>
            <h3 className="text-xl font-bold text-gray-800">Plan de Pagos</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Pago</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Periodo</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Monto</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Fecha Límite</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Estado</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {schedule.map((payment) => {
                  const isWithinTol = (payment.status === 'pending' && now > payment.dueDate && now <= new Date(new Date(payment.dueDate).setDate(payment.dueDate.getDate() + toleranceDays)));
                  return (
                  <tr key={payment.id} className={`border-b border-gray-100 ${payment.isOverdue ? 'bg-red-50' : isWithinTol ? 'bg-yellow-50' : ''}`}>
                    <td className="py-4 px-4 font-medium text-gray-800">#{payment.paymentNumber}</td>
                    <td className="py-4 px-4 text-gray-700">{payment.month}</td>
                    <td className="py-4 px-4 font-semibold text-gray-900">{formatCurrencyMXN(payment.amount)}</td>
                    <td className="py-4 px-4 text-gray-700">{payment.dueDate.toLocaleDateString('es-ES')}</td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusPill(payment.status, payment.isOverdue)}`}>
                        {getStatusLabel(payment.status, payment.isOverdue)}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      {payment.status === 'paid' ? (
                        <button
                          className="inline-flex items-center px-2.5 py-1.5 text-[11px] rounded-md bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
                          onClick={() => handleViewReceipt(payment)}
                          title="Ver comprobante del pago"
                        >
                          <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Ver comprobante
                        </button>
                      ) : (
                        <span className="text-xs text-gray-500">Próximamente</span>
                      )}
                    </td>
                  </tr>
                );})}
              </tbody>
            </table>
          </div>
        </div>

        {/* Próximos pagos list */}
        <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-800 mb-3">Próximos pagos</h3>
          <ul className="space-y-2">
            {schedule.filter(p => p.status === 'upcoming' || p.status === 'pending').slice(0, 3).map(p => (
              <li key={p.id} className="flex items-center justify-between text-sm text-gray-700">
                <span className="inline-flex items-center">
                  <svg className="w-4 h-4 text-purple-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {p.month}
                </span>
                <span className="font-semibold">{formatCurrencyMXN(p.amount)}</span>
                <span>{p.dueDate.toLocaleDateString('es-ES')}</span>
              </li>
            ))}
            {schedule.every(p => p.status === 'paid') && (
              <li className="text-sm text-gray-500">Todos los pagos fueron completados.</li>
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
  if (status === 'paid') return 'bg-green-100 text-green-800';
  if (status === 'overdue' || isOverdue) return 'bg-red-100 text-red-800';
  if (status === 'pending') return 'bg-yellow-100 text-yellow-800';
  return 'bg-gray-100 text-gray-700';
}

function getStatusLabel(status, isOverdue) {
  if (status === 'paid') return 'Pagado';
  if (status === 'overdue' || isOverdue) return 'Vencido';
  if (status === 'pending') return 'Pendiente';
  return 'Próximo';
}
