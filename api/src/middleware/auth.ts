import { createMiddleware } from 'hono/factory'
import { getCookie } from 'hono/cookie'

export type AuthVariables = {
  user: {
    userId: string
    email: string
    createdAt: string
  }
}

export const authMiddleware = createMiddleware<{ Bindings: Env; Variables: AuthVariables }>(async (c, next) => {
  const sessionToken = getCookie(c, 'session')

  if (!sessionToken) {
    return c.json({ error: 'Unauthorized: No session token provided' }, 401)
  }

  // Look up the session in KV
  const sessionDataString = await c.env.AUTH_KV.get(`session:${sessionToken}`)

  if (!sessionDataString) {
    return c.json({ error: 'Unauthorized: Invalid or expired session' }, 401)
  }

  // Parse session data and attach it to the request context
  const sessionData = JSON.parse(sessionDataString)
  c.set('user', sessionData)

  await next()
})
