import { useState, useEffect, useMemo } from "react";
// Reemplazo: esta vista ahora usa el dominio de 'actividades' (no feedback)
import { listActividades as apiListActividades, listEntregasActividad as apiListEntregasActividad, calificarEntrega as apiCalificarEntrega, createActividad, updateActividad } from '../api/actividades';
// Eliminado uso legacy feedback para creación/asignación de grupos
import { X, BookOpen, Calendar, Clock, Users, Upload, ChevronDown, Plus, Check, Loader2, RotateCcw, FileText, AlertTriangle } from 'lucide-react';
// Catálogo dinámico de áreas/módulos (reutiliza la misma API que el alumno)
import { getAreasCatalog } from '../api/areas';
import { AREAS_CATALOG_CACHE } from '../utils/catalogCache';
import { styleForArea } from './common/areaStyles.jsx';


const TestComp = () => {
    
    

    

    return (
        <div className="bg-[#1f1f1f] h-dvh flex items-center justify-center">
            <BtnDesplegable selected={selected} setSelected={setSelected} />
            <ModalCursos onClick={handleOpenModal} />
            <ActivityModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </div>
    )
}

export const BtnDesplegable = ({selected, setSelected}) => {
  // Quizzes no se usarán por ahora → sólo dejamos Actividades
  const Opciones = [`Actividades`];

    

    useEffect(() => {
        const saved = sessionStorage.getItem("opcionSeleccionada");
        if (saved && Opciones.includes(saved)) {
            setSelected(saved);
        } else {
            setSelected(Opciones[0]);
        }
    }, [setSelected]);

    const handleChange = (e) => {
        setSelected(e.target.value);
        sessionStorage.setItem("opcionSeleccionada", e.target.value);
    };

    return (
        <select
            className="flex bg-white uppercase w-30 max-sm:border-2 sm:w-50 font-semibold sm:font-bold rounded-xl p-1 cursor-pointer text-xs sm:text-xl md:text-2xl text-[#53289f] select-none"
            value={selected}
            onChange={handleChange}
        >
            {Opciones.map((opcion, index) =>
                <option
                    className="font-semibold hover:bg-amber-600 cursor-pointer sm:font-bold"
                    key={index}
                    value={opcion}
                    disabled={opcion === selected}
                    hidden={opcion === selected}
                >
                    {opcion}
                </option>
            )}
        </select>
    );
};

export const ModalCursos=({onClick})=>{
    return(
        <button onClick={onClick} className={`relative flex group rounded-full w-fit hover:bg-gray-300 cursor-pointer`}>
            <svg className={`flex sm:hidden`} xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#53289f"><path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z"/></svg>
            <svg className={`hidden sm:flex`} xmlns="http://www.w3.org/2000/svg" height="30px" viewBox="0 -960 960 960" width="30px" fill="#53289f"><path d="M446.67-446.67H200v-66.66h246.67V-760h66.66v246.67H760v66.66H513.33V-200h-66.66v-246.67Z"/></svg>
            <span className={`absolute opacity-0 hover:opacity-0 cursor-default group-hover:opacity-100 font-semibold transition-opacity duration-300 bg-violet-600 border-1 border-gray-400 text-white rounded-full pointer-events-none px-2 -top-6.5 -right-7 select-none z-3`}>Crear</span>
        </button>
    )
}


