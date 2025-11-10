import { useState } from 'react';
import Logo from "../../assets/MQerK_logo.png";
import { TiThMenu } from "react-icons/ti";
import { IoMdArrowRoundBack } from "react-icons/io";
import { Link } from "react-router-dom";
import { FaRegCircleUser } from "react-icons/fa6";

const Navbar = () => {

  const [isOpen, setIsOpen] = useState(false);
  const [submenu, setSubmenu] = useState(false);
  const [submenu2, setSubmenu2] = useState(false);

  const [movil, setMovil] = useState(false);
  const [movil2, setMovil2] = useState(false);
  const [movil3, setMovil3] = useState(false);

  const scrollToCursos = () => {
    const section = document.getElementById('cursos');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToInicio = () => {
      const section = document.getElementById('inicio');
      if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
      }
    };

  return (
    <nav className="w-full p-4 sticky top-0 left-0 border-b-3 border-[white] bg-[#3c24ba] shadow-md z-10">
      {/* Desktop Navbar */}
      <div className="hidden md:block">
        <div className="flex justify-between sep">
          <Link to='/'>
              <div className='flex gap-1 items-center justify-center'>
                  <img className='w-21 h-15' src={Logo} />
              </div>
          </Link>
          <div className="flex space-x-4 justify-center items-center gap-6 mqerk-dis" style={{color: '#401454'}}>
              <Link onClick={scrollToInicio} to='/' className="text-lg text-white p-2 rounded-2xl ">Inicio</Link>
              <Link to='/acerca_de' className="text-lg text-white p-2 rounded-2xl ">Acerca de</Link>
              <Link onClick={scrollToCursos} className="text-lg text-white gap-1 p-2 flex justify-center items-center rounded-2xl">
                Cursos
              </Link>

              <Link tabIndex={0} onBlur={() => setTimeout(() => setSubmenu2(false), 150)} onClick={() => setSubmenu2(!submenu2)} className="text-lg text-white gap-1 p-2 flex justify-center items-center rounded-2xl ">
                Eventos
                <svg
                  className={`w-4 h-4 mt-[2px] transition-transform ${
                    submenu2 ? "rotate-180" : "rotate-0"
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </Link>

              {submenu2 && (
                <div className="absolute right-65 mt-58 w-40 bg-white shadow-lg rounded-md z-10 eventos-mqerk">
                  <Link
                  to="/bootcamps"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                  >
                    Bootcamp
                  </Link>
                  <Link to='/talleres'
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                  >
                    Talleres
                  </Link>
                  <Link
                  to="/exporientas"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                  >
                    Exporientas
                  </Link>
                  <a
                  href="https://open.spotify.com/user/mvn8ly2def6rlqnbgrck8p85h?si=possNo4YSyqJ8ADW34LShw"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                  >
                    Podcast
                  </a>
                  <Link
                  to="/online"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                  >
                    Online
                  </Link>
                  </div>
              )}

              <Link to='/blog' className="text-lg text-white gap-1 p-2 flex justify-center items-center rounded-2xl ">
                Blog
              </Link>

              <Link to='/login' className='text-white flex justify-center items-center hover:bg-white hover:text-[#3c24ba] gap-2 py-6 font-bold w-40 h-10 border rounded-lg login'>
                  <FaRegCircleUser className='text-2xl desaparecer' />
                  Iniciar sesión
              </Link>
          </div>
        </div>
      </div>

      {/* Tablet */}
      <div className="hidden sm:block md:hidden">
      <div className="flex justify-between items-center">
        <Link to='/'>
          <div className='flex gap-1 items-center justify-center'>
            <img className='w-13 h-10' src={Logo} />
          </div>
        </Link>
        <div className="flex space-x-3 justify-center items-center gap-6">
            <button onClick={() => setIsOpen(!isOpen)} className='text-white font-bold w-13 h-10 rounded-lg flex justify-center items-center'>
              <TiThMenu className='text-3xl' style={{color: '#ffffff'}}/>
            </button>
        </div>


       {/* Panel lateral derecho */}
      <div
        className={`fixed top-0 right-0 h-full w-46 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-40 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-4">
          <div className="flex gap-10 items-center mb-4">
          <button
              onClick={() => setIsOpen(false)}
              className="text-2xl" style={{ color: '#401454' }}
            >
              <IoMdArrowRoundBack />
            </button>
            <h2 className="text-lg font-semibold" style={{ color: '#401454' }}>Menu</h2>
          </div>
          <div>
            <ul className="space-y-4">
              <Link to='http://192.168.0.18:5000/login'>
                <button className='bg-[#3c24ba] text-white rounded-lg w-full font-bold h-8'>Iniciar sesión</button>
              </Link>
              <hr className='mt-3' />
              <li className="text-lg font-semibold py-2"><Link style={{ color: '#401454' }}>Acerca de</Link></li>

              <Link tabIndex={0} onBlur={() => setMovil(false)} onClick={() => setMovil(!movil)} className="font-bold py-2 gap-2 flex rounded-2xl" style={{ color: '#401454' }}>
              Cursos
              <svg
                className={`w-4 h-4 mt-[5px] transition-transform ${
                  movil ? "rotate-180" : "rotate-0"
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
              </Link>

              {movil && (
              <div className="relative w-40 z-10">
                <a
                href="#"
                className="block py-2 text-gray-700"
                >
                  Reto Secundaria
                </a>
                <a
                href="#"
                className="block py-2 text-gray-700 hover:bg-gray-100"
                >
                  Reto Preparatoria
                </a>
                <a
                href="#"
                className="block py-2 text-gray-700 hover:bg-gray-100"
                >
                  Reto Universitario
                </a>
                <a
                href="#"
                className="block py-2 text-gray-700 hover:bg-gray-100"
                >
                  Profesional
                </a>
                </div>
              )}

              <Link tabIndex={0} onBlur={() => setMovil2(false)} onClick={() => setMovil2(!movil2)} className="font-bold py-2 gap-2 flex rounded-2xl" style={{ color: '#401454' }}>
              Eventos
              <svg
                className={`w-4 h-4 mt-[5px] transition-transform ${
                  movil2 ? "rotate-180" : "rotate-0"
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
              </Link>

              {movil2 && (
              <div className="relative w-40 z-10">
                <Link
                to="/bootcamps"
                className="block py-2 text-gray-700"
                >
                  Bootcamp
                </Link>
                <Link
                to="/talleres"
                className="block py-2 text-gray-700 hover:bg-gray-100"
                >
                  Talleres
                </Link>
                <Link
                to="/exporientas"
                className="block py-2 text-gray-700 hover:bg-gray-100"
                >
                  Exporientes
                </Link>
                <Link
                to="https://open.spotify.com/user/mvn8ly2def6rlqnbgrck8p85h?si=possNo4YSyqJ8ADW34LShw"
                className="block py-2 text-gray-700 hover:bg-gray-100"
                >
                  Podcast
                </Link>
                <Link
                to="/online"
                className="block py-2 text-gray-700 hover:bg-gray-100"
                >
                  Online
                </Link>
                </div>
              )}

              <Link to='/blog' tabIndex={0} onBlur={() => setMovil3(false)} onClick={() => setMovil3(!movil3)} className="font-bold py-2 gap-2 flex rounded-2xl" style={{ color: '#401454' }}>
                Blog
              </Link>
              
            </ul>
          </div>
        </div>
      </div>
        </div>
      </div>

      {/* Mobile Navbar */}
      <div className="block sm:hidden">
        <div className="flex justify-between items-center">
        <Link to='/'>
          <div className='flex gap-1 items-center justify-center'>
            <img className='w-13 h-10' src={Logo} />
          </div>
        </Link>
        <div className="flex space-x-3 justify-center items-center gap-6">
            <button onClick={() => setIsOpen(!isOpen)} className='text-white font-bold w-13 h-10 rounded-lg flex justify-center items-center'>
              <TiThMenu className='text-3xl' style={{color: '#ffffff'}}/>
            </button>
        </div>


       {/* Panel lateral derecho */}
      <div
        className={`fixed top-0 right-0 h-full w-46 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-40 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-4">
          <div className="flex gap-10 items-center mb-4">
          <button
              onClick={() => setIsOpen(false)}
              className="text-2xl" style={{ color: '#401454' }}
            >
              <IoMdArrowRoundBack />
            </button>
            <h2 className="text-lg font-semibold" style={{ color: '#401454' }}>Menu</h2>
          </div>
          <div>
            <ul className="space-y-4">
              <Link to='/login'>
                <button className='bg-[#3c24ba] text-white rounded-lg w-full font-bold h-8'>Iniciar sesión</button>
              </Link>
              <hr className='mt-3' />
              <li className="text-lg font-semibold py-2"><Link style={{ color: '#401454' }}>Acerca de</Link></li>

              <Link tabIndex={0} onBlur={() => setMovil(false)} onClick={() => setMovil(!movil)} className="font-bold py-2 gap-2 flex rounded-2xl" style={{ color: '#401454' }}>
              Cursos
              <svg
                className={`w-4 h-4 mt-[5px] transition-transform ${
                  movil ? "rotate-180" : "rotate-0"
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
              </Link>

              {movil && (
              <div className="relative w-40 z-10">
                <a
                href="#"
                className="block py-2 text-gray-700"
                >
                  Reto Secundaria
                </a>
                <a
                href="#"
                className="block py-2 text-gray-700 hover:bg-gray-100"
                >
                  Reto Preparatoria
                </a>
                <a
                href="#"
                className="block py-2 text-gray-700 hover:bg-gray-100"
                >
                  Reto Universitario
                </a>
                <a
                href="#"
                className="block py-2 text-gray-700 hover:bg-gray-100"
                >
                  Profesional
                </a>
                </div>
              )}

              <Link tabIndex={0} onBlur={() => setMovil2(false)} onClick={() => setMovil2(!movil2)} className="font-bold py-2 gap-2 flex rounded-2xl" style={{ color: '#401454' }}>
              Eventos
              <svg
                className={`w-4 h-4 mt-[5px] transition-transform ${
                  movil2 ? "rotate-180" : "rotate-0"
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
              </Link>

              {movil2 && (
              <div className="relative w-40 z-10">
                <Link
                to="/bootcamps"
                className="block py-2 text-gray-700"
                >
                  Bootcamp
                </Link>
                <Link
                to="/talleres"
                className="block py-2 text-gray-700 hover:bg-gray-100"
                >
                  Talleres
                </Link>
                <Link
                to="/exporientas"
                className="block py-2 text-gray-700 hover:bg-gray-100"
                >
                  Exporientes
                </Link>
                <Link
                to="https://open.spotify.com/user/mvn8ly2def6rlqnbgrck8p85h?si=possNo4YSyqJ8ADW34LShw"
                className="block py-2 text-gray-700 hover:bg-gray-100"
                >
                  Podcast
                </Link>
                <Link
                to="/online"
                className="block py-2 text-gray-700 hover:bg-gray-100"
                >
                  Online
                </Link>
                </div>
              )}

              <Link to='/blog' tabIndex={0} onBlur={() => setMovil3(false)} onClick={() => setMovil3(!movil3)} className="font-bold py-2 gap-2 flex rounded-2xl" style={{ color: '#401454' }}>
                Blog
              </Link>
              
            </ul>
          </div>
        </div>
      </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
