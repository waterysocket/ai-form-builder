import { create } from 'zustand'

export type QuestionType =
  | 'short-text'
  | 'long-text'
  | 'multiple-choice'
  | 'checkboxes'
  | 'rating'
  | 'number'
  | 'dropdown'
  | 'date'
  | 'image'

export interface Question {
  id: string
  type: QuestionType
  text: string
  required?: boolean
  options?: string[]
  scale?: 5 | 10
  minLabel?: string
  maxLabel?: string
  correctAnswer?: string
}

export type SurveyType = 'form' | 'survey' | 'quiz'

export interface SurveyStyle {
  primaryColor: string
  backgroundColor: string
  cardColor: string
  textColor: string
  fontFamily: string
  questionSize: 'S' | 'M' | 'L'
  preset?: string
  backgroundImage?: string
}

export interface SurveySettings {
  status: 'draft' | 'published'
  collectUntil?: string
  showProgress: boolean
  showNumbers: boolean
  thankYouMessage: string
  redirectUrl?: string
}

export interface Survey {
  id: string
  publicId: string
  title: string
  surveyType: SurveyType
  layoutMode: 'paginated' | 'scrollable'
  questions: Question[]
  style: SurveyStyle
  settings: SurveySettings
  responses: number
  updatedAt: string
}

const defaultStyle: SurveyStyle = {
  primaryColor: '#6C63FF',
  backgroundColor: '#0D0D14',
  cardColor: '#13131F',
  textColor: '#F0F0FF',
  fontFamily: 'Inter',
  questionSize: 'M',
  preset: 'Midnight',
}

const defaultSettings: SurveySettings = {
  status: 'draft',
  showProgress: true,
  showNumbers: true,
  thankYouMessage: 'Thanks for your response! 🎉',
}

const sampleQuestions: Question[] = [
  { id: 'q1', type: 'short-text', text: "What's your name?", required: true },
  {
    id: 'q2',
    type: 'multiple-choice',
    text: 'How did you hear about us?',
    options: ['Social media', 'Friend referral', 'Search engine', 'Other'],
    required: false,
  },
  {
    id: 'q3',
    type: 'rating',
    text: 'How would you rate your experience?',
    scale: 5,
    minLabel: 'Poor',
    maxLabel: 'Excellent',
    required: true,
  },
  { id: 'q4', type: 'long-text', text: "Anything else you'd like to share?", required: false },
]

const seedSurveys: Survey[] = [
  {
    id: 'survey-1',
    publicId: 'fc-abc123',
    title: 'Customer Feedback Form',
    surveyType: 'form',
    layoutMode: 'paginated',
    questions: sampleQuestions,
    style: defaultStyle,
    settings: { ...defaultSettings, status: 'published' },
    responses: 124,
    updatedAt: '2h ago',
  },
  {
    id: 'survey-2',
    publicId: 'fc-def456',
    title: 'Product Launch Survey',
    surveyType: 'survey',
    layoutMode: 'scrollable',
    questions: sampleQuestions.slice(0, 2),
    style: { ...defaultStyle, primaryColor: '#22C55E', preset: 'Forest Green' },
    settings: defaultSettings,
    responses: 42,
    updatedAt: 'yesterday',
  },
  {
    id: 'survey-3',
    publicId: 'fc-ghi789',
    title: 'Onboarding Questionnaire',
    surveyType: 'quiz',
    layoutMode: 'paginated',
    questions: sampleQuestions,
    style: { ...defaultStyle, primaryColor: '#FF6584', preset: 'Sunset Coral' },
    settings: { ...defaultSettings, status: 'published' },
    responses: 287,
    updatedAt: '3d ago',
  },
]

