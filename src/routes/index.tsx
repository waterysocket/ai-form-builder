import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight, Sparkles, Bot, FileText, Palette, Link2, BarChart3, Menu, X,
} from "lucide-react";
import { useState } from "react";
import { Logo } from "@/components/Logo";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FormCraft — Forms that think" },
      { name: "description", content: "Build beautiful AI-powered surveys in minutes. Let AI write the questions, style the page, and make sense of the responses." },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <div className="min-h-screen bg-surface-base text-text-primary">
      <Nav />
      <Hero />
      <Features />
      <HowItWorks />
      <AICallout />
      <CtaBanner />
      <Footer />
    </div>
  );
}

function Nav() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-surface-base/70 border-b border-border-subtle">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/"><Logo /></Link>
        <nav className="hidden md:flex items-center gap-8 text-sm text-text-secondary">
          <a href="#features" className="hover:text-text-primary transition">Features</a>
          <a href="#how" className="hover:text-text-primary transition">How it works</a>
          <a href="#pricing" className="hover:text-text-primary transition">Pricing</a>
        </nav>
        <div className="hidden md:flex items-center gap-3">
          <Link to="/auth" className="text-sm text-text-secondary hover:text-text-primary transition">Sign In</Link>
          <Link to="/auth" className="inline-flex items-center gap-1.5 bg-brand hover:shadow-brand-glow text-white text-sm font-medium px-4 py-2 rounded-lg transition">
            Get Started <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <button className="md:hidden" onClick={() => setOpen(!open)}>
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>
      {open && (
        <div className="md:hidden border-t border-border-subtle px-6 py-4 flex flex-col gap-3 bg-surface-raised">
          <a href="#features">Features</a><a href="#how">How it works</a><a href="#pricing">Pricing</a>
          <Link to="/auth">Sign In</Link>
          <Link to="/auth" className="bg-brand text-white px-4 py-2 rounded-lg text-center">Get Started</Link>
        </div>
      )}
    </header>
  );
}

function Hero() {
  return (
    <section className="relative px-6 pt-20 pb-32 overflow-hidden">
      <div className="absolute inset-0 bg-dot-grid opacity-30 pointer-events-none" />
      <div className="max-w-5xl mx-auto text-center relative">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border-subtle bg-surface-raised text-xs text-text-secondary mb-8">
          <Sparkles className="w-3.5 h-3.5 text-brand-secondary" />
          AI-powered form builder · Now in beta
        </div>
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.05]">
          <span className="text-gradient-brand">Forms that think.</span>
        </h1>
        <p className="mt-6 text-lg md:text-2xl text-text-secondary max-w-2xl mx-auto leading-relaxed">
          Build beautiful surveys in minutes. Let AI write the questions,
          style the page, and make sense of the responses.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link to="/auth" className="inline-flex items-center gap-2 bg-brand hover:shadow-brand-glow text-white text-base font-semibold px-6 py-3.5 rounded-lg transition">
            Start building free <ArrowRight className="w-4 h-4" />
          </Link>
          <a href="#how" className="inline-flex items-center gap-2 bg-transparent border border-border-strong hover:border-brand text-text-primary text-base font-semibold px-6 py-3.5 rounded-lg transition">
            See it in action
          </a>
        </div>
        <div className="mt-12 flex flex-wrap justify-center gap-x-10 gap-y-3 text-sm text-text-secondary">
          <Stat n="12,000+" l="surveys created" />
          <Divider />
          <Stat n="94%" l="completion rate" />
          <Divider />
          <Stat n="Cloudflare Edge" l="globally distributed" />
        </div>

        <BuilderMockup />
      </div>
    </section>
  );
}

function Stat({ n, l }: { n: string; l: string }) {
  return <div><span className="text-text-primary font-semibold">{n}</span> {l}</div>;
}
function Divider() { return <span className="text-border-strong hidden sm:inline">·</span>; }

