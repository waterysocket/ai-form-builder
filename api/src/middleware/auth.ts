import { getCookie } from 'hono/cookie'
import { createMiddleware } from 'hono/factory'

export type AuthVariables = {
  user: {
    userId: string
    email: string
    createdAt: string
  }
}

export const authMiddleware = createMiddleware<{ Bindings: Env; Variables: AuthVariables }>(
  async (c, next) => {
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

    // Ensure the user exists in the SQLite users table in D1 (e.g., if DB was reset)
    try {
      const dbUser = await c.env.DB.prepare('SELECT id FROM users WHERE id = ?')
        .bind(sessionData.userId)
        .first()
      if (!dbUser) {
        await c.env.DB.prepare('INSERT INTO users (id, email) VALUES (?, ?)')
          .bind(sessionData.userId, sessionData.email)
          .run()
      }
    } catch (err) {
      console.error('Failed to sync user session to D1 users table:', err)
    }

    await next()
  },
)
