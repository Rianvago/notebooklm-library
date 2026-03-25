import { useState, useMemo, useEffect, useCallback } from "react";
import {
  Search, BookOpen, Star, Users, Plus, X, ExternalLink,
  ChevronRight, Award, Sparkles, Send, BookMarked,
  Loader2, AlertCircle, RefreshCw, CheckCircle2, Clock,
  MessageCircle, Zap, Lightbulb, Link2, Quote, Heart,
  Hash, Trash2, Menu, Chrome, MessageSquare
} from "lucide-react";

const SUPABASE_URL = "https://hwtlvafczcszsxlruist.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_ACZjUERTotveCaXECH7hxw_OfDCwcrj";
const ADMIN_PASSWORD = "liceo2025";

const db = {
  async getNotebooks() {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/notebooks?approved=eq.true&order=created_at.desc`, {
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` }
    });
    if (!res.ok) throw new Error(`Error ${res.status}`);
    return res.json();
  },
  async insertNotebook(data) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/notebooks`, {
      method: "POST",
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}`, "Content-Type": "application/json", Prefer: "return=representation" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Error ${res.status}: ${await res.text()}`);
    return res.json();
  },
  async deleteNotebook(id) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/notebooks?id=eq.${id}`, {
      method: "DELETE",
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` }
    });
    if (!res.ok) throw new Error(`Error ${res.status}`);
  },
  async likeNotebook(id, currentLikes) {
    await fetch(`${SUPABASE_URL}/rest/v1/notebooks?id=eq.${id}`, {
      method: "PATCH",
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ likes: (currentLikes || 0) + 1 }),
    });
  },
  async getComments(notebookId) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/comments?notebook_id=eq.${notebookId}&order=created_at.asc`, {
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` }
    });
    if (!res.ok) throw new Error(`Error ${res.status}`);
    return res.json();
  },
  async insertComment(data) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/comments`, {
      method: "POST",
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}`, "Content-Type": "application/json", Prefer: "return=representation" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Error ${res.status}`);
    return res.json();
  },
};

const SUBJECTS = ["Todos","Matemáticas","Historia","Ciencias","Lenguaje","IA en Educación","Inglés","Filosofía","Arte","Educación Física","Tecnología","Orientación","Otra"];

const SC = {
  "Matemáticas":      { bg:"bg-blue-100",    text:"text-blue-700",    dot:"bg-blue-400",    border:"border-blue-200",    pill:"bg-blue-500"    },
  "Historia":         { bg:"bg-amber-100",   text:"text-amber-700",   dot:"bg-amber-400",   border:"border-amber-200",   pill:"bg-amber-500"   },
  "Ciencias":         { bg:"bg-emerald-100", text:"text-emerald-700", dot:"bg-emerald-400", border:"border-emerald-200", pill:"bg-emerald-500" },
  "Lenguaje":         { bg:"bg-rose-100",    text:"text-rose-700",    dot:"bg-rose-400",    border:"border-rose-200",    pill:"bg-rose-500"    },
  "IA en Educación":  { bg:"bg-violet-100",  text:"text-violet-700",  dot:"bg-violet-400",  border:"border-violet-200",  pill:"bg-violet-500"  },
  "Inglés":           { bg:"bg-sky-100",     text:"text-sky-700",     dot:"bg-sky-400",     border:"border-sky-200",     pill:"bg-sky-500"     },
  "Filosofía":        { bg:"bg-indigo-100",  text:"text-indigo-700",  dot:"bg-indigo-400",  border:"border-indigo-200",  pill:"bg-indigo-500"  },
  "Arte":             { bg:"bg-pink-100",    text:"text-pink-700",    dot:"bg-pink-400",    border:"border-pink-200",    pill:"bg-pink-500"    },
  "Educación Física": { bg:"bg-orange-100",  text:"text-orange-700",  dot:"bg-orange-400",  border:"border-orange-200",  pill:"bg-orange-500"  },
  "Tecnología":       { bg:"bg-teal-100",    text:"text-teal-700",    dot:"bg-teal-400",    border:"border-teal-200",    pill:"bg-teal-500"    },
  "Orientación":      { bg:"bg-lime-100",    text:"text-lime-700",    dot:"bg-lime-400",    border:"border-lime-200",    pill:"bg-lime-500"    },
  "Otra":             { bg:"bg-gray-100",    text:"text-gray-700",    dot:"bg-gray-400",    border:"border-gray-200",    pill:"bg-gray-500"    },
};

const MEDAL = [
  { icon:"🥇", bg:"bg-amber-50",  border:"border-amber-200",  text:"text-amber-700"  },
  { icon:"🥈", bg:"bg-slate-50",  border:"border-slate-200",  text:"text-slate-600"  },
  { icon:"🥉", bg:"bg-orange-50", border:"border-orange-200", text:"text-orange-700" },
];