function BuilderMockup() {
  return (
    <div className="mt-20 relative">
      <div className="absolute inset-0 -inset-x-10 -top-10 bg-brand/10 blur-3xl rounded-full" />
      <div className="relative rounded-2xl border border-border-strong bg-surface-raised shadow-brand-glow-lg overflow-hidden text-left">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border-subtle bg-surface-elevated">
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full bg-danger/70" />
            <span className="w-3 h-3 rounded-full bg-warning/70" />
            <span className="w-3 h-3 rounded-full bg-success/70" />
          </div>
          <div className="flex-1 mx-4 text-xs text-text-muted font-mono bg-surface-base rounded px-3 py-1 text-center">formcraft.app/builder</div>
        </div>
        <div className="grid grid-cols-12 min-h-[400px]">
          <div className="col-span-3 border-r border-border-subtle p-4 space-y-2">
            <div className="text-xs uppercase tracking-wide text-text-muted mb-3">Questions</div>
            {["What's your name?", "How did you hear about us?", "Rate your experience"].map((q, i) => (
              <div key={q} className={`p-2.5 rounded-lg text-xs border ${i === 1 ? "border-brand bg-brand/10 text-text-primary" : "border-border-subtle text-text-secondary"}`}>
                <span className="text-brand font-mono mr-1.5">Q{i + 1}</span>{q}
              </div>
            ))}
            <button className="w-full py-2 rounded-lg border border-dashed border-border-strong text-xs text-text-secondary">+ Add Question</button>
          </div>
          <div className="col-span-9 p-10 flex flex-col justify-center bg-gradient-to-br from-surface-base to-surface-raised">
            <div className="text-xs text-text-muted">Question 2 of 3</div>
            <h3 className="mt-2 text-2xl font-semibold text-text-primary">How did you hear about us?</h3>
            <div className="mt-6 space-y-2 max-w-md">
              {["Social media", "Friend referral", "Search engine", "Other"].map((o, i) => (
                <div key={o} className={`px-4 py-3 rounded-lg border text-sm ${i === 0 ? "border-brand bg-brand/10" : "border-border-subtle"}`}>{o}</div>
              ))}
            </div>
            <div className="mt-6 flex gap-3">
              <button className="px-4 py-2 text-sm rounded-lg border border-border-subtle text-text-secondary">← Back</button>
              <button className="px-4 py-2 text-sm rounded-lg bg-brand text-white">Next →</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const features = [
  { icon: Palette, title: "AI Styling", desc: "Describe a vibe. Get a fully styled survey. Instantly." },
  { icon: Bot, title: "Question AI", desc: "Generate, refine, and improve questions from a chat panel." },
  { icon: FileText, title: "Two Layout Modes", desc: "Paginated like Typeform or scrollable like a classic form — your call." },
  { icon: Sparkles, title: "Brand Control", desc: "Your logo, your colors, your font. Every survey, on-brand." },
  { icon: Link2, title: "Instant Sharing", desc: "One link. Anyone can respond. No login required." },
  { icon: BarChart3, title: "Response Dashboard", desc: "See every response the moment it arrives." },
];

function Features() {
  return (
    <section id="features" className="px-6 py-24 border-t border-border-subtle">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-center tracking-tight">Everything you need. <span className="text-text-secondary">Nothing you don't.</span></h2>
        <div className="mt-16 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => (
            <div key={f.title} className="group p-6 rounded-xl bg-surface-raised border border-border-subtle hover:border-brand/60 hover:bg-surface-elevated transition">
              <div className="w-10 h-10 rounded-lg bg-brand/15 text-brand grid place-items-center group-hover:bg-brand group-hover:text-white transition">
                <f.icon className="w-5 h-5" />
              </div>
              <h3 className="mt-5 text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-text-secondary text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { n: "01", t: "Build", d: "Add questions, choose types, arrange them however you want." },
    { n: "02", t: "Style", d: "Pick a preset or describe your aesthetic to our AI — it handles the rest." },
    { n: "03", t: "Share", d: "Copy your link. Send it anywhere. Responses arrive in real time." },
  ];
  return (
    <section id="how" className="px-6 py-24 border-t border-border-subtle">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-center tracking-tight">From idea to live survey in 3 steps.</h2>
        <div className="mt-20 relative grid md:grid-cols-3 gap-10">
          <div className="absolute top-7 left-[16%] right-[16%] border-t border-dashed border-border-strong hidden md:block" />
          {steps.map((s) => (
            <div key={s.n} className="relative text-center md:text-left">
              <div className="inline-grid w-14 h-14 place-items-center rounded-full bg-surface-raised border border-brand text-brand font-bold text-lg relative z-10">{s.n}</div>
              <h3 className="mt-5 text-xl font-semibold">{s.t}</h3>
              <p className="mt-2 text-text-secondary leading-relaxed">{s.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function AICallout() {
  return (
    <section className="px-6 py-24">
      <div className="max-w-6xl mx-auto rounded-2xl border-2 border-brand bg-surface-raised p-8 md:p-12 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <span className="inline-block px-2.5 py-1 rounded-md bg-brand-secondary/15 text-brand-secondary text-xs font-semibold tracking-wider">AI-POWERED</span>
          <h2 className="mt-4 text-3xl md:text-4xl font-bold leading-tight">Your AI design partner</h2>
          <p className="mt-4 text-text-secondary leading-relaxed">
            Tell the styling agent what you want — "make it feel like a moonlit jazz bar" or "clean corporate blue" — and it generates a complete visual theme for your survey page. Backgrounds, colors, typography, all of it.
          </p>
          <Link to="/auth" className="mt-6 inline-flex items-center gap-2 text-brand font-semibold">
            Try it free <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="rounded-xl border border-border-subtle bg-surface-base p-5 space-y-4">
          <div className="flex justify-end"><div className="max-w-[80%] px-4 py-2.5 rounded-2xl rounded-tr-sm bg-brand text-white text-sm">Make it feel like a moonlit jazz bar — deep blues, warm gold accents.</div></div>
          <div className="flex justify-start gap-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand to-brand-secondary grid place-items-center text-xs">✨</div>
            <div className="max-w-[80%] px-4 py-2.5 rounded-2xl rounded-tl-sm bg-surface-elevated text-text-primary text-sm">
              Got it. I'll go with midnight navy backgrounds, warm gold buttons, and serif typography. Applying now...
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <span className="w-6 h-6 rounded border border-border-subtle" style={{ background: "#0a1628" }} />
            <span className="w-6 h-6 rounded border border-border-subtle" style={{ background: "#d4a84c" }} />
            <span className="w-6 h-6 rounded border border-border-subtle" style={{ background: "#f0e8d8" }} />
          </div>
        </div>
      </div>
    </section>
  );
}

function CtaBanner() {
  return (
    <section id="pricing" className="px-6 py-24 relative overflow-hidden border-t border-border-subtle">
      <div className="absolute inset-0 bg-brand/5" />
      <div className="absolute inset-0 bg-dot-grid opacity-50" />
      <div className="relative max-w-3xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Ready to build something beautiful?</h2>
        <p className="mt-4 text-lg text-text-secondary">Free to start. No credit card required.</p>
        <Link to="/auth" className="mt-8 inline-flex items-center gap-2 bg-brand hover:shadow-brand-glow text-white text-base font-semibold px-7 py-4 rounded-lg transition">
          Create your first survey <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border-subtle px-6 py-12">
      <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-10 text-sm">
        <div>
          <Logo />
          <p className="mt-3 text-text-muted">Forms that think.</p>
        </div>
        <FootCol title="Product" items={["Features", "Pricing", "Changelog"]} />
        <FootCol title="Company" items={["About", "Blog"]} />
        <FootCol title="Legal" items={["Privacy", "Terms"]} />
      </div>
      <div className="max-w-6xl mx-auto mt-10 pt-6 border-t border-border-subtle text-xs text-text-muted flex justify-between">
        <span>© 2025 FormCraft. Built on Cloudflare.</span>
        <span className="font-mono">v1.0.0</span>
      </div>
    </footer>
  );
}

function FootCol({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h4 className="text-text-primary font-semibold mb-3">{title}</h4>
      <ul className="space-y-2 text-text-secondary">{items.map((i) => <li key={i}><a href="#" className="hover:text-text-primary transition">{i}</a></li>)}</ul>
    </div>
  );
}
