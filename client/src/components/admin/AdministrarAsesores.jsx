import SolicitudesAsesores from './SolicitudesAsesores.jsx';

// Ahora este componente solo muestra SolicitudesAsesores
export default function AdministrarAsesores(){
  return (
    <div className="px-4 lg:px-8 pt-6 xs:pt-8 sm:pt-10 md:pt-12 pb-6 max-w-screen-2xl mx-auto">
      <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 mb-6">Administrar Asesores</h1>
      <SolicitudesAsesores />
    </div>
  );
}
