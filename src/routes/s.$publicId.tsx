import { createFileRoute, useParams } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { useSurveyStore, type Question } from "@/lib/store";
import { Logo } from "@/components/Logo";

export const Route = createFileRoute("/s/$publicId")({
  head: () => ({ meta: [{ title: "Survey — FormCraft" }] }),
  component: PublicSurveyPage,
});

function PublicSurveyPage() {
  const { publicId } = useParams({ from: "/s/$publicId" });
  const survey = useSurveyStore((s) => s.surveys.find((x) => x.publicId === publicId));
  const [page, setPage] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [submitted, setSubmitted] = useState(false);

  if (!survey) {
    return (
      <div className="min-h-screen grid place-items-center text-text-secondary p-6 text-center">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">Survey not found</h1>
          <p className="mt-1 text-sm">The link may have expired or been removed.</p>
        </div>
      </div>
    );
  }

  const { style, settings, layoutMode, questions } = survey;
  const bg = { background: style.backgroundColor, color: style.textColor, fontFamily: style.fontFamily };

  if (submitted) {
    return (
      <div className="min-h-screen grid place-items-center p-6" style={bg}>
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full grid place-items-center mx-auto" style={{ background: style.primaryColor + "20" }}>
            <Check className="w-8 h-8" style={{ color: style.primaryColor }} />
          </div>
          <h1 className="mt-6 text-3xl font-bold">{settings.thankYouMessage}</h1>
          <p className="mt-3 text-sm opacity-60">Your response has been recorded.</p>
          <div className="mt-10 text-xs opacity-40 flex items-center justify-center gap-1.5">
            Powered by <Logo size={14} />
          </div>
        </div>
      </div>
    );
  }

  const setAns = (qid: string, v: any) => setAnswers((a) => ({ ...a, [qid]: v }));

  const submit = () => setSubmitted(true);

  if (questions.length === 0) {
    return (
      <div className="min-h-screen grid place-items-center p-6" style={bg}>
        <p className="opacity-60">This survey doesn't have any questions yet.</p>
      </div>
    );
  }

  if (layoutMode === "paginated") {
    const q = questions[page];
    const isLast = page === questions.length - 1;
    return (
      <div className="min-h-screen flex flex-col" style={bg}>
        {settings.showProgress && (
          <div className="px-6 pt-6 max-w-2xl mx-auto w-full">
            <div className="text-xs opacity-60 mb-2">Question {page + 1} of {questions.length}</div>
            <div className="h-1 rounded-full" style={{ background: style.cardColor }}>
              <div className="h-1 rounded-full transition-all" style={{ width: `${((page + 1) / questions.length) * 100}%`, background: style.primaryColor }} />
            </div>
          </div>
        )}
        <div className="flex-1 grid place-items-center p-6">
          <div className="max-w-2xl w-full">
            <PublicQuestion q={q} index={page} style={style} value={answers[q.id]} onChange={(v) => setAns(q.id, v)} showNumbers={settings.showNumbers} />
            <div className="mt-8 flex items-center gap-3">
              <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0}
                className="px-5 py-2.5 rounded-lg border text-sm disabled:opacity-30" style={{ borderColor: style.cardColor }}>← Back</button>
              {!isLast ? (
                <button onClick={() => setPage(page + 1)} className="px-5 py-2.5 rounded-lg text-sm text-white inline-flex items-center gap-1.5" style={{ background: style.primaryColor }}>
                  Next <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button onClick={submit} className="px-5 py-2.5 rounded-lg text-sm text-white font-semibold" style={{ background: style.primaryColor }}>
                  Submit ✓
                </button>
              )}
              <div className="ml-auto flex gap-1.5">
                {questions.map((_, i) => (
                  <span key={i} className="w-2 h-2 rounded-full" style={{ background: i === page ? style.primaryColor : style.cardColor }} />
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="text-center pb-6 text-xs opacity-40 flex items-center justify-center gap-1.5">
          Powered by <Logo size={14} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={bg}>
      <div className="max-w-2xl mx-auto p-6 py-12 space-y-5">
        <h1 className="text-3xl font-bold mb-8">{survey.title}</h1>
        {questions.map((q, i) => (
          <PublicQuestion key={q.id} q={q} index={i} style={style} value={answers[q.id]} onChange={(v) => setAns(q.id, v)} showNumbers={settings.showNumbers} />
        ))}
        <button onClick={submit} className="w-full py-3 rounded-lg text-base font-semibold text-white" style={{ background: style.primaryColor }}>Submit</button>
        <div className="text-center pt-8 text-xs opacity-40 flex items-center justify-center gap-1.5">
          Powered by <Logo size={14} />
        </div>
      </div>
    </div>
  );
}

function PublicQuestion({ q, index, style, value, onChange, showNumbers }: { q: Question; index: number; style: any; value: any; onChange: (v: any) => void; showNumbers: boolean }) {
  return (
    <div className="p-6 rounded-xl" style={{ background: style.cardColor }}>
      {showNumbers && <div className="text-xs opacity-60 font-mono mb-2">Q{index + 1}{q.required && <span style={{ color: style.primaryColor }}> *</span>}</div>}
      <h3 className="text-2xl font-semibold">{q.text}</h3>
      <div className="mt-4">
        {q.type === "short-text" && <input value={value ?? ""} onChange={(e) => onChange(e.target.value)} placeholder="Your answer..." className="w-full px-3 py-2.5 rounded-lg bg-transparent border-2 outline-none focus:border-current text-base" style={{ borderColor: style.primaryColor + "40", color: style.textColor }} />}
        {q.type === "number" && <input type="number" value={value ?? ""} onChange={(e) => onChange(e.target.value)} placeholder="0" className="w-full px-3 py-2.5 rounded-lg bg-transparent border-2 outline-none text-base" style={{ borderColor: style.primaryColor + "40", color: style.textColor }} />}
        {q.type === "long-text" && <textarea value={value ?? ""} onChange={(e) => onChange(e.target.value)} rows={4} placeholder="Your answer..." className="w-full px-3 py-2.5 rounded-lg bg-transparent border-2 outline-none text-base resize-none" style={{ borderColor: style.primaryColor + "40", color: style.textColor }} />}
        {q.type === "date" && <input type="date" value={value ?? ""} onChange={(e) => onChange(e.target.value)} className="px-3 py-2.5 rounded-lg bg-transparent border-2 outline-none text-base" style={{ borderColor: style.primaryColor + "40", color: style.textColor }} />}
        {q.type === "dropdown" && (
          <select value={value ?? ""} onChange={(e) => onChange(e.target.value)} className="w-full px-3 py-2.5 rounded-lg bg-transparent border-2 outline-none text-base" style={{ borderColor: style.primaryColor + "40", color: style.textColor, background: style.cardColor }}>
            <option value="">Select...</option>
            {(q.options ?? []).map((o) => <option key={o}>{o}</option>)}
          </select>
        )}
        {q.type === "multiple-choice" && (
          <div className="space-y-2">
            {(q.options ?? []).map((o) => {
              const sel = value === o;
              return (
                <button key={o} onClick={() => onChange(o)} className="w-full px-4 py-3 rounded-lg border-2 text-sm flex items-center gap-3 text-left transition"
                  style={{ borderColor: sel ? style.primaryColor : style.primaryColor + "30", background: sel ? style.primaryColor + "15" : "transparent" }}>
                  <span className="w-4 h-4 rounded-full border-2 grid place-items-center" style={{ borderColor: style.primaryColor }}>
                    {sel && <span className="w-2 h-2 rounded-full" style={{ background: style.primaryColor }} />}
                  </span>
                  {o}
                </button>
              );
            })}
          </div>
        )}
        {q.type === "checkboxes" && (
          <div className="space-y-2">
            {(q.options ?? []).map((o) => {
              const arr: string[] = Array.isArray(value) ? value : [];
              const sel = arr.includes(o);
              return (
                <button key={o} onClick={() => onChange(sel ? arr.filter((x) => x !== o) : [...arr, o])}
                  className="w-full px-4 py-3 rounded-lg border-2 text-sm flex items-center gap-3 text-left"
                  style={{ borderColor: sel ? style.primaryColor : style.primaryColor + "30", background: sel ? style.primaryColor + "15" : "transparent" }}>
                  <span className="w-4 h-4 rounded border-2 grid place-items-center" style={{ borderColor: style.primaryColor, background: sel ? style.primaryColor : "transparent" }}>
                    {sel && <Check className="w-3 h-3 text-white" />}
                  </span>
                  {o}
                </button>
              );
            })}
          </div>
        )}
        {q.type === "rating" && (
          <div>
            <div className="flex gap-2 flex-wrap">
              {Array.from({ length: q.scale ?? 5 }).map((_, i) => {
                const n = i + 1;
                const sel = value === n;
                return (
                  <button key={i} onClick={() => onChange(n)} className="w-10 h-10 rounded-lg border-2 grid place-items-center font-medium transition"
                    style={{ borderColor: style.primaryColor, background: sel ? style.primaryColor : "transparent", color: sel ? "#fff" : style.textColor }}>
                    {n}
                  </button>
                );
              })}
            </div>
            <div className="flex justify-between mt-2 text-xs opacity-60">
              <span>{q.minLabel}</span><span>{q.maxLabel}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
