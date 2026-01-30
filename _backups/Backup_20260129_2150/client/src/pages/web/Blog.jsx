import { useState, useEffect } from "react";
import Navbar from "../../components/mqerk/Navbar";
import Footer from "../../components/layout/footer";
import { FaTag, FaSearch, FaChevronDown } from "react-icons/fa";
import { IoMdEye } from "react-icons/io";

import {
  Uno, Dos, Tres, Cuatro, Cinco, Seis, Siete, Ocho, Nueve, Diez,
  Once, Doce, Trece, Catorce, Quince, Dieciseis, Diecisiete,
  Dieciocho, Diecinueve, Veinte
} from "../../assets/mqerk/blog";

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

// --- COMPONENTE HELPER PARA IMÁGENES ---
// Esto hace que la tarjeta aparezca YA, y la imagen cargue suavemente después
const TarjetaImagen = ({ src, alt, categoria }) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="aspect-video sm:aspect-[16/10] w-full overflow-hidden rounded-t-2xl bg-gray-200 relative">
      {/* SKELETON: Se muestra mientras carga */}
      {!loaded && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}

      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        className={`h-full w-full object-cover transition-all duration-700 ease-in-out will-change-transform group-hover:scale-105 
          ${loaded ? "opacity-100 blur-0" : "opacity-0 blur-sm"}`}
      />

      {/* Etiqueta Flotante (solo móvil) */}
      <div className="absolute bottom-2 left-2 sm:hidden z-10">
        <span className="inline-flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-bold text-blue-700 shadow-sm">
          <FaTag className="h-3 w-3" />
          {categoria}
        </span>
      </div>
    </div>
  );
};

export default function Blog() {
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("Todos");
  const [visibleCount, setVisibleCount] = useState(8);

  const tarjetasFiltradas =
    categoriaSeleccionada === "Todos"
      ? tarjetas
      : tarjetas.filter((t) => t.categoria === categoriaSeleccionada);

  useEffect(() => {
    setVisibleCount(8);
  }, [categoriaSeleccionada]);

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 8);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">

        {/* Encabezado */}
        <div className="flex flex-col gap-2 sm:gap-3 mb-6">
          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-slate-900">
            Categorías
          </h1>
          <div className="h-1 w-16 sm:w-20 rounded bg-blue-600" />
        </div>

        {/* Filtros */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {categorias.map((cat) => {
              const active = categoriaSeleccionada === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setCategoriaSeleccionada(cat)}
                  className={`rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200
                    ${active
                      ? "bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-100 ring-offset-1"
                      : "bg-white text-blue-700 border-blue-200 hover:border-blue-400 hover:bg-blue-50"
                    }`}
                  aria-pressed={active}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {tarjetasFiltradas.length > 0 ? (
          <>
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {tarjetasFiltradas.slice(0, visibleCount).map((card, i) => (
                <article
                  key={i}
                  className="group flex flex-col rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 transform-gpu h-full"
                >
                  {/* Usamos el nuevo componente de imagen optimizado */}
                  <TarjetaImagen src={card.imagen} alt={card.titulo} categoria={card.categoria} />

                  <div className="p-4 flex flex-col flex-grow">
                    <h3 className="text-lg font-semibold text-slate-900 leading-snug line-clamp-3 mb-2">
                      {card.titulo}
                    </h3>

                    <div className="mt-auto">
                      <div className="flex items-center justify-between text-xs sm:text-sm text-slate-500 mb-3 border-t border-slate-100 pt-3">
                        <span>{card.fecha}</span>
                        <span className="inline-flex items-center gap-1">
                          <IoMdEye className="h-4 w-4 sm:h-5 sm:w-5" />
                          {card.visitas}
                        </span>
                      </div>

                      <div className="hidden sm:flex items-center justify-between text-sm text-slate-600 mb-4">
                        <span className="inline-flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-md">
                          <FaTag className="h-3 w-3" />
                          {card.categoria}
                        </span>
                      </div>

                      <button className="w-full sm:w-auto text-center sm:text-left text-sm font-medium text-blue-700 hover:text-blue-800 transition-colors">
                        Lee más aquí →
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </section>

            {visibleCount < tarjetasFiltradas.length && (
              <div className="mt-12 sm:mt-16 flex flex-col items-center justify-center pb-8">
                <div className="w-full h-px bg-gray-200 mb-6 sm:mb-8 max-w-xs mx-auto"></div>
                <button
                  onClick={handleLoadMore}
                  className="group relative inline-flex items-center gap-2 px-8 py-3 bg-blue-600 text-white text-sm font-semibold rounded-full shadow-lg hover:bg-blue-700 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-200"
                >
                  <span>Cargar más artículos</span>
                  <FaChevronDown className="h-3 w-3 transition-transform duration-300 group-hover:translate-y-1" />
                </button>
                <p className="mt-4 text-xs text-gray-400 font-medium uppercase tracking-wider">
                  Mostrando {visibleCount} de {tarjetasFiltradas.length} posts
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="mt-12 sm:mt-20 flex flex-col items-center justify-center text-center animate-fade-in-up px-4">
            <div className="bg-blue-50 p-5 sm:p-6 rounded-full mb-6">
              <FaSearch className="h-10 w-10 sm:h-12 sm:w-12 text-blue-400 opacity-80" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">
              No hay artículos por el momento
            </h3>
            <p className="text-slate-500 max-w-md mx-auto text-sm sm:text-base">
              Aún no hemos publicado contenido en la categoría <span className="font-semibold text-blue-600">"{categoriaSeleccionada}"</span>.
            </p>
            <button
              onClick={() => setCategoriaSeleccionada("Todos")}
              className="mt-6 w-full sm:w-auto px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition shadow-md"
            >
              Ver todos los artículos
            </button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}