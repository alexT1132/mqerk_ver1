import Navbar from "../../components/mqerk/Navbar";
import Footer from "../../components/layout/footer";

function Politicas() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50" >
      <Navbar />
      <main className="flex-grow">
        <div className="w-full mt-4 px-4 sm:px-10 lg:px-16 flex flex-col">
          <div className="bg-white shadow-sm rounded-2xl p-6 sm:p-10 mb-10 border border-slate-100 w-full">
            <div className='text-3xl sm:text-4xl font-bold py-4 text-[#004aad] text-center sm:text-left'>Política de Privacidad</div>
            <div className='h-1.5 w-24 bg-[#3c24ba] mx-auto sm:mx-0 mb-8 rounded-full' />

            <div className="space-y-8">
              <div>
                <p className="text-justify text-base leading-relaxed text-gray-600">
                  MQerKAcademy®, representada legalmente por Kelvin Valentín Gómez Ramírez con domicilio en Calle Juárez #25, Colonia Centro, C.P.
                  68300, San Juan Bautista Tuxtepec, Oaxaca, México, RFC GORK980908K61, en su carácter de persona física con actividad empresarial,
                  emite la presente Política de Privacidad en cumplimiento de la Ley Federal de Protección de Datos Personales en Posesión de los Particulares y
                  su Reglamento.
                </p>
              </div>

              <div>
                <p className="text-justify text-base leading-relaxed text-gray-600">
                  En <strong>MQerKAcademy®</strong>, la privacidad de nuestros estudiantes, clientes y visitantes es una prioridad. Esta Política de Privacidad explica cómo
                  recopilamos, usamos, almacenamos, compartimos y protegemos tu información personal cuando accedes a nuestros cursos, servicios o sitio web <a className="text-blue-500 cursor-pointer text-break">https://www.mqerkacademy.com</a>.
                  <br /><br />
                  La presente Política de Privacidad se encuentra alineada con lo establecido en la <strong>Ley Federal de Protección de Datos Personales en
                    Posesión de los Particulares</strong> (publicada en el Diario Oficial de la Federación el 5 de julio de 2010) y su <strong>Reglamento</strong>
                  (publicado en el Diario Oficial de la Federación el 21 de diciembre de 2011), así como en los <strong>Lineamientos del Aviso de Privacidad</strong> emitidos
                  por el Instituto Nacional de Transparencia, Acceso a la Información y Protección de Datos Personales (<strong>INAI</strong>), y demás disposiciones aplicables
                  en materia de protección de datos personales en México (en adelante, “Marco Normativo de Protección de Datos Personales”).
                  <br /><br />
                  MQerKAcademy® se compromete a proporcionar un entorno de aprendizaje seguro, innovador y transparente. Al utilizar nuestros servicios,
                  aceptas los términos establecidos en este documento.
                </p>
              </div>

              <section>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-4">
                  1. INFORMACIÓN QUE RECOPILAMOS.
                </h2>
                <div className="text-justify text-base leading-relaxed text-gray-600 space-y-4">
                  <p>(bajo la La NOM-151-SCFI-2016)</p>
                  <div>
                    <strong>a) Información personal que proporcionas:</strong>
                    <ul className="list-disc ml-5 mt-2 space-y-1">
                      <li>Nombre completo</li>
                      <li>Dirección de correo electrónico</li>
                      <li>Número de teléfono (opcional)</li>
                      <li>Edad o nivel académico (opcional, según el curso)</li>
                      <li>Información de pago (si aplica)</li>
                      <li>Preferencias de aprendizaje o comentarios que nos proporciones</li>
                    </ul>
                  </div>

                  <div>
                    <strong>b) Información recopilada automáticamente:</strong>
                    <ul className="list-disc ml-5 mt-2 space-y-1">
                      <li>Dirección IP</li>
                      <li>Tipo de navegador y dispositivo</li>
                      <li>Páginas visitadas dentro de nuestros sitios</li>
                      <li>Duración de la visita, clics, y patrones de navegación</li>
                      <li>Datos de acceso a plataformas internas (por ejemplo, progreso en cursos)</li>
                    </ul>
                  </div>

                  <p>
                    La información personal será conservada únicamente durante el tiempo necesario para cumplir con las finalidades establecidas en este aviso y para el cumplimiento de obligaciones legales. En el caso de datos sensibles (como estado de salud, necesidades especiales de aprendizaje u otra información confidencial), se solicitará consentimiento expreso y por escrito, y su tratamiento se realizará con medidas de seguridad reforzadas.
                  </p>

                  <p>(Bajo la NOM-050-SCFI-2004)</p>
                  <div>
                    <strong>Utilizamos tus datos para los siguientes fines:</strong>
                    <ul className="list-disc ml-5 mt-2 space-y-1">
                      <li>Brindarte acceso a nuestros cursos y contenidos educativos</li>
                      <li>Personalizar tu experiencia de aprendizaje</li>
                      <li>Gestionar tu cuenta de usuario y seguimiento académico</li>
                      <li>Procesar pagos y enviar comprobantes</li>
                      <li>Enviar información relevante sobre nuestros servicios, promociones, eventos o mejoras (si lo autorizas)</li>
                      <li>Cumplir con requisitos legales o contractuales</li>
                      <li>Mejorar continuamente nuestros cursos, metodologías y plataforma</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-4">
                  2. COMPARTICIÓN DE INFORMACIÓN.
                </h2>
                <div className="text-justify text-base leading-relaxed text-gray-600 space-y-4">
                  <p>
                    Tu información no será vendida ni alquilada. Solo será compartida en los siguientes casos:
                  </p>
                  <p>
                    Con proveedores de servicios contratados por MQerKAcademy® (por ejemplo, plataformas de pago, alojamiento web, herramientas de videoconferencia), quienes están obligados a proteger tu información. Algunos de estos proveedores pueden ubicarse fuera de México, lo que implica una transferencia internacional de datos; en tales casos se aplicarán cláusulas contractuales que aseguren un nivel de protección equivalente al previsto por la legislación mexicana.
                  </p>
                  <p>
                    Si es requerida por ley, procesos legales o autoridades competentes.
                  </p>
                  <p>
                    Si MQerKAcademy® se fusiona o es adquirida por otra entidad educativa, se notificará previamente.
                  </p>
                  <p>(bajo la NOM-019-SCFI-2016)</p>
                </div>
              </section>

              <section>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-4">
                  3. COOKIES Y TECNOLOGÍAS SIMILARES.
                </h2>
                <div className="text-justify text-base leading-relaxed text-gray-600 space-y-4">
                  <p>MQerKAcademy® utiliza cookies y herramientas similares para:</p>
                  <ul className="list-disc ml-5 space-y-1">
                    <li>Recordar tus preferencias</li>
                    <li>Entender cómo usas nuestra plataforma</li>
                    <li>Mejorar el rendimiento y la seguridad del sitio</li>
                  </ul>
                  <p>Puedes configurar tu navegador para rechazar cookies, aunque esto podría limitar algunas funcionalidades. </p>
                </div>
              </section>

              <section>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-4">
                  4. SEGURIDAD DE LOS DATOS.
                </h2>
                <div className="text-justify text-base leading-relaxed text-gray-600 space-y-4">
                  <p>
                    Implementamos medidas administrativas, técnicas y físicas para proteger tu información personal contra pérdida, robo, uso no autorizado o divulgación. Estas medidas incluyen cifrado SSL, control de acceso con autenticación, protocolos de respaldo y recuperación, monitoreo de actividad en la plataforma y capacitación periódica del personal. Aunque trabajamos constantemente para proteger tus datos, ningún sistema es 100% invulnerable. Recomendamos que también protejas tu información, por ejemplo, utilizando contraseñas seguras y no compartiéndolas.
                  </p>
                  <div>
                    <strong>Implementamos medidas de seguridad técnicas y administrativas para proteger tu información personal, como:</strong>
                    <ul className="list-disc ml-5 mt-2 space-y-1">
                      <li>Cifrado SSL en nuestras páginas</li>
                      <li>Control de acceso a nuestros sistemas internos</li>
                      <li>Protocolos de respaldo y recuperación</li>
                      <li>Políticas internas de privacidad y capacitación del equipo</li>
                    </ul>
                  </div>
                  <p>
                    Aunque trabajamos constantemente para proteger tus datos, ningún sistema es 100% invulnerable. Recomendamos que también protejas tus datos personales (por ejemplo, no compartiendo contraseñas).
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-4">
                  5. DERECHOS DEL USUARIO.
                </h2>
                <div className="text-justify text-base leading-relaxed text-gray-600 space-y-4">
                  <p>Como usuario de MQerKAcademy®, tienes derecho a:</p>
                  <ul className="list-disc ml-5 space-y-1">
                    <li>Acceder a tu información personal</li>
                    <li>Solicitar la rectificación de datos incorrectos</li>
                    <li>Solicitar la eliminación de tus datos (cuando no haya impedimentos legales o contractuales)</li>
                    <li>Revocar el consentimiento para el uso de tus datos</li>
                    <li>Presentar una queja ante la autoridad competente de protección de datos</li>
                  </ul>
                  <p>Puedes ejercer estos derechos escribiéndonos a: <strong>mqerkacademycienytec@gmail.com</strong></p>
                </div>
              </section>

              <section>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-4">
                  6. MENORES DE EDAD.
                </h2>
                <div className="text-justify text-base leading-relaxed text-gray-600 space-y-4">
                  <p>
                    Para estudiantes menores de edad, MQerKAcademy® requiere el consentimiento expreso y verificable de los padres o tutores, el cual se obtendrá mediante firma física o digital autenticada, junto con copia de identificación oficial del tutor. Sin este requisito, no se podrá procesar ni conservar información personal del menor.
                  </p>
                  <p>
                    MQerKAcademy®  ofrece algunos cursos dirigidos a estudiantes menores de edad. En estos casos, se requiere el consentimiento de los padres o tutores para el uso de datos personales. No recopilamos intencionalmente datos personales de menores sin dicha autorización.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-4">
                  7. EVALUACIÓN ACADÉMICA.
                </h2>
                <div className="text-justify text-base leading-relaxed text-gray-600 space-y-4">
                  <p>(bajo la NOM-008-SSA3-2017)</p>
                  <p>
                    En MQerKAcademy® se aplica un modelo de evaluación por competencias que busca valorar el desarrollo de habilidades cognitivas, creativas y prácticas en el estudiante.
                    Cada curso incluye actividades, proyectos, autoevaluaciones y retroalimentación personalizada. Para aprobar, el estudiante deberá cumplir con al menos el 80% de las actividades programadas y obtener una calificación mínima del 70%.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-4">
                  8. INCLUSIÓN Y ACCESIBILIDAD.
                </h2>
                <div className="text-justify text-base leading-relaxed text-gray-600 space-y-4">
                  <p>(Bajo las NOM-050-SCFI-2004, NOM-008-SSA3-2017, y los principios de la educación inclusiva establecidos por la SEP)</p>
                  <p>
                    Contamos con interfaces accesibles, subtítulos, opciones de lectura en voz alta y acompañamiento pedagógico especializado en caso de requerirse.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-4">
                  9. CONDUCTA ACADÉMICA Y ÉTICA DIGITAL.
                </h2>
                <div className="text-justify text-base leading-relaxed text-gray-600 space-y-4">
                  <p>(Bajo la NOM-035-STPS-2018)</p>
                  <p>
                    Todos los estudiantes de MQerk Academy deben conducirse con respeto, integridad y honestidad dentro de las aulas, se prohíbe expresamente cualquier conducta ofensiva y discriminatoria. La infracción a estas normas podrá derivar en advertencias, suspensión temporal o baja definitiva de la plataforma, según la gravedad del caso.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-4">
                  10. COMUNICACIÓN INSTITUCIONAL.
                </h2>
                <div className="text-justify text-base leading-relaxed text-gray-600 space-y-4">
                  <p>(Bajo la NOM-151-SCFI-2016)</p>
                  <p>Toda comunicación oficial con estudiantes, padres o tutores se realizará únicamente por medio de:</p>
                  <ol className="list-decimal ml-5 space-y-1">
                    <li>Correos institucionales terminados en @mqerkacademycienytec.com</li>
                    <li>Canal autorizado de WhatsApp</li>
                    <li>Publicaciones en redes oficiales de la academia</li>
                  </ol>
                  <p>No se considerará válida ninguna información compartida por otros medios no reconocidos. </p>
                </div>
              </section>

              <section>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-4">
                  11. SEGURIDAD PSICOEMOCIONAL.
                </h2>
                <div className="text-justify text-base leading-relaxed text-gray-600 space-y-4">
                  <p>(Bajo la NOM-035-STPS-2018)</p>
                  <p>
                    Todos los estudiantes tendrán acceso a recursos de apoyo emocional, estrategias para manejar el estrés académico y orientación con tutores formados en habilidades socioemocionales.
                    Los reportes de acoso, presión, desmotivación o maltrato serán canalizados de forma confidencial y atendidos de acuerdo con protocolos internos.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-4">
                  12. ACTUALIZACIÓN DE CONTENIDOS ACADÉMICOS.
                </h2>
                <div className="text-justify text-base leading-relaxed text-gray-600 space-y-4">
                  <p>(Bajo la NOM-008-SSA3-2017)</p>
                  <p>
                    MQerk Academy se compromete a revisar, mejorar and actualizar sus cursos, recursos y materiales didácticos según el tipo de programa. Todo el contenido será desarrollado y validado por docentes especializados y revisado por el equipo pedagógico antes de su publicación. Las actualizaciones no afectarán negativamente a estudiantes en curso: podrán finalizar bajo la versión con la que iniciaron, o, si lo desean, migrar a la versión más reciente sin costo adicional.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-4">
                  13. CAMBIOS A ESTA POLÍTICA.
                </h2>
                <div className="text-justify text-base leading-relaxed text-gray-600 space-y-4">
                  <p>
                    MQerKAcademy® puede actualizar esta Política de Privacidad en cualquier momento. En caso de cambios sustanciales, notificará a los usuarios con al menos 15 días naturales de anticipación a su entrada en vigor, mediante correo electrónico o anuncio en el sitio web.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-4">
                  14. CONTACTO.
                </h2>
                <div className="text-justify text-base leading-relaxed text-gray-600 space-y-4">
                  <p>
                    Si tienes preguntas, sugerencias o inquietudes relacionadas con nuestra Política de Privacidad o el tratamiento de tus datos, contáctanos: <strong>287-151-5760</strong> o al correo <strong>mqerkacademycienytec@gmail.com</strong>
                  </p>
                  <p>
                    El uso de cookies puede ser aceptado, rechazado o revocado en cualquier momento mediante la configuración del navegador o de las herramientas de privacidad que MQerKAcademy® ponga a disposición en su plataforma.
                  </p>
                  <p>
                    Para ejercer tus derechos ARCO (Acceso, Rectificación, Cancelación y Oposición), deberás enviar una solicitud escrita al correo institucional, incluyendo nombre completo, datos de contacto, descripción clara de la solicitud y copia de identificación oficial. El plazo máximo de respuesta será de 20 días hábiles.
                  </p>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default Politicas