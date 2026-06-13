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
      {
        name: "description",
        content:
          "Build beautiful AI-powered surveys in minutes. Let AI write the questions, style the page, and make sense of the responses.",
      },
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
      <NatureSection />
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
    <header className="sticky top-0 z-50 glass border-b border-border-subtle/60">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/"><Logo /></Link>
        <nav className="hidden md:flex items-center gap-8 text-sm text-text-secondary">
          <a href="#features" className="hover:text-brand transition">Features</a>
          <a href="#how" className="hover:text-brand transition">How it works</a>
          <a href="#pricing" className="hover:text-brand transition">Pricing</a>
        </nav>
        <div className="hidden md:flex items-center gap-3">
          <Link to="/auth" className="text-sm text-text-secondary hover:text-text-primary transition">
            Sign In
          </Link>
          <Link
            to="/auth"
            className="inline-flex items-center gap-1.5 btn-brand text-sm px-5 py-2.5 rounded-xl"
          >
            Get Started <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <button className="md:hidden text-text-primary" onClick={() => setOpen(!open)}>
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>
      {open && (
        <div className="md:hidden border-t border-border-subtle px-6 py-5 flex flex-col gap-4 bg-surface-raised">
          <a href="#features" className="text-text-secondary hover:text-brand">Features</a>
          <a href="#how" className="text-text-secondary hover:text-brand">How it works</a>
          <a href="#pricing" className="text-text-secondary hover:text-brand">Pricing</a>
          <Link to="/auth" className="text-text-secondary">Sign In</Link>
          <Link to="/auth" className="btn-brand px-4 py-2.5 rounded-xl text-center text-sm">
            Get Started
          </Link>
        </div>
      )}
    </header>
  );
}

function Hero() {
  return (
    <section className="relative px-6 pt-24 pb-36 overflow-hidden">
      <div className="absolute inset-0 bg-mesh-gradient pointer-events-none" />
      <div className="absolute inset-0 bg-dot-grid opacity-25 pointer-events-none" />
      {/* Glowing orbs */}
      <div className="absolute top-20 left-1/4 w-72 h-72 rounded-full bg-brand/8 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-brand-dark/20 blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto text-center relative">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-xs text-text-secondary mb-8 border-brand/20">
          <Sparkles className="w-3.5 h-3.5 text-brand" />
          AI-powered form builder · Now in beta
        </div>
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.05]">
          <span className="text-gradient-brand">Forms that think.</span>
        </h1>
        <p className="mt-6 text-lg md:text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed">
          Build beautiful surveys in minutes. Let AI write the questions,
          style the page, and make sense of the responses.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link
            to="/auth"
            className="inline-flex items-center gap-2 btn-brand text-base px-7 py-3.5 rounded-xl"
          >
            Start building free <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="#how"
            className="inline-flex items-center gap-2 btn-outline text-base px-7 py-3.5 rounded-xl"
          >
            See it in action
          </a>
        </div>
        <div className="mt-14 flex flex-wrap justify-center gap-x-12 gap-y-3 text-sm text-text-secondary">
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
  return (
    <div>
      <span className="text-brand font-bold">{n}</span>{" "}
      <span className="text-text-muted">{l}</span>
    </div>
  );
}
function Divider() {
  return <span className="text-border-strong hidden sm:inline">·</span>;
}

