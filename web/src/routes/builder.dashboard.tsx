import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import {
  BarChart3,
  ChevronDown,
  Edit3,
  LogOut,
  MoreHorizontal,
  Plus,
  Search,
  Share2,
} from 'lucide-react'
import { useState } from 'react'
import { Logo } from '@/components/Logo'
import { useAuth, useSurveyStore } from '@/lib/store'

export const Route = createFileRoute('/builder/dashboard')({
  head: () => ({ meta: [{ title: 'Dashboard — FormCraft' }] }),
  component: DashboardPage,
})

function DashboardPage() {
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const surveys = useSurveyStore((s) => s.surveys)
  const createSurvey = useSurveyStore((s) => s.createSurvey)
  const [q, setQ] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)

  const filtered = surveys.filter((s) => s.title.toLowerCase().includes(q.toLowerCase()))

  const handleNew = () => {
    const s = createSurvey()
    navigate({ to: '/builder/$surveyId', params: { surveyId: s.id } })
  }

  const totalResponses = surveys.reduce((a, s) => a + s.responses, 0)

  return (
    <div className="min-h-screen bg-surface-base">
      {/* Header */}
      <header className="border-b border-border-subtle glass sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/">
            <Logo />
          </Link>
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-surface-elevated transition"
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand to-brand-dark grid place-items-center text-surface-base text-sm font-bold">
                {user?.name?.[0]?.toUpperCase() ?? 'U'}
              </div>
              <span className="text-sm text-text-secondary hidden sm:block">{user?.name}</span>
              <ChevronDown className="w-4 h-4 text-text-muted" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-52 rounded-2xl glass border border-border-subtle shadow-2xl py-2 text-sm z-50">
                <div className="px-4 py-2.5 border-b border-border-subtle">
                  <div className="text-text-primary font-semibold">{user?.name}</div>
                  <div className="text-text-muted text-xs">{user?.email}</div>
                </div>
                <button className="w-full px-4 py-2.5 text-left hover:bg-surface-elevated text-text-secondary transition">
                  Profile
                </button>
                <button className="w-full px-4 py-2.5 text-left hover:bg-surface-elevated text-text-secondary transition">
                  Settings
                </button>
                <div className="border-t border-border-subtle mt-1 pt-1">
                  <button
                    onClick={() => {
                      signOut()
                      navigate({ to: '/' })
                    }}
                    className="w-full px-4 py-2.5 text-left hover:bg-surface-elevated text-danger flex items-center gap-2 transition"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* Stats row */}
        <div className="grid sm:grid-cols-3 gap-4 mb-10">
          <StatCard label="Total Surveys" value={surveys.length.toString()} />
          <StatCard label="Total Responses" value={totalResponses.toString()} />
          <StatCard
            label="Published"
            value={surveys.filter((s) => s.settings.status === 'published').length.toString()}
          />
        </div>

        {/* Title + actions */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-7">
          <div>
            <h1 className="text-3xl font-bold text-text-primary">Your Surveys</h1>
            <p className="text-text-secondary mt-1 text-sm">
              {surveys.length} {surveys.length === 1 ? 'survey' : 'surveys'} · {totalResponses}{' '}
              responses
            </p>
          </div>
          <button
            onClick={handleNew}
            className="inline-flex items-center gap-2 btn-brand px-5 py-2.5 rounded-xl text-sm"
          >
            <Plus className="w-4 h-4" /> New Survey
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-8 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search surveys…"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-raised border border-border-subtle focus:border-brand focus:ring-2 focus:ring-brand/15 outline-none text-sm text-text-primary placeholder:text-text-muted transition"
          />
        </div>

        {filtered.length === 0 ? (
          <EmptyState onCreate={handleNew} />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((s) => (
              <Link
                key={s.id}
                to="/builder/$surveyId"
                params={{ surveyId: s.id }}
                className="group rounded-2xl bg-surface-raised border border-border-subtle card-hover overflow-hidden"
              >
                {/* Preview gradient bar */}
                <div
                  className="h-28 relative overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, ${s.style.primaryColor}40 0%, ${s.style.primaryColor}10 100%)`,
                  }}
                >
                  <div className="absolute inset-0 grid place-items-center">
                    <div className="space-y-2 w-3/4 opacity-40 group-hover:opacity-60 transition">
                      <div className="h-2 bg-text-primary/40 rounded-full w-full" />
                      <div className="h-2 bg-text-primary/30 rounded-full w-2/3" />
                    </div>
                  </div>
                  <div
                    className="absolute top-3 left-3 px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wide"
                    style={{
                      background: s.style.primaryColor + '25',
                      color: s.style.primaryColor,
                    }}
                  >
                    {s.style.preset ?? 'Custom'}
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-text-primary truncate">{s.title}</h3>
                    <button
                      onClick={(e) => e.preventDefault()}
                      className="text-text-muted hover:text-text-primary transition shrink-0"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="mt-2 text-xs text-text-secondary flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <BarChart3 className="w-3 h-3" />
                      {s.responses} responses
                    </span>
                    <span>·</span>
                    <span>{s.updatedAt}</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                        s.settings.status === 'published' ? 'text-brand' : 'text-text-muted'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          s.settings.status === 'published' ? 'bg-brand' : 'bg-text-muted'
                        }`}
                      />
                      {s.settings.status === 'published' ? 'Published' : 'Draft'}
                    </span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                      <span className="p-1.5 rounded-lg hover:bg-surface-elevated text-text-secondary transition">
                        <Edit3 className="w-3.5 h-3.5" />
                      </span>
                      <span className="p-1.5 rounded-lg hover:bg-surface-elevated text-text-secondary transition">
                        <Share2 className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-surface-raised border border-border-subtle p-5">
      <div className="text-text-muted text-xs font-semibold uppercase tracking-widest">{label}</div>
      <div className="mt-2 text-3xl font-bold text-brand">{value}</div>
    </div>
  )
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="text-center py-24 rounded-2xl border border-dashed border-border-strong bg-surface-raised/50">
      <div className="mx-auto w-16 h-16 rounded-2xl bg-brand/10 grid place-items-center mb-5">
        <Plus className="w-8 h-8 text-brand" />
      </div>
      <h2 className="text-xl font-bold text-text-primary">No surveys yet</h2>
      <p className="mt-2 text-text-secondary text-sm">Get started in less than a minute.</p>
      <button
        onClick={onCreate}
        className="mt-6 inline-flex items-center gap-2 btn-brand px-5 py-2.5 rounded-xl text-sm"
      >
        <Plus className="w-4 h-4" /> Create your first survey
      </button>
    </div>
  )
}
