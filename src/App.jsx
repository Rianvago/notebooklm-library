import { useState, useMemo, useEffect, useCallback } from "react";
import {
  Search, BookOpen, Star, Users, Plus, X, ExternalLink,
  ChevronRight, Award, Sparkles, Send, Filter, BookMarked,
  Loader2, AlertCircle, RefreshCw, CheckCircle2, Clock,
  MessageCircle, Zap, Lightbulb, Link2, Quote
} from "lucide-react";

// ─── SUPABASE ─────────────────────────────────────────────────────────────────
const SUPABASE_URL = "https://hwtlvafczcszsxlruist.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_ACZjUERTotveCaXECH7hxw_OfDCwcrj";

const db = {
  async getNotebooks() {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/notebooks?approved=eq.true&order=created_at.desc`,
      { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` } }
    );
    if (!res.ok) throw new Error(`Error ${res.status}`);
    return res.json();
  },
  async insertNotebook(data) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/notebooks`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Error ${res.status}: ${await res.text()}`);
    return res.json();
  },
};

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const SUBJECTS = [
  "Todos",
  "Matemáticas", "Historia", "Ciencias", "Lenguaje",
  "IA en Educación", "Inglés", "Filosofía", "Arte",
  "Educación Física", "Tecnología", "Orientación", "Otra",
];

const SC = {
  "Matemáticas":     { bg: "bg-blue-100",    text: "text-blue-700",    dot: "bg-blue-400",    border: "border-blue-200",    pill: "bg-blue-500"    },
  "Historia":        { bg: "bg-amber-100",   text: "text-amber-700",   dot: "bg-amber-400",   border: "border-amber-200",   pill: "bg-amber-500"   },
  "Ciencias":        { bg: "bg-emerald-100", text: "text-emerald-700", dot: "bg-emerald-400", border: "border-emerald-200", pill: "bg-emerald-500" },
  "Lenguaje":        { bg: "bg-rose-100",    text: "text-rose-700",    dot: "bg-rose-400",    border: "border-rose-200",    pill: "bg-rose-500"    },
  "IA en Educación": { bg: "bg-violet-100",  text: "text-violet-700",  dot: "bg-violet-400",  border: "border-violet-200",  pill: "bg-violet-500"  },
  "Inglés":          { bg: "bg-sky-100",     text: "text-sky-700",     dot: "bg-sky-400",     border: "border-sky-200",     pill: "bg-sky-500"     },
  "Filosofía":       { bg: "bg-indigo-100",  text: "text-indigo-700",  dot: "bg-indigo-400",  border: "border-indigo-200",  pill: "bg-indigo-500"  },
  "Arte":            { bg: "bg-pink-100",    text: "text-pink-700",    dot: "bg-pink-400",    border: "border-pink-200",    pill: "bg-pink-500"    },
  "Educación Física":{ bg: "bg-orange-100",  text: "text-orange-700",  dot: "bg-orange-400",  border: "border-orange-200",  pill: "bg-orange-500"  },
  "Tecnología":      { bg: "bg-teal-100",    text: "text-teal-700",    dot: "bg-teal-400",    border: "border-teal-200",    pill: "bg-teal-500"    },
  "Orientación":     { bg: "bg-lime-100",    text: "text-lime-700",    dot: "bg-lime-400",    border: "border-lime-200",    pill: "bg-lime-500"    },
  "Otra":            { bg: "bg-gray-100",    text: "text-gray-700",    dot: "bg-gray-400",    border: "border-gray-200",    pill: "bg-gray-500"    },
};

