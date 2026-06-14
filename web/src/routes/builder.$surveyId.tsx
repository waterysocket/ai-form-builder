import { createFileRoute, Link, useNavigate, useParams } from '@tanstack/react-router'
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  BarChart3,
  Check,
  ChevronLeft,
  Copy,
  Eye,
  GripVertical,
  Loader2,
  MoreHorizontal,
  Plus,
  Save,
  Send,
  Sparkles,
  Trash2,
  Wand2,
  X,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { api } from '@/lib/api-client'
import {
  parseApiSurvey,
  type Question,
  type QuestionType,
  type SurveyType,
  useSurveyStore,
} from '@/lib/store'

export const Route = createFileRoute('/builder/$surveyId')({
  head: () => ({ meta: [{ title: 'Editor — FormCraft' }] }),
  component: BuilderPage,
})

const TYPES: { v: QuestionType; label: string; icon: string }[] = [
  { v: 'short-text', label: 'Short Text', icon: '✏️' },
  { v: 'long-text', label: 'Long Text', icon: '📝' },
  { v: 'multiple-choice', label: 'Multiple Choice', icon: '⚪' },
  { v: 'checkboxes', label: 'Checkboxes', icon: '☑️' },
  { v: 'rating', label: 'Rating', icon: '⭐' },
  { v: 'number', label: 'Number', icon: '#️⃣' },
  { v: 'dropdown', label: 'Dropdown', icon: '▾' },
  { v: 'date', label: 'Date', icon: '📅' },
  { v: 'image', label: 'Image Upload', icon: '🖼️' },
]

const PRESETS = [
  {
    name: 'FormCraft',
    primaryColor: '#E3EF26',
    backgroundColor: '#06231D',
    cardColor: '#0C342C',
    textColor: '#FFFDEE',
  },
  {
    name: 'Midnight',
    primaryColor: '#6C63FF',
    backgroundColor: '#0D0D14',
    cardColor: '#13131F',
    textColor: '#F0F0FF',
  },
  {
    name: 'Clean White',
    primaryColor: '#111827',
    backgroundColor: '#FFFFFF',
    cardColor: '#F9FAFB',
    textColor: '#111827',
  },
  {
    name: 'Forest Green',
    primaryColor: '#22C55E',
    backgroundColor: '#0A1A12',
    cardColor: '#10261A',
    textColor: '#E8F5EE',
  },
  {
    name: 'Ocean Blue',
    primaryColor: '#3B82F6',
    backgroundColor: '#0A1424',
    cardColor: '#101F35',
    textColor: '#E8EFFC',
  },
  {
    name: 'Sunset Coral',
    primaryColor: '#FF6584',
    backgroundColor: '#180D14',
    cardColor: '#28131C',
    textColor: '#FFE8EE',
  },
]

