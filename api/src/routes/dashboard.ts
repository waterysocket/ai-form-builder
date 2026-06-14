import { Hono } from 'hono'
import { type AuthVariables, authMiddleware } from '../middleware/auth'

export const dashboardRouter = new Hono<{ Bindings: Env; Variables: AuthVariables }>()

dashboardRouter.use('/*', authMiddleware)

dashboardRouter.get('/', async (c) => {
  const user = c.get('user')

  const { results } = await c.env.DB.prepare(`
    SELECT 
      COUNT(id) as total_surveys,
      SUM(visits) as total_visits,
      SUM(responses_count) as total_responses
    FROM surveys
    WHERE user_id = ?
  `)
    .bind(user.userId)
    .all()

  const metrics = results[0] || { total_surveys: 0, total_visits: 0, total_responses: 0 }

  return c.json({
    metrics: {
      surveys: metrics.total_surveys || 0,
      visits: metrics.total_visits || 0,
      responses: metrics.total_responses || 0,
    }
  })
})
