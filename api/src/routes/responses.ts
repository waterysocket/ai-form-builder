import { Hono } from 'hono'
import { type AuthVariables, authMiddleware } from '../middleware/auth'

export const responsesRouter = new Hono<{ Bindings: Env; Variables: AuthVariables }>()

responsesRouter.use('/*', authMiddleware)

responsesRouter.get('/:surveyId', async (c) => {
  const user = c.get('user')
  const surveyId = c.req.param('surveyId')

  const survey = await c.env.DB.prepare('SELECT * FROM surveys WHERE id = ? AND user_id = ?')
    .bind(surveyId, user.userId)
    .first()

  if (!survey) {
    return c.json({ error: 'Survey not found' }, 404)
  }

  const { results: questions } = await c.env.DB.prepare(
    'SELECT * FROM questions WHERE survey_id = ? ORDER BY order_index ASC',
  )
    .bind(surveyId)
    .all()

  const { results: responses } = await c.env.DB.prepare(
    'SELECT * FROM responses WHERE survey_id = ? ORDER BY created_at DESC',
  )
    .bind(surveyId)
    .all()

  const responseIds = responses.map((r) => r.id)

  let answers: any[] = []
  if (responseIds.length > 0) {
    const placeholders = responseIds.map(() => '?').join(', ')
    const { results } = await c.env.DB.prepare(
      `SELECT * FROM answers WHERE response_id IN (${placeholders})`,
    )
      .bind(...responseIds)
      .all()
    answers = results
  }

  const answersByResponseId = new Map<string, Record<string, string>>()
  for (const answer of answers) {
    const responseId = answer.response_id as string
    if (!answersByResponseId.has(responseId)) {
      answersByResponseId.set(responseId, {})
    }
    answersByResponseId.get(responseId)![answer.question_id as string] = answer.value as string
  }

  const enrichedResponses = responses.map((r) => ({
    ...r,
    answers: answersByResponseId.get(r.id as string) || {},
  }))

  return c.json({
    survey,
    questions,
    responses: enrichedResponses,
    totalResponses: responses.length,
  })
})
