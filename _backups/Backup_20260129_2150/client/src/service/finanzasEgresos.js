import { listGastosFijos } from './finanzasGastosFijos.js';
import { listGastosVariables } from './finanzasGastosVariables.js';

// Service: Egresos consolidados
// Combina gastos fijos y variables para mostrar en la vista general de egresos

export async function listAllEgresos(params = {}) {
  try {
    const [gastosFijos, gastosVariables] = await Promise.all([
      listGastosFijos(params),
      listGastosVariables(params)
    ]);

    // Normalizar datos para que tengan la misma estructura
    const fijosNormalizados = gastosFijos.map(gasto => ({
      ...gasto,
      tipo: 'fijo',
      concepto: gasto.categoria || 'Sin categoría',
      descripcion: gasto.descripcion || '',
      metodo: gasto.metodo || 'efectivo'
    }));

    const variablesNormalizados = gastosVariables.map(gasto => ({
      ...gasto,
      tipo: 'variable',
      concepto: gasto.producto || 'Sin producto',
      descripcion: gasto.descripcion || '',
      metodo: gasto.metodo || 'efectivo'
    }));

    // Combinar y ordenar por fecha (más reciente primero)
    const todosEgresos = [...fijosNormalizados, ...variablesNormalizados]
      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

    return todosEgresos;
  } catch (error) {
    console.error('Error al obtener egresos:', error);
    return [];
  }
}
