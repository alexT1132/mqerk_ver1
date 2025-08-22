// Shared payment schedule and plan utilities
// Rules:
// - Due date = last day of month + 14 days
// - Tolerance days: mensual/start = 3, premium = 0
// - Total payments: premium=1, start=2, mensual=8
// - Paid count at start: premium=all, others=1

export const resolvePlanType = (raw) => {
  const v = String(raw || '').toLowerCase();
  if (v.includes('premium')) return 'premium';
  if (v.includes('start')) return 'start';
  return 'mensual';
};

export const getActivationDate = (alumno) => {
  const key = `planActivationDate:${alumno?.folio || alumno?.id || 'anon'}`;
  const stored = localStorage.getItem(key);
  if (stored) {
    const d = new Date(stored);
    if (!isNaN(d.getTime())) return d;
  }
  if (alumno?.created_at) {
    const d = new Date(alumno.created_at);
    if (!isNaN(d.getTime())) return d;
  }
  return new Date();
};

export const generatePaymentSchedule = ({ startDate, planType = 'mensual', now = new Date() }) => {
  if (!startDate) return [];
  const type = (planType || 'mensual').toString().toLowerCase();
  const totalPayments = type === 'premium' ? 1 : (type === 'start' ? 2 : 8);
  const paymentAmount = type === 'premium' ? 10500 : (type === 'start' ? 5500 : 1500);
  const paidCount = type === 'premium' ? totalPayments : 1; // first payment covered at start (all for premium)
  const toleranceDays = (type === 'mensual' || type === 'start') ? 3 : 0;

  const schedule = [];
  for (let i = 0; i < totalPayments; i++) {
    const baseDate = new Date(startDate);
    if (type === 'start') {
      // instalments: month 0 and +4 months
      baseDate.setMonth(baseDate.getMonth() + (i === 0 ? 0 : 4));
    } else {
      baseDate.setMonth(baseDate.getMonth() + i);
    }
    const lastDayOfMonth = new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 0);
    const dueDate = new Date(lastDayOfMonth);
    dueDate.setDate(dueDate.getDate() + 14);

    let status = 'pending';
    let isOverdue = false;
    if (i < paidCount) {
      status = 'paid';
    } else {
      const dueWithTolerance = new Date(dueDate);
      dueWithTolerance.setDate(dueWithTolerance.getDate() + toleranceDays);
      if (now > dueWithTolerance) {
        status = 'overdue';
        isOverdue = true;
      } else if (now < dueDate) {
        status = 'upcoming';
      }
    }

    schedule.push({
      id: `p-${i + 1}`,
      index: i + 1,
      amount: paymentAmount,
      dueDate,
      status,
      isOverdue,
      toleranceDays,
    });
  }
  return schedule;
};

export const computeOverdueState = ({ alumno, now = new Date() }) => {
  const planType = resolvePlanType(alumno?.plan || alumno?.plan_type);
  const activationDate = getActivationDate(alumno);
  const schedule = generatePaymentSchedule({ startDate: activationDate, planType, now });
  const overdueItems = schedule.filter(p => p.isOverdue);
  const isOverdueLocked = overdueItems.length > 0;

  let overdueDays = 0;
  if (isOverdueLocked) {
    // compute days beyond tolerance for the earliest overdue item
    const minOverdueDate = overdueItems.reduce((acc, p) => {
      const d = new Date(p.dueDate);
      d.setDate(d.getDate() + p.toleranceDays);
      return acc && acc < d ? acc : d;
    }, null);
    if (minOverdueDate) {
      const diffTime = now.getTime() - minOverdueDate.getTime();
      overdueDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
  }
  return { isOverdueLocked, overdueDays, planType, activationDate, schedule };
};
