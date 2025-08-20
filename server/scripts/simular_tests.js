#!/usr/bin/env node
import fetch from 'node-fetch';
import crypto from 'crypto';
import { setTimeout as delay } from 'timers/promises';

// Configuración básica
const BASE_URL = process.env.API_BASE || 'http://localhost:1002';
const TOTAL = parseInt(process.argv[2] || '5', 10); // cantidad de simulaciones
const APROBADOS_RATIO = parseFloat(process.argv[3] || '0.5'); // % que intentará aprobar

function randInt(min, max){ return Math.floor(Math.random()*(max-min+1))+min; }
function pick(arr){ return arr[randInt(0, arr.length-1)]; }

// Genera arreglo de longitud n aplicando callback
const genArr = (n, fn)=> Array.from({length:n}, (_,i)=> fn(i));

function buildBigFive(aprobado){
  return genArr(22, ()=> aprobado ? randInt(3,5) : randInt(1,3));
}
function buildDASS(aprobado){
  return genArr(21, ()=> aprobado ? randInt(0,2) : randInt(2,3));
}
function buildLikert(n, aprobado){
  return genArr(n, ()=> aprobado ? randInt(3,5) : randInt(1,4));
}
function buildBinaryScaled(n, aprobado){
  // Devuelve 0 o 10 (similar a tu lógica WAIS / Académica) con prob según aprobado
  return genArr(n, ()=> (Math.random() < (aprobado ? 0.8 : 0.4)) ? 10 : 0);
}

function sum(arr){ return arr.reduce((a,b)=> a + (Number(b)||0),0); }

function dassSubscales(dass){
  const pickIdx = (idxs)=> idxs.reduce((a,i)=> a + (Number(dass[i-1])||0),0);
  const depRaw = pickIdx([3,5,10,13,16,17,21]);
  const anxRaw = pickIdx([2,4,7,9,15,19,20]);
  const strRaw = pickIdx([1,6,8,11,12,14,18]);
  return { depresion: depRaw*2, ansiedad: anxRaw*2, estres: strRaw*2 };
}

async function crearPreregistro(i){
  const nombres = pick(['Ana','Luis','Carlos','María','Juan','Lucía','Miguel','Elena']);
  const apellidos = pick(['Pérez','García','López','Hernández','Ramírez','Flores','Díaz']);
  const correo = `${nombres.toLowerCase()}.${apellidos.toLowerCase()}.${Date.now()}${i}@example.com`;
  const body = { nombres, apellidos, correo, telefono:'5550000000', area:'General', estudios:'Licenciatura' };
  const res = await fetch(`${BASE_URL}/api/asesores/preregistro`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) });
  if(!res.ok){ throw new Error(`Error preregistro ${res.status}`); }
  const data = await res.json();
  return data.preregistro.id;
}

async function guardarResultados(preregistroId, aprobado){
  // Construir arrays
  const bigfive = buildBigFive(aprobado);
  const dass = buildDASS(aprobado);
  const zavic = genArr(60, i=> randInt(aprobado?2:1,5));
  const baron = buildLikert(25, aprobado);
  const wais = buildBinaryScaled(25, aprobado);
  const academica = buildBinaryScaled(20, aprobado);

  // Totales (replicando lógica actual)
  const bigfive_total = sum(bigfive);
  const dass_total = sum(dass);
  const zavic_total = (function(){
    let s=0; for(let i=1;i<=60;i++){ if(i%2===0) s += Number(zavic[i-1])||0; } return s; })();
  const baron_total = sum(baron);
  const wais_total = sum(wais);
  const academica_total = sum(academica);
  const dass21_subescalas = dassSubscales(dass);

  const payload = {
    bigfive_total, dass21_total: dass_total, zavic_total, baron_total, wais_total, academica_total,
    bigfive_respuestas: bigfive,
    dass21_respuestas: dass,
    zavic_respuestas: zavic,
    baron_respuestas: baron,
    wais_respuestas: wais,
    academica_respuestas: academica,
    dass21_subescalas,
    bigfive_dimensiones: {} // placeholder
  };
  const res = await fetch(`${BASE_URL}/api/asesores/tests/${preregistroId}`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) });
  if(!res.ok){ throw new Error(`Error guardando resultados ${res.status}`); }
  return await res.json();
}

async function finalizar(preregistroId){
  const res = await fetch(`${BASE_URL}/api/asesores/finalizar/${preregistroId}`, { method:'POST' });
  if(!res.ok){ throw new Error(`Error finalizar ${res.status}`); }
  return await res.json();
}

async function esperarServidor(maxIntentos=10){
  for(let i=1;i<=maxIntentos;i++){
    try {
      const r = await fetch(`${BASE_URL}/api/health`);
      if(r.ok){
        const js = await r.json();
        if(js.ok){ console.log(`Servidor OK en intento ${i}`); return; }
      }
    } catch(e){}
    console.log(`Esperando servidor (${i}/${maxIntentos})...`);
    await delay(1000);
  }
  throw new Error('Servidor no disponible. Asegura que corre en '+BASE_URL);
}

async function main(){
  console.log(`Simulando ${TOTAL} candidatos (ratio aprobados objetivo ~${APROBADOS_RATIO})`);
  try { await esperarServidor(); } catch(e){ console.error(e.message); process.exit(1); }
  const resultados = [];
  for(let i=0;i<TOTAL;i++){
    const aprobadoObjetivo = Math.random() < APROBADOS_RATIO;
    try {
      console.log(`Candidato #${i+1}: creando preregistro (targetAprobado=${aprobadoObjetivo})`);
      const preregistroId = await crearPreregistro(i);
      console.log(`Candidato #${i+1}: preregistroId=${preregistroId} guardando resultados...`);
      await guardarResultados(preregistroId, aprobadoObjetivo);
      console.log(`Candidato #${i+1}: finalizando...`);
      const fin = await finalizar(preregistroId);
      resultados.push({ preregistroId, aprobado: fin.aprobado, generado: fin.credenciales ? true : false });
      console.log(`#${i+1} preregistro=${preregistroId} aprobadoBackend=${fin.aprobado}`);
    } catch(err){
      console.error(`#${i+1} fallo:`, err.message);
      resultados.push({ error:true, message: err.message });
    }
  }
  // Resumen
  const aprobados = resultados.filter(r=> r.aprobado).length;
  const rechazados = resultados.filter(r=> r.aprobado===false).length;
  console.log(`Resumen: aprobados=${aprobados} rechazados=${rechazados}`);
  // Guardar log simple
  const csv = 'preregistroId,aprobado,credenciales\n' + resultados.map(r=> `${r.preregistroId||''},${r.aprobado||false},${r.generado||false}`).join('\n');
  const file = `simulacion_${Date.now()}.csv`;
  await import('fs').then(fs=> fs.writeFileSync(file, csv));
  console.log(`CSV generado: ${file}`);
}

main().catch(e=>{ console.error('Fatal:', e); process.exit(1); });