function BuilderMockup() {
  return (
    <div className="mt-20 relative">
      <div className="absolute inset-0 -inset-x-10 -top-10 bg-brand/6 blur-3xl rounded-full" />
      <div className="relative rounded-2xl border border-border-strong bg-surface-raised shadow-brand-glow-lg overflow-hidden text-left">
        {/* Browser chrome */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border-subtle bg-surface-elevated">
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full bg-danger/70" />
            <span className="w-3 h-3 rounded-full bg-warning/70" />
            <span className="w-3 h-3 rounded-full bg-success/70" />
          </div>
          <div className="flex-1 mx-4 text-xs text-text-muted font-mono bg-surface-base rounded-lg px-3 py-1 text-center">
            formcraft.app/builder
          </div>
        </div>
        <div className="grid grid-cols-12 min-h-[380px]">
          <div className="col-span-3 border-r border-border-subtle p-4 space-y-2">
            <div className="text-xs uppercase tracking-widest text-text-muted mb-3 font-semibold">
              Questions
            </div>
            {["What's your name?", "How did you hear about us?", "Rate your experience"].map((q, i) => (
              <div
                key={q}
                className={`p-2.5 rounded-lg text-xs border ${
                  i === 1
                    ? "border-brand bg-brand/10 text-text-primary"
                    : "border-border-subtle text-text-secondary"
                }`}
              >
                <span className="text-brand font-mono mr-1.5">Q{i + 1}</span>
                {q}
              </div>
            ))}
            <button className="w-full py-2 rounded-lg border border-dashed border-border-strong text-xs text-text-secondary hover:border-brand hover:text-brand transition">
              + Add Question
            </button>
          </div>
          <div className="col-span-9 p-10 flex flex-col justify-center bg-gradient-to-br from-surface-base to-surface-raised">
            <div className="text-xs text-text-muted">Question 2 of 3</div>
            <h3 className="mt-2 text-2xl font-semibold text-text-primary">
              How did you hear about us?
            </h3>
            <div className="mt-6 space-y-2 max-w-md">
              {["Social media", "Friend referral", "Search engine", "Other"].map((o, i) => (
                <div
                  key={o}
                  className={`px-4 py-3 rounded-xl border text-sm transition ${
                    i === 0 ? "border-brand bg-brand/10 text-brand font-medium" : "border-border-subtle text-text-secondary"
                  }`}
                >
                  {o}
                </div>
              ))}
            </div>
            <div className="mt-6 flex gap-3">
              <button className="px-4 py-2 text-sm rounded-xl border border-border-subtle text-text-secondary hover:border-brand transition">
                ← Back
              </button>
              <button className="px-5 py-2 text-sm rounded-xl btn-brand">
                Next →
              </button>
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
    <section id="features" className="px-6 py-28 border-t border-border-subtle">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-20">
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold tracking-widest text-brand border border-brand/30 bg-brand/10 mb-6">
            FEATURES
          </span>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-text-primary">
            Everything you need.{" "}
            <span className="text-text-muted">Nothing you don't.</span>
          </h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((f) => (
            <div
              key={f.title}
              className="group relative p-8 md:p-10 rounded-[2rem] bg-surface-raised border border-border-subtle hover:border-brand/40 transition-all duration-500 overflow-hidden shadow-2xl"
            >
              {/* Subtle hover background glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-brand/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-surface-elevated border border-border-strong flex items-center justify-center group-hover:scale-110 group-hover:border-brand/50 group-hover:shadow-brand-glow transition-all duration-500">
                  <f.icon className="w-6 h-6 text-brand" />
                </div>
                <h3 className="mt-8 text-xl font-bold text-text-primary">{f.title}</h3>
                <p className="mt-3 text-text-secondary text-sm md:text-base leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Tuscany landscape image side-by-side layout to prevent stretching */
function NatureSection() {
  return (
    <section className="relative overflow-hidden border-t border-border-subtle bg-surface-base">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-stretch">
        <div className="flex-1 px-6 py-16 md:p-20 flex flex-col justify-center">
          <span className="inline-block text-brand text-xs font-bold tracking-widest uppercase mb-4">
            Beautiful by default
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-text-primary leading-tight">
            Your forms deserve to look as good as this
          </h2>
          <p className="mt-6 text-text-secondary text-lg leading-relaxed max-w-lg">
            With AI-powered styling, every survey you create is stunning — right out of the box. No design degree required.
          </p>
          <div className="mt-10">
            <Link
              to="/auth"
              className="inline-flex items-center gap-2 btn-brand px-7 py-3.5 rounded-xl text-base font-semibold"
            >
              Create your first survey <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
        <div className="flex-1 relative min-h-[400px] md:min-h-0">
          <img
            src="/hero-landscape.png"
            alt="Beautiful green Tuscany landscape with wildflowers"
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* Gradient overlay to blend with the text section */}
          <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-surface-base via-surface-base/20 to-transparent" />
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
    <section id="how" className="px-6 py-28 border-t border-border-subtle">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-20">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold tracking-widest text-brand border border-brand/30 bg-brand/8 mb-4">
            HOW IT WORKS
          </span>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
            From idea to live survey in 3 steps.
          </h2>
        </div>
        <div className="relative grid md:grid-cols-3 gap-10">
          <div className="absolute top-9 left-[17%] right-[17%] border-t border-dashed border-border-strong hidden md:block" />
          {steps.map((s) => (
            <div key={s.n} className="relative text-center md:text-left">
              <div className="inline-grid w-16 h-16 place-items-center rounded-full btn-brand font-bold text-xl relative z-10 shadow-brand-glow">
                {s.n}
              </div>
              <h3 className="mt-6 text-xl font-bold text-text-primary">{s.t}</h3>
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
      <div className="max-w-6xl mx-auto rounded-3xl border border-brand/30 bg-surface-raised p-8 md:p-12 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <span className="inline-block px-3 py-1 rounded-md bg-brand/10 text-brand text-xs font-bold tracking-widest">
            AI-POWERED
          </span>
          <h2 className="mt-5 text-3xl md:text-4xl font-bold leading-tight text-text-primary">
            Your AI design partner
          </h2>
          <p className="mt-4 text-text-secondary leading-relaxed">
            Tell the styling agent what you want — "make it feel like a moonlit jazz bar" or
            "clean corporate blue" — and it generates a complete visual theme for your survey page.
            Backgrounds, colors, typography, all of it.
          </p>
          <Link
            to="/auth"
            className="mt-6 inline-flex items-center gap-2 text-brand font-semibold hover:underline"
          >
            Try it free <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="rounded-2xl border border-border-subtle bg-surface-base p-5 space-y-4">
          <div className="flex justify-end">
            <div className="max-w-[80%] px-4 py-3 rounded-2xl rounded-tr-sm bg-brand text-surface-base text-sm font-medium">
              Make it feel like a moonlit jazz bar — deep blues, warm gold accents.
            </div>
          </div>
          <div className="flex justify-start gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand to-brand-dark grid place-items-center text-xs shrink-0">
              ✨
            </div>
            <div className="max-w-[80%] px-4 py-3 rounded-2xl rounded-tl-sm bg-surface-elevated text-text-primary text-sm">
              Got it. I'll go with midnight navy backgrounds, warm gold buttons, and serif
              typography. Applying now…
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
    <section id="pricing" className="px-6 py-28 relative overflow-hidden border-t border-border-subtle">
      <div className="absolute inset-0 bg-mesh-gradient" />
      <div className="absolute inset-0 bg-dot-grid opacity-30" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-64 bg-brand/8 blur-3xl rounded-full" />
      <div className="relative max-w-3xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
          Ready to build something{" "}
          <span className="text-gradient-brand">beautiful?</span>
        </h2>
        <p className="mt-4 text-lg text-text-secondary">
          Free to start. No credit card required.
        </p>
        <Link
          to="/auth"
          className="mt-10 inline-flex items-center gap-2 btn-brand text-base px-8 py-4 rounded-2xl"
        >
          Create your first survey <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border-subtle px-6 py-14">
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
      <ul className="space-y-2 text-text-secondary">
        {items.map((i) => (
          <li key={i}>
            <a href="#" className="hover:text-brand transition">
              {i}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
