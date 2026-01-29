import { useState } from "react";
import Navbar from "../../components/mqerk/Navbar";
import Footer from "../../components/footer";
import { FaTag } from "react-icons/fa";
import { IoMdEye } from "react-icons/io";
// IMÁGENES (mantén tus rutas)
import Uno from "../../assets/mqerk/blog/1.webp";
import Dos from "../../assets/mqerk/blog/2.webp";
import Tres from "../../assets/mqerk/blog/3.webp";
import Cuatro from "../../assets/mqerk/blog/4.webp";
import Cinco from "../../assets/mqerk/blog/5.webp";
import Seis from "../../assets/mqerk/blog/13.webp";
import Siete from "../../assets/mqerk/blog/6.webp";
import Ocho from "../../assets/mqerk/blog/7.webp";
import Nueve from "../../assets/mqerk/blog/8.webp";
import Diez from "../../assets/mqerk/blog/10.webp";
import Once from "../../assets/mqerk/blog/17.webp";
import Doce from "../../assets/mqerk/blog/16.webp";
import Trece from "../../assets/mqerk/blog/18.webp";
import Catorce from "../../assets/mqerk/blog/20.webp";
import Quince from "../../assets/mqerk/blog/19.webp";
import Dieciseis from "../../assets/mqerk/blog/14.webp";
import Diecisiete from "../../assets/mqerk/blog/11.webp";
import Dieciocho from "../../assets/mqerk/blog/13.webp";
import Diecinueve from "../../assets/mqerk/blog/9.webp";
import Veinte from "../../assets/mqerk/blog/12.webp";

const categorias = ["Todos", "Admisión", "Educación", "STEM", "Salud", "Ambiental"];

const tarjetas = [
  { categoria: "STEM", titulo: "¿Por qué fallas en problemas de física? Descubre el truco para entenderlos mejor.", fecha: "02/06/2025", visitas: "1k", imagen: Uno },
  { categoria: "STEM", titulo: "Matemáticas que sí sirven: ¿Cómo usar álgebra para resolver problemas reales?", fecha: "02/06/2025", visitas: "1k", imagen: Dos },
  { categoria: "Educación", titulo: "Estudia con ciencia: Técnicas de memorización que funcionan según la neurociencia.", fecha: "02/06/2025", visitas: "1k", imagen: Tres },
  { categoria: "STEM", titulo: "¡Entiende la tabla periódica sin morir en el intento!", fecha: "02/06/2025", visitas: "1k", imagen: Cuatro },
  { categoria: "STEM", titulo: "¿Por qué es tan importante aprender a programar desde joven?", fecha: "02/06/2025", visitas: "1k", imagen: Cinco },
  { categoria: "Educación", titulo: "Experimentos sencillos para entender los estados de la materia (sin laboratorio).", fecha: "02/06/2025", visitas: "1k", imagen: Seis },
  { categoria: "Salud", titulo: "Biología para la vida: ¿Cómo funciona tu sistema inmunológico realmente?", fecha: "02/06/2025", visitas: "1k", imagen: Siete },
  { categoria: "STEM", titulo: "Electricidad sin enredos: Entiende voltaje, corriente y resistencia con ejemplos reales.", fecha: "02/06/2025", visitas: "1k", imagen: Ocho },
  { categoria: "Educación", titulo: "Ciencias que se ven y se sienten: ¿Cómo hacer un diario de observación científica?", fecha: "02/06/2025", visitas: "1k", imagen: Nueve },
  { categoria: "STEM", titulo: "¿Cuál es el método científico y cómo lo aplicas tú sin darte cuenta?", fecha: "02/06/2025", visitas: "1k", imagen: Diez },
  { categoria: "Ambiental", titulo: "¿Por qué el calentamiento global es más que una moda? Ciencia detrás del cambio climático.", fecha: "02/06/2025", visitas: "1k", imagen: Once },
  { categoria: "STEM", titulo: "¿Como resolver problemas matemáticos paso a paso sin frustrarse?", fecha: "02/06/2025", visitas: "1k", imagen: Doce },
  { categoria: "STEM", titulo: "Tecnología en la escuela: Las mejores herramientas gratuitas para aprender mejor.", fecha: "02/06/2025", visitas: "1k", imagen: Trece },
  { categoria: "Educación", titulo: "Química en tu casa: Experimentos fáciles con materiales comunes.", fecha: "02/06/2025", visitas: "1k", imagen: Catorce },
  { categoria: "Salud", titulo: "Cerebro y ansiedad ante exámenes: cómo regularte según la ciencia", fecha: "02/06/2025", visitas: "1k", imagen: Quince },
  { categoria: "STEM", titulo: "Los números no muerden: ¿Qué son las funciones y cómo entenderlas visualmente?", fecha: "02/06/2025", visitas: "1k", imagen: Dieciseis },
  { categoria: "STEM", titulo: "¿Cómo piensan los grandes científicos? El arte de hacer preguntas inteligentes.", fecha: "02/06/2025", visitas: "1k", imagen: Diecisiete },
  { categoria: "Educación", titulo: "Proyectos escolares con impacto: Ideas científicas para ferias o exposiciones.", fecha: "02/06/2025", visitas: "1k", imagen: Dieciocho },
  { categoria: "STEM", titulo: "Robots, drones y sensores: aprende hoy para ser ingeniero mañana.", fecha: "02/06/2025", visitas: "1k", imagen: Diecinueve },
  { categoria: "Educación", titulo: "¿Cómo aplicar la ciencia en tu vida diaria? Desde cocinar hasta andar en bici.", fecha: "02/06/2025", visitas: "1k", imagen: Veinte },
];

