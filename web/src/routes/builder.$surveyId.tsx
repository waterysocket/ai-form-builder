import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import {
  ArrowLeft, Eye, Share2, MoreHorizontal, Check, Plus, GripVertical,
  Trash2, Copy, ArrowUp, ArrowDown, X, Sparkles, Send, Loader2,
  MessageSquare, Wand2, ChevronLeft,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSurveyStore, type Question, type QuestionType } from "@/lib/store";

export const Route = createFileRoute("/builder/$surveyId")({
  head: () => ({ meta: [{ title: "Editor — FormCraft" }] }),
  component: BuilderPage,
});

const TYPES: { v: QuestionType; label: string; icon: string }[] = [
  { v: "short-text", label: "Short Text", icon: "✏️" },
  { v: "long-text", label: "Long Text", icon: "📝" },
  { v: "multiple-choice", label: "Multiple Choice", icon: "⚪" },
  { v: "checkboxes", label: "Checkboxes", icon: "☑️" },
  { v: "rating", label: "Rating", icon: "⭐" },
  { v: "number", label: "Number", icon: "#️⃣" },
  { v: "dropdown", label: "Dropdown", icon: "▾" },
  { v: "date", label: "Date", icon: "📅" },
];

const PRESETS = [
  { name: "FormCraft", primaryColor: "#E3EF26", backgroundColor: "#06231D", cardColor: "#0C342C", textColor: "#FFFDEE" },
  { name: "Midnight", primaryColor: "#6C63FF", backgroundColor: "#0D0D14", cardColor: "#13131F", textColor: "#F0F0FF" },
  { name: "Clean White", primaryColor: "#111827", backgroundColor: "#FFFFFF", cardColor: "#F9FAFB", textColor: "#111827" },
  { name: "Forest Green", primaryColor: "#22C55E", backgroundColor: "#0A1A12", cardColor: "#10261A", textColor: "#E8F5EE" },
  { name: "Ocean Blue", primaryColor: "#3B82F6", backgroundColor: "#0A1424", cardColor: "#101F35", textColor: "#E8EFFC" },
  { name: "Sunset Coral", primaryColor: "#FF6584", backgroundColor: "#180D14", cardColor: "#28131C", textColor: "#FFE8EE" },
];

