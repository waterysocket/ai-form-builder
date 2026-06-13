import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Plus, Search, MoreHorizontal, Share2, Edit3, LogOut, ChevronDown } from "lucide-react";
import { useState } from "react";
import { Logo } from "@/components/Logo";
import { useAuth, useSurveyStore } from "@/lib/store";

export const Route = createFileRoute("/builder/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — FormCraft" }] }),
  component: DashboardPage,
});

function DashboardPage() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const surveys = useSurveyStore((s) => s.surveys);
  const createSurvey = useSurveyStore((s) => s.createSurvey);
  const [q, setQ] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  const filtered = surveys.filter((s) => s.title.toLowerCase().includes(q.toLowerCase()));

  const handleNew = () => {
    const s = createSurvey();
    navigate({ to: "/builder/$surveyId", params: { surveyId: s.id } });
  };

  return (
    <div className="min-h-screen bg-surface-base">
      <header className="border-b border-border-subtle bg-surface-base sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/"><Logo /></Link>
          <div className="relative">
            <button onClick={() => setMenuOpen(!menuOpen)} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-surface-elevated">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand to-brand-secondary grid place-items-center text-white text-sm font-semibold">
                {user?.name?.[0]?.toUpperCase() ?? "U"}
              </div>
              <ChevronDown className="w-4 h-4 text-text-secondary" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-lg bg-surface-elevated border border-border-subtle shadow-xl py-1.5 text-sm">
                <div className="px-3 py-2 border-b border-border-subtle">
                  <div className="text-text-primary font-medium">{user?.name}</div>
                  <div className="text-text-muted text-xs">{user?.email}</div>
                </div>
                <button className="w-full px-3 py-2 text-left hover:bg-surface-raised text-text-secondary">Profile</button>
                <button className="w-full px-3 py-2 text-left hover:bg-surface-raised text-text-secondary">Settings</button>
                <button onClick={() => { signOut(); navigate({ to: "/" }); }}
                  className="w-full px-3 py-2 text-left hover:bg-surface-raised text-danger flex items-center gap-2">
                  <LogOut className="w-3.5 h-3.5" /> Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Your Surveys</h1>
            <p className="text-text-secondary mt-1">{surveys.length} {surveys.length === 1 ? "survey" : "surveys"} · {surveys.reduce((a, s) => a + s.responses, 0)} responses</p>
          </div>
          <button onClick={handleNew} className="inline-flex items-center gap-2 bg-brand hover:shadow-brand-glow text-white font-medium px-4 py-2.5 rounded-lg transition">
            <Plus className="w-4 h-4" /> New Survey
          </button>
        </div>

        <div className="relative mb-8 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search surveys..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-surface-raised border border-border-subtle focus:border-brand outline-none text-sm" />
        </div>

        {filtered.length === 0 ? (
          <EmptyState onCreate={handleNew} />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((s) => (
              <Link key={s.id} to="/builder/$surveyId" params={{ surveyId: s.id }}
                className="group rounded-xl bg-surface-raised border border-border-subtle hover:border-brand/60 transition overflow-hidden">
                <div className="h-32 relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${s.style.primaryColor}30, ${s.style.primaryColor}05)` }}>
                  <div className="absolute inset-0 grid place-items-center text-text-primary opacity-30 group-hover:opacity-50 transition">
                    <div className="w-32 h-6 rounded bg-current mb-2" />
                  </div>
                  <div className="absolute top-3 left-3 px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wide" style={{ background: s.style.primaryColor + "30", color: s.style.primaryColor }}>
                    {s.style.preset ?? "Custom"}
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-text-primary truncate">{s.title}</h3>
                    <button onClick={(e) => e.preventDefault()} className="text-text-muted hover:text-text-primary"><MoreHorizontal className="w-4 h-4" /></button>
                  </div>
                  <div className="mt-2 text-xs text-text-secondary flex items-center gap-3">
                    <span>{s.responses} responses</span>
                    <span>·</span>
                    <span>{s.updatedAt}</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className={`inline-flex items-center gap-1.5 text-xs ${s.settings.status === "published" ? "text-success" : "text-text-muted"}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${s.settings.status === "published" ? "bg-success" : "bg-text-muted"}`} />
                      {s.settings.status === "published" ? "Published" : "Draft"}
                    </span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                      <span className="p-1.5 rounded hover:bg-surface-elevated text-text-secondary"><Edit3 className="w-3.5 h-3.5" /></span>
                      <span className="p-1.5 rounded hover:bg-surface-elevated text-text-secondary"><Share2 className="w-3.5 h-3.5" /></span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="text-center py-20 rounded-xl border border-dashed border-border-strong bg-surface-raised/50">
      <svg className="mx-auto w-32 h-32 text-border-strong" viewBox="0 0 100 100" fill="none">
        <rect x="20" y="15" width="60" height="75" rx="8" stroke="currentColor" strokeWidth="2"/>
        <line x1="30" y1="32" x2="65" y2="32" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <line x1="30" y1="45" x2="55" y2="45" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <line x1="30" y1="58" x2="60" y2="58" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="75" cy="80" r="12" fill="#6C63FF"/>
        <line x1="75" y1="75" x2="75" y2="85" stroke="white" strokeWidth="2" strokeLinecap="round"/>
        <line x1="70" y1="80" x2="80" y2="80" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      </svg>
      <h2 className="mt-6 text-xl font-semibold">You haven't built anything yet.</h2>
      <p className="mt-1 text-text-secondary">Get started in less than a minute.</p>
      <button onClick={onCreate} className="mt-6 inline-flex items-center gap-2 bg-brand hover:shadow-brand-glow text-white font-medium px-5 py-2.5 rounded-lg transition">
        <Plus className="w-4 h-4" /> Create your first survey
      </button>
    </div>
  );
}
