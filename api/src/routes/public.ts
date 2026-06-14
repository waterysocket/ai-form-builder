import { Hono } from 'hono'

export const publicRouter = new Hono<{ Bindings: Env }>()

// Get a public survey by ID (and increment visits)
publicRouter.get('/surveys/:id', async (c) => {
  const surveyId = c.req.param('id')

  const preview = c.req.query('preview') === 'true'

  // If preview=true, we don't require the survey to be published.
  const query = preview 
    ? 'SELECT * FROM surveys WHERE id = ?' 
    : 'SELECT * FROM surveys WHERE id = ? AND is_published = 1'

  const survey = await c.env.DB.prepare(query)
    .bind(surveyId)
    .first()

  if (!survey) {
    return c.json({ error: preview ? 'Survey not found' : 'Survey not found or not published' }, 404)
  }

  // Increment visits asynchronously
  c.executionCtx.waitUntil(
    c.env.DB.prepare('UPDATE surveys SET visits = visits + 1 WHERE id = ?')
      .bind(surveyId)
      .run()
  )

  const { results: questions } = await c.env.DB.prepare(
    'SELECT * FROM questions WHERE survey_id = ? ORDER BY order_index ASC',
  )
    .bind(surveyId)
    .all()

  return c.json({ survey, questions })
})

// Submit a response for a survey
publicRouter.post('/responses/:surveyId', async (c) => {
  const surveyId = c.req.param('surveyId')
  const { answers } = await c.req.json() // answers format: { questionId: value }

  // Check if survey exists and is published
  const survey = await c.env.DB.prepare('SELECT id FROM surveys WHERE id = ? AND is_published = 1')
    .bind(surveyId)
    .first()

  if (!survey) {
    return c.json({ error: 'Survey not found or not published' }, 404)
  }

  const responseId = crypto.randomUUID()
  const statements = [
    c.env.DB.prepare('INSERT INTO responses (id, survey_id) VALUES (?, ?)').bind(responseId, surveyId)
  ]

  // Insert all answers
  if (answers && typeof answers === 'object') {
    for (const [questionId, value] of Object.entries(answers)) {
      statements.push(
        c.env.DB.prepare(
          'INSERT INTO answers (id, response_id, question_id, value) VALUES (?, ?, ?, ?)'
        ).bind(crypto.randomUUID(), responseId, questionId, String(value))
      )
    }
  }

  // Update response count
  statements.push(
    c.env.DB.prepare('UPDATE surveys SET responses_count = responses_count + 1 WHERE id = ?').bind(surveyId)
  )

  try {
    await c.env.DB.batch(statements)
    return c.json({ message: 'Response submitted successfully' }, 201)
  } catch (e) {
    console.error('Failed to submit response', e)
    return c.json({ error: 'Failed to submit response' }, 500)
  }
})
