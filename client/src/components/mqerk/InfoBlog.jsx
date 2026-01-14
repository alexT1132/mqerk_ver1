export default function BlogArticleDetail({ article }) {
  const sample = article || {
    title: "¿Por qué fallas en problemas de física?",
    subtitle:
      "Exploramos las causas más comunes por las que los estudiantes fracasan al resolver problemas de física y cómo superarlas.",
    author: "Kelumy - MQerKAcademy",
    date: "Feb 14, 2025",
    readTime: "7 min",
    tags: ["Física", "Resolución de problemas", "Educación"],
    images: [
      "https://images.pexels.com/photos/256302/pexels-photo-256302.jpeg", // students in classroom
      "https://images.pexels.com/photos/256369/pexels-photo-256369.jpeg", // physics diagram on board
      "https://images.pexels.com/photos/1181359/pexels-photo-1181359.jpeg", // student studying at desk
      "https://images.pexels.com/photos/3184636/pexels-photo-3184636.jpeg", // teacher explaining to students
    ],
    hero: "https://images.pexels.com/photos/4144222/pexels-photo-4144222.jpeg", // hero physics study
    contentParagraphs: [
      "Resolver problemas de física es una de las dificultades más comunes para los estudiantes. A pesar de comprender la teoría, muchos fallan al enfrentarse a situaciones prácticas.",
      "Entre las causas frecuentes encontramos el poco hábito de lectura comprensiva del enunciado, la falta de práctica en el análisis de variables, y la tendencia a memorizar fórmulas sin entender el razonamiento detrás de ellas.",
      "Estudios como los de Schoenfeld (1985) y Bloom (1956) muestran que el aprendizaje real ocurre cuando los estudiantes participan activamente, reflexionan sobre sus procesos y reciben retroalimentación constante.",
      "El método de enseñanza llamado 'La Ondulación' fomenta que los alumnos trabajen colaborativamente, discutan sus dudas y construyan el conocimiento a través de la interacción con sus compañeros y guías.",
    ],
    practicas: [
      "Lee el enunciado al menos dos veces para comprenderlo.",
      "Identifica y subraya los datos conocidos y lo que se pide.",
      "Elabora un diagrama de la situación antes de aplicar fórmulas.",
      "Resuelve paso a paso y verifica la coherencia de unidades.",
      "Comparte tu solución con un compañero y detecten errores juntos.",
    ],
    recuerden:
      "No se trata de memorizar fórmulas, sino de comprender el porqué de cada paso. El razonamiento y la práctica en equipo fortalecen las habilidades para resolver problemas complejos.",
    references: [
      { label: "Schoenfeld, A. (1985). Mathematical Problem Solving.", url: "#" },
      { label: "Bloom, B. (1956). Taxonomía de los objetivos de la educación.", url: "#" },
      { label: "Método La Ondulación - MQerKAcademy", url: "#" },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* HERO */}
        <div className="md:flex">
          <div className="md:w-2/3 p-6">
            <div className="rounded-lg overflow-hidden shadow-sm">
              <img
                src={sample.hero}
                alt="Hero"
                className="w-full h-64 object-cover"
                loading="lazy"
              />
            </div>

            <div className="mt-6">
              <nav className="text-sm text-gray-500">Inicio / Blog / {sample.tags[0]}</nav>
              <h1 className="mt-3 text-3xl md:text-4xl font-extrabold tracking-tight">{sample.title}</h1>
              <p className="mt-2 text-gray-700">{sample.subtitle}</p>

              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-teal-400 to-indigo-500 flex items-center justify-center text-white font-semibold">K</div>
                    <div className="text-sm">
                      <div className="font-medium">{sample.author}</div>
                      <div className="text-gray-500 text-xs">{sample.date} · {sample.readTime}</div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {sample.tags.map((t) => (
                    <span key={t} className="text-xs px-2 py-1 bg-gray-100 rounded-full">#{t}</span>
                  ))}
                  <button className="ml-2 px-3 py-1 text-sm rounded-lg border">Compartir</button>
                </div>
              </div>

              {/* IMAGE GALLERY */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-3">
                {sample.images.map((img, i) => (
                  <div key={i} className="rounded overflow-hidden shadow-sm">
                    <img
                      src={img}
                      alt={`Imagen relacionada ${i + 1}`}
                      className="w-full h-40 object-cover"
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>

              {/* ARTICLE BODY */}
              <article className="prose prose-lg max-w-none mt-6">
                {sample.contentParagraphs.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}

                <h2>Errores comunes y por qué ocurren</h2>
                <ul>
                  <li>No leer con atención el enunciado del problema.</li>
                  <li>Aplicar fórmulas sin analizar si corresponden al caso.</li>
                  <li>No representar gráficamente la situación.</li>
                  <li>Descuidar la coherencia de las unidades físicas.</li>
                </ul>

                <h2>Ejemplo resuelto</h2>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <strong>Problema:</strong> Un bloque de 5 kg se desliza por un plano inclinado de 30°. Calcula la fuerza paralela al plano y la aceleración del bloque.
                  <br />
                  <strong>Solución:</strong> Se descompone el peso, se aplica la segunda ley de Newton y se obtiene la aceleración considerando g = 9.8 m/s².
                </div>

                {/* Practicas (highlight card) */}
                <div className="mt-6 grid md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg border-l-4 border-teal-400 bg-gradient-to-br from-white to-gray-50">
                    <h3 className="font-semibold">Prácticas</h3>
                    <ol className="mt-2 ml-4 list-decimal text-gray-700">
                      {sample.practicas.map((it, idx) => (
                        <li key={idx}>{it}</li>
                      ))}
                    </ol>
                  </div>

                  <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200">
                    <h3 className="font-semibold">Recuerden</h3>
                    <p className="mt-2 text-sm text-gray-800">{sample.recuerden}</p>
                  </div>
                </div>

                <h3 className="mt-6">Recursos y referencias</h3>
                <ul>
                  {sample.references.map((r, i) => (
                    <li key={i}><a href={r.url} className="text-teal-600 underline">{r.label}</a></li>
                  ))}
                </ul>
              </article>

              {/* Comments CTA */}
              <div className="mt-8 p-4 border rounded-lg bg-white">
                <h4 className="font-semibold">Comentarios</h4>
                <p className="text-sm text-gray-500">Comparte tu experiencia resolviendo este tipo de problemas.</p>
                <div className="mt-3 flex gap-3">
                  <input type="text" placeholder="Escribe un comentario..." className="flex-1 px-3 py-2 border rounded-lg" />
                  <button className="px-4 py-2 bg-teal-500 text-white rounded-lg">Publicar</button>
                </div>
              </div>
            </div>
          </div>

          {/* SIDEBAR */}
          <aside className="md:w-1/3 p-6 border-l hidden md:block">
            <div className="sticky top-8 space-y-6">
              <div className="p-3 bg-gradient-to-r from-indigo-50 to-white rounded-lg">
                <h5 className="font-semibold">Contenido relacionado</h5>
                <div className="mt-3 space-y-3">
                  {[
                    {t: "Matemáticas que sí sirven", img: "https://images.pexels.com/photos/5905903/pexels-photo-5905903.jpeg"},
                    {t: "Estudia con ciencia", img: "https://images.pexels.com/photos/4144221/pexels-photo-4144221.jpeg"},
                    {t: "Tabla periódica sin morir", img: "https://images.pexels.com/photos/256417/pexels-photo-256417.jpeg"},
                  ].map((a) => (
                    <a key={a.t} className="flex items-center gap-3 p-2 rounded hover:bg-gray-100" href="#">
                      <img src={a.img} alt="thumb" className="w-12 h-12 rounded object-cover" />
                      <div>
                        <div className="text-sm font-medium">{a.t}</div>
                        <div className="text-xs text-gray-500">5 min · Lectura</div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-white rounded-lg shadow">
                <h6 className="font-semibold">Descargar guía</h6>
                <p className="text-sm text-gray-500 mt-2">Ficha rápida con ejercicios y soluciones.</p>
                <button className="mt-3 w-full py-2 rounded-lg bg-indigo-600 text-white">Descargar PDF</button>
              </div>

              <div className="p-3 bg-white rounded-lg shadow">
                <h6 className="font-semibold">Cursos relacionados</h6>
                <p className="text-sm text-gray-500 mt-2">Prepárate con nuestro curso intensivo de Física.</p>
                <a className="mt-3 inline-block text-sm text-indigo-600 underline" href="#">Ver curso</a>
              </div>

            </div>
          </aside>
        </div>

        {/* FOOTER CTA */}
        <div className="border-t p-6 bg-indigo-50 flex items-center justify-between">
          <div>
            <div className="text-lg font-semibold">¿Quieres practicar más?</div>
            <div className="text-sm text-gray-700">Accede a ejercicios interactivos y tutorías personalizadas en MQerKAcademy.</div>
          </div>
          <div>
            <button className="px-6 py-3 bg-teal-500 text-white rounded-lg">Inscríbete ahora</button>
          </div>
        </div>
      </div>
    </div>
  );
}