const MEDAL = [
  { icon: "🥇", bg: "bg-amber-50",  border: "border-amber-200",  text: "text-amber-700"  },
  { icon: "🥈", bg: "bg-slate-50",  border: "border-slate-200",  text: "text-slate-600"  },
  { icon: "🥉", bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-700" },
];

// ─── COMPLEMENTOS ESTÁTICOS ───────────────────────────────────────────────────
const COMPLEMENTOS = [
  {
    name: "Google Drive",
    desc: "Conecta tus documentos y PDFs directamente como fuentes en NotebookLM para enriquecer tus cuadernos.",
    link: "https://drive.google.com",
    icon: "📁",
    color: "bg-blue-50 border-blue-100",
  },
  {
    name: "YouTube",
    desc: "Usa transcripciones de videos de YouTube como fuente de conocimiento dentro de tus cuadernos.",
    link: "https://youtube.com",
    icon: "▶️",
    color: "bg-red-50 border-red-100",
  },
  {
    name: "Google Scholar",
    desc: "Encuentra artículos académicos en PDF para importar como fuentes confiables en NotebookLM.",
    link: "https://scholar.google.com",
    icon: "🎓",
    color: "bg-emerald-50 border-emerald-100",
  },
  {
    name: "Gemini",
    desc: "Complementa NotebookLM con Gemini para generar ideas, resumir y crear material pedagógico extra.",
    link: "https://gemini.google.com",
    icon: "✨",
    color: "bg-violet-50 border-violet-100",
  },
  {
    name: "Perplexity AI",
    desc: "Busca información actualizada y exporta los resultados como fuente complementaria en tus cuadernos.",
    link: "https://perplexity.ai",
    icon: "🔍",
    color: "bg-amber-50 border-amber-100",
  },
  {
    name: "Napkin AI",
    desc: "Transforma el texto de tus cuadernos en infografías y diagramas visuales para tus estudiantes.",
    link: "https://napkin.ai",
    icon: "🗂️",
    color: "bg-teal-50 border-teal-100",
  },
];

// ─── PROMPTS ESTÁTICOS ────────────────────────────────────────────────────────
const PROMPTS_DESTACADOS = [
  {
    category: "Evaluación",
    emoji: "📝",
    prompt: "Crea una rúbrica de evaluación con 4 niveles de desempeño para evaluar [ACTIVIDAD] en estudiantes de [NIVEL]. Incluye criterios claros para cada dimensión.",
    color: "bg-blue-50 border-blue-200",
    tag_color: "bg-blue-500",
  },
  {
    category: "Planificación",
    emoji: "📅",
    prompt: "Diseña una secuencia didáctica de 3 clases sobre [TEMA] para [NIVEL]. Incluye: objetivo, activación de conocimientos previos, desarrollo y cierre con metacognición.",
    color: "bg-emerald-50 border-emerald-200",
    tag_color: "bg-emerald-500",
  },
  {
    category: "Preguntas Socráticas",
    emoji: "💬",
    prompt: "Genera 10 preguntas socráticas de distintos niveles (conocimiento, comprensión, análisis, síntesis) sobre el tema [TEMA] para promover el pensamiento crítico.",
    color: "bg-violet-50 border-violet-200",
    tag_color: "bg-violet-500",
  },
  {
    category: "Resumen para Estudiantes",
    emoji: "✂️",
    prompt: "Resume el contenido de este cuaderno en un texto accesible para estudiantes de [NIVEL]. Usa lenguaje simple, ejemplos cotidianos y bullet points con los conceptos clave.",
    color: "bg-amber-50 border-amber-200",
    tag_color: "bg-amber-500",
  },
  {
    category: "Gamificación",
    emoji: "🎮",
    prompt: "Transforma el contenido de este cuaderno en un juego de preguntas tipo quiz con 15 preguntas de selección múltiple, organizadas de menor a mayor dificultad.",
    color: "bg-rose-50 border-rose-200",
    tag_color: "bg-rose-500",
  },
  {
    category: "Diferenciación",
    emoji: "🎯",
    prompt: "Adapta la siguiente actividad para tres niveles de aprendizaje: estudiantes con NEE, nivel estándar y estudiantes avanzados. Mantén el mismo objetivo de aprendizaje.",
    color: "bg-teal-50 border-teal-200",
    tag_color: "bg-teal-500",
  },
];

// ─── SEED ─────────────────────────────────────────────────────────────────────
const SEED = [
  { title: "Álgebra Lineal: Vectores y Matrices", subject: "Matemáticas", teacher: "Claudia Reyes", description: "Conceptos clave de álgebra lineal con ejemplos visuales.", link: "https://notebooklm.google.com/notebook/example-1", featured: true, approved: true },
  { title: "La Independencia de Chile: Fuentes Primarias", subject: "Historia", teacher: "Marcos Fuentes", description: "Análisis de documentos originales del proceso de independencia.", link: "https://notebooklm.google.com/notebook/example-2", featured: false, approved: true },
  { title: "Prompts para Docentes: Guía Práctica de IA", subject: "IA en Educación", teacher: "Ricky Valencia", description: "Repositorio de prompts educativos clasificados por nivel y objetivo pedagógico.", link: "https://notebooklm.google.com/notebook/example-3", featured: true, approved: true },
  { title: "Célula Eucariota: Estructura y Función", subject: "Ciencias", teacher: "Valentina Mora", description: "Todo sobre organelos, membrana plasmática y procesos celulares.", link: "https://notebooklm.google.com/notebook/example-4", featured: false, approved: true },
  { title: "ChatGPT en el Aula: Casos de Uso", subject: "IA en Educación", teacher: "Ricky Valencia", description: "Casos de uso reales de IA generativa con reflexiones éticas.", link: "https://notebooklm.google.com/notebook/example-7", featured: false, approved: true },
  { title: "Evaluación con IA: Rúbricas Inteligentes", subject: "IA en Educación", teacher: "Ana Cifuentes", description: "Cómo usar NotebookLM y Claude para diseñar rúbricas diferenciadas.", link: "https://notebooklm.google.com/notebook/example-9", featured: true, approved: true },
];

// ─── HOOK ─────────────────────────────────────────────────────────────────────
function useNotebooks() {
  const [notebooks, setNotebooks] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [seeded, setSeeded]       = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      let data = await db.getNotebooks();
      if (data.length === 0 && !seeded) {
        for (const nb of SEED) await db.insertNotebook(nb);
        setSeeded(true);
        data = await db.getNotebooks();
      }
      setNotebooks(data);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, [seeded]);

  useEffect(() => { load(); }, [load]);
  return { notebooks, loading, error, reload: load };
}

