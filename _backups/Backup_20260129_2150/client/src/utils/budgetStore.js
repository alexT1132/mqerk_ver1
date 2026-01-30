// Local storage backing for budgets and expenses (client-only)
import dayjs from 'dayjs';

const KEYS = {
  budgets: 'mqerk:finanzas:presupuestos',
  fijos: 'mqerk:finanzas:egresos:fijos',
  variables: 'mqerk:finanzas:egresos:variables',
};

function safeParse(json, fallback) {
  try {
    const parsed = JSON.parse(json);
    // Normalizar casos donde JSON.parse devuelve null o un tipo no-objeto
    if (parsed === null || parsed === undefined) return fallback;
    return parsed;
  } catch {
    return fallback;
  }
}

export function loadBudgets() {
  const raw = safeParse(localStorage.getItem(KEYS.budgets), null);
  const data = (raw && typeof raw === 'object') ? raw : { months: {}, meta: {} };
  if (!data.months || typeof data.months !== 'object') data.months = {};
  if (!data.meta || typeof data.meta !== 'object') data.meta = {};
  return data;
}

export function saveBudgets(data) {
  const toSave = data && typeof data === 'object' ? data : { months: {}, meta: {} };
  if (!toSave.months || typeof toSave.months !== 'object') toSave.months = {};
  if (!toSave.meta || typeof toSave.meta !== 'object') toSave.meta = {};
  localStorage.setItem(KEYS.budgets, JSON.stringify(toSave));
}

export function getBudget(month) {
  const { months } = loadBudgets();
  return Number(months[month] || 0);
}

export function setBudget(month, amount) {
  const data = loadBudgets();
  data.months[month] = Number(amount || 0);
  saveBudgets(data);
}

export function loadExpenses(type) {
  const key = type === 'fijos' ? KEYS.fijos : KEYS.variables;
  const parsed = safeParse(localStorage.getItem(key), []);
  return Array.isArray(parsed) ? parsed : [];
}

export function saveExpenses(type, rows) {
  const key = type === 'fijos' ? KEYS.fijos : KEYS.variables;
  localStorage.setItem(key, JSON.stringify(rows || []));
}

export function sumExpensesMonth(month) {
  const inMonth = (fecha) => dayjs(fecha).format('YYYY-MM') === month;
  const onlyPaid = (r) => String(r.estatus) === 'Pagado';
  const sum = (arr) => arr.reduce((acc, r) => acc + (Number(r.importe) || 0), 0);
  const f = loadExpenses('fijos').filter(r => inMonth(r.fecha) && onlyPaid(r));
  const v = loadExpenses('variables').filter(r => inMonth(r.fecha) && onlyPaid(r));
  return sum(f) + sum(v);
}

export function rolloverIfNeeded(now = dayjs()) {
  const currentMonth = now.format('YYYY-MM');
  const prevMonth = now.subtract(1, 'month').format('YYYY-MM');
  const data = loadBudgets();
  const alreadyFor = data.meta.lastRolloverAppliedForMonth;
  if (alreadyFor === currentMonth) return false; // already applied this month

  const prevBudget = Number(data.months[prevMonth] || 0);
  if (!prevBudget) { data.meta.lastRolloverAppliedForMonth = currentMonth; saveBudgets(data); return false; }
  const spentPrev = sumExpensesMonth(prevMonth);
  const leftover = Math.max(0, prevBudget - spentPrev);
  if (leftover > 0) {
    data.months[currentMonth] = Number(data.months[currentMonth] || 0) + leftover;
  }
  data.meta.lastRolloverAppliedForMonth = currentMonth;
  saveBudgets(data);
  return leftover > 0;
}

export function getBudgetSnapshot(forMonth) {
  const budget = getBudget(forMonth);
  const spent = sumExpensesMonth(forMonth);
  const leftover = Math.max(0, budget - spent);
  const reductionPct = budget > 0 ? Math.max(0, Math.min(100, ((budget - spent) / budget) * 100)) : 0;
  return { budget, spent, leftover, reductionPct };
}

export const LOW_REMAINING_THRESHOLD = 1000; // MXN
