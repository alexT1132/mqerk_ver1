import React, { useMemo, useState } from "react";

/* ===== helpers ===== */
const monthNames = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
const fmtMoney = (n=0) => n.toLocaleString("es-MX",{style:"currency",currency:"MXN",minimumFractionDigits:2});

/* ===== UI atoms ===== */
const Card = ({ children, className="" }) => (
  <div className={`rounded-2xl border border-slate-200 bg-white shadow-sm ${className}`}>{children}</div>
);
const Stat = ({ label, value }) => (
  <Card className="p-4">
    <div className="text-sm text-slate-500">{label}</div>
    <div className="mt-1 text-xl font-semibold text-slate-900">{value}</div>
  </Card>
);
const Button = ({ children, className="", ...p }) => (
  <button
    className={`rounded-xl px-3.5 py-2 text-sm font-medium shadow focus:outline-none focus:ring-2 focus:ring-slate-900/10 ${className}`}
    {...p}
  >
    {children}
  </button>
);

/* ===== main ===== */
export default function FiscalDashboard() {
  /* Demo state; conecta a tu backend donde veas TODO */
  const [emitidas, setEmitidas] = useState([{ file:"FEmitida_001.xml", date:"2025-09-03" }]);
  const [recibidas, setRecibidas] = useState([{ file:"FRecibida_123.xml", date:"2025-09-05" }]);
  const [recibos,   setRecibos]   = useState([{ file:"ReciboSAT_2025_09.pdf", date:"2025-09-10" }]);

  /* Filtros */
  const [mes, setMes]   = useState("Todos");   // 0..11 o "Todos"
  const [anio, setAnio] = useState("Todos");   // "2025" o "Todos"

  const years = useMemo(() => {
    const all = [...emitidas, ...recibidas, ...recibos].map(i => i.date.slice(0,4));
    return ["Todos", ...Array.from(new Set(all)).sort()];
  }, [emitidas,recibidas,recibos]);

  const byPeriod = (arr) => arr.filter(i => {
    const d = new Date(i.date);
    const okY = (anio==="Todos") || String(d.getFullYear())===String(anio);
    const okM = (mes==="Todos")  || d.getMonth()===Number(mes);
    return okY && okM;
  });

  const emitidasF = byPeriod(emitidas);
  const recibidasF = byPeriod(recibidas);
  const recibosF   = byPeriod(recibos);

  /* Cálculos demo */
  const isr = useMemo(() => emitidasF.length * 5000, [emitidasF.length]);
  const iva = 10000;
  const cumplimientoOk = true;

  /* acciones */
  const addItem = (type, file, date) => {
    if (!date) return alert("Selecciona una fecha.");
    if (!file) return alert("Selecciona un archivo.");
    const item = { file: file.name || file, date };
    if (type==="emitida") setEmitidas(p=>[item,...p]);
    if (type==="recibida") setRecibidas(p=>[item,...p]);
    if (type==="recibo")   setRecibos(p=>[item,...p]);
    // TODO: subir a tu API con FormData
  };
  const delItem = (type, idx) => {
    if (!confirm("¿Eliminar registro?")) return;
    if (type==="emitida") setEmitidas(p=>p.filter((_,i)=>i!==idx));
    if (type==="recibida") setRecibidas(p=>p.filter((_,i)=>i!==idx));
    if (type==="recibo")   setRecibos(p=>p.filter((_,i)=>i!==idx));
  };
  const copyText = async (t) => { try{ await navigator.clipboard.writeText(t);}catch{} };

  const exportCSV = () => {
    const rows = [
      ...emitidasF.map(r=>({tipo:"Emitida",...r})),
      ...recibidasF.map(r=>({tipo:"Recibida",...r})),
      ...recibosF.map(r=>({tipo:"Recibo SAT",...r})),
    ];
    const headers = ["tipo","file","date"];
    const csv = [headers.join(","), ...rows.map(r => headers.map(h => `"${String(r[h]??"").replace(/"/g,'""')}"`).join(","))].join("\n");
    const blob = new Blob([csv], {type:"text/csv;charset=utf-8;"});
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `reporte_fiscal_${anio}_${mes}.csv`;
    a.click(); URL.revokeObjectURL(a.href);
  };

  const rechazados = []; // si aplicara alguna lógica

  return (
    <div className="mx-auto w-full max-w-8xl px-4 md:px-6 py-6 bg-transparent">
      {/* FILTROS */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_auto] items-end">
        <div className="grid grid-cols-2 gap-3">
          <label className="grid">
            <span className="text-slate-600 text-xs mb-1">Mes</span>
            <select
              value={mes}
              onChange={(e)=>setMes(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
            >
              <option value="Todos">Todos</option>
              {monthNames.map((m,i)=><option key={m} value={i}>{m}</option>)}
            </select>
          </label>
          <label className="grid">
            <span className="text-slate-600 text-xs mb-1">Año</span>
            <select
              value={anio}
              onChange={(e)=>setAnio(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
            >
              {years.map(y=><option key={y} value={y}>{y}</option>)}
            </select>
          </label>
        </div>

        <Button
          onClick={()=>{ setMes("Todos"); setAnio("Todos"); }}
          className="bg-white text-slate-700 border border-slate-200 justify-self-start sm:justify-self-end"
        >
          Restablecer filtros
        </Button>
      </div>

      {/* STATS */}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="Facturas Emitidas"  value={emitidasF.length} />
        <Stat label="Facturas Recibidas" value={recibidasF.length} />
        <Stat label="ISR" value={fmtMoney(isr)} />
        <Stat label="IVA" value={fmtMoney(iva)} />
      </div>

      {/* FORMULARIOS */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <FormBlock title="Nueva factura emitida"  cta="Agregar factura emitida"  onSubmit={(f,d)=>addItem("emitida",f,d)} />
        <FormBlock title="Nueva factura recibida" cta="Agregar factura recibida" onSubmit={(f,d)=>addItem("recibida",f,d)} />
        <FormBlock title="Nuevo recibo (Hacienda)" cta="Agregar recibo"         onSubmit={(f,d)=>addItem("recibo",f,d)} />
      </div>

      {/* LISTAS */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <ListBlock title="Facturas Emitidas (lista)"   data={emitidasF} onCopy={(n)=>copyText(n)} onDelete={(i)=>delItem("emitida",i)} />
        <ListBlock title="Facturas Recibidas (lista)"  data={recibidasF} onCopy={(n)=>copyText(n)} onDelete={(i)=>delItem("recibida",i)} />
        <ListBlock title="Recibos Hacienda (lista)"    data={recibosF}   onCopy={(n)=>copyText(n)} onDelete={(i)=>delItem("recibo",i)} />
      </div>

      {/* CUMPLIMIENTO + EXPORT */}
      <Card className="mt-6 p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-lg font-semibold text-slate-900">Cumplimiento Fiscal</div>
            <div className="mt-1 text-sm">
              {cumplimientoOk
                ? <span className="text-emerald-600 font-medium">OK</span>
                : <span className="text-rose-600 font-medium">Pendiente</span>}
              <span className="text-slate-600"> — Declaraciones SAT al día</span>
            </div>
          </div>
          <Button onClick={exportCSV} className="bg-slate-900 text-white">Exportar reporte (CSV)</Button>
        </div>
      </Card>
    </div>
  );
}

/* ===== subcomponents ===== */

function FormBlock({ title, cta, onSubmit }) {
  const [date, setDate] = useState("");
  const [file, setFile] = useState(null);

  return (
    <Card className="p-4">
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>

      <label className="mt-3 grid gap-1">
        <span className="text-xs text-slate-600">Fecha</span>
        <input
          type="date"
          value={date}
          onChange={(e)=>setDate(e.target.value)}
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/5"
        />
      </label>

      <label className="mt-3 grid gap-1">
        <span className="text-xs text-slate-600">Archivo</span>
        <input
          type="file"
          onChange={(e)=>setFile(e.target.files?.[0] ?? null)}
          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 file:me-3 file:rounded-lg file:border-0 file:bg-slate-900 file:px-3 file:py-1.5 file:text-white focus:outline-none"
        />
      </label>

      <Button onClick={()=>onSubmit(file,date)} className="mt-3 bg-slate-900 text-white">
        {cta}
      </Button>
    </Card>
  );
}

function ListBlock({ title, data, onCopy, onDelete }) {
  return (
    <Card className="p-4">
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>

      {/* Tabla desktop */}
      <div className="hidden md:block mt-3 overflow-hidden rounded-xl border border-slate-200">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-2 text-left font-medium">Archivo</th>
              <th className="px-4 py-2 text-left font-medium">Fecha</th>
              <th className="px-4 py-2 text-right font-medium">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((r,i)=>(
              <tr key={r.file+i} className="hover:bg-slate-50/60">
                <td className="px-4 py-3 text-slate-800">{r.file}</td>
                <td className="px-4 py-3 text-slate-600">{r.date}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <Button className="bg-white border border-slate-200 text-slate-700" onClick={()=>onCopy(r.file)}>Copiar</Button>
                    <Button className="bg-rose-600 text-white" onClick={()=>onDelete(i)}>Eliminar</Button>
                  </div>
                </td>
              </tr>
            ))}
            {data.length===0 && (
              <tr><td colSpan="3" className="px-4 py-8 text-center text-slate-500">Sin registros.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Tarjetas móvil */}
      <div className="md:hidden mt-3 grid grid-cols-1 gap-3">
        {data.length===0 && (
          <div className="rounded-xl border border-slate-200 p-4 text-center text-slate-500">Sin registros.</div>
        )}
        {data.map((r,i)=>(
          <div key={r.file+i} className="rounded-xl border border-slate-200 p-4">
            <div className="font-medium text-slate-900 truncate">{r.file}</div>
            <div className="text-xs text-slate-600">{r.date}</div>
            <div className="mt-3 flex gap-2">
              <Button className="bg-white border border-slate-200 text-slate-700" onClick={()=>onCopy(r.file)}>Copiar</Button>
              <Button className="bg-rose-600 text-white" onClick={()=>onDelete(i)}>Eliminar</Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