// ─── COMPONENTS ───────────────────────────────────────────────────────────────
function Badge({ subject }) {
  const c = SC[subject] || { bg: "bg-gray-100", text: "text-gray-600", dot: "bg-gray-400" };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-semibold px-2.5 py-1 text-xs ${c.bg} ${c.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />{subject}
    </span>
  );
}

function NotebookCard({ nb }) {
  const c = SC[nb.subject] || {};
  const waText = encodeURIComponent(`📚 Mira este cuaderno NotebookLM: *${nb.title}*\n🔗 ${nb.link}`);
  const waUrl  = `https://wa.me/?text=${waText}`;

  return (
    <div className="group relative bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden">
      <div className={`h-1 w-full ${c.dot || "bg-gray-200"}`} />
      {nb.featured && (
        <div className="absolute top-3 right-3 z-10">
          <span className="inline-flex items-center gap-1 bg-amber-400 text-amber-900 text-xs font-bold px-2 py-0.5 rounded-full shadow">
            <Sparkles size={10} /> Destacado
          </span>
        </div>
      )}
      <div className="p-5 flex flex-col flex-1 gap-3">
        <div className="flex items-start gap-3">
          <div className={`mt-0.5 p-2 rounded-xl ${c.bg || "bg-gray-100"} flex-shrink-0`}>
            <BookMarked size={16} className={c.text || "text-gray-600"} />
          </div>
          <h3 className="font-bold text-slate-800 text-sm leading-snug line-clamp-2 flex-1 min-w-0">{nb.title}</h3>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 flex-1">{nb.description}</p>
        {nb.school && <p className="text-xs text-slate-400 flex items-center gap-1">🏫 {nb.school}</p>}
        <div className="flex items-center justify-between pt-1">
          <Badge subject={nb.subject} />
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs">
              {nb.teacher?.charAt(0) || "?"}
            </div>
            <span className="max-w-[90px] truncate text-xs text-slate-500 font-medium">{nb.teacher}</span>
          </div>
        </div>
      </div>
      <div className="px-5 pb-4 flex gap-2">
        <a href={nb.link} target="_blank" rel="noopener noreferrer"
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition ${c.bg || "bg-gray-100"} ${c.text || "text-gray-700"} hover:opacity-80 border ${c.border || "border-gray-200"}`}>
          <BookOpen size={14} /> Abrir <ExternalLink size={12} className="opacity-60" />
        </a>
        <a href={waUrl} target="_blank" rel="noopener noreferrer" title="Compartir por WhatsApp"
          className="p-2.5 rounded-xl bg-green-50 border border-green-200 text-green-600 hover:bg-green-100 transition flex items-center justify-center">
          <MessageCircle size={16} />
        </a>
      </div>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden animate-pulse">
      <div className="h-1 bg-slate-200" />
      <div className="p-5 space-y-3">
        <div className="flex gap-3"><div className="w-8 h-8 rounded-xl bg-slate-200" /><div className="flex-1 space-y-2"><div className="h-3 bg-slate-200 rounded-full w-4/5" /><div className="h-3 bg-slate-200 rounded-full w-2/3" /></div></div>
        <div className="space-y-1.5"><div className="h-2.5 bg-slate-100 rounded-full" /><div className="h-2.5 bg-slate-100 rounded-full w-5/6" /></div>
        <div className="flex justify-between"><div className="h-6 w-24 bg-slate-200 rounded-full" /><div className="h-5 w-20 bg-slate-100 rounded-full" /></div>
      </div>
      <div className="px-5 pb-4"><div className="h-10 bg-slate-100 rounded-xl" /></div>
    </div>
  );
}

function Leaderboard({ notebooks, onClose }) {
  const ranking = useMemo(() => {
    const counts = {};
    notebooks.forEach(nb => { counts[nb.teacher] = (counts[nb.teacher] || 0) + 1; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([name, count], i) => ({ name, count, pos: i + 1 }));
  }, [notebooks]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="bg-gradient-to-br from-amber-400 to-orange-400 p-6 text-white flex items-start justify-between">
          <div><div className="flex items-center gap-2 mb-1"><Award size={20} /><span className="font-black text-lg">Tabla de Honor</span></div><p className="text-amber-100 text-sm">Docentes que más cuadernos han compartido</p></div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/20 transition"><X size={18} /></button>
        </div>
        <div className="p-5 space-y-3 max-h-80 overflow-y-auto">
          {ranking.length === 0 ? <p className="text-center text-slate-400 text-sm py-8">Sin datos aún</p>
            : ranking.map(({ name, count, pos }) => {
              const m = MEDAL[pos - 1];
              return (
                <div key={name} className={`flex items-center gap-3 p-3 rounded-2xl border ${m ? `${m.bg} ${m.border}` : "bg-slate-50 border-slate-100"}`}>
                  <div className="text-xl w-8 text-center">{m ? m.icon : pos}</div>
                  <div className="flex-1"><p className={`font-bold text-sm ${m ? m.text : "text-slate-700"}`}>{name}</p><p className="text-xs text-slate-400">{count} cuaderno{count !== 1 ? "s" : ""}</p></div>
                  <div className="flex gap-0.5">{Array.from({ length: Math.min(count, 5) }).map((_, i) => <div key={i} className="w-2 h-6 rounded-full bg-slate-300" style={{ opacity: 0.4 + i * 0.12 }} />)}</div>
                </div>
              );
            })}
        </div>
        <div className="px-5 pb-5"><div className="bg-violet-50 border border-violet-100 rounded-2xl p-3 text-center text-xs text-violet-600 font-semibold">🎉 ¡Contribuye y aparece en el ranking!</div></div>
      </div>
    </div>
  );
}

function ContributeModal({ onClose }) {
  const [form, setForm]     = useState({ title: "", subject: "", teacher: "", email: "", school: "", description: "", link: "" });
  const [status, setStatus] = useState("idle");
  const [errMsg, setErrMsg] = useState("");
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const valid = form.title.trim() && form.subject && form.teacher.trim() && form.link.trim();

  const submit = async () => {
    if (!valid) return;
    setStatus("loading");
    try {
      await db.insertNotebook({
        title: form.title.trim(), subject: form.subject,
        teacher: form.teacher.trim(), email: form.email.trim(),
        school: form.school.trim(), description: form.description.trim(),
        link: form.link.trim(), featured: false, approved: false,
      });
      setStatus("success");
    } catch (e) { setErrMsg(e.message); setStatus("error"); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="bg-gradient-to-br from-violet-500 to-blue-500 p-6 text-white flex items-start justify-between flex-shrink-0">
          <div><div className="flex items-center gap-2 mb-1"><Plus size={20} /><span className="font-black text-lg">Contribuir Cuaderno</span></div><p className="text-violet-100 text-sm">Comparte tu NotebookLM con la comunidad docente</p></div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/20 transition"><X size={18} /></button>
        </div>

        {status === "success" ? (
          <div className="p-10 text-center">
            <CheckCircle2 size={48} className="text-emerald-500 mx-auto mb-4" />
            <h3 className="font-black text-slate-800 text-xl mb-2">¡Gracias por contribuir!</h3>
            <p className="text-sm text-slate-500 mb-3">Tu cuaderno está <strong>guardado en la base de datos</strong>. Aparecerá en la galería una vez aprobado.</p>
            <div className="inline-flex items-center gap-2 text-amber-600 bg-amber-50 rounded-xl px-4 py-2 text-xs font-semibold mb-6"><Clock size={13} /> Pendiente de revisión</div><br />
            <button onClick={onClose} className="px-6 py-2.5 rounded-xl bg-violet-500 text-white font-bold text-sm hover:bg-violet-600 transition">Cerrar</button>
          </div>
        ) : (
          <div className="p-6 space-y-4 overflow-y-auto">
            {status === "error" && (
              <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-xs">
                <AlertCircle size={14} className="flex-shrink-0 mt-0.5" /><span>{errMsg || "Error al enviar."}</span>
              </div>
            )}

            {/* Obligatorios */}
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Información del cuaderno *</p>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5">Título *</label>
              <input value={form.title} onChange={e => set("title", e.target.value)} placeholder="Ej: Geometría Analítica para 3° Medio"
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300 transition" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5">Asignatura *</label>
                <select value={form.subject} onChange={e => set("subject", e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300 transition bg-white">
                  <option value="">Selecciona...</option>
                  {SUBJECTS.filter(s => s !== "Todos").map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5">Tu Nombre *</label>
                <input value={form.teacher} onChange={e => set("teacher", e.target.value)} placeholder="Ej: Ricky Valencia"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300 transition" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5">Link de NotebookLM *</label>
              <input value={form.link} onChange={e => set("link", e.target.value)} placeholder="https://notebooklm.google.com/notebook/..."
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300 transition" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5">Descripción</label>
              <textarea value={form.description} onChange={e => set("description", e.target.value)} rows={2} placeholder="Breve descripción del contenido..."
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300 transition resize-none" />
            </div>

            {/* Opcionales */}
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider pt-1">Datos opcionales</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5">Correo electrónico</label>
                <input value={form.email} onChange={e => set("email", e.target.value)} placeholder="tu@correo.cl" type="email"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300 transition" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5">Escuela o institución</label>
                <input value={form.school} onChange={e => set("school", e.target.value)} placeholder="Ej: Liceo San José"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300 transition" />
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-500 flex items-start gap-2">
              <Clock size={13} className="flex-shrink-0 mt-0.5 text-amber-500" />
              Tu cuaderno aparecerá en la galería después de la revisión del administrador.
            </div>
            <div className="flex gap-3 pt-1">
              <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition">Cancelar</button>
              <button onClick={submit} disabled={!valid || status === "loading"}
                className="flex-1 py-2.5 rounded-xl bg-violet-500 hover:bg-violet-600 disabled:opacity-50 text-white text-sm font-bold transition flex items-center justify-center gap-2">
                {status === "loading" ? <><Loader2 size={14} className="animate-spin" /> Guardando...</> : <><Send size={14} /> Enviar</>}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function PromptCard({ item }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(item.prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className={`rounded-2xl border p-4 flex flex-col gap-3 ${item.color}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">{item.emoji}</span>
          <span className={`text-xs font-bold text-white px-2.5 py-1 rounded-full ${item.tag_color}`}>{item.category}</span>
        </div>
        <button onClick={copy} className="text-xs font-semibold text-slate-500 hover:text-slate-700 bg-white border border-slate-200 px-2.5 py-1 rounded-lg transition">
          {copied ? "✅ Copiado" : "Copiar"}
        </button>
      </div>
      <p className="text-xs text-slate-600 leading-relaxed italic">"{item.prompt}"</p>
    </div>
  );
}

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function App() {
  const { notebooks, loading, error, reload } = useNotebooks();
  const [search, setSearch]                   = useState("");
  const [activeSubject, setActiveSubject]     = useState("Todos");
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showContribute, setShowContribute]   = useState(false);
  const [activeTab, setActiveTab]             = useState("cuadernos"); // cuadernos | complementos | prompts

  const filtered = useMemo(() => notebooks.filter(nb => {
    const matchSubject = activeSubject === "Todos" || nb.subject === activeSubject;
    const q = search.toLowerCase();
    return matchSubject && (!q || nb.title?.toLowerCase().includes(q) || nb.teacher?.toLowerCase().includes(q));
  }), [notebooks, search, activeSubject]);

  const totalTeachers = useMemo(() => new Set(notebooks.map(n => n.teacher)).size, [notebooks]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans">

      {/* ── HEADER ── */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-blue-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow">
              <BookOpen size={18} className="text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="font-black text-slate-800 text-base sm:text-lg leading-tight">NotebookLM Library</h1>
              <p className="text-xs text-slate-400 hidden sm:block">Repositorio docente colaborativo</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button onClick={reload} disabled={loading} title="Actualizar" className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 transition disabled:opacity-40">
              <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
            </button>
            <button onClick={() => setShowLeaderboard(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 border border-amber-100 text-amber-700 text-xs font-bold hover:bg-amber-100 transition">
              <Award size={14} /><span className="hidden sm:inline">Ranking</span>
            </button>
            <button onClick={() => setShowContribute(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-violet-500 text-white text-xs font-bold hover:bg-violet-600 transition shadow-sm">
              <Plus size={14} /><span>Contribuir</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── FRASE MOTIVACIONAL ── */}
      <div className="bg-gradient-to-r from-violet-600 to-blue-600 text-white py-4 px-4">
        <div className="max-w-6xl mx-auto flex items-center justify-center gap-3">
          <Quote size={16} className="text-violet-200 flex-shrink-0" />
          <p className="text-sm font-medium text-center text-violet-50">
            "El conocimiento que no se comparte se estanca. El que se comparte, crece y transforma."
          </p>
          <Quote size={16} className="text-violet-200 flex-shrink-0 rotate-180" />
        </div>
      </div>

      {/* ── STATS ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 pb-4">
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { label: "Cuadernos",   value: loading ? "…" : notebooks.length,  icon: BookMarked, color: "text-blue-500",    bg: "bg-blue-50"    },
            { label: "Docentes",    value: loading ? "…" : totalTeachers,      icon: Users,      color: "text-emerald-500", bg: "bg-emerald-50" },
            { label: "Asignaturas", value: SUBJECTS.length - 1,                icon: Star,       color: "text-amber-500",   bg: "bg-amber-50"   },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="bg-white rounded-2xl border border-slate-100 p-4 flex flex-col items-center text-center shadow-sm">
              <div className={`${bg} ${color} p-2 rounded-xl mb-2`}><Icon size={16} /></div>
              <p className="font-black text-slate-800 text-2xl leading-tight">{value}</p>
              <p className="text-xs text-slate-400 font-medium">{label}</p>
            </div>
          ))}
        </div>

        {/* TABS principales */}
        <div className="flex gap-2 mb-6 border-b border-slate-200">
          {[
            { id: "cuadernos",    label: "📚 Cuadernos",     },
            { id: "complementos", label: "⚡ Complementos",  },
            { id: "prompts",      label: "💡 Prompts",       },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-sm font-bold transition border-b-2 -mb-px ${
                activeTab === tab.id
                  ? "text-violet-600 border-violet-500"
                  : "text-slate-500 border-transparent hover:text-slate-700"
              }`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search + Filter — solo en cuadernos */}
        {activeTab === "cuadernos" && (
          <>
            <div className="relative mb-4">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 bg-white text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-300 transition shadow-sm"
                placeholder="Buscar cuadernos o docentes..." />
              {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded-full transition"><X size={14} className="text-slate-400" /></button>}
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2">
              <Filter size={14} className="text-slate-400 flex-shrink-0 mt-2.5" />
              {SUBJECTS.map(sub => {
                const c = SC[sub];
                const active = activeSubject === sub;
                return (
                  <button key={sub} onClick={() => setActiveSubject(sub)}
                    className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold transition border ${
                      active
                        ? sub === "Todos" ? "bg-slate-800 text-white border-slate-800 shadow-md" : `${c?.pill} text-white border-transparent shadow-md`
                        : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                    }`}>
                    {sub}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </section>

      {/* ── CONTENIDO PRINCIPAL ── */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pb-16">

        {/* TAB: CUADERNOS */}
        {activeTab === "cuadernos" && (
          <>
            {error && !loading && (
              <div className="mb-6 flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl p-4 text-red-700">
                <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
                <div><p className="font-bold text-sm mb-1">No se pudo conectar</p><p className="text-xs opacity-80 mb-2">{error}</p><button onClick={reload} className="text-xs font-bold underline">Reintentar</button></div>
              </div>
            )}
            {loading && <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} />)}</div>}
            {!loading && !error && filtered.length === 0 && (
              <div className="text-center py-20">
                <div className="text-5xl mb-4">🔍</div>
                <h3 className="font-bold text-slate-600 mb-1">Sin resultados</h3>
                <p className="text-sm text-slate-400">Prueba con otro término o cambia el filtro</p>
                <button onClick={() => { setSearch(""); setActiveSubject("Todos"); }} className="mt-4 text-xs text-violet-500 font-semibold hover:underline">Limpiar filtros</button>
              </div>
            )}
            {!loading && !error && filtered.length > 0 && (
              <>
                <div className="flex items-center justify-between mb-5">
                  <p className="text-sm text-slate-400 font-medium">
                    <span className="text-slate-700 font-bold">{filtered.length}</span> cuaderno{filtered.length !== 1 ? "s" : ""} encontrado{filtered.length !== 1 ? "s" : ""}
                  </p>
                  {(search || activeSubject !== "Todos") && (
                    <button onClick={() => { setSearch(""); setActiveSubject("Todos"); }} className="text-xs text-violet-500 font-semibold hover:underline flex items-center gap-1"><X size={12} /> Limpiar</button>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filtered.map(nb => <NotebookCard key={nb.id} nb={nb} />)}
                </div>
              </>
            )}
            <div className="mt-12 bg-gradient-to-r from-violet-50 to-blue-50 border border-violet-100 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
              <div className="text-4xl">📚</div>
              <div className="flex-1">
                <h3 className="font-black text-slate-800 mb-1">¿Tienes un NotebookLM que compartir?</h3>
                <p className="text-sm text-slate-500">Apórtalo a la biblioteca y ayuda a otros docentes. ¡Aparece en la tabla de honor!</p>
              </div>
              <button onClick={() => setShowContribute(true)} className="flex-shrink-0 flex items-center gap-2 px-5 py-3 rounded-2xl bg-violet-500 text-white font-bold text-sm hover:bg-violet-600 transition shadow">
                Contribuir <ChevronRight size={16} />
              </button>
            </div>
          </>
        )}

        {/* TAB: COMPLEMENTOS */}
        {activeTab === "complementos" && (
          <div>
            <div className="mb-6">
              <h2 className="font-black text-slate-800 text-xl mb-1 flex items-center gap-2"><Zap size={20} className="text-amber-500" /> Mejores complementos para NotebookLM</h2>
              <p className="text-sm text-slate-500">Herramientas que potencian tu experiencia con NotebookLM en el aula.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {COMPLEMENTOS.map(c => (
                <div key={c.name} className={`rounded-2xl border p-5 flex flex-col gap-3 ${c.color}`}>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{c.icon}</span>
                    <h3 className="font-black text-slate-800">{c.name}</h3>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed flex-1">{c.desc}</p>
                  <a href={c.link} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition">
                    <Link2 size={14} /> Abrir herramienta <ExternalLink size={12} className="opacity-50" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: PROMPTS */}
        {activeTab === "prompts" && (
          <div>
            <div className="mb-6">
              <h2 className="font-black text-slate-800 text-xl mb-1 flex items-center gap-2"><Lightbulb size={20} className="text-violet-500" /> Prompts para usar en NotebookLM</h2>
              <p className="text-sm text-slate-500">Copia y pega estos prompts directamente en tu cuaderno. Reemplaza los campos entre <strong>[corchetes]</strong>.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {PROMPTS_DESTACADOS.map((p, i) => <PromptCard key={i} item={p} />)}
            </div>
            <div className="mt-8 bg-violet-50 border border-violet-200 rounded-2xl p-5 text-center">
              <p className="text-sm font-bold text-violet-700 mb-1">💡 ¿Tienes un prompt que funciona genial?</p>
              <p className="text-xs text-violet-600">Escríbenos al correo del administrador y lo agregamos a la colección.</p>
            </div>
          </div>
        )}
      </main>

      {/* ── FOOTER ── */}
      <footer className="border-t border-slate-100 bg-white py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-3 text-center">
          <p className="text-xs text-slate-400">NotebookLM Library · Comunidad docente colaborativa · Chile</p>
          <p className="text-xs text-slate-500 font-semibold">
            💡 Idea y desarrollo por <span className="text-violet-600 font-bold">Ricardo Valencia</span> · Encargado de Innovación del Liceo Bicentenario San José UR
          </p>
          <p className="text-xs text-slate-300">Hecho con <span className="text-red-400">♥</span> para transformar la educación</p>
        </div>
      </footer>

      {showLeaderboard && <Leaderboard notebooks={notebooks} onClose={() => setShowLeaderboard(false)} />}
      {showContribute   && <ContributeModal onClose={() => setShowContribute(false)} />}
    </div>
  );
}