export default function Blog() {
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("Todos");
  const [visibleCount, setVisibleCount] = useState(8);

  const tarjetasFiltradas =
    categoriaSeleccionada === "Todos"
      ? tarjetas
      : tarjetas.filter((t) => t.categoria === categoriaSeleccionada);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Encabezado */}
        <div className="flex flex-col gap-3">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
            Categorías
          </h1>
          <div className="h-1 w-20 rounded bg-blue-600" />
        </div>

        {/* Filtros (píldoras) */}
        <div className="mt-6 -mx-4 px-4 overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-2 sm:gap-3 w-max sm:w-auto">
            {categorias.map((cat) => {
              const active = categoriaSeleccionada === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setCategoriaSeleccionada(cat)}
                  className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm transition
                    ${active
                      ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                      : "bg-white text-blue-700 border-blue-300 hover:border-blue-500"
                    }`}
                  aria-pressed={active}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Grid de tarjetas */}
        <section className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {tarjetasFiltradas.map((card, i) => (
            <article
              key={i}
              className="group rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition hover:-translate-y-0.5"
            >
              {/* Imagen con proporción */}
              <div className="aspect-[16/10] w-full overflow-hidden rounded-t-2xl">
                <img
                  src={card.imagen}
                  alt={card.titulo}
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                  loading="lazy"
                />
              </div>

              {/* Contenido */}
              <div className="p-4">
                <h3 className="text-lg font-semibold text-slate-900 leading-snug">
                  {card.titulo}
                </h3>

                <div className="mt-3 text-sm text-slate-500">{card.fecha}</div>

                <div className="mt-3 flex items-center justify-between text-sm text-slate-600">
                  <span className="inline-flex items-center gap-1">
                    <FaTag className="h-4 w-4" />
                    {card.categoria}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <IoMdEye className="h-5 w-5" />
                    {card.visitas}
                  </span>
                </div>

                <div className="mt-4">
                  <button
                    className="text-sm font-medium text-blue-700 hover:text-blue-800"
                    type="button"
                  >
                    Lee más aquí →
                  </button>
                </div>
              </div>
            </article>
          ))}
        </section>
      </main>

      <Footer />
    </div>
  );
}
