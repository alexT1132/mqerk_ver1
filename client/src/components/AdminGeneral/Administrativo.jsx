import { useMemo, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  AreaChart,
  Area,
  Legend,
} from 'recharts';

const COLORS = ['#7c3aed', '#06b6d4', '#f97316', '#ef4444', '#10b981'];
const MONTHS = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

// --- Mock data ---
const initialCourses = [
  { id: 'C-001', title: 'Física I', active: true, groups: [ { id: 'C001-G1', name: 'Física I - Grupo A', studentsCount: 12, month: 9, year: 2025 }, { id: 'C001-G2', name: 'Física I - Grupo B', studentsCount: 8, month: 6, year: 2025 } ] },
  { id: 'C-002', title: 'Química Básica', active: true, groups: [ { id: 'C002-G1', name: 'Química - Matutino', studentsCount: 10, month: 3, year: 2025 } ] },
  { id: 'C-003', title: 'Matemáticas', active: false, groups: [] },
];

const advisors = {
  'C-001': { id: 'A-01', name: 'Dr. Jorge López', email: 'jorge@mqerk.edu', phone: '+52 55 1234 5678', bio: 'Doctor en Física Educativa. Experto en pedagogías activas.' },
  'C-002': { id: 'A-02', name: 'Mtra. Laura Ruiz', email: 'laura@mqerk.edu', phone: '+52 55 9876 5432', bio: 'Química aplicada y diseño curricular.' },
  'C-003': { id: 'A-03', name: 'Ing. Pedro Gómez', email: 'pedro@mqerk.edu', phone: '+52 33 4455 7788', bio: 'Matemáticas y análisis de datos educativos.' },
};

// Detailed students per group (mock). In a real app this comes from your API.
const studentsByGroup = {
  'C001-G1': [
    { id: 'S-101', name: 'Ana Pérez', avg: 8.5, attendance: 92, needsAttention: false, lastActivity: '2025-09-10', grades: [7,8,9,9.5] },
    { id: 'S-102', name: 'Carlos Ruiz', avg: 6.2, attendance: 70, needsAttention: true, lastActivity: '2025-09-04', grades: [6,5.5,6.8,6.3] },
  ],
  'C001-G2': [
    { id: 'S-201', name: 'María Gómez', avg: 9.1, attendance: 98, needsAttention: false, lastActivity: '2025-09-11', grades: [9,9.2,9.0,9.2] },
  ],
  'C002-G1': [
    { id: 'S-301', name: 'Luis Hernández', avg: 7.6, attendance: 85, needsAttention: false, lastActivity: '2025-09-09', grades: [7,7.5,8,7.9] },
  ]
};

const initialManualStudents = [
  { id: 'S-100', name: 'Registro Manual - Ana Perez', courseId: 'C-001', groupId: 'C001-G1', date: '2025-09-05', sale: 1200 },
];