// ─── COMPLEMENTOS ─────────────────────────────────────────────────────────────
const COMPLEMENTOS = [
  // ── Herramientas Web ──
  {
    name: "Google Drive",
    desc: "Conecta tus documentos y PDFs directamente como fuentes en NotebookLM para enriquecer tus cuadernos al instante.",
    link: "https://drive.google.com",
    icon: "📁", color: "bg-blue-50 border-blue-200", type: "web", rating: null,
  },
  {
    name: "Google Scholar",
    desc: "Encuentra artículos académicos y papers científicos en PDF para importarlos como fuentes confiables en tus cuadernos.",
    link: "https://scholar.google.com",
    icon: "🎓", color: "bg-emerald-50 border-emerald-200", type: "web", rating: null,
  },
  {
    name: "Gemini",
    desc: "Complementa NotebookLM con Gemini para generar ideas, resumir contenidos y crear material pedagógico adicional.",
    link: "https://gemini.google.com",
    icon: "✨", color: "bg-violet-50 border-violet-200", type: "web", rating: null,
  },
  {
    name: "Perplexity AI",
    desc: "Busca información actualizada en tiempo real y exporta los resultados como fuente complementaria en tus cuadernos.",
    link: "https://perplexity.ai",
    icon: "🔍", color: "bg-amber-50 border-amber-200", type: "web", rating: null,
  },
  {
    name: "Napkin AI",
    desc: "Transforma el texto de tus cuadernos en infografías y diagramas visuales para presentar a tus estudiantes.",
    link: "https://napkin.ai",
    icon: "🗂️", color: "bg-teal-50 border-teal-200", type: "web", rating: null,
  },
  // ── Plugins Chrome ──
  {
    name: "NotebookLM Tools",
    desc: "La navaja suiza de NotebookLM: importación masiva de fuentes, organización por carpetas, banco de prompts, duplicado de cuadernos, fusión de fuentes, modo studio, etiquetas y modo oscuro.",
    link: "https://chromewebstore.google.com/detail/notebooklm-tools/hiibkpjljigehlnnecbgehkhfibmahjn?hl=es",
    icon: "🧰", color: "bg-yellow-50 border-yellow-200", type: "chrome", rating: "4,7 ⭐",
  },
  {
    name: "FolderLLM: Carpetas en NotebookLM",
    desc: "Crea carpetas dentro de NotebookLM para organizar tus cuadernos visualmente. Añade colores, emojis y arrastra cuadernos entre carpetas con un clic.",
    link: "https://chromewebstore.google.com/detail/folderllm-create-folders/nknkgcmodkaiffdnlpmlnegmeamnbioe",
    icon: "📂", color: "bg-orange-50 border-orange-200", type: "chrome", rating: "4,5 ⭐",
  },
  {
    name: "NotebookLM Ultra Exporter",
    desc: "Exporta tus notas, diapositivas, mapas mentales, flashcards, tablas e infografías de NotebookLM a Markdown, Word, PDF, CSV y más formatos con un clic.",
    link: "https://chromewebstore.google.com/detail/notebooklm-ultra-exporter/afchokljnhhggkhedfbmkcmdagjmjchj?hl=es",
    icon: "📤", color: "bg-slate-50 border-slate-300", type: "chrome", rating: "4,1 ⭐",
  },
  {
    name: "YouTube to NotebookLM",
    desc: "Envía videos de YouTube directamente a NotebookLM como fuentes. Sincroniza canales completos y gestiona todos tus videos desde el cuaderno sin copiar y pegar links.",
    link: "https://chromewebstore.google.com/detail/youtube-to-notebooklm/kobncfkmjelbefaoohoblamnbackjggk",
    icon: "▶️", color: "bg-red-50 border-red-200", type: "chrome", rating: "4,9 ⭐",
  },
  {
    name: "NotebookLM Web Importer",
    desc: "Importa cualquier página web directamente como fuente en NotebookLM con un clic desde el navegador. Sin copiar texto ni URLs manualmente.",
    link: "https://chromewebstore.google.com/detail/notebooklm-web-importer/lkfiddkempgfbdcbonecmabjdelomhgo",
    icon: "🌐", color: "bg-sky-50 border-sky-200", type: "chrome", rating: null,
  },
];

// ─── PROMPTS VISUALES ─────────────────────────────────────────────────────────
const PROMPTS_BASE = [
  {
    id: 1,
    name: "PCB Schematic Architecture",
    number: "#04",
    when: "Redes de conceptos, sistemas interconectados",
    difficulty: "Alta",
    time: "8 min",
    emoji: "🔌",
    color: "bg-zinc-900 border-zinc-700",
    textColor: "text-zinc-100",
    descColor: "text-zinc-400",
    tagBg: "bg-yellow-500",
    tagText: "text-zinc-900",
    tags: ["Industrial", "Skeuomorphic", "Hardware", "Tactile"],
    accent: "#ffc107",
    prompt: `Tone: "Precision Engineering, Rugged Reliability, Technical Authority, Hardware-Focused"
Background: "#cfd3d6" | Text: "#1f1f1f" | Accent: "#ffc107"

Features: "Photorealistic hardware components integrated with 2D schematic diagrams (PCB traces), metallic plaque substrate, workshop tools framing the scene.
Texture: Brushed aluminum, scratched metal, rubber cable insulation, matte plastic.
Central information plate screwed onto a dirty work surface, framed by disorganized tools (calipers, cables) acting as a border.
Subtle glowing effects on yellow LED/circuit indicators."

Typography: DIN Condensed or Impact (Industrial Sans-Serif), Uppercase
Tags: Industrial, Skeuomorphic, Engineering, Hardware, Tactile`,
  },
  {
    id: 2,
    name: "Neumorphic Tech Schematic",
    number: "#07",
    when: "Comparativas de features, resúmenes corporativos",
    difficulty: "Media",
    time: "5 min",
    emoji: "🤖",
    color: "bg-slate-900 border-cyan-900",
    textColor: "text-white",
    descColor: "text-slate-400",
    tagBg: "bg-cyan-500",
    tagText: "text-slate-900",
    tags: ["Cyberpunk", "Dark Mode", "Tech-Infographic", "Neon-Glow"],
    accent: "#00c4fa",
    prompt: `Tone: "Futuristic, Analytical, Sophisticated, High-Tech, Cinematic"
Background: "#080a12" | Text: "#ffffff" | Accent: "#00c4fa"

Features: "Glowing borders, rounded rectangular containers, directional flow arrows, schematic icons (brain, code, charts), faint circuit-board background patterns.
Smooth digital matte with luminescent neon edges and semi-transparent glassmorphic container fills.
Dark ambient environment illuminated by self-emitting neon strokes (cyan + purple)."

Typography: Modern Sans-Serif Bold/Heavy; high contrast white on dark
Tags: Cyberpunk, Dark Mode, Tech-Infographic, Neon-Glow, Process-Flow`,
  },
  {
    id: 3,
    name: "Cyberpunk Isométrico 3D",
    number: "#09",
    when: "Arquitecturas complejas, stacks tecnológicos",
    difficulty: "Alta",
    time: "8 min",
    emoji: "🏙️",
    color: "bg-indigo-950 border-indigo-700",
    textColor: "text-white",
    descColor: "text-indigo-300",
    tagBg: "bg-indigo-500",
    tagText: "text-white",
    tags: ["Cyberpunk", "Futuristic UI", "Data Visualization", "Isometric"],
    accent: "#00E5FF",
    prompt: `Tone: "Sophisticated, Analytical, High-Tech, Visionary, Instructional"
Background: "#020712" | Text: "#E1F5FE" | Accent: "#00E5FF"

Features: "Floating isometric screens, wireframe brain models, luminous particle streams, hexagonal data blocks, semi-transparent glass interfaces.
Dynamic flow-chart arrangement in 3D space, diagonal progression, layered depth with distinct foreground and background elements.
Emissive internal glow, neon rim lighting, volumetric effects, bloom and lens flare."

Typography: Modern Geometric Sans-Serif (Roboto, Exo 2, Noto Sans JP)
Tags: Cyberpunk, Futuristic UI, Data Visualization, Holographic, Isometric`,
  },
  {
    id: 4,
    name: "Holographic UI",
    number: "#10",
    when: "Datos complejos, arquitecturas de IA",
    difficulty: "Alta",
    time: "8 min",
    emoji: "💠",
    color: "bg-blue-950 border-cyan-800",
    textColor: "text-white",
    descColor: "text-cyan-300",
    tagBg: "bg-cyan-400",
    tagText: "text-blue-950",
    tags: ["Cyberpunk", "Holographic UI", "Neon Noir", "Futuristic"],
    accent: "#00FFFF",
    prompt: `Tone: "Technological, Analytical, Urgent, Futuristic, High-Contrast"
Background: "#050512" | Text: "#FFFFFF" | Accent: "#00FFFF"

Features: "Holographic wireframes, brain and gear iconography, glowing directional arrows, code snippets, glitch artifacts, hexagonal grid overlays.
CRT scanlines, glass-like UI panels, gritty wet urban background.
Centralized flowchart logic layered over a depth-filled environment.
Semi-transparent blue-tinted panels with chamfered corners.
Jagged lightning-bolt arrows and straight glowing vectors."

Typography: Bold Sans-Serif (Gothic/geometric), Neon Glow Effect
Tags: Cyberpunk, Holographic UI, Neon Noir, Futuristic`,
  },
  {
    id: 5,
    name: "Cyberpunk Holographic Neon Noir",
    number: "#11",
    when: "Infografías de alto impacto visual, ciberseguridad",
    difficulty: "Alta",
    time: "8 min",
    emoji: "👾",
    color: "bg-black border-green-900",
    textColor: "text-green-400",
    descColor: "text-green-700",
    tagBg: "bg-green-500",
    tagText: "text-black",
    tags: ["ASCII Art", "Cyberpunk", "Retro-Computing", "Terminal UI"],
    accent: "#FFB200",
    prompt: `Tone: "Technical, Authoritative, Nostalgic, Cryptic, High-tech Hacker Ethos"
Background: "#050505" | Text: "#2CFF56" | Accent: "#FFB200"

Features: "ASCII art, pixel-art iconography, wireframe circuit traces, binary rain data streams, command-line interfaces, schematic flowcharts.
CRT monitor phosphor glow, scanlines, digital noise, high-contrast pixelation.
Modular vertical layout separated by dashed dividers, centered hero graphic (terminal/computer).
Hex codes, binary strings, and ASCII art elements in margins."

Typography: Monospaced Console (VT323, Courier New, Fira Code)
Tags: ASCII Art, Cyberpunk, Retro-Computing, Pixel Art, Terminal UI`,
  },
];

