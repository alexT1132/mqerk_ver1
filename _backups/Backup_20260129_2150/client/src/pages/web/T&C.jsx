import Navbar from "../../components/mqerk/Navbar";
import Footer from "../../components/layout/footer";

function Terminos() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50" >
      <Navbar />
      <main className="flex-grow">
        <div className="w-full mt-4 px-4 sm:px-10 lg:px-16 flex flex-col">
          <div className="bg-white shadow-sm rounded-2xl p-6 sm:p-10 mb-10 border border-slate-100 w-full">
            <div className='text-3xl sm:text-4xl font-bold py-4 text-[#004aad] text-center sm:text-left'>Términos y condiciones</div>
            <div className='h-1.5 w-24 bg-[#3c24ba] mx-auto sm:mx-0 mb-8 rounded-full' />

            <div className="space-y-8">
              <div>
                <p className="text-justify text-base leading-relaxed text-gray-600">
                  Bienvenido/a a MQerKAcademy®, una academia educativa que ofrece cursos innovadores y disruptivos en ciencias, tecnología, creatividad y habilidades cognitivas. Nuestros servicios están diseñados para brindar una experiencia de aprendizaje práctica, integral y accesible a jóvenes estudiantes y personas interesadas en el desarrollo de habilidades del siglo XXI.
                  Al utilizar este sitio web y nuestros servicios, aceptas los presentes Términos y Condiciones. Te pedimos que los leas cuidadosamente antes de registrarte o realizar cualquier transacción en nuestra plataforma.
                  El presente documento digital establece los términos y condiciones que serán aplicables cuando usted visite y/o utilice la Plataforma Digital y/o el Sitio Web <a href="#" className="text-blue-600 border-b-1 text-break">www.mqerkacademy.com</a>.
                  MQerKAcademy®, representada legalmente por el L.C.Q. KELVIN VALENTIN GÓMEZ RAMÍREZ, con domicilio en Calle Juárez #25, Colonia Centro, C.P. 68300, San Juan Bautista Tuxtepec, Oaxaca, México, RFC GORK980908K61, en su carácter de persona física con actividad empresarial, pone a disposición de los usuarios los presentes Términos y Condiciones de uso.
                </p>
              </div>

              <section>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-4">
                  1. DEFINICIONES.
                </h2>
                <div className="text-justify text-base leading-relaxed text-gray-600 space-y-2">
                  <p>“Plataforma”: Se refiere al sitio web de MQerKAcademy®, sus subdominios, aplicaciones y sistemas digitales.</p>
                  <p>“Usuario” o “Estudiante”: Toda persona que accede, se registra o participa en los cursos o servicios ofrecidos.</p>
                  <p>“Contenidos”: Todo material educativo, audiovisual, descargable o interactivo disponible en la plataforma.</p>
                </div>
              </section>

              <section>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-4">
                  2. ACEPTACIÓN DE LOS TÉRMINOS.
                </h2>
                <div className="text-justify text-base leading-relaxed text-gray-600">
                  <p>
                    Al registrarte o hacer uso de cualquier servicio ofrecido por MQerKAcademy®, así como la participación en sus sedes físicas,
                    manifiestas haber leído, comprendido y aceptado estos Términos y Condiciones y la Política de Privacidad.
                    La aceptación se formaliza mediante la marcación de la casilla de consentimiento en la plataforma,
                    lo que genera evidencia electrónica conforme a la NOM-151-SCFI-2016. Si no estás de acuerdo, deberás abstenerte de utilizar la plataforma.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-4">
                  3. OBJETIVO DEL SERVICIO.
                </h2>
                <div className="text-justify text-base leading-relaxed text-gray-600 space-y-4">
                  <p>MQerKAcademy® tiene como misión brindar una educación alternativa y transformadora a través de:</p>
                  <ul className="list-disc ml-5 space-y-1">
                    <li>Cursos presenciales, línea y en vivo con enfoque científico, tecnológico y creativo.</li>
                    <li>Recursos digitales interactivos.</li>
                    <li>Acompañamiento educativo personalizado y grupal.</li>
                    <li>Desarrollo de proyectos prácticos.</li>
                  </ul>
                  <p>
                    Nuestros servicios están dirigidos principalmente a estudiantes de secundaria, preparatoria y universitarios; pero tambien pueden ser utilizados por cualquier persona interesada en adquirir conocimientos científicos y tecnológicos.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-4">
                  4. REGISTRO Y CUENTA DE USUARIO.
                </h2>
                <div className="text-justify text-base leading-relaxed text-gray-600 space-y-4">
                  <p>Para acceder a ciertos servicios, deberás crear una cuenta con información veraz y actualizada. Como usuario, te comprometes a:</p>
                  <ul className="list-disc ml-5 space-y-1">
                    <li>No compartir tus credenciales con terceros.</li>
                    <li>Mantener actualizada tu información de contacto.</li>
                    <li>Usar tu cuenta de forma personal y no transferible.</li>
                  </ul>
                  <p>
                    El usuario se compromete a proporcionar información veraz y actualizada. MQerKAcademy® podrá solicitar documentos de verificación y, en caso de detectar datos falsos o inconsistentes, se reserva el derecho de suspender o cancelar la cuenta, sin obligación de reembolso si la falsedad afecta el servicio.”
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-4">
                  5. USO ADECUADO DE LA PLATAFORMA.
                </h2>
                <div className="text-justify text-base leading-relaxed text-gray-600 space-y-4">
                  <p>Los usuarios deben utilizar la plataforma de manera ética y respetuosa. Está estrictamente prohibido:</p>
                  <ul className="list-disc ml-5 space-y-1">
                    <li>Copiar, distribuir o modificar contenidos sin autorización.</li>
                    <li>Compartir materiales de pago de manera gratuita o sin permiso.</li>
                    <li>Interrumpir las actividades de otros usuarios o del funcionamiento del sitio.</li>
                    <li>Utilizar la plataforma con fines fraudulentos o comerciales no autorizados.</li>
                  </ul>
                  <p>
                    Cualquier violación puede resultar en la suspensión permanente del acceso. En caso de incumplimiento, MQerKAcademy® podrá aplicar sanciones que van desde advertencia escrita, suspensión temporal, hasta la cancelación definitiva de la cuenta. Toda suspensión será notificada al usuario al correo registrado, explicando la causa.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-4">
                  6. PROPIEDAD INTELECTUAL.
                </h2>
                <div className="text-justify text-base leading-relaxed text-gray-600 space-y-4">
                  <p>(Bajo la Ley Federal del Derecho de Autor)</p>
                  <ul className="list-disc ml-5 space-y-1">
                    <li>Todos los contenidos disponibles en MQerKAcademy® (videos, materiales escritos, presentaciones, imágenes, logos, software, etc.) son propiedad de MQerKAcademy® o de sus creadores licenciados.</li>
                    <li>Se prohíbe su reproducción, distribución o explotación con fines comerciales sin autorización expresa por escrito.</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-4">
                  7. PAGOS Y SUSCRIPCIONES.
                </h2>
                <div className="text-justify text-base leading-relaxed text-gray-600 space-y-4">
                  <p>(Bajo la NOM-247-SE-2021)</p>
                  <ul className="list-disc ml-5 space-y-1">
                    <li>Al adquirir un curso, taller o suscripción, el usuario acepta los precios y condiciones publicadas en la plataforma.</li>
                    <li>Métodos de pago habilitados (efectivo, transferencia o depósitos.).</li>
                    <li>Acceso al contenido solo mientras se mantenga activa la suscripción, en caso de membresías.</li>
                    <li>MQerKAcademy® se reserva el derecho de modificar precios o promociones sin afectar transacciones ya realizadas.</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-4">
                  8. POLÍTICA DE REEMBOLSOS Y CANCELACIONES.
                </h2>
                <div className="text-justify text-base leading-relaxed text-gray-600 space-y-4">
                  <p>(Bajo la NOM-247-SE-2021)</p>
                  <ul className="list-disc ml-5 space-y-1">
                    <li>Al adquirir un curso, taller o suscripción, el usuario acepta los precios y condiciones publicadas en la plataforma.</li>
                    <li>Métodos de pago habilitados (efectivo, transferencia o depósitos.).</li>
                    <li>Acceso al contenido solo mientras se mantenga activa la suscripción, en caso de membresías.</li>
                    <li>MQerKAcademy® se reserva el derecho de modificar precios o promociones sin afectar transacciones ya realizadas.</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-4">
                  9. DISPONIBILIDAD DEL SERVICIO.
                </h2>
                <div className="text-justify text-base leading-relaxed text-gray-600 space-y-4">
                  <ul className="list-disc ml-5 space-y-1">
                    <li>Hacemos todo lo posible por mantener nuestra plataforma disponible 24/7. Sin embargo, no garantizamos disponibilidad ininterrumpida ni ausencia de errores.</li>
                    <li>Nos reservamos el derecho a realizar mantenimientos, actualizaciones o modificaciones técnicas sin previo aviso.</li>
                    <li>En caso de interrupciones no programadas que superen 24 horas consecutivas, MQerKAcademy® ofrecerá una prórroga equivalente en el acceso al contenido afectado.</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-4">
                  10. LIMITACIÓN DE RESPONSABILIDAD.
                </h2>
                <div className="text-justify text-base leading-relaxed text-gray-600 space-y-4">
                  <p>
                    MQerKAcademy® no garantiza resultados académicos específicos, ya que el aprovechamiento depende del compromiso y dedicación del estudiante. Sin embargo, se compromete a impartir los contenidos, recursos y acompañamiento pedagógico conforme a lo descrito en la oferta de cada curso.
                  </p>
                  <p>
                    MQerKAcademy® no será responsable por daños indirectos o incidentales derivados del mal uso de la plataforma por parte del usuario.
                  </p>
                  <p>
                    En caso de que una falla técnica o de servicio sea atribuible directamente a MQerKAcademy® y afecte de manera significativa el acceso o aprovechamiento del curso, se ofrecerá una compensación proporcional, que podrá consistir en extensión del acceso, reprogramación de clases o reembolso parcial, según corresponda.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-4">
                  11. ENLACES EXTERNOS.
                </h2>
                <div className="text-justify text-base leading-relaxed text-gray-600">
                  <p>
                    La plataforma puede contener enlaces a sitios de terceros. MQerKAcademy® no se hace responsable por la disponibilidad, contenido o políticas de dichos sitios externos.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-4">
                  12. EDUCACIÓN SOSTENIBLE Y RESPONSABILIDAD SOCIAL.
                </h2>
                <div className="text-justify text-base leading-relaxed text-gray-600 space-y-4">
                  <p>(Bajo la NMX-AA-162-SCFI-2012)</p>
                  <p>
                    En MQerKAcademy integramos principios de sostenibilidad en todos sus contenidos y fomenta la participación en proyectos sociales, ambientales o científicos reales.
                    Nuestro compromiso con la educación sostenible implica desarrollar procesos de enseñanza-aprendizaje que formen estudiantes con conciencia crítica, compromiso social y una visión activa frente a los desafíos del siglo XXI, como la inclusión y la equidad.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-4">
                  13. VALIDACIÓN DE IDENTIDAD DEL ALUMNO.
                </h2>
                <div className="text-justify text-base leading-relaxed text-gray-600 space-y-4">
                  <p>(Bajo la NOM-151-SCFI-2016)</p>
                  <p>
                    MQerKAcademy podrá requerir documentos de identidad o realizar verificaciones para evitar suplantaciones. Es un proceso fundamental para garantizar la autenticidad de la participación educativa, la correcta asignación de progresos académicos y la seguridad de nuestros usuarios, especialmente en el caso de estudiantes menores de edad.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-4">
                  14. EVALUACIÓN DEL RENDIMIENTO ACADÉMICO.
                </h2>
                <div className="text-justify text-base leading-relaxed text-gray-600">
                  <p>
                    El equipo de MQerKAcademy podrá revisar el desempeño del alumno para ofrecer retroalimentación, apoyo o cambios de nivel, informando previamente al tutor, adaptando nuestras evaluaciones a un modelo <strong>híbrido, progresivo y personalizado</strong>, en el cual cada alumno avanza según su ritmo, sus habilidades y sus objetivos.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-4">
                  15. CAMBIOS EN LOS TÉRMINOS.
                </h2>
                <div className="text-justify text-base leading-relaxed text-gray-600 space-y-4">
                  <ul className="list-disc ml-5 space-y-1">
                    <li>El uso continuado de nuestros servicios implica la aceptación de los nuevos términos.</li>
                    <li>En caso de cambios sustanciales en los Términos y Condiciones, MQerKAcademy® notificará a los usuarios con al menos 15 días naturales de anticipación. Si el usuario no está de acuerdo, podrá cancelar el servicio sin penalización antes de la fecha de entrada en vigor.”</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-4">
                  16. CONTACTO.
                </h2>
                <div className="text-justify text-base leading-relaxed text-gray-600">
                  <p>
                    Toda comunicación oficial se realizará desde el correo institucional <a className="text-blue-500 border-b-1 cursor-pointer">mqerkacademycienytec@gmail.com</a>. Solo de manera complementaria se atenderán consultas al 287-151-5760 mientras se mantiene la migración a dominio propio.
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

export default Terminos