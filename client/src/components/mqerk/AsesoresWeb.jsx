import { useState } from "react";
import Kelvin from "../../assets/mqerk/Asesores/5.png";
import Ruth from "../../assets/mqerk/Asesores/6.png";
import Emmanuel from "../../assets/mqerk/Asesores/7.png";
import Cesar from "../../assets/mqerk/Asesores/8.png";
import Alex from "../../assets/mqerk/Asesores/9.png";

const asesores = [
  { nombre: "Kelvin Ramírez", rol: "Asesor Cienytec", img: Kelvin },
  { nombre: "Emmanuel López", rol: "Asesor Psicoeducativo", img: Emmanuel },
  { nombre: "Ruth Chávez", rol: "Asesora de MKT", img: Ruth },
  { nombre: "Alejandro Tellez", rol: "Asesor en sistemas", img: Alex },
  { nombre: "César Lagunes", rol: "English Teacher", img: Cesar },
];

export default function Asesores() {
  const [active, setActive] = useState(null); // índice de la tarjeta hover (solo desktop)

  return (
    <section className=" bg-white mb-12">
      {/* Título */}
      <h2 className="text-3xl md:text-4xl font-extrabold text-[#F4138A] text-center mb-12">
        Nuestros Asesores
      </h2>

      {/* GRID (desktop) con efecto spotlight */}
      <div
        className="hidden md:grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 px-6"
        onMouseLeave={() => setActive(null)}
      >
        {asesores.map((a, i) => {
          const isActive = active === i;
          const isDim = active !== null && active !== i;

          return (
            <div
                key={i}
                onMouseEnter={() => setActive(i)}
                className={[
                    "relative rounded-[22px] shadow-lg transition-all duration-300 ease-out will-change-transform",
                    "bg-gradient-to-tr from-blue-600 to-purple-600 p-1",
                    isActive
                    ? "md:-translate-y-2 md:scale-[1.06] md:shadow-2xl md:z-20"
                    : "md:translate-y-0 md:scale-100 md:z-10",
                    isDim ? "md:opacity-80" : "md:opacity-100",
                ].join(" ")}
                >
                <div className="relative rounded-[20px] overflow-hidden h-[420px]">
                    {/* Imagen a pantalla completa */}
                    <img
                    src={a.img}
                    alt={a.nombre}
                    className="absolute inset-0 w-full h-full object-cover"
                    />

                    {/* Degradado en la parte inferior */}
                    <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/60 to-transparent" />

                    {/* Texto sobre el degradado */}
                    <div className="absolute bottom-4 left-4 right-4 text-white z-10">
                    <h3 className="font-extrabold text-2xl">{a.nombre}</h3>
                    <p className="text-sm opacity-95">{a.rol}</p>
                    </div>
                </div>
            </div>
          );
        })}
      </div>

      {/* Carrusel móvil (scroll nativo) */}
      <div className="md:hidden px-6">
        <div className="flex space-x-4 overflow-x-auto snap-x snap-mandatory pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {asesores.map((a, i) => (
            <div
              key={i}
              className="snap-center min-w-[75%] rounded-[22px] shadow-lg bg-gradient-to-tr from-blue-600 to-purple-600 p-1 flex-shrink-0"
            >
              <div className="bg-white/0 rounded-[20px] overflow-hidden">
                <div className="relative h-[380px] flex items-end justify-center rounded-[20px] overflow-hidden">
                  <div className="absolute inset-0 rounded-[20px] bg-[radial-gradient(120%_120%_at_0%_0%,#4f46e5_0%,#7c3aed_70%,#6d28d9_100%)]" />
                  <img
                    src={a.img}
                    alt={a.nombre}
                    className="relative z-10 object-contain h-full"
                  />
                  <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/40 to-transparent z-10" />
                  <div className="absolute bottom-4 left-4 right-4 z-20 text-white">
                    <h3 className="font-extrabold text-xl">{a.nombre}</h3>
                    <p className="text-sm opacity-95">{a.rol}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
