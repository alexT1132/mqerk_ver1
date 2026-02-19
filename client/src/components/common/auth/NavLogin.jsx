import Logo from "../../../assets/MQerK_logo.png";
import Guardianes from "../../../assets/guardianes.png";
import { Link } from "react-router-dom";

const DesktopTopbar = () => {
  return (
    <div className="hidden md:flex w-full border-b-2 border-white p-4 items-center justify-between shadow-md md:px-8 2xl:px-24 2xl:py-6" style={{ backgroundColor: "#3818c3" }}>
      {/* Imagen a la izquierda - Ahora clickeable */}
      <Link to="/" className="flex-shrink-0 hover:opacity-80 transition-opacity">
        <img
          src={Logo}
          alt="Logo MQerK"
          className="w-20 h-16 2xl:w-28 2xl:h-24 cursor-pointer object-contain transition-all"
        />
      </Link>

      {/* Título en el centro */}
      <h1 className="text-white text-3xl 2xl:text-5xl font-semibold text-center flex-1 px-4 2xl:px-8">
        Asesores Especializados en la Enseñanza de las Ciencias y Tecnología
      </h1>

      {/* Botón a la derecha */}
      <img
        src={Guardianes}
        alt="Guardianes"
        className="w-16 h-17 2xl:w-24 2xl:h-25 m-0 object-contain transition-all"
      />
    </div>
  );
};

const MobileTopbar = () => {
  return (
    <div className="flex md:hidden w-full border-b border-white/60 px-4 py-3 items-center justify-between shadow-sm" style={{ backgroundColor: "#3818c3" }}>
      {/* Imagen a la izquierda - Ahora clickeable */}
      <Link to="/" className="flex-shrink-0 hover:opacity-80 transition-opacity">
        <img
          src={Logo}
          alt="Logo MQerK"
          className="w-14 h-12 cursor-pointer"
        />
      </Link>

      {/* Título en el centro */}
      <h1 className="text-white text-sm leading-5 text-center flex-1 px-2">
        Asesores Especializados en la Enseñanza de las Ciencias y Tecnología
      </h1>

      <img
        src={Guardianes}
        alt="Guardianes"
        className="w-10 h-10"
      />
    </div>
  );
};

const Topbar = () => {
  return (
    <>
      <DesktopTopbar />
      <MobileTopbar />
    </>
  );
};

export default Topbar;