export default function AdminDashboard() {
  const [courses, setCourses] = useState(initialCourses);
  const [manualRegs, setManualRegs] = useState(initialManualStudents);
  const [kpIs, setKpIs] = useState({ users: 200, assets: 250000, operationalExpenses: 145000, institutionalDocs: 58 });
  const [filters, setFilters] = useState({ year: 2025, month: 'Todos' });
  const [role, setRole] = useState('admin'); // 'admin' or 'secondary'

  // selection states for viewing (administration only)
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupModalOpen, setGroupModalOpen] = useState(false);

  // computed KPIs
  const totalCourses = courses.length;
  const activeCourses = courses.filter(c => c.active).length;
  const totalStudents = useMemo(() => {
    const fromGroups = courses.reduce((acc, c) => acc + c.groups.reduce((s, g) => s + (g.studentsCount||0), 0), 0);
    return fromGroups + manualRegs.length;
  }, [courses, manualRegs]);

  // students per month (for the students chart)
  function buildStudentsPerMonth(yearFilter=filters.year) {
    const months = Array.from({ length: 12 }).map((_, i) => ({ month: MONTHS[i], students: 0 }));
    courses.forEach(c => c.groups.forEach(g => { if ((g.year||yearFilter) === yearFilter) months[(g.month||1)-1].students += (g.studentsCount || 0); }));
    manualRegs.forEach(s => { const d = new Date(s.date); if (d.getFullYear() === yearFilter) months[d.getMonth()].students += 1; });
    return months;
  }
  const studentsPerMonth = buildStudentsPerMonth();

  // course frequency (number of groups per course)
  const courseFrequency = courses.map(c => ({ name: c.title, groups: c.groups.length }));

  // break-even mock (same logic as before)
  const breakEvenData = useMemo(() => {
    const baseRevenuePerStudent = 1200;
    const costsMonthly = 40000;
    const arr = Array.from({length:12}).map((_, idx) => {
      const groupsStudents = courses.reduce((acc, c) => acc + c.groups.reduce((s,g) => (g.month-1===idx && g.year===filters.year) ? s+g.studentsCount : s, 0), 0);
      const manualStudents = manualRegs.filter(s => new Date(s.date).getMonth() === idx && new Date(s.date).getFullYear()===filters.year).length;
      const revenue = (groupsStudents + manualStudents) * baseRevenuePerStudent;
      return { month: MONTHS[idx], revenue, cost: costsMonthly };
    });
    let cumRevenue=0, cumCost=0;
    return arr.map(a => { cumRevenue+=a.revenue; cumCost+=a.cost; return { month: a.month, revenue: cumRevenue, cost: cumCost, diff: cumRevenue - cumCost } });
  }, [courses, manualRegs, filters.year]);

  // CRUD-lite handlers (admins cannot create groups here)
  function addCourse(course) {
    setCourses(prev => [...prev, { ...course, id: `C-${String(prev.length+1).padStart(3,'0')}` }]);
  }

  function toggleCourseActive(id) {
    setCourses(prev => prev.map(c => c.id===id ? { ...c, active: !c.active } : c));
  }

  function registerStudentManual({ name, courseId, groupId, date, sale }) {
    const newReg = { id: `S-${1000 + manualRegs.length + 1}`, name, courseId, groupId, date, sale };
    setManualRegs(prev => [...prev, newReg]);
    setKpIs(prev => ({ ...prev, users: prev.users + 1 }));
  }

  // UI local form state
  const [form, setForm] = useState({ title: '', active: true });
  const [studentForm, setStudentForm] = useState({ name: '', courseId: 'C-001', groupId: 'C001-G1', date: new Date().toISOString().slice(0,10), sale: 1200 });

  // Open course panel
  function openCoursePanel(course) {
    setSelectedCourse(course);
    setSelectedGroup(null);
  }

  // Open group modal -> show advisor + students
  function openGroupModal(group) {
    setSelectedGroup(group);
    setGroupModalOpen(true);
  }

  // convenience: get students for selected group
  const currentGroupStudents = (selectedGroup && studentsByGroup[selectedGroup.id]) || [];
  const currentAdvisor = (selectedCourse && advisors[selectedCourse.id]) || null;

  // KPI cards for quick binding to homepage cards
  const kpiCards = [
    { label: 'Cursos totales', value: totalCourses },
    { label: 'Cursos activos', value: activeCourses },
    { label: 'Alumnos totales', value: totalStudents },
    { label: 'Usuarios (sistema)', value: kpIs.users },
  ];

  return (
    <div className="min-h-screen text-slate-800">

      <div className="p-6 max-w-7xl mx-auto">
        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {kpiCards.map(k => (
            <div key={k.label} className="bg-white p-4 rounded-2xl shadow-sm">
              <div className="text-xs text-slate-500">{k.label}</div>
              <div className="text-2xl font-extrabold mt-2">{k.value}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column: charts */}
          <div className="col-span-2 space-y-6">
            <div className="bg-white p-4 rounded-2xl shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold">Frecuencia de cursos (grupos por curso)</h3>
                <div className="text-sm text-slate-500">Ver: mensual / anual</div>
              </div>
              <div style={{ height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={courseFrequency}>
                    <XAxis dataKey="name" tickFormatter={(t)=> t.length>12? t.slice(0,12)+'...':t} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="groups">
                      {courseFrequency.map((_, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold">Alumnos por mes</h3>
                <div className="flex items-center gap-2">
                  <select value={filters.year} onChange={e=>setFilters(f=>({...f, year: Number(e.target.value)}))} className="rounded px-2 py-1 text-slate-700">
                    <option>2025</option>
                    <option>2024</option>
                    <option>2023</option>
                  </select>
                </div>
              </div>
              <div style={{ height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={studentsPerMonth}>
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="students" stroke="#7c3aed" strokeWidth={3} dot />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold">Punto de equilibrio (cumulativo)</h3>
                <div className="text-sm text-slate-500">Ingreso acumulado vs Costos</div>
              </div>
              <div style={{ height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={breakEvenData}>
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="revenue" name="Ingreso (acum)" stroke="#06b6d4" fillOpacity={0.2} />
                    <Area type="monotone" dataKey="cost" name="Costos (acum)" stroke="#ef4444" fillOpacity={0.12} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Right column: admin controls & tables */}
          <div className="space-y-6">
            <div className="bg-white p-4 rounded-2xl shadow-sm">
              <h3 className="font-semibold mb-3">Registrar curso</h3>
              <div className="space-y-2">
                <input placeholder="Título del curso" value={form.title} onChange={e=>setForm(f=>({...f, title: e.target.value}))} className="w-full px-3 py-2 rounded border" />
                <div className="flex gap-2">
                  <button onClick={()=>{ if(!form.title) return alert('Agrega título'); addCourse({ title: form.title, active: form.active, groups: [] }); setForm(f=>({ ...f, title: '' })); }} className="px-3 py-2 rounded bg-violet-600 text-white">Agregar curso</button>
                </div>
                <div className="text-xs text-slate-500 mt-2">Nota: La creación de <strong>grupos</strong> no está disponible desde esta sección. Los grupos se registran automáticamente desde la web o por procesos autorizados.</div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl shadow-sm">
              <h3 className="font-semibold mb-3">Registrar alumno (manual)</h3>
              <div className="space-y-2 text-sm">
                <input placeholder="Nombre" value={studentForm.name} onChange={e=>setStudentForm(s=>({...s, name: e.target.value}))} className="w-full px-3 py-2 rounded border" />
                <select value={studentForm.courseId} onChange={e=>setStudentForm(s=>({...s, courseId: e.target.value}))} className="w-full rounded px-2 py-1">
                  {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
                <div className="flex gap-2">
                  <input placeholder="Grupo (id)" value={studentForm.groupId} onChange={e=>setStudentForm(s=>({...s, groupId: e.target.value}))} className="w-1/2 px-2 py-1 rounded border" />
                  <input type="date" value={studentForm.date} onChange={e=>setStudentForm(s=>({...s, date: e.target.value}))} className="w-1/2 px-2 py-1 rounded border" />
                </div>
                <div className="flex gap-2">
                  <input type="number" value={studentForm.sale} onChange={e=>setStudentForm(s=>({...s, sale: Number(e.target.value)}))} className="w-full px-2 py-1 rounded border" />
                </div>
                <div className="flex gap-2">
                  <button onClick={()=>{ if(role !== 'secondary' && role !== 'admin') return alert('Sin permisos'); registerStudentManual(studentForm); setStudentForm({ name: '', courseId: studentForm.courseId, groupId: studentForm.groupId, date: new Date().toISOString().slice(0,10), sale: 1200 }) }} className="px-3 py-2 rounded bg-indigo-600 text-white">Registrar alumno</button>
                </div>
                <div className="text-xs text-slate-500 mt-2">Los registros manuales actualizan las métricas, pero los grupos no se crean aquí.</div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl shadow-sm">
              <h3 className="font-semibold mb-3">Tabla de cursos</h3>
              <div className="overflow-auto max-h-56">
                <table className="w-full text-sm">
                  <thead className="text-left border-b"><tr><th>Id</th><th>Título</th><th>Grupos</th><th>Activo</th><th>Acción</th></tr></thead>
                  <tbody>
                    {courses.map(c => (
                      <tr key={c.id} className="border-b hover:bg-slate-50">
                        <td className="py-2">{c.id}</td>
                        <td>{c.title}</td>
                        <td>{c.groups.length}</td>
                        <td>{c.active ? 'Sí' : 'No'}</td>
                        <td className="flex gap-2">
                          <button onClick={()=>toggleCourseActive(c.id)} className="px-2 py-1 rounded bg-slate-100">Toggle</button>
                          <button onClick={()=>openCoursePanel(c)} className="px-2 py-1 rounded bg-indigo-600 text-white">Ver grupos</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>

        {/* Course panel: shows selected course and its groups */}
        {selectedCourse && (
          <div className="mt-8 bg-white p-4 rounded-2xl shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-semibold">{selectedCourse.title} — Grupos</h3>
                <div className="text-sm text-slate-500">Asesor: {advisors[selectedCourse.id]?.name || 'N/D'}</div>
              </div>
              <div className="flex gap-2">
                <button onClick={()=>{ setSelectedCourse(null); setSelectedGroup(null); }} className="px-3 py-1 rounded bg-slate-200">Cerrar</button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {selectedCourse.groups.length === 0 && <div className="p-4 border rounded col-span-3 text-slate-500">No hay grupos registrados para este curso.</div>}

              {selectedCourse.groups.map(g => (
                <div key={g.id} className="p-4 border rounded">
                  <div className="font-semibold">{g.name}</div>
                  <div className="text-sm text-slate-500">Alumnos: {g.studentsCount} • Mes: {MONTHS[(g.month||1)-1]} {g.year}</div>
                  <div className="mt-3 flex gap-2">
                    <button onClick={()=>openGroupModal(g)} className="px-2 py-1 rounded bg-violet-600 text-white text-sm">Ver detalle</button>
                    <button onClick={()=>alert('Ir al reporte del grupo (mock)')} className="px-2 py-1 rounded bg-slate-100 text-sm">Reporte</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Group modal: advisor + students table + performance */}
        {groupModalOpen && selectedGroup && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white w-11/12 md:w-3/4 rounded-2xl p-6 shadow-2xl max-h-[85vh] overflow-auto">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-semibold">{selectedGroup.name}</h3>
                  <div className="text-sm text-slate-500">Curso: {selectedCourse.title} • Grupo id: {selectedGroup.id}</div>
                </div>
                <div className="flex gap-2">
                  <button onClick={()=>{ setGroupModalOpen(false); setSelectedGroup(null); }} className="px-3 py-1 rounded bg-slate-200">Cerrar</button>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded">
                  <div className="text-xs text-slate-500">Asesor</div>
                  <div className="font-semibold mt-2">{currentAdvisor?.name || 'N/D'}</div>
                  <div className="text-sm text-slate-500">{currentAdvisor?.email}</div>
                  <div className="text-sm text-slate-500">{currentAdvisor?.phone}</div>
                  <div className="text-xs mt-2">{currentAdvisor?.bio}</div>
                </div>

                <div className="p-4 border rounded col-span-2">
                  <div className="flex justify-between items-center">
                    <div className="text-xs text-slate-500">Alumnos del grupo</div>
                    <div className="text-sm text-slate-500">Total: {currentGroupStudents.length}</div>
                  </div>

                  <div className="overflow-auto mt-3 max-h-56">
                    <table className="w-full text-sm">
                      <thead className="text-left border-b"><tr><th>Id</th><th>Nombre</th><th>Avg</th><th>Asis.</th><th>Atención</th><th>Últ. act.</th><th>Acción</th></tr></thead>
                      <tbody>
                        {currentGroupStudents.map(s => (
                          <tr key={s.id} className="border-b hover:bg-slate-50">
                            <td className="py-2">{s.id}</td>
                            <td>{s.name}</td>
                            <td>{s.avg}</td>
                            <td>{s.attendance}%</td>
                            <td>{s.needsAttention ? <span className="text-xs px-2 py-1 rounded bg-amber-100 text-amber-800">Revisar</span> : <span className="text-xs px-2 py-1 rounded bg-emerald-100 text-emerald-800">OK</span>}</td>
                            <td>{s.lastActivity}</td>
                            <td>
                              <button onClick={()=>alert('Ver rendimiento: abrir detalle del estudiante (mock)')} className="px-2 py-1 rounded bg-indigo-600 text-white text-xs">Ver rendimiento</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                </div>
              </div>

              {/* small performance chart for the first student as example */}
              {currentGroupStudents.length > 0 && (
                <div className="mt-6 p-4 border rounded">
                  <div className="text-sm text-slate-500">Ejemplo de rendimiento (últimas evaluaciones) — {currentGroupStudents[0].name}</div>
                  <div style={{ height: 160 }} className="mt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={currentGroupStudents[0].grades.map((g,i)=>({x: i+1, grade: g}))}>
                        <XAxis dataKey="x" />
                        <YAxis domain={[0,10]} />
                        <Tooltip />
                        <Line type="monotone" dataKey="grade" stroke="#7c3aed" strokeWidth={2} dot />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

        {/* Bottom: quick stats & filters */}
        <div className="mt-8 bg-white p-4 rounded-2xl shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Filtros y reportes rápidos</h3>
            <div className="flex gap-2">
              <select value={filters.month} onChange={e=>setFilters(f=>({...f, month: e.target.value}))} className="rounded px-2 py-1">
                <option>Todos</option>
                {MONTHS.map((m,i)=> <option key={i} value={i+1}>{m}</option>)}
              </select>
              <button onClick={()=>alert('Exportar CSV (mock)')} className="px-3 py-1 rounded bg-slate-200">Exportar</button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded">Cursos totales: <strong>{totalCourses}</strong></div>
            <div className="p-4 border rounded">Activos: <strong>{activeCourses}</strong></div>
            <div className="p-4 border rounded">Alumnos registrados (este año): <strong>{totalStudents}</strong></div>
          </div>
        </div>

      </div>
    </div>
  );
}
