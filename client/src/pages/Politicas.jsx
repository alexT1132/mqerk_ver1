import Navbar from "../components/mqerk/Navbar";
import Footer from "../components/footer";

function Blog() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            Políticas de Privacidad
          </h1>
          <p className="text-blue-100 text-sm sm:text-base lg:text-lg max-w-2xl">
            MQerKAcademy® se compromete a proteger tu información personal y garantizar
            un entorno educativo seguro y transparente.
          </p>
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Introducción */}
        <section className="mb-12 bg-white rounded-xl shadow-sm p-6 sm:p-8">
          <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
            MQerKAcademy®, representada legalmente por Kelvin Valentín Gómez Ramírez con domicilio en Calle Juárez #25, 
            Colonia Centro, C.P. 68300, San Juan Bautista Tuxtepec, Oaxaca, México, RFC GORK980908K61, en su carácter de 
            persona física con actividad empresarial, emite la presente Política de Privacidad en cumplimiento de la Ley 
            Federal de Protección de Datos Personales en Posesión de los Particulares y su Reglamento.
          </p>
          
          <p className="mt-6 text-gray-700 leading-relaxed text-sm sm:text-base">
            En <strong className="text-gray-900">MQerKAcademy®</strong>, la privacidad de nuestros estudiantes, clientes y 
            visitantes es una prioridad. Esta Política de Privacidad explica cómo recopilamos, usamos, almacenamos, compartimos 
            y protegemos tu información personal cuando accedes a nuestros cursos, servicios o sitio web{" "}
            <a href="https://www.mqerkacademy.com" className="text-blue-600 hover:text-blue-700 underline transition">
              https://www.mqerkacademy.com
            </a>.
          </p>

          <p className="mt-6 text-gray-700 leading-relaxed text-sm sm:text-base">
            La presente Política de Privacidad se encuentra alineada con lo establecido en la{" "}
            <strong className="text-gray-900">
              Ley Federal de Protección de Datos Personales en Posesión de los Particulares
            </strong>{" "}
            (publicada en el Diario Oficial de la Federación el 5 de julio de 2010) y su{" "}
            <strong className="text-gray-900">Reglamento</strong> (publicado en el Diario Oficial de la Federación el 21 de 
            diciembre de 2011), así como en los <strong className="text-gray-900">Lineamientos del Aviso de Privacidad</strong>{" "}
            emitidos por el Instituto Nacional de Transparencia, Acceso a la Información y Protección de Datos Personales 
            (<strong className="text-gray-900">INAI</strong>), y demás disposiciones aplicables en materia de protección de 
            datos personales en México.
          </p>

          <p className="mt-6 text-gray-700 leading-relaxed text-sm sm:text-base">
            MQerKAcademy® se compromete a proporcionar un entorno de aprendizaje seguro, innovador y transparente. Al utilizar 
            nuestros servicios, aceptas los términos establecidos en este documento.
          </p>
        </section>

        {/* Sección 1 */}
        <PolicySection
          number="1"
          title="INFORMACIÓN QUE RECOPILAMOS"
          content={
            <>
              <p className="text-sm text-gray-600 mb-4">(bajo la NOM-151-SCFI-2016)</p>
              
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">a) Información personal que proporcionas:</h4>
                  <ul className="space-y-2 ml-4">
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span>Nombre completo</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span>Dirección de correo electrónico</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span>Número de teléfono (opcional)</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span>Edad o nivel académico (opcional, según el curso)</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span>Información de pago (si aplica)</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span>Preferencias de aprendizaje o comentarios que nos proporciones</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">b) Información recopilada automáticamente:</h4>
                  <ul className="space-y-2 ml-4">
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span>Dirección IP</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span>Tipo de navegador y dispositivo</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span>Páginas visitadas dentro de nuestros sitios</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span>Duración de la visita, clics, y patrones de navegación</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span>Datos de acceso a plataformas internas (por ejemplo, progreso en cursos)</span>
                    </li>
                  </ul>
                </div>

                <p className="text-gray-700">
                  La información personal será conservada únicamente durante el tiempo necesario para cumplir con las finalidades 
                  establecidas en este aviso y para el cumplimiento de obligaciones legales. En el caso de datos sensibles (como 
                  estado de salud, necesidades especiales de aprendizaje u otra información confidencial), se solicitará consentimiento 
                  expreso y por escrito, y su tratamiento se realizará con medidas de seguridad reforzadas.
                </p>

                <div className="border-t pt-6">
                  <p className="text-sm text-gray-600 mb-4">(Bajo la NOM-050-SCFI-2004)</p>
                  <p className="text-gray-700 mb-3">Utilizamos tus datos para los siguientes fines:</p>
                  <ul className="space-y-2 ml-4">
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span>Brindarte acceso a nuestros cursos y contenidos educativos</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span>Personalizar tu experiencia de aprendizaje</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span>Gestionar tu cuenta de usuario y seguimiento académico</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span>Procesar pagos y enviar comprobantes</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span>Enviar información relevante sobre nuestros servicios, promociones, eventos o mejoras (si lo autorizas)</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span>Cumplir con requisitos legales o contractuales</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span>Mejorar continuamente nuestros cursos, metodologías y plataforma</span>
                    </li>
                  </ul>
                </div>
              </div>
            </>
          }
        />

        {/* Sección 2 */}
        <PolicySection
          number="2"
          title="COMPARTICIÓN DE INFORMACIÓN"
          content={
            <>
              <p className="text-gray-700 mb-4">
                Tu información no será vendida ni alquilada. Solo será compartida en los siguientes casos:
              </p>

              <div className="space-y-4">
                <p className="text-gray-700">
                  Con proveedores de servicios contratados por MQerKAcademy® (por ejemplo, plataformas de pago, alojamiento web, 
                  herramientas de videoconferencia), quienes están obligados a proteger tu información. Algunos de estos proveedores 
                  pueden ubicarse fuera de México, lo que implica una transferencia internacional de datos; en tales casos se aplicarán 
                  cláusulas contractuales que aseguren un nivel de protección equivalente al previsto por la legislación mexicana.
                </p>

                <p className="text-gray-700">
                  Si es requerida por ley, procesos legales o autoridades competentes.
                </p>

                <p className="text-gray-700">
                  Si MQerKAcademy® se fusiona o es adquirida por otra entidad educativa, se notificará previamente.
                </p>
              </div>
            </>
          }
        />

        {/* Sección 3 */}
        <PolicySection
          number="3"
          title="COOKIES Y TECNOLOGÍAS SIMILARES"
          content={
            <>
              <p className="text-gray-700 mb-4">MQerKAcademy® utiliza cookies y herramientas similares para:</p>
              <ul className="space-y-2 ml-4 mb-4">
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>Recordar tus preferencias</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>Entender cómo usas nuestra plataforma</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>Mejorar el rendimiento y la seguridad del sitio</span>
                </li>
              </ul>
              <p className="text-gray-700">
                Puedes configurar tu navegador para rechazar cookies, aunque esto podría limitar algunas funcionalidades.
              </p>
            </>
          }
        />

        {/* Sección 4 */}
        <PolicySection
          number="4"
          title="SEGURIDAD DE LOS DATOS"
          content={
            <>
              <div className="">
                <p className="text-gray-700 mb-3">
                  Implementamos medidas de seguridad técnicas y administrativas para proteger tu información personal, como:
                </p>
                <ul className="space-y-2 ml-4 mb-4">
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span>Cifrado SSL en nuestras páginas</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span>Control de acceso a nuestros sistemas internos</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span>Protocolos de respaldo y recuperación</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span>Políticas internas de privacidad y capacitación del equipo</span>
                  </li>
                </ul>
                <p className="text-gray-700">
                  Aunque trabajamos constantemente para proteger tus datos, ningún sistema es 100% invulnerable. Recomendamos que 
                  también protejas tus datos personales (por ejemplo, no compartiendo contraseñas).
                </p>
              </div>
            </>
          }
        />

        {/* Sección 5 */}
        <PolicySection
          number="5"
          title="DERECHOS DEL USUARIO"
          content={
            <>
              <p className="text-gray-700 mb-4">Como usuario de MQerKAcademy®, tienes derecho a:</p>
              <ul className="space-y-2 ml-4 mb-4">
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>Acceder a tu información personal</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>Solicitar la rectificación de datos incorrectos</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>Solicitar la eliminación de tus datos (cuando no haya impedimentos legales o contractuales)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>Revocar el consentimiento para el uso de tus datos</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>Presentar una queja ante la autoridad competente de protección de datos</span>
                </li>
              </ul>
              <p className="text-gray-700">
                Puedes ejercer estos derechos escribiéndonos a:{" "}
                <a href="mailto:mqerkacademycienytec@gmail.com" className="text-blue-600 hover:text-blue-700 underline">
                  mqerkacademycienytec@gmail.com
                </a>
              </p>
            </>
          }
        />

        {/* Secciones restantes (6-14) con el mismo patrón */}
        <PolicySection
          number="6"
          title="MENORES DE EDAD"
          content={
            <>
              <p className="text-gray-700 mb-4">
                Para estudiantes menores de edad, MQerKAcademy® requiere el consentimiento expreso y verificable de los padres o 
                tutores, el cual se obtendrá mediante firma física o digital autenticada, junto con copia de identificación oficial 
                del tutor. Sin este requisito, no se podrá procesar ni conservar información personal del menor.
              </p>
              <p className="text-gray-700">
                MQerKAcademy® ofrece algunos cursos dirigidos a estudiantes menores de edad. En estos casos, se requiere el 
                consentimiento de los padres o tutores para el uso de datos personales. No recopilamos intencionalmente datos 
                personales de menores sin dicha autorización.
              </p>
            </>
          }
        />

        <PolicySection
          number="7"
          title="EVALUACIÓN ACADÉMICA"
          content={
            <>
              <p className="text-sm text-gray-600 mb-4">(bajo la NOM-008-SSA3-2017)</p>
              <p className="text-gray-700">
                En MQerKAcademy® se aplica un modelo de evaluación por competencias que busca valorar el desarrollo de habilidades 
                cognitivas, creativas y prácticas en el estudiante. Cada curso incluye actividades, proyectos, autoevaluaciones y 
                retroalimentación personalizada. Al finalizar nuestros cursos, se entregará una constancia o certificado correspondiente a la categoría y nivel del programa cursado. Este documento podrá ser emitido directamente por MQerKAcademy® o, en su caso, por alguna institución de educación oficial mexicana con la que se mantengan convenios de colaboración.
              </p>
            </>
          }
        />

        <PolicySection
          number="8"
          title="INCLUSIÓN Y ACCESIBILIDAD"
          content={
            <>
              <p className="text-sm text-gray-600 mb-4">
                (Bajo las NOM-050-SCFI-2004, NOM-008-SSA3-2017, y los principios de la educación inclusiva establecidos por la SEP)
              </p>
              <p className="text-gray-700">
                Contamos con interfaces accesibles, subtítulos, opciones de lectura en voz alta y acompañamiento pedagógico 
                especializado en caso de requerirse.
              </p>
            </>
          }
        />

        <PolicySection
          number="9"
          title="CONDUCTA ACADÉMICA Y ÉTICA DIGITAL"
          content={
            <>
              <p className="text-sm text-gray-600 mb-4">(Bajo la NOM-035-STPS-2018)</p>
              <p className="text-gray-700">
                Todos los estudiantes de MQerKAcademy deben conducirse con respeto, integridad y honestidad dentro de las aulas, 
                se prohíbe expresamente cualquier conducta ofensiva y discriminatoria. La infracción a estas normas podrá derivar 
                en advertencias, suspensión temporal o baja definitiva de la plataforma, según la gravedad del caso.
              </p>
            </>
          }
        />

        <PolicySection
          number="10"
          title="COMUNICACIÓN INSTITUCIONAL"
          content={
            <>
              <p className="text-sm text-gray-600 mb-4">(Bajo la NOM-151-SCFI-2016)</p>
              <p className="text-gray-700 mb-4">
                Toda comunicación oficial con estudiantes, padres o tutores se realizará únicamente por medio de:
              </p>
              <ol className="space-y-2 ml-6 mb-4 list-decimal">
                <li className="text-gray-700">Correos institucionales terminados en @mqerkacademycienytec.com</li>
                <li className="text-gray-700">Canal autorizado de WhatsApp</li>
                <li className="text-gray-700">Publicaciones en redes oficiales de la academia</li>
              </ol>
              <p className="text-gray-700">
                No se considerará válida ninguna información compartida por otros medios no reconocidos.
              </p>
            </>
          }
        />

        <PolicySection
          number="11"
          title="SEGURIDAD PSICOEMOCIONAL"
          content={
            <>
              <p className="text-sm text-gray-600 mb-4">(Bajo la NOM-035-STPS-2018)</p>
              <p className="text-gray-700 mb-4">
                Todos los estudiantes tendrán acceso a recursos de apoyo emocional, estrategias para manejar el estrés académico 
                y orientación con tutores formados en habilidades socioemocionales.
              </p>
              <p className="text-gray-700">
                Los reportes de acoso, presión, desmotivación o maltrato serán canalizados de forma confidencial y atendidos de 
                acuerdo con protocolos internos.
              </p>
            </>
          }
        />

        <PolicySection
          number="12"
          title="ACTUALIZACIÓN DE CONTENIDOS ACADÉMICOS"
          content={
            <>
              <p className="text-sm text-gray-600 mb-4">(Bajo la NOM-008-SSA3-2017)</p>
              <p className="text-gray-700">
                MQerKAcademy se compromete a revisar, mejorar y actualizar sus cursos, recursos y materiales didácticos según el 
                tipo de programa. Todo el contenido será desarrollado y validado por docentes especializados y revisado por el equipo 
                pedagógico antes de su publicación. Las actualizaciones no afectarán negativamente a estudiantes en curso: podrán 
                finalizar bajo la versión con la que iniciaron, o, si lo desean, migrar a la versión más reciente sin costo adicional.
              </p>
            </>
          }
        />

        <PolicySection
          number="13"
          title="CAMBIOS A ESTA POLÍTICA"
          content={
            <p className="text-gray-700">
              MQerKAcademy® puede actualizar esta Política de Privacidad en cualquier momento. En caso de cambios sustanciales, 
              notificará a los usuarios con al menos 15 días naturales de anticipación a su entrada en vigor, mediante correo 
              electrónico o anuncio en el sitio web.
            </p>
          }
        />

        <PolicySection
          number="14"
          title="CONTACTO"
          content={
            <>
              <p className="text-gray-700 mb-4">
                Si tienes preguntas, sugerencias o inquietudes relacionadas con nuestra Política de Privacidad o el tratamiento 
                de tus datos, contáctanos:{" "}
                <a href="tel:2871515760" className="text-blue-600 hover:text-blue-700 underline">
                  287-151-5760
                </a>{" "}
                o al correo{" "}
                <a href="mailto:mqerkacademycienytec@gmail.com" className="text-blue-600 hover:text-blue-700 underline">
                  mqerkacademycienytec@gmail.com
                </a>
              </p>

              <p className="text-gray-700 mb-4">
                El uso de cookies puede ser aceptado, rechazado o revocado en cualquier momento mediante la configuración del 
                navegador o de las herramientas de privacidad que MQerKAcademy® ponga a disposición en su plataforma.
              </p>

              <p className="text-gray-700">
                Para ejercer tus derechos ARCO (Acceso, Rectificación, Cancelación y Oposición), deberás enviar una solicitud 
                escrita al correo institucional, incluyendo nombre completo, datos de contacto, descripción clara de la solicitud 
                y copia de identificación oficial. El plazo máximo de respuesta será de 20 días hábiles.
              </p>
            </>
          }
        />

        {/* Última actualización */}
        <div className="mt-12 text-center text-sm text-gray-500">
          <p>Última actualización: Noviembre 2025</p>
        </div>
      </main>

      <Footer />
    </div>
  );
}

// Componente reutilizable para cada sección
function PolicySection({ number, title, content }) {
  return (
    <section className="mb-8 bg-white rounded-xl shadow-sm p-6 sm:p-8 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4 mb-4">
        <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-lg sm:text-xl">
          {number}
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">{title}</h2>
      </div>
      <div className="ml-0 sm:ml-16 text-gray-700 leading-relaxed text-sm sm:text-base">{content}</div>
    </section>
  );
}

export default Blog;