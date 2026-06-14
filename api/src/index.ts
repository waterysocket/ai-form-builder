import { Hono } from 'hono'
import { type AuthVariables, authMiddleware } from './middleware/auth'
import { authRouterWithMe } from './routes/auth'

const app = new Hono<{ Bindings: Env; Variables: AuthVariables }>()

app.get('/api/health', (c) => c.json({ status: 'ok' }))

import { dashboardRouter } from './routes/dashboard'
import { publicRouter } from './routes/public'
import { surveysRouter } from './routes/surveys'

// Mount the authentication router
app.route('/api/auth', authRouterWithMe)

// Mount the surveys router
app.route('/api/surveys', surveysRouter)

import { responsesRouter } from './routes/responses'

// Mount the responses router
app.route('/api/responses', responsesRouter)

// Mount the dashboard router
app.route('/api/dashboard', dashboardRouter)

// Mount the public router (no auth required)
app.route('/api/public', publicRouter)

import { aiRouter } from './routes/ai'
import { assetsRouter, uploadRouter } from './routes/upload'

// Mount the AI router
app.route('/api/ai', aiRouter)

// Mount the Upload router (requires auth in a real app, maybe)
app.use('/api/upload/*', authMiddleware)
app.route('/api/upload', uploadRouter)

// Mount the Assets router to serve files
app.route('/api/assets', assetsRouter)

// Example protected route using authMiddleware
app.get('/api/protected', authMiddleware, (c) => {
  const user = c.get('user')
  return c.json({ message: 'You have accessed a protected route!', user })
})

export default app