function BuilderPage() {
  const { surveyId } = useParams({ from: '/builder/$surveyId' })
  const navigate = useNavigate()
  const survey = useSurveyStore((s) => s.surveys.find((x) => x.id === surveyId))
  const update = useSurveyStore((s) => s.updateSurvey)
  const addOrUpdateSurvey = useSurveyStore((s) => s.addOrUpdateSurvey)

  const [tab, setTab] = useState<'questions' | 'style' | 'settings'>('questions')
  const [selected, setSelected] = useState<string | null>(null)
  const [aiOpen, setAiOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(!survey)
  const [publishing, setPublishing] = useState(false)
  const titleRef = useRef<HTMLInputElement>(null)
  const savedSurveyRef = useRef<string | null>(null)

  const showToast = (m: string) => {
    setToast(m)
    setTimeout(() => setToast(null), 2500)
  }

  useEffect(() => {
    if (editingTitle) titleRef.current?.focus()
  }, [editingTitle])

  useEffect(() => {
    const fetchSurvey = async () => {
      try {
        const data = await api.surveys.get(surveyId!)
        if (data.error) throw new Error(data.error)
        const parsed = parseApiSurvey(data.survey, data.questions)
        addOrUpdateSurvey(parsed)
        savedSurveyRef.current = JSON.stringify(parsed)
      } catch (err) {
        console.error('Failed to load survey', err)
        showToast('Error loading survey')
        navigate({ to: '/builder/dashboard' })
      } finally {
        setLoading(false)
      }
    }

    if (!survey) {
      fetchSurvey()
    } else {
      if (savedSurveyRef.current === null) {
        savedSurveyRef.current = JSON.stringify(survey)
      }
      setLoading(false)
    }
  }, [surveyId, survey, addOrUpdateSurvey, navigate, showToast])

  if (loading) {
    return (
      <div className="h-screen grid place-items-center text-text-secondary bg-[#06231D] p-6">
        <div className="text-center space-y-2">
          <Loader2 className="w-8 h-8 animate-spin text-brand mx-auto" />
          <p className="text-sm">Loading editor...</p>
        </div>
      </div>
    )
  }

  if (!survey) return null

  const handleSave = async () => {
    setSaving(true)
    try {
      // Stringify style and settings into description to preserve them in the simple schema
      const configStr = JSON.stringify({
        style: survey.style,
        settings: survey.settings,
        layoutMode: survey.layoutMode,
        surveyType: survey.surveyType,
      })

      await api.surveys.update(survey.id, {
        title: survey.title,
        description: configStr,
        questions: survey.questions,
      })
      savedSurveyRef.current = JSON.stringify(survey)
      showToast('Survey saved to dashboard')
    } catch (err) {
      console.error(err)
      showToast('Error saving survey')
    } finally {
      setSaving(false)
    }
  }

  const handlePublishToggle = async () => {
    const isPublished = survey.settings.status === 'published'
    setPublishing(true)
    try {
      if (!isPublished) {
        await handleSave() // auto-save before publishing
      }
      if (isPublished) {
        await api.surveys.unpublish(survey.id)
      } else {
        await api.surveys.publish(survey.id)
      }

      const newStatus = isPublished ? 'draft' : 'published'
      update(survey.id, { settings: { ...survey.settings, status: newStatus } })

      const updatedSurvey = { ...survey, settings: { ...survey.settings, status: newStatus } }
      savedSurveyRef.current = JSON.stringify(updatedSurvey)

      showToast(isPublished ? 'Survey unpublished' : 'Survey published')
    } catch (err) {
      console.error(err)
      showToast('Error updating publish status')
    } finally {
      setPublishing(false)
    }
  }

  const handleShare = () => {
    const url = `${window.location.origin}/s/${survey.publicId}`
    navigator.clipboard?.writeText(url)
    showToast('Link copied!')
  }

  const isPublished = survey.settings.status === 'published'
  const hasChanges = savedSurveyRef.current !== JSON.stringify(survey)

  return (
    <div className="builder-theme h-screen overflow-hidden flex flex-col bg-surface-base text-text-primary">
      {/* TOP NAV */}
      <header className="h-14 border-b border-border-subtle flex items-center px-4 gap-3 glass z-30">
        <Link
          to="/builder/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-brand transition"
        >
          <ArrowLeft className="w-4 h-4" /> Dashboard
        </Link>
        <div className="h-5 w-px bg-border-subtle" />
        {editingTitle && !isPublished ? (
          <input
            ref={titleRef}
            value={survey.title}
            onChange={(e) => update(survey.id, { title: e.target.value })}
            onBlur={() => setEditingTitle(false)}
            onKeyDown={(e) => e.key === 'Enter' && setEditingTitle(false)}
            className="bg-surface-elevated border border-brand outline-none px-3 py-1.5 rounded-lg text-sm font-medium min-w-[200px]"
          />
        ) : (
          <button
            onClick={() => !isPublished && setEditingTitle(true)}
            disabled={isPublished}
            className="text-sm font-semibold px-2 py-1 rounded-lg hover:bg-surface-elevated transition disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {survey.title}
          </button>
        )}

        {/* Survey Type Selector */}
        <div className="flex items-center gap-0.5 bg-surface-elevated rounded-lg p-0.5 border border-border-subtle">
          {[
            { v: 'form' as SurveyType, label: '📋 Form' },
            { v: 'survey' as SurveyType, label: '📊 Survey' },
            { v: 'quiz' as SurveyType, label: '🧠 Quiz' },
          ].map((t) => (
            <button
              key={t.v}
              onClick={() => !isPublished && update(survey.id, { surveyType: t.v })}
              disabled={isPublished}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition ${survey.surveyType === t.v ? 'bg-brand text-surface-base shadow-sm' : 'text-text-secondary hover:text-text-primary'} disabled:cursor-not-allowed`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <a
            href={`/s/${survey.publicId}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm btn-outline"
          >
            <Eye className="w-3.5 h-3.5" /> Preview
          </a>
          <Link
            to="/analytics/$surveyId"
            params={{ surveyId: survey.id }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm btn-outline"
          >
            <BarChart3 className="w-3.5 h-3.5" /> Analytics
          </Link>

          {isPublished && (
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm btn-brand shadow-brand-glow"
            >
              <Copy className="w-3.5 h-3.5" /> Copy Link
            </button>
          )}

          <button
            onClick={handlePublishToggle}
            disabled={publishing || saving}
            className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm transition ${isPublished ? 'btn-outline border-danger text-danger hover:bg-danger/10' : 'btn-brand'}`}
          >
            {publishing ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : isPublished ? (
              <X className="w-3.5 h-3.5" />
            ) : null}
            {isPublished ? 'Unpublish' : 'Publish'}
          </button>

          {!isPublished && (
            <button
              onClick={handleSave}
              disabled={saving || !hasChanges}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm btn-outline transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-3.5 h-3.5" /> Save
            </button>
          )}

          <div className="ml-2 text-xs text-text-muted flex items-center gap-1.5 min-w-[68px]">
            {saving || publishing ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin" /> {saving ? 'Saving...' : 'Working...'}
              </>
            ) : hasChanges ? (
              <>
                <div className="w-2 h-2 rounded-full bg-brand animate-pulse" /> Unsaved
              </>
            ) : (
              <>
                <Check className="w-3 h-3 text-brand" /> Saved
              </>
            )}
          </div>
        </div>
      </header>

      <div className="flex flex-1 min-h-0 relative">
        {isPublished && (
          <div className="absolute inset-0 z-40 bg-surface-base/40 backdrop-blur-[1px] flex items-start justify-center pt-8 pointer-events-auto">
            <div className="px-4 py-2 rounded-xl bg-surface-elevated border border-border-strong text-sm font-semibold shadow-2xl flex items-center gap-2">
              <Check className="w-4 h-4 text-brand" /> Survey is published. Unpublish to continue
              editing.
            </div>
          </div>
        )}

        {/* LEFT SIDEBAR */}
        <aside
          className={`w-[280px] border-r border-border-subtle bg-surface-raised flex flex-col ${isPublished ? 'opacity-50 pointer-events-none' : ''}`}
        >
          {selected ? (
            <ConfigPanel surveyId={survey.id} qid={selected} onBack={() => setSelected(null)} />
          ) : (
            <>
              <div className="p-3 flex gap-1 border-b border-border-subtle">
                {(['questions', 'style', 'settings'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg capitalize transition ${tab === t ? 'bg-brand text-surface-base' : 'text-text-secondary hover:text-text-primary hover:bg-surface-elevated'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <div className="flex-1 overflow-y-auto">
                {tab === 'questions' && (
                  <QuestionsPanel
                    surveyId={survey.id}
                    onSelect={setSelected}
                    showToast={showToast}
                  />
                )}
                {tab === 'style' && <StylePanel surveyId={survey.id} showToast={showToast} />}
                {tab === 'settings' && <SettingsPanel surveyId={survey.id} />}
              </div>
            </>
          )}
        </aside>

        {/* CANVAS */}
        <main
          className={`flex-1 overflow-auto relative bg-cover bg-center ${isPublished ? 'pointer-events-none' : ''}`}
          style={{
            backgroundColor: survey.style.backgroundColor,
            backgroundImage: survey.style.backgroundImage
              ? `url(${survey.style.backgroundImage})`
              : 'none',
            color: survey.style.textColor,
          }}
        >
          <Canvas survey={survey} selected={selected} onSelect={setSelected} />
          {/* AI floating btn */}
          {!aiOpen && (
            <button
              onClick={() => setAiOpen(true)}
              className="fixed right-0 top-1/2 -translate-y-1/2 btn-brand px-3 py-4 rounded-l-xl shadow-brand-glow flex flex-col items-center gap-2 text-xs font-bold z-20"
              style={{ writingMode: 'vertical-rl' }}
            >
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
  )
}

// ============ QUESTIONS PANEL ============
function QuestionsPanel({
  surveyId,
  onSelect,
  showToast,
}: {
  surveyId: string
  onSelect: (id: string) => void
  showToast: (m: string) => void
}) {
  const survey = useSurveyStore((s) => s.surveys.find((x) => x.id === surveyId))!
  const { addQuestion, removeQuestion, duplicateQuestion, moveQuestion, updateSurvey } =
    useSurveyStore()
  const [addOpen, setAddOpen] = useState(false)
  const [menuId, setMenuId] = useState<string | null>(null)

  return (
    <div className="p-3 space-y-3">
      <div className="relative">
        <button
          onClick={() => setAddOpen(!addOpen)}
          className="w-full py-2.5 rounded-lg border border-dashed border-border-strong hover:border-brand hover:bg-brand/5 text-sm text-text-secondary hover:text-text-primary inline-flex items-center justify-center gap-2 transition"
        >
          <Plus className="w-4 h-4" /> Add Question
        </button>
        {addOpen && (
          <div className="absolute top-full mt-1.5 left-0 right-0 z-20 bg-surface-elevated border border-border-strong rounded-lg shadow-xl py-1 grid grid-cols-2 gap-0.5">
            {TYPES.map((t) => (
              <button
                key={t.v}
                onClick={() => {
                  addQuestion(surveyId, t.v)
                  setAddOpen(false)
                  showToast('Question added')
                }}
                className="px-2 py-2 text-xs text-left hover:bg-surface-raised rounded flex items-center gap-1.5"
              >
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
            <button
              onClick={() => onSelect(q.id)}
              className="w-full group flex items-center gap-2 p-2.5 rounded-lg bg-surface-elevated border border-border-subtle hover:border-border-strong text-left"
            >
              <GripVertical className="w-3.5 h-3.5 text-text-muted shrink-0" />
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-brand/15 text-brand shrink-0">
                Q{i + 1}
              </span>
              <span className="flex-1 text-xs text-text-primary truncate">{q.text}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setMenuId(menuId === q.id ? null : q.id)
                }}
                className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-text-primary"
              >
                <MoreHorizontal className="w-3.5 h-3.5" />
              </button>
            </button>
            {menuId === q.id && (
              <div className="absolute right-2 top-full z-20 mt-1 w-36 bg-surface-elevated border border-border-strong rounded-lg shadow-xl py-1 text-xs">
                <Mi
                  onClick={() => {
                    duplicateQuestion(surveyId, q.id)
                    setMenuId(null)
                  }}
                  icon={<Copy className="w-3 h-3" />}
                >
                  Duplicate
                </Mi>
                <Mi
                  onClick={() => {
                    moveQuestion(surveyId, q.id, -1)
                    setMenuId(null)
                  }}
                  icon={<ArrowUp className="w-3 h-3" />}
                >
                  Move Up
                </Mi>
                <Mi
                  onClick={() => {
                    moveQuestion(surveyId, q.id, 1)
                    setMenuId(null)
                  }}
                  icon={<ArrowDown className="w-3 h-3" />}
                >
                  Move Down
                </Mi>
                <Mi
                  onClick={() => {
                    removeQuestion(surveyId, q.id)
                    setMenuId(null)
                  }}
                  icon={<Trash2 className="w-3 h-3" />}
                  danger
                >
                  Delete
                </Mi>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="pt-3 border-t border-border-subtle">
        <div className="text-[10px] uppercase tracking-wider text-text-muted mb-2">Layout Mode</div>
        <div className="grid grid-cols-2 gap-1.5">
          {(['paginated', 'scrollable'] as const).map((m) => (
            <button
              key={m}
              onClick={() => updateSurvey(surveyId, { layoutMode: m })}
              className={`p-2.5 rounded-lg border text-xs capitalize ${survey.layoutMode === m ? 'border-brand bg-brand/10 text-text-primary' : 'border-border-subtle text-text-secondary hover:border-border-strong'}`}
            >
              {m === 'paginated' ? '📄 Paginated' : '📜 Scrollable'}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function Mi({ children, onClick, icon, danger }: any) {
  return (
    <button
      onClick={onClick}
      className={`w-full px-2.5 py-1.5 text-left flex items-center gap-2 hover:bg-surface-raised ${danger ? 'text-danger' : 'text-text-secondary'}`}
    >
      {icon} {children}
    </button>
  )
}

// ============ CONFIG PANEL ============
function ConfigPanel({
  surveyId,
  qid,
  onBack,
}: {
  surveyId: string
  qid: string
  onBack: () => void
}) {
  const survey = useSurveyStore((s) => s.surveys.find((x) => x.id === surveyId))!
  const updateQuestion = useSurveyStore((s) => s.updateQuestion)
  const q = survey.questions.find((x) => x.id === qid)
  if (!q)
    return (
      <div className="p-4">
        <button onClick={onBack} className="text-sm text-brand">
          ← Back
        </button>
      </div>
    )

  const u = (patch: Partial<Question>) => updateQuestion(surveyId, qid, patch)

  return (
    <div className="p-4 space-y-4 overflow-y-auto h-full">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1 text-xs text-text-secondary hover:text-text-primary"
      >
        <ChevronLeft className="w-3.5 h-3.5" /> Back to questions
      </button>
      <FieldLabel label="Question Type">
        <select
          value={q.type}
          onChange={(e) => u({ type: e.target.value as QuestionType })}
          className="w-full px-3 py-2 rounded-lg bg-surface-elevated border border-border-subtle focus:border-brand outline-none text-xs"
        >
          {TYPES.map((t) => (
            <option key={t.v} value={t.v}>
              {t.label}
            </option>
          ))}
        </select>
      </FieldLabel>
      <FieldLabel label="Question Text">
        <textarea
          value={q.text}
          onChange={(e) => u({ text: e.target.value })}
          rows={2}
          className="w-full px-3 py-2 rounded-lg bg-surface-elevated border border-border-subtle focus:border-brand outline-none text-xs resize-none"
        />
      </FieldLabel>
      <div className="flex items-center justify-between">
        <span className="text-xs text-text-secondary">Required</span>
        <Toggle on={!!q.required} onChange={(v) => u({ required: v })} />
      </div>

      {(q.type === 'multiple-choice' || q.type === 'checkboxes' || q.type === 'dropdown') && (
        <FieldLabel label="Options">
          <div className="space-y-1.5">
            {(q.options ?? []).map((opt, i) => (
              <div key={i} className="flex gap-1.5">
                <input
                  value={opt}
                  onChange={(e) => {
                    const next = [...(q.options ?? [])]
                    next[i] = e.target.value
                    u({ options: next })
                  }}
                  className="flex-1 px-2.5 py-1.5 rounded-md bg-surface-elevated border border-border-subtle focus:border-brand outline-none text-xs"
                />
                <button
                  onClick={() => u({ options: (q.options ?? []).filter((_, j) => j !== i) })}
                  className="p-1.5 rounded text-text-muted hover:text-danger"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            <button
              onClick={() =>
                u({ options: [...(q.options ?? []), `Option ${(q.options?.length ?? 0) + 1}`] })
              }
              className="w-full py-1.5 rounded-md border border-dashed border-border-strong text-xs text-text-secondary hover:text-text-primary hover:border-brand"
            >
              + Add option
            </button>
          </div>
        </FieldLabel>
      )}

      {q.type === 'rating' && (
        <>
          <div className="grid grid-cols-2 gap-2">
            <FieldLabel label="Min label">
              <input
                value={q.minLabel ?? ''}
                onChange={(e) => u({ minLabel: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded-md bg-surface-elevated border border-border-subtle focus:border-brand outline-none text-xs"
              />
            </FieldLabel>
            <FieldLabel label="Max label">
              <input
                value={q.maxLabel ?? ''}
                onChange={(e) => u({ maxLabel: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded-md bg-surface-elevated border border-border-subtle focus:border-brand outline-none text-xs"
              />
            </FieldLabel>
          </div>
          <FieldLabel label="Scale">
            <div className="grid grid-cols-2 gap-1.5">
              {[5, 10].map((s) => (
                <button
                  key={s}
                  onClick={() => u({ scale: s as 5 | 10 })}
                  className={`py-1.5 rounded-md text-xs ${q.scale === s ? 'bg-brand text-white' : 'bg-surface-elevated text-text-secondary border border-border-subtle'}`}
                >
                  1–{s}
                </button>
              ))}
            </div>
          </FieldLabel>
        </>
      )}

      {survey.surveyType === 'quiz' && (
        <div className="pt-3 border-t border-border-subtle">
          <FieldLabel label="✅ Correct Answer (Quiz Mode)">
            {q.type === 'multiple-choice' || q.type === 'dropdown' ? (
              <select
                value={q.correctAnswer ?? ''}
                onChange={(e) => u({ correctAnswer: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-surface-elevated border border-border-subtle focus:border-brand outline-none text-xs"
              >
                <option value="">Select correct answer…</option>
                {(q.options ?? []).map((opt, i) => (
                  <option key={i} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            ) : q.type === 'checkboxes' ? (
              <div className="space-y-1">
                <div className="text-[10px] text-text-muted mb-1">
                  Select all correct options (comma-separated):
                </div>
                <input
                  value={q.correctAnswer ?? ''}
                  onChange={(e) => u({ correctAnswer: e.target.value })}
                  placeholder="Option 1, Option 3"
                  className="w-full px-2.5 py-1.5 rounded-md bg-surface-elevated border border-border-subtle focus:border-brand outline-none text-xs"
                />
              </div>
            ) : q.type === 'rating' ? (
              <input
                type="number"
                min={1}
                max={q.scale ?? 5}
                value={q.correctAnswer ?? ''}
                onChange={(e) => u({ correctAnswer: e.target.value })}
                placeholder={`1–${q.scale ?? 5}`}
                className="w-full px-2.5 py-1.5 rounded-md bg-surface-elevated border border-border-subtle focus:border-brand outline-none text-xs"
              />
            ) : (
              <input
                value={q.correctAnswer ?? ''}
                onChange={(e) => u({ correctAnswer: e.target.value })}
                placeholder="Expected answer"
                className="w-full px-2.5 py-1.5 rounded-md bg-surface-elevated border border-border-subtle focus:border-brand outline-none text-xs"
              />
            )}
          </FieldLabel>
        </div>
      )}
    </div>
  )
}

function FieldLabel({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[10px] uppercase tracking-wider text-text-muted mb-1.5 font-medium">
        {label}
      </label>
      {children}
    </div>
  )
}

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!on)}
      className={`relative w-9 h-5 rounded-full transition ${on ? 'bg-brand' : 'bg-surface-elevated border border-border-subtle'}`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition ${on ? 'translate-x-4' : ''}`}
      />
    </button>
  )
}

// ============ STYLE PANEL ============
function StylePanel({ surveyId, showToast }: { surveyId: string; showToast: (m: string) => void }) {
  const survey = useSurveyStore((s) => s.surveys.find((x) => x.id === surveyId))!
  const setStyle = useSurveyStore((s) => s.setStyle)
  const [aiPrompt, setAiPrompt] = useState('')
  const [generating, setGenerating] = useState(false)

  const customStyles = useSurveyStore((s) => s.customStyles)
  const saveCustomStyle = useSurveyStore((s) => s.saveCustomStyle)
  const deleteCustomStyle = useSurveyStore((s) => s.deleteCustomStyle)

  const generateStyle = async () => {
    if (!aiPrompt.trim()) return
    setGenerating(true)
    try {
      const res = await fetch('/api/ai/style', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiPrompt }),
      })
      if (!res.ok) throw new Error('Failed to generate style')
      const stylePatch = await res.json()
      setStyle(surveyId, stylePatch)
      showToast('AI style applied')
    } catch (e) {
      console.error(e)
      showToast('Error generating style')
    } finally {
      setGenerating(false)
    }
  }

  const handleSaveStyle = () => {
    const name = prompt('Name your custom style:')
    if (!name) return
    saveCustomStyle({ ...survey.style, preset: name })
    showToast('Style saved')
  }

  return (
    <div className="p-4 space-y-5">
      <div>
        <div className="text-[10px] uppercase tracking-wider text-text-muted mb-2 font-medium">
          Presets
        </div>
        <div className="grid grid-cols-2 gap-2">
          {[...PRESETS, ...customStyles].map((p) => (
            <div key={p.name || p.preset} className="relative group">
              <button
                onClick={() => setStyle(surveyId, p)}
                className={`w-full rounded-lg border overflow-hidden text-left transition ${survey.style.preset === p.name || survey.style.preset === p.preset ? 'border-brand ring-1 ring-brand' : 'border-border-subtle hover:border-border-strong'}`}
              >
                <div className="h-12 p-2" style={{ background: p.backgroundColor }}>
                  <div className="h-2 w-12 rounded" style={{ background: p.primaryColor }} />
                  <div
                    className="mt-1 h-1.5 w-16 rounded opacity-60"
                    style={{ background: p.textColor }}
                  />
                </div>
                <div className="px-2 py-1.5 text-[11px] font-medium bg-surface-elevated">
                  {p.name || p.preset}
                </div>
              </button>
              {p.preset && customStyles.includes(p) && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteCustomStyle(p.preset!)
                    showToast('Style deleted')
                  }}
                  className="absolute top-1 right-1 p-1 bg-surface-raised rounded-md opacity-0 group-hover:opacity-100 text-danger shadow-sm hover:bg-surface-elevated"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          onClick={handleSaveStyle}
          className="w-full mt-2 py-1.5 rounded-lg border border-dashed border-border-strong text-xs text-text-secondary hover:text-text-primary hover:border-brand"
        >
          + Save current style
        </button>
      </div>

      <div className="space-y-3">
        <div className="text-[10px] uppercase tracking-wider text-text-muted font-medium">
          Brand
        </div>
        <ColorRow
          label="Primary Color"
          value={survey.style.primaryColor}
          onChange={(v) => setStyle(surveyId, { primaryColor: v })}
        />
        <ColorRow
          label="Background"
          value={survey.style.backgroundColor}
          onChange={(v) => setStyle(surveyId, { backgroundColor: v })}
        />
        <ColorRow
          label="Text Color"
          value={survey.style.textColor}
          onChange={(v) => setStyle(surveyId, { textColor: v })}
        />
        <div className="flex items-center justify-between gap-3">
          <label className="text-xs text-text-secondary">Bg Image (R2)</label>
          <label className="relative btn-outline px-2 py-1 text-xs cursor-pointer rounded-lg">
            {survey.style.backgroundImage ? 'Change' : 'Upload'}
            <input
              type="file"
              accept="image/*"
              className="absolute inset-0 w-0 h-0 opacity-0"
              onChange={async (e) => {
                const file = e.target.files?.[0]
                if (!file) return
                showToast('Uploading...')
                const fd = new FormData()
                fd.append('file', file)
                try {
                  const res = await fetch('/api/upload', { method: 'POST', body: fd })
                  if (!res.ok) throw new Error('Upload failed')
                  const { url } = await res.json()
                  setStyle(surveyId, { backgroundImage: url })
                  showToast('Image uploaded')
                } catch (_err) {
                  showToast('Error uploading')
                }
              }}
            />
          </label>
        </div>
        {survey.style.backgroundImage && (
          <div className="flex items-center justify-between gap-3 mt-1">
            <span className="text-xs truncate text-text-muted">Image active</span>
            <button
              onClick={() => setStyle(surveyId, { backgroundImage: undefined })}
              className="text-xs text-danger hover:underline"
            >
              Remove
            </button>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <div className="text-[10px] uppercase tracking-wider text-text-muted font-medium">
          Typography
        </div>
        <FieldLabel label="Font Family">
          <select
            value={survey.style.fontFamily}
            onChange={(e) => setStyle(surveyId, { fontFamily: e.target.value })}
            className="w-full px-3 py-2 rounded-lg bg-surface-elevated border border-border-subtle focus:border-brand outline-none text-xs"
          >
            {[
              'Inter',
              'Playfair',
              'Space Grotesk',
              'DM Sans',
              'Sora',
              'Roboto',
              'Outfit',
              'Merriweather',
              'Lora',
            ].map((f) => (
              <option key={f}>{f}</option>
            ))}
          </select>
        </FieldLabel>
        <FieldLabel label="Question Size">
          <div className="grid grid-cols-3 gap-1.5">
            {(['S', 'M', 'L'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStyle(surveyId, { questionSize: s })}
                className={`py-1.5 rounded-md text-xs ${survey.style.questionSize === s ? 'bg-brand text-white' : 'bg-surface-elevated text-text-secondary border border-border-subtle'}`}
              >
                {s}
              </button>
            ))}
          </div>
        </FieldLabel>
      </div>

      <div className="p-3 rounded-xl glass border-brand/30 space-y-2.5">
        <div className="flex items-center gap-1.5">
          <span className="px-2 py-0.5 rounded-full bg-brand/15 text-brand text-[9px] font-bold tracking-wider">
            ✨ AI
          </span>
          <div className="text-xs font-bold text-text-primary">AI Style Generator</div>
        </div>
        <textarea
          value={aiPrompt}
          onChange={(e) => setAiPrompt(e.target.value)}
          rows={2}
          placeholder="Describe the vibe or aesthetic..."
          className="w-full px-2.5 py-2 rounded-lg bg-surface-elevated border border-border-subtle focus:border-brand outline-none text-xs resize-none"
        />
        <button
          onClick={generateStyle}
          disabled={generating}
          className="w-full py-2 rounded-lg btn-brand text-xs inline-flex items-center justify-center gap-1.5 disabled:opacity-60"
        >
          {generating ? (
            <>
              <Loader2 className="w-3 h-3 animate-spin" /> Generating...
            </>
          ) : (
            <>
              <Wand2 className="w-3 h-3" /> Generate Style
            </>
          )}
        </button>
      </div>
    </div>
  )
}

function ColorRow({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <label className="text-xs text-text-secondary">{label}</label>
      <div className="flex items-center gap-1.5 bg-surface-elevated border border-border-subtle rounded-md px-1.5 py-1">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-5 h-5 rounded cursor-pointer bg-transparent border-0"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-20 bg-transparent text-xs font-mono outline-none"
        />
      </div>
    </div>
  )
}

// ============ SETTINGS PANEL ============
function SettingsPanel({ surveyId }: { surveyId: string }) {
  const survey = useSurveyStore((s) => s.surveys.find((x) => x.id === surveyId))!
  const setSettings = useSurveyStore((s) => s.setSettings)
  return (
    <div className="p-4 space-y-5">
      <FieldLabel label="Survey Status">
        <div className="grid grid-cols-2 gap-1.5">
          {(['draft', 'published'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSettings(surveyId, { status: s })}
              className={`py-2 rounded-lg text-xs font-semibold capitalize transition ${survey.settings.status === s ? 'btn-brand' : 'bg-surface-elevated text-text-secondary border border-border-subtle hover:border-brand'}`}
            >
              {s}
            </button>
          ))}
        </div>
      </FieldLabel>
      <FieldLabel label="Collect responses until">
        <input
          type="date"
          value={survey.settings.collectUntil ?? ''}
          onChange={(e) => setSettings(surveyId, { collectUntil: e.target.value })}
          className="w-full px-3 py-2 rounded-lg bg-surface-elevated border border-border-subtle focus:border-brand outline-none text-xs"
        />
      </FieldLabel>
      <div className="flex items-center justify-between">
        <span className="text-xs text-text-secondary">Show progress bar</span>
        <Toggle
          on={survey.settings.showProgress}
          onChange={(v) => setSettings(surveyId, { showProgress: v })}
        />
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-text-secondary">Show question numbers</span>
        <Toggle
          on={survey.settings.showNumbers}
          onChange={(v) => setSettings(surveyId, { showNumbers: v })}
        />
      </div>
      <FieldLabel label="Thank you message">
        <textarea
          value={survey.settings.thankYouMessage}
          onChange={(e) => setSettings(surveyId, { thankYouMessage: e.target.value })}
          rows={2}
          className="w-full px-3 py-2 rounded-lg bg-surface-elevated border border-border-subtle focus:border-brand outline-none text-xs resize-none"
        />
      </FieldLabel>
      <FieldLabel label="Redirect after submit (URL)">
        <input
          value={survey.settings.redirectUrl ?? ''}
          onChange={(e) => setSettings(surveyId, { redirectUrl: e.target.value })}
          placeholder="https://..."
          className="w-full px-3 py-2 rounded-lg bg-surface-elevated border border-border-subtle focus:border-brand outline-none text-xs"
        />
      </FieldLabel>
      <div className="pt-3 border-t border-border-subtle text-[10px] text-text-muted">
        Public URL:{' '}
        <div className="font-mono mt-1 break-all text-text-secondary">/s/{survey.publicId}</div>
      </div>
    </div>
  )
}

// ============ CANVAS ============
function Canvas({
  survey,
  selected,
  onSelect,
}: {
  survey: ReturnType<typeof useSurveyStore.getState>['surveys'][0]
  selected: string | null
  onSelect: (id: string) => void
}) {
  const [page, setPage] = useState(0)
  useEffect(() => {
    setPage(0)
  }, [])

  const q = survey.questions

  if (q.length === 0) {
    return (
      <div
        className="h-full grid place-items-center p-10 text-center"
        style={{ color: survey.style.textColor }}
      >
        <div className="opacity-70">
          <Plus className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <h2 className="text-xl font-semibold">Add your first question</h2>
          <p className="mt-1 text-sm opacity-60">Use the sidebar on the left to get started.</p>
        </div>
      </div>
    )
  }

  if (survey.layoutMode === 'paginated') {
    const cur = q[Math.min(page, q.length - 1)]
    return (
      <div
        className="min-h-full p-10 flex flex-col"
        style={{ fontFamily: survey.style.fontFamily }}
      >
        {survey.settings.showProgress && (
          <div className="max-w-2xl mx-auto w-full mb-8">
            <div className="text-xs opacity-70 mb-2">
              Question {page + 1} of {q.length}
            </div>
            <div className="h-1 rounded-full" style={{ background: survey.style.cardColor }}>
              <div
                className="h-1 rounded-full transition-all"
                style={{
                  width: `${((page + 1) / q.length) * 100}%`,
                  background: survey.style.primaryColor,
                }}
              />
            </div>
          </div>
        )}
        <div className="flex-1 grid place-items-center">
          <div className="max-w-2xl w-full">
            <CanvasQuestion
              q={cur}
              index={page}
              survey={survey}
              selected={selected === cur.id}
              onSelect={() => onSelect(cur.id)}
            />
            <div className="mt-8 flex items-center gap-3">
              <button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                className="px-4 py-2 rounded-lg border text-sm disabled:opacity-40"
                style={{ borderColor: survey.style.cardColor }}
              >
                ← Back
              </button>
              <button
                onClick={() => setPage(Math.min(q.length - 1, page + 1))}
                disabled={page === q.length - 1}
                className="px-4 py-2 rounded-lg text-sm text-white disabled:opacity-40"
                style={{ background: survey.style.primaryColor }}
              >
                Next →
              </button>
              <div className="ml-auto flex gap-1.5">
                {q.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i)}
                    className="w-2 h-2 rounded-full transition"
                    style={{
                      background: i === page ? survey.style.primaryColor : survey.style.cardColor,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-full p-10" style={{ fontFamily: survey.style.fontFamily }}>
      <div className="max-w-2xl mx-auto space-y-5">
        {q.map((qq, i) => (
          <CanvasQuestion
            key={qq.id}
            q={qq}
            index={i}
            survey={survey}
            selected={selected === qq.id}
            onSelect={() => onSelect(qq.id)}
          />
        ))}
        <button
          className="w-full py-3 rounded-lg text-sm font-semibold text-white"
          style={{ background: survey.style.primaryColor }}
        >
          Submit
        </button>
      </div>
    </div>
  )
}

function CanvasQuestion({ q, index, survey, selected, onSelect }: any) {
  const { removeQuestion, duplicateQuestion } = useSurveyStore()
  const sizeCls =
    survey.style.questionSize === 'L'
      ? 'text-3xl'
      : survey.style.questionSize === 'S'
        ? 'text-lg'
        : 'text-2xl'
  return (
    <div className="relative">
      <button
        onClick={onSelect}
        className={`block w-full text-left p-6 rounded-xl transition border-2 ${selected ? 'border-dashed' : 'border-solid'}`}
        style={{
          background: survey.style.cardColor,
          borderColor: selected ? survey.style.primaryColor : 'transparent',
        }}
      >
        {survey.settings.showNumbers && (
          <div className="text-xs font-mono opacity-60 mb-2">
            Q{index + 1}
            {q.required && <span style={{ color: survey.style.primaryColor }}> *</span>}
          </div>
        )}
        <h3 className={`font-semibold ${sizeCls}`}>{q.text}</h3>
        <div className="mt-4">{renderInput(q, survey.style)}</div>
      </button>
      {selected && (
        <div className="absolute -bottom-3 right-4 flex gap-1 bg-surface-elevated border border-border-strong rounded-lg shadow-xl px-1 py-1">
          <button className="p-1.5 rounded hover:bg-surface-raised text-text-secondary text-xs">
            Edit ✎
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              duplicateQuestion(survey.id, q.id)
            }}
            className="p-1.5 rounded hover:bg-surface-raised text-text-secondary"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              removeQuestion(survey.id, q.id)
            }}
            className="p-1.5 rounded hover:bg-surface-raised text-danger"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  )
}

function renderInput(q: Question, style: any) {
  const inputBase = {
    background: 'transparent',
    borderColor: style.cardColor,
    color: style.textColor,
  }
  if (q.type === 'short-text' || q.type === 'number')
    return (
      <input
        disabled
        placeholder="Your answer..."
        type={q.type === 'number' ? 'number' : 'text'}
        className="w-full px-3 py-2.5 rounded-lg border-2 outline-none text-base placeholder:opacity-50"
        style={{ ...inputBase, borderColor: `${style.primaryColor}30` }}
      />
    )
  if (q.type === 'long-text')
    return (
      <textarea
        disabled
        placeholder="Your answer..."
        rows={3}
        className="w-full px-3 py-2.5 rounded-lg border-2 outline-none text-base placeholder:opacity-50 resize-none"
        style={{ ...inputBase, borderColor: `${style.primaryColor}30` }}
      />
    )
  if (q.type === 'multiple-choice' || q.type === 'checkboxes')
    return (
      <div className="space-y-2">
        {(q.options ?? []).map((o, i) => (
          <div
            key={i}
            className="px-4 py-3 rounded-lg border-2 text-sm flex items-center gap-3"
            style={{ borderColor: `${style.primaryColor}30` }}
          >
            <span
              className={`w-4 h-4 ${q.type === 'checkboxes' ? 'rounded' : 'rounded-full'} border-2`}
              style={{ borderColor: style.primaryColor }}
            />
            {o}
          </div>
        ))}
      </div>
    )
  if (q.type === 'rating') {
    const scale = q.scale ?? 5
    return (
      <div>
        <div className="flex gap-2">
          {Array.from({ length: scale }).map((_, i) => (
            <div
              key={i}
              className="w-10 h-10 rounded-lg border-2 grid place-items-center text-sm font-medium"
              style={{ borderColor: `${style.primaryColor}40` }}
            >
              {i + 1}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-xs opacity-60">
          <span>{q.minLabel}</span>
          <span>{q.maxLabel}</span>
        </div>
      </div>
    )
  }
  if (q.type === 'dropdown')
    return (
      <select
        disabled
        className="w-full px-3 py-2.5 rounded-lg border-2 outline-none text-base"
        style={{ ...inputBase, borderColor: `${style.primaryColor}30` }}
      >
        {(q.options ?? []).map((o, i) => (
          <option key={i}>{o}</option>
        ))}
      </select>
    )
  if (q.type === 'date')
    return (
      <input
        disabled
        type="date"
        className="px-3 py-2.5 rounded-lg border-2 outline-none text-base"
        style={{ ...inputBase, borderColor: `${style.primaryColor}30` }}
      />
    )
  if (q.type === 'image')
    return (
      <div
        className="w-full px-3 py-6 rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-2 opacity-60"
        style={{ ...inputBase, borderColor: `${style.primaryColor}50` }}
      >
        <span className="text-2xl">🖼️</span>
        <span className="text-sm font-medium">Click to upload image</span>
        <span className="text-xs opacity-70">PNG, JPG, GIF</span>
      </div>
    )
  return null
}

// ============ AI PANEL ============
const PRESET_PROMPTS = [
  {
    label: 'Generate questions',
    prompt: "Generate 5 survey questions about [topic]. I'm surveying [audience].",
  },
  {
    label: 'Refine language',
    prompt: 'Review my questions and suggest clearer, more professional wording.',
  },
  {
    label: 'Suggest options',
    prompt: 'Suggest answer options for question: [selected question text]',
  },
  {
    label: 'Style this survey',
    prompt: 'Generate a visual style for this survey. The vibe should be...',
  },
  {
    label: 'Make it shorter',
    prompt: 'Help me cut this survey down to the 3 most essential questions.',
  },
  {
    label: 'Translate to Hindi',
    prompt: 'Translate all my questions to Hindi while keeping their meaning.',
  },
]

function AIPanel({ surveyId, onClose }: { surveyId: string; onClose: () => void }) {
  const addQuestionsBulk = useSurveyStore((s) => s.addQuestionsBulk)
  const setStyle = useSurveyStore((s) => s.setStyle)
  const [messages, setMessages] = useState<
    { role: 'user' | 'ai'; text: string; parsedAction?: any; imageUrl?: string }[]
  >([
    {
      role: 'ai',
      text: "Hi! I'm your AI assistant. I can help you write questions, style your survey, or improve your wording. What can I help with?",
    },
  ])
  const [input, setInput] = useState('')
  const [attachmentUrl, setAttachmentUrl] = useState<string | null>(null)
  const [typing, setTyping] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [])

  const send = async () => {
    if ((!input.trim() && !attachmentUrl) || typing) return
    const userMsg = input.trim()
    const currentAttachment = attachmentUrl
    setMessages((m) => [
      ...m,
      { role: 'user', text: userMsg, imageUrl: currentAttachment || undefined },
    ])
    setInput('')
    setAttachmentUrl(null)
    if (inputRef.current) inputRef.current.style.height = 'auto'
    setTyping(true)

    try {
      // Client-side interception: if user attached an image and wants it as background
      const bgKeywords = /background|bg|wallpaper|backdrop|behind/i
      if (currentAttachment && bgKeywords.test(userMsg)) {
        // Directly apply the image as the survey background — the AI can't return the URL
        setStyle(surveyId, { backgroundImage: currentAttachment })
        setMessages((m) => [
          ...m,
          {
            role: 'ai',
            text: "Done! I've set your uploaded image as the survey background. You can see it in the preview.",
            parsedAction: {
              action: 'set_background_image',
              payload: { backgroundImage: currentAttachment },
            },
          },
        ])
        return
      }

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content:
                'You are an expert survey builder AI. You must be decisive. When a user asks you to generate questions, IMMEDIATELY return a JSON block wrapped in ```json with the format {"action": "add_questions", "payload": [{"type": "short-text", "text": "Question text here?", "options": ["Option 1", "Option 2"]}]}. Do NOT ask for clarification before generating questions; make your best guess based on the topic. When a user asks for a visual style, IMMEDIATELY return a JSON block wrapped in ```json with the format {"action": "apply_style", "payload": {"primaryColor": "hex", "backgroundColor": "hex", "cardColor": "hex", "textColor": "hex", "fontFamily": "Inter", "questionSize": "M"}}. If the user attaches an image and asks to use it as a background, respond with: "I\'ve set the image as the background." The backgroundImage will be handled automatically by the system. Do NOT output conversational filler if returning JSON.',
            },
            ...messages.map((m) => ({
              role: m.role === 'ai' ? 'assistant' : 'user',
              content: m.imageUrl
                ? [
                    { type: 'text', text: m.text },
                    { type: 'image_url', image_url: { url: m.imageUrl } },
                  ]
                : m.text,
            })),
            {
              role: 'user',
              content: currentAttachment
                ? [
                    { type: 'text', text: userMsg || 'Analyze this image.' },
                    { type: 'image_url', image_url: { url: currentAttachment } },
                  ]
                : userMsg,
            },
          ],
          useVision: !!currentAttachment || messages.some((m) => !!m.imageUrl),
        }),
      })
      if (!res.ok) throw new Error('Failed')
      const data = await res.json()
      let replyText = data.choices?.[0]?.message?.content || 'Sorry, I encountered an error.'

      let parsedAction = null
      const jsonRegex = /```json\s*([\s\S]*?)\s*```/g
      let match
      while ((match = jsonRegex.exec(replyText)) !== null) {
        try {
          const parsed = JSON.parse(match[1])
          if (parsed.action) {
            parsedAction = parsed
            replyText = replyText.replace(match[0], '').trim()
            break
          }
        } catch (_e) {}
      }

      setMessages((m) => [...m, { role: 'ai', text: replyText, parsedAction }])
    } catch (_e) {
      setMessages((m) => [...m, { role: 'ai', text: 'Error connecting to AI.' }])
    } finally {
      setTyping(false)
    }
  }

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`
  }

  return (
    <div className="w-[360px] border-l border-border-subtle bg-surface-raised flex flex-col z-30 animate-in slide-in-from-right duration-300">
      <div className="h-14 px-4 flex items-center justify-between border-b border-border-subtle">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand to-brand-dark grid place-items-center text-surface-base text-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="text-sm font-bold text-text-primary">AI Assistant</div>
            <div className="text-[10px] text-text-muted">Powered by FormCraft AI</div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-surface-elevated text-text-secondary transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-3 border-b border-border-subtle">
        <div className="text-[10px] uppercase tracking-wider text-text-muted mb-2">
          Quick actions
        </div>
        <div className="flex flex-wrap gap-1.5">
          {PRESET_PROMPTS.map((p) => (
            <button
              key={p.label}
              onClick={() => {
                setInput(p.prompt)
                setTimeout(() => inputRef.current?.focus(), 10)
              }}
              className="px-2.5 py-1 rounded-full text-[11px] bg-surface-elevated border border-border-subtle hover:border-brand hover:text-text-primary text-text-secondary transition"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start gap-2'}`}
          >
            {m.role === 'ai' && (
              <div className="w-6 h-6 shrink-0 rounded-full bg-gradient-to-br from-brand to-brand-dark grid place-items-center text-surface-base text-[10px]">
                ✨
              </div>
            )}
            <div
              className={`max-w-[85%] px-3 py-2.5 rounded-2xl text-sm leading-relaxed ${m.role === 'user' ? 'bg-brand text-surface-base font-medium rounded-tr-sm' : 'bg-surface-elevated text-text-primary rounded-tl-sm'}`}
            >
              {m.imageUrl && (
                <img
                  src={m.imageUrl}
                  alt="attachment"
                  className="w-full max-h-32 object-cover rounded-lg mb-2 opacity-90"
                />
              )}
              {m.text}
              {m.parsedAction && m.parsedAction.action === 'add_questions' && (
                <div className="mt-3 p-3 rounded-lg bg-surface-base border border-border-subtle">
                  <div className="text-xs font-bold mb-3 flex items-center gap-1.5 text-brand">
                    <Sparkles className="w-3.5 h-3.5" /> Generated {m.parsedAction.payload.length}{' '}
                    Questions
                  </div>
                  <div className="space-y-3 mb-3 max-h-60 overflow-y-auto pr-1">
                    {m.parsedAction.payload.map((q: any, idx: number) => (
                      <div
                        key={idx}
                        className="bg-surface-elevated rounded border border-border-subtle p-2"
                      >
                        <div className="text-xs font-semibold text-text-primary mb-1">
                          {idx + 1}. {q.text}
                        </div>
                        <div className="text-[10px] text-text-muted mb-1 px-1.5 py-0.5 bg-surface-base rounded-md inline-block border border-border-subtle capitalize">
                          {q.type.replace('-', ' ')}
                        </div>
                        {q.options && q.options.length > 0 && (
                          <ul className="text-xs text-text-secondary mt-1 pl-4 list-disc space-y-0.5">
                            {q.options.map((opt: string, oIdx: number) => (
                              <li key={oIdx}>{opt}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => addQuestionsBulk(surveyId, m.parsedAction.payload)}
                    className="w-full py-1.5 rounded bg-brand text-surface-base text-xs font-semibold hover:bg-brand/90 transition"
                  >
                    Approve & Add
                  </button>
                </div>
              )}
              {m.parsedAction && m.parsedAction.action === 'apply_style' && (
                <div className="mt-2 p-2 rounded-lg bg-surface-base border border-border-subtle">
                  <div className="text-xs font-semibold mb-2 text-text-secondary">
                    Style Preview
                  </div>
                  <div
                    className="h-16 rounded-md p-2 mb-2 flex flex-col gap-1 border border-border-subtle"
                    style={{ background: m.parsedAction.payload.backgroundColor }}
                  >
                    <div
                      className="h-2 w-12 rounded"
                      style={{ background: m.parsedAction.payload.primaryColor }}
                    />
                    <div
                      className="mt-1 h-2 w-20 rounded opacity-60"
                      style={{ background: m.parsedAction.payload.textColor }}
                    />
                    <div
                      className="mt-1 flex-1 rounded-sm opacity-50"
                      style={{ background: m.parsedAction.payload.cardColor }}
                    />
                  </div>
                  <button
                    onClick={() => setStyle(surveyId, m.parsedAction.payload)}
                    className="w-full py-1.5 rounded bg-brand/10 text-brand text-xs font-semibold hover:bg-brand/20 transition"
                  >
                    Apply Style
                  </button>
                </div>
              )}
              {m.parsedAction && m.parsedAction.action === 'set_background_image' && (
                <div className="mt-2 p-2 rounded-lg bg-surface-base border border-border-subtle">
                  <div className="text-xs font-semibold mb-2 text-text-secondary flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-brand" /> Background Applied
                  </div>
                  <img
                    src={m.parsedAction.payload.backgroundImage}
                    alt="Background"
                    className="w-full h-20 object-cover rounded-md border border-border-subtle"
                  />
                </div>
              )}
            </div>
          </div>
        ))}
        {typing && (
          <div className="flex gap-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-brand to-brand-dark grid place-items-center text-surface-base text-[10px]">
              ✨
            </div>
            <div className="px-3 py-2.5 rounded-2xl rounded-tl-sm bg-surface-elevated flex gap-1 items-center">
              <Dot delay={0} />
              <Dot delay={150} />
              <Dot delay={300} />
            </div>
          </div>
        )}
      </div>

      <div className="p-3 border-t border-border-subtle">
        {attachmentUrl && (
          <div className="relative inline-block mb-2">
            <img
              src={attachmentUrl}
              alt="preview"
              className="h-16 w-16 object-cover rounded-lg border border-border-subtle"
            />
            <button
              onClick={() => setAttachmentUrl(null)}
              className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-surface-raised border border-border-subtle text-text-secondary rounded-full flex items-center justify-center text-[10px] hover:text-danger hover:border-danger"
            >
              ✕
            </button>
          </div>
        )}
        <div className="flex gap-2 items-end">
          <label className="p-2.5 rounded-xl bg-surface-elevated hover:bg-surface-raised border border-border-subtle text-text-secondary cursor-pointer transition">
            <Plus className="w-4 h-4" />
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (!file) return
                const reader = new FileReader()
                reader.onload = (evt) => {
                  const img = new Image()
                  img.onload = () => {
                    const canvas = document.createElement('canvas')
                    let width = img.width
                    let height = img.height
                    const maxDim = 800
                    if (width > maxDim || height > maxDim) {
                      if (width > height) {
                        height = Math.floor(height * (maxDim / width))
                        width = maxDim
                      } else {
                        width = Math.floor(width * (maxDim / height))
                        height = maxDim
                      }
                    }
                    canvas.width = width
                    canvas.height = height
                    const ctx = canvas.getContext('2d')
                    ctx?.drawImage(img, 0, 0, width, height)
                    setAttachmentUrl(canvas.toDataURL('image/jpeg', 0.8))
                  }
                  img.src = evt.target?.result as string
                }
                reader.readAsDataURL(file)
              }}
            />
          </label>
          <textarea
            ref={inputRef}
            value={input}
            onChange={handleInput}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                if (input.trim() || attachmentUrl) send()
              }
            }}
            rows={1}
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 rounded-xl bg-surface-elevated border border-border-subtle focus:border-brand outline-none text-sm resize-none max-h-32"
          />
          <button
            onClick={send}
            disabled={!input.trim() && !attachmentUrl}
            className="p-2.5 rounded-xl btn-brand hover:shadow-brand-glow disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

function Dot({ delay }: { delay: number }) {
  return (
    <span
      className="w-1.5 h-1.5 rounded-full bg-text-secondary animate-bounce"
      style={{ animationDelay: `${delay}ms` }}
    />
  )
}