function BuilderPage() {
  const { surveyId } = useParams({ from: "/builder/$surveyId" });
  const navigate = useNavigate();
  const survey = useSurveyStore((s) => s.surveys.find((x) => x.id === surveyId));
  const update = useSurveyStore((s) => s.updateSurvey);

  const [tab, setTab] = useState<"questions" | "style" | "settings">("questions");
  const [selected, setSelected] = useState<string | null>(null);
  const [aiOpen, setAiOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState(false);
  const [saving, setSaving] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (editingTitle) titleRef.current?.focus(); }, [editingTitle]);

  useEffect(() => { if (!survey) navigate({ to: "/builder/dashboard" }); }, [survey, navigate]);

  const showToast = (m: string) => { setToast(m); setTimeout(() => setToast(null), 2500); };

  if (!survey) return null;

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => { setSaving(false); showToast("Survey saved"); }, 600);
  };

  const handleShare = () => {
    const url = `${window.location.origin}/s/${survey.publicId}`;
    navigator.clipboard?.writeText(url);
    showToast("Link copied!");
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface-base text-text-primary">
      {/* TOP NAV */}
      <header className="h-14 border-b border-border-subtle flex items-center px-4 gap-3 glass z-30">
        <Link to="/builder/dashboard" className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-brand transition">
          <ArrowLeft className="w-4 h-4" /> Dashboard
        </Link>
        <div className="h-5 w-px bg-border-subtle" />
        {editingTitle ? (
          <input ref={titleRef} value={survey.title}
            onChange={(e) => update(survey.id, { title: e.target.value })}
            onBlur={() => setEditingTitle(false)}
            onKeyDown={(e) => e.key === "Enter" && setEditingTitle(false)}
            className="bg-surface-elevated border border-brand outline-none px-3 py-1.5 rounded-lg text-sm font-medium min-w-[200px]" />
        ) : (
          <button onClick={() => setEditingTitle(true)} className="text-sm font-semibold px-2 py-1 rounded-lg hover:bg-surface-elevated transition">
            {survey.title}
          </button>
        )}
        <div className="ml-auto flex items-center gap-2">
          <a href={`/s/${survey.publicId}`} target="_blank" rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm btn-outline">
            <Eye className="w-3.5 h-3.5" /> Preview
          </a>
          <button onClick={handleShare} className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm btn-brand">
            <Share2 className="w-3.5 h-3.5" /> Share
          </button>
          <button onClick={handleSave} className="p-1.5 rounded-lg hover:bg-surface-elevated text-text-secondary transition">
            <MoreHorizontal className="w-4 h-4" />
          </button>
          <div className="ml-2 text-xs text-text-muted flex items-center gap-1.5 min-w-[68px]">
            {saving ? <><Loader2 className="w-3 h-3 animate-spin" /> Saving...</> : <><Check className="w-3 h-3 text-brand" /> Saved</>}
          </div>
        </div>
      </header>

      <div className="flex flex-1 min-h-0">
        {/* LEFT SIDEBAR */}
        <aside className="w-[280px] border-r border-border-subtle bg-surface-raised flex flex-col">
          {selected ? (
            <ConfigPanel surveyId={survey.id} qid={selected} onBack={() => setSelected(null)} />
          ) : (
            <>
              <div className="p-3 flex gap-1 border-b border-border-subtle">
                {(["questions", "style", "settings"] as const).map((t) => (
                  <button key={t} onClick={() => setTab(t)}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg capitalize transition ${tab === t ? "bg-brand text-surface-base" : "text-text-secondary hover:text-text-primary hover:bg-surface-elevated"}`}>{t}</button>
                ))}
              </div>
              <div className="flex-1 overflow-y-auto">
                {tab === "questions" && <QuestionsPanel surveyId={survey.id} onSelect={setSelected} showToast={showToast} />}
                {tab === "style" && <StylePanel surveyId={survey.id} showToast={showToast} />}
                {tab === "settings" && <SettingsPanel surveyId={survey.id} />}
              </div>
            </>
          )}
        </aside>

        {/* CANVAS */}
        <main className="flex-1 overflow-auto relative" style={{ background: survey.style.backgroundColor, color: survey.style.textColor }}>
          <Canvas survey={survey} selected={selected} onSelect={setSelected} />
          {/* AI floating btn */}
          {!aiOpen && (
            <button onClick={() => setAiOpen(true)}
              className="fixed right-0 top-1/2 -translate-y-1/2 btn-brand px-3 py-4 rounded-l-xl shadow-brand-glow flex flex-col items-center gap-2 text-xs font-bold z-20"
              style={{ writingMode: "vertical-rl" }}>
              <Sparkles className="w-4 h-4" />
              AI Assistant
            </button>
          )}
        </main>

        {/* AI PANEL */}
        {aiOpen && <AIPanel surveyId={survey.id} onClose={() => setAiOpen(false)} />}
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 px-4 py-3 rounded-xl glass border-brand/30 text-sm shadow-2xl flex items-center gap-2 z-50 text-text-primary">
          <Check className="w-4 h-4 text-brand" /> {toast}
        </div>
      )}
    </div>
  );
}

// ============ QUESTIONS PANEL ============
function QuestionsPanel({ surveyId, onSelect, showToast }: { surveyId: string; onSelect: (id: string) => void; showToast: (m: string) => void }) {
  const survey = useSurveyStore((s) => s.surveys.find((x) => x.id === surveyId))!;
  const { addQuestion, removeQuestion, duplicateQuestion, moveQuestion, updateSurvey } = useSurveyStore();
  const [addOpen, setAddOpen] = useState(false);
  const [menuId, setMenuId] = useState<string | null>(null);

  return (
    <div className="p-3 space-y-3">
      <div className="relative">
        <button onClick={() => setAddOpen(!addOpen)}
          className="w-full py-2.5 rounded-lg border border-dashed border-border-strong hover:border-brand hover:bg-brand/5 text-sm text-text-secondary hover:text-text-primary inline-flex items-center justify-center gap-2 transition">
          <Plus className="w-4 h-4" /> Add Question
        </button>
        {addOpen && (
          <div className="absolute top-full mt-1.5 left-0 right-0 z-20 bg-surface-elevated border border-border-strong rounded-lg shadow-xl py-1 grid grid-cols-2 gap-0.5">
            {TYPES.map((t) => (
              <button key={t.v} onClick={() => { addQuestion(surveyId, t.v); setAddOpen(false); showToast("Question added"); }}
                className="px-2 py-2 text-xs text-left hover:bg-surface-raised rounded flex items-center gap-1.5">
                <span>{t.icon}</span> {t.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-1.5">
        {survey.questions.length === 0 && (
          <div className="text-center py-8 text-xs text-text-muted">No questions yet.</div>
        )}
        {survey.questions.map((q, i) => (
          <div key={q.id} className="relative">
            <button onClick={() => onSelect(q.id)}
              className="w-full group flex items-center gap-2 p-2.5 rounded-lg bg-surface-elevated border border-border-subtle hover:border-border-strong text-left">
              <GripVertical className="w-3.5 h-3.5 text-text-muted shrink-0" />
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-brand/15 text-brand shrink-0">Q{i + 1}</span>
              <span className="flex-1 text-xs text-text-primary truncate">{q.text}</span>
              <button onClick={(e) => { e.stopPropagation(); setMenuId(menuId === q.id ? null : q.id); }}
                className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-text-primary">
                <MoreHorizontal className="w-3.5 h-3.5" />
              </button>
            </button>
            {menuId === q.id && (
              <div className="absolute right-2 top-full z-20 mt-1 w-36 bg-surface-elevated border border-border-strong rounded-lg shadow-xl py-1 text-xs">
                <Mi onClick={() => { duplicateQuestion(surveyId, q.id); setMenuId(null); }} icon={<Copy className="w-3 h-3" />}>Duplicate</Mi>
                <Mi onClick={() => { moveQuestion(surveyId, q.id, -1); setMenuId(null); }} icon={<ArrowUp className="w-3 h-3" />}>Move Up</Mi>
                <Mi onClick={() => { moveQuestion(surveyId, q.id, 1); setMenuId(null); }} icon={<ArrowDown className="w-3 h-3" />}>Move Down</Mi>
                <Mi onClick={() => { removeQuestion(surveyId, q.id); setMenuId(null); }} icon={<Trash2 className="w-3 h-3" />} danger>Delete</Mi>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="pt-3 border-t border-border-subtle">
        <div className="text-[10px] uppercase tracking-wider text-text-muted mb-2">Layout Mode</div>
        <div className="grid grid-cols-2 gap-1.5">
          {(["paginated", "scrollable"] as const).map((m) => (
            <button key={m} onClick={() => updateSurvey(surveyId, { layoutMode: m })}
              className={`p-2.5 rounded-lg border text-xs capitalize ${survey.layoutMode === m ? "border-brand bg-brand/10 text-text-primary" : "border-border-subtle text-text-secondary hover:border-border-strong"}`}>
              {m === "paginated" ? "📄 Paginated" : "📜 Scrollable"}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function Mi({ children, onClick, icon, danger }: any) {
  return <button onClick={onClick} className={`w-full px-2.5 py-1.5 text-left flex items-center gap-2 hover:bg-surface-raised ${danger ? "text-danger" : "text-text-secondary"}`}>{icon} {children}</button>;
}

// ============ CONFIG PANEL ============
function ConfigPanel({ surveyId, qid, onBack }: { surveyId: string; qid: string; onBack: () => void }) {
  const survey = useSurveyStore((s) => s.surveys.find((x) => x.id === surveyId))!;
  const updateQuestion = useSurveyStore((s) => s.updateQuestion);
  const q = survey.questions.find((x) => x.id === qid);
  if (!q) return <div className="p-4"><button onClick={onBack} className="text-sm text-brand">← Back</button></div>;

  const u = (patch: Partial<Question>) => updateQuestion(surveyId, qid, patch);

  return (
    <div className="p-4 space-y-4 overflow-y-auto h-full">
      <button onClick={onBack} className="inline-flex items-center gap-1 text-xs text-text-secondary hover:text-text-primary">
        <ChevronLeft className="w-3.5 h-3.5" /> Back to questions
      </button>
      <FieldLabel label="Question Type">
        <select value={q.type} onChange={(e) => u({ type: e.target.value as QuestionType })}
          className="w-full px-3 py-2 rounded-lg bg-surface-elevated border border-border-subtle focus:border-brand outline-none text-xs">
          {TYPES.map((t) => <option key={t.v} value={t.v}>{t.label}</option>)}
        </select>
      </FieldLabel>
      <FieldLabel label="Question Text">
        <textarea value={q.text} onChange={(e) => u({ text: e.target.value })}
          rows={2}
          className="w-full px-3 py-2 rounded-lg bg-surface-elevated border border-border-subtle focus:border-brand outline-none text-xs resize-none" />
      </FieldLabel>
      <div className="flex items-center justify-between">
        <span className="text-xs text-text-secondary">Required</span>
        <Toggle on={!!q.required} onChange={(v) => u({ required: v })} />
      </div>

      {(q.type === "multiple-choice" || q.type === "checkboxes" || q.type === "dropdown") && (
        <FieldLabel label="Options">
          <div className="space-y-1.5">
            {(q.options ?? []).map((opt, i) => (
              <div key={i} className="flex gap-1.5">
                <input value={opt}
                  onChange={(e) => {
                    const next = [...(q.options ?? [])]; next[i] = e.target.value; u({ options: next });
                  }}
                  className="flex-1 px-2.5 py-1.5 rounded-md bg-surface-elevated border border-border-subtle focus:border-brand outline-none text-xs" />
                <button onClick={() => u({ options: (q.options ?? []).filter((_, j) => j !== i) })}
                  className="p-1.5 rounded text-text-muted hover:text-danger"><X className="w-3.5 h-3.5" /></button>
              </div>
            ))}
            <button onClick={() => u({ options: [...(q.options ?? []), `Option ${(q.options?.length ?? 0) + 1}`] })}
              className="w-full py-1.5 rounded-md border border-dashed border-border-strong text-xs text-text-secondary hover:text-text-primary hover:border-brand">
              + Add option
            </button>
          </div>
        </FieldLabel>
      )}

      {q.type === "rating" && (
        <>
          <div className="grid grid-cols-2 gap-2">
            <FieldLabel label="Min label">
              <input value={q.minLabel ?? ""} onChange={(e) => u({ minLabel: e.target.value })} className="w-full px-2.5 py-1.5 rounded-md bg-surface-elevated border border-border-subtle focus:border-brand outline-none text-xs" />
            </FieldLabel>
            <FieldLabel label="Max label">
              <input value={q.maxLabel ?? ""} onChange={(e) => u({ maxLabel: e.target.value })} className="w-full px-2.5 py-1.5 rounded-md bg-surface-elevated border border-border-subtle focus:border-brand outline-none text-xs" />
            </FieldLabel>
          </div>
          <FieldLabel label="Scale">
            <div className="grid grid-cols-2 gap-1.5">
              {[5, 10].map((s) => (
                <button key={s} onClick={() => u({ scale: s as 5 | 10 })}
                  className={`py-1.5 rounded-md text-xs ${q.scale === s ? "bg-brand text-white" : "bg-surface-elevated text-text-secondary border border-border-subtle"}`}>1–{s}</button>
              ))}
            </div>
          </FieldLabel>
        </>
      )}
    </div>
  );
}

function FieldLabel({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[10px] uppercase tracking-wider text-text-muted mb-1.5 font-medium">{label}</label>
      {children}
    </div>
  );
}

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!on)} className={`relative w-9 h-5 rounded-full transition ${on ? "bg-brand" : "bg-surface-elevated border border-border-subtle"}`}>
      <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition ${on ? "translate-x-4" : ""}`} />
    </button>
  );
}

// ============ STYLE PANEL ============
function StylePanel({ surveyId, showToast }: { surveyId: string; showToast: (m: string) => void }) {
  const survey = useSurveyStore((s) => s.surveys.find((x) => x.id === surveyId))!;
  const setStyle = useSurveyStore((s) => s.setStyle);
  const [aiPrompt, setAiPrompt] = useState("");
  const [generating, setGenerating] = useState(false);

  const generateStyle = () => {
    setGenerating(true);
    setTimeout(() => {
      const picks = [
        { primaryColor: "#F59E0B", backgroundColor: "#1A1208", cardColor: "#2A1D0E", textColor: "#FFF8E8", preset: "Custom AI" },
        { primaryColor: "#06B6D4", backgroundColor: "#0A1820", cardColor: "#10242E", textColor: "#E8F8FE", preset: "Custom AI" },
        { primaryColor: "#D946EF", backgroundColor: "#170A1E", cardColor: "#251030", textColor: "#FCE8FE", preset: "Custom AI" },
      ];
      setStyle(surveyId, picks[Math.floor(Math.random() * picks.length)]);
      setGenerating(false);
      showToast("Style applied");
    }, 1500);
  };

  return (
    <div className="p-4 space-y-5">
      <div>
        <div className="text-[10px] uppercase tracking-wider text-text-muted mb-2 font-medium">Presets</div>
        <div className="grid grid-cols-2 gap-2">
          {PRESETS.map((p) => (
            <button key={p.name} onClick={() => setStyle(surveyId, p)}
              className={`rounded-lg border overflow-hidden text-left transition ${survey.style.preset === p.name ? "border-brand ring-1 ring-brand" : "border-border-subtle hover:border-border-strong"}`}>
              <div className="h-12 p-2" style={{ background: p.backgroundColor }}>
                <div className="h-2 w-12 rounded" style={{ background: p.primaryColor }} />
                <div className="mt-1 h-1.5 w-16 rounded opacity-60" style={{ background: p.textColor }} />
              </div>
              <div className="px-2 py-1.5 text-[11px] font-medium bg-surface-elevated">{p.name}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <div className="text-[10px] uppercase tracking-wider text-text-muted font-medium">Brand</div>
        <ColorRow label="Primary Color" value={survey.style.primaryColor} onChange={(v) => setStyle(surveyId, { primaryColor: v })} />
        <ColorRow label="Background" value={survey.style.backgroundColor} onChange={(v) => setStyle(surveyId, { backgroundColor: v })} />
      </div>

      <div className="space-y-3">
        <div className="text-[10px] uppercase tracking-wider text-text-muted font-medium">Typography</div>
        <FieldLabel label="Font Family">
          <select value={survey.style.fontFamily} onChange={(e) => setStyle(surveyId, { fontFamily: e.target.value })}
            className="w-full px-3 py-2 rounded-lg bg-surface-elevated border border-border-subtle focus:border-brand outline-none text-xs">
            {["Inter", "Playfair", "Space Grotesk", "DM Sans", "Sora"].map((f) => <option key={f}>{f}</option>)}
          </select>
        </FieldLabel>
        <FieldLabel label="Question Size">
          <div className="grid grid-cols-3 gap-1.5">
            {(["S", "M", "L"] as const).map((s) => (
              <button key={s} onClick={() => setStyle(surveyId, { questionSize: s })}
                className={`py-1.5 rounded-md text-xs ${survey.style.questionSize === s ? "bg-brand text-white" : "bg-surface-elevated text-text-secondary border border-border-subtle"}`}>{s}</button>
            ))}
          </div>
        </FieldLabel>
      </div>

      <div className="p-3 rounded-xl glass border-brand/30 space-y-2.5">
        <div className="flex items-center gap-1.5">
          <span className="px-2 py-0.5 rounded-full bg-brand/15 text-brand text-[9px] font-bold tracking-wider">✨ AI</span>
          <div className="text-xs font-bold text-text-primary">AI Style Generator</div>
        </div>
        <textarea value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} rows={2}
          placeholder="Describe the vibe or aesthetic..."
          className="w-full px-2.5 py-2 rounded-lg bg-surface-elevated border border-border-subtle focus:border-brand outline-none text-xs resize-none" />
        <button onClick={generateStyle} disabled={generating}
          className="w-full py-2 rounded-lg btn-brand text-xs inline-flex items-center justify-center gap-1.5 disabled:opacity-60">
          {generating ? <><Loader2 className="w-3 h-3 animate-spin" /> Generating...</> : <><Wand2 className="w-3 h-3" /> Generate Style</>}
        </button>
      </div>
    </div>
  );
}

function ColorRow({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <label className="text-xs text-text-secondary">{label}</label>
      <div className="flex items-center gap-1.5 bg-surface-elevated border border-border-subtle rounded-md px-1.5 py-1">
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="w-5 h-5 rounded cursor-pointer bg-transparent border-0" />
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className="w-20 bg-transparent text-xs font-mono outline-none" />
      </div>
    </div>
  );
}

// ============ SETTINGS PANEL ============
function SettingsPanel({ surveyId }: { surveyId: string }) {
  const survey = useSurveyStore((s) => s.surveys.find((x) => x.id === surveyId))!;
  const setSettings = useSurveyStore((s) => s.setSettings);
  return (
    <div className="p-4 space-y-5">
      <FieldLabel label="Survey Status">
        <div className="grid grid-cols-2 gap-1.5">
          {(["draft", "published"] as const).map((s) => (
            <button key={s} onClick={() => setSettings(surveyId, { status: s })}
              className={`py-2 rounded-lg text-xs font-semibold capitalize transition ${survey.settings.status === s ? "btn-brand" : "bg-surface-elevated text-text-secondary border border-border-subtle hover:border-brand"}`}>
              {s}
            </button>
          ))}
        </div>
      </FieldLabel>
      <FieldLabel label="Collect responses until">
        <input type="date" value={survey.settings.collectUntil ?? ""} onChange={(e) => setSettings(surveyId, { collectUntil: e.target.value })}
          className="w-full px-3 py-2 rounded-lg bg-surface-elevated border border-border-subtle focus:border-brand outline-none text-xs" />
      </FieldLabel>
      <div className="flex items-center justify-between"><span className="text-xs text-text-secondary">Show progress bar</span><Toggle on={survey.settings.showProgress} onChange={(v) => setSettings(surveyId, { showProgress: v })} /></div>
      <div className="flex items-center justify-between"><span className="text-xs text-text-secondary">Show question numbers</span><Toggle on={survey.settings.showNumbers} onChange={(v) => setSettings(surveyId, { showNumbers: v })} /></div>
      <FieldLabel label="Thank you message">
        <textarea value={survey.settings.thankYouMessage} onChange={(e) => setSettings(surveyId, { thankYouMessage: e.target.value })} rows={2}
          className="w-full px-3 py-2 rounded-lg bg-surface-elevated border border-border-subtle focus:border-brand outline-none text-xs resize-none" />
      </FieldLabel>
      <FieldLabel label="Redirect after submit (URL)">
        <input value={survey.settings.redirectUrl ?? ""} onChange={(e) => setSettings(surveyId, { redirectUrl: e.target.value })} placeholder="https://..."
          className="w-full px-3 py-2 rounded-lg bg-surface-elevated border border-border-subtle focus:border-brand outline-none text-xs" />
      </FieldLabel>
      <div className="pt-3 border-t border-border-subtle text-[10px] text-text-muted">
        Public URL: <div className="font-mono mt-1 break-all text-text-secondary">/s/{survey.publicId}</div>
      </div>
    </div>
  );
}

// ============ CANVAS ============
function Canvas({ survey, selected, onSelect }: { survey: ReturnType<typeof useSurveyStore.getState>["surveys"][0]; selected: string | null; onSelect: (id: string) => void }) {
  const [page, setPage] = useState(0);
  useEffect(() => { setPage(0); }, [survey.id, survey.layoutMode]);

  const q = survey.questions;

  if (q.length === 0) {
    return (
      <div className="h-full grid place-items-center p-10 text-center" style={{ color: survey.style.textColor }}>
        <div className="opacity-70">
          <Plus className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <h2 className="text-xl font-semibold">Add your first question</h2>
          <p className="mt-1 text-sm opacity-60">Use the sidebar on the left to get started.</p>
        </div>
      </div>
    );
  }

  if (survey.layoutMode === "paginated") {
    const cur = q[Math.min(page, q.length - 1)];
    return (
      <div className="min-h-full p-10 flex flex-col" style={{ fontFamily: survey.style.fontFamily }}>
        {survey.settings.showProgress && (
          <div className="max-w-2xl mx-auto w-full mb-8">
            <div className="text-xs opacity-70 mb-2">Question {page + 1} of {q.length}</div>
            <div className="h-1 rounded-full" style={{ background: survey.style.cardColor }}>
              <div className="h-1 rounded-full transition-all" style={{ width: `${((page + 1) / q.length) * 100}%`, background: survey.style.primaryColor }} />
            </div>
          </div>
        )}
        <div className="flex-1 grid place-items-center">
          <div className="max-w-2xl w-full">
            <CanvasQuestion q={cur} index={page} survey={survey} selected={selected === cur.id} onSelect={() => onSelect(cur.id)} />
            <div className="mt-8 flex items-center gap-3">
              <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0}
                className="px-4 py-2 rounded-lg border text-sm disabled:opacity-40" style={{ borderColor: survey.style.cardColor }}>← Back</button>
              <button onClick={() => setPage(Math.min(q.length - 1, page + 1))} disabled={page === q.length - 1}
                className="px-4 py-2 rounded-lg text-sm text-white disabled:opacity-40" style={{ background: survey.style.primaryColor }}>Next →</button>
              <div className="ml-auto flex gap-1.5">
                {q.map((_, i) => (
                  <button key={i} onClick={() => setPage(i)}
                    className="w-2 h-2 rounded-full transition" style={{ background: i === page ? survey.style.primaryColor : survey.style.cardColor }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full p-10" style={{ fontFamily: survey.style.fontFamily }}>
      <div className="max-w-2xl mx-auto space-y-5">
        {q.map((qq, i) => (
          <CanvasQuestion key={qq.id} q={qq} index={i} survey={survey} selected={selected === qq.id} onSelect={() => onSelect(qq.id)} />
        ))}
        <button className="w-full py-3 rounded-lg text-sm font-semibold text-white" style={{ background: survey.style.primaryColor }}>Submit</button>
      </div>
    </div>
  );
}

function CanvasQuestion({ q, index, survey, selected, onSelect }: any) {
  const { removeQuestion, duplicateQuestion } = useSurveyStore();
  const sizeCls = survey.style.questionSize === "L" ? "text-3xl" : survey.style.questionSize === "S" ? "text-lg" : "text-2xl";
  return (
    <div className="relative">
      <button onClick={onSelect}
        className={`block w-full text-left p-6 rounded-xl transition border-2 ${selected ? "border-dashed" : "border-solid"}`}
        style={{ background: survey.style.cardColor, borderColor: selected ? survey.style.primaryColor : "transparent" }}>
        {survey.settings.showNumbers && (
          <div className="text-xs font-mono opacity-60 mb-2">
            Q{index + 1}{q.required && <span style={{ color: survey.style.primaryColor }}> *</span>}
          </div>
        )}
        <h3 className={`font-semibold ${sizeCls}`}>{q.text}</h3>
        <div className="mt-4">{renderInput(q, survey.style)}</div>
      </button>
      {selected && (
        <div className="absolute -bottom-3 right-4 flex gap-1 bg-surface-elevated border border-border-strong rounded-lg shadow-xl px-1 py-1">
          <button className="p-1.5 rounded hover:bg-surface-raised text-text-secondary text-xs">Edit ✎</button>
          <button onClick={(e) => { e.stopPropagation(); duplicateQuestion(survey.id, q.id); }} className="p-1.5 rounded hover:bg-surface-raised text-text-secondary"><Copy className="w-3.5 h-3.5" /></button>
          <button onClick={(e) => { e.stopPropagation(); removeQuestion(survey.id, q.id); }} className="p-1.5 rounded hover:bg-surface-raised text-danger"><Trash2 className="w-3.5 h-3.5" /></button>
        </div>
      )}
    </div>
  );
}

function renderInput(q: Question, style: any) {
  const inputBase = { background: "transparent", borderColor: style.cardColor, color: style.textColor };
  if (q.type === "short-text" || q.type === "number")
    return <input disabled placeholder="Your answer..." type={q.type === "number" ? "number" : "text"}
      className="w-full px-3 py-2.5 rounded-lg border-2 outline-none text-base placeholder:opacity-50"
      style={{ ...inputBase, borderColor: style.primaryColor + "30" }} />;
  if (q.type === "long-text")
    return <textarea disabled placeholder="Your answer..." rows={3}
      className="w-full px-3 py-2.5 rounded-lg border-2 outline-none text-base placeholder:opacity-50 resize-none"
      style={{ ...inputBase, borderColor: style.primaryColor + "30" }} />;
  if (q.type === "multiple-choice" || q.type === "checkboxes")
    return (
      <div className="space-y-2">
        {(q.options ?? []).map((o, i) => (
          <div key={i} className="px-4 py-3 rounded-lg border-2 text-sm flex items-center gap-3" style={{ borderColor: style.primaryColor + "30" }}>
            <span className={`w-4 h-4 ${q.type === "checkboxes" ? "rounded" : "rounded-full"} border-2`} style={{ borderColor: style.primaryColor }} />
            {o}
          </div>
        ))}
      </div>
    );
  if (q.type === "rating") {
    const scale = q.scale ?? 5;
    return (
      <div>
        <div className="flex gap-2">
          {Array.from({ length: scale }).map((_, i) => (
            <div key={i} className="w-10 h-10 rounded-lg border-2 grid place-items-center text-sm font-medium"
              style={{ borderColor: style.primaryColor + "40" }}>{i + 1}</div>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-xs opacity-60">
          <span>{q.minLabel}</span><span>{q.maxLabel}</span>
        </div>
      </div>
    );
  }
  if (q.type === "dropdown")
    return <select disabled className="w-full px-3 py-2.5 rounded-lg border-2 outline-none text-base" style={{ ...inputBase, borderColor: style.primaryColor + "30" }}>
      {(q.options ?? []).map((o, i) => <option key={i}>{o}</option>)}
    </select>;
  if (q.type === "date")
    return <input disabled type="date" className="px-3 py-2.5 rounded-lg border-2 outline-none text-base" style={{ ...inputBase, borderColor: style.primaryColor + "30" }} />;
  return null;
}

// ============ AI PANEL ============
const PRESET_PROMPTS = [
  { label: "Generate questions", prompt: "Generate 5 survey questions about [topic]. I'm surveying [audience]." },
  { label: "Refine language", prompt: "Review my questions and suggest clearer, more professional wording." },
  { label: "Suggest options", prompt: "Suggest answer options for question: [selected question text]" },
  { label: "Style this survey", prompt: "Generate a visual style for this survey. The vibe should be..." },
  { label: "Make it shorter", prompt: "Help me cut this survey down to the 3 most essential questions." },
  { label: "Translate to Hindi", prompt: "Translate all my questions to Hindi while keeping their meaning." },
];

function AIPanel({ surveyId, onClose }: { surveyId: string; onClose: () => void }) {
  const [messages, setMessages] = useState<{ role: "user" | "ai"; text: string }[]>([
    { role: "ai", text: "Hi! I'm your AI assistant. I can help you write questions, style your survey, or improve your wording. What can I help with?" },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  const send = () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setMessages((m) => [...m, { role: "user", text: userMsg }]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages((m) => [...m, { role: "ai", text: mockAiReply(userMsg) }]);
    }, 1500);
  };

  return (
    <div className="w-[360px] border-l border-border-subtle bg-surface-raised flex flex-col z-30 animate-in slide-in-from-right duration-300">
      <div className="h-14 px-4 flex items-center justify-between border-b border-border-subtle">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand to-brand-dark grid place-items-center text-surface-base text-xs"><Sparkles className="w-4 h-4" /></div>
          <div>
            <div className="text-sm font-bold text-text-primary">AI Assistant</div>
            <div className="text-[10px] text-text-muted">Powered by FormCraft AI</div>
          </div>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-surface-elevated text-text-secondary transition"><X className="w-4 h-4" /></button>
      </div>

      <div className="p-3 border-b border-border-subtle">
        <div className="text-[10px] uppercase tracking-wider text-text-muted mb-2">Quick actions</div>
        <div className="flex flex-wrap gap-1.5">
          {PRESET_PROMPTS.map((p) => (
            <button key={p.label} onClick={() => setInput(p.prompt)}
              className="px-2.5 py-1 rounded-full text-[11px] bg-surface-elevated border border-border-subtle hover:border-brand hover:text-text-primary text-text-secondary transition">
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start gap-2"}`}>
            {m.role === "ai" && <div className="w-6 h-6 shrink-0 rounded-full bg-gradient-to-br from-brand to-brand-dark grid place-items-center text-surface-base text-[10px]">✨</div>}
            <div className={`max-w-[85%] px-3 py-2.5 rounded-2xl text-sm leading-relaxed ${m.role === "user" ? "bg-brand text-surface-base font-medium rounded-tr-sm" : "bg-surface-elevated text-text-primary rounded-tl-sm"}`}>
              {m.text}
            </div>
          </div>
        ))}
        {typing && (
          <div className="flex gap-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-brand to-brand-dark grid place-items-center text-surface-base text-[10px]">✨</div>
            <div className="px-3 py-2.5 rounded-2xl rounded-tl-sm bg-surface-elevated flex gap-1 items-center">
              <Dot delay={0} /><Dot delay={150} /><Dot delay={300} />
            </div>
          </div>
        )}
      </div>

      <div className="p-3 border-t border-border-subtle">
        <div className="flex gap-2 items-end">
          <textarea value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            rows={1} placeholder="Type a message..."
            className="flex-1 px-3 py-2 rounded-xl bg-surface-elevated border border-border-subtle focus:border-brand outline-none text-sm resize-none max-h-32" />
          <button onClick={send} disabled={!input.trim()}
            className="p-2.5 rounded-xl btn-brand hover:shadow-brand-glow disabled:opacity-50">
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function Dot({ delay }: { delay: number }) {
  return <span className="w-1.5 h-1.5 rounded-full bg-text-secondary animate-bounce" style={{ animationDelay: `${delay}ms` }} />;
}

function mockAiReply(userMsg: string): string {
  const m = userMsg.toLowerCase();
  if (m.includes("generate") && m.includes("question"))
    return "Here are 5 question ideas:\n\n1. What's your name?\n2. Which feature do you use most often?\n3. How likely are you to recommend us? (1–10)\n4. What's one thing we could improve?\n5. Any other feedback?\n\nWant me to add these to your survey?";
  if (m.includes("style") || m.includes("vibe"))
    return "Got it! I'll generate a custom style. Try the 'Generate Style' button in the Style tab — it'll create a complete theme based on your vibe description.";
  if (m.includes("shorter") || m.includes("short"))
    return "I'd suggest keeping these 3 essential questions:\n• Name\n• Primary feedback (long text)\n• Rating (1–5)\n\nShorter surveys see 40% higher completion rates.";
  if (m.includes("refine") || m.includes("language"))
    return "Looking at your questions, I'd suggest:\n• Be more specific in Q1\n• Add a clear scale label to Q3\n• Make Q4 optional to reduce friction\n\nWant me to apply these changes?";
  return "Got it. I'll keep that in mind as we build out your survey. Anything else you'd like to tweak?";
}
