import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Eye, EyeOff, ArrowRight, Loader2, Check } from "lucide-react";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/lib/store";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Sign in — FormCraft" }] }),
  component: AuthPage,
});

const quotes = [
  { q: "The AI styling feature saved me 2 hours on my last client project.", a: "Sarah K., UX Designer" },
  { q: "My survey completion rates went from 40% to 76% after switching.", a: "Marcus T., Researcher" },
  { q: "Finally a form builder that doesn't look like it's from 2012.", a: "Priya M., Marketer" },
];

function AuthPage() {
  const navigate = useNavigate();
  const { user, signIn } = useAuth();
  const [tab, setTab] = useState<"in" | "up">("in");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [qi, setQi] = useState(0);

  useEffect(() => {
    if (user) navigate({ to: "/builder/dashboard" });
  }, [user, navigate]);

  useEffect(() => {
    const t = setInterval(() => setQi((i) => (i + 1) % quotes.length), 4000);
    return () => clearInterval(t);
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !pw || (tab === "up" && !name)) {
      setError("Please fill in all fields.");
      return;
    }
    if (pw.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (tab === "up") {
        setSuccess(true);
        setTimeout(() => { signIn(email, name); navigate({ to: "/builder/dashboard" }); }, 700);
      } else {
        signIn(email, name || undefined);
        navigate({ to: "/builder/dashboard" });
      }
    }, 900);
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-surface-base relative overflow-hidden">
        <div className="absolute inset-0 bg-dot-grid opacity-30" />
        <Link to="/" className="relative"><Logo size={32} /></Link>
        <div className="relative max-w-md">
          <div className="text-3xl text-text-primary font-semibold leading-snug min-h-[140px]">
            "{quotes[qi].q}"
          </div>
          <div className="mt-4 text-sm text-text-secondary">— {quotes[qi].a}</div>
          <div className="mt-6 flex gap-2">
            {quotes.map((_, i) => (
              <span key={i} className={`h-1 w-8 rounded-full transition ${i === qi ? "bg-brand" : "bg-border-subtle"}`} />
            ))}
          </div>
        </div>
        <div className="relative text-sm text-text-muted">Join 12,000+ builders</div>
      </div>

      {/* Right */}
      <div className="flex flex-col justify-center p-6 sm:p-12 bg-surface-raised">
        <div className="lg:hidden mb-8"><Link to="/"><Logo /></Link></div>
        <div className="w-full max-w-md mx-auto">
          <div className="flex gap-1 p-1 bg-surface-elevated rounded-lg mb-8">
            {(["in", "up"] as const).map((t) => (
              <button key={t} onClick={() => { setTab(t); setError(null); }}
                className={`flex-1 py-2 rounded-md text-sm font-medium transition ${tab === t ? "bg-brand text-white shadow-brand-glow" : "text-text-secondary hover:text-text-primary"}`}>
                {t === "in" ? "Sign In" : "Create Account"}
              </button>
            ))}
          </div>

          <h1 className="text-2xl font-bold">{tab === "in" ? "Welcome back" : "Create your account"}</h1>
          <p className="mt-1 text-sm text-text-secondary">
            {tab === "in" ? "Sign in to continue building." : "Free forever. No credit card required."}
          </p>

          {error && <div className="mt-5 p-3 rounded-lg bg-danger/10 border border-danger/30 text-danger text-sm">{error}</div>}
          {success && (
            <div className="mt-5 p-3 rounded-lg bg-success/10 border border-success/30 text-success text-sm flex items-center gap-2">
              <Check className="w-4 h-4" /> Account created! Redirecting...
            </div>
          )}

          <form onSubmit={submit} className="mt-6 space-y-4">
            {tab === "up" && (
              <Field label="Full name">
                <input value={name} onChange={(e) => setName(e.target.value)} type="text" placeholder="Jane Doe" className={inputCls} />
              </Field>
            )}
            <Field label="Email address">
              <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="you@example.com" className={inputCls} />
            </Field>
            <Field label="Password" right={tab === "in" ? <a href="#" className="text-xs text-brand hover:underline">Forgot password?</a> : undefined}>
              <div className="relative">
                <input value={pw} onChange={(e) => setPw(e.target.value)} type={showPw ? "text" : "password"} placeholder="••••••••" className={inputCls} />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {tab === "up" && <p className="text-xs text-text-muted mt-1.5">Password must be 6+ characters</p>}
            </Field>

            <button type="submit" disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 bg-brand hover:shadow-brand-glow disabled:opacity-60 text-white font-semibold py-3 rounded-lg transition">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (<>{tab === "in" ? "Sign In" : "Create Account"} <ArrowRight className="w-4 h-4" /></>)}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3 text-xs text-text-muted">
            <span className="h-px flex-1 bg-border-subtle" /> OR <span className="h-px flex-1 bg-border-subtle" />
          </div>
          <div className="space-y-2">
            <SocialBtn icon={<GoogleIcon />} label="Continue with Google" />
            <SocialBtn icon={<GithubIcon />} label="Continue with GitHub" />
          </div>

          <p className="mt-6 text-center text-sm text-text-secondary">
            {tab === "in" ? "Don't have an account? " : "Already have an account? "}
            <button onClick={() => setTab(tab === "in" ? "up" : "in")} className="text-brand font-medium hover:underline">
              {tab === "in" ? "Create one →" : "Sign in →"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

const inputCls = "w-full px-3.5 py-2.5 rounded-lg bg-surface-elevated border border-border-subtle focus:border-brand focus:ring-2 focus:ring-brand/30 outline-none text-sm text-text-primary placeholder:text-text-muted transition";

function Field({ label, children, right }: { label: string; children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <label className="text-sm font-medium text-text-secondary">{label}</label>
        {right}
      </div>
      {children}
    </div>
  );
}

function SocialBtn({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button type="button" className="w-full inline-flex items-center justify-center gap-2.5 py-2.5 rounded-lg border border-border-strong hover:bg-surface-elevated text-sm font-medium text-text-primary transition">
      {icon} {label}
    </button>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
  );
}
function GithubIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.5-1.4-1.3-1.8-1.3-1.8-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-6 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0C17.3 4.7 18.3 5 18.3 5c.6 1.7.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .3"/></svg>;
}
