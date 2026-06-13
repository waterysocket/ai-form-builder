import { Hono } from 'hono'
import { authRouter } from './routes/auth'
import { authMiddleware, type AuthVariables } from './middleware/auth'

const app = new Hono<{ Bindings: Env; Variables: AuthVariables }>()

app.get('/api/health', (c) => c.json({ status: 'ok' }))

import { surveysRouter } from './routes/surveys'

// Mount the authentication router
app.route('/api/auth', authRouter)

// Mount the surveys router
app.route('/api/surveys', surveysRouter)
// Example protected route using authMiddleware
app.get('/api/protected', authMiddleware, (c) => {
  const user = c.get('user')
  return c.json({ message: 'You have accessed a protected route!', user })
})

export default app