interface SurveyStoreState {
  surveys: Survey[]
  customStyles: SurveyStyle[]
  getSurvey: (id: string) => Survey | undefined
  getSurveyByPublicId: (pid: string) => Survey | undefined
  createSurvey: () => Survey
  updateSurvey: (id: string, patch: Partial<Survey>) => void
  addQuestion: (id: string, type: QuestionType) => void
  addQuestionsBulk: (id: string, questions: Partial<Question>[]) => void
  updateQuestion: (id: string, qid: string, patch: Partial<Question>) => void
  removeQuestion: (id: string, qid: string) => void
  duplicateQuestion: (id: string, qid: string) => void
  moveQuestion: (id: string, qid: string, dir: -1 | 1) => void
  setStyle: (id: string, patch: Partial<SurveyStyle>) => void
  setSettings: (id: string, patch: Partial<SurveySettings>) => void
  saveCustomStyle: (style: SurveyStyle) => void
  deleteCustomStyle: (presetName: string) => void
  addOrUpdateSurvey: (survey: Survey) => void
}

const defaultQuestion = (type: QuestionType): Omit<Question, 'id'> => {
  const base: Omit<Question, 'id'> = { type, text: 'New question', required: false }
  if (type === 'multiple-choice' || type === 'checkboxes' || type === 'dropdown') {
    return { ...base, options: ['Option 1', 'Option 2', 'Option 3'] }
  }
  if (type === 'rating') {
    return { ...base, scale: 5, minLabel: 'Poor', maxLabel: 'Great' }
  }
  return base
}

export function parseApiSurvey(apiSurvey: any, apiQuestions: any[]): Survey {
  let style = { ...defaultStyle }
  let settings = { ...defaultSettings }
  let layoutMode: 'paginated' | 'scrollable' = 'paginated'
  let surveyType: SurveyType = 'survey'

  if (apiSurvey.description) {
    try {
      const config = JSON.parse(apiSurvey.description)
      if (config.style) style = { ...style, ...config.style }
      if (config.settings) settings = { ...settings, ...config.settings }
      if (config.layoutMode) layoutMode = config.layoutMode
      if (config.surveyType) surveyType = config.surveyType
    } catch (e) {
      console.error('Failed to parse survey description/config', e)
    }
  }

  // Sync is_published with status
  settings = {
    ...settings,
    status: apiSurvey.is_published ? 'published' : 'draft',
  }

  const questions = (apiQuestions || []).map((q: any) => {
    let options: string[] | undefined
    let required = false
    let scale: 5 | 10 | undefined
    let minLabel: string | undefined
    let maxLabel: string | undefined

    if (q.options) {
      try {
        const parsed = typeof q.options === 'string' ? JSON.parse(q.options) : q.options
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          options = parsed.options || undefined
          required = !!parsed.required
          scale = parsed.scale || undefined
          minLabel = parsed.minLabel || undefined
          maxLabel = parsed.maxLabel || undefined
          // correctAnswer is stored per-question for quiz mode
        } else if (Array.isArray(parsed)) {
          options = parsed
        }
      } catch (e) {
        console.error('Failed to parse question options', e)
      }
    }
    return {
      id: q.id,
      type: q.type,
      text: q.text,
      required,
      options,
      scale,
      minLabel,
      maxLabel,
      correctAnswer: undefined,
    } as Question
  })

  return {
    id: apiSurvey.id,
    publicId: apiSurvey.id,
    surveyType,
    title: apiSurvey.title,
    layoutMode,
    questions,
    style,
    settings,
    responses: apiSurvey.responses_count || 0,
    updatedAt: apiSurvey.updated_at || apiSurvey.created_at,
  }
}

