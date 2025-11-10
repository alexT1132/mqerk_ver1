import { FileText, BarChart3, Users, BookOpen, Award, Heart, Cog, TrendingUp, GraduationCap, Leaf, Globe, Anchor, Brain } from 'lucide-react';

export const AREA_STYLE_MAP = {
  1: { color:"from-amber-500 to-orange-600", bg:"from-amber-50 to-orange-50", border:"border-amber-200", icon: <FileText className="w-6 h-6" /> },
  2: { color:"from-blue-500 to-indigo-600", bg:"from-blue-50 to-indigo-50", border:"border-blue-200", icon: <BarChart3 className="w-6 h-6" /> },
  3: { color:"from-emerald-500 to-green-600", bg:"from-emerald-50 to-green-50", border:"border-emerald-200", icon: <Users className="w-6 h-6" /> },
  4: { color:"from-purple-500 to-violet-600", bg:"from-purple-50 to-violet-50", border:"border-purple-200", icon: <BookOpen className="w-6 h-6" /> },
  5: { color:"from-rose-500 to-pink-600", bg:"from-rose-50 to-pink-50", border:"border-rose-200", icon: <Award className="w-6 h-6" /> },
  101:{ color:"from-blue-500 to-cyan-600", bg:"from-blue-50 to-cyan-50", border:"border-blue-200", icon:<BarChart3 className="w-6 h-6" /> },
  102:{ color:"from-purple-500 to-indigo-600", bg:"from-purple-50 to-indigo-50", border:"border-purple-200", icon:<Users className="w-6 h-6" /> },
  103:{ color:"from-rose-500 to-pink-600", bg:"from-rose-50 to-pink-50", border:"border-rose-200", icon:<BookOpen className="w-6 h-6" /> },
  104:{ color:"from-emerald-500 to-green-600", bg:"from-emerald-50 to-green-50", border:"border-emerald-200", icon:<Heart className="w-6 h-6" /> },
  105:{ color:"from-orange-500 to-amber-600", bg:"from-orange-50 to-amber-50", border:"border-orange-200", icon:<Cog className="w-6 h-6" /> },
  106:{ color:"from-teal-500 to-cyan-600", bg:"from-teal-50 to-cyan-50", border:"border-teal-200", icon:<TrendingUp className="w-6 h-6" /> },
  107:{ color:"from-violet-500 to-purple-600", bg:"from-violet-50 to-purple-50", border:"border-violet-200", icon:<GraduationCap className="w-6 h-6" /> },
  108:{ color:"from-lime-500 to-green-600", bg:"from-lime-50 to-green-50", border:"border-lime-200", icon:<Leaf className="w-6 h-6" /> },
  109:{ color:"from-blue-400 to-sky-600", bg:"from-blue-50 to-sky-50", border:"border-blue-200", icon:<Globe className="w-6 h-6" /> },
  110:{ color:"from-yellow-500 to-amber-600", bg:"from-yellow-50 to-amber-50", border:"border-yellow-200", icon:<GraduationCap className="w-6 h-6" /> },
  111:{ color:"from-slate-500 to-gray-600", bg:"from-slate-50 to-gray-50", border:"border-slate-200", icon:<Anchor className="w-6 h-6" /> },
  112:{ color:"from-purple-400 to-indigo-500", bg:"from-purple-50 to-indigo-50", border:"border-purple-200", icon:<Brain className="w-6 h-6" /> },
};

export const styleForArea = (id) => {
  const s = AREA_STYLE_MAP[id] || {};
  return {
    color: s.color || 'from-gray-400 to-gray-500',
    bgColor: `bg-gradient-to-br ${s.bg || 'from-gray-50 to-gray-100'}`,
    borderColor: s.border || 'border-gray-200',
    icono: s.icon || <BookOpen className="w-6 h-6" />
  };
};