const SEED = [
  { title:"Álgebra Lineal: Vectores y Matrices", subject:"Matemáticas", teacher:"Claudia Reyes", description:"Conceptos clave de álgebra lineal con ejemplos visuales.", link:"https://notebooklm.google.com/notebook/example-1", featured:true, approved:true },
  { title:"La Independencia de Chile: Fuentes Primarias", subject:"Historia", teacher:"Marcos Fuentes", description:"Análisis de documentos originales del proceso de independencia.", link:"https://notebooklm.google.com/notebook/example-2", featured:false, approved:true },
  { title:"Prompts para Docentes: Guía Práctica de IA", subject:"IA en Educación", teacher:"Ricky Valencia", description:"Repositorio de prompts educativos clasificados por nivel y objetivo.", link:"https://notebooklm.google.com/notebook/example-3", featured:true, approved:true },
  { title:"Célula Eucariota: Estructura y Función", subject:"Ciencias", teacher:"Valentina Mora", description:"Todo sobre organelos, membrana plasmática y procesos celulares.", link:"https://notebooklm.google.com/notebook/example-4", featured:false, approved:true },
  { title:"Evaluación con IA: Rúbricas Inteligentes", subject:"IA en Educación", teacher:"Ana Cifuentes", description:"Cómo usar NotebookLM y Claude para diseñar rúbricas diferenciadas.", link:"https://notebooklm.google.com/notebook/example-9", featured:true, approved:true },
];

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
        setSeeded(true); data = await db.getNotebooks();
      }
      setNotebooks(data);
    } catch(e) { setError(e.message); }
    finally { setLoading(false); }
  }, [seeded]);

  useEffect(() => { load(); }, [load]);
  return { notebooks, loading, error, reload: load, setNotebooks };
}