export const useSurveyStore = create<SurveyStoreState>((set, get) => ({
  surveys: seedSurveys,
  customStyles: [],
  getSurvey: (id) => get().surveys.find((s) => s.id === id),
  getSurveyByPublicId: (pid) => get().surveys.find((s) => s.publicId === pid),
  createSurvey: () => {
    const id = `fc-${Math.random().toString(36).slice(2, 8)}`
    const survey: Survey = {
      id,
      publicId: id,
      title: 'Untitled Survey',
      surveyType: 'survey',
      layoutMode: 'paginated',
      questions: [],
      style: defaultStyle,
      settings: defaultSettings,
      responses: 0,
      updatedAt: 'just now',
    }
    set((s) => ({ surveys: [survey, ...s.surveys] }))
    return survey
  },
  updateSurvey: (id, patch) =>
    set((s) => ({ surveys: s.surveys.map((x) => (x.id === id ? { ...x, ...patch } : x)) })),
  addQuestion: (id, type) =>
    set((s) => ({
      surveys: s.surveys.map((x) =>
        x.id === id
          ? {
              ...x,
              questions: [...x.questions, { id: `q-${Date.now()}`, ...defaultQuestion(type) }],
            }
          : x,
      ),
    })),
  addQuestionsBulk: (id, qs) =>
    set((s) => ({
      surveys: s.surveys.map((x) =>
        x.id === id
          ? {
              ...x,
              questions: [
                ...x.questions,
                ...(qs.map((q, i) => ({
                  id: `q-${Date.now()}-${i}`,
                  ...defaultQuestion(q.type || 'short-text'),
                  ...q,
                })) as Question[]),
              ],
            }
          : x,
      ),
    })),
  updateQuestion: (id, qid, patch) =>
    set((s) => ({
      surveys: s.surveys.map((x) =>
        x.id === id
          ? { ...x, questions: x.questions.map((q) => (q.id === qid ? { ...q, ...patch } : q)) }
          : x,
      ),
    })),
  removeQuestion: (id, qid) =>
    set((s) => ({
      surveys: s.surveys.map((x) =>
        x.id === id ? { ...x, questions: x.questions.filter((q) => q.id !== qid) } : x,
      ),
    })),
  duplicateQuestion: (id, qid) =>
    set((s) => ({
      surveys: s.surveys.map((x) => {
        if (x.id !== id) return x
        const idx = x.questions.findIndex((q) => q.id === qid)
        if (idx < 0) return x
        const copy = { ...x.questions[idx], id: `q-${Date.now()}` }
        const next = [...x.questions]
        next.splice(idx + 1, 0, copy)
        return { ...x, questions: next }
      }),
    })),
  moveQuestion: (id, qid, dir) =>
    set((s) => ({
      surveys: s.surveys.map((x) => {
        if (x.id !== id) return x
        const idx = x.questions.findIndex((q) => q.id === qid)
        const ni = idx + dir
        if (idx < 0 || ni < 0 || ni >= x.questions.length) return x
        const next = [...x.questions]
        ;[next[idx], next[ni]] = [next[ni], next[idx]]
        return { ...x, questions: next }
      }),
    })),
  setStyle: (id, patch) =>
    set((s) => ({
      surveys: s.surveys.map((x) => (x.id === id ? { ...x, style: { ...x.style, ...patch } } : x)),
    })),
  setSettings: (id, patch) =>
    set((s) => ({
      surveys: s.surveys.map((x) =>
        x.id === id ? { ...x, settings: { ...x.settings, ...patch } } : x,
      ),
    })),
  saveCustomStyle: (style) =>
    set((s) => ({
      customStyles: [...s.customStyles, style],
    })),
  deleteCustomStyle: (presetName) =>
    set((s) => ({
      customStyles: s.customStyles.filter((c) => c.preset !== presetName),
    })),
  addOrUpdateSurvey: (survey) =>
    set((s) => {
      const exists = s.surveys.some((x) => x.id === survey.id)
      if (exists) {
        return {
          surveys: s.surveys.map((x) => (x.id === survey.id ? survey : x)),
        }
      } else {
        return {
          surveys: [...s.surveys, survey],
        }
      }
    }),
}))

interface AuthState {
  user: { name: string; email: string } | null
  signIn: (email: string, name?: string) => void
  signOut: () => void
  updateUser: (name: string) => void
}

export const useAuth = create<AuthState>((set) => ({
  user:
    typeof window !== 'undefined' && localStorage.getItem('fc-user')
      ? JSON.parse(localStorage.getItem('fc-user')!)
      : null,
  signIn: (email, name) => {
    const user = { email, name: name ?? email.split('@')[0] }
    if (typeof window !== 'undefined') localStorage.setItem('fc-user', JSON.stringify(user))
    set({ user })
  },
  signOut: () => {
    if (typeof window !== 'undefined') localStorage.removeItem('fc-user')
    set({ user: null })
  },
  updateUser: (name) =>
    set((state) => {
      if (!state.user) return state
      const user = { ...state.user, name }
      if (typeof window !== 'undefined') localStorage.setItem('fc-user', JSON.stringify(user))
      return { user }
    }),
}))
