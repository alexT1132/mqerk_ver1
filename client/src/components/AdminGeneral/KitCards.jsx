import {
  MiniCard,
  MiniCardWithChips,
  IconMoney,
  IconApps,
  IconShield,
  IconLayers,
  IconUser,
} from "./Sections";

export default function CardsRow() {

    const handleSelect = (data) => {
        console.log(data);
    };

  return (
    <section className="mx-auto px-20 py-4">
      {/* Grid responsive 1→2→3→4 */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <MiniCardWithChips
          icon={<IconMoney className="h-4 w-4" />}
          title="Finanzas"
          titleColor="violet"
          subtitle="Semáforo: saludable"
          href="#"
          onSelect={handleSelect}
        />

        <MiniCard
          icon={<IconApps className="h-4 w-4" />}
          title="Contabilidad"
          titleColor="green"
          href="#"
          onSelect={handleSelect}
        />

        <MiniCard
          icon={<IconShield className="h-4 w-4" />}
          title="Administrativo"
          titleColor="violet"
          href="#"
          onSelect={handleSelect}
        />

        <MiniCard
          icon={<IconLayers className="h-4 w-4" />}
          title="Gestión"
          titleColor="blue"
          href="#"
          onSelect={handleSelect}
        />

        <MiniCard
          icon={<IconUser className="h-4 w-4" />}
          title="Estrategica"
          titleColor="pink"
          href="#"
          onSelect={handleSelect}
        />

        <MiniCard
          icon={<IconUser className="h-4 w-4" />}
          title="Perfil Asesor"
          titleColor="blue"
          href="#"
          onSelect={handleSelect}
        />
      </div>
    </section>
  );
}