function Badge({ subject }) {
  const c = SC[subject] || { bg:"bg-gray-100", text:"text-gray-600", dot:"bg-gray-400" };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-semibold px-2.5 py-1 text-xs ${c.bg} ${c.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`}/>{subject}
    </span>
  );
}

function CommentsPanel({ notebook, onClose }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [author, setAuthor]     = useState("");
  const [content, setContent]   = useState("");
  const [sending, setSending]   = useState(false);

  useEffect(() => {
    db.getComments(notebook.id).then(setComments).finally(() => setLoading(false));
  }, [notebook.id]);

  const submit = async () => {
    if (!author.trim() || !content.trim()) return;
    setSending(true);
    try {
      await db.insertComment({ notebook_id: notebook.id, author: author.trim(), content: content.trim() });
      const updated = await db.getComments(notebook.id);
      setComments(updated); setContent("");
    } finally { setSending(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="p-5 border-b border-slate-100 flex items-start justify-between flex-shrink-0">
          <div><h3 className="font-black text-slate-800">Comentarios</h3><p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{notebook.title}</p></div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 transition"><X size={16}/></button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {loading && <div className="text-center py-8"><Loader2 className="animate-spin mx-auto text-slate-400" size={20}/></div>}
          {!loading && comments.length === 0 && <div className="text-center py-8 text-slate-400 text-sm">Sé el primero en comentar 💬</div>}
          {comments.map(c => (
            <div key={c.id} className="bg-slate-50 rounded-2xl p-3">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 rounded-full bg-violet-200 flex items-center justify-center text-violet-700 font-bold text-xs">{c.author.charAt(0)}</div>
                <span className="text-xs font-bold text-slate-700">{c.author}</span>
                <span className="text-xs text-slate-400 ml-auto">{new Date(c.created_at).toLocaleDateString("es-CL")}</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">{c.content}</p>
            </div>
          ))}
        </div>
        <div className="p-4 border-t border-slate-100 space-y-2 flex-shrink-0">
          <input value={author} onChange={e=>setAuthor(e.target.value)} placeholder="Tu nombre..." className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300 transition"/>
          <div className="flex gap-2">
            <textarea value={content} onChange={e=>setContent(e.target.value)} rows={2} placeholder="Escribe un comentario..." className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300 transition resize-none"/>
            <button onClick={submit} disabled={sending || !author.trim() || !content.trim()} className="px-3 rounded-xl bg-violet-500 text-white hover:bg-violet-600 disabled:opacity-40 transition flex items-center justify-center">
              {sending ? <Loader2 size={16} className="animate-spin"/> : <Send size={16}/>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function NotebookCard({ nb, isAdmin, onDelete, onLike }) {
  const c = SC[nb.subject] || {};
  const displaySubject = nb.subject === "Otra" && nb.custom_subject ? nb.custom_subject : nb.subject;
  const tags = nb.hashtags ? nb.hashtags.split(",").map(t => t.trim()).filter(Boolean) : [];
  const [showComments, setShowComments] = useState(false);
  const [liked, setLiked]               = useState(false);
  const [localLikes, setLocalLikes]     = useState(nb.likes || 0);

  const handleLike = async () => {
    if (liked) return;
    setLiked(true); setLocalLikes(l => l + 1);
    await onLike(nb.id, nb.likes || 0);
  };

  return (
    <>
      <div className="group relative bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden">
        <div className={`h-1 w-full ${c.dot || "bg-gray-200"}`}/>
        {nb.featured && (
          <div className="absolute top-3 right-3 z-10">
            <span className="inline-flex items-center gap-1 bg-amber-400 text-amber-900 text-xs font-bold px-2 py-0.5 rounded-full shadow">
              <Sparkles size={10}/> Destacado
            </span>
          </div>
        )}
        <div className="p-5 flex flex-col flex-1 gap-3">
          <div className="flex items-start gap-3">
            <div className={`mt-0.5 p-2 rounded-xl ${c.bg || "bg-gray-100"} flex-shrink-0`}>
              <BookMarked size={16} className={c.text || "text-gray-600"}/>
            </div>
            <h3 className="font-bold text-slate-800 text-sm leading-snug line-clamp-2 flex-1 min-w-0">{nb.title}</h3>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 flex-1">{nb.description}</p>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {tags.map((t,i) => <span key={i} className="text-xs text-violet-500 font-semibold">#{t}</span>)}
            </div>
          )}
          {nb.school && <p className="text-xs text-slate-400">🏫 {nb.school}</p>}
          <div className="flex items-center justify-between pt-1">
            <Badge subject={displaySubject}/>
            <div className="flex items-center gap-2">
              {nb.instagram && <a href={nb.instagram} target="_blank" rel="noopener noreferrer" className="text-pink-400 hover:text-pink-600 text-xs font-bold transition">IG</a>}
              {nb.tiktok    && <a href={nb.tiktok}    target="_blank" rel="noopener noreferrer" className="text-slate-700 hover:text-slate-900 text-xs font-bold transition">TK</a>}
              {nb.linkedin  && <a href={nb.linkedin}  target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700 text-xs font-bold transition">in</a>}
              <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs">{nb.teacher?.charAt(0)||"?"}</div>
              <span className="max-w-[80px] truncate text-xs text-slate-500 font-medium">{nb.teacher}</span>
            </div>
          </div>
        </div>
        <div className="px-5 pb-4 space-y-2">
          <a href={nb.link} target="_blank" rel="noopener noreferrer"
            className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition ${c.bg||"bg-gray-100"} ${c.text||"text-gray-700"} hover:opacity-80 border ${c.border||"border-gray-200"}`}>
            <BookOpen size={14}/> Abrir Cuaderno <ExternalLink size={12} className="opacity-60"/>
          </a>
          <div className="flex gap-2">
            <button onClick={handleLike} className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border text-xs font-semibold transition ${liked?"bg-red-50 border-red-200 text-red-500":"bg-slate-50 border-slate-200 text-slate-500 hover:bg-red-50 hover:border-red-200 hover:text-red-400"}`}>
              <Heart size={13} className={liked?"fill-red-400 text-red-400":""}/> {localLikes>0?localLikes:""} Me gusta
            </button>
            <button onClick={()=>setShowComments(true)} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 hover:bg-violet-50 hover:border-violet-200 hover:text-violet-500 text-xs font-semibold transition">
              <MessageSquare size={13}/> Comentar
            </button>
            <a href={`https://wa.me/?text=${encodeURIComponent(`📚 *${nb.title}*\n${nb.link}`)}`} target="_blank" rel="noopener noreferrer"
              className="px-3 flex items-center justify-center rounded-xl border border-green-200 bg-green-50 text-green-600 hover:bg-green-100 transition">
              <MessageCircle size={14}/>
            </a>
            {isAdmin && (
              <button onClick={()=>onDelete(nb.id)} className="px-3 flex items-center justify-center rounded-xl border border-red-200 bg-red-50 text-red-500 hover:bg-red-100 transition">
                <Trash2 size={14}/>
              </button>
            )}
          </div>
        </div>
      </div>
      {showComments && <CommentsPanel notebook={nb} onClose={()=>setShowComments(false)}/>}
    </>
  );
}

function Skeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden animate-pulse">
      <div className="h-1 bg-slate-200"/>
      <div className="p-5 space-y-3">
        <div className="flex gap-3"><div className="w-8 h-8 rounded-xl bg-slate-200"/><div className="flex-1 space-y-2"><div className="h-3 bg-slate-200 rounded-full w-4/5"/><div className="h-3 bg-slate-200 rounded-full w-2/3"/></div></div>
        <div className="space-y-1.5"><div className="h-2.5 bg-slate-100 rounded-full"/><div className="h-2.5 bg-slate-100 rounded-full w-5/6"/></div>
        <div className="flex justify-between"><div className="h-6 w-24 bg-slate-200 rounded-full"/><div className="h-5 w-20 bg-slate-100 rounded-full"/></div>
      </div>
      <div className="px-5 pb-4"><div className="h-10 bg-slate-100 rounded-xl"/></div>
    </div>
  );
}

