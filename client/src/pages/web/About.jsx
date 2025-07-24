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
import Logo from "../../assets/mqerk/mqerk.png";
import { IoIosRocket } from "react-icons/io";
import { FaFacebook } from "react-icons/fa";
import { FaInstagram } from "react-icons/fa";
import { FaYoutube } from "react-icons/fa";
import { AiFillTikTok } from "react-icons/ai";
import { Link } from "react-router-dom";

function About() {
  return (
    <div>
      <Topbar />
      <div className="py-10 flex justify-center items-center">
        <img src={Uno} className="w-50" />
      </div>
      <div className="flex justify-center items-center">
        <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-5xl font-bold text-[#53289f] leading-snug w-280 text-center">
          MQerKAcademy<sup>®</sup> es una academia disruptiva y sostenible que transforma la forma de aprender ciencias y tecnología.
        </h1>
      </div>
      <div className="flex justify-center items-center px-4 py-8">
        <h1 className="text-xl sm:text-lg md:text-xl lg:text-3xl leading-snug w-220 text-center">
          Preparamos a jóvenes de todos los niveles —básico, medio, medio superior, superior y posgrado— para acreditar materias y exámenes de admisión, dominar habilidades clave y alcanzar un aprendizaje que no tiene límites.
        </h1>
      </div>
      <div className="py-10 flex justify-center items-center">
        <img src={Dos} className="w-200" />
      </div>
      <div className="flex flex-col lg:flex-row justify-center items-start gap-8 px-4 py-12">
      
      {/* Columna: Nuestro propósito */}
      <div className="lg:w-1/2 flex flex-col items-center text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-[#53289f] mb-4">Nuestro propósito</h2>
        <p className="text-base md:text-lg text-gray-700">
          En MQerKAcademy, no solo enseñamos:<br />
          Desarrollamos mentes capaces de aprender para siempre.<br />
          Nuestro enfoque impulsa el pensamiento lógico y creativo, logrando un aprendizaje infinito que trasciende el aula.
        </p>
        {/* Icono de cohete (puedes reemplazarlo por uno real con Tailwind Icons o SVG) */}
        <div className="mt-6">
          <IoIosRocket className="w-10 h-10 text-[#858585]" />
        </div>
      </div>

      {/* Separador vertical para desktop */}
      <div className="hidden lg:block border-l-2 border-5 border-[#483dc7] h-70 mx-4" />

      {/* Columna: ¿Qué nos hace únicos? */}
      <div className="lg:w-1/2 flex flex-col gap-4">
        <h2 className="text-2xl md:text-3xl font-bold text-[#53289f] text-center">¿Qué nos hace únicos?</h2>
        <div className="flex items-start gap-2">
          <img src={Tres} alt="Icono red" className="w-6 h-6 mt-1" />
          <p className="text-base md:text-lg text-gray-700">
            Somos una red nacional de asesores especializados, con base en Tuxtepec, Oaxaca.
          </p>
        </div>
        <div className="flex items-start gap-2">
          <img src={Cuatro} alt="Icono modelo" className="w-6 h-6 mt-1" />
          <p className="text-base md:text-lg text-gray-700">
            Aplicamos un modelo educativo disruptivo y sostenible, que combina lógica, creatividad y ciencia.
          </p>
        </div>
        <div className="flex items-start gap-2">
          <img src={Cinco} alt="Icono personas" className="w-6 h-6 mt-1" />
          <p className="text-base md:text-lg text-gray-700">
            Formamos a nuestros estudiantes como ciudadanos críticos y profesionales exitosos, listos para resolver los retos del presente y el futuro.
          </p>
        </div>
      </div>
    </div>
    <div className="flex justify-center items-center">
        <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-5xl font-bold text-[#53289f] leading-snug w-280 text-center">
          Misión
        </h1>
      </div>
      <div className="text-[#53289f] text-center text-xl">simplificada</div>
      <div className="flex justify-center py-2">
        <div className="about w-200 flex justify-center items-center flex-col text-center py-2 rounded-2xl">
          <p className="text-white text-2xl px-10">Formamos estudiantes creativos y críticos, preparados para destacar en un mundo impulsado por la ciencia y la tecnología.</p>
          <p className="text-white text-2xl px-10">Ofrecemos un servicio integral, humano y transparente, apoyado en tecnologías educativas disruptivas para su éxito profesional y ciudadano.</p>
          <div className="flex justify-center gap-40">
            <img src={Siete} className="w-40" />
            <img src={Ocho} className="w-40" />
            <img src={Nueve} className="w-40" />
          </div>
        </div>
      </div>
      <div className="flex justify-center items-center mt-20">
        <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-5xl font-bold text-[#53289f] leading-snug w-280 text-center">
          SOMOS ASESORES ESPECIALIZADOS EN...
        </h1>
      </div>
      <div className="grid sm:grid-cols-1 lg:grid-cols-2">
        <div className="flex justify-center items-center flex-col mt-20">
          <img src={Diez} className="w-70" />
          <p className="text-2xl">ciencias</p>
        </div>
        <div className="flex justify-center items-center flex-col mt-20">
          <img src={Once} className="w-70" />
          <p className="text-2xl">tecnologías</p>
        </div>
      </div>
      <div className="flex justify-center items-center mt-20">
        <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-5xl font-bold text-[#53289f] leading-snug w-280 text-center">
          NUESTRA HISTORIA
        </h1>
      </div>
      <div className="flex justify-center items-center mt-10 flex-col">
        <img src={Doce} className="w-100" />
        <p className="text-5xl font-bold mt-5">Kelvin Ramírez</p>
        <p className="text-3xl mt-5">CEO y Fundador</p>
      </div>
      <div className="flex justify-center items-center flex-col">
        <p className="text-center w-350 sm:w-150 md:w-200 lg:w-350 text-xl sm:text-md md:text-lg lg:text-xl mt-10">MQerKAcademy se fundo por el asesor Kelvin Ramírez. La trayectoria comenzó en 2013 bajo el nombre de “Asesorías en Ciencias Exactas”, un pequeño espacio creado con la intención de apoyar a estudiantes en el área de matemáticas, física y química. Lo que inició como una iniciativa local y modesta fue, poco a poco, ganando la confianza de más estudiantes y familias, gracias a su enfoque claro, cercano y orientado al fortalecimiento académico.</p>
        <p className="text-center w-350 sm:w-150 md:w-200 lg:w-350 text-xl sm:text-md md:text-lg lg:text-xl mt-10">En 2016, ante el crecimiento sostenido y la necesidad de ofrecer una propuesta más estructurada e innovadora, surgió MQerKAcademy, una evolución que reflejaba una visión más amplia: formar estudiantes críticos, creativos y con habilidades científicas sólidas. Esta transformación también implicó la adopción de metodologías más disruptivas y sostenibles, centradas en el desarrollo integral del estudiante.</p>
        <p className="text-center w-350 sm:w-150 md:w-200 lg:w-350 text-xl sm:text-md md:text-lg lg:text-xl mt-10">En 2021, la academia fue registrada formalmente como institución educativa, consolidando así años de experiencia y compromiso con la formación académica de calidad. En su proceso continuo de mejora, se incorporó el componente de psicoeducación como parte fundamental del modelo pedagógico. Esta integración respondió a la detección de diversas problemáticas emocionales y afectivas que los estudiantes presentaban al ingresar, muchas de ellas derivadas de experiencias previas en sus contextos escolares de origen. Reconociendo que dichas condiciones impactaban directamente en su desempeño y permanencia, MQerKAcademy fortaleció su enfoque integral, desarrollando estrategias que promueven el bienestar mental y emocional, garantizando así un entorno de aprendizaje saludable, empático y consciente.</p>
        <p className="text-center w-350 text-2xl mt-10 font-bold">“Cambiar el rumbo, transformar la educación”</p>
      </div>
      <div className="flex justify-center items-center mt-5">
        <img src={Trece} className="w-40" />
      </div>
      <div className='flex flex-row p-6'>
        <div className='ml-10 w-[35%]'>
          <p className='font-bold text-3xl mt-10' style={{color: '#483dc7'}}>Redes sociales</p>
          <p className='text-xl' style={{color: '#483dc7'}}>@MQerKAcademy</p>
          <div className='flex flex-row gap-3 mt-2'>
            <Link target="_blank" rel="noopener noreferrer" to='https://www.facebook.com/MQerKAcademy'>
              <FaFacebook className='text-3xl mt-4' style={{color: '#483dc7'}}/>
            </Link>
            <Link target="_blank" rel="noopener noreferrer" to='https://www.instagram.com/mqerkacademy/profilecard/?igsh=aDJ1bWpvd21seWVp'>
              <FaInstagram className='text-3xl mt-4 ml-4' style={{color: '#483dc7'}}/>                          
            </Link>
            <Link target="_blank" rel="noopener noreferrer" to='https://youtube.com/@mqerkacademy?si=qf26NkQV14VQm04Z'>
              <FaYoutube className='text-3xl mt-4 ml-4' style={{color: '#483dc7'}}/>
            </Link>
            <Link target="_blank" rel="noopener noreferrer" to='https://www.tiktok.com/@mqerkacademy?_t=ZM-8vakwNtkmaV&_r=1'>
              <AiFillTikTok className='text-3xl mt-4 ml-4' style={{color: '#483dc7'}}/>
            </Link>
          </div>
        </div>
        <div className='flex justify-center items-center w-full gap-10 mt-10'>
          <p className='text-[#483dc7]'>Términos y condiciones</p>
          <p className='text-[#483dc7]'>|</p>
          <p className='text-[#483dc7]'>Políticas de privacidad</p>
        </div>
        <div className='w-[42%]'>
          <div className='flex justify-start items-center mt-13'>
            <img src={Logo} className='w-20 h-15' />
          </div>
          <p className='text-[13px] mt-3 text-[#483dc7]'>Copyright © MQerKAcademy 2025 - Todos los derechos reservados</p>
        </div>
      </div>
    </div>
  )
}

export default About