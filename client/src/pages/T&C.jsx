import Navbar from "../components/mqerk/Navbar";
import Footer from "../components/footer";

function Blog() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            Términos y Condiciones
          </h1>
          <p className="text-purple-100 text-sm sm:text-base lg:text-lg max-w-2xl">
            Al utilizar nuestros servicios, aceptas estos términos. Te pedimos que los leas 
            cuidadosamente antes de registrarte o realizar cualquier transacción.
          </p>
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        {/* Introducción */}
        <section className="mb-12 bg-white rounded-xl shadow-sm p-6 sm:p-8">
          <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
            Bienvenido/a a MQerKAcademy®, la academia educativa que impulsa el aprendizaje disruptivo en ciencias, tecnología, creatividad y desarrollo cognitivo. Ofrecemos experiencias formativas prácticas y accesibles para jóvenes de todos los niveles académicos, fortaleciendo sus habilidades para exámenes, estudios y proyectos futuros. Además, brindamos programas de actualización para profesionales y docentes que buscan innovar, adaptarse a las nuevas demandas del siglo XXI y potenciar su práctica con estrategias educativas contemporáneas.
          </p>
          
          <p className="mt-6 text-gray-700 leading-relaxed text-sm sm:text-base">
            Al utilizar este sitio web, nuestros servicios y la plataforma MQerK, aceptas los presentes Términos y Condiciones. Te pedimos que los 
            leas cuidadosamente antes de registrarte o realizar cualquier transacción en nuestra plataforma.
          </p>

          <p className="mt-6 text-gray-700 leading-relaxed text-sm sm:text-base">
            El presente documento digital establece los términos y condiciones que serán aplicables cuando usted visite y/o 
            utilice la Plataforma Digital y/o el Sitio Web{" "}
            <a 
              href="https://www.mqerkacademy.com" 
              className="text-indigo-600 hover:text-indigo-700 underline transition"
            >
              www.mqerkacademy.com
            </a>.
          </p>

          <p className="mt-6 text-gray-700 leading-relaxed text-sm sm:text-base">
            MQerKAcademy®, representada legalmente por el L.C.Q. KELVIN VALENTIN GÓMEZ RAMÍREZ, con domicilio en Calle Juárez 
            #25, Colonia Centro, C.P. 68300, San Juan Bautista Tuxtepec, Oaxaca, México, RFC GORK980908K61, en su carácter de 
            persona física con actividad empresarial, pone a disposición de los usuarios los presentes Términos y Condiciones 
            de uso.
          </p>
        </section>

        {/* Sección 1 */}
        <TermsSection
          number="1"
          title="DEFINICIONES"
          content={
            <div className="space-y-4">
              <div>
                <strong className="text-gray-900">"Plataforma":</strong>
                <span className="text-gray-700"> Se refiere al sitio web de MQerKAcademy®, sus subdominios, aplicaciones y sistemas digitales.</span>
              </div>
              <div>
                <strong className="text-gray-900">"Usuario" o "Estudiante":</strong>
                <span className="text-gray-700"> Toda persona que accede, se registra o participa en los cursos o servicios ofrecidos.</span>
              </div>
              <div>
                <strong className="text-gray-900">"Contenidos":</strong>
                <span className="text-gray-700"> Todo material educativo, audiovisual, descargable o interactivo disponible en la plataforma.</span>
              </div>
            </div>
          }
        />

        {/* Sección 2 */}
        <TermsSection
          number="2"
          title="ACEPTACIÓN DE LOS TÉRMINOS"
          content={
            <p className="text-gray-700">
              Al registrarte o hacer uso de cualquier servicio ofrecido por MQerKAcademy®, así como la participación en sus 
              sedes físicas, manifiestas haber leído, comprendido y aceptado estos Términos y Condiciones y la Política de 
              Privacidad. La aceptación se formaliza mediante la marcación de la casilla de consentimiento en la plataforma, 
              lo que genera evidencia electrónica conforme a la NOM-151-SCFI-2016. Si no estás de acuerdo, deberás abstenerte 
              de utilizar la plataforma.
            </p>
          }
        />

        {/* Sección 3 */}
        <TermsSection
          number="3"
          title="OBJETIVO DEL SERVICIO"
          content={
            <>
              <p className="text-gray-700 mb-4">
                MQerKAcademy® tiene como misión brindar una educación alternativa y transformadora a través de:
              </p>
              <ul className="space-y-2 ml-4 mb-4">
                <li className="flex items-start">
                  <span className="text-indigo-600 mr-2">•</span>
                  <span>Cursos presenciales, línea y en vivo con enfoque científico, tecnológico y creativo.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-indigo-600 mr-2">•</span>
                  <span>Recursos digitales interactivos.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-indigo-600 mr-2">•</span>
                  <span>Acompañamiento educativo personalizado y grupal.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-indigo-600 mr-2">•</span>
                  <span>Desarrollo de proyectos prácticos.</span>
                </li>
              </ul>
              <p className="text-gray-700">
                Nuestros servicios están dirigidos principalmente a estudiantes de secundaria, preparatoria y universitarios; 
                pero también pueden ser utilizados por cualquier persona interesada en adquirir conocimientos científicos y 
                tecnológicos.
              </p>
            </>
          }
        />

        {/* Sección 4 */}
        <TermsSection
          number="4"
          title="REGISTRO Y CUENTA DE USUARIO"
          content={
            <>
              <p className="text-gray-700 mb-4">
                Para acceder a ciertos servicios, deberás crear una cuenta con información veraz y actualizada. Como usuario, 
                te comprometes a:
              </p>
              <ul className="space-y-2 ml-4 mb-4">
                <li className="flex items-start">
                  <span className="text-indigo-600 mr-2">•</span>
                  <span>No compartir tus credenciales con terceros.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-indigo-600 mr-2">•</span>
                  <span>Mantener actualizada tu información de contacto.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-indigo-600 mr-2">•</span>
                  <span>Usar tu cuenta de forma personal y no transferible.</span>
                </li>
              </ul>
              <p className="text-gray-700">
                El usuario se compromete a proporcionar información veraz y actualizada. MQerKAcademy® podrá solicitar 
                documentos de verificación y, en caso de detectar datos falsos o inconsistentes, se reserva el derecho de 
                suspender o cancelar la cuenta, sin obligación de reembolso si la falsedad afecta el servicio.
              </p>
            </>
          }
        />

        {/* Sección 5 */}
        <TermsSection
          number="5"
          title="USO ADECUADO DE LA PLATAFORMA"
          content={
            <>
              <p className="text-gray-700 mb-4">
                Los usuarios deben utilizar la plataforma de manera ética y respetuosa. Está estrictamente prohibido:
              </p>
              <ul className="space-y-2 ml-4 mb-4">
                <li className="flex items-start">
                  <span className="text-indigo-600 mr-2">•</span>
                  <span>Copiar, distribuir o modificar contenidos sin autorización.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-indigo-600 mr-2">•</span>
                  <span>Compartir materiales de pago de manera gratuita o sin permiso.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-indigo-600 mr-2">•</span>
                  <span>Interrumpir las actividades de otros usuarios o del funcionamiento del sitio.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-indigo-600 mr-2">•</span>
                  <span>Utilizar la plataforma con fines fraudulentos o comerciales no autorizados.</span>
                </li>
              </ul>
              <p className="text-gray-700">
                Cualquier violación puede resultar en la suspensión permanente del acceso. En caso de incumplimiento, 
                MQerKAcademy® podrá aplicar sanciones que van desde advertencia escrita, suspensión temporal, hasta la 
                cancelación definitiva de la cuenta. Toda suspensión será notificada al usuario al correo registrado, 
                explicando la causa.
              </p>
            </>
          }
        />

        {/* Sección 6 */}
        <TermsSection
          number="6"
          title="PROPIEDAD INTELECTUAL"
          content={
            <>
              <p className="text-sm text-gray-600 mb-4">(Bajo la Ley Federal del Derecho de Autor)</p>
              <ul className="space-y-2 ml-4">
                <li className="flex items-start">
                  <span className="text-indigo-600 mr-2">•</span>
                  <span>
                    Todos los contenidos disponibles en MQerKAcademy® (videos, materiales escritos, presentaciones, imágenes, 
                    logos, software, etc.) son propiedad de MQerKAcademy® o de sus creadores licenciados.
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-indigo-600 mr-2">•</span>
                  <span>
                    Se prohíbe su reproducción, distribución o explotación con fines comerciales sin autorización expresa 
                    por escrito.
                  </span>
                </li>
              </ul>
            </>
          }
        />

        {/* Sección 7 */}
        <TermsSection
          number="7"
          title="PAGOS Y SUSCRIPCIONES"
          content={
            <>
              <p className="text-sm text-gray-600 mb-4">(Bajo la NOM-247-SE-2021)</p>
              <p className="text-gray-700 mb-3">
                Al adquirir un curso, taller o suscripción, el usuario acepta los precios y condiciones publicadas en la 
                plataforma. Las condiciones incluyen:
              </p>
              <ul className="space-y-2 ml-4 mb-4">
                <li className="flex items-start">
                  <span className="text-indigo-600 mr-2">•</span>
                  <span>Métodos de pago habilitados (efectivo, transferencia o depósitos).</span>
                </li>
                <li className="flex items-start">
                  <span className="text-indigo-600 mr-2">•</span>
                  <span>Acceso al contenido solo mientras se mantenga activa la suscripción, en caso de membresías.</span>
                </li>
              </ul>
              <p className="text-gray-700">
                MQerKAcademy® se reserva el derecho de modificar precios o promociones sin afectar transacciones ya realizadas.
              </p>
            </>
          }
        />

        {/* Sección 8 */}
        <TermsSection
          number="8"
          title="POLÍTICA DE REEMBOLSOS Y CANCELACIONES"
          content={
            <>
              <p className="text-sm text-gray-600 mb-4">(En cumplimiento con la NOM-247-SE-2021)</p>
              <p className="text-gray-700 mb-3">
                Al adquirir cualquier curso, taller, programa, servicio educativo o suscripción ofrecida por MQerKAcademy®, el usuario acepta los precios, términos y condiciones publicados en nuestros medios oficiales. Estas condiciones incluyen:
              </p>
              <ul className="space-y-2 ml-4 mb-4">
                <li className="flex items-start">
                  <span className="text-indigo-600 mr-2">•</span>
                  <span>Métodos de pago autorizados: efectivo, transferencia bancaria y depósitos.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-indigo-600 mr-2">•</span>
                  <span>Acceso al contenido digital: disponible únicamente mientras la membresía o suscripción se mantenga activa, cuando aplique.</span>
                </li>
              </ul>
              <p className="text-gray-700 mb-3">
                <strong>Reembolsos:</strong>
              </p>
              <p className="text-gray-700">
                MQerKAcademy® establece las siguientes disposiciones:

                No se realizan reembolsos una vez que el alumno haya recibido acceso al curso, taller, plataforma, materiales digitales o haya iniciado clases presenciales o virtuales.

                En caso de pagos por error, duplicados o fallas técnicas atribuibles a la institución, el usuario podrá solicitar una revisión del caso para determinar la procedencia del reembolso.

                Los reembolsos aprobados —exclusivamente en situaciones justificadas serán procesados.
              </p>
            </>
          }
        />

        {/* Sección 9 */}
        <TermsSection
          number="9"
          title="DISPONIBILIDAD DEL SERVICIO"
          content={
            <>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="text-indigo-600 mr-2">•</span>
                  <span className="text-gray-700">
                    Hacemos todo lo posible por mantener nuestra plataforma disponible 24/7. Sin embargo, no garantizamos 
                    disponibilidad ininterrumpida ni ausencia de errores.
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-indigo-600 mr-2">•</span>
                  <span className="text-gray-700">
                    Nos reservamos el derecho a realizar mantenimientos, actualizaciones o modificaciones técnicas sin 
                    previo aviso.
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-indigo-600 mr-2">•</span>
                  <span className="text-gray-700">
                    En caso de interrupciones no programadas que superen 24 horas consecutivas, MQerKAcademy® ofrecerá 
                    una prórroga equivalente en el acceso al contenido afectado.
                  </span>
                </li>
              </ul>
            </>
          }
        />

        {/* Sección 10 */}
        <TermsSection
          number="10"
          title="LIMITACIÓN DE RESPONSABILIDAD"
          content={
            <>
              <p className="text-gray-700 mb-4">
                MQerKAcademy® no garantiza resultados académicos específicos, ya que el aprovechamiento depende del compromiso 
                y dedicación del estudiante. Sin embargo, se compromete a impartir los contenidos, recursos y acompañamiento 
                pedagógico conforme a lo descrito en la oferta de cada curso.
              </p>
              <p className="text-gray-700 mb-4">
                MQerKAcademy® no será responsable por daños indirectos o incidentales derivados del mal uso de la plataforma 
                por parte del usuario.
              </p>
              <p className="text-gray-700">
                En caso de que una falla técnica o de servicio sea atribuible directamente a MQerKAcademy® y afecte de manera 
                significativa el acceso o aprovechamiento del curso, se ofrecerá una compensación proporcional, que podrá 
                consistir en extensión del acceso, reprogramación de clases o reembolso parcial, según corresponda.
              </p>
            </>
          }
        />

        {/* Sección 11 */}
        <TermsSection
          number="11"
          title="ENLACES EXTERNOS"
          content={
            <p className="text-gray-700">
              La plataforma puede contener enlaces a sitios de terceros. MQerKAcademy® no se hace responsable por la 
              disponibilidad, contenido o políticas de dichos sitios externos.
            </p>
          }
        />

        {/* Sección 12 */}
        <TermsSection
          number="12"
          title="EDUCACIÓN SOSTENIBLE Y RESPONSABILIDAD SOCIAL"
          content={
            <>
              <p className="text-sm text-gray-600 mb-4">(Bajo la NMX-AA-162-SCFI-2012)</p>
              <p className="text-gray-700 mb-4">
                En MQerKAcademy integramos principios de sostenibilidad en todos sus contenidos y fomenta la participación 
                en proyectos sociales, ambientales o científicos reales.
              </p>
              <p className="text-gray-700">
                Nuestro compromiso con la educación sostenible implica desarrollar procesos de enseñanza-aprendizaje que formen 
                estudiantes con conciencia crítica, compromiso social y una visión activa frente a los desafíos del siglo XXI, 
                como la inclusión y la equidad.
              </p>
            </>
          }
        />

        {/* Sección 13 */}
        <TermsSection
          number="13"
          title="VALIDACIÓN DE IDENTIDAD DEL ALUMNO"
          content={
            <>
              <p className="text-sm text-gray-600 mb-4">(Bajo la NOM-151-SCFI-2016)</p>
              <p className="text-gray-700">
                MQerKAcademy podrá requerir documentos de identidad o realizar verificaciones para evitar suplantaciones. 
                Es un proceso fundamental para garantizar la autenticidad de la participación educativa, la correcta asignación 
                de progresos académicos y la seguridad de nuestros usuarios, especialmente en el caso de estudiantes menores 
                de edad.
              </p>
            </>
          }
        />

        {/* Sección 14 */}
        <TermsSection
          number="14"
          title="EVALUACIÓN DEL RENDIMIENTO ACADÉMICO"
          content={
            <p className="text-gray-700">
              El equipo de MQerKAcademy podrá revisar el desempeño del alumno para ofrecer retroalimentación, apoyo o cambios 
              de nivel, informando previamente al tutor, adaptando nuestras evaluaciones a un modelo{" "}
              <strong className="text-gray-900">híbrido, progresivo y personalizado</strong>, en el cual cada alumno avanza 
              según su ritmo, sus habilidades y sus objetivos.
            </p>
          }
        />

        {/* Sección 15 */}
        <TermsSection
          number="15"
          title="CAMBIOS EN LOS TÉRMINOS"
          content={
            <ul className="space-y-3">
              <li className="flex items-start">
                <span className="text-indigo-600 mr-2">•</span>
                <span className="text-gray-700">
                  El uso continuado de nuestros servicios implica la aceptación de los nuevos términos.
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-indigo-600 mr-2">•</span>
                <span className="text-gray-700">
                  En caso de cambios sustanciales en los Términos y Condiciones, MQerKAcademy® notificará a los usuarios 
                  con al menos 15 días naturales de anticipación. Si el usuario no está de acuerdo, podrá cancelar el 
                  servicio sin penalización antes de la fecha de entrada en vigor.
                </span>
              </li>
            </ul>
          }
        />

        {/* Sección 16 */}
        <TermsSection
          number="16"
          title="CONTACTO"
          content={
            <p className="text-gray-700">
              Toda comunicación oficial se realizará desde el correo institucional{" "}
              <a 
                href="mailto:mqerkacademycienytec@gmail.com" 
                className="text-indigo-600 hover:text-indigo-700 underline"
              >
                mqerkacademycienytec@gmail.com
              </a>
              . Solo de manera complementaria se atenderán consultas al{" "}
              <a 
                href="tel:2871515760" 
                className="text-indigo-600 hover:text-indigo-700 underline"
              >
                287-151-5760
              </a>{" "}
              mientras se mantiene la migración a dominio propio.
            </p>
          }
        />

        {/* Última actualización */}
        <div className="mt-12 text-center text-sm text-gray-500">
          <p>Última actualización: Noviembre 2025</p>
        </div>
      </main>

      {/* Footer fuera del main para ancho completo */}
      <Footer />
    </div>
  );
}

// Componente reutilizable para cada sección
function TermsSection({ number, title, content }) {
  return (
    <section className="mb-8 bg-white rounded-xl shadow-sm p-6 sm:p-8 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4 mb-4">
        <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold text-lg sm:text-xl">
          {number}
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">{title}</h2>
      </div>
      <div className="ml-0 sm:ml-16 text-gray-700 leading-relaxed text-sm sm:text-base">{content}</div>
    </section>
  );
}

export default Blog;