function Leaderboard({ notebooks, onClose }) {
  const ranking = useMemo(() => {
    const counts = {};
    notebooks.forEach(nb => { counts[nb.teacher] = (counts[nb.teacher]||0)+1; });
    return Object.entries(counts).sort((a,b)=>b[1]-a[1]).map(([name,count],i)=>({name,count,pos:i+1}));
  }, [notebooks]);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden" onClick={e=>e.stopPropagation()}>
        <div className="bg-gradient-to-br from-amber-400 to-orange-400 p-6 text-white flex items-start justify-between">
          <div><div className="flex items-center gap-2 mb-1"><Award size={20}/><span className="font-black text-lg">Tabla de Honor</span></div><p className="text-amber-100 text-sm">Docentes que más cuadernos han compartido</p></div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/20 transition"><X size={18}/></button>
        </div>
        <div className="p-5 space-y-3 max-h-80 overflow-y-auto">
          {ranking.length===0 ? <p className="text-center text-slate-400 text-sm py-8">Sin datos aún</p>
            : ranking.map(({name,count,pos})=>{
              const m=MEDAL[pos-1];
              return (
                <div key={name} className={`flex items-center gap-3 p-3 rounded-2xl border ${m?`${m.bg} ${m.border}`:"bg-slate-50 border-slate-100"}`}>
                  <div className="text-xl w-8 text-center">{m?m.icon:pos}</div>
                  <div className="flex-1"><p className={`font-bold text-sm ${m?m.text:"text-slate-700"}`}>{name}</p><p className="text-xs text-slate-400">{count} cuaderno{count!==1?"s":""}</p></div>
                  <div className="flex gap-0.5">{Array.from({length:Math.min(count,5)}).map((_,i)=><div key={i} className="w-2 h-6 rounded-full bg-slate-300" style={{opacity:0.4+i*0.12}}/>)}</div>
                </div>
              );
            })}
        </div>
        <div className="px-5 pb-5"><div className="bg-violet-50 border border-violet-100 rounded-2xl p-3 text-center text-xs text-violet-600 font-semibold">🎉 ¡Contribuye y aparece en el ranking!</div></div>
      </div>
    </div>
  );
}

function ContributeModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({ title:"", subject:"", customSubject:"", teacher:"", description:"", link:"" });
  const [status, setStatus] = useState("idle");
  const [errMsg, setErrMsg] = useState("");
  const set = (k,v) => setForm(f=>({...f,[k]:v}));
  const valid = form.title.trim() && form.subject && form.teacher.trim() && form.link.trim();

  const submit = async () => {
    if (!valid) return;
    setStatus("loading");
    try {
      await db.insertNotebook({
        title: form.title.trim(),
        subject: form.subject,
        custom_subject: form.customSubject.trim(),
        teacher: form.teacher.trim(),
        description: form.description.trim(),
        link: form.link.trim(),
        featured: false,
        approved: true, // publicación inmediata
      });
      setStatus("success");
      onSuccess?.();
    } catch(e) { setErrMsg(e.message); setStatus("error"); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden" onClick={e=>e.stopPropagation()}>

        {/* Header */}
        <div className="bg-gradient-to-br from-violet-500 to-blue-500 p-5 text-white flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-0.5"><Plus size={18}/><span className="font-black text-lg">Contribuir Cuaderno</span></div>
            <p className="text-violet-100 text-sm">Comparte tu NotebookLM con la comunidad</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/20 transition"><X size={18}/></button>
        </div>

        {/* Success */}
        {status === "success" ? (
          <div className="p-10 text-center">
            <CheckCircle2 size={52} className="text-emerald-500 mx-auto mb-4"/>
            <h3 className="font-black text-slate-800 text-xl mb-2">¡Cuaderno publicado!</h3>
            <p className="text-sm text-slate-500 mb-6">Tu cuaderno ya está visible en la galería para toda la comunidad. ¡Gracias por contribuir! 🎉</p>
            <button onClick={onClose} className="px-6 py-2.5 rounded-xl bg-violet-500 text-white font-bold text-sm hover:bg-violet-600 transition">Ver galería</button>
          </div>
        ) : (
          <div className="p-6 space-y-4">
            {status==="error" && (
              <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-xs">
                <AlertCircle size={14} className="flex-shrink-0 mt-0.5"/><span>{errMsg}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5">Título del cuaderno *</label>
              <input value={form.title} onChange={e=>set("title",e.target.value)}
                placeholder="Ej: Geometría Analítica para 3° Medio"
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300 transition"/>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5">Asignatura *</label>
                <select value={form.subject} onChange={e=>set("subject",e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300 transition bg-white">
                  <option value="">Selecciona...</option>
                  {SUBJECTS.filter(s=>s!=="Todos").map(s=><option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5">Tu nombre *</label>
                <input value={form.teacher} onChange={e=>set("teacher",e.target.value)}
                  placeholder="Ej: Ricky Valencia"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300 transition"/>
              </div>
            </div>

            {form.subject === "Otra" && (
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5">¿Cuál asignatura? *</label>
                <input value={form.customSubject} onChange={e=>set("customSubject",e.target.value)}
                  placeholder="Ej: Música, Economía, Robótica..."
                  className="w-full border border-violet-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300 transition"/>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5">Link de NotebookLM *</label>
              <input value={form.link} onChange={e=>set("link",e.target.value)}
                placeholder="https://notebooklm.google.com/notebook/..."
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300 transition"/>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5">Descripción breve</label>
              <textarea value={form.description} onChange={e=>set("description",e.target.value)} rows={2}
                placeholder="¿De qué trata este cuaderno? (opcional)"
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300 transition resize-none"/>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-700 flex items-center gap-2 font-semibold">
              <CheckCircle2 size={14} className="flex-shrink-0"/>
              Tu cuaderno se publicará de inmediato en la galería.
            </div>

            <div className="flex gap-3 pt-1">
              <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition">Cancelar</button>
              <button onClick={submit} disabled={!valid||status==="loading"}
                className="flex-1 py-2.5 rounded-xl bg-violet-500 hover:bg-violet-600 disabled:opacity-50 text-white text-sm font-bold transition flex items-center justify-center gap-2">
                {status==="loading" ? <><Loader2 size={14} className="animate-spin"/> Publicando...</> : <><Send size={14}/> Publicar</>}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Tarjeta de Prompt Visual ──────────────────────────────────────────────────
function PromptVisualCard({ item }) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const copy = () => { navigator.clipboard.writeText(item.prompt); setCopied(true); setTimeout(()=>setCopied(false),2000); };

  return (
    <div className={`rounded-2xl border overflow-hidden transition-all duration-300 ${item.color}`}>
      {/* Header */}
      <div className="p-4 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="text-3xl">{item.emoji}</div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-xs font-black px-2 py-0.5 rounded-full ${item.tagBg} ${item.tagText}`}>{item.number}</span>
              <span className={`text-xs font-medium ${item.descColor}`}>⏱ {item.time}</span>
              <span className={`text-xs font-medium ${item.descColor}`}>· {item.difficulty}</span>
            </div>
            <h3 className={`font-black text-base leading-tight ${item.textColor}`}>{item.name}</h3>
            <p className={`text-xs mt-0.5 ${item.descColor}`}>{item.when}</p>
          </div>
        </div>
      </div>

      {/* Tags */}
      <div className="px-4 pb-3 flex flex-wrap gap-1">
        {item.tags.map((t,i)=>(
          <span key={i} className={`text-xs px-2 py-0.5 rounded-full border ${item.tagBg} ${item.tagText} opacity-80 font-semibold`}>{t}</span>
        ))}
      </div>

      {/* Prompt expandible */}
      {expanded && (
        <div className="mx-4 mb-3 bg-black/30 rounded-xl p-3">
          <pre className={`text-xs leading-relaxed whitespace-pre-wrap font-mono ${item.textColor} opacity-90`}>{item.prompt}</pre>
        </div>
      )}

      {/* Actions */}
      <div className="px-4 pb-4 flex gap-2">
        <button onClick={()=>setExpanded(e=>!e)} className={`flex-1 py-2 rounded-xl border text-xs font-bold transition ${item.textColor} border-white/20 bg-white/10 hover:bg-white/20`}>
          {expanded ? "▲ Ocultar" : "▼ Ver prompt"}
        </button>
        <button onClick={copy} className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${item.tagBg} ${item.tagText} hover:opacity-90`}>
          {copied ? "✅ Copiado" : "📋 Copiar"}
        </button>
      </div>
    </div>
  );
}

function ContributePromptModal({ onClose }) {
  const [form,setForm]=useState({category:"",prompt:"",author:""});
  const [status,setStatus]=useState("idle");
  const set=(k,v)=>setForm(f=>({...f,[k]:v}));
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden" onClick={e=>e.stopPropagation()}>
        <div className="bg-gradient-to-br from-amber-400 to-orange-400 p-5 text-white flex items-start justify-between">
          <div><h3 className="font-black text-lg">Aportar Prompt</h3><p className="text-amber-100 text-sm">Comparte tu estilo visual con la comunidad</p></div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/20 transition"><X size={18}/></button>
        </div>
        {status==="success"?(
          <div className="p-10 text-center">
            <CheckCircle2 size={48} className="text-emerald-500 mx-auto mb-4"/>
            <h3 className="font-black text-slate-800 text-xl mb-2">¡Gracias!</h3>
            <p className="text-sm text-slate-500 mb-6">Tu prompt fue recibido y será revisado antes de publicarse.</p>
            <button onClick={onClose} className="px-6 py-2.5 rounded-xl bg-amber-500 text-white font-bold text-sm hover:bg-amber-600 transition">Cerrar</button>
          </div>
        ):(
          <div className="p-6 space-y-4">
            <div><label className="block text-xs font-bold text-slate-500 mb-1">Nombre del estilo</label><input value={form.category} onChange={e=>set("category",e.target.value)} placeholder="Ej: Retro Neon, Acuarela Pastel..." className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 transition"/></div>
            <div><label className="block text-xs font-bold text-slate-500 mb-1">Tu Prompt *</label><textarea value={form.prompt} onChange={e=>set("prompt",e.target.value)} rows={5} placeholder="Pega aquí tu prompt visual..." className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 transition resize-none font-mono"/></div>
            <div><label className="block text-xs font-bold text-slate-500 mb-1">Tu nombre</label><input value={form.author} onChange={e=>set("author",e.target.value)} placeholder="Ej: Ricky Valencia" className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 transition"/></div>
            <div className="flex gap-3">
              <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold">Cancelar</button>
              <button onClick={()=>setStatus("success")} disabled={!form.prompt.trim()} className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white text-sm font-bold transition flex items-center justify-center gap-2"><Send size={14}/> Enviar</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function App() {
  const { notebooks, loading, error, reload, setNotebooks } = useNotebooks();
  const [search, setSearch]                   = useState("");
  const [activeSubject, setActiveSubject]     = useState("Todos");
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showContribute, setShowContribute]   = useState(false);
  const [showContributePrompt, setShowContributePrompt] = useState(false);
  const [activeTab, setActiveTab]             = useState("cuadernos");
  const [sidebarOpen, setSidebarOpen]         = useState(true);
  const [isAdmin, setIsAdmin]                 = useState(false);
  const [adminInput, setAdminInput]           = useState("");
  const [showAdminLogin, setShowAdminLogin]   = useState(false);
  const [complementFilter, setComplementFilter] = useState("todos");

  const filtered = useMemo(() => notebooks.filter(nb => {
    const matchSubject = activeSubject==="Todos" || nb.subject===activeSubject;
    const q = search.toLowerCase();
    return matchSubject && (!q || nb.title?.toLowerCase().includes(q) || nb.teacher?.toLowerCase().includes(q));
  }), [notebooks, search, activeSubject]);

  const totalTeachers = useMemo(()=>new Set(notebooks.map(n=>n.teacher)).size,[notebooks]);

  const handleDelete = async (id) => {
    if (!confirm("¿Borrar este cuaderno?")) return;
    await db.deleteNotebook(id);
    setNotebooks(prev=>prev.filter(nb=>nb.id!==id));
  };

  const handleLike = async (id, currentLikes) => { await db.likeNotebook(id, currentLikes); };

  const handleAdminLogin = () => {
    if (adminInput===ADMIN_PASSWORD) { setIsAdmin(true); setShowAdminLogin(false); setAdminInput(""); }
    else alert("Contraseña incorrecta");
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col">

      {/* HEADER */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button onClick={()=>setSidebarOpen(o=>!o)} className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 transition hidden lg:flex">
              <Menu size={18}/>
            </button>
            <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-blue-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow">
              <BookOpen size={18} className="text-white"/>
            </div>
            <div className="hidden sm:block">
              <h1 className="font-black text-slate-800 text-base leading-tight">NotebookLM Library</h1>
              <p className="text-xs text-slate-400">Repositorio de cuadernos colaborativos</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={reload} disabled={loading} className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 transition disabled:opacity-40">
              <RefreshCw size={15} className={loading?"animate-spin":""}/>
            </button>
            {isAdmin
              ? <span className="text-xs bg-green-100 text-green-700 font-bold px-3 py-1.5 rounded-xl border border-green-200">👑 Admin</span>
              : <button onClick={()=>setShowAdminLogin(true)} className="text-xs text-slate-400 hover:text-slate-600 transition px-2 py-1">Admin</button>
            }
            <button onClick={()=>setShowLeaderboard(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 border border-amber-100 text-amber-700 text-xs font-bold hover:bg-amber-100 transition">
              <Award size={14}/><span className="hidden sm:inline">Ranking</span>
            </button>
            <button onClick={()=>setShowContribute(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-violet-500 text-white text-xs font-bold hover:bg-violet-600 transition shadow-sm">
              <Plus size={14}/> Contribuir
            </button>
          </div>
        </div>
      </header>

      {/* FRASE */}
      <div className="bg-gradient-to-r from-violet-600 to-blue-600 text-white py-3 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-3">
          <Quote size={14} className="text-violet-200 flex-shrink-0"/>
          <p className="text-xs sm:text-sm font-medium text-center text-violet-50">"El conocimiento que no se comparte se estanca. El que se comparte, crece y transforma."</p>
          <Quote size={14} className="text-violet-200 flex-shrink-0 rotate-180"/>
        </div>
      </div>

      {/* BODY */}
      <div className="flex flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 pt-6 gap-6">

        {/* SIDEBAR */}
        <aside className={`${sidebarOpen?"w-52 flex-shrink-0":"w-0 overflow-hidden"} transition-all duration-300 hidden lg:block`}>
          <div className="sticky top-24 space-y-1">
            <p className="text-xs font-black text-slate-400 uppercase tracking-wider px-3 mb-3">Asignaturas</p>
            {SUBJECTS.map(sub=>{
              const c=SC[sub];
              const active=activeSubject===sub&&activeTab==="cuadernos";
              return (
                <button key={sub} onClick={()=>{setActiveSubject(sub);setActiveTab("cuadernos");}}
                  className={`w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition font-medium ${active?"bg-violet-100 text-violet-700 font-bold":"text-slate-600 hover:bg-slate-100"}`}>
                  {c&&<span className={`w-2 h-2 rounded-full ${c.dot} flex-shrink-0`}/>}
                  <span className="truncate">{sub}</span>
                  {active&&<ChevronRight size={12} className="ml-auto text-violet-500"/>}
                </button>
              );
            })}
            <div className="pt-4 border-t border-slate-200 mt-2 space-y-1">
              {[{id:"cuadernos",label:"📚 Cuadernos"},{id:"complementos",label:"⚡ Complementos"},{id:"prompts",label:"💡 Prompts"}].map(t=>(
                <button key={t.id} onClick={()=>setActiveTab(t.id)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-sm transition font-medium ${activeTab===t.id?"bg-slate-800 text-white":"text-slate-600 hover:bg-slate-100"}`}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* MAIN */}
        <div className="flex-1 min-w-0 pb-16">
          <div className="mb-6">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-800 leading-tight">Cuadernos de NotebookLM</h2>
            <p className="text-slate-500 text-sm mt-1">Repositorio de cuadernos colaborativos para docentes</p>
          </div>

          {/* STATS */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              {label:"Cuadernos",value:loading?"…":notebooks.length,icon:BookMarked,color:"text-blue-500",bg:"bg-blue-50"},
              {label:"Docentes",value:loading?"…":totalTeachers,icon:Users,color:"text-emerald-500",bg:"bg-emerald-50"},
              {label:"Asignaturas",value:SUBJECTS.length-1,icon:Star,color:"text-amber-500",bg:"bg-amber-50"},
            ].map(({label,value,icon:Icon,color,bg})=>(
              <div key={label} className="bg-white rounded-2xl border border-slate-100 p-4 flex flex-col items-center text-center shadow-sm">
                <div className={`${bg} ${color} p-2 rounded-xl mb-2`}><Icon size={16}/></div>
                <p className="font-black text-slate-800 text-2xl leading-tight">{value}</p>
                <p className="text-xs text-slate-400 font-medium">{label}</p>
              </div>
            ))}
          </div>

          {/* TABS móvil */}
          <div className="flex gap-1 mb-5 border-b border-slate-200 lg:hidden overflow-x-auto">
            {[{id:"cuadernos",label:"📚 Cuadernos"},{id:"complementos",label:"⚡ Complementos"},{id:"prompts",label:"💡 Prompts"}].map(t=>(
              <button key={t.id} onClick={()=>setActiveTab(t.id)}
                className={`flex-shrink-0 px-4 py-2.5 text-sm font-bold transition border-b-2 -mb-px ${activeTab===t.id?"text-violet-600 border-violet-500":"text-slate-500 border-transparent"}`}>
                {t.label}
              </button>
            ))}
          </div>

          {/* ── CUADERNOS ── */}
          {activeTab==="cuadernos"&&(
            <>
              <div className="relative mb-5">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"/>
                <input value={search} onChange={e=>setSearch(e.target.value)} className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 bg-white text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-300 transition shadow-sm" placeholder="Buscar cuadernos o docentes..."/>
                {search&&<button onClick={()=>setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded-full transition"><X size={14} className="text-slate-400"/></button>}
              </div>
              {error&&!loading&&<div className="mb-6 flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl p-4 text-red-700"><AlertCircle size={18} className="flex-shrink-0 mt-0.5"/><div><p className="font-bold text-sm mb-1">Error de conexión</p><p className="text-xs opacity-80 mb-2">{error}</p><button onClick={reload} className="text-xs font-bold underline">Reintentar</button></div></div>}
              {loading&&<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">{Array.from({length:6}).map((_,i)=><Skeleton key={i}/>)}</div>}
              {!loading&&!error&&filtered.length===0&&<div className="text-center py-20"><div className="text-5xl mb-4">🔍</div><h3 className="font-bold text-slate-600 mb-1">Sin resultados</h3><p className="text-sm text-slate-400">Prueba con otro término</p><button onClick={()=>{setSearch("");setActiveSubject("Todos");}} className="mt-4 text-xs text-violet-500 font-semibold hover:underline">Limpiar filtros</button></div>}
              {!loading&&!error&&filtered.length>0&&(
                <>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm text-slate-400 font-medium"><span className="text-slate-700 font-bold">{filtered.length}</span> cuaderno{filtered.length!==1?"s":""}</p>
                    {(search||activeSubject!=="Todos")&&<button onClick={()=>{setSearch("");setActiveSubject("Todos");}} className="text-xs text-violet-500 font-semibold hover:underline flex items-center gap-1"><X size={12}/> Limpiar</button>}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filtered.map(nb=><NotebookCard key={nb.id} nb={nb} isAdmin={isAdmin} onDelete={handleDelete} onLike={handleLike}/>)}
                  </div>
                </>
              )}
              <div className="mt-10 bg-gradient-to-r from-violet-50 to-blue-50 border border-violet-100 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                <div className="text-4xl">📚</div>
                <div className="flex-1"><h3 className="font-black text-slate-800 mb-1">¿Tienes un NotebookLM que compartir?</h3><p className="text-sm text-slate-500">Apórtalo a la biblioteca y ayuda a otros docentes.</p></div>
                <button onClick={()=>setShowContribute(true)} className="flex-shrink-0 flex items-center gap-2 px-5 py-3 rounded-2xl bg-violet-500 text-white font-bold text-sm hover:bg-violet-600 transition shadow">Contribuir <ChevronRight size={16}/></button>
              </div>
            </>
          )}

          {/* ── COMPLEMENTOS ── */}
          {activeTab==="complementos"&&(
            <div>
              <div className="mb-5"><h2 className="font-black text-slate-800 text-xl flex items-center gap-2"><Zap size={20} className="text-amber-500"/> Complementos para NotebookLM</h2><p className="text-sm text-slate-500 mt-0.5">Herramientas web y plugins de Chrome para potenciar tu experiencia.</p></div>
              <div className="flex gap-2 mb-5">
                {[{id:"todos",label:"Todos"},{id:"web",label:"🌐 Herramientas Web"},{id:"chrome",label:"🔌 Plugins Chrome"}].map(f=>(
                  <button key={f.id} onClick={()=>setComplementFilter(f.id)}
                    className={`px-4 py-2 rounded-full text-xs font-bold border transition ${complementFilter===f.id?"bg-slate-800 text-white border-slate-800":"bg-white text-slate-600 border-slate-200 hover:border-slate-300"}`}>
                    {f.label}
                  </button>
                ))}
              </div>
              {complementFilter!=="web"&&(
                <div className="mb-3 flex items-center gap-2">
                  <Chrome size={15} className="text-slate-500"/>
                  <p className="text-xs text-slate-500 font-semibold">Plugins de Chrome — instala directamente desde la Chrome Web Store</p>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {COMPLEMENTOS.filter(c=>complementFilter==="todos"||c.type===complementFilter).map(c=>(
                  <div key={c.name} className={`rounded-2xl border p-5 flex flex-col gap-3 ${c.color}`}>
                    <div className="flex items-start gap-3">
                      <span className="text-3xl flex-shrink-0">{c.icon}</span>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-black text-slate-800 text-sm leading-tight">{c.name}</h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          {c.type==="chrome"&&<span className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full font-bold flex items-center gap-1 w-fit"><Chrome size={10}/> Chrome</span>}
                          {c.rating&&<span className="text-xs text-slate-500 font-semibold">{c.rating}</span>}
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed flex-1">{c.desc}</p>
                    <a href={c.link} target="_blank" rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition">
                      {c.type==="chrome"?<><Chrome size={14}/> Instalar en Chrome</>:<><Link2 size={14}/> Abrir herramienta</>} <ExternalLink size={12} className="opacity-50"/>
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── PROMPTS ── */}
          {activeTab==="prompts"&&(
            <div>
              <div className="mb-2 flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-black text-slate-800 text-xl flex items-center gap-2"><Lightbulb size={20} className="text-violet-500"/> Prompts de Estilo Visual</h2>
                  <p className="text-sm text-slate-500 mt-0.5">Personaliza el estilo visual de tus contenidos en NotebookLM. Copia el prompt y úsalo en tu cuaderno.</p>
                </div>
                <button onClick={()=>setShowContributePrompt(true)} className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500 text-white text-xs font-bold hover:bg-amber-600 transition">
                  <Plus size={14}/> Aportar
                </button>
              </div>

              <div className="bg-violet-50 border border-violet-200 rounded-2xl p-4 mb-6 flex items-start gap-3">
                <span className="text-2xl">🎨</span>
                <div>
                  <p className="text-sm font-bold text-violet-800">¿Cómo usar estos prompts?</p>
                  <p className="text-xs text-violet-600 mt-0.5">Abre tu cuaderno en NotebookLM → escribe en el chat → pega el prompt y describe tu contenido. El estilo visual se aplicará automáticamente a tu infografía.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {PROMPTS_BASE.map(p=><PromptVisualCard key={p.id} item={p}/>)}
              </div>

              <div className="mt-6 bg-slate-800 rounded-2xl p-5 text-center">
                <p className="text-sm font-bold text-white mb-1">💡 ¿Tienes un estilo visual propio?</p>
                <p className="text-xs text-slate-400 mb-3">Comparte tu prompt y será revisado para publicarse en la colección.</p>
                <button onClick={()=>setShowContributePrompt(true)} className="px-5 py-2.5 rounded-xl bg-violet-500 text-white font-bold text-sm hover:bg-violet-600 transition inline-flex items-center gap-2"><Plus size={14}/> Aportar mi prompt</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* FOOTER */}
      <footer className="border-t border-slate-100 bg-white py-8 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-2 text-center">
          <p className="text-xs text-slate-400">NotebookLM Library · Comunidad docente colaborativa · Chile</p>
          <p className="text-sm font-bold text-slate-600">💡 Idea por <span className="text-violet-600">Ricardo Valencia</span> · Encargado de Innovación del Liceo Bicentenario San José UR</p>
          <p className="text-xs text-slate-300">Hecho con <span className="text-red-400">♥</span> para transformar la educación</p>
        </div>
      </footer>

      {/* ADMIN LOGIN */}
      {showAdminLogin&&(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" onClick={()=>setShowAdminLogin(false)}>
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-xs" onClick={e=>e.stopPropagation()}>
            <h3 className="font-black text-slate-800 mb-1">Acceso Admin</h3>
            <p className="text-xs text-slate-400 mb-4">Ingresa la contraseña de administrador</p>
            <input type="password" value={adminInput} onChange={e=>setAdminInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleAdminLogin()} placeholder="Contraseña..." className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300 transition mb-3"/>
            <div className="flex gap-2">
              <button onClick={()=>setShowAdminLogin(false)} className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold">Cancelar</button>
              <button onClick={handleAdminLogin} className="flex-1 py-2 rounded-xl bg-violet-500 text-white text-sm font-bold hover:bg-violet-600 transition">Entrar</button>
            </div>
          </div>
        </div>
      )}

      {showLeaderboard      &&<Leaderboard notebooks={notebooks} onClose={()=>setShowLeaderboard(false)}/>}
      {showContribute       &&<ContributeModal onClose={()=>setShowContribute(false)} onSuccess={()=>{ setShowContribute(false); reload(); }}/>}
      {showContributePrompt &&<ContributePromptModal onClose={()=>setShowContributePrompt(false)}/>}
    </div>
  );
}
