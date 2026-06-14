import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { ArrowLeft, ArrowRight, Check, Eye, EyeOff, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Logo } from '@/components/Logo'
import { useAuth } from '@/lib/store'

export const Route = createFileRoute('/auth')({
  head: () => ({ meta: [{ title: 'Sign in — FormCraft' }] }),
  component: AuthPage,
})

function AuthPage() {
  const navigate = useNavigate()
  const { user, signIn } = useAuth()
  const [tab, setTab] = useState<'in' | 'up'>('in')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')

  useEffect(() => {
    if (user) navigate({ to: '/builder/dashboard' })
  }, [user, navigate])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!email || !pw || (tab === 'up' && !name)) {
      setError('Please fill in all fields.')
      return
    }
    if (pw.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (!res.ok) throw new Error('Failed to send magic link')
      const data = await res.json()

      // Simulate clicking the magic link
      const verifyRes = await fetch(`/api/auth/verify?token=${data.token}`)
      if (!verifyRes.ok) throw new Error('Verification failed')
      const verifyData = await verifyRes.json()

      setSuccess(true)
      signIn(email, name || undefined) // still update local state for UI
      setTimeout(() => navigate({ to: '/builder/dashboard' }), 700)
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-screen flex overflow-hidden">
      {/* Left — Form panel */}
      <div className="w-full lg:w-[480px] xl:w-[520px] shrink-0 bg-surface-base relative z-10 overflow-y-scroll flex flex-col">
        <div className="flex-1 flex flex-col justify-center px-8 sm:px-14 py-12 relative min-h-full">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-secondary hover:text-brand transition mb-6 w-fit"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
          </Link>

          <Link to="/" className="inline-block mb-10">
            <Logo size={32} />
          </Link>

          {/* Tab switcher */}
          <div className="flex gap-1 p-1 rounded-xl mb-8 glass w-fit">
            {(['in', 'up'] as const).map((t) => (
              <button
                key={t}
                onClick={() => {
                  setTab(t)
                  setError(null)
                }}
                className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  tab === t
                    ? 'btn-brand shadow-brand-glow'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                {t === 'in' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          <h1 className="text-3xl font-bold text-text-primary leading-tight">
            {tab === 'in' ? 'Welcome back' : 'Start building today'}
          </h1>
          <p className="mt-2 text-text-secondary text-sm">
            {tab === 'in'
              ? 'Sign in to continue your work.'
              : 'Free forever. No credit card required.'}
          </p>

          {error && (
            <div className="mt-5 p-3 rounded-lg bg-danger/10 border border-danger/30 text-danger text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="mt-5 p-3 rounded-lg bg-success/10 border border-success/30 text-success text-sm flex items-center gap-2">
              <Check className="w-4 h-4" /> Account created! Redirecting…
            </div>
          )}

          <form onSubmit={submit} className="mt-7 space-y-5" autoComplete="off">
            {tab === 'up' && (
              <Field label="Full name">
                <input
                  name="fullname"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  type="text"
                  placeholder="Jane Doe"
                  className={inputCls}
                  autoComplete="off"
                />
              </Field>
            )}
            <Field label="Email address">
              <input
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="you@example.com"
                className={inputCls}
                autoComplete="email"
              />
            </Field>
            <Field
              label="Password"
              right={
                tab === 'in' ? (
                  <a href="#" className="text-xs text-brand hover:underline font-medium">
                    Forgot password?
                  </a>
                ) : undefined
              }
            >
              <div className="relative">
                <input
                  name="password"
                  value={pw}
                  onChange={(e) => setPw(e.target.value)}
                  type={showPw ? 'text' : 'password'}
                  placeholder="••••••••"
                  className={inputCls}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-brand transition"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {tab === 'up' && (
                <p className="text-xs text-text-muted mt-1.5">Password must be 6+ characters</p>
              )}
            </Field>

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 btn-brand py-3 rounded-xl transition text-base disabled:opacity-60"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  {tab === 'in' ? 'Sign In' : 'Create Account'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3 text-xs text-text-muted">
            <span className="h-px flex-1 bg-border-subtle" /> OR{' '}
            <span className="h-px flex-1 bg-border-subtle" />
          </div>

          <div className="space-y-2.5">
            <SocialBtn icon={<GoogleIcon />} label="Continue with Google" />
            <SocialBtn icon={<GithubIcon />} label="Continue with GitHub" />
          </div>

          <p className="mt-8 text-center text-sm text-text-secondary">
            {tab === 'in' ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => setTab(tab === 'in' ? 'up' : 'in')}
              className="text-brand font-semibold hover:underline"
            >
              {tab === 'in' ? 'Create one →' : 'Sign in →'}
            </button>
          </p>
        </div>
      </div>

      {/* Right — Image panel */}
      <div className="hidden lg:block flex-1 relative overflow-hidden">
        <img
          src="/login-bg.png"
          alt="Serene green landscape with a white chair"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Subtle left-edge gradient to blend with form panel */}
        <div className="absolute inset-0 bg-gradient-to-r from-surface-base/60 via-transparent to-transparent" />
        {/* Bottom badge */}
        <div className="absolute bottom-10 left-10 right-10">
          <div className="glass rounded-2xl p-5 max-w-sm">
            <p className="text-text-primary text-sm font-medium leading-relaxed">
              "My survey completion rates went from 40% to 76% after switching to FormCraft."
            </p>
            <p className="mt-3 text-text-secondary text-xs font-semibold">
              — Marcus T., Researcher
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

const inputCls =
  'w-full px-4 py-3 rounded-xl bg-surface-elevated border border-border-subtle focus:border-brand outline-none text-sm text-text-primary placeholder:text-text-muted'

function Field({
  label,
  children,
  right,
}: {
  label: string
  children: React.ReactNode
  right?: React.ReactNode
}) {
  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <label className="text-sm font-medium text-text-secondary">{label}</label>
        {right}
      </div>
      {children}
    </div>
  )
}

function SocialBtn({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button
      type="button"
      className="w-full inline-flex items-center justify-center gap-2.5 py-3 rounded-xl border border-border-strong hover:border-brand/40 hover:bg-surface-elevated text-sm font-medium text-text-primary transition"
    >
      {icon} {label}
    </button>
  )
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  )
}

function GithubIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.5-1.4-1.3-1.8-1.3-1.8-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-6 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0C17.3 4.7 18.3 5 18.3 5c.6 1.7.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .3" />
    </svg>
  )
}
