import { createFileRoute, Link, useParams } from '@tanstack/react-router'
import {
  ArrowLeft,
  BarChart3,
  CheckCircle2,
  Download,
  Loader2,
  Trophy,
  Users,
  XCircle,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { api } from '@/lib/api-client'

export const Route = createFileRoute('/analytics/$surveyId')({
  head: () => ({ meta: [{ title: 'Analytics — FormCraft' }] }),
  component: AnalyticsPage,
})

const CUSTOM_COLORS = [
  '#6C63FF',
  '#22C55E',
  '#FF6584',
  '#F59E0B',
  '#3B82F6',
  '#8B5CF6',
  '#EC4899',
  '#14B8A6',
]

function AnalyticsPage() {
  const { surveyId } = useParams({ from: '/analytics/$surveyId' })
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.surveys.analytics(surveyId)
        setData(res)
      } catch (err: any) {
        setError(err.message || 'Failed to load analytics')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [surveyId])

  const surveyType = useMemo(() => {
    if (!data?.survey?.description) return 'survey'
    try {
      const config = JSON.parse(data.survey.description)
      return config.surveyType || 'survey'
    } catch {
      return 'survey'
    }
  }, [data])

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-base flex items-center justify-center text-text-secondary">
        <Loader2 className="w-8 h-8 animate-spin text-brand" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-surface-base flex flex-col items-center justify-center text-text-secondary p-6 text-center">
        <div className="text-danger mb-4">Error: {error}</div>
        <Link to="/builder/dashboard" className="btn-brand px-4 py-2 rounded-xl text-sm">
          Return to Dashboard
        </Link>
      </div>
    )
  }

  const { survey, questions, responses, totalResponses } = data

  const handleDownloadCSV = () => {
    if (!responses.length) return
    const headers = ['Submitted At', ...questions.map((q: any) => q.text)]
    const rows = responses.map((r: any) => {
      const date = new Date(r.created_at).toLocaleString()
      const ans = questions.map((q: any) => {
        let val = r.answers[q.id] || ''
        if (typeof val === 'string') {
          // Escape quotes and wrap in quotes if contains comma
          val = val.replace(/"/g, '""')
          if (val.includes(',')) val = `"${val}"`
        }
        return val
      })
      return [date, ...ans].join(',')
    })
    const csvContent = [headers.join(','), ...rows].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute(
      'download',
      `${survey.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_responses.csv`,
    )
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Calculate generic completion rate
  let completionRate = 0
  if (totalResponses > 0 && questions.length > 0) {
    const requiredQs = questions.filter((q: any) => {
      try {
        const opts = JSON.parse(q.options || '{}')
        return opts.required || q.required
      } catch {
        return q.required
      }
    })

    if (requiredQs.length === 0) {
      completionRate = 100
    } else {
      const completed = responses.filter((r: any) => {
        return requiredQs.every((q: any) => r.answers[q.id] && r.answers[q.id].trim() !== '')
      }).length
      completionRate = Math.round((completed / totalResponses) * 100)
    }
  }

  // Quiz calculations
  let quizStats = null
  if (surveyType === 'quiz') {
    const scoredQuestions = questions.filter((q: any) => {
      try {
        const opts = JSON.parse(q.options || '{}')
        return !!opts.correctAnswer || !!q.correctAnswer
      } catch {
        return !!q.correctAnswer
      }
    })

    if (scoredQuestions.length > 0) {
      let totalScores = 0
      const scoreDist: Record<string, number> = {}
      const qStats: Record<
        string,
        { correct: number; total: number; wrongAnswers: Record<string, number> }
      > = {}

      scoredQuestions.forEach((q: any) => {
        qStats[q.id] = { correct: 0, total: 0, wrongAnswers: {} }
      })

      responses.forEach((r: any) => {
        let score = 0
        scoredQuestions.forEach((q: any) => {
          let expected = ''
          try {
            const opts = JSON.parse(q.options || '{}')
            expected = opts.correctAnswer || q.correctAnswer || ''
          } catch {
            expected = q.correctAnswer || ''
          }

          const actual = r.answers[q.id] || ''
          qStats[q.id].total++

          if (expected.toLowerCase() === actual.toLowerCase()) {
            score++
            qStats[q.id].correct++
          } else if (actual) {
            qStats[q.id].wrongAnswers[actual] = (qStats[q.id].wrongAnswers[actual] || 0) + 1
          }
        })
        totalScores += score
        scoreDist[score] = (scoreDist[score] || 0) + 1
      })

      quizStats = {
        avgScore: (totalScores / totalResponses).toFixed(1),
        maxScore: scoredQuestions.length,
        scoreDist: Object.entries(scoreDist)
          .map(([score, count]) => ({ score: `${score}/${scoredQuestions.length}`, count }))
          .sort((a, b) => parseInt(a.score, 10) - parseInt(b.score, 10)),
        qStats,
      }
    }
  }

  const typeIcon = surveyType === 'form' ? '📋' : surveyType === 'quiz' ? '🧠' : '📊'
  const typeLabel = surveyType === 'form' ? 'Form' : surveyType === 'quiz' ? 'Quiz' : 'Survey'

  return (
    <div className="min-h-screen bg-surface-base text-text-primary flex flex-col">
      {/* Header */}
      <header className="border-b border-border-subtle glass sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/builder/dashboard"
              className="text-text-secondary hover:text-brand transition p-2 rounded-lg hover:bg-surface-elevated"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="h-6 w-px bg-border-subtle" />
            <div>
              <h1 className="font-bold text-lg leading-tight flex items-center gap-2">
                {survey.title}
              </h1>
              <div className="text-xs text-text-secondary flex items-center gap-1.5">
                <span className="px-1.5 py-0.5 rounded bg-surface-elevated border border-border-subtle font-medium text-[10px] uppercase tracking-wider text-brand flex items-center gap-1">
                  <span>{typeIcon}</span> {typeLabel}
                </span>
                <span>• Analytics</span>
              </div>
            </div>
          </div>
          <button
            onClick={handleDownloadCSV}
            disabled={!responses.length}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm btn-outline disabled:opacity-50 transition"
          >
            <Download className="w-4 h-4" /> Download CSV
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
        {/* Metrics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="rounded-2xl bg-surface-raised border border-border-subtle p-5">
            <div className="flex items-center gap-2 text-text-muted text-xs font-semibold uppercase tracking-widest mb-2">
              <Users className="w-4 h-4" /> Total Responses
            </div>
            <div className="text-3xl font-bold text-brand">{totalResponses}</div>
          </div>
          <div className="rounded-2xl bg-surface-raised border border-border-subtle p-5">
            <div className="flex items-center gap-2 text-text-muted text-xs font-semibold uppercase tracking-widest mb-2">
              <CheckCircle2 className="w-4 h-4" /> Completion Rate
            </div>
            <div className="text-3xl font-bold text-text-primary">{completionRate}%</div>
          </div>
          {surveyType === 'quiz' && quizStats && (
            <div className="rounded-2xl bg-surface-raised border border-border-subtle p-5">
              <div className="flex items-center gap-2 text-text-muted text-xs font-semibold uppercase tracking-widest mb-2">
                <Trophy className="w-4 h-4 text-amber-500" /> Average Score
              </div>
              <div className="text-3xl font-bold text-text-primary">
                {quizStats.avgScore}{' '}
                <span className="text-lg text-text-muted font-medium">/ {quizStats.maxScore}</span>
              </div>
            </div>
          )}
        </div>

        {!responses.length ? (
          <div className="text-center py-20 bg-surface-raised rounded-3xl border border-dashed border-border-strong">
            <BarChart3 className="w-12 h-12 text-text-muted mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-bold">No responses yet</h3>
            <p className="text-text-secondary mt-1 text-sm">
              Share your survey link to start collecting data.
            </p>
          </div>
        ) : (
          <>
            {surveyType === 'form' && <FormTableView questions={questions} responses={responses} />}
            {surveyType === 'survey' && (
              <SurveyChartsView questions={questions} responses={responses} />
            )}
            {surveyType === 'quiz' && (
              <QuizAnalyticsView questions={questions} responses={responses} stats={quizStats} />
            )}
          </>
        )}
      </main>
    </div>
  )
}

function FormTableView({ questions, responses }: { questions: any[]; responses: any[] }) {
  return (
    <div className="bg-surface-raised border border-border-subtle rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-surface-elevated text-text-secondary text-xs uppercase tracking-wider border-b border-border-subtle">
            <tr>
              <th className="px-6 py-4 font-semibold whitespace-nowrap">Submitted At</th>
              {questions.map((q: any) => (
                <th
                  key={q.id}
                  className="px-6 py-4 font-semibold max-w-[200px] truncate"
                  title={q.text}
                >
                  {q.text}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {responses.map((r: any) => (
              <tr key={r.id} className="hover:bg-surface-elevated/50 transition">
                <td className="px-6 py-4 whitespace-nowrap text-text-muted text-xs">
                  {new Date(r.created_at).toLocaleString()}
                </td>
                {questions.map((q: any) => (
                  <td
                    key={q.id}
                    className="px-6 py-4 max-w-[300px] truncate"
                    title={r.answers[q.id] || '-'}
                  >
                    {r.answers[q.id] || <span className="text-text-muted">-</span>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function SurveyChartsView({ questions, responses }: { questions: any[]; responses: any[] }) {
  return (
    <div className="space-y-6">
      {questions.map((q: any, i: number) => (
        <div key={q.id} className="bg-surface-raised border border-border-subtle rounded-2xl p-6">
          <div className="flex items-start gap-3 mb-6">
            <span className="shrink-0 w-6 h-6 rounded-md bg-surface-elevated border border-border-subtle grid place-items-center text-xs font-bold text-text-secondary">
              {i + 1}
            </span>
            <div>
              <h3 className="font-bold text-text-primary">{q.text}</h3>
              <p className="text-xs text-text-muted mt-1 capitalize">{q.type.replace('-', ' ')}</p>
            </div>
          </div>

          <div className="min-h-[250px]">
            <ChartRenderer q={q} responses={responses} />
          </div>
        </div>
      ))}
    </div>
  )
}

function ChartRenderer({ q, responses }: { q: any; responses: any[] }) {
  if (['multiple-choice', 'dropdown', 'checkboxes'].includes(q.type)) {
    const counts: Record<string, number> = {}
    responses.forEach((r) => {
      const val = r.answers[q.id]
      if (val) {
        if (q.type === 'checkboxes') {
          val
            .split(',')
            .map((v: string) => v.trim())
            .forEach((v: string) => {
              counts[v] = (counts[v] || 0) + 1
            })
        } else {
          counts[val] = (counts[val] || 0) + 1
        }
      }
    })
    const data = Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)

    if (!data.length) return <div className="text-center text-text-muted py-10">No answers yet</div>

    return (
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((_entry, index) => (
              <Cell key={`cell-${index}`} fill={CUSTOM_COLORS[index % CUSTOM_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#13131F',
              borderColor: '#2E2E3A',
              borderRadius: '8px',
            }}
            itemStyle={{ color: '#F0F0FF' }}
          />
          <Legend verticalAlign="bottom" height={36} />
        </PieChart>
      </ResponsiveContainer>
    )
  }

  if (q.type === 'rating') {
    const scale = q.scale || 5
    const data = Array.from({ length: scale }, (_, i) => ({ rating: String(i + 1), count: 0 }))
    responses.forEach((r) => {
      const val = r.answers[q.id]
      if (val) {
        const item = data.find((d) => d.rating === val)
        if (item) item.count++
      }
    })

    return (
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2E2E3A" vertical={false} />
          <XAxis
            dataKey="rating"
            stroke="#8F8F9D"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#8F8F9D"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
          />
          <Tooltip
            cursor={{ fill: '#2E2E3A', opacity: 0.4 }}
            contentStyle={{
              backgroundColor: '#13131F',
              borderColor: '#2E2E3A',
              borderRadius: '8px',
            }}
          />
          <Bar dataKey="count" fill="#6C63FF" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    )
  }

  // Text types
  const answers = responses.map((r) => r.answers[q.id]).filter(Boolean)
  if (!answers.length)
    return <div className="text-center text-text-muted py-10">No answers yet</div>

  return (
    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
      {answers.map((ans, i) => (
        <div
          key={i}
          className="p-3 bg-surface-elevated rounded-xl border border-border-subtle text-sm"
        >
          {ans}
        </div>
      ))}
    </div>
  )
}

function QuizAnalyticsView({
  questions,
  responses,
  stats,
}: {
  questions: any[]
  responses: any[]
  stats: any
}) {
  if (!stats)
    return (
      <div className="text-center text-text-muted py-10">
        No scored questions found. Add correct answers to your questions in the builder.
      </div>
    )

  const qAccuracyData = questions
    .filter((q: any) => stats.qStats[q.id])
    .map((q: any, i: number) => {
      const s = stats.qStats[q.id]
      return {
        name: `Q${i + 1}`,
        fullName: q.text,
        percent: s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0,
        correct: s.correct,
        total: s.total,
      }
    })

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-surface-raised border border-border-subtle rounded-2xl p-6">
          <h3 className="font-bold text-text-primary mb-6">Score Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={stats.scoreDist} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2E2E3A" vertical={false} />
              <XAxis
                dataKey="score"
                stroke="#8F8F9D"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#8F8F9D"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip
                cursor={{ fill: '#2E2E3A', opacity: 0.4 }}
                contentStyle={{
                  backgroundColor: '#13131F',
                  borderColor: '#2E2E3A',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="count" fill="#22C55E" radius={[4, 4, 0, 0]} name="Respondents" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-surface-raised border border-border-subtle rounded-2xl p-6">
          <h3 className="font-bold text-text-primary mb-6">Accuracy per Question</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart
              data={qAccuracyData}
              layout="vertical"
              margin={{ top: 0, right: 10, left: 10, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#2E2E3A" horizontal={false} />
              <XAxis
                type="number"
                domain={[0, 100]}
                stroke="#8F8F9D"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                dataKey="name"
                type="category"
                stroke="#8F8F9D"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                width={30}
              />
              <Tooltip
                cursor={{ fill: '#2E2E3A', opacity: 0.4 }}
                contentStyle={{
                  backgroundColor: '#13131F',
                  borderColor: '#2E2E3A',
                  borderRadius: '8px',
                }}
                formatter={(val) => `${val}%`}
              />
              <Bar dataKey="percent" fill="#3B82F6" radius={[0, 4, 4, 0]} name="Accuracy %" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-surface-raised border border-border-subtle rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-border-subtle bg-surface-elevated/50">
          <h3 className="font-bold text-text-primary">Question Breakdown</h3>
        </div>
        <div className="divide-y divide-border-subtle">
          {questions
            .filter((q: any) => stats.qStats[q.id])
            .map((q: any, i: number) => {
              const s = stats.qStats[q.id]
              let expected = ''
              try {
                const opts = JSON.parse(q.options || '{}')
                expected = opts.correctAnswer || q.correctAnswer || ''
              } catch {
                expected = q.correctAnswer || ''
              }

              const percent = s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0

              // Find most common wrong answer
              let commonWrong = '-'
              let maxCount = 0
              Object.entries(s.wrongAnswers).forEach(([ans, count]) => {
                if ((count as number) > maxCount) {
                  maxCount = count as number
                  commonWrong = ans
                }
              })

              return (
                <div
                  key={q.id}
                  className="p-5 flex flex-col md:flex-row gap-6 hover:bg-surface-elevated/30 transition"
                >
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-3">
                      <span className="shrink-0 w-6 h-6 rounded-md bg-surface-elevated border border-border-subtle grid place-items-center text-xs font-bold text-text-secondary">
                        {i + 1}
                      </span>
                      <h4 className="font-semibold text-text-primary">{q.text}</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-4 ml-9">
                      <div>
                        <div className="text-[10px] uppercase tracking-wider text-text-muted mb-1 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-brand" /> Correct Answer
                        </div>
                        <div className="text-sm text-text-primary font-medium">{expected}</div>
                      </div>
                      {maxCount > 0 && (
                        <div>
                          <div className="text-[10px] uppercase tracking-wider text-text-muted mb-1 flex items-center gap-1">
                            <XCircle className="w-3 h-3 text-danger" /> Most Common Wrong
                          </div>
                          <div className="text-sm text-text-secondary">
                            {commonWrong} ({maxCount} times)
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="shrink-0 flex items-center justify-center w-24">
                    <div className="text-center">
                      <div
                        className="text-2xl font-bold"
                        style={{
                          color: percent >= 80 ? '#22C55E' : percent >= 50 ? '#F59E0B' : '#EF4444',
                        }}
                      >
                        {percent}%
                      </div>
                      <div className="text-xs text-text-muted">Accuracy</div>
                    </div>
                  </div>
                </div>
              )
            })}
        </div>
      </div>
    </div>
  )
}
