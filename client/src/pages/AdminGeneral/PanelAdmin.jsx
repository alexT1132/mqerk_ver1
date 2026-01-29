import { useState } from "react";
import TopbarUno from "../../components/AdminGeneral/Topbar";
import Cards from "../../components/AdminGeneral/Cards";
import ChoiceModal from "../../components/AdminGeneral/ChoiceModal";
import Mqerk from "../../assets/mqerk/mqerk.png";
import Kelumy from "../../assets/kelumy/kelumy_logo.png";
import VivirParaPensarMejor from "../../assets/vivirparapensarmejor/logo.png";
import { useNavigate } from "react-router-dom";

function Index() {

    const [modalId, setModalId] = useState(null);

    const navigate = useNavigate();

  const modalConfig = {
    mqerk: {
      brand: "MQerkAcademy",
      icon: Mqerk,
      subtitle: "Elige el sitio que deseas administrar",
      color: "text-blue-600",
      gradier: "bg-gradient-to-r from-blue-700 to-sky-500",
      options: [
        {
          label: "Página Web",
          sublabel: "Vizualizar y generar cambios de la pagina web",
        //   onClick: () => navigate('/editor'),
        },
        {
          label: "Plataforma",
          sublabel: "Acceso completo a cursos",
          onClick: () => navigate('/administrador_dashboard'),
        },
      ],
    },
    kelumy: {
      brand: "Kelumy",
      icon: Kelumy,
      subtitle: "¿Qué deseas explorar?",
      color: "text-pink-600",
      gradier: "bg-gradient-to-r from-pink-700 to-rose-400",
      options: [
        {
          label: "Landing",
          sublabel: "Descripción del producto",
          onClick: () => window.open("https://kelumy.com", "_blank"),
        },
        {
          label: "Dashboard",
          sublabel: "Ingresar a la app",
          onClick: () => (window.location.href = "/kelumy/app"),
        },
      ],
    },
    filosofia: {
      brand: "Vivir para Pensar Mejor",
      icon: VivirParaPensarMejor,
      subtitle: "Selecciona una opción",
      color: "text-green-600",
      gradier: "bg-gradient-to-r from-green-700 to-green-500",
      options: [
        {
          label: "Blog",
          sublabel: "Artículos y recursos",
          onClick: () => window.open("https://blog.vppm.com", "_blank"),
        },
        {
          label: "Programa",
          sublabel: "Inicia tu proceso",
          onClick: () => (window.location.href = "/programa"),
        },
      ],
    },
  };

  const cfg = modalId ? modalConfig[modalId] : null;

  return (
    <div>
        <TopbarUno />
            <Cards onOpenById={(id) => setModalId(id)} />
            <ChoiceModal
                open={!!modalId}
                onClose={() => setModalId(null)}
                brand={cfg?.brand}
                subtitle={cfg?.subtitle}
                icon={cfg?.icon}
                color={cfg?.color}
                gradier={cfg?.gradier}
                options={cfg?.options || []}
            />
    </div>
  )
}

export default Index