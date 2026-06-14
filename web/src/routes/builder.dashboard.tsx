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
  Trash2,
  Copy,
  Eye,
  AlertTriangle
} from 'lucide-react'
import { useState, useEffect, useMemo } from 'react'
import { Logo } from '@/components/Logo'
import { useAuth, useSurveyStore } from '@/lib/store'
import { api } from '@/lib/api-client'
import { ProfileSettingsModal } from '@/components/ProfileSettingsModal'

export const Route = createFileRoute('/builder/dashboard')({
  head: () => ({ meta: [{ title: 'Dashboard — FormCraft' }] }),
  component: DashboardPage,
})

function DashboardPage() {
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  
  const [surveys, setSurveys] = useState<any[]>([])
  const [metrics, setMetrics] = useState({ surveys: 0, visits: 0, responses: 0 })
  const [loading, setLoading] = useState(true)
  
  const [q, setQ] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [deleteWarning, setDeleteWarning] = useState<{ id: string, isPublished: boolean } | null>(null)

  const createSurvey = useSurveyStore((s) => s.createSurvey)
  
  useEffect(() => {
    fetchData()
    // Apply theme on load
    const savedTheme = localStorage.getItem('fc-theme')
    if (savedTheme && savedTheme !== 'default') {
      document.documentElement.classList.add(`theme-${savedTheme}`)
    }
  }, [])

  const fetchData = async () => {
    try {
      const [surveysData, metricsData] = await Promise.all([
        api.surveys.list(),
        api.dashboard.metrics()
      ])
      setSurveys(surveysData.surveys || [])
      setMetrics(metricsData.metrics || { surveys: 0, visits: 0, responses: 0 })
    } catch (e) {
      console.error('Failed to fetch data', e)
    } finally {
      setLoading(false)
    }
  }

  const filtered = surveys.filter((s) => s.title.toLowerCase().includes(q.toLowerCase()))

  const handleNew = async () => {
    try {
      // Create locally in store so builder has access to it immediately
      const s = createSurvey()
      // Optional: async create via API if you want it saved right away
      // await api.surveys.create({ title: s.title, description: '' })
      navigate({ to: '/builder/$surveyId', params: { surveyId: s.id } })
    } catch (e) {
      console.error('Failed to create survey', e)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await api.surveys.delete(id)
      setDeleteWarning(null)
      fetchData()
    } catch (e) {
      console.error('Failed to delete survey', e)
    }
  }

  const copyLink = (id: string) => {
    const url = `${window.location.origin}/s/${id}`
    navigator.clipboard.writeText(url)
    alert('Link copied to clipboard!')
  }

  return (
    <div className="min-h-screen bg-surface-base">
      <ProfileSettingsModal 
        isOpen={settingsOpen} 
        onClose={() => setSettingsOpen(false)} 
        user={user} 
      />

      {deleteWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-surface-base border border-border-subtle rounded-3xl p-6 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-danger/10 text-danger grid place-items-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-text-primary mb-2">Delete Survey?</h3>
            <p className="text-text-secondary text-sm mb-6">
              {deleteWarning.isPublished 
                ? "Warning: This survey is published. Deleting it will make the public link inactive immediately and you will lose all responses." 
                : "Are you sure you want to delete this draft? This action cannot be undone."}
            </p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setDeleteWarning(null)} 
                className="px-4 py-2 rounded-xl text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface-elevated transition"
              >
                Cancel
              </button>
              <button 
                onClick={() => handleDelete(deleteWarning.id)} 
                className="px-4 py-2 rounded-xl text-sm font-medium text-white bg-danger hover:bg-danger/90 transition shadow-lg shadow-danger/20"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

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
                <button 
                  onClick={() => { setSettingsOpen(true); setMenuOpen(false); }}
                  className="w-full px-4 py-2.5 text-left hover:bg-surface-elevated text-text-secondary transition"
                >
                  Profile & Settings
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
          <StatCard label="Total Surveys" value={metrics.surveys.toString()} />
          <StatCard label="Total Responses" value={metrics.responses.toString()} />
          <StatCard label="Total Traffic (Visits)" value={metrics.visits.toString()} />
        </div>

        {/* Title + actions */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-7">
          <div>
            <h1 className="text-3xl font-bold text-text-primary">Your Surveys</h1>
            <p className="text-text-secondary mt-1 text-sm">
              {metrics.surveys} {metrics.surveys === 1 ? 'survey' : 'surveys'}
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

        {loading ? (
          <div className="text-center py-24 text-text-muted">Loading surveys...</div>
        ) : filtered.length === 0 ? (
          <EmptyState onCreate={handleNew} />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((s) => (
              <SurveyCard 
                key={s.id} 
                survey={s} 
                onDelete={() => setDeleteWarning({ id: s.id, isPublished: !!s.is_published })}
                onCopyLink={() => copyLink(s.id)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

function SurveyCard({ survey, onDelete, onCopyLink }: any) {
  const [menuOpen, setMenuOpen] = useState(false)
  const isPublished = !!survey.is_published

  const config = useMemo(() => {
    try {
      if (survey.description) return JSON.parse(survey.description)
    } catch {}
    return {}
  }, [survey.description])

  const style = config.style || { primaryColor: '#6C63FF', backgroundColor: '#F0F0FF', cardBackgroundColor: '#FFFFFF' }
  const surveyType = config.surveyType || 'survey'
  const typeLabel = surveyType === 'form' ? '📋 Form' : surveyType === 'quiz' ? '🧠 Quiz' : '📊 Survey'

  return (
    <div className="group rounded-2xl bg-surface-raised border border-border-subtle card-hover overflow-hidden flex flex-col">
      <Link
        to="/builder/$surveyId"
        params={{ surveyId: survey.id }}
        className="block flex-1"
      >
        {/* Preview gradient bar / miniature visual */}
        <div 
          className="h-28 relative overflow-hidden flex flex-col items-center justify-center p-4 border-b border-border-subtle"
          style={{ backgroundColor: style.backgroundColor }}
        >
          <div 
            className="w-full max-w-[120px] rounded-lg p-2 space-y-2 shadow-sm group-hover:scale-105 transition-transform"
            style={{ backgroundColor: style.cardBackgroundColor, border: `1px solid ${style.primaryColor}20` }}
          >
            <div className="h-1.5 rounded-full w-3/4 mx-auto" style={{ backgroundColor: `${style.primaryColor}40` }} />
            <div className="h-1 rounded-full w-full" style={{ backgroundColor: 'currentColor', opacity: 0.2 }} />
            <div className="h-1 rounded-full w-5/6" style={{ backgroundColor: 'currentColor', opacity: 0.2 }} />
            <div className="h-2 rounded w-full mt-1" style={{ backgroundColor: style.primaryColor }} />
          </div>
          
          <div
            className="absolute top-3 left-3 px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wide shadow-sm"
            style={{ backgroundColor: style.cardBackgroundColor, color: style.primaryColor }}
          >
            {typeLabel}
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-text-primary truncate">{survey.title}</h3>
            
            <div className="relative shrink-0" onClick={(e) => { e.preventDefault(); setMenuOpen(!menuOpen); }}>
              <button className="text-text-muted hover:text-text-primary transition p-1 rounded hover:bg-surface-elevated">
                <MoreHorizontal className="w-4 h-4" />
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-full mt-1 w-36 rounded-xl glass border border-border-subtle shadow-xl py-1 text-sm z-20">
                  <button 
                    onClick={(e) => { e.preventDefault(); onDelete(); setMenuOpen(false); }}
                    className="w-full px-3 py-2 text-left hover:bg-surface-elevated text-danger flex items-center gap-2 transition"
                  >
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-2 text-xs text-text-secondary flex items-center gap-4">
            <span className="flex items-center gap-1.5" title="Responses">
              <BarChart3 className="w-3.5 h-3.5" />
              {survey.responses_count || 0}
            </span>
            <span className="flex items-center gap-1.5" title="Link Traffic">
              <Eye className="w-3.5 h-3.5" />
              {survey.visits || 0}
            </span>
            <span>·</span>
            <span>{new Date(survey.updated_at).toLocaleDateString()}</span>
          </div>
          
          <div className="mt-3 flex items-center justify-between">
            <span
              className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                isPublished ? 'text-brand' : 'text-text-muted'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isPublished ? 'bg-brand' : 'bg-text-muted'
                }`}
              />
              {isPublished ? 'Published' : 'Draft'}
            </span>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
              <Link
                to="/analytics/$surveyId"
                params={{ surveyId: survey.id }}
                className="p-1.5 rounded-lg hover:bg-surface-elevated text-text-secondary transition"
                onClick={(e) => e.stopPropagation()}
                title="View Analytics"
              >
                <BarChart3 className="w-3.5 h-3.5" />
              </Link>
              <span className="p-1.5 rounded-lg hover:bg-surface-elevated text-text-secondary transition">
                <Edit3 className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        </div>
      </Link>
      
      {/* Grey extension for Share Link if published */}
      {isPublished && (
        <div className="bg-surface-elevated border-t border-border-subtle px-4 py-2.5 flex items-center justify-between gap-2">
          <div className="text-xs text-text-secondary truncate flex-1 font-mono bg-surface-base px-2 py-1 rounded border border-border-subtle">
            {window.location.origin}/s/{survey.id}
          </div>
          <button 
            onClick={onCopyLink}
            className="p-1.5 rounded-lg hover:bg-surface-base text-text-primary transition shrink-0 border border-transparent hover:border-border-subtle"
            title="Copy public link"
          >
            <Copy className="w-4 h-4" />
          </button>
        </div>
      )}
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
