import { useLocation, useParams, Navigate } from 'react-router-dom';
import NavLogin from "../../../components/mqerk/Navbar";
import PreviewPlantila from "../../../components/mqerk/PreviewCurso";
import Footer from "../../../components/layout/footer";

function CursoDetalle() {
  const location = useLocation();
  const { nombreCurso } = useParams();
  const curso = location.state?.curso;

  // Si no hay información del curso, redirigir a la página de cursos
  if (!curso) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className='overflow-hidden min-h-screen'>
      <NavLogin />
      <PreviewPlantila curso={curso} nombreCurso={nombreCurso} />
      <Footer />
    </div>
  );
}

export default CursoDetalle;