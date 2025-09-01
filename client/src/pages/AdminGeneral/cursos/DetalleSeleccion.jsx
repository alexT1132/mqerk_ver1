import { useState } from "react";
import GraficasFinanzas from "../../../components/AdminGeneral/GraficasCardFinanzas";

// DetalleSeleccion.jsx
function KpiRow({ children, gap = "normal", nowrap = false }) {
  return (
    <div
      className={[
        "flex flex-wrap items-stretch justify-center",
        gap === "tight" ? "gap-3 lg:gap-4" : "gap-4 lg:gap-6",
        nowrap ? "lg:flex-nowrap" : "",
      ].join(" ")}
    >
      {children}
    </div>
  );
}

function KpiInputCard({ title, value, onChange, size = "sm" }) {
  // mismos tamaños que KpiCard
  const sizes = {
    sm: {
      width: "w-full xs:w-[170px] sm:w-[185px] md:w-[195px]",
      title: "text-[13px]",
      value: "text-xl",
      pad: "p-3.5",
    },
    md4: {
      width: "w-full xs:w-[200px] sm:w-[220px] md:w-[235px] lg:w-[240px]",
      title: "text-sm",
      value: "text-2xl",
      pad: "p-4",
    },
    md: {
      width: "w-full xs:w-[220px] sm:w-[240px] md:w-[250px]",
      title: "text-sm",
      value: "text-2xl",
      pad: "p-4 sm:p-5",
    },
  };
  const s = sizes[size] ?? sizes.sm;

  return (
    <div
      className={[
        s.width,
        s.pad,
        "rounded-2xl border border-slate-200 bg-white/90 text-center",
        "shadow-sm backdrop-blur",
        "transition-transform duration-150 hover:-translate-y-0.5 hover:shadow-md",
      ].join(" ")}
    >
      <p className={`${s.title} font-medium text-slate-500`}>{title}</p>

      <input
        // si quieres libre: type="text"
        type="text"
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Ingresa un valor"
        className={[
          "mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2",
          "text-center font-bold tracking-tight text-slate-900",
          s.value,
          "focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500",
        ].join(" ")}
      />
    </div>
  );
}

function KpiCard({ title, value, highlight = false, size = "md" }) {
  // tamaños: md (filas 1–2), md4 (fila de 4), sm (fila de 5)
  const sizes = {
    md: {
      width: "w-full xs:w-[220px] sm:w-[240px] md:w-[250px]",
      title: "text-sm", value: "text-2xl", pad: "p-4 sm:p-5",
    },
    md4: {
      // un poco más angostas para que entren 4
      width: "w-full xs:w-[200px] sm:w-[220px] md:w-[235px] lg:w-[210px]",
      title: "text-sm", value: "text-2xl", pad: "p-4",
    },
    sm: {
      width: "w-full xs:w-[170px] sm:w-[185px] md:w-[200px]",
      title: "text-[13px]", value: "text-xl", pad: "p-3.5",
    },
  };
  const s = sizes[size] ?? sizes.md;

  return (
    <div
      className={[
        s.width, s.pad,
        "rounded-2xl border border-slate-200 bg-white/90 text-center shadow-sm backdrop-blur",
        "transition-transform duration-150 hover:-translate-y-0.5 hover:shadow-md",
      ].join(" ")}
    >
      <p className={`${s.title} font-medium text-slate-500`}>{title}</p>
      <p className={`mt-1 font-bold tracking-tight ${s.value} ${highlight ? "text-pink-600" : "text-slate-900"}`}>
        {value}
      </p>
    </div>
  );
}


