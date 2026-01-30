import Topbar from "../../components/mqerk/Navbar";
import Uno from "../../assets/mqerk/about/1.png";
import Dos from "../../assets/mqerk/about/2.png";
import Tres from "../../assets/mqerk/about/3.png";
import Cuatro from "../../assets/mqerk/about/4.png";
import Cinco from "../../assets/mqerk/about/5.png";
import Siete from "../../assets/mqerk/about/7.png";
import Ocho from "../../assets/mqerk/about/8.png";
import Nueve from "../../assets/mqerk/about/9.png";
import Diez from "../../assets/mqerk/about/10.png";
import Once from "../../assets/mqerk/about/11.png";
import Doce from "../../assets/mqerk/about/12.png";
import Trece from "../../assets/mqerk/about/13.png";
import { IoIosRocket } from "react-icons/io";
import Footer from "../../components/layout/footer";

function About() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-purple-50">
      <Topbar />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-indigo-700 to-purple-800 py-20">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center mb-8 animate-fade-in">
            <img src={Uno} className="w-32 sm:w-40 md:w-50 drop-shadow-2xl" alt="Logo" />
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-snug text-center animate-slide-up px-4">
            MQerKAcademy<sup>®</sup> es la academia disruptiva y sostenible que transforma la forma de aprender ciencias y tecnología.
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-purple-100 leading-relaxed text-center mt-8 max-w-5xl mx-auto animate-slide-up px-4" style={{ animationDelay: '200ms' }}>
            Preparamos a jóvenes estudiantes de todos los niveles académicos para acreditar exámenes, reforzar sus conocimientos y desarrollar habilidades científicas, tecnológicas y cognitivas-creativas esenciales para su futuro. Además, acompañamos a profesionales y docentes en el fortalecimiento de competencias innovadoras que potencian su práctica, actualizan su perfil y les permiten adaptarse con éxito a las nuevas demandas educativas y laborales.
          </p>
        </div>
      </div>

      {/* Values Image */}
      <div className="py-16 flex justify-center items-center animate-fade-in">
        <img src={Dos} className="w-full max-w-4xl px-4 drop-shadow-lg" alt="Valores" />
      </div>

      {/* Purpose and Uniqueness Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col lg:flex-row justify-center items-stretch gap-8 lg:gap-12">
          
          {/* Nuestro propósito */}
          <div className="lg:w-1/2 flex flex-col bg-white rounded-3xl shadow-lg p-8 sm:p-10 animate-slide-up">
            <div className="mb-6">
              <h2 className="text-3xl md:text-4xl font-bold text-purple-800">Nuestro propósito</h2>
            </div>
            <p className="text-lg md:text-xl text-gray-700 leading-relaxed mb-8 flex-grow">
              En MQerKAcademy, no solo enseñamos:
              <br />
              <span className="font-semibold text-purple-700">Desarrollamos mentes capaces de aprender para siempre.</span>
              <br />
              Nuestro enfoque impulsa el pensamiento lógico y creativo, logrando un aprendizaje infinito que trasciende el aula.
            </p>
            <div className="flex justify-center mt-auto">
              <div className="bg-purple-100 p-6 rounded-full">
                <IoIosRocket className="w-16 h-16 text-purple-600" />
              </div>
            </div>
          </div>

          {/* ¿Qué nos hace únicos? */}
          <div className="lg:w-1/2 flex flex-col bg-white rounded-3xl shadow-lg p-8 sm:p-10 animate-slide-up" style={{ animationDelay: '200ms' }}>
            <div className="mb-6">
              <h2 className="text-3xl md:text-4xl font-bold text-purple-800">¿Qué nos hace únicos?</h2>
            </div>
            
            <div className="space-y-6">
              <FeatureItem 
                icon={Tres}
                text="Somos una red nacional de asesores especializados, con base en Tuxtepec, Oaxaca."
              />
              <FeatureItem 
                icon={Cuatro}
                text="Aplicamos un modelo educativo disruptivo y sostenible, que combina lógica, creatividad y ciencia."
              />
              <FeatureItem 
                icon={Cinco}
                text="Formamos a nuestros estudiantes como ciudadanos críticos y profesionales exitosos, listos para resolver los retos del presente y el futuro."
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <div className="bg-gradient-to-br from-purple-600 via-indigo-700 to-purple-800 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl sm:text-5xl font-bold text-white text-center mb-2 animate-fade-in">
            Misión
          </h2>
          <p className="text-purple-200 text-center text-xl mb-12 animate-fade-in"></p>
          
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 sm:p-12 shadow-2xl animate-slide-up">
            <div className="space-y-6 mb-12">
              <p className="text-white text-xl sm:text-2xl text-center leading-relaxed">
                Formar estudiantes creativos y críticos, preparados para destacar en un mundo impulsado por la ciencia y la tecnología.
              </p>
              <p className="text-white text-xl sm:text-2xl text-center leading-relaxed">
                Ofrecer un servicio integral, humano y transparente, apoyado en tecnologías educativas disruptivas para su éxito profesional y ciudadano.
              </p>
            </div>
            
            <div className="flex flex-wrap justify-center items-center gap-8 sm:gap-12 md:gap-16 lg:gap-20 pt-8">
              <img src={Siete} className="w-28 sm:w-36 md:w-44 hover:scale-110 transition-transform duration-300 drop-shadow-lg" alt="Icon 1" />
              <img src={Ocho} className="w-28 sm:w-36 md:w-44 hover:scale-110 transition-transform duration-300 drop-shadow-lg" alt="Icon 2" />
              <img src={Nueve} className="w-28 sm:w-36 md:w-44 hover:scale-110 transition-transform duration-300 drop-shadow-lg" alt="Icon 3" />
            </div>
          </div>
        </div>
      </div>

      {/* Specialties Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-purple-800 text-center mb-16 animate-fade-in">
          SOMOS ASESORES ESPECIALIZADOS EN...
        </h2>
        
        <div className="grid sm:grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="flex justify-center items-center flex-col bg-white rounded-3xl shadow-lg p-10 hover:shadow-2xl transition-shadow duration-300 animate-slide-up">
            <div className="bg-purple-100 rounded-full p-8 mb-6">
              <img src={Diez} className="w-48 sm:w-56 md:w-64" alt="Ciencias" />
            </div>
            <p className="text-3xl font-bold text-purple-800">Ciencias</p>
          </div>
          
          <div className="flex justify-center items-center flex-col bg-white rounded-3xl shadow-lg p-10 hover:shadow-2xl transition-shadow duration-300 animate-slide-up" style={{ animationDelay: '200ms' }}>
            <div className="bg-indigo-100 rounded-full p-8 mb-6">
              <img src={Once} className="w-48 sm:w-56 md:w-64" alt="Tecnologías" />
            </div>
            <p className="text-3xl font-bold text-purple-800">Tecnologías</p>
          </div>
        </div>
      </div>

      {/* History Section */}
      <div className="bg-gradient-to-b from-white to-purple-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-purple-800 text-center mb-16 animate-fade-in">
            NUESTRA HISTORIA
          </h2>
          
          {/* Founder Section */}
          <div className="flex justify-center items-center flex-col mb-12 animate-slide-up">
            <div className="bg-white rounded-full p-4 shadow-2xl mb-6">
              <img src={Doce} className="w-32 sm:w-40 md:w-48 rounded-full" alt="Kelvin Ramírez" />
            </div>
            <p className="text-4xl sm:text-5xl font-bold text-purple-800 mb-2">Kelvin Ramírez</p>
            <p className="text-2xl sm:text-3xl text-gray-600">CEO y Fundador</p>
          </div>

          {/* History Text */}
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="bg-white rounded-2xl shadow-md p-8 animate-slide-up" style={{ animationDelay: '100ms' }}>
              <p className="text-lg md:text-xl text-gray-700 leading-relaxed text-justify">
                MQerKAcademy se fundo por el asesor <span className="font-semibold text-purple-700">Kelvin Ramírez</span>. La trayectoria comenzó en 2013 bajo el nombre de "Asesorías en Ciencias Exactas", un pequeño espacio creado con la intención de apoyar a estudiantes en el área de matemáticas, física y química. Lo que inició como una iniciativa local y modesta fue, poco a poco, ganando la confianza de más estudiantes y familias, gracias a su enfoque claro, cercano y orientado al fortalecimiento académico.
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-md p-8 animate-slide-up" style={{ animationDelay: '200ms' }}>
              <p className="text-lg md:text-xl text-gray-700 leading-relaxed text-justify">
                En 2016, ante el crecimiento sostenido y la necesidad de ofrecer una propuesta más estructurada e innovadora, surgió <span className="font-semibold text-purple-700">MQerKAcademy</span>, una evolución que reflejaba una visión más amplia: formar estudiantes críticos, creativos y con habilidades científicas sólidas. Esta transformación también implicó la adopción de metodologías más disruptivas y sostenibles, centradas en el desarrollo integral del estudiante.
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-md p-8 animate-slide-up" style={{ animationDelay: '300ms' }}>
              <p className="text-lg md:text-xl text-gray-700 leading-relaxed text-justify">
                En 2021, la academia fue registrada formalmente como institución educativa, consolidando así años de experiencia y compromiso con la formación académica de calidad. En su proceso continuo de mejora, se incorporó el componente de <span className="font-semibold text-purple-700">psicoeducación</span> como parte fundamental del modelo pedagógico. Esta integración respondió a la detección de diversas problemáticas emocionales y afectivas que los estudiantes presentaban al ingresar, muchas de ellas derivadas de experiencias previas en sus contextos escolares de origen. Reconociendo que dichas condiciones impactaban directamente en su desempeño y permanencia, MQerKAcademy fortaleció su enfoque integral, desarrollando estrategias que promueven el bienestar mental y emocional, garantizando así un entorno de aprendizaje saludable, empático y consciente.
              </p>
            </div>

            {/* Quote */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl shadow-lg p-10 text-center animate-slide-up" style={{ animationDelay: '400ms' }}>
              <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-white leading-relaxed">
                "Cambiar el rumbo, transformar la educación"
              </p>
            </div>
          </div>

          {/* Logo Final */}
          <div className="flex justify-center items-center mt-16 animate-fade-in">
            <img src={Trece} className="w-32 sm:w-40 md:w-48 drop-shadow-xl hover:scale-110 transition-transform duration-300" alt="Logo" />
          </div>
        </div>
      </div>

      <Footer />  
    </div>
  );
}

// Feature Item Component
function FeatureItem({ icon, text }) {
  return (
    <div className="flex items-start gap-4 group hover:translate-x-2 transition-transform duration-300">
      <div className="flex-shrink-0 bg-purple-100 p-3 rounded-xl group-hover:bg-purple-200 transition-colors">
        <img src={icon} alt="" className="w-8 h-8" />
      </div>
      <p className="text-lg md:text-xl text-gray-700 leading-relaxed">
        {text}
      </p>
    </div>
  );
}

export default About;