export const ActivityModal = ({ isOpen, onClose, grupoAsesor, onCreated }) => {
  // Estado original + integración backend
  // Modelo inicial para poder reiniciar fácilmente al abrir de nuevo
  const initialActivityData = useMemo(() => ({
    titulo: '',
    fechaEntrega: '',
    descripcion: '',
    horaLimite: '',
    gruposAsignados: grupoAsesor ? [grupoAsesor] : [],
    recursos: null,
    materiaAsignacion: ''
  }), [grupoAsesor]);
  const [activityData, setActivityData] = useState(initialActivityData);
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [resourcePreviews, setResourcePreviews] = useState([]); // {name, sizeKB}
  const [resourceError, setResourceError] = useState('');

  // Inicializar fecha/hora por defecto al abrir
  useEffect(() => {
    if (isOpen) {
      // Reiniciar todo el estado del formulario al abrir
      const now = new Date();
      const yyyy = now.getFullYear();
      const mm = String(now.getMonth() + 1).padStart(2, '0');
      const dd = String(now.getDate()).padStart(2, '0');
      const dateStr = `${yyyy}-${mm}-${dd}`;
      setActivityData({
        ...initialActivityData,
        fechaEntrega: dateStr,
        horaLimite: '23:59'
      });
      setCurrentStep(0);
      setIsDropdownOpen(false);
      setResourcePreviews([]);
      setResourceError('');
    }
  }, [isOpen, initialActivityData]);

  // Catálogo dinámico (áreas generales + módulos específicos) — reemplaza placeholder
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [catalogError, setCatalogError] = useState('');
  const [areasGenerales, setAreasGenerales] = useState([]); // [{id,nombre,descripcion}]
  const [modulosEspecificos, setModulosEspecificos] = useState([]); // idem

  useEffect(()=> {
    if(!isOpen) return; // cargar sólo cuando se abre para evitar trabajo innecesario
    let cancel = false;
    const fromCache = AREAS_CATALOG_CACHE.get();
    const applyPayload = (payload) => {
      const generales = Array.isArray(payload.generales) ? payload.generales : [];
      const modulos = Array.isArray(payload.modulos) ? payload.modulos : [];
      // El contenedor (payload.contenedor) es sólo agrupador, no materia real para asignar → lo omitimos aquí
      if(!cancel){
        setAreasGenerales(generales);
        setModulosEspecificos(modulos);
      }
    };
    if(fromCache?.data){
      applyPayload(fromCache.data);
      if(!fromCache.stale) return; // fresco
    }
    const load = async (silent=false)=> {
      if(!silent) { setCatalogLoading(true); setCatalogError(''); }
      try {
        const res = await getAreasCatalog();
        const payload = res.data?.data || res.data || {};
        AREAS_CATALOG_CACHE.set(payload);
        applyPayload(payload);
      } catch(e){ if(!cancel){ setCatalogError('No se pudo cargar catálogo de materias'); }}
      finally { if(!cancel) setCatalogLoading(false); }
    };
    load(fromCache?.data ? true : false);
    return ()=> { cancel=true; };
  },[isOpen]);

  // Lista combinada con estructura para dropdown agrupado
  const dropdownItems = useMemo(()=> ([
    { group: 'ÁREAS GENERALES', items: areasGenerales.map(a=> ({ id:a.id, name:a.nombre, descripcion:a.descripcion, ...styleForArea(a.id) })) },
    { group: 'MÓDULOS ESPECÍFICOS', items: modulosEspecificos.map(m=> ({ id:m.id, name:m.nombre, descripcion:m.descripcion, ...styleForArea(m.id) })) }
  ]), [areasGenerales, modulosEspecificos]);
  // Grupos: usar códigos reales pero mantener estilo simple
  const availableGroups = ALL_GROUPS.map(g => ({ id: g, name: g }));

  const steps = [
    { title: 'Detalles', icon: BookOpen },
    { title: 'Archivos', icon: Upload },
    { title: 'Grupos', icon: Users }
  ];
  // Filtro de grupos (UX mejora para ver información completa)
  const [groupFilter, setGroupFilter] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setActivityData(prev => ({ ...prev, [name]: value }));
  };

  const handleMateriaSelect = (courseId) => {
    setActivityData(prev => ({ ...prev, materiaAsignacion: courseId }));
    setIsDropdownOpen(false);
  };
  const getSelectedCourse = () => {
    for(const g of dropdownItems){
      const found = g.items.find(i=> String(i.id) === String(activityData.materiaAsignacion));
      if(found) return found;
    }
    return null;
  };

  const handleGroupChange = (groupId) => {
    // Si el asesor tiene grupo fijo, bloquear selección de otros
    if (grupoAsesor && groupId !== grupoAsesor) return;
    setActivityData(prev => {
      const exists = prev.gruposAsignados.includes(groupId);
      return {
        ...prev,
        gruposAsignados: exists ? prev.gruposAsignados.filter(g => g !== groupId) : [...prev.gruposAsignados, groupId]
      };
    });
  };

  const MAX_PDF_SINGLE = 5 * 1024 * 1024;      // 5MB si solo se sube un PDF
  const MAX_PDF_MULTI = 8 * 1024 * 1024;       // 8MB por archivo cuando hay varios
  const MAX_TOTAL_BYTES = 20 * 1024 * 1024;    // 20MB suma total
  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (name !== 'recursos' || !files) return;
    setResourceError('');
    const incoming = Array.from(files);
    const perFileLimit = incoming.length === 1 ? MAX_PDF_SINGLE : MAX_PDF_MULTI;
    const valid = [];
    const previews = [];
    let total = 0;
    for (const f of incoming) {
      if (f.type !== 'application/pdf') {
        setResourceError('Solo se permiten archivos PDF.');
        continue;
      }
      if (f.size > perFileLimit) {
        setResourceError(`El archivo ${f.name} supera el límite de ${perFileLimit === MAX_PDF_SINGLE ? '5MB (cuando es único)' : '8MB'}. Comprime el PDF.`);
        continue;
      }
      if (total + f.size > MAX_TOTAL_BYTES) {
        setResourceError(`La suma total excede 20MB. Comprime o elimina algunos PDFs.`);
        continue;
      }
      total += f.size;
      valid.push(f);
      previews.push({ name: f.name, sizeKB: (f.size/1024).toFixed(1) });
    }
    setActivityData(prev => ({ ...prev, recursos: valid.length ? valid : null }));
    setResourcePreviews(previews);
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setIsAnimating(true);
      setTimeout(() => { setCurrentStep(s => s + 1); setIsAnimating(false); }, 180);
    }
  };
  const prevStep = () => {
    if (currentStep > 0) {
      setIsAnimating(true);
      setTimeout(() => { setCurrentStep(s => s - 1); setIsAnimating(false); }, 180);
    }
  };

  const buildDueDate = () => `${activityData.fechaEntrega} ${activityData.horaLimite || '23:59'}`;

  const handleSubmit = async (e) => {
    e.preventDefault();
  if (!activityData.titulo || !activityData.fechaEntrega || !activityData.horaLimite) {
      alert('Completa título, fecha y hora');
      return;
    }
    if (!activityData.materiaAsignacion) {
      alert('Selecciona una materia');
      return;
    }
    const grupos = activityData.gruposAsignados.length ? activityData.gruposAsignados : (grupoAsesor ? [grupoAsesor] : []);
    if (!grupos.length) {
      alert('Selecciona al menos un grupo');
      return;
    }
    try {
      setSaving(true);
      const fd = new FormData();
  // Dominio actividades
  fd.append('titulo', activityData.titulo);
  fd.append('descripcion', activityData.descripcion || '');
  fd.append('fecha_limite', buildDueDate());
  fd.append('id_area', activityData.materiaAsignacion);
  // Campos default
  fd.append('tipo', 'actividad');
  fd.append('puntos_max', 100);
  fd.append('activo', 1);
  fd.append('publicado', 1);
  if (activityData.recursos) Array.from(activityData.recursos).forEach(f => fd.append('recursos', f));
  fd.append('grupos', JSON.stringify(grupos));
  await createActividad(fd);
      if (onCreated) onCreated();
      onClose();
    } catch (err) {
      console.error(err);
      alert('Error creando la actividad');
    } finally { setSaving(false); }
  };

  // Cleanup al cerrar modal
  useEffect(()=> {
  if(!isOpen){ setResourcePreviews([]); setResourceError(''); }
  },[isOpen]);

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4 sm:space-y-6">
            {/* Título */}
            <div className="group">
              <label className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-700 mb-1"><BookOpen className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600"/>Título de la Actividad <span className="text-red-500">*</span></label>
              <input name="titulo" value={activityData.titulo} onChange={handleChange} className="w-full p-2 sm:p-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-xs sm:text-sm" placeholder="Ej. Operaciones Fundamentales" required />
              <p className="mt-1 text-[10px] sm:text-xs text-gray-500">Nombre visible para los alumnos.</p>
            </div>
            {/* Materia */}
            <div className="group">
              <label className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                <BookOpen className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600" />
                Materia Asociada <span className="text-red-500">*</span>
                <button
                  type="button"
                  onClick={()=> { // refrescar catálogo manual
                    setCatalogLoading(true); setCatalogError('');
                    (async()=> {
                      try {
                        AREAS_CATALOG_CACHE.clear();
                        const res = await getAreasCatalog();
                        const payload = res.data?.data || res.data || {};
                        AREAS_CATALOG_CACHE.set(payload);
                        const generales = Array.isArray(payload.generales) ? payload.generales : [];
                        const modulos = Array.isArray(payload.modulos) ? payload.modulos : [];
                        setAreasGenerales(generales);
                        setModulosEspecificos(modulos);
                      } catch(e){ setCatalogError('No se pudo refrescar'); }
                      finally { setCatalogLoading(false); }
                    })();
                  }}
                  className="ml-auto inline-flex items-center justify-center w-6 h-6 rounded-md border border-gray-300 text-gray-500 hover:text-purple-600 hover:border-purple-400 transition text-[10px]"
                  title="Refrescar catálogo"
                >
                  {catalogLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <RotateCcw className="w-3 h-3" />}
                </button>
              </label>
              <div className="relative">
                <button type="button" onClick={()=> setIsDropdownOpen(o=>!o)} className="w-full p-2 sm:p-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 flex items-center justify-between text-xs sm:text-sm">
                  <span className="flex items-center gap-2">{getSelectedCourse()? (<><span>{getSelectedCourse().icono || getSelectedCourse().icon}</span><span>{getSelectedCourse().name}</span></>):<span className="text-gray-500">Selecciona una materia</span>}</span>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isDropdownOpen? 'rotate-180':''}`} />
                </button>
                {isDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto text-xs sm:text-sm">
                    {catalogLoading && (
                      <div className="flex items-center gap-2 p-3 text-purple-600">
                        <Loader2 className="w-4 h-4 animate-spin" /> Cargando...
                      </div>
                    )}
                    {catalogError && (
                      <div className="p-3 text-red-600 text-xs">{catalogError}</div>
                    )}
                    {!catalogLoading && !catalogError && dropdownItems.map(section => (
                      <div key={section.group} className="border-b last:border-b-0 border-gray-100">
                        <div className="px-3 pt-2 pb-1 text-[10px] font-semibold text-gray-500 tracking-wide">{section.group}</div>
                        {section.items.length === 0 && (
                          <div className="px-3 py-2 text-gray-400">(Vacío)</div>
                        )}
                        {section.items.map(item => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={()=> handleMateriaSelect(item.id)}
                            className="w-full px-3 py-2 flex items-center gap-2 hover:bg-purple-50 transition-colors duration-150 text-left"
                          >
                            <span className={`w-6 h-6 rounded-md bg-gradient-to-br ${item.bgColor?.replace('bg-gradient-to-br','')} flex items-center justify-center text-white shadow-inner`}>{item.icono}</span>
                            <span className="flex-1 min-w-0">
                              <span className="block truncate font-medium text-gray-800 text-[11px] sm:text-xs">{item.name}</span>
                              {item.descripcion && <span className="block text-[9px] text-gray-500 truncate">{item.descripcion}</span>}
                            </span>
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            {/* Fecha y hora */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-700 mb-1"><Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600"/>Fecha límite <span className="text-red-500">*</span></label>
                <input type="date" name="fechaEntrega" value={activityData.fechaEntrega} onChange={handleChange} className="w-full p-2 sm:p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-xs sm:text-sm" required aria-label="Fecha límite de entrega" />
                <p className="mt-1 text-[10px] sm:text-xs text-gray-500">Día en que vence la entrega.</p>
              </div>
              <div>
                <label className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-700 mb-1"><Clock className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600"/>Hora límite <span className="text-red-500">*</span></label>
                <input type="time" name="horaLimite" value={activityData.horaLimite} onChange={handleChange} className="w-full p-2 sm:p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-xs sm:text-sm" required aria-label="Hora límite de entrega" />
                <p className="mt-1 text-[10px] sm:text-xs text-gray-500">Hora (24h) en la que cierra la recepción.</p>
              </div>
            </div>
            {/* Descripción */}
            <div>
              <label className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-700 mb-1"><FileText className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600"/>Descripción</label>
              <textarea name="descripcion" value={activityData.descripcion} onChange={handleChange} className="w-full p-2 sm:p-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300 min-h-[60px] sm:min-h-[80px] resize-none text-xs sm:text-sm" placeholder="Describe la actividad..." rows="3" />
              <p className="mt-1 text-[10px] sm:text-xs text-gray-500">Instrucciones o contexto opcional para los alumnos.</p>
            </div>
          </div>
        );
      case 1:
        return (
          <div className="space-y-4 sm:space-y-6">
            <div className="group">
              <label className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-700 mb-3"><Upload className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600"/>Adjuntar PDF(s)</label>
              <div className="relative">
                <input type="file" name="recursos" accept="application/pdf" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" multiple />
                <div className="p-4 sm:p-6 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl text-center hover:bg-gray-100 hover:border-purple-400 transition-all duration-300">
                  <Upload className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-xs sm:text-sm text-gray-600 font-medium">{activityData.recursos ? `${activityData.recursos.length} PDF seleccionado(s)` : 'Arrastra tus PDFs o haz clic'}</p>
                  <p className="text-[10px] sm:text-xs text-gray-500 mt-1">Solo PDF. 1 archivo: máx 5MB. Varios: máx 8MB cada uno. Total ≤ 20MB.</p>
                </div>
              </div>
              {resourceError && (
        <div className="mt-3 flex items-start gap-2 text-red-600 text-xs sm:text-sm bg-red-50 border border-red-200 p-2 rounded">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <div>
          {resourceError} <a href="https://www.ilovepdf.com/compress_pdf" target="_blank" rel="noopener noreferrer" className="underline font-medium">Comprimir PDF</a>
                  </div>
                </div>
              )}
              {activityData.recursos && activityData.recursos.length > 0 && (
                <ul className="mt-3 space-y-1 max-h-40 overflow-y-auto text-xs sm:text-sm">
                  {Array.from(activityData.recursos).map((f, idx) => (
                    <li key={idx} className="flex items-center justify-between bg-white border rounded-md px-2 py-1">
                      <span className="truncate mr-2" title={f.name}>{f.name}</span>
                      <span className="text-[10px] text-gray-500 mr-2">{(f.size/1024).toFixed(1)} KB</span>
                      <button type="button" className="text-red-500 hover:text-red-600 text-xs" onClick={() => {
                        const arr = Array.from(activityData.recursos).filter((_,i)=> i!==idx);
                        setActivityData(prev=> ({ ...prev, recursos: arr.length ? arr : null }));
                        setResourcePreviews(prev => prev.filter((_,i)=> i!==idx));
                      }}>✕</button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
              <h3 className="text-sm sm:text-base font-semibold text-gray-800">Seleccionar Grupos</h3>
              <span className="ml-auto bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs">{activityData.gruposAsignados.length} seleccionados</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 items-stretch">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Filtrar grupos..."
                  value={groupFilter}
                  onChange={e=> setGroupFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                {groupFilter && (
                  <button
                    type="button"
                    onClick={()=> setGroupFilter('')}
                    className="absolute top-1/2 -translate-y-1/2 right-2 text-gray-400 hover:text-gray-600 text-xs"
                  >✕</button>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-2 sm:gap-3 max-h-[55vh] overflow-y-auto pr-1 custom-scrollbar">
              {availableGroups
                .filter(g=> !groupFilter || g.toLowerCase().includes(groupFilter.toLowerCase()))
                .map(group => {
                const isSelected = activityData.gruposAsignados.includes(group.id);
                const disabled = grupoAsesor && group.id !== grupoAsesor;
                return (
                  <div key={group.id} title={group.name} onClick={() => !disabled && handleGroupChange(group.id)} className={`p-3 sm:p-4 rounded-xl cursor-pointer transition-colors duration-200 border ${disabled? 'opacity-50 cursor-not-allowed':''} ${isSelected? 'bg-purple-100 border-purple-400 shadow-md':'bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-300'}`}> 
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0 space-y-0.5">
                        <p className="text-xs sm:text-sm font-medium text-gray-800 break-words leading-snug">{group.name}</p>
                        <p className="text-[10px] sm:text-xs text-gray-500 leading-snug">Turno académico</p>
                      </div>
                      <div className={`flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center transition-colors duration-200 ${isSelected ? 'border-purple-600 bg-purple-600':'border-gray-300 bg-white'}`}>{isSelected && <Check className="w-3 h-3 sm:w-4 sm:h-4 text-white"/>}</div>
                    </div>
                  </div>
                );
              })}
            </div>
            {grupoAsesor && <p className="text-[10px] sm:text-xs text-gray-500">Tienes un grupo fijo: no puedes asignar otros.</p>}
          </div>
        );
      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4"
         style={{ fontFamily: '"Lato", "Helvetica Neue", Helvetica, Arial, sans-serif' }}>
      <div className="w-full max-w-sm sm:max-w-lg md:max-w-2xl lg:max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden">
        {/* Modal Container */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col h-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden">
          
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-purple-600 to-indigo-600">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div>
                <h1 className="text-base sm:text-xl lg:text-2xl font-bold text-white">Nueva Actividad</h1>
                <p className="text-xs sm:text-sm text-white/80">MQerK Academy</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all duration-300"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </button>
          </div>

          {/* Progress Steps */}
          <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isActive = index === currentStep;
                const isCompleted = index < currentStep;
                
                return (
                  <div key={index} className="flex items-center flex-1">
                    <div className={`flex items-center gap-2 sm:gap-3 ${index < steps.length - 1 ? 'flex-1' : ''}`}>
                      <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                        isActive ? 'bg-purple-600 scale-110' :
                        isCompleted ? 'bg-green-500' : 'bg-gray-300'
                      }`}>
                        {isCompleted ? (
                          <Check className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                        ) : (
                          <Icon className={`w-3 h-3 sm:w-4 sm:h-4 ${isActive ? 'text-white' : 'text-gray-600'}`} />
                        )}
                      </div>
                      <span className={`text-xs sm:text-sm font-medium hidden sm:block ${
                        isActive ? 'text-purple-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                      }`}>
                        {step.title}
                      </span>
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`flex-1 h-0.5 mx-2 sm:mx-4 transition-all duration-300 ${
                        isCompleted ? 'bg-green-500' : 'bg-gray-300'
                      }`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            <div className={`transition-all duration-300 ${isAnimating ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}`}>
              {renderStepContent()}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-4 sm:p-6 border-t border-gray-200 bg-gradient-to-r from-purple-600 to-indigo-600">
            <div className="flex gap-2 sm:gap-4">
              {currentStep > 0 && (
                <button
                  onClick={prevStep}
                  className="flex-1 py-2 sm:py-3 px-4 bg-white/20 hover:bg-white/30 text-white font-semibold rounded-xl transition-all duration-300 text-xs sm:text-sm"
                >
                  Anterior
                </button>
              )}
              
              {currentStep < steps.length - 1 ? (
                <button
                  onClick={nextStep}
                  className="flex-1 py-2 sm:py-3 px-4 bg-white text-purple-600 hover:bg-gray-100 font-semibold rounded-xl transition-all duration-300 shadow-lg text-xs sm:text-sm"
                >
                  Siguiente
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={saving}
                  className={`flex-1 py-2 sm:py-3 px-4 ${saving? 'bg-green-300 cursor-not-allowed':'bg-green-500 hover:bg-green-600'} text-white font-semibold rounded-xl transition-all duration-300 shadow-lg text-xs sm:text-sm`}
                >
                  {saving? 'Guardando...':'Crear Actividad'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};




// Grupos disponibles
const ALL_GROUPS = ["M1", "M2", "M3", "V1", "V2", "V3"]; // TODO: mover a API grupos

export const TablaAsignacionActividades = ({ grupoAsesor, gruposAsesor = [], reloadFlag }) => {
  const [actividades, setActividades] = useState([]); // actividades reales
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [soloMiGrupo, setSoloMiGrupo] = useState(true);

  const mapActividad = (a) => ({
    id: a.id,
    nombre: a.titulo,
    fechaEntrega: a.fecha_limite ? new Date(a.fecha_limite).toISOString().split('T')[0] : '',
    fechaLimite: a.fecha_limite ? new Date(a.fecha_limite).toLocaleString('es-MX', { hour12:false }) : '',
    gruposAsignados: Array.isArray(a.grupos) ? a.grupos : [] // placeholder: campo 'grupos' aún no en actividades? usar luego
  });

  const cargar = async ()=>{
    setLoading(true); setError('');
    try {
  const res = await apiListActividades({ tipo:'actividad', activo:1, limit:200 });
  const data = Array.isArray(res.data?.data) ? res.data.data : [];
  setActividades(data.map(mapActividad));
    } catch(e){ setError(e?.response?.data?.message || 'Error cargando actividades'); }
    finally { setLoading(false); }
  };

  useEffect(()=>{ cargar(); },[]);
  useEffect(()=>{ if(reloadFlag!==undefined) cargar(); },[reloadFlag]);

  // Asignar grupo a actividad (una sola confirmación)
  const asignarGrupo = async (actividadId, grupo) => {
    const confirmar = window.confirm(`¿Desea asignar la actividad al grupo ${grupo}?`);
    if (!confirmar) return;
    const actividad = actividades.find(a=>a.id===actividadId);
    if(!actividad) return;
    const nuevos = [...new Set([ ...actividad.gruposAsignados, grupo ])];
    setActividades(prev=> prev.map(a=> a.id===actividadId ? { ...a, gruposAsignados: nuevos } : a));
  try { await updateActividad(actividadId, { grupos: nuevos }); }
    catch(e){ alert('Error guardando grupos'); cargar(); }
  };

  // Quitar grupo de actividad (doble confirmación)
  const quitarGrupo = async (actividadId, grupo) => {
    const confirmar = window.confirm(`¿Desea quitar la actividad del grupo ${grupo}?`);
    if (!confirmar) return;
    const confirmar2 = window.confirm(`¿Está seguro que desea quitar la actividad del grupo ${grupo}?`);
    if (!confirmar2) return;
    const actividad = actividades.find(a=>a.id===actividadId);
    if(!actividad) return;
    const nuevos = actividad.gruposAsignados.filter(g=> g!==grupo);
    setActividades(prev=> prev.map(a=> a.id===actividadId ? { ...a, gruposAsignados: nuevos } : a));
  try { await updateActividad(actividadId, { grupos: nuevos }); }
    catch(e){ alert('Error guardando grupos'); cargar(); }
  };

  return (
    <div className="overflow-x-auto w-full">
      {loading && <div className="p-2 text-sm text-purple-700">Cargando actividades...</div>}
      {error && <div className="p-2 text-sm text-red-600">{error}</div>}
      <div className="flex items-center justify-end gap-3 mb-2 text-xs sm:text-sm">
        {grupoAsesor && (
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input type="checkbox" checked={soloMiGrupo} onChange={e=> setSoloMiGrupo(e.target.checked)} />
            Mostrar solo actividades de mi grupo
          </label>
        )}
      </div>
      <table className="min-w-[800px] w-full border-collapse rounded-xl overflow-hidden shadow">
        <thead className="bg-purple-600 text-white">
          <tr>
            <th className="py-2 px-4 text-center">Numero de actividad</th>
            <th className="py-2 px-4 text-center">Nombre de la actividad</th>
            <th className="py-2 px-4 text-center">Fecha límite (hora)</th>
            <th className="py-2 px-4 text-center">Grupos asignados</th>
            <th className="py-2 px-4 text-center">Por asignar</th>
          </tr>
        </thead>
        <tbody className="text-center">
           {actividades
             .filter(act => {
                if(!grupoAsesor) return true;
                if(!soloMiGrupo){
                  // Mostrar todas pero resaltaremos si pertenece al grupo
                  return true;
                }
                // Solo mi grupo o sin asignar para poder tomarla
                if(act.gruposAsignados.length === 0) return true;
                return act.gruposAsignados.includes(grupoAsesor);
             })
             .map((act, idx) => {
            // Grupos aún no asignados
             // Base: todos los grupos disponibles globalmente que aún no están asignados
             let gruposPorAsignarBase = ALL_GROUPS.filter(g=> !act.gruposAsignados.includes(g));
             // Si el asesor tiene lista de grupos (multi) limitar a esos
             if(Array.isArray(gruposAsesor) && gruposAsesor.length){
               gruposPorAsignarBase = gruposPorAsignarBase.filter(g=> gruposAsesor.includes(g));
             } else if (grupoAsesor){
               gruposPorAsignarBase = gruposPorAsignarBase.filter(g=> g===grupoAsesor);
             }
             const gruposPorAsignar = gruposPorAsignarBase;
            return (
              <tr
                key={act.id}
                className={`transition hover:bg-purple-50 ${
                  idx % 2 === 0 ? "bg-gray-100" : "bg-white"
           } ${grupoAsesor && act.gruposAsignados.includes(grupoAsesor) ? 'ring-2 ring-purple-300' : ''}`}
              >
                <td className="py-2 px-4">{act.id}</td>
                <td className="py-2 px-4">{act.nombre}</td>
                <td className="py-2 px-4">{act.fechaLimite}</td>
                <td className="py-2 px-4">
                  {act.gruposAsignados.length > 0 ? (
                    <div className="flex flex-wrap gap-1 justify-center">
                      {act.gruposAsignados.map((g) => (
                        <span
                          key={g}
                          className="bg-green-200 text-green-800 px-2 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1"
                        >
                          {g}
                          {((!grupoAsesor && !gruposAsesor.length) || g===grupoAsesor || gruposAsesor.includes(g)) && (
                            <button
                              className="ml-1 text-red-600 hover:text-red-900 font-bold cursor-pointer"
                              title={`Quitar grupo ${g}`}
                              onClick={() => quitarGrupo(act.id, g)}
                            >
                              ×
                            </button>
                          )}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-400 text-xs">Ninguno</span>
                  )}
                </td>
                <td className="py-2 px-4">
                  <div className="flex flex-wrap gap-1 justify-center">
                     {gruposPorAsignar.length > 0 ? (
                      gruposPorAsignar.map((g) => (
                        <button
                          key={g}
                          className="bg-purple-200 hover:bg-purple-400 text-purple-900 px-2 py-0.5 rounded-full text-xs font-semibold transition cursor-pointer"
                          onClick={() => asignarGrupo(act.id, g)}
                        >
                          {g}
                        </button>
                      ))
                    ) : (
                      <span className="text-gray-400 text-xs">Todos asignados</span>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
          {!loading && !actividades.length && (
            <tr><td colSpan={5} className="py-6 text-sm text-gray-500">Sin actividades</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

  const estudiantesQuiztEjemplo = [
  {
    folio: "A001",
    nombre: "Juan Pérez",
    entregado: true,
    Contestado: true,
    fechaLimite: "2025-07-15T18:00:00",
    archivoUrl: "#",
    calificacion: 100,
  },
  {
    folio: "A002",
    nombre: "María García",
    entregado: false,
    Contestado: false,
    fechaLimite: "2025-07-15T18:00:00",
    archivoUrl: "#",
    calificacion: 82.5,
  },
  {
    folio: "A003",
    nombre: "Carlos Díaz",
    entregado: true,
    Contestado: true,
    fechaLimite: "2025-07-10T18:00:00",
    archivoUrl: "#",
    calificacion: 70,
  },
];


export const TablaAsignacionQuizt = () => {
  const [quizt, setQuizt] = useState(estudiantesQuiztEjemplo);

  return (
    <div className="overflow-x-auto w-full">
      <table className="min-w-[800px] w-full border-collapse rounded-xl overflow-hidden shadow">
        <thead className="bg-purple-600 text-white">
          <tr>
            <th className="py-2 px-4 text-center">Numero de folio</th>
            <th className="py-2 px-4 text-center">Nombre del alumno</th>
            <th className="py-2 px-4 text-center">Realizado</th>
            <th className="py-2 px-4 text-center">Calificación</th>
          </tr>
        </thead>
        <tbody className="text-center">
          {quizt.map((q, idx) => (
            <tr
              key={q.folio}
              className={`transition hover:bg-purple-50 ${
                idx % 2 === 0 ? "bg-gray-100" : "bg-white"
              }`}
            >
              <td className="py-2 px-4">{q.folio}</td>
              <td className="py-2 px-4">{q.nombre}</td>
              <td className="py-2 px-4">
                {q.Contestado ? (
                  <span className="text-green-600 font-semibold">Sí</span>
                ) : (
                  <span className="text-red-600 font-semibold">No</span>
                )}
              </td>
              <td className={`py-2 px-4 ${q.calificacion > 70 ? "text-green-500":"text-yellow-500"}`}>
              {q.calificacion}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};


const estudiantesEjemplo = [
  {
    folio: "A001",
    nombre: "Juan Pérez",
    entregado: true,
    fechaLimite: "2025-07-15T18:00:00",
    archivoUrl: "#",
    calificacion: null,
  },
  {
    folio: "A002",
    nombre: "María García",
    entregado: false,
    fechaLimite: "2025-07-15T18:00:00",
    archivoUrl: "#",
    calificacion: null,
  },
  {
    folio: "A003",
    nombre: "Carlos Díaz",
    entregado: true,
    fechaLimite: "2025-07-10T18:00:00",
    archivoUrl: "#",
    calificacion: null,
  },
];

// Función para determinar el estado de entrega
function getEstadoEntrega(estudiante) {
  if (estudiante.entregado) {
    return { texto: "Sí", color: "text-green-600 bg-green-100" };
  }
  const ahora = new Date();
  const fechaLimite = new Date(estudiante.fechaLimite);
  if (ahora <= fechaLimite) {
    return { texto: "Pendiente", color: "text-gray-600 bg-gray-100" };
  }
  return { texto: "No", color: "text-red-600 bg-red-100" };
}

// Función para determinar el color de la calificación
function getColorCalificacion(calificacion) {
  if (calificacion >= 8) return "bg-green-200 text-green-800";
  if (calificacion >= 6) return "bg-yellow-200 text-yellow-800";
  return "bg-red-200 text-red-800";
}

const ModalCalificacion = ({ open, onClose, onConfirm, calificacionInicial }) => {
  const [calificacion, setCalificacion] = useState("");

  // Resetear calificacion cada vez que el modal se abre
  useEffect(() => {
    if (open) {
      setCalificacion("");
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-lg p-6 min-w-[300px] flex flex-col gap-4">
        <h2 className="text-lg font-bold text-purple-700 mb-2">
          {calificacionInicial !== null && calificacionInicial !== undefined
            ? "Editar calificación"
            : "Asignar calificación"}
        </h2>
        <select
          className="border rounded p-2 text-lg"
          value={calificacion}
          onChange={(e) => setCalificacion(Number(e.target.value))}
        >
          <option disabled value="">Selecciona una calificación</option>
          {[...Array(11).keys()].map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
        <div className="flex gap-2 justify-end">
          <button
            className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-gray-700"
            onClick={onClose}
          >
            Cancelar
          </button>
          <button
            className="px-3 py-1 rounded bg-green-500 hover:bg-green-600 text-white font-semibold"
            onClick={() => {
              if (calificacion === "" || isNaN(calificacion)) return;
              onConfirm(calificacion);
            }}
            disabled={calificacion === "" || isNaN(calificacion)}
          >
            {calificacionInicial !== null && calificacionInicial !== undefined
              ? "Actualizar"
              : "Confirmar"}
          </button>
        </div>
      </div>
    </div>
  );
};

export const TablaEstudiantes = ({ grupoAsesor, gruposAsesor = [] }) => {
  const [estudiantes, setEstudiantes] = useState([]);
  const [loading,setLoading] = useState(false);
  const [error,setError] = useState('');
  const [actividades, setActividades] = useState([]);
  const [selectedActividadId, setSelectedActividadId] = useState('');
  // Filtro por grupo
  const [availableGroups, setAvailableGroups] = useState([]); // grupos detectados del asesor
  const [selectedGroup, setSelectedGroup] = useState('ALL');
  const [submissionsMap, setSubmissionsMap] = useState({});
  const [filesModal, setFilesModal] = useState({ open:false, archivos:[], estudiante:null });
  const [loadingSubs, setLoadingSubs] = useState(false);
  // Cargar desde backend
  useEffect(()=> {
    let cancel=false;
    const load = async () => {
      setLoading(true); setError('');
      try {
        const api = await import('../api/asesores.js');
        const res = await api.getMisEstudiantes();
        if(cancel) return;
        const list = Array.isArray(res.data?.data)? res.data.data: [];
        // Mapear a estructura local (faltan flags entregado/calificacion: placeholder)
        const mapped = list.map(e=> ({
          id_estudiante: e.id,
          folio: e.folio_formateado || e.folio,
          nombre: `${e.nombres || ''} ${e.apellidos || ''}`.trim(),
          grupo: e.grupo || e.grupo_asignado || '',
          entregado: false,
          fechaLimite: new Date().toISOString(),
          archivoUrl: '#',
          calificacion: null
        }));
        setEstudiantes(mapped);
        // Derivar grupos (prioridad a gruposAsesor prop si viene)
        let gruposDetectados = gruposAsesor.length ? gruposAsesor : Array.from(new Set(mapped.map(m=> m.grupo).filter(Boolean)));
        if (grupoAsesor && !gruposDetectados.includes(grupoAsesor)) gruposDetectados.unshift(grupoAsesor);
        setAvailableGroups(gruposDetectados);
      } catch(err){ if(!cancel){ setError('No se pudieron cargar estudiantes'); } }
      finally { if(!cancel) setLoading(false); }
    };
    load();
    return ()=> { cancel=true; };
  },[grupoAsesor]);
  const [modal, setModal] = useState({
    open: false,
    folio: null,
    calificacionInicial: null,
  });

  // Cargar actividades (tipo actividad)
  useEffect(()=> { (async()=>{ try {
    const res = await apiListActividades({ tipo:'actividad', activo:1, limit:200 });
    const data = Array.isArray(res.data?.data) ? res.data.data : [];
    setActividades(data);
  } catch(e){ /* ignore */ } })(); },[]);

  // Cargar entregas al cambiar actividad
  useEffect(()=> {
    const loadEntregas = async ()=> {
      if(!selectedActividadId){ setSubmissionsMap({});
        setEstudiantes(prev=> prev.map(e=> ({ ...e, entregado:false, archivoUrl:'#', calificacion:null })));
        return; }
      setLoadingSubs(true);
      try {
        const res = await apiListEntregasActividad(selectedActividadId);
        const entregas = Array.isArray(res.data?.data) ? res.data.data : [];
  const map = {}; entregas.forEach(en => { map[en.id_estudiante] = en; }); // No change
        setSubmissionsMap(map);
        setEstudiantes(prev=> prev.map(e=> {
          const ent = map[e.id_estudiante];
            if(!ent) return { ...e, entregado:false, archivoUrl:'#', calificacion:null };
            return { ...e, entregado:true, archivoUrl: ent.archivo, calificacion: ent.calificacion, archivos: ent.archivos || [] };
        }));
      } catch(e){ console.error(e); }
      finally { setLoadingSubs(false); }
    };
    loadEntregas();
  },[selectedActividadId]);

  const handleAsignar = (folio) => {
    setModal({ open: true, folio, calificacionInicial: null });
  };

  const handleEditar = (folio, calificacion) => {
    setModal({ open: true, folio, calificacionInicial: calificacion });
  };

  const handleConfirm = async (calificacion) => {
    try {
      const est = estudiantes.find(e=> e.folio===modal.folio);
      if(!est) return;
  const entrega = submissionsMap[est.id_estudiante];
  if(!entrega){ alert('Sin entrega para calificar'); return; }
  await apiCalificarEntrega(entrega.id, { calificacion });
  setSubmissionsMap(prev => ({ ...prev, [est.id_estudiante]: { ...entrega, calificacion } }));
  setEstudiantes(prev=> prev.map(e=> e.folio===modal.folio ? { ...e, calificacion } : e));
    } catch(e){ alert('Error guardando calificación'); }
    setModal({ open: false, folio: null, calificacionInicial: null });
  };

  const handleClose = () => {
    setModal({ open: false, folio: null, calificacionInicial: null });
  };

  // Filtrar por grupo antes de renderizar
  const estudiantesFiltrados = selectedGroup==='ALL' ? estudiantes : estudiantes.filter(e=> e.grupo === selectedGroup);

  return (
    <div className="overflow-x-auto w-full">
      <div className="flex flex-col gap-3 mb-4">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-semibold text-gray-700">Grupo:</span>
            <select className="border rounded px-2 py-1" value={selectedGroup} onChange={e=> setSelectedGroup(e.target.value)}>
              <option value="ALL">Todos</option>
              {availableGroups.map(g=> <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="font-semibold text-gray-700">Actividad:</span>
            <select className="border rounded px-2 py-1" value={selectedActividadId} onChange={e=> setSelectedActividadId(e.target.value)}>
              <option value="">-- Opcional --</option>
              {actividades.map(a=> <option key={a.id} value={a.id}>{a.titulo}</option>)}
            </select>
          </div>
          {loadingSubs && <span className="text-xs text-purple-600">Cargando entregas...</span>}
        </div>
      </div>
      <ModalCalificacion
        open={modal.open}
        onClose={handleClose}
        onConfirm={handleConfirm}
        calificacionInicial={modal.calificacionInicial}
      />
  {loading && <div className="p-2 text-purple-700 text-sm">Cargando estudiantes...</div>}
  {error && <div className="p-2 text-red-600 text-sm">{error}</div>}
  <table className="min-w-[700px] w-full border-collapse rounded-xl overflow-hidden shadow">
        <thead className="bg-purple-600 text-white">
          <tr>
            <th className="py-2 px-4 text-center">Numero de folio</th>
            <th className="py-2 px-4 text-center">Nombre del estudiante</th>
            <th className="py-2 px-4 text-center">Entregado</th>
            <th className="py-2 px-4 text-center">Asignar calificación</th>
            <th className="py-2 px-4 text-center">Visualizar tarea</th>
          </tr>
        </thead>
        <tbody className="text-center">
          {estudiantesFiltrados.map((est, idx) => {
            const estado = getEstadoEntrega(est);
            return (
              <tr
                key={est.folio}
                className={`transition hover:bg-purple-50 ${
                  idx % 2 === 0 ? "bg-gray-100" : "bg-white"
                }`}
              >
                <td className="py-2 px-4">{est.folio}</td>
                <td className="py-2 px-4">{est.nombre}</td>
                <td className="py-2 px-4">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${estado.color}`}>
                    {estado.texto}
                  </span>
                </td>
                <td className="py-2 px-4">
                  {est.calificacion === null ? (
                    <button
                      className="bg-blue-500 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs font-semibold transition"
                      disabled={!est.entregado}
                      onClick={() => handleAsignar(est.folio)}
                    >
                      Asignar calificación
                    </button>
                  ) : (
                    <div className="relative group inline-block">
                      <span
                        className={`px-3 py-1 rounded text-xs font-semibold cursor-default select-none ${getColorCalificacion(est.calificacion)}`}
                      >
                        {est.calificacion}
                      </span>
                      <button
                        className="absolute top-1/2 -translate-y-1/2 right-0 translate-x-full opacity-0 group-hover:opacity-100 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 px-2 py-1 rounded text-xs font-semibold ml-2 transition"
                        style={{ pointerEvents: "auto" }}
                        onClick={() => handleEditar(est.folio, est.calificacion)}
                      >
                        Editar
                      </button>
                    </div>
                  )}
                </td>
                <td className="flex py-2 px-4 justify-center gap-x-3">
                  <button
                    title="Ver archivos"
                    disabled={!est.entregado}
                    onClick={() => {
                      if(!est.entregado) return;
                      const archivos = (est.archivos && est.archivos.length)
                        ? est.archivos
                        : (est.archivoUrl && est.archivoUrl !== '#'
                          ? [{ archivo: est.archivoUrl, original_nombre: est.archivoUrl.split('/').pop() }]
                          : []);
                      console.log('Abrir modal archivos', { estudiante: est.folio, archivos });
                      setFilesModal({ open:true, archivos, estudiante: est });
                    }}
                    className={`bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded text-xs font-semibold transition inline-flex items-center justify-center ${!est.entregado ? 'opacity-50 pointer-events-none':''}`}
                  >Ver</button>
                </td>
              </tr>
            );
          })}
          {!loading && !estudiantesFiltrados.length && (
            <tr><td colSpan={5} className="py-6 text-sm text-gray-500">Sin estudiantes aprobados en tu grupo</td></tr>
          )}
        </tbody>
      </table>
      {filesModal.open && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between px-5 py-3 border-b">
              <h3 className="text-sm sm:text-base font-semibold text-purple-700">Archivos de {filesModal.estudiante?.nombre || 'estudiante'}</h3>
              <button
                onClick={() => setFilesModal({ open:false, archivos:[], estudiante:null })}
                className="p-1 rounded hover:bg-purple-100 text-purple-600"
                title="Cerrar"
              ><X size={18} /></button>
            </div>
            <div className="p-4 overflow-y-auto space-y-3">
              {(!filesModal.archivos || !filesModal.archivos.length) && (
                <div className="text-sm text-gray-500">No hay archivos para esta entrega.</div>
              )}
              {filesModal.archivos && filesModal.archivos.map((f,idx)=> {
                const url = f.archivo || f.url || '';
                const displayName = f.original_nombre || f.nombre_original || url.split('/').pop() || `Archivo ${idx+1}`;
                const absoluteUrl = /^https?:/i.test(url) ? url : `${window.location.origin}${url.startsWith('/')? '': '/'}${url}`;
                return (
                  <div key={idx} className="flex items-center gap-3 border rounded-md p-3 group bg-gray-50 hover:bg-gray-100 transition">
                    <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded bg-purple-200 text-purple-700 font-semibold text-xs">PDF</div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-sm font-medium text-gray-800 truncate" title={displayName}>{displayName}</span>
                      {f.created_at && <span className="text-[10px] text-gray-500">{new Date(f.created_at).toLocaleString()}</span>}
                    </div>
                    <div className="flex items-center gap-2">
                      <a href={absoluteUrl} target="_blank" rel="noopener noreferrer" className="px-2 py-1 text-xs rounded bg-green-600 hover:bg-green-700 text-white font-semibold" title="Abrir">Ver</a>
                      <a href={absoluteUrl} download={displayName} className="px-2 py-1 text-xs rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold" title="Descargar">Descargar</a>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="px-5 py-3 border-t flex justify-end">
              <button onClick={() => setFilesModal({ open:false, archivos:[], estudiante:null })} className="px-4 py-1.5 rounded bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold">Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


const quiztEjemplo = [
  {
    id: 1,
    nombre: "Quizt de Álgebra",
    fechaLimite: "2025-07-15",
    horaLimite: "18:00",
    gruposAsignados: ["M1", "V2"],
  },
  {
    id: 2,
    nombre: "Quizt de Física",
    fechaLimite: "2025-07-20",
    horaLimite: "20:00",
    gruposAsignados: ["M2", "M3", "V1"],
  },
  {
    id: 3,
    nombre: "Quizt de Historia",
    fechaLimite: "2025-07-22",
    horaLimite: "17:00",
    gruposAsignados: [],
  },
];

export const TablaQuizt = () => {

  
  const [quizts, setQuizts] = useState(quiztEjemplo);

  // Asignar grupo a quizt
  const asignarGrupo = (quiztId, grupo) => {
    const confirmar = window.confirm(`¿Desea asignar el quizt al grupo ${grupo}?`);
    if (!confirmar) return;
    setQuizts((prev) =>
      prev.map((q) =>
        q.id === quiztId
          ? { ...q, gruposAsignados: [...q.gruposAsignados, grupo] }
          : q
      )
    );
  };

  // Quitar grupo de quizt
  const quitarGrupo = (quiztId, grupo) => {
    const confirmar = window.confirm(`¿Desea quitar el quizt del grupo ${grupo}?`);
    if (!confirmar) return;
    const confirmar2 = window.confirm(`¿Está seguro que desea quitar el quizt del grupo ${grupo}?`);
    if (!confirmar2) return;
    setQuizts((prev) =>
      prev.map((q) =>
        q.id === quiztId
          ? { ...q, gruposAsignados: q.gruposAsignados.filter((g) => g !== grupo) }
          : q
      )
    );
  };

  // Editar quizt (solo ejemplo)
  const editarQuizt = (quiztId) => {
    alert(`Editar quizt con ID: ${quiztId}`);
  };

  // Eliminar quizt (solo ejemplo)
  const eliminarQuizt = (quiztId) => {
    const confirmar = window.confirm("¿Desea eliminar este quizt?");
    if (!confirmar) return;
    setQuizts((prev) => prev.filter((q) => q.id !== quiztId));
  };

  return (
    <div className="overflow-x-auto w-full">
      <table className="min-w-[900px] w-full border-collapse rounded-xl overflow-hidden shadow">
        <thead className="bg-purple-600 text-white">
          <tr>
            <th className="py-2 px-4 text-center">Numero de quizt</th>
            <th className="py-2 px-4 text-center">Nombre de quizt</th>
            <th className="py-2 px-4 text-center">Fecha límite</th>
            <th className="py-2 px-4 text-center">Hora límite de entrega</th>
            <th className="py-2 px-4 text-center">Grupo(s) asignado(s)</th>
            <th className="py-2 px-4 text-center">Por asignar</th>
            <th className="py-2 px-4 text-center">Acciones</th>
          </tr>
        </thead>
        <tbody className="text-center">
          {quizts.map((q, idx) => {
            const gruposPorAsignar = ALL_GROUPS.filter(
              (g) => !q.gruposAsignados.includes(g)
            );
            return (
              <tr
                key={q.id}
                className={`transition hover:bg-purple-50 ${
                  idx % 2 === 0 ? "bg-gray-100" : "bg-white"
                }`}
              >
                <td className="py-2 px-4">{q.id}</td>
                <td className="py-2 px-4">{q.nombre}</td>
                <td className="py-2 px-4">{q.fechaLimite}</td>
                <td className="py-2 px-4">{q.horaLimite}</td>
                <td className="py-2 px-4">
                  {q.gruposAsignados.length > 0 ? (
                    <div className="flex flex-wrap gap-1 justify-center">
                      {q.gruposAsignados.map((g) => (
                        <span
                          key={g}
                          className="bg-green-200 text-green-800 px-2 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1"
                        >
                          {g}
                          <button
                            className="ml-1 text-red-600 hover:text-red-900 font-bold cursor-pointer"
                            title={`Quitar grupo ${g}`}
                            onClick={() => quitarGrupo(q.id, g)}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-400 text-xs">Ninguno</span>
                  )}
                </td>
                <td className="py-2 px-4">
                  <div className="flex flex-wrap gap-1 justify-center">
                    {gruposPorAsignar.length > 0 ? (
                      gruposPorAsignar.map((g) => (
                        <button
                          key={g}
                          className="bg-purple-200 hover:bg-purple-400 text-purple-900 px-2 py-0.5 rounded-full text-xs font-semibold transition cursor-pointer"
                          onClick={() => asignarGrupo(q.id, g)}
                        >
                          {g}
                        </button>
                      ))
                    ) : (
                      <span className="text-gray-400 text-xs">Todos asignados</span>
                    )}
                  </div>
                </td>
                <td className="py-2 px-4">
                  <div className="flex gap-2 justify-center">
                    <button
                      className="bg-yellow-400 hover:bg-yellow-500 text-yellow-900 px-3 py-1 rounded text-xs font-semibold transition"
                      onClick={() => editarQuizt(q.id)}
                    >
                      Editar
                    </button>
                    <button
                      className="bg-red-500 hover:bg-red-700 text-white px-3 py-1 rounded text-xs font-semibold transition"
                      onClick={() => eliminarQuizt(q.id)}
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};



export default TestComp;