export default function DetalleSeleccion({ data }) {

  const [impuestos, setImpuestos] = useState("");

  if (!data) return null; // o un placeholder

  return (
    <>
    <div className={
        data.title === 'Finanzas' && 'bg-violet-600 rounded-xl border md:w-[20%] sm:w-[60%] mx-auto border-gray-200 p-4' ||
        data.title === 'Contabilidad' && 'bg-emerald-600 rounded-xl border md:w-[20%] sm:w-[60%] mx-auto border-gray-200 p-4' ||
        data.title === 'Administrativo' && 'bg-violet-600 rounded-xl border md:w-[20%] sm:w-[60%] mx-auto border-gray-200 p-4' ||
        data.title === 'Gestión' && 'bg-blue-600 rounded-xl border md:w-[20%] sm:w-[60%] mx-auto border-gray-200 p-4' ||
        data.title === 'Estrategica' && 'bg-pink-600 rounded-xl border md:w-[20%] sm:w-[60%] mx-auto border-gray-200 p-4' ||
        data.title === 'Perfil Asesor' && 'bg-blue-600 rounded-xl border md:w-[20%] sm:w-[60%] mx-auto border-gray-200 p-4' 
        }>
      <h3 className="text-lg text-white font-semibold">{data.title}</h3>
      {data.subtitle && (
        <p className="text-sm text-white">{data.subtitle}</p>
      )}
    </div>
    {data.title === 'Finanzas' && (
      <div>
        <div className="flex justify-center mt-10">
      <div className="w-75 py-4 rounded-2xl border border-slate-200 bg-white/90 text-center shadow-sm backdrop-blur transition-transform duration-150 hover:-translate-y-0.5 hover:shadow-md">
        <p className={`font-medium text-slate-500`}>Ingreso Anual</p>
        <p className={`mt-1 font-bold tracking-tight`}>
          $6,720,000.00
        </p>
      </div>
    </div>
    <section className="w-full">
      {/* ancho global compacto */}
      <div className="mx-auto max-w-[1120px] px-4 py-10 lg:py-14">
        <h2 className="text-center text-4xl font-extrabold tracking-tight text-violet-700">
          KPI'S
        </h2>

        <div className="mt-8 space-y-6">
          {/* Fila 1 (1) */}
          <KpiRow>
            <KpiCard title="No. de Usuarios" value="200" size="md" />
          </KpiRow>

          {/* Fila 2 (3) */}
          <KpiRow>
            <KpiCard title="Ingresos mensuales" value="$560,000.00" size="md" />
            <KpiCard title="Egresos mensuales" value="$315,000.00" size="md" />
            <KpiCard title="Utilidad bruta" value="$245,000.00" size="md" />
          </KpiRow>

          {/* Fila 3 (4) — aquí estaba el problema */}
          <KpiRow nowrap>
            <KpiCard title="Costos mensuales" value="$12,000.00" size="md4" />
            <KpiCard title="CAC" value="$350.00" size="md4" />
            <KpiCard title="CLTV" value="$9,500.00" size="md4" />
            <KpiCard title="Margen de rentabilidad" value="43%" size="md4" />
          </KpiRow>

          {/* Fila 4 (5) */}
          <KpiRow gap="tight">
            <KpiCard title="Costo por alumno" value="$944.00" size="sm" />
            <KpiCard title="Ingreso promedio por alumno" value="$1,300.00" size="sm" />
            <KpiCard title="Rentabilidad" value="25%" size="sm" />
            <KpiInputCard title="Impuestos" value={impuestos} onChange={setImpuestos} size="sm" />
            <KpiCard title="Utilidad neta" value="$200,000.00" size="sm" highlight />
          </KpiRow>
        </div>
      </div>
    </section>
    <div className="py-6">
      <GraficasFinanzas />
    </div>
      </div>
    )}
    {data.title === 'Contabilidad' && (
      <div>
        <div className="flex justify-center mt-10">
      <div className="w-75 py-4 rounded-2xl border border-slate-200 bg-white/90 text-center shadow-sm backdrop-blur transition-transform duration-150 hover:-translate-y-0.5 hover:shadow-md">
        <p className={`font-medium text-slate-500`}>Ingreso Anual</p>
        <p className={`mt-1 font-bold tracking-tight`}>
          $6,720,000.00
        </p>
      </div>
    </div>
    <section className="w-full">
      {/* ancho global compacto */}
      <div className="mx-auto max-w-[1120px] px-4 py-10 lg:py-14">
        <h2 className="text-center text-4xl font-extrabold tracking-tight text-violet-700">
          KPI'S
        </h2>

        <div className="mt-8 space-y-6">
          {/* Fila 1 (1) */}
          <KpiRow>
            <KpiCard title="No. de Usuarios" value="200" size="md" />
          </KpiRow>

          {/* Fila 2 (3) */}
          <KpiRow>
            <KpiCard title="Ingresos mensuales" value="$560,000.00" size="md" />
            <KpiCard title="Egresos mensuales" value="$315,000.00" size="md" />
            <KpiCard title="Utilidad bruta" value="$245,000.00" size="md" />
          </KpiRow>

          {/* Fila 3 (4) — aquí estaba el problema */}
          <KpiRow nowrap>
            <KpiCard title="Facturas emitidas (mes)" value="112" size="md4" />
            <KpiCard title="Facturas recibidas" value="100" size="md4" />
            <KpiCard title="ISR" value="$5,000.00" size="md4" />
            <KpiCard title="iVA" value="$10,000" size="md4" />
          </KpiRow>

          <KpiRow nowrap>
            <KpiInputCard title="Impuestos" value={impuestos} onChange={setImpuestos} size="sm" />
            <KpiCard title="Cumplimiento fiscal" value="OK" size="md4" />
          </KpiRow>
        </div>
      </div>
    </section>
    <div className="py-6">
      <GraficasFinanzas />
    </div>
      </div>
    )}
    {data.title === 'Administrativo' && (
      <div>
        <div className="flex justify-center mt-10">
      <div className="w-75 py-4 rounded-2xl border border-slate-200 bg-white/90 text-center shadow-sm backdrop-blur transition-transform duration-150 hover:-translate-y-0.5 hover:shadow-md">
        <p className={`font-medium text-slate-500`}>Ingreso Anual</p>
        <p className={`mt-1 font-bold tracking-tight`}>
          $6,720,000.00
        </p>
      </div>
    </div>
    <section className="w-full">
      {/* ancho global compacto */}
      <div className="mx-auto max-w-[1120px] px-4 py-10 lg:py-14">
        <h2 className="text-center text-4xl font-extrabold tracking-tight text-violet-700">
          KPI'S
        </h2>

        <div className="mt-8 space-y-6">
          {/* Fila 1 (1) */}
          <KpiRow>
            <KpiCard title="No. de Usuarios" value="200" size="md" />
          </KpiRow>

          {/* Fila 2 (3) */}
          <KpiRow>
            <KpiCard title="Ingresos mensuales" value="$560,000.00" size="md" />
            <KpiCard title="Egresos mensuales" value="$315,000.00" size="md" />
            <KpiCard title="Utilidad bruta" value="$245,000.00" size="md" />
          </KpiRow>

          {/* Fila 3 (4) — aquí estaba el problema */}
          <KpiRow nowrap>
            <KpiCard title="Costos mensuales" value="$12,000.00" size="md4" />
            <KpiCard title="CAC" value="$350.00" size="md4" />
            <KpiCard title="CLTV" value="$9,500.00" size="md4" />
            <KpiCard title="Margen de rentabilidad" value="43%" size="md4" />
          </KpiRow>

          {/* Fila 4 (5) */}
          <KpiRow gap="tight">
            <KpiCard title="Costo por alumno" value="$944.00" size="sm" />
            <KpiCard title="Ingreso promedio por alumno" value="$1,300.00" size="sm" />
            <KpiCard title="Rentabilidad" value="25%" size="sm" />
            <KpiInputCard title="Impuestos" value={impuestos} onChange={setImpuestos} size="sm" />
            <KpiCard title="Utilidad neta" value="$200,000.00" size="sm" highlight />
          </KpiRow>
        </div>
      </div>
    </section>
    <div className="py-6">
      <GraficasFinanzas />
    </div>
      </div>
    )}
    {data.title === 'Gestión' && (
      <div>
        <div className="flex justify-center mt-10">
      <div className="w-75 py-4 rounded-2xl border border-slate-200 bg-white/90 text-center shadow-sm backdrop-blur transition-transform duration-150 hover:-translate-y-0.5 hover:shadow-md">
        <p className={`font-medium text-slate-500`}>Ingreso Anual</p>
        <p className={`mt-1 font-bold tracking-tight`}>
          $6,720,000.00
        </p>
      </div>
    </div>
    <section className="w-full">
      {/* ancho global compacto */}
      <div className="mx-auto max-w-[1120px] px-4 py-10 lg:py-14">
        <h2 className="text-center text-4xl font-extrabold tracking-tight text-violet-700">
          KPI'S
        </h2>

        <div className="mt-8 space-y-6">
          {/* Fila 1 (1) */}
          <KpiRow>
            <KpiCard title="No. de Usuarios" value="200" size="md" />
          </KpiRow>

          {/* Fila 2 (3) */}
          <KpiRow>
            <KpiCard title="Ingresos mensuales" value="$560,000.00" size="md" />
            <KpiCard title="Egresos mensuales" value="$315,000.00" size="md" />
            <KpiCard title="Utilidad bruta" value="$245,000.00" size="md" />
          </KpiRow>

          {/* Fila 3 (4) — aquí estaba el problema */}
          <KpiRow nowrap>
            <KpiCard title="Costos mensuales" value="$12,000.00" size="md4" />
            <KpiCard title="CAC" value="$350.00" size="md4" />
            <KpiCard title="CLTV" value="$9,500.00" size="md4" />
            <KpiCard title="Margen de rentabilidad" value="43%" size="md4" />
          </KpiRow>

          {/* Fila 4 (5) */}
          <KpiRow gap="tight">
            <KpiCard title="Costo por alumno" value="$944.00" size="sm" />
            <KpiCard title="Ingreso promedio por alumno" value="$1,300.00" size="sm" />
            <KpiCard title="Rentabilidad" value="25%" size="sm" />
            <KpiInputCard title="Impuestos" value={impuestos} onChange={setImpuestos} size="sm" />
            <KpiCard title="Utilidad neta" value="$200,000.00" size="sm" highlight />
          </KpiRow>
        </div>
      </div>
    </section>
    <div className="py-6">
      <GraficasFinanzas />
    </div>
      </div>
    )}
    {data.title === 'Estrategica' && (
      <div>
        <div className="flex justify-center mt-10">
      <div className="w-75 py-4 rounded-2xl border border-slate-200 bg-white/90 text-center shadow-sm backdrop-blur transition-transform duration-150 hover:-translate-y-0.5 hover:shadow-md">
        <p className={`font-medium text-slate-500`}>Ingreso Anual</p>
        <p className={`mt-1 font-bold tracking-tight`}>
          $6,720,000.00
        </p>
      </div>
    </div>
    <section className="w-full">
      {/* ancho global compacto */}
      <div className="mx-auto max-w-[1120px] px-4 py-10 lg:py-14">
        <h2 className="text-center text-4xl font-extrabold tracking-tight text-violet-700">
          KPI'S
        </h2>

        <div className="mt-8 space-y-6">
          {/* Fila 1 (1) */}
          <KpiRow>
            <KpiCard title="No. de Usuarios" value="200" size="md" />
          </KpiRow>

          {/* Fila 2 (3) */}
          <KpiRow>
            <KpiCard title="Ingresos mensuales" value="$560,000.00" size="md" />
            <KpiCard title="Egresos mensuales" value="$315,000.00" size="md" />
            <KpiCard title="Utilidad bruta" value="$245,000.00" size="md" />
          </KpiRow>

          {/* Fila 3 (4) — aquí estaba el problema */}
          <KpiRow nowrap>
            <KpiCard title="Costos mensuales" value="$12,000.00" size="md4" />
            <KpiCard title="CAC" value="$350.00" size="md4" />
            <KpiCard title="CLTV" value="$9,500.00" size="md4" />
            <KpiCard title="Margen de rentabilidad" value="43%" size="md4" />
          </KpiRow>

          {/* Fila 4 (5) */}
          <KpiRow gap="tight">
            <KpiCard title="Costo por alumno" value="$944.00" size="sm" />
            <KpiCard title="Ingreso promedio por alumno" value="$1,300.00" size="sm" />
            <KpiCard title="Rentabilidad" value="25%" size="sm" />
            <KpiInputCard title="Impuestos" value={impuestos} onChange={setImpuestos} size="sm" />
            <KpiCard title="Utilidad neta" value="$200,000.00" size="sm" highlight />
          </KpiRow>
        </div>
      </div>
    </section>
    <div className="py-6">
      <GraficasFinanzas />
    </div>
      </div>
    )}
    {data.title === 'Perfil Asesor' && (
      <div>
        <div className="flex justify-center mt-10">
      <div className="w-75 py-4 rounded-2xl border border-slate-200 bg-white/90 text-center shadow-sm backdrop-blur transition-transform duration-150 hover:-translate-y-0.5 hover:shadow-md">
        <p className={`font-medium text-slate-500`}>Ingreso Anual</p>
        <p className={`mt-1 font-bold tracking-tight`}>
          $6,720,000.00
        </p>
      </div>
    </div>
    <section className="w-full">
      {/* ancho global compacto */}
      <div className="mx-auto max-w-[1120px] px-4 py-10 lg:py-14">
        <h2 className="text-center text-4xl font-extrabold tracking-tight text-violet-700">
          KPI'S
        </h2>

        <div className="mt-8 space-y-6">
          {/* Fila 1 (1) */}
          <KpiRow>
            <KpiCard title="No. de Usuarios" value="200" size="md" />
          </KpiRow>

          {/* Fila 2 (3) */}
          <KpiRow>
            <KpiCard title="Ingresos mensuales" value="$560,000.00" size="md" />
            <KpiCard title="Egresos mensuales" value="$315,000.00" size="md" />
            <KpiCard title="Utilidad bruta" value="$245,000.00" size="md" />
          </KpiRow>

          {/* Fila 3 (4) — aquí estaba el problema */}
          <KpiRow nowrap>
            <KpiCard title="Costos mensuales" value="$12,000.00" size="md4" />
            <KpiCard title="CAC" value="$350.00" size="md4" />
            <KpiCard title="CLTV" value="$9,500.00" size="md4" />
            <KpiCard title="Margen de rentabilidad" value="43%" size="md4" />
          </KpiRow>

          {/* Fila 4 (5) */}
          <KpiRow gap="tight">
            <KpiCard title="Costo por alumno" value="$944.00" size="sm" />
            <KpiCard title="Ingreso promedio por alumno" value="$1,300.00" size="sm" />
            <KpiCard title="Rentabilidad" value="25%" size="sm" />
            <KpiInputCard title="Impuestos" value={impuestos} onChange={setImpuestos} size="sm" />
            <KpiCard title="Utilidad neta" value="$200,000.00" size="sm" highlight />
          </KpiRow>
        </div>
      </div>
    </section>
    <div className="py-6">
      <GraficasFinanzas />
    </div>
      </div>
    )}
    </>
  );
}