import Mqerk from "../../assets/mqerk/mqerk.png";
import Kelumy from "../../assets/kelumy/kelumy_logo.png";
import VivirParaPensarMejor from "../../assets/vivirparapensarmejor/logo.png";

export default function Cards({ onOpenById }) {
  const cards = [
    {
      id: "mqerk",
      title: "MQerkAcademy",
      desc: "Plataforma educativa innovadora para el desarrollo de habilidades digitales y tecnológicas del futuro.",
      cta: "Administrar este sitio",
      logo: Mqerk,
      color: "blue",
    },
    {
      id: "kelumy",
      title: "Kelumy",
      desc: "Solución integral para la gestión y optimización de procesos empresariales con tecnología de vanguardia.",
      cta: "Administrar este sitio",
      logo: Kelumy,
      color: "pink",
    },
    {
      id: "filosofia",
      title: "Vivir para Pensar Mejor",
      desc: "Filosofía de vida enfocada en el desarrollo del pensamiento crítico y la mejora continua personal.",
      cta: "Administrar este sitio",
      logo: VivirParaPensarMejor,
      color: "green",
    },
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <Card key={c.id} {...c} onClick={() => onOpenById(c.id)} />
        ))}
      </div>
    </section>
  );
}

function Card({ title, desc, cta, logo, color = "blue", onClick }) {
  const colors = {
    blue:  { bg: "bg-blue-50",  text: "text-blue-800",  ring: "ring-blue-200", btn: "bg-blue-600", hv: "hover:bg-blue-800"},
    pink: { bg: "bg-pink-50", text: "text-pink-800", ring: "ring-pink-200", btn: "bg-pink-600", hv: "hover:bg-pink-800"},
    green:{ bg: "bg-green-50",text: "text-green-800",ring: "ring-green-200", btn: "bg-green-600", hv: "hover:bg-green-800",},
  };
  const c = colors[color] || colors.blue;

  return (
    <article className={`rounded-2xl p-6 shadow-sm ring-1 ${c.ring} ${c.bg} transition hover:shadow-md`}>
      <div className="flex items-center justify-between">
        <h3 className={`text-2xl font-extrabold tracking-tight ${c.text}`}>{title}</h3>
        {logo && <img src={logo} alt={title} className="h-10 w-10 object-contain" />}
      </div>
      <p className="mt-2 text-gray-700 leading-relaxed">{desc}</p>
      <button
        type="button"
        onClick={onClick}
        className={`mt-6 inline-flex w-full items-center justify-center rounded-lg ${c.btn} px-5 py-2.5 text-sm font-semibold text-white transition ${c.hv} focus:outline-none focus:ring-2 focus:${c.hv} focus:ring-offset-2`}
      >
        {cta}
      </button>
    </article>
  );
}
