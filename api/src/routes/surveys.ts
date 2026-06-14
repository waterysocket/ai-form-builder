import { Hono } from 'hono'
import { type AuthVariables, authMiddleware } from '../middleware/auth'

export const surveysRouter = new Hono<{ Bindings: Env; Variables: AuthVariables }>()

// Apply auth middleware to all survey routes
surveysRouter.use('/*', authMiddleware)

// Get all surveys for the authenticated user
surveysRouter.get('/', async (c) => {
  const user = c.get('user')

  const { results } = await c.env.DB.prepare(
    'SELECT * FROM surveys WHERE user_id = ? ORDER BY created_at DESC',
  )
    .bind(user.userId)
    .all()

  return c.json({ surveys: results })
})

// Get a specific survey
surveysRouter.get('/:id', async (c) => {
  const user = c.get('user')
  const surveyId = c.req.param('id')

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

  return c.json({ survey, questions })
})

// Create a new survey
surveysRouter.post('/', async (c) => {
  const user = c.get('user')
  const { title, description, questions } = await c.req.json()

  if (!title) {
    return c.json({ error: 'Title is required' }, 400)
  }

  const surveyId = crypto.randomUUID()

  // Use a batch to insert survey and questions
  const statements = [
    c.env.DB.prepare(
      'INSERT INTO surveys (id, user_id, title, description) VALUES (?, ?, ?, ?)',
    ).bind(surveyId, user.userId, title, description || null),
  ]

  if (Array.isArray(questions) && questions.length > 0) {
    questions.forEach((q: any, index: number) => {
      statements.push(
        c.env.DB.prepare(
          'INSERT INTO questions (id, survey_id, type, text, options, order_index) VALUES (?, ?, ?, ?, ?, ?)',
        ).bind(
          crypto.randomUUID(),
          surveyId,
          q.type,
          q.text,
          q.options ? JSON.stringify(q.options) : null,
          index,
        ),
      )
    })
  }

  await c.env.DB.batch(statements)

  return c.json({ message: 'Survey created', id: surveyId }, 201)
})

// Update a survey (title, description, and questions)
surveysRouter.put('/:id', async (c) => {
  const user = c.get('user')
  const surveyId = c.req.param('id')
  const { title, description, questions } = await c.req.json()

  if (!title) {
    return c.json({ error: 'Title is required' }, 400)
  }

  // Check if the survey already exists for this user
  const existing = await c.env.DB.prepare(
    'SELECT id FROM surveys WHERE id = ? AND user_id = ?'
  )
    .bind(surveyId, user.userId)
    .first()

  if (existing) {
    await c.env.DB.prepare(
      'UPDATE surveys SET title = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?'
    )
      .bind(title, description || null, surveyId, user.userId)
      .run()
  } else {
    await c.env.DB.prepare(
      'INSERT INTO surveys (id, user_id, title, description) VALUES (?, ?, ?, ?)'
    )
      .bind(surveyId, user.userId, title, description || null)
      .run()
  }

  // Replace all questions
  const statements = [
    c.env.DB.prepare('DELETE FROM questions WHERE survey_id = ?').bind(surveyId)
  ]

  if (Array.isArray(questions) && questions.length > 0) {
    questions.forEach((q: any, index: number) => {
      statements.push(
        c.env.DB.prepare(
          'INSERT INTO questions (id, survey_id, type, text, options, order_index) VALUES (?, ?, ?, ?, ?, ?)',
        ).bind(
          q.id || crypto.randomUUID(),
          surveyId,
          q.type,
          q.text,
          q.options ? JSON.stringify(q.options) : null,
          index,
        ),
      )
    })
  }

  await c.env.DB.batch(statements)

  return c.json({ message: 'Survey updated' })
})

// Delete a survey
surveysRouter.delete('/:id', async (c) => {
  const user = c.get('user')
  const surveyId = c.req.param('id')

  const { success } = await c.env.DB.prepare('DELETE FROM surveys WHERE id = ? AND user_id = ?')
    .bind(surveyId, user.userId)
    .run()

  if (!success) {
    return c.json({ error: 'Survey not found or could not be deleted' }, 404)
  }

  return c.json({ message: 'Survey deleted' })
})

// Publish a survey
surveysRouter.put('/:id/publish', async (c) => {
  const user = c.get('user')
  const surveyId = c.req.param('id')

  const { success } = await c.env.DB.prepare(
    'UPDATE surveys SET is_published = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?'
  )
    .bind(surveyId, user.userId)
    .run()

  if (!success) {
    return c.json({ error: 'Survey not found or could not be published' }, 404)
  }

  return c.json({ message: 'Survey published' })
})

// Unpublish a survey
surveysRouter.put('/:id/unpublish', async (c) => {
  const user = c.get('user')
  const surveyId = c.req.param('id')

  const { success } = await c.env.DB.prepare(
    'UPDATE surveys SET is_published = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?'
  )
    .bind(surveyId, user.userId)
    .run()

  if (!success) {
    return c.json({ error: 'Survey not found or could not be unpublished' }, 404)
  }

  return c.json({ message: 'Survey unpublished' })
})
