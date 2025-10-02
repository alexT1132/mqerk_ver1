import { runPlantillasJob } from '../jobs/plantillasAuto.js';
import db from '../db.js';

async function main() {
  const fechaPrueba = process.argv[2] || '2025-09-12';
  const debug = true;
  console.log('--- Simulando fecha', fechaPrueba, '---');
  const res = await runPlantillasJob(fechaPrueba, { debug });
  console.log('Resultado:', res);
  await db.end?.();
}
main().catch(e=>{ console.error(e); process.exit(